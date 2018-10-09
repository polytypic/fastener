import * as I from 'infestines'

import * as F from '../dist/fastener.cjs'

function show(x) {
  switch (typeof x) {
    case 'string':
    case 'object':
      return JSON.stringify(x)
    default:
      return `${x}`
  }
}

function testEq(expect, thunk) {
  const expr = thunk
    .toString()
    .replace(/\s+/g, ' ')
    .replace(/^\(\)\s+=>\s+/, '')

  it(`${expr} => ${show(expect)}`, () => {
    const actual = thunk()
    if (!I.acyclicEqualsU(actual, expect))
      throw new Error(`Expected: ${show(expect)}, actual: ${show(actual)}`)
  })
}

describe('fastener', () => {
  testEq({ xs: [1, 1, 2] }, () =>
    I.seq(
      F.toZipper({ xs: [1, 2, 3] }),
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
      F.fromZipper
    )
  )
})

describe('downTo', () => {
  testEq(2, () =>
    I.seq(
      F.toZipper({ xs: [1, { y: 2 }, 3], z: 0 }),
      F.downTo('xs'),
      F.downTo(1),
      F.downTo('y'),
      F.get
    )
  )
})

describe('downHead and downLast', () => {
  testEq(undefined, () =>
    I.seq(F.toZipper({ x: 1, y: 2 }), F.downLast, F.right)
  )
  testEq(undefined, () =>
    I.seq(F.toZipper({ y: 1, x: 2 }), F.downLast, F.right)
  )

  testEq(undefined, () => I.seq(F.toZipper({ x: 1, y: 2 }), F.downHead, F.left))
  testEq(undefined, () => I.seq(F.toZipper({ y: 1, x: 2 }), F.downHead, F.left))

  testEq(undefined, () => I.seq(F.toZipper(['x', 'y']), F.downLast, F.right))
  testEq(undefined, () => I.seq(F.toZipper(['x', 'y']), F.downHead, F.left))
})

describe('illegal moves', () => {
  I.id([
    F.downHead,
    F.downLast,
    F.downTo(0),
    F.left,
    F.right,
    F.up,
    F.keyOf,
    F.head,
    F.last
  ]).forEach(op => testEq(undefined, () => I.seq(F.toZipper(1), op)))

  testEq(undefined, () => I.seq(F.toZipper({ x: 1 }), F.downTo(0)))
  testEq(undefined, () => I.seq(F.toZipper({ x: 1 }), F.downTo('y')))
  testEq(undefined, () => I.seq(F.toZipper([1, 2, 3]), F.downTo(5)))
})

describe('keyOf', () => {
  testEq('x', () => I.seq(F.toZipper({ x: 1, y: 2 }), F.downTo('x'), F.keyOf))

  testEq('y', () => I.seq(F.toZipper({ x: 1, y: 2 }), F.downTo('y'), F.keyOf))

  testEq(2, () =>
    I.seq(
      F.toZipper(['a', 'b', 'c', 'd']),
      F.downHead,
      F.last,
      F.left,
      F.left,
      F.right,
      F.keyOf
    )
  )
})

describe('everywhere', () => {
  testEq({ foo: [2, { y: 3 }, 4], bar: 1 }, () =>
    I.seq(
      F.toZipper({ foo: [1, { y: 2 }, 3], bar: 0 }),
      F.everywhere(x => (I.isNumber(x) ? x + 1 : x)),
      F.fromZipper
    )
  )
})

describe('downPath', () => {
  testEq(2, () =>
    I.seq(
      F.toZipper({ xs: [1, { y: 2 }, 3], z: 0 }),
      F.downPath(['xs', 1, 'y']),
      F.get
    )
  )

  testEq(2, () =>
    I.seq(
      F.toZipper([{ xs: [1, { y: 2 }, 3], z: 0 }]),
      F.downPath([0, 'xs', 1, 'y']),
      F.get
    )
  )

  testEq([{ xs: [1, { y: 2 }, 3], z: 0 }], () =>
    I.seq(F.toZipper([{ xs: [1, { y: 2 }, 3], z: 0 }]), F.downPath([]), F.get)
  )

  testEq(undefined, () =>
    I.seq(
      F.toZipper({ xs: [1, { y: 2 }, 3], z: 0 }),
      F.downPath(['xs', 0, 'y'])
    )
  )

  testEq(undefined, () =>
    I.seq(
      F.toZipper({ xs: [1, { y: 2 }, 3], z: 0 }),
      F.downPath(['xs', 1, 'y', 'z'])
    )
  )

  testEq(undefined, () => I.seq(F.toZipper(), F.downPath(['xs', 1, 'y', 'z'])))

  testEq(undefined, () => I.seq(undefined, F.downPath(['xs', 1, 'y', 'z'])))
})

describe('pathOf', () => {
  testEq(['xs', 1, 'y'], () =>
    I.seq(
      F.toZipper({ xs: [1, { y: 2 }, 3], z: 0 }),
      F.downPath(['xs', 1, 'y']),
      F.pathOf
    )
  )

  testEq([0, 'xs', 1, 'y'], () =>
    I.seq(
      F.toZipper([{ xs: [1, { y: 2 }, 3], z: 0 }]),
      F.downPath([0, 'xs', 1, 'y']),
      F.pathOf
    )
  )

  testEq([], () =>
    I.seq(F.toZipper([{ xs: [1, { y: 2 }, 3], z: 0 }]), F.pathOf)
  )

  I.id([F.toZipper([]), F.toZipper(), undefined]).forEach(z =>
    testEq([], () => I.seq(z, F.pathOf))
  )
})

describe('transformMove', () => {
  testEq([[2, 1]], () =>
    I.seq(
      F.toZipper([[1, 2]]),
      F.downPath([0, 0]),
      F.transformMove(F.up, F.modify(xs => xs.slice().reverse())),
      F.fromZipper
    )
  )
  testEq([3, 2], () =>
    I.seq(
      F.toZipper([1, 2]),
      F.downTo(1),
      F.transformMove(F.left, F.modify(x => x + 2)),
      F.fromZipper
    )
  )
  testEq({ y: 2 }, () =>
    I.seq(
      F.toZipper({ y: 1 }),
      F.transformMove(F.downTo('y'), F.modify(x => x + 1)),
      F.fromZipper
    )
  )
  testEq({ y: [1, { x: 3 }] }, () =>
    I.seq(
      F.toZipper({ y: [1, { x: 2 }] }),
      F.transformMove(F.downPath(['y', 1, 'x']), F.modify(x => x + 1)),
      F.fromZipper
    )
  )
})

describe('remove', () => {
  testEq([1, 3], () =>
    I.seq(F.toZipper([1, 2, 3]), F.downTo(1), F.set(undefined), F.fromZipper)
  )
  testEq({ x: 1, z: 3 }, () =>
    I.seq(
      F.toZipper({ x: 1, y: 2, z: 3 }),
      F.downTo('y'),
      F.set(undefined),
      F.fromZipper
    )
  )
})
