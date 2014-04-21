// Type definitions for through
// Project: https://github.com/dominictarr/through
// Definitions by: Andrew Gaspar <https://github.com/AndrewGaspar/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// <reference path="../node/node.d.ts" />

declare module "through" {
	import Stream = require("stream");

	function through(write?: (data: string) => void,
		end?: () => void,
		opts?: {
			autoDestroy: boolean;
		}): through.ThroughStream;

	function through(write?: (data: NodeBuffer) => void,
		end?: () => void,
		opts?: {
			autoDestroy: boolean;
		}): through.ThroughStream;

	module through {
		export interface ThroughStream extends ReadWriteStream {
			autoDestroy: boolean;
		}
	}

	export = through;
}
