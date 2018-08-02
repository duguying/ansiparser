/**
 * Copyright 2017-2020 Rex Lee
 *
 * THIS FILE IS PART OF  PROJECT
 * ALL COPYRIGHT RESERVED
 *
 * Created by duguying on 2018/7/21.
 */

import Lexer from "./Lexer"

export default class XLog {
    private enableLineNumber = true;
    private lineNumber = 1;
    private lexer = null;
    private xLogElement: HTMLElement = null;
    private lines = [];
    private item = {"text": "", "color": "", "bg_color": "", "bold": false, "is_line_number": false};
    private line = [];
    private color = {
        // color
        30: "black",
        31: "red",
        32: "green",
        33: "yellow",
        34: "blue",
        35: "purple",
        36: "cyan",
        37: "white",

        // bg color
        40: "black",
        41: "red",
        42: "green",
        43: "yellow",
        44: "blue",
        45: "purple",
        46: "cyan",
        47: "white",

        // bright color
        90: "bright-black",
        91: "bright-red",
        92: "bright-green",
        93: "bright-yellow",
        94: "bright-blue",
        95: "bright-purple",
        96: "bright-cyan",
        97: "bright-white",

        // bright bg color
        100: "bright-black",
        101: "bright-red",
        102: "bright-green",
        103: "bright-yellow",
        104: "bright-blue",
        105: "bright-purple",
        106: "bright-cyan",
        107: "bright-white",
    }

    private newline() {
        if (this.line.length > 0) {
            if (this.enableLineNumber) {
                this.line = [{"text": this.lineNumber, "color": "", "bg_color": "", "bold": false, "is_line_number": true}].concat(this.line)
            }
            this.lines.push(this.line)
            this.writeLine(this.line)
            this.line = []
            this.lineNumber++
        }
    }

    private pushItemToLine() {
        if (this.item["text"] !== "") {
            this.line.push(this.item)
            this.item = {"text": "", "color": "", "bg_color": "", "bold": false, "is_line_number": false}
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

    private writeLine(line) {
        let element = document.createElement("div")
        element.className = "line"

        for (let i = 0; i < line.length; i++) {
            let item = line[i];
            if (!item["is_line_number"]) {
                let span = document.createElement("span")
                if (item["bold"]) {
                    span.classList.add("bolder")
                }
                if (item["color"] !== "") {
                    span.classList.add("fg-" + item["color"])
                }
                if (item["bg_color"] !== "") {
                    span.classList.add("bg-" + item["bg_color"])
                }
                if (item["is_line_number"]) {
                    span.classList.add("line-number")
                }
                span.innerHTML = item["text"]
                element.appendChild(span)
            }else if (this.enableLineNumber) {
                let a = document.createElement("a")
                element.appendChild(a)
            }
        }

        this.xLogElement.appendChild(element)
    }

    private createLexer() {
        let lexer = new Lexer(null);
        let _this = this
        lexer.addRule(/\033\[([\d]+)m/, function (e, sf) {
            let df = Number.parseInt(sf)

            _this.pushItemToLine()

            if ((df >= 30 && df <= 37)||df >= 90 && df <= 97) {
                _this.item["color"] = _this.color[df]
            } else if ((df >= 40 && df <= 47)||df >= 100 && df <= 107) {
                _this.item["bg_color"] = _this.color[df]
            } else if (df === 1) {
                _this.item["bold"] = true
            }

        }, null).addRule(/\033\[(\d+);(\d+)m/, function (e, sf, sg) {
            let df = Number.parseInt(sf)
            let dg = Number.parseInt(sg)
            _this.pushItemToLine()

            if ((df >= 30 && df <= 37)||df >= 90 && df <= 97) {
                _this.item["color"] = _this.color[df]
            } else if ((df >= 40 && df <= 47)||df >= 100 && df <= 107) {
                _this.item["bg_color"] = _this.color[df]
            } else if (df === 1) {
                _this.item["bold"] = true
            }

            if ((dg >= 30 && dg <= 37)||dg >= 90 && dg <= 97) {
                _this.item["color"] = _this.color[dg]
            } else if ((dg >= 40 && dg <= 47)||dg >= 100 && dg <= 107) {
                _this.item["bg_color"] = _this.color[dg]
            } else if (dg === 1) {
                _this.item["bold"] = true
            }

        }, null).addRule(/\033\[(\d+);(\d+);(\d+)m/, function (e, sf, sg, sh) {
            let df = Number.parseInt(sf)
            let dg = Number.parseInt(sg)
            let dh = Number.parseInt(sh)
            _this.pushItemToLine()

            // 256 color fg
            if (df == 38 && dg == 5) {
                _this.item["color"] = "c265-"+dh
            }else

            // 256 color bg
            if (df == 48 && dg == 5) {
                _this.item["bg_color"] = "c265-"+dh
            }else {

                // base color mode
                if ((df >= 30 && df <= 37) || df >= 90 && df <= 97) {
                    _this.item["color"] = _this.color[df]
                } else if ((df >= 40 && df <= 47) || df >= 100 && df <= 107) {
                    _this.item["bg_color"] = _this.color[df]
                } else if (df === 1) {
                    _this.item["bold"] = true
                }

                if ((dg >= 30 && df <= 37) || dg >= 90 && dg <= 97) {
                    _this.item["color"] = _this.color[dg]
                } else if ((dg >= 40 && dg <= 47) || dg >= 100 && dg <= 107) {
                    _this.item["bg_color"] = _this.color[dg]
                } else if (dg === 1) {
                    _this.item["bold"] = true
                }

                if ((dh >= 30 && dh <= 37) || dh >= 90 && dh <= 97) {
                    _this.item["color"] = _this.color[dh]
                } else if ((dh >= 40 && dg <= 47) || dh >= 100 && dh <= 107) {
                    _this.item["bg_color"] = _this.color[dh]
                } else if (dh === 1) {
                    _this.item["bold"] = true
                }

            }

        }, null).addRule(/\033\[(\d+);(\d+);(\d+);(\d+)m/, function (e, f, g, h, i) {
        }, null).addRule(/\033\[(\d+);(\d+);(\d+);(\d+);(\d+)m/, function (e, f, g, h, j) {
        }, null).addRule(/\033\[0K/, function (e) {
        }, null).addRule(/\033\[K/, function (e) {
        }, null).addRule(/[\r]?\n/, function (e) {
            _this.item["text"] += e
            _this.pushItemToLine()
            _this.newline()
        }, null).addRule(/\r/, function (e) {
            _this.item["text"] += e
            _this.eraseLine(_this.item)
        }, null).addRule(/./, function (e) {
            _this.item["text"] += e
        }, null);

        this.lexer = lexer
    }

    public constructor(xlog: HTMLElement) {
        // get attributes
        this.xLogElement = xlog

        // generate lexer
        this.createLexer()
    }

    public write(input: string) {
        this.lexer.setInput(input).lex()
    }
}
