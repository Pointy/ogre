
const TRX = /(\.)|(\,)|(\[)|(\])|({)|(})|(\*)|((?!")(?:[^.,\[\]{}\\:])+)|"((?:[^"]|\\")*)"|(:)/y;

const DOT = new String("DOT"),
    COMMA = new String("COMMA"),
    LBRACK = new String("["),
    RBRACK = new String("]"),
    LBRACE = new String("{"),
    RBRACE = new String("}"),
    STAR = new String("*"),
    NAME = new String("name"),
    QNAME = new String("qname"),
    COLON = new String("COLON"),
    EOF = new String("EOF")
;

const TOKENS = Object.freeze([
    null,
    DOT,
    COMMA,
    LBRACK,
    RBRACK,
    LBRACE,
    RBRACE,
    STAR,
    NAME,
    QNAME,
    COLON,
    EOF
]);

const T = { DOT, COMMA, LBRACK, RBRACK, LBRACE, RBRACE, STAR, NAME, COLON, EOF };

class Lex {
    #path;
    #curtok;
    #curval;
    #pos;
    #TRX = new RegExp(TRX.source, "y");

    constructor(path) {
        this.#path = path;
        this.#pos = 0;
        this.#TRX.lastIndex = 0;
        this.getToken();
    }

    getToken() {
        while (/\s/.test(this.#path[this.#TRX.lastIndex]))
            this.#TRX.lastIndex++;

        if (this.#TRX.lastIndex >= this.#path.length) {
            this.#curtok = EOF;
            this.#curval = null;
            this.#pos = this.#path.length;
            return this.tok;
        }
        this.#pos = this.#TRX.lastIndex;
        const tok = this.#TRX.exec(this.#path);
        if (tok == null)
            throw new Error(`Illegal character at ${this.#TRX.lastIndex}`);
        const mindex = tok.findIndex((matched, index) => index > 0 && matched != null && matched != "");
        this.#curtok = TOKENS[mindex];
        this.#curval = tok[mindex];
        if (this.#curtok === QNAME) this.#curtok = NAME;
        return this.tok;
    }

    get tok() {
        return this.#curtok;
    }

    get val() { 
        return this.#curval;
    }

    get pos() {
        return this.#pos;
    }

    get path() {
        return this.#path;
    }

    get frag() {
        return this.#path.slice(this.pos);
    }
}

function test(str) {
    const lex = new Lex(str);
    while (lex.tok != EOF) {
        console.log(`${lex.tok} (${lex.val}) ${lex.pos}`);
        lex.getToken();
    }
}

export { Lex, T, test };

