import { ogre, print } from "./ogre.mjs";

const TARGETS = {
    default: {
        array: [
            "first element",
            "second element",
            {
                p1: "property p1",
                p2: "property p2",
                array: [
                    { ne1: "first element" },
                    { ne2: "second element" }
                ]
            }
        ],
        object: {
            p1: "property p1",
            p2: "property p2",
            a1: [
                { label: "label1", p1: "p1 in array" },
                { label: "label2", p2: "p2 in array" }
            ],
            p3: {
                s1: {
                    a: 1, b: 2
                },
                s2: {
                    a: 3, b: 4
                }
            }
        },
        "split name": {
            p1: "property p1",
            p2: "property p2"
        },
        aobj: [
            { a: 1, b: 2 },
            { a: 3, b: 4 },
            { a: 5, b: 6 }
        ]
    }
};

const PATHS = [
    {
        path: "array"
    },
    {
        path: "object.p1"
    },
    {
        path: "array.2.array.*"
    },
    {
        path: '"split name".p2'
    },
    {
        path: "object.a1.*.label"
    },
    {
        path: "object.p3.[s1,s2].*.a"
    },
    {
        path: "array.*"
    },
    {
        path: "aobj.*.a"
    }
];

PATHS.forEach(function(test, i) {
    try {
        console.log(`test ${i}`);
        print(test.path);
        console.log("\n");
        console.dir(ogre(test.path, TARGETS[test.for ?? "default"]));
        console.log(`test ${i} complete`);        
    }
    catch (e) {
        console.warn(`test ${i} failure`);
        console.log(e);
    }
    console.log("");
});
