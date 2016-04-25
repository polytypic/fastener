import * as R from "ramda"

const pass = (x, f) => f(x)

const isObject = x => x && x.constructor === Object
const isArray = x => x && x.constructor === Array

export const get = z => z.focus
export const set = R.curry((focus, z) => ({...z, focus}))
export const modify = R.curry((f, z) => set(f(get(z)), z))

export const up = ({left, focus, right, keys, up}) => {
  if (keys) {
    return {focus: R.zipObj(keys, [...left, focus, ...R.reverse(right)]), ...up}
  } else if (up) {
    return {focus: [...left, focus, ...R.reverse(right)], ...up}
  } else {
    return undefined
  }
}

const downIndex = (values, i, rest) =>
  0 <= i && i < values.length
  ? ({left: values.slice(0, i),
      focus: values[i],
      right: values.slice(i+1).reverse(),
      ...rest})
  : undefined

export const downTo = R.curry((k, {focus, ...up}) => {
  if (isObject(focus)) {
    const keys = R.keys(focus)
    return downIndex(R.values(focus), keys.findIndex(R.equals(k)), {keys, up})
  } else if (isArray(focus)) {
    return downIndex(focus, k, {up})
  } else {
    return undefined
  }
})

export const keyOf = ({left, keys, up}) =>
  keys ? keys[left.length] :
  up   ? left.length :
  undefined

const downMost = head => ({focus, ...up}) => {
  if (isArray(focus)) {
    return downIndex(focus, head ? 0 : focus.length-1, {up})
  } else if (isObject(focus)) {
    const keys = R.keys(focus)
    return downIndex(R.values(focus), head ? 0 : keys.length-1, {keys, up})
  } else {
    return undefined
  }
}

export const downHead = downMost(true)
export const downLast = downMost(false)

// FYI: The left and right ops are not accidentally O(n).  I'm just lazy. :)
const shift = (f, c, t, k) =>
  f && f.length !== 0 ? k(R.dropLast(1, f), R.last(f), R.append(c, t)) : undefined

export const left = ({left, focus, right, ...rest}) =>
  shift(left, focus, right, (l, f, r) => ({left: l, focus: f, right: r, ...rest}))

export const right = ({left, focus, right, ...rest}) =>
  shift(right, focus, left, (r, f, l) => ({left: l, focus: f, right: r, ...rest}))

export const head = z => pass(up(z), z => z && downHead(z))
export const last = z => pass(up(z), z => z && downLast(z))

export const toZipper = focus => ({focus})

export const fromZipper = z =>
  pass(up(z), zz => zz ? fromZipper(zz) : get(z))

export const queryMove = R.curry((move, b, f, z) =>
  pass(move(z), z => z ? f(z) : b))

const bwd = (move, z) => {
  switch (move) {
    case left: return right
    case right: return left
    case up: return downTo(keyOf(z))
    default: return up
  }
}

export const transformMove = R.curry((move, f, z) =>
  queryMove(move, z, R.pipe(f, queryMove(bwd(move, z), z, R.identity)), z))

const everywhereG = f => z =>
  transformMove(right, everywhereG(f), everywhere(f, z))
export const everywhere = R.curry((f, z) =>
  modify(f, transformMove(downHead, everywhereG(f), z)))
