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

describe("illegal moves", () => {
  ["downHead", "downLast", "downTo(0)", "left", "right", "up", "keyOf", "head", "last"]
  .forEach(op => testEq(`seq(F.toZipper(1), F.${op})`, undefined))
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
