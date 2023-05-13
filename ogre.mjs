import { parse } from "./src/parse.mjs";

function ogre(path, target) {
    const parser = parse(path);
    return parser.extract(target);
}

function print(path) {
    const parser = parse(path);
    parser.print();
}

export { ogre, print, parse };
