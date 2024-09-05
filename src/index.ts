import { parseCSSTime, parseCSSTimingFunction } from "@aritz-cracker/browser-utils";

const hoverClasses = new Set(["follow-cursor-vars"]);

let curTime = 0;
let mouseX = 0;
let mouseY = 0;
type HoverData = {
	fadeStartTime: number,
	fadeTime: number,
	timingFunction: (t: number) => number
	fadingOut: boolean
};

const hoverDataMap: Map<HTMLElement | SVGElement, HoverData> = new Map();
const listenedElements: Set<HTMLElement | SVGElement> = new Set();

function startListeningToElement(elem: HTMLElement | SVGElement) {
	elem.addEventListener("mouseenter", mouseEnterCallback, {passive: true});
	elem.addEventListener("mouseleave", mouseLeaveCallback, {passive: true});
	listenedElements.add(elem);
	if (elem == document.documentElement) {
		elem.style.setProperty("--cursor-window-pos-fade-fraction", "0");
		elem.style.setProperty("--cursor-window-pos-fade-percentage", "0%");
	} else {
		elem.style.setProperty("--cursor-pos-fade-fraction", "0");
		elem.style.setProperty("--cursor-pos-fade-percentage", "0%");
	}
	upateMousePosVars(elem)
	if (elem.matches(":hover")) {
		startFadeIn(elem);
	}
}
function stopListeningToElement(elem: HTMLElement | SVGElement) {
	elem.removeEventListener("mouseenter", mouseEnterCallback);
	elem.removeEventListener("mouseleave", mouseLeaveCallback);
	if (elem.matches(":hover")) {
		startFadeOut(elem);
	}
	listenedElements.delete(elem);
}
function startFadeIn(elem: HTMLElement | SVGElement) {
	const elemStyle = getComputedStyle(elem);
	let fadeInTime = parseCSSTime(elemStyle.getPropertyValue("--cursor-fade-in-time"));
	if (isNaN(fadeInTime) || fadeInTime < 0) {
		fadeInTime = 0;
	}
	const hoverData = hoverDataMap.get(elem);
	if (hoverData) {
		let timeCompleted = (curTime - hoverData.fadeStartTime) / hoverData.fadeTime;
		if (timeCompleted > 1) {
			timeCompleted = 1;
		}
		hoverData.fadeStartTime = curTime - fadeInTime * (1 - timeCompleted);
		hoverData.fadeTime = fadeInTime;
		hoverData.fadingOut = false;
	} else {
		hoverDataMap.set(elem, {
			fadeStartTime: curTime,
			fadeTime: fadeInTime,
			timingFunction: parseCSSTimingFunction(
				elemStyle.getPropertyValue("--cursor-fade-function")
			) ?? parseCSSTimingFunction("linear")!,
			fadingOut: false
		});
	}
}
function startFadeOut(elem: HTMLElement | SVGElement) {
	const elemStyle = getComputedStyle(elem);
	let fadeOutTime = parseCSSTime(elemStyle.getPropertyValue("--cursor-fade-out-time"));
	if (isNaN(fadeOutTime) || fadeOutTime < 0) {
		fadeOutTime = 0;
	}
	const hoverData = hoverDataMap.get(elem);
	if (hoverData) {
		let timeCompleted = (curTime - hoverData.fadeStartTime) / hoverData.fadeTime;
		if (timeCompleted > 1) {
			timeCompleted = 1;
		}
		hoverData.fadeStartTime = curTime - fadeOutTime * (1 - timeCompleted);
		hoverData.fadeTime = fadeOutTime;
		hoverData.fadingOut = true;
	} else {
		hoverDataMap.set(elem, {
			fadeStartTime: curTime,
			fadeTime: fadeOutTime,
			timingFunction: parseCSSTimingFunction(
				elemStyle.getPropertyValue("--cursor-fade-function")
			) ?? parseCSSTimingFunction("linear")!,
			fadingOut: true
		});
	}
}

function mouseEnterCallback(ev: Event) {
	startFadeIn(ev.target as HTMLElement | SVGElement);
}
function mouseLeaveCallback(ev: Event) {
	startFadeOut(ev.target as HTMLElement | SVGElement);
}

function fadeFrame(newTime: number) {
	curTime = newTime;
	requestAnimationFrame(fadeFrame);
	hoverDataMap.forEach((hoverData, elem) => {
		const timeFraction = (
			curTime - hoverData.fadeStartTime
		) / (
			hoverData.fadeTime
		);
		if (timeFraction >= 1) {
			hoverDataMap.delete(elem);
		}
		const fadeFraction = hoverData.timingFunction(
			hoverData.fadingOut ? (1 - timeFraction) : timeFraction
		);
		if (elem == document.documentElement) {
			document.documentElement.style.setProperty(
				"--cursor-window-pos-fade-fraction",
				fadeFraction + ""
			);
			document.documentElement.style.setProperty(
				"--cursor-window-pos-fade-percentage",
				(fadeFraction * 100) + "%"
			);
		} else {
			elem.style.setProperty("--cursor-pos-fade-fraction", fadeFraction + "");
			elem.style.setProperty("--cursor-pos-fade-percentage", (fadeFraction * 100) + "%");
		}

	});
}
requestAnimationFrame(fadeFrame);

