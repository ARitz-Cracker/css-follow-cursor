import { resolve as pathResolve } from "path";
const __dirname = import.meta.dirname;

export default (env, argv) => {
	const config = {
		entry: argv.mode == "production" ? {
			"css-follow-cursor.dist.min": ["./src/index.ts"]
		} : {
			"css-follow-cursor.dist": ["./src/index.ts"]
		},
		devtool: argv.mode == "production" ? undefined : false,
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					use: "ts-loader",
					exclude: /node_modules/,
				}
			],
		},
		output: {
			filename: "[name].js",
			path: pathResolve(__dirname, "dist"),
		},
		resolve: {
			extensions: [".tsx", ".ts", ".js"],
			// I hate that TSC's decision to not support module import rewriting has knockoff effects like this
			extensionAlias: {
				'.js': ['.js', '.ts'],
			}
		},
		plugins: [],
		optimization: argv.mode == "production" ? undefined : {
			providedExports: true,
			usedExports: true,
			concatenateModules: true,
			flagIncludedChunks: true,
			removeAvailableModules: true,
			sideEffects: true
		},
		mode: argv.mode
	};
	console.log("config.mode:", config.mode);
	return config;
};
