import { parse } from "./src/parse.mjs";

function ogre(path, target) {
    const parser = parse(path);
    return parser.extract(target);
}

export { ogre };

console.dir(ogre(process.argv[2], JSON.parse(process.argv[3])));