function listenToAllElements() {
	hoverClasses.forEach(className => {
		for (const elem of document.getElementsByClassName(className)) {
			if (!listenedElements.has(elem as HTMLElement | SVGElement)) {
				startListeningToElement(elem as HTMLElement | SVGElement);
			}
		}
	});
}
/**
 * Adds one or more element classes to update the `--cursor-pos-*` CSS variables on
 * 
 * @param classes 
 */
export function addFollowCursorClass(...classes: string[]) {
	classes.forEach(className => hoverClasses.add(className));
	listenToAllElements();
}

/**
 * Removes one or more element classes to update the `--cursor-pos-*` CSS variables on
 * 
 * @param classes 
 */
export function removeFollowCursorClass(...classes: string[]) {
	const elemsToCheck: Set<HTMLElement | SVGElement> = new Set();
	for (const className of classes) {
		hoverClasses.delete(className);
		for (const elem of document.getElementsByClassName(className)) {
			elemsToCheck.add(elem as HTMLElement | SVGElement);
		}
	}
	for (const elem of elemsToCheck) {
		if (
			listenedElements.has(elem) &&
			[...hoverClasses].every(className => !elem.classList.contains(className))
		) {
			stopListeningToElement(elem);
		}
	}
}

function upateMousePosVars(elem: HTMLElement | SVGElement) {
	if (elem == document.documentElement) {
		const fractionX = mouseX / window.innerWidth;
		const fractionY = mouseY / window.innerHeight;
		elem.style.setProperty("--cursor-window-pos-x-px", mouseX + "px");
		elem.style.setProperty("--cursor-window-pos-y-px", mouseY + "px");
		elem.style.setProperty("--cursor-window-pos-x-fraction", fractionX + "");
		elem.style.setProperty("--cursor-window-pos-y-fraction", fractionY + "");
		elem.style.setProperty("--cursor-window-pos-x-percentage", (fractionX * 100) + "%");
		elem.style.setProperty("--cursor-window-pos-y-percentage", (fractionY * 100) + "%");
	} else {
		const elemRect = elem.getBoundingClientRect();
		const elemMouseX = (mouseX - elemRect.left);
		const elemMouseY = (mouseY - elemRect.top);
		const fractionX = elemMouseX / elemRect.width;
		const fractionY = elemMouseY / elemRect.height;
		elem.style.setProperty("--cursor-pos-x-px", elemMouseX + "px");
		elem.style.setProperty("--cursor-pos-y-px", elemMouseY + "px");
		elem.style.setProperty("--cursor-pos-x-fraction", fractionX + "");
		elem.style.setProperty("--cursor-pos-y-fraction", fractionY + "");
		elem.style.setProperty("--cursor-pos-x-percentage", (fractionX * 100) + "%");
		elem.style.setProperty("--cursor-pos-y-percentage", (fractionY * 100) + "%");
	}
}

function listenToDOMChanges() {
	document.documentElement.addEventListener("mousemove", ev => {
		mouseX = ev.clientX;
		mouseY = ev.clientY;
		listenedElements.forEach(elem => {
			if (
				(!hoverDataMap.has(elem) && !elem.matches(":hover"))
			) {
				return;
			}
			upateMousePosVars(elem);
		});
	}, {passive: true});
	const observer = new MutationObserver((mutations) => {
		for (let i = 0; i < mutations.length; i += 1) {
			const mutation = mutations[i]
			if (!(mutation.target instanceof HTMLElement) && !(mutation.target instanceof SVGElement)) {
				continue;
			}
			switch (mutation.type) {
				case "attributes": {
					const mutationTarget = mutation.target;
					const hasClass = ![...hoverClasses].every(className => !mutationTarget.classList.contains(className));
					if (listenedElements.has(mutationTarget)) {
						if (!hasClass) {
							stopListeningToElement(mutationTarget);
						}
					} else {
						if (hasClass) {
							startListeningToElement(mutationTarget);
						}
					}
					break;
				}
				case "childList": {
					mutation.addedNodes.forEach(elem => {
						if (!(elem instanceof HTMLElement) && !(elem instanceof SVGElement)) {
							return;
						}
						if ([...hoverClasses].every(className => !elem.classList.contains(className))) {
							return;
						}
						startListeningToElement(elem);
					});
					mutation.removedNodes.forEach(elem => {
						if (!(elem instanceof HTMLElement) && !(elem instanceof SVGElement)) {
							return;
						}
						if (!listenedElements.has(elem)) {
							return;
						}
						stopListeningToElement(elem);
					});
					break;
				}
				default:
			}
		}
	});
	// Doing this in 2 steps because we don't care about changes to the <head>
	observer.observe(document.body, {subtree: true, childList: true, attributeFilter: ["class"]});
	observer.observe(document.documentElement, {attributeFilter: ["class"]});

	listenToAllElements();
}
if (document.readyState == "loading") {
	document.addEventListener("DOMContentLoaded", listenToDOMChanges);
} else {
	listenToDOMChanges();
}
