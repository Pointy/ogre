import { Lex, T } from "./lex.mjs";

function spaces(n) {
    return n && new Array(n + 1).join(" ") || "";
}

const FROMSTAR = Symbol("built from a * extractor");

function starry(o) {
    return Array.isArray(o) && !!o[FROMSTAR];
}

function setstar(o) {
    Object.defineProperty(o, FROMSTAR, {
        value: true
    });
}

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

    print() {
        this.#chain.print();
    }
}

class Chain {
    #head; #tail; #text;

    constructor(lex) {
        const startp = lex.pos;
        this.#head = new Extraction(lex);
        if (lex.tok === T.DOT) {
            lex.getToken();
            this.#tail = new Chain(lex);
        }
        this.#text = lex.path.slice(startp, lex.pos);
    }

    get head() { return this.#head; }
    get tail() { return this.#tail; }

    extract(target) {
        const headval = this.head.op(target);
        return this.tail?.extract(headval) ?? headval;
    }

    get text() { return this.#text; }

    print(indent = 0) {
        console.log(`${spaces(indent)}head:`);
        this.head.print(indent + 2);
        if (this.#tail) {
            console.log(`${spaces(indent)}tail:`);
            this.#tail.print(indent + 2);            
        }
    }
}

class Extraction {
    #operator;
    #text;

    constructor(lex) {
        const startpos = lex.pos;
        switch (lex.tok) {
        case T.NAME: {
            const key = lex.val;
            this.#operator = function(object) {
                if (starry(object))
                    return object.map(elem => elem[key]);
                return object[key];
            }
            lex.getToken();
            break;
        }
        case T.STAR: {
            this.#operator = function(object) {
                const values = Object.values(object);
                const result = [];
                for (let i = 0; i < values.length; ++i)
                    result.push(values[i]);
                setstar(result);
                return result;
            }
            lex.getToken();
            break;
        }
        case T.LBRACK: {
            const list = [];
            lex.getToken();
            while (lex.tok != T.RBRACK && lex.tok !== T.EOF) {
                const extraction = new Chain(lex);
                list.push(extraction);
                if (lex.tok === T.COMMA)
                    lex.getToken();
            }
            if (lex.tok !== T.RBRACK)
                throw new Error(`Incomplete bracketed list`);
            lex.getToken();
            this.#operator = function(object) {
                let rv = [];
                if (starry(object))
                    rv = object.map(o => (list.map(l => l.extract(o))));
                else
                    for (let i = 0; i < list.length; ++i) {
                        rv.push(list[i].extract(object));
                    }
               return rv;
            }
            break;
        }
        case T.LBRACE: {
            const list = [];
            lex.getToken();
            while (lex.tok !== T.RBRACE && lex.tok !== T.EOF) {
                const prop = { name: lex.val };
                lex.getToken();
                if (lex.tok !== T.COLON)
                    throw new Error(`Expected colon at ${lex.pos}, saw ${lex.tok}`);
                lex.getToken();
                prop.extr = new Chain(lex);
                if (lex.tok === T.COMMA)
                    lex.getToken();
                list.push(prop);
            }
            if (lex.tok !== T.RBRACE)
                throw new Error(`Incomplete named property list`);
            lex.getToken();
            this.#operator = function(object) {
                let rv = {};
                if (starry(object))
                    rv = object.map(o => {
                        const rv = {};
                        list.forEach(e => rv[e.name] = e.extr.extract(o));
                        return rv;
                    })
                else
                    for (let i = 0; i < list.length; ++i) {
                        rv[list[i].name] = list[i].extr.extract(object);
                    }
                return rv;
            }
            break;
        }
        default:
            throw new Error(`Expected extraction at source position ${lex.pos}, ${lex.tok}`)
        }
        this.#text = lex.path.slice(startpos, lex.pos);
    }

    get text() { return this.#text; }

    print(indent = 0) {
        console.log(`${spaces(indent)}Extraction: ${this.text}`)
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

function print(path) {
    parse(path).print();
}

export { parse, print };
