import * as I from "infestines"

import * as F from "../dist/fastener.cjs"

function show(x) {
  switch (typeof x) {
  case "string":
  case "object":
    return JSON.stringify(x)
  default:
    return `${x}`
  }
}

const testEq = (exprIn, expect) => {
  const expr = exprIn.replace(/[ \n]+/g, " ")

  it(`${expr} => ${show(expect)}`, () => {
    const actual = eval(`(F, seq) => ${expr}`)(F, I.seq)
    if (!I.acyclicEqualsU(actual, expect))
      throw new Error(`Expected: ${show(expect)}, actual: ${show(actual)}`)
  })
}

describe("fastener", () => {
  testEq(`seq(F.toZipper({xs: [1,2,3]}),
              F.downTo('xs'),
              F.downLast,
              F.modify(x => x - 2),
              F.up,
              F.up,
              F.downHead,
              F.downLast,
              F.head,
              F.right,
              F.right,
              F.modify(x => x + 1),
              F.left,
              F.modify(x => x - 1),
              F.fromZipper)`,
         {xs: [1, 1, 2]})
})

describe("downTo", () => {
  testEq("seq(F.toZipper({xs: [1, {y: 2}, 3], z: 0})," +
         "    F.downTo('xs')," +
         "    F.downTo(1)," +
         "    F.downTo('y')," +
         "    F.get)",
         2)
})

describe("downHead and downLast", () => {
  testEq(`seq(F.toZipper({x: 1, y: 2}), F.downLast, F.right)`, undefined)
  testEq(`seq(F.toZipper({y: 1, x: 2}), F.downLast, F.right)`, undefined)

  testEq(`seq(F.toZipper({x: 1, y: 2}), F.downHead, F.left)`, undefined)
  testEq(`seq(F.toZipper({y: 1, x: 2}), F.downHead, F.left)`, undefined)

  testEq(`seq(F.toZipper(['x', 'y']), F.downLast, F.right)`, undefined)
  testEq(`seq(F.toZipper(['x', 'y']), F.downHead, F.left)`, undefined)
})

describe("illegal moves", () => {
  ["downHead", "downLast", "downTo(0)", "left", "right", "up", "keyOf", "head", "last"]
  .forEach(op => testEq(`seq(F.toZipper(1), F.${op})`, undefined))

  testEq(`seq(F.toZipper({x: 1}), F.downTo(0))`, undefined)
  testEq(`seq(F.toZipper({x: 1}), F.downTo('y'))`, undefined)
  testEq(`seq(F.toZipper([1,2,3]), F.downTo(5))`, undefined)
})

describe("keyOf", () => {
  testEq(`seq(F.toZipper({x: 1, y: 2}),
              F.downTo('x'),
              F.keyOf)`,
         'x')

  testEq(`seq(F.toZipper({x: 1, y: 2}),
              F.downTo('y'),
              F.keyOf)`,
         'y')

  testEq(`seq(F.toZipper(['a','b','c','d']),
              F.downHead,
              F.last,
              F.left,
              F.left,
              F.right,
              F.keyOf)`,
         2)
})

describe("everywhere", () => {
  testEq(`seq(F.toZipper({foo: [1, {y: 2}, 3], bar: 0}),
              F.everywhere(x => typeof x == 'number' ? x+1 : x),
              F.fromZipper)`,
         {foo: [2, {y: 3}, 4], bar: 1})
})

describe("downPath", () => {
  testEq(`seq(F.toZipper({xs: [1, {y: 2}, 3], z: 0}),
              F.downPath(['xs', 1, 'y']),
              F.get)`,
         2)

  testEq(`seq(F.toZipper([{xs: [1, {y: 2}, 3], z: 0}]),
              F.downPath([0, 'xs', 1, 'y']),
              F.get)`,
         2)

  testEq(`seq(F.toZipper([{xs: [1, {y: 2}, 3], z: 0}]),
              F.downPath([]),
              F.get)`,
         [{xs: [1, {y: 2}, 3], z: 0}])

  testEq(`seq(F.toZipper({xs: [1, {y: 2}, 3], z: 0}),
              F.downPath(['xs', 0, 'y']))`,
         undefined)

  testEq(`seq(F.toZipper({xs: [1, {y: 2}, 3], z: 0}),
              F.downPath(['xs', 1, 'y', 'z']))`,
         undefined)

  testEq("seq(F.toZipper(), F.downPath(['xs', 1, 'y', 'z']))",
         undefined)

  testEq("seq(undefined, F.downPath(['xs', 1, 'y', 'z']))",
         undefined)
})

describe("pathOf", () => {
  testEq(`seq(F.toZipper({xs: [1, {y: 2}, 3], z: 0}),
              F.downPath(['xs', 1, 'y']),
              F.pathOf)`,
         ['xs', 1, 'y'])

  testEq(`seq(F.toZipper([{xs: [1, {y: 2}, 3], z: 0}]),
              F.downPath([0, 'xs', 1, 'y']),
              F.pathOf)`,
         [0, 'xs', 1, 'y'])

  testEq(`seq(F.toZipper([{xs: [1, {y: 2}, 3], z: 0}]),
              F.pathOf)`,
         [])

  testEq("seq(F.toZipper([]), F.pathOf)", [])

  testEq("seq(F.toZipper(), F.pathOf)", [])

  testEq("seq(undefined, F.pathOf)", [])
})

describe("transformMove", () => {
  testEq(`seq(F.toZipper({y: 1}),
              F.transformMove(F.downTo('y'), F.modify(x => x + 1)),
              F.fromZipper)`,
         {y: 2})
  testEq(`seq(F.toZipper({y: [1, {x: 2}]}),
              F.transformMove(F.downPath(['y', 1, 'x']), F.modify(x => x + 1)),
              F.fromZipper)`,
         {y: [1, {x: 3}]})
})
