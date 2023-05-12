import { Lex, T } from "./lex.mjs";

class S {
    #chain = null;

    constructor(lex) {
        this.#chain = new Chain(lex);
    }

    get chain() {
        return this.#chain;
    }

    extract(target) {
        const rv = this.chain.extract(target);
        if (Array.isArray(rv) && rv.length === 1)
            return rv[0];
        return rv;
    }
}

class Chain {
    #head; #tail; #frag;

    constructor(lex) {
        this.#frag = lex.frag;
        this.#head = new Extraction(lex);
        if (lex.tok === T.DOT) {
            lex.getToken();
            this.#tail = new Chain(lex);
        }
    }

    get head() { return this.#head; }
    get tail() { return this.#tail; }

    extract(target) {
        const gen = this.head.op(target);

        const iter = Array.from(gen);
        const rv = iter.map(v => {
            return this.tail?.extract(v) ?? v;
        });
        if (rv.length === 1)
            return rv[0];
        return rv;
    }
}

class Extraction {
    #operator;

    constructor(lex) {
        switch (lex.tok) {
        case T.NAME: {
            const key = lex.val;
            this.#operator = function *(object) {
                yield object[key];
            }
            lex.getToken();
            break;
        }
        case T.STAR: {
            this.#operator = function *(object) {
                const values = Object.values(object);
                const result = [];
                for (let i = 0; i < values.length; ++i)
                    yield values[i];
            }
            lex.getToken();
            break;
        }
        case T.LBRACK: {
            const list = [];
            lex.getToken();
            while (lex.tok != T.RBRACK) {
                const extraction = new Chain(lex);
                list.push(extraction);
                if (lex.tok === T.COMMA)
                    lex.getToken();
            }
            lex.getToken();
            this.#operator = function *(object) {
                for (let i = 0; i < list.length; ++i) {
                    yield list[i].extract(object);
                }
            }
            break;
        }
        default:
            throw new Error(`Expected extraction at source position ${lex.pos}`)
        }
    }

    get op() { return this.#operator; }
}

function parse(path) {
    const lex = new Lex(path);
    const sentence = new S(lex);
    if (lex.tok !== T.EOF)
        throw new Error(`Trailing junk in ${path}`);
    return sentence;
}

export { parse };
