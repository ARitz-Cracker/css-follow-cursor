# css-follow-cursor

_Because interactive eye-candy is amazing_

Ever wanted to create various effects in CSS which which react to mouse movement? Well, with the power of this small library and dynamic CSS variables, you can!

## Usage

See the elements with the `test-area` class in `tests/test.html` file for a simple example.

All you have to do is add the `follow-cursor-vars` class to any element you wish. The element will then have the
following CSS variables:
* `--cursor-pos-x-px`: The cursor position on the X axis, where `0px` is on the left side of the element +
  padding + border.
* `--cursor-pos-y-px`: The cursor position on the Y axis, where `0px` is on the top side of the element +
  padding + border.
* `--cursor-pos-x-percentage`: The cursor position on the X axis, where `0%` is on the left side of the element +
  padding + border, and `100%` is on the right side of the element + padding + border. 
* `--cursor-pos-y-percentage`: The cursor position on the Y axis, where `0%` is on the top side of the element +
  padding + border, and `100%` is on the bottom side of the element + padding + border.
* `--cursor-pos-x-fraction`: Same as `--cursor-pos-x-percentage`, except `0` to `1` instead of `0%` to `100%`
  respectively. Useful with CSS's `calc()`.
* `--cursor-pos-y-fraction`: Same as `--cursor-pos-y-percentage`, except `0` to `1` instead of `0%` to `100%`
  respectively. Useful with CSS's `calc()`.
* `--cursor-pos-fade-percentage`: A value between `0%` and `100%`, with the value approaching `100%` while the cursor
  hovers over the element, and `0%` while the cursor is not hovering over the element.
* `--cursor-pos-fade-fraction`: A value between `0` and `1`, with the value approaching `1` while the cursor hovers
  over the element, and `0` while the cursor is not hovering over the element. Useful with CSS's `calc()`.

This library also exports the following functions:
* `addFollowCursorClass(...classes: string[])`: Allows you to add your own class so you're not forced to use
  `follow-cursor-vars`.
* `removeFollowCursorClass(...classes: string[])`: Does what it sounds like. Use with care!

The values of the `--cursor-pos-fade-percentage` and `--cursor-pos-fade-fraction` variables can be influenced using the
variables listed below:
* `--cursor-fade-in-time`: A value in either seconds (`s`) or milliseconds (`ms`) specifying how long it will take the
  the `--cursor-pos-fade-*` variables to go from their minimum value (`0%` or `0`) to their maximum value (`100%` or
  `1`) after the cursor enters the element. Defaults to `0s`.
* `--cursor-fade-out-time`: A value in either seconds (`s`) or milliseconds (`ms`) specifying how long it will take the
  the `--cursor-pos-fade-*` variables to go from their maximum value (`100%` or `1`) to their minimum value (`0%` or
  `0`) after the cursor leaves the element. Defaults to `0s`.
* `--cursor-fade-function`: This can be set to a
  [CSS easing function](https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function). This function will be used
  for the "fade in" timing function. The "fade out" timing function will be the reverse of the "fade in". For example,
  `ease-in` will effectivly become `ease-out`. This design choice was made in order to make partial fade ins/outs consistent with full fade ins/outs.

If the `follow-cursor-vars` class (or the class you specified when using the `addFollowCursorClass` function) exists
on the root `<html>` element, (or the root `<svg>` element) then these CSS variables will also be available.

* `--cursor-window-pos-x-px`: The cursor position on the X axis, where `0px` is the left side of the viewport, and
  increases rightwards.
* `--cursor-window-pos-y-px`: The cursor position on the Y axis, where `0px` is the top of the viewport and increases
  downwards.
* `--cursor-window-pos-x-percentage`: The cursor position on the X axis, where `0%` is on the left side of the viewport
  and `100%` is on the right side of the viewport. 
* `--cursor-window-pos-y-percentage`: The cursor position on the Y axis, where `0%` is on the top side of the viewport
  and `100%` is on the bottom side of the viewport.
* `--cursor-window-pos-x-fraction`: Same as `--cursor-window-pos-x-percentage`, except `0` to `1` instead of `0%` to
  `100%` respectively. Useful with CSS's `calc()`.
* `--cursor-window-pos-y-fraction`: Same as `--cursor-window-pos-y-percentage`, except `0` to `1` instead of `0%` to `100%`
  respectively. Useful with CSS's `calc()`.
* `--cursor-window-pos-fade-percentage`: A value between `0%` and `100%`, with the value approaching `100%` while the cursor
  is in the viewport, and `0%` while the cursor is not in the viewport.
* `--cursor-window-pos-fade-fraction`: A value between `0` and `1`, with the value approaching `1` while the cursor is
  in the viewport, and `0` while the cursor is not in the viewport.

## Installation

You can add the `css-follow-cursor` package as a dependency of your npm project and simply:
```js
import "css-follow-cursor"; // Automatically sets all the needed event handlers
```

If you run `npm install && npm run build-standalone` after cloning this repository, you will have a self-contained
version of this library bundled with the external dependencies which you can use in a normal `<script>` tag.
(Woah, old school!)
