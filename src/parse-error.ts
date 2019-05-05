import { Token, Tokenizer } from "./tokenizer";

export class ParseError extends Error {
    text: string
    start: number
    length: number
    message: string

    static of(text: string, message: string, start: number, length = 1): ParseError {
        let error = new ParseError
        error.text = text;
        error.message = message;
        error.start = start;
        error.length = length
        return error;
    }

    static byToken(text: string, token: Token, message: string): ParseError {
        return this.of(text, message, token ? token.start: 0 , token? token.text.length: text.length)
    }


    static byTokens(text: string, token1: Token, token2: Token, message: string): ParseError {
        return this.of(text, message, token1.start, token2.start - token1.start + token2.text.length)
    }

    static byCurrentToken(tokenizer: Tokenizer, message: string) {
        return this.byToken(tokenizer.getOrigin(), tokenizer.current(), message)
    }

    static byCommand(command: string, message: string) {
        return this.of(command, message, 0, command.length)
    }

    render(): string {
        let mark = "";
        this.length = this.length || 1
        if (this.text) {
            for (let i = 0; i < Math.max(this.text.length, this.start) + 1; i++) {
                if (i >= this.start && i < this.start + this.length) {
                    mark = mark + '^'
                } else {
                    mark = mark + ' '
                }
            }
        }
        return `${this.message}${this.text ? '\n' + this.text : ''}${mark ? '\n' + mark : ""}`
    }
}