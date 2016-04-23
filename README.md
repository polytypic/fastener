[ [Reference](#reference) ]

This is the very beginnings of a
[Zipper](https://www.st.cs.uni-saarland.de/edu/seminare/2005/advanced-fp/docs/huet-zipper.pdf)
library for manipulating JSON.

[![npm version](https://badge.fury.io/js/fastener.svg)](http://badge.fury.io/js/fastener) [![Build Status](https://travis-ci.org/polytypic/fastener.svg?branch=master)](https://travis-ci.org/polytypic/fastener) [![](https://david-dm.org/polytypic/fastener.svg)](https://david-dm.org/polytypic/fastener) [![](https://david-dm.org/polytypic/fastener/dev-status.svg)](https://david-dm.org/polytypic/fastener#info=devDependencies)

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
##### <a name="downLast"></a>[`F.downLast(zipper)`](#downLast "downLast :: Zipper -> Maybe Zipper")
##### <a name="downTo"></a>[`F.downTo(key, zipper)`](#downTo "downTo :: (String|Number) -> Zipper -> Maybe Zipper")
##### <a name="keyOf"></a>[`F.keyOf(zipper)`](#keyOf "keyOf :: Zipper -> Maybe (String|Number)")

`F.keyOf(zipper)` returns the object property name or the array index that the
zipper is currently focused on.

##### <a name="up"></a>[`F.up(zipper)`](#up "up :: Zipper -> Maybe Zipper")

#### Sibling movement

Sibling movement is moving the focus between the elements of an array or an object.

##### <a name="head"></a>[`F.head(zipper)`](#head "head :: Zipper -> Maybe Zipper")
##### <a name="last"></a>[`F.last(zipper)`](#last "last :: Zipper -> Maybe Zipper")
##### <a name="left"></a>[`F.left(zipper)`](#left "left :: Zipper -> Maybe Zipper")
##### <a name="right"></a>[`F.right(zipper)`](#right "right :: Zipper -> Maybe Zipper")

### Queries

#### <a name="queryMove"></a>[`F.queryMove(move, default, fn, zipper)`](#queryMove "F.queryMove :: (Zipper -> Maybe Zipper) -> a -> (Zipper -> a) -> Zipper -> a")

### Transforms

#### <a name="transformMove"></a>[`F.transformMove(move, fn, zipper)`](#transformMove "F.transformMove :: (downHead|downLast|left|right|up) -> (JSON -> JSON) -> Zipper -> Zipper")

#### <a name="everywhere"></a>[`F.everywhere(fn, zipper)`](#everywhere "F.everywhere :: (JSON -> JSON) -> Zipper -> Zipper")
