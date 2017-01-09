[ [≡](#contents) | [Tutorial](#tutorial) | [Reference](#reference) | [Related Work](#related-work) | [GitHub](https://github.com/polytypic/fastener) | [Try Fastener!](https://polytypic.github.io/fastener/)  ]

[Zippers](https://www.st.cs.uni-saarland.de/edu/seminare/2005/advanced-fp/docs/huet-zipper.pdf) are
a powerful abstraction for *implementing* arbitrary queries and transforms on
immutable data structures and for step-by-step navigation and modification of
data structures.  This library implements a simple zipper designed for
manipulating JSON data.

[![npm version](https://badge.fury.io/js/fastener.svg)](http://badge.fury.io/js/fastener) [![Build Status](https://travis-ci.org/polytypic/fastener.svg?branch=master)](https://travis-ci.org/polytypic/fastener) [![Code Coverage](https://img.shields.io/codecov/c/github/polytypic/fastener/master.svg)](https://codecov.io/github/polytypic/fastener?branch=master) [![](https://david-dm.org/polytypic/fastener.svg)](https://david-dm.org/polytypic/fastener) [![](https://david-dm.org/polytypic/fastener/dev-status.svg)](https://david-dm.org/polytypic/fastener?type=dev)

## Contents

* [Tutorial](#tutorial)
* [Reference](#reference)
  * [Introduction and Elimination](#introduction-and-elimination)
    * [`F.toZipper(json)`](#F-toZipper "F.toZipper: JSON -> Zipper")
    * [`F.fromZipper(zipper)`](#F-fromZipper "F.fromZipper: Zipper -> JSON")
  * [Focus](#focus)
    * [`F.get(zipper)`](#F-get "F.get: Zipper -> JSON")
    * [`F.modify(json => json, zipper)`](#F-modify "F.modify: (JSON -> JSON) -> Zipper -> Zipper")
    * [`F.set(json, zipper)`](#F-set "F.set: JSON -> Zipper -> Zipper")
  * [Movement](#movement)
    * [Parent-Child movement](#parent-child-movement)
      * [`F.downHead(zipper)`](#F-downHead "F.downHead: Zipper -> Maybe Zipper")
      * [`F.downLast(zipper)`](#F-downLast "F.downLast: Zipper -> Maybe Zipper")
      * [`F.downTo(key, zipper)`](#F-downTo "F.downTo: (String|Number) -> Zipper -> Maybe Zipper")
      * [`F.keyOf(zipper)`](#F-keyOf "F.keyOf: Zipper -> Maybe (String|Number)")
      * [`F.up(zipper)`](#F-up "F.up: Zipper -> Maybe Zipper")
    * [Path movement](#path-movement)
      * [`F.downPath([...keys], zipper)`](#F-downPath "F.downPath: [String|Number] -> Zipper -> Maybe Zipper")
      * [`F.pathOf(zipper)`](#F-pathOf "F.pathOf: Zipper -> [String|Number]")
    * [Sibling movement](#sibling-movement)
      * [`F.head(zipper)`](#F-head "F.head: Zipper -> Maybe Zipper")
      * [`F.last(zipper)`](#F-last "F.last: Zipper -> Maybe Zipper")
      * [`F.left(zipper)`](#F-left "F.left: Zipper -> Maybe Zipper")
      * [`F.right(zipper)`](#F-right "F.right: Zipper -> Maybe Zipper")
  * [Queries](#queries)
    * [`F.queryMove(zipper => maybeZipper, value, zipper => value, zipper)`](#F-queryMove "F.queryMove: (Zipper -> Maybe Zipper) -> a -> (Zipper -> a) -> Zipper -> a")
  * [Transforms](#transforms)
    * [`F.transformMove(move, zipper => zipper, zipper)`](#F-transformMove "F.transformMove: (F.downHead|F.downLast|F.downTo(key)|F.left|F.right|F.up) -> (Zipper -> Zipper) -> Zipper -> Zipper")
    * [`F.everywhere(json => json, zipper)`](#F-everywhere "F.everywhere: (JSON -> JSON) -> Zipper -> Zipper")
* [Related Work](#related-work)

## Tutorial

Playing with zippers in a REPL can be very instructive.  First we require the
libraries

```jsx
import * as F from "fastener"
import * as R from "ramda"
```

and define a little helper
using [`reduce`](http://ramdajs.com/0.21.0/docs/#reduce) to perform a sequence
of operations on a value:

```js
const seq = (x, ...fs) => R.reduce((x, f) => f(x), x, fs)
```

Let's work with the following simple JSON object:

```js
const data = {contents: [{language: "en", text: "Title"},
                         {language: "sv", text: "Rubrik"}]}
```

First we just create a zipper using [`F.toZipper`](#F-toZipper):

```js
seq(F.toZipper(data))
// { focus: { contents: [ [Object], [Object] ] } }
```

As can be seen, **_the zipper is just a simple JSON object_** and the `focus` is
the `data` object that we gave to [`F.toZipper`](#F-toZipper).  As long the data
structure being manipulated is JSON, you can serialize and deserialize zippers
as JSON.  However, it is recommended that you use the zipper combinators to
operate on zippers rather than rely on their exact format.

Let's then move into the `contents` property of the object using
[`F.downTo`](#F-downTo):

```js
seq(F.toZipper(data),
    F.downTo('contents'))
// { left: null,
//   focus:
//    [ { language: 'en', text: 'Title' },
//      { language: 'sv', text: 'Rubrik' } ],
//   key: 'contents',
//   right: null }
```

As seen above, the `focus` now has the `contents` array.  We can use
[`F.get`](#F-get) to extract the value under focus:


```js
seq(F.toZipper(data),
    F.downTo('contents'),
    F.get)
// [ { language: 'en', text: 'Title' },
//   { language: 'sv', text: 'Rubrik' } ]
```

Then we move into the first element of `contents` using
[`F.downHead`](#F-downHead):

```js
seq(F.toZipper(data),
    F.downTo('contents'),
    F.downHead)
// { left: null,
//   focus: { language: 'en', text: 'Title' },
//   key: 0,
//   right: [ null, { language: 'sv', text: 'Rubrik' } ],
//   up: { left: null, key: 'contents', right: null } }
```

And continue into the first property of that which happens to be the `language`:

```js
seq(F.toZipper(data),
    F.downTo('contents'),
    F.downHead,
    F.downHead)
// { left: null,
//   focus: 'en',
//   key: 'language',
//   right: [ null, 'Title', 'text' ],
//   up:
//    { left: null,
//      key: 0,
//      right: [ null, [Object] ],
//      up: { left: null, key: 'contents', right: null } } }
```

And to the next property, `title`, using [`F.right`](#F-right):

```js
seq(F.toZipper(data),
    F.downTo('contents'),
    F.downHead,
    F.downHead,
    F.right)
// { left: [ null, 'en', 'language' ],
//   focus: 'Title',
//   key: 'text',
//   right: null,
//   up:
//    { left: null,
//      key: 0,
//      right: [ null, [Object] ],
//      up: { left: null, key: 'contents', right: null } } }
```

Let's then use [`F.modify`](#F-modify) to modify the `title`:

```js
seq(F.toZipper(data),
    F.downTo('contents'),
    F.downHead,
    F.downHead,
    F.right,
    F.modify(t => "The " + t))
// { left: [ null, 'en', 'language' ],
//   focus: 'The Title',
//   key: 'text',
//   right: null,
//   up:
//    { left: null,
//      key: 0,
//      right: [ null, [Object] ],
//      up: { left: null, key: 'contents', right: null } } }
```

When we now move outwards using [`F.up`](#F-up) we can see the changed title
become part of the data:

```js
seq(F.toZipper(data),
    F.downTo('contents'),
    F.downHead,
    F.downHead,
    F.right,
    F.modify(t => "The " + t),
    F.up)
// { left: null,
//   key: 0,
//   right: [ null, { language: 'sv', text: 'Rubrik' } ],
//   up: { left: null, key: 'contents', right: null },
//   focus: { language: 'en', text: 'The Title' } }
```

We can also just move back to the root and get the updated data structure using
[`F.fromZipper`](#F-fromZipper):

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
const find = R.curry((p, z) => F.downTo(R.findIndex(p, F.get(z)), z))
```

Like all the basic zipper movement combinators, [`F.downTo`](#F-downTo) is a
*partial function* that returns `undefined` in case the index is out of bounds.
Let's define a simple function to compose partial functions:

```js
const pipePartial = (...fs) => z => {
  for (let i=0; z !== undefined && i<fs.length; ++i)
    z = fs[i](z)
  return z
}
```

We can now compose a zipper combinator that, given a zipper focused on an object
like `data`, tries to focus on the `text` element of an object with the given
`language` inside the `contents`:


```js
const textIn = language => pipePartial(
  F.downTo('contents'),
  find(R.whereEq({language})),
  F.downTo('text'))
```

Now we can say:

```js
seq(data,
    F.toZipper,
    textIn("en"),
    F.modify(x => 'The ' + x),
    F.fromZipper)
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

```jsx
import * as F from "fastener"
```

In the following examples we will make use of the function

```jsx
const seq = (x, ...fs) => R.reduce((x, f) => f(x), x, fs)
```

written using [`reduce`](http://ramdajs.com/0.21.0/docs/#reduce) that allows one
to express a sequence of operations to perform starting from a given value.

### Introduction and Elimination

#### <a name="F-toZipper"></a> [≡](#contents) [`F.toZipper(json)`](#F-toZipper "F.toZipper: JSON -> Zipper")

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

#### <a name="F-fromZipper"></a> [≡](#contents) [`F.fromZipper(zipper)`](#F-fromZipper "F.fromZipper: Zipper -> JSON")

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

#### <a name="F-get"></a> [≡](#contents) [`F.get(zipper)`](#F-get "F.get: Zipper -> JSON")

`F.get(zipper)` returns the element that the zipper is focused on.

For example:

```js
seq(F.toZipper(1), F.get)
// 1
```
```js
seq(F.toZipper(["a","b","c"]),
    F.downTo(2),
    F.get)
// 'c'
```

#### <a name="F-modify"></a> [≡](#contents) [`F.modify(json => json, zipper)`](#F-modify "F.modify: (JSON -> JSON) -> Zipper -> Zipper")

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

#### <a name="F-set"></a> [≡](#contents) [`F.set(json, zipper)`](#F-set "F.set: JSON -> Zipper -> Zipper")

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

##### <a name="F-downHead"></a> [≡](#contents) [`F.downHead(zipper)`](#F-downHead "F.downHead: Zipper -> Maybe Zipper")

`F.downHead(zipper)` moves the focus to the leftmost element of the object or
array that the zipper is focused on.

##### <a name="F-downLast"></a> [≡](#contents) [`F.downLast(zipper)`](#F-downLast "F.downLast: Zipper -> Maybe Zipper")

`F.downLast(zipper)` moves the focus to the rightmost element of the object or
array that the zipper is focused on.

##### <a name="F-downTo"></a> [≡](#contents) [`F.downTo(key, zipper)`](#F-downTo "F.downTo: (String|Number) -> Zipper -> Maybe Zipper")

`F.downTo(key, zipper)` moves the focus to the specified object property or
array index of the object or array that the zipper is focused on.

##### <a name="F-keyOf"></a> [≡](#contents) [`F.keyOf(zipper)`](#F-keyOf "F.keyOf: Zipper -> Maybe (String|Number)")

`F.keyOf(zipper)` returns the object property name or the array index that the
zipper is currently focused on.

##### <a name="F-up"></a> [≡](#contents) [`F.up(zipper)`](#F-up "F.up: Zipper -> Maybe Zipper")

`F.up(zipper)` moves the focus from an array element or object property to the
containing array or object.

#### Path movement

Path movement is moving the focus along a path from a parent object or array to
a nested child element.

##### <a name="F-downPath"></a> [≡](#contents) [`F.downPath([...keys], zipper)`](#F-downPath "F.downPath: [String|Number] -> Zipper -> Maybe Zipper")

`F.downPath(path, zipper)` moves the focus along the specified path of keys.

##### <a name="F-pathOf"></a> [≡](#contents) [`F.pathOf(zipper)`](#F-pathOf "F.pathOf: Zipper -> [String|Number]")

`F.pathOf(zipper)` returns the path from the root to the current element focused
on by the zipper.

#### Sibling movement

Sibling movement is moving the focus between the elements of an array or an object.

##### <a name="F-head"></a> [≡](#contents) [`F.head(zipper)`](#F-head "F.head: Zipper -> Maybe Zipper")

`F.head(zipper)` moves the focus to the leftmost sibling of the current focus.

##### <a name="F-last"></a> [≡](#contents) [`F.last(zipper)`](#F-last "F.last: Zipper -> Maybe Zipper")

`F.last(zipper)` moves the focus to the rightmost sibling of the current focus.

##### <a name="F-left"></a> [≡](#contents) [`F.left(zipper)`](#F-left "F.left: Zipper -> Maybe Zipper")

`F.left(zipper)` moves the focus to the element on the left of the current focus.

##### <a name="F-right"></a> [≡](#contents) [`F.right(zipper)`](#F-right "F.right: Zipper -> Maybe Zipper")

`F.right(zipper)` moves the focus to the element on the right of the current focus.

### Queries

#### <a name="F-queryMove"></a> [≡](#contents) [`F.queryMove(zipper => maybeZipper, value, zipper => value, zipper)`](#F-queryMove "F.queryMove: (Zipper -> Maybe Zipper) -> a -> (Zipper -> a) -> Zipper -> a")

`F.queryMove(move, default, fn, zipper)` applies the given function `fn` to the
zipper focused on after the given movement and returns the result unless the
move was illegal in which case the given default value is returned instead.

For example:

```js
seq(F.toZipper({x: 1}),
    F.queryMove(F.downTo('y'), false, () => true))
// false
```
```js
seq(F.toZipper({y: 1}),
    F.queryMove(F.downTo('y'), false, () => true))
// true
```

### Transforms

#### <a name="F-transformMove"></a> [≡](#contents) [`F.transformMove(move, zipper => zipper, zipper)`](#F-transformMove "F.transformMove: (F.downHead|F.downLast|F.downTo(key)|F.left|F.right|F.up) -> (Zipper -> Zipper) -> Zipper -> Zipper")

`F.transformMove(move, fn, zipper)` applies the given function to the zipper
focused on after the given movement.  The movement `move` must be one
of
[`F.downHead`](#F-downHead),
[`F.downLast`](#F-downLast),
[`F.downTo(key)`](#F-downTo), [`F.left`](#F-left), [`F.right`](#F-right),
or [`F.up`](#F-up).  The function `fn` must the return a zipper focused on the
same element that it was given.  Then the focus is moved back to the element
that the zipper was originally focused on.  Nothing is done in case of an
illegal move.

For example:

```js
seq(F.toZipper({y: 1}),
    F.transformMove(F.downTo('y'), F.modify(x => x + 1)),
    F.fromZipper)
// { y: 2 }
```
```js
seq(F.toZipper({x: 1}),
    F.transformMove(F.downTo('y'), F.modify(x => x + 1)),
    F.fromZipper)
// { x: 1 }
```

#### <a name="F-everywhere"></a> [≡](#contents) [`F.everywhere(json => json, zipper)`](#F-everywhere "F.everywhere: (JSON -> JSON) -> Zipper -> Zipper")

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
