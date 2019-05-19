import { Token } from "./tokenizer";

export class TokenUtil {
   
    static isLetter(token: Token): boolean {
        let text = token.text
        if (AlphaUtil.isAlpha(text.charAt(0))) {
            for (let i = 1; i < text.length; i++) {
                let c = text.charAt(i)
                if (!AlphaUtil.isIdent(c) && !AlphaUtil.isDigit(c)) {
                    return false
                }
            }
        } else {
            return false;
        }
        return true;
    }

    static isFloat(token: Token): boolean {
        return !token.isToken
    }

    static isString(token: Token) {
        let text = token.text
        return text.charAt(0) == text.charAt(text.length - 1 )  && (text.charAt(0)  == `'` || text.charAt(0) == `"`)
    }
}

export class AlphaUtil {

    static isAlpha(char: string) {
        return (char >= 'A' && char <= 'Z') || (char >= 'a' && char <= 'z')
    }

    static isIdent(char: string) {
        return this.isAlpha(char) ||  this.isDigit(char) || char == '_'
    }

    static isDigit(char: string) {
        return char >= '0' && char <= '9'
    }
}