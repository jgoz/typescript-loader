/// <reference path="./node/node.d.ts" />

declare module "through2" {
	import Stream = require("stream");

	function through2(
		options?: Stream.TransformOptions,
		transform?: (chunk: NodeBuffer, encoding: string, callback: Function) => void,
		flush?: (callback: Function) => void): ReadWriteStream;

	module through2 {
		export function obj(
			options?: Stream.TransformOptions,
			transform?: (chunk: NodeBuffer, encoding: string, callback: Function) => void,
			flush?: (callback: Function) => void): ReadWriteStream;
	}

	export = through2;
}
