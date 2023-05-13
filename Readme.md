# Ogre

Ogre is an object graph navigation tool for JavaScript. The intention is to allow "plucking" values out of JavaScript objects, which have properties, sub-objects, sub-arrays, all of which may have more sub-objects and sub-arrays. A JavaScript object with a "top" starting point is called (in this document and by some of my best friends) an "object graph". Ogre should work on any kind of object graph **except** ones with cycles, unless your path queries avoid the cycles.

## Example

Given this object:

    const object = {
         hello: {
             world: "A Message For You"
         }
    }

Then Ogre will allow you to extract the message intended just for you with the path "hello.world".

## Path Syntax

An Ogre "path" is an expression that explains how you want to steer through the connections in an object graph, moving from property value to property value. A path consists of a chain of "extractions". Each extraction retrieves a value or a set of values from a single object. The chain of extractions is the key to navigating through the object-to-object relationships in the object graph: starting from the top, the chain leads step by step to the result you're looking for. In the above example, our chain was `hello.world` and both `hello` and `world` were extractions. Extractions in a chain are separated by period (dot) characters.

Whitespace is generally allowed, but (probably obvious) not in simple names; you can use quoted names for properties whose names have spaces.

### Extractions

The basic job of an extraction is to grab one or more things from a single object. Often it's just one thing. As Ogre works through a path down through the object graph, each extraction is applied to the objects encountered as the graph is traversed. As that chaining process happens, the current object is called the "target" object. Here is the list of extractions that can be part of a chain:

 * name — a simple name (like a JavaScript identifier, except somewhat looser), or a simple double-quoted string (with double-quote escaped with backslash) means that the named property should be extracted from the target object. With target object `{a: 1, b: 2}`, the extraction `a` will return the value 1.
 * `*` — the * extraction means that the extracted value should be the entire target array. (It only makes sense when the path so far has gotten the navigation to an array value.)
 * `[ chain, chain, ... ]` — a square-bracket list of "sub-chain" expressions mean that the extraction should return an array from the target object, with each element of the array formed by evaluating each chain starting with the current target as the top. The result is an array of extracted chain values.
 * `{ name: chain, name: chain, ... }` — like `[ ]`, but the result is an object with property names taken from the names to the left of the colons, and the extraction values taken from each chain applied to the target object.
 
### Chains

A chain is simply a list of extractions separated by `.` (dot) characters. A complete chain is better refered to as a "path", though you can call it whatever you want.

As the extraction proceeds down a chain, the result of each extraction is fed to the next step in the chain. That means that `[ ]` and `{ }` results create new objects to be processed down the chain, objects that do not appear in the original data structure (though of course they contain values from the original graph).

### Array-valued Extractions

When a step in a chain is a `[ ]` extraction (which results in an array of evaluated sub-chain values), an immediately subsequent `*` extraction will also result in an array, but it will do so in such a way that the succeeding step on the chain is applied to each element of the array individually, with the result being a new array. This will require an example.

Given the object:

    const object = {
        a: { x: "hello" },
        b: { x: "goodbye" },
        c: { x: "world" }
    }
    
then applying the path `[a,c].*.x` will produce the resulting array `["hello", "world"]`. It plucks both "a" and "c" from the top-level object into an array, and then with the subsequent `*` extraction it announces the intention of descending each element in succession. The final extraction `x` plucks the "x" property from each of the values in the targets extracted with the initial `[ ]`.

## API

There is one primary function in Ogre, and it is unsurprisingly called "ogre". It is exported as an object, so the `import` looks like

    import { ogre } from "ogre";
    
The function takes two parameters: a path string and a starting target object. The returned value is a scalar if the path navigates to a simple string, number, boolean, or null, or else an object of some kind. (Note that a path does not have to navigate all the way to a leaf of the graph; it can stop anywhere.)

If a path goes astray, which is to say, it the path navigation instructions don't work, the code will throw an exception. Ogre does not make any attempt to adapt to errant target object structures. The intended use case is JSON return values from APIs of one sort or another. (Future versions may introduce optional chain steps, but that involves some subtleties that I haven't figured out completely.)

So calling the main entry point looks like

    const result = ogre(path, target);
    

