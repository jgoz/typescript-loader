import stream = require("stream");

export class StringReader extends stream.Readable {
    private pos: number;

    constructor(public data: string) {
        super();
        this.pos = 0;
        this.pause();
    }

    _read(size: number) {
        var canPush = true;

        while (canPush && this.pos < this.data.length) {
            var chunk: string = this.data.slice(this.pos, size);
            canPush = this.push(chunk);

            this.pos += size;
        }

        if (this.pos >= this.data.length) {
            this.push(null);
        }
    }

    destroy() {
        this.pos = 0;
        delete this.data;
    }
}

export function find<T>(array: T[], predicate: (value:T) => boolean, thisArg?: any): T {
    if (array == null) {
        throw new TypeError('find called on null or undefined');
    }
    var list = Object(array);
    var length = list.length >>> 0;
    var value: T;

    for (var i = 0; i < length; i++) {
        if (i in list) {
            value = list[i];
            if (predicate.call(thisArg, value)) {
                return value;
            }
        }
    }
    return undefined;
}

export interface Dictionary<T> {
    [index: string]: T;
}

export function groupBy<T>(array: T[], callback: (value:T) => string, thisArg?: any): Dictionary<T[]> {
    if (array == null) {
        throw new TypeError('groupBy called on null or undefined');
    }

    var result: Dictionary<T[]> = {};

    array.forEach(value => {
        var key = callback.call(thisArg, value);
        if (!result[key]) {
            result[key] = [];
        }
        result[key].push(value);
    });

    return result;
}
