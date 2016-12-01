import * as I from "infestines"

function toArray(list, array, i0, step) {
  while (list) {
    array[i0] = list[0]
    i0 += step
    list = list[1]
  }
}

function toList(array, i0, i1, step) {
  let list = null
  while (i0 != i1) {
    list = [array[i0], list]
    i0 += step
  }
  return list
}

function length(list) {
  let n = 0
  while (list) {
    ++n
    list = list[1]
  }
  return n
}

function join(ls, f, rs) {
  const lsN = length(ls)
  const rsN = length(rs)
  const ys = Array(lsN+1+rsN)
  toArray(ls, ys, lsN-1, -1)
  ys[lsN] = f
  toArray(rs, ys, lsN+1, 1)
  return ys
}

//

export const get = z => z.focus

const setU = (focus, z) => I.assocPartialU("focus", focus, z)
export const set = I.curry2(setU)

const modifyU = (f, z) => setU(f(get(z)), z)
export const modify = I.curry2(modifyU)

export const up = ({left, focus, right, keys, up}) => {
  if (keys)
    return {focus: I.zipObjPartialU(keys, join(left, focus, right)), ...up}
  if (up)
    return {focus: join(left, focus, right), ...up}
}

const downIndex = (values, i, rest) =>
  0 <= i && i < values.length
  ? ({left: toList(values, 0, i, 1),
      focus: values[i],
      right: toList(values, values.length-1, i, -1),
      ...rest})
  : undefined

export const downTo = I.curry2((k, {focus, ...up}) => {
  if (I.isObject(focus)) {
    const keys=[], values=[]
    I.unzipObjIntoU(focus, keys, values)
    return downIndex(values, keys.findIndex(x => k === x), {keys, up})
  }
  if (I.isArray(focus))
    return downIndex(focus, k, {up})
})

export const keyOf = ({left, keys, up}) =>
  keys ? keys[length(left)] :
  up   ? length(left) :
  undefined

const downMost = head => ({focus, ...up}) => {
  if (I.isObject(focus)) {
    const keys=[], values=[]
    I.unzipObjIntoU(focus, keys, values)
    return downIndex(values, head ? 0 : keys.length-1, {keys, up})
  }
  if (I.isArray(focus))
    return downIndex(focus, head ? 0 : focus.length-1, {up})
}

export const downHead = downMost(true)
export const downLast = downMost(false)

const shift = (f, c, t, r, k) =>
  f ? k(f[1], f[0], [c, t], r) : undefined

const leftI = (left, focus, right, rest) => ({left, focus, right, ...rest})
export const left = ({left, focus, right, ...rest}) =>
  shift(left, focus, right, rest, leftI)

const rightI = (right, focus, left, rest) => ({left, focus, right, ...rest})
export const right = ({left, focus, right, ...rest}) =>
  shift(right, focus, left, rest, rightI)

export function head(z) {const u = up(z); return u && downHead(u)}
export function last(z) {const u = up(z); return u && downLast(u)}

export const toZipper = focus => ({focus})

export function fromZipper(z) {const u=up(z); return u ? fromZipper(u) : get(z)}

function queryMoveU(move, b, f, z) {const m = move(z); return m ? f(m) : b}
export const queryMove = I.curry4(queryMoveU)

const bwd = (move, z) => {
  switch (move) {
    case left: return right
    case right: return left
    case up: return downTo(keyOf(z))
    default: return up
  }
}

const transformMoveU = (move, f, z) =>
  queryMoveU(move, z, x => queryMoveU(bwd(move, z), z, I.id, f(x)), z)
export const transformMove = I.curry3(transformMoveU)

const everywhereG = f => z =>
  transformMoveU(right, everywhereG(f), everywhereU(f, z))
const everywhereU = (f, z) =>
  modifyU(f, transformMoveU(downHead, everywhereG(f), z))
export const everywhere = I.curry2(everywhereU)
