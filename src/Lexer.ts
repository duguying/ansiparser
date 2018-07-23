/**
 * Copyright 2017-2020 Rex Lee
 *
 * THIS FILE IS PART OF  PROJECT
 * ALL COPYRIGHT RESERVED
 *
 * Created by duguying on 2018/7/23.
 */

export default class Lexer {
    private rules = [];
    private remove = 0;
    private state = 0;
    private index = 0;
    private input = "";
    private tokens = [];
    private reject : boolean = false;

    public addRule(pattern, action, start){
        let global = pattern.global;

        if (!global) {
            let flags = "g";
            if (pattern.multiline) flags += "m";
            if (pattern.ignoreCase) flags += "i";
            pattern = new RegExp(pattern.source, flags);
        }

        if (Object.prototype.toString.call(start) !== "[object Array]") start = [0];

        this.rules.push({
            pattern: pattern,
            global: global,
            action: action,
            start: start
        });

        return this;
    }

    public setInput(input){
        this.remove = 0;
        this.state = 0;
        this.index = 0;
        this.tokens.length = 0;
        this.input = input;
        return this;
    }

    public lex(){
        if (this.tokens.length) return this.tokens.shift();

        this.reject = true;

        while (this.index <= this.input.length) {
            let matches = this.scan.call(this).splice(this.remove);
            let index = this.index;

            while (matches.length) {
                if (this.reject) {
                    let match = matches.shift();
                    let result = match.result;
                    let length = match.length;
                    this.index += length;
                    this.reject = false;
                    this.remove++;

                    let token = match.action.apply(this, result);
                    if (this.reject) {
                        this.index = result.index;
                    } else if (typeof token !== "undefined") {
                        switch (Object.prototype.toString.call(token)) {
                            case "[object Array]": {
                                this.tokens = token.slice(1);
                                token = token[0];
                            }
                            default: {
                                if (length) {
                                    this.remove = 0;
                                }
                                return token;
                            }

                        }
                    }
                } else {
                    break;
                }
            }

            let input = this.input;

            if (index < input.length) {
                if (this.reject) {
                    this.remove = 0;
                    let token = this.defunct.call(this, input.charAt(this.index++));
                    if (typeof token !== "undefined") {
                        if (Object.prototype.toString.call(token) === "[object Array]") {
                            this.tokens = token.slice(1);
                            return token[0];
                        } else return token;
                    }
                } else {
                    if (this.index !== index) {
                        this.remove = 0;
                    }
                    this.reject = true;
                }
            } else if (matches.length) {
                this.reject = true;
            } else {
                break;
            }
        }
    }

    private scan(){
        let matches = [];
        let index = 0;

        let state = this.state;
        let lastIndex = this.index;
        let input = this.input;

        for (let i = 0, length = this.rules.length; i < length; i++) {
            let rule = this.rules[i];
            let start = rule.start;
            let states = start.length;

            if ((!states || start.indexOf(state) >= 0) ||
                (state % 2 && states === 1 && !start[0])) {
                let pattern = rule.pattern;
                pattern.lastIndex = lastIndex;
                let result = pattern.exec(input);

                if (result && result.index === lastIndex) {
                    let j = matches.push({
                        result: result,
                        action: rule.action,
                        length: result[0].length
                    });

                    if (rule.global) index = j;

                    while (--j > index) {
                        let k = j - 1;

                        if (matches[j].length > matches[k].length) {
                            let temple = matches[j];
                            matches[j] = matches[k];
                            matches[k] = temple;
                        }
                    }
                }
            }
        }

        return matches;
    }

    private defunct (chr) {
        throw new Error("Unexpected character at index " + (this.index - 1) + ": " + chr);
    };

    public constructor(defunct){
        if (typeof defunct !== "function") {
            // nop
        }else {
            this.defunct = defunct
        }
    }
}