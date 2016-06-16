[ [Tutorial](#tutorial) | [Reference](#reference) | [Related Work](#related-work) ]

[Zippers](https://www.st.cs.uni-saarland.de/edu/seminare/2005/advanced-fp/docs/huet-zipper.pdf)
are a powerful abstraction for *implementing* arbitrary queries and transforms
on immutable data structures and for step-by-step navigation and modification of
data structures.  This library implements a simple zipper designed for
manipulating JSON data.

[![npm version](https://badge.fury.io/js/fastener.svg)](http://badge.fury.io/js/fastener) [![Build Status](https://travis-ci.org/polytypic/fastener.svg?branch=master)](https://travis-ci.org/polytypic/fastener) [![](https://david-dm.org/polytypic/fastener.svg)](https://david-dm.org/polytypic/fastener) [![](https://david-dm.org/polytypic/fastener/dev-status.svg)](https://david-dm.org/polytypic/fastener#info=devDependencies)

## Tutorial

Playing with zippers in a REPL can be very instructive.  First we require the
libraries and define a little helper using
[`reduce`](http://ramdajs.com/0.21.0/docs/#reduce) to perform a sequence of
operations on a value:

```js
const R = require("ramda")
const F = require("fastener")
const seq = (x, ...fs) => R.reduce((x, f) => f(x), x, fs)
```

Let's work with the following simple JSON object:

```js
const data = { contents: [ { language: "en", text: "Title" },
                           { language: "sv", text: "Rubrik" } ] }
```

First we just create a zipper using [`F.toZipper`](#toZipper):

```js
seq(F.toZipper(data))
// { focus: { contents: [ [Object], [Object] ] } }
```

As can be seen, the zipper is just a simple JSON object and the `focus` is the
`data` object that we gave to [`F.toZipper`](#toZipper).  However, you should
use the zipper combinators to operate on zippers rather than rely on their exact
format.

Let's then move into the `contents` property of the object using
[`F.downTo`](#downTo):

```js
seq(F.toZipper(data),
    F.downTo('contents'))
// { left: [],
//   focus:
//    [ { language: 'en', text: 'Title' },
//      { language: 'sv', text: 'Rubrik' } ],
//   right: [],
//   keys: [ 'contents' ],
//   up: {} }
```

As seen above, the `focus` now has the `contents` array.  We can use
[`F.get`](#get) to extract the value under focus:


```js
seq(F.toZipper(data),
    F.downTo('contents'),
    F.get)
// [ { language: 'en', text: 'Title' },
//   { language: 'sv', text: 'Rubrik' } ]
```

Then we move into the first element of `contents` using
[`F.downHead`](#downHead):

```js
seq(F.toZipper(data),
    F.downTo('contents'),
    F.downHead)
// { left: [],
//   focus: { language: 'en', text: 'Title' },
//   right: [ { language: 'sv', text: 'Rubrik' } ],
//   up: { left: [], right: [], keys: [ 'contents' ], up: {} } }
```

And continue into the first property of that which happens to be the `language`:

```js
seq(F.toZipper(data),
    F.downTo('contents'),
    F.downHead,
    F.downHead)
// { left: [],
//   focus: 'en',
//   right: [ 'Title' ],
//   keys: [ 'language', 'text' ],
//   up:
//    { left: [],
//      right: [ [Object] ],
//      up: { left: [], right: [], keys: [Object], up: {} } } }
```

And to the next property, `title`, using [`F.right`](#right):

```js
seq(F.toZipper(data),
    F.downTo('contents'),
    F.downHead,
    F.downHead,
    F.right)
// { left: [ 'en' ],
//   focus: 'Title',
//   right: [],
//   keys: [ 'language', 'text' ],
//   up:
//    { left: [],
//      right: [ [Object] ],
//      up: { left: [], right: [], keys: [Object], up: {} } } }
```

Let's then use [`F.modify`](#modify) to modify the `title`:

```js
seq(F.toZipper(data),
    F.downTo('contents'),
    F.downHead,
    F.downHead,
    F.right,
    F.modify(t => "The " + t))
// { left: [ 'en' ],
//   focus: 'The Title',
//   right: [],
//   keys: [ 'language', 'text' ],
//   up:
//    { left: [],
//      right: [ [Object] ],
//      up: { left: [], right: [], keys: [Object], up: {} } } }
```

When we now move outwards using [`F.up`](#up) we can see the changed title
become part of the data:

```js
seq(F.toZipper(data),
    F.downTo('contents'),
    F.downHead,
    F.downHead,
    F.right,
    F.modify(t => "The " + t),
    F.up)
// { focus: { language: 'en', text: 'The Title' },
//   left: [],
//   right: [ { language: 'sv', text: 'Rubrik' } ],
//   up: { left: [], right: [], keys: [ 'contents' ], up: {} } }
```

We can also just move back to the root and get the updated data structure using
[`F.fromZipper`](#fromZipper):

```js
seq(F.toZipper(data),
    F.downTo('contents'),
    F.downHead,
    F.downHead,
    F.right,
    F.modify(t => "The " + t),
    F.fromZipper)
// { contents:
//    [ { language: 'en', text: 'The Title' },
//      { language: 'sv', text: 'Rubrik' } ] }
```

The above hopefully helped to understand how zippers work.  However, it is
important to realize that one typically does not use zipper combinators to
create such a specific sequence of operations.  One rather uses the zipper
combinators to create new combinators that perform more complex operations
directly.

Let's first define a zipper combinator that, given a zipper focused on an array,
tries to focus on an element inside the array that satisfies a given predicate:

```js
const find = R.curry((p, z) =>
  F.downTo(R.findIndex(p, F.get(z)), z))
```

Like all the basic zipper movement combinators, [`F.downTo`](#downTo) is a
*partial function* that returns `undefined` in case the index is out of bounds.
Let's define a simple function to compose partial functions:

```js
const pipeU = (...fs) => z => {
  let r = z
  for (let i=0; r !== undefined && i<fs.length; ++i)
    r = fs[i](r)
  return r
}
```

We can now compose a zipper combinator that, given a zipper focused on an object
like `data`, tries to focus on the `text` element of an object with the given
`language` inside the `contents`:


```js
const textIn = language =>
  pipeU(F.downTo('contents'),
        find(r => r.language === language),
        F.downTo('text'))
```

Now we can say:

```js
pipeU(F.toZipper, textIn("en"), F.modify(x => 'The ' + x), F.fromZipper)(data)
// { contents:
//    [ { language: 'en', text: 'The Title' },
//      { language: 'sv', text: 'Rubrik' } ] }
```

Of course, this just scratches the surface.  Zippers are powerful enough to
implement arbitrary transforms on data structures.  This can also make them more
difficult to compose and reason about than more limited approaches such as
[lenses](https://github.com/calmm-js/partial.lenses).

## Reference

The zipper combinators are available as named imports.  Typically one just
imports the library as:

```js
import * as F from "fastener"
```

In the following examples we will make use of the function

```js
const seq = (x, ...fs) => R.reduce((x, f) => f(x), x, fs)
```

written using [`reduce`](http://ramdajs.com/0.21.0/docs/#reduce) that allows one
to express a sequence of operations to perform starting from a given value.

### Introduction and Elimination

#### <a name="toZipper"></a>[`F.toZipper(json)`](#toZipper "toZipper :: JSON -> Zipper")

`F.toZipper(json)` creates a new zipper that is focused on the root of the given
JSON object.

For example:

```js
seq(F.toZipper([1,2,3]),
    F.downHead,
    F.modify(x => x + 1),
    F.fromZipper)
// [ 2, 2, 3 ]
```

#### <a name="fromZipper"></a>[`F.fromZipper(zipper)`](#fromZipper "fromZipper :: Zipper -> JSON")

`F.fromZipper(zipper)` extracts the modified JSON object from the given zipper.

For example:

```js
seq(F.toZipper([1,2,3]),
    F.downHead,
    F.modify(x => x + 1),
    F.fromZipper)
// [ 2, 2, 3 ]
```

### Focus

Focus combinators allow one to inspect and modify the element that a zipper is
focused on.

#### <a name="get"></a>[`F.get(zipper)`](#get "get :: Zipper -> JSON")

`F.get(zipper)` returns the element that the zipper is focused on.

For example:

```js
seq(F.toZipper(1), F.get)
// 1
seq(F.toZipper(["a","b","c"]),
    F.downTo(2),
    F.get)
// 'c'
```

#### <a name="modify"></a>[`F.modify(fn, zipper)`](#modify "modify :: (JSON -> JSON) -> Zipper -> Zipper")

`F.modify(fn, zipper)` is equivalent to `F.set(fn(F.get(zipper)), zipper)` and
replaces the element that the zipper is focused on with the value returned by
the given function for the element.

For example:

```js
seq(F.toZipper(["a","b","c"]),
    F.downTo(2),
    F.modify(x => x + x),
    F.fromZipper)
// [ 'a', 'b', 'cc' ]
```

#### <a name="set"></a>[`F.set(json, zipper)`](#set "set :: JSON -> Zipper -> Zipper")

`F.set(json, zipper)` replaces the element that the zipper is focused on with
the given value.

For example:

```js
seq(F.toZipper(["a","b","c"]),
    F.downTo(1),
    F.set('lol'),
    F.fromZipper)
// [ 'a', 'lol', 'c' ]
```

### Movement

Movement combinators can be applied to any zipper, but they return `undefined`
in case of illegal moves.

#### Parent-Child movement

Parent-Child movement is moving the focus between a parent object or array and a
child element of said parent.

##### <a name="downHead"></a>[`F.downHead(zipper)`](#downHead "downHead :: Zipper -> Maybe Zipper")

`F.downHead(zipper)` moves the focus to the leftmost element of the object or
array that the zipper is focused on.

##### <a name="downLast"></a>[`F.downLast(zipper)`](#downLast "downLast :: Zipper -> Maybe Zipper")

`F.downLast(zipper)` moves the focus to the rightmost element of the object or
array that the zipper is focused on.

##### <a name="downTo"></a>[`F.downTo(key, zipper)`](#downTo "downTo :: (String|Number) -> Zipper -> Maybe Zipper")

`F.downTo(key, zipper)` moves the focus to the specified object property or
array index of the object or array that the zipper is focused on.

##### <a name="keyOf"></a>[`F.keyOf(zipper)`](#keyOf "keyOf :: Zipper -> Maybe (String|Number)")

`F.keyOf(zipper)` returns the object property name or the array index that the
zipper is currently focused on.

##### <a name="up"></a>[`F.up(zipper)`](#up "up :: Zipper -> Maybe Zipper")

`F.up(zipper)` moves the focus from an array element or object property to the
containing array or object.

#### Sibling movement

Sibling movement is moving the focus between the elements of an array or an object.

##### <a name="head"></a>[`F.head(zipper)`](#head "head :: Zipper -> Maybe Zipper")

`F.head(zipper)` moves the focus to the leftmost sibling of the current focus.

##### <a name="last"></a>[`F.last(zipper)`](#last "last :: Zipper -> Maybe Zipper")

`F.last(zipper)` moves the focus to the rightmost sibling of the current focus.

##### <a name="left"></a>[`F.left(zipper)`](#left "left :: Zipper -> Maybe Zipper")

`F.left(zipper)` moves the focus to the element on the left of the current focus.

##### <a name="right"></a>[`F.right(zipper)`](#right "right :: Zipper -> Maybe Zipper")

`F.right(zipper)` moves the focus to the element on the right of the current focus.

### Queries

#### <a name="queryMove"></a>[`F.queryMove(move, default, fn, zipper)`](#queryMove "F.queryMove :: (Zipper -> Maybe Zipper) -> a -> (Zipper -> a) -> Zipper -> a")

`F.queryMove(move, default, fn, zipper)` applies the given function `fn` to the
zipper focused on after the given movement and returns the result unless the
move was illegal in which case the given default value is returned instead.

For example:

```js
seq(F.toZipper({x: 1}),
    F.queryMove(F.downTo('y'), false, () => true))
// false
seq(F.toZipper({y: 1}),
    F.queryMove(F.downTo('y'), false, () => true))
// true
```

### Transforms

#### <a name="transformMove"></a>[`F.transformMove(move, fn, zipper)`](#transformMove "F.transformMove :: (downHead|downLast|downTo(key)|left|right|up) -> (Zipper -> Zipper) -> Zipper -> Zipper")

`F.transformMove(move, fn, zipper)` applies the given function to the zipper
focused on after the given movement.  The function must the return a zipper
focused on the same element that it was given.  Then the focus is moved back to
the element that the zipper was originall focused on.  Nothing is done in case
of an illegal move.

For example:

```js
seq(F.toZipper({y: 1}),
    F.transformMove(F.downTo('y'), F.modify(x => x + 1)),
    F.fromZipper)
// { y: 2 }
seq(F.toZipper({x: 1}),
    F.transformMove(F.downTo('y'), F.modify(x => x + 1)),
    F.fromZipper)
// { x: 1 }
```

#### <a name="everywhere"></a>[`F.everywhere(fn, zipper)`](#everywhere "F.everywhere :: (JSON -> JSON) -> Zipper -> Zipper")

`F.everywhere(fn, zipper)` performs a transform of the focused element by
modifying each possible focus of the element with a bottom-up traversal.

For example:

```js
seq(F.toZipper({foo: 1,
                bar: [{lol: "bal", example: 2}]}),
    F.everywhere(x => typeof x === "number" ? x + 1 : x),
    F.fromZipper)
// { foo: 2, bar: [ { lol: 'bal', example: 3 } ] }
```

## Related Work

While the implementation is very different, the choice of combinators is based
on Michael D. Adams' paper
[Scrap Your Zippers](http://michaeldadams.org/papers/scrap_your_zippers/).
