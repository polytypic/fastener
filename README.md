[ [Tutorial](#tutorial) | [Reference](#reference) ]

[Zippers](https://www.st.cs.uni-saarland.de/edu/seminare/2005/advanced-fp/docs/huet-zipper.pdf)
are a powerful abstraction for *implementing* arbitrary queries and transforms
on immutable data structures and for step-by-step navigation and modification of
data structures.

[![npm version](https://badge.fury.io/js/fastener.svg)](http://badge.fury.io/js/fastener) [![Build Status](https://travis-ci.org/polytypic/fastener.svg?branch=master)](https://travis-ci.org/polytypic/fastener) [![](https://david-dm.org/polytypic/fastener.svg)](https://david-dm.org/polytypic/fastener) [![](https://david-dm.org/polytypic/fastener/dev-status.svg)](https://david-dm.org/polytypic/fastener#info=devDependencies)

## Tutorial

## Reference

```js
import * as F from "fastener"
```

### Introduction and Elimination

#### <a name="toZipper"></a>[`F.toZipper(json)`](#toZipper "toZipper :: JSON -> Zipper")

`F.toZipper(json)` creates a new zipper that is focused on the root of the given
JSON object.

#### <a name="fromZipper"></a>[`F.fromZipper(zipper)`](#fromZipper "fromZipper :: Zipper -> JSON")

`F.fromZipper(zipper)` extracts the modified JSON object from the given zipper.

### Focus

Focus combinators allow one to inspect and modify the element that a zipper is
focused on.

#### <a name="get"></a>[`F.get(zipper)`](#get "get :: Zipper -> JSON")

`F.get(zipper)` returns the element that the zipper is focused on.

#### <a name="modify"></a>[`F.modify(fn, zipper)`](#modify "modify :: (JSON -> JSON) -> Zipper -> Zipper")

`F.modify(fn, zipper)` is equivalent to `F.set(fn(F.get(zipper)), zipper)` and
replaces the element that the zipper is focused on with the value returned by
the given function for the element.

#### <a name="set"></a>[`F.set(json, zipper)`](#set "set :: JSON -> Zipper -> Zipper")

`F.set(json, zipper)` replaces the element that the zipper is focused on with
the given value.

### Movement

Movement combinators can be applied to any zipper, but they return `undefined`
in case of illegal moves.

#### Parent-Child movement

Parent-Child movement is moving the focus between that parent object or array
and a child element of said parent.

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

### Transforms

#### <a name="transformMove"></a>[`F.transformMove(move, fn, zipper)`](#transformMove "F.transformMove :: (downHead|downLast|left|right|up) -> (JSON -> JSON) -> Zipper -> Zipper")

#### <a name="everywhere"></a>[`F.everywhere(fn, zipper)`](#everywhere "F.everywhere :: (JSON -> JSON) -> Zipper -> Zipper")

`F.everywhere(fn, zipper)` performs a transform of the focused element by
modifying each possible focus of the element with a bottom-up traversal.
