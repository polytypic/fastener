# Changelog

## 3.0.0

Changed default browser export name to `F` (previously `fastener`).

## 2.0.0

Dropped Ramda dependency and added `infernals`.

Optimized the representation of zippers inside arrays and objects to use
inductive lists of elements.  This improves the time complexity of left/right
movement to O(1).  Note that up/down movements are O(n) operations.

The zipper representation change is reason enough to increment major version,
because zippers can be serialized as JSON and it is perfectly valid to create
applications that make use of that feature.
