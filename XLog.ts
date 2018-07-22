/**
 * Copyright 2017-2020 Rex Lee
 *
 * THIS FILE IS PART OF  PROJECT
 * ALL COPYRIGHT RESERVED
 *
 * Created by duguying on 2018/7/21.
 */

declare class Lexer {
    addRule(RegExp, any)
}

class XLog {
    private lexer = null;
    private xLogElement: HTMLElement = null;
    private dark: boolean = true;
    private lines = [];
    private item = {"text": "", "color": "", "bg_color": "", "bold": false};
    private line = [];
    private color = {
        // color
        "30": "black",
        "31": "red",
        "32": "green",
        "33": "yellow",
        "34": "blue",
        "35": "purple",
        "36": "cyan",
        "37": "white",

        // bg color
        "40": "black",
        "41": "red",
        "42": "green",
        "43": "yellow",
        "44": "blue",
        "45": "purple",
        "46": "cyan",
        "47": "white"
    }

    private newline(dark) {
        if (this.line.length > 0) {
            this.lines.push(this.line)
            this.writeLine(this.line, dark)
            this.line = []
        }
    }

    private pushItemToLine() {
        if (this.item["text"] !== "") {
            this.line.push(this.item)
            this.item = {"text": "", "color": "", "bg_color": "", "bold": false}
        }
    }

    private eraseLine(pItem) {
        const SPLIT = "\r"
        let segs = pItem["text"].split(SPLIT)
        if (segs.length > 1) {
            segs.pop()
            segs.pop()
        }
        pItem["text"] = segs.join(SPLIT)
    }

    private writeLine(line, dark) {
        let element = document.createElement("div")
        element.className = "line"

        for (let i = 0; i < line.length; i++) {
            let span = document.createElement("span")
            let item = line[i];
            if (item["bold"]) {
                span.classList.add("bolder")
                // span.style.fontWeight = "bolder"
            }
            if (item["color"] !== "") {
                span.classList.add("fg-"+item["color"])
                // span.style.color = item["color"]
            }
            if (item["bg_color"] !== "") {
                span.classList.add("bg-"+item["bg_color"])
                // span.style.backgroundColor = item["bg_color"]
            }
            // if (span.style.color === "black" && dark && span.style.backgroundColor === "") {
            //     span.classList.add("fg-white")
                // span.style.color = "#f1f1f1" // white
            // }

            // if (span.style.backgroundColor === "black" && dark && span.style.color === "black") {
            //     span.classList.add("bg-white")
                // span.style.backgroundColor = "white"
            // }
            span.innerHTML = item["text"]

            element.appendChild(span)
        }

        this.xLogElement.appendChild(element)
    }

    private createLexer() {
        let lexer = new Lexer()
        let _this = this
        lexer.addRule(/\033\[([\d]+)m/, function (e, f) {
            _this.pushItemToLine()

            if (f >= "30" && f <= "37") {
                _this.item["color"] = _this.color[f]
            } else if (f >= "40" && f <= "47") {
                _this.item["bg_color"] = _this.color[f]
            } else if (f === "1") {
                _this.item["bold"] = true
            }


        }).addRule(/\033\[(\d+);(\d+)m/, function (e, f, g) {
            _this.pushItemToLine()

            if (f >= "30" && f <= "37") {
                _this.item["color"] = _this.color[f]
            } else if (f >= "40" && f <= "47") {
                _this.item["bg_color"] = _this.color[f]
            } else if (f === "1") {
                _this.item["bold"] = true
            }

            if (g >= "30" && g <= "37") {
                _this.item["color"] = _this.color[g]
            } else if (g >= "40" && g <= "47") {
                _this.item["bg_color"] = _this.color[g]
            } else if (g === "1") {
                _this.item["bold"] = true
            }

        }).addRule(/\033\[0K/, function (e) {
        }).addRule(/\033\[K/, function (e) {
        }).addRule(/[\r]?\n/, function (e) {
            _this.item["text"] += e
            _this.pushItemToLine()
            _this.newline(_this.dark)
        }).addRule(/\r/, function (e) {
            _this.item["text"] += e
            _this.eraseLine(_this.item)
        }).addRule(/./, function (e) {
            _this.item["text"] += e
        });

        this.lexer = lexer
    }

    public constructor(xlog: HTMLElement) {
        // get attributes
        this.xLogElement = xlog
        this.dark = false
        let xLogClassList = this.xLogElement.classList
        for (let i = 0; i < xLogClassList.length; i++) {
            let clz = xLogClassList[i];
            if (clz === "dark") {
                this.dark = true
            }
        }

        // generate lexer
        this.createLexer()
    }

    public write(input: string) {
        this.lexer.setInput(input).lex()
    }
}