import stream = require("stream");

class StringReader extends stream.Readable {
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

export = StringReader;
