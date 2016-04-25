import * as R from "ramda"

import * as F from "../src/fastener"

function show(x) {
  switch (typeof x) {
  case "string":
  case "object":
    return JSON.stringify(x)
  default:
    return `${x}`
  }
}

const seq = (x, ...fs) => R.reduce((x, f) => f(x), x, fs)

const run = expr => eval(`(F, R, seq) => ${expr}`)(F, R, seq)

const testEq = (expr, expect) => it(`${expr} => ${show(expect)}`, () => {
  const actual = run(expr)
  if (!R.equals(actual, expect))
    throw new Error(`Expected: ${show(expect)}, actual: ${show(actual)}`)
})

describe("fastener", () => {
  testEq("seq(F.toZipper({xs: [1,2,3]})," +
         "    F.downTo('xs')," +
         "    F.downLast," +
         "    F.modify(x => x - 2)," +
         "    F.up," +
         "    F.up," +
         "    F.downHead," +
         "    F.downLast," +
         "    F.head," +
         "    F.right," +
         "    F.right," +
         "    F.modify(x => x + 1)," +
         "    F.left," +
         "    F.modify(x => x - 1)," +
         "    F.fromZipper)",
         {xs: [1, 1, 2]})
})

describe("downHead and downLast", () => {
  testEq("seq(F.toZipper({x: 1, y: 2}), F.downLast, F.right)", undefined)
  testEq("seq(F.toZipper({y: 1, x: 2}), F.downLast, F.right)", undefined)

  testEq("seq(F.toZipper({x: 1, y: 2}), F.downHead, F.left)", undefined)
  testEq("seq(F.toZipper({y: 1, x: 2}), F.downHead, F.left)", undefined)

  testEq("seq(F.toZipper(['x', 'y']), F.downLast, F.right)", undefined)
  testEq("seq(F.toZipper(['x', 'y']), F.downHead, F.left)", undefined)
})

describe("illegal moves", () => {
  ["downHead", "downLast", "downTo(0)", "left", "right", "up", "keyOf", "head", "last"]
  .forEach(op => testEq(`seq(F.toZipper(1), F.${op})`, undefined))

  testEq("seq(F.toZipper({x: 1}), F.downTo(0))", undefined)
  testEq("seq(F.toZipper({x: 1}), F.downTo('y'))", undefined)
  testEq("seq(F.toZipper([1,2,3]), F.downTo(5))", undefined)
})

describe("keyOf", () => {
  testEq("seq(F.toZipper({x: 1, y: 2})," +
         "    F.downTo('x')," +
         "    F.keyOf)",
         'x')

  testEq("seq(F.toZipper({x: 1, y: 2})," +
         "    F.downTo('y')," +
         "    F.keyOf)",
         'y')

  testEq("seq(F.toZipper(['a','b','c','d'])," +
         "    F.downHead," +
         "    F.last," +
         "    F.left," +
         "    F.left," +
         "    F.right," +
         "    F.keyOf)",
         2)
})

describe("everywhere", () => {
  testEq("seq(F.toZipper({foo: [1, {y: 2}, 3], bar: 0})," +
         "    F.everywhere(x => typeof x == 'number' ? x+1 : x)," +
         "    F.fromZipper)",
         {foo: [2, {y: 3}, 4], bar: 1})
})
