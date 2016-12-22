import {
  assocPartialU,
  curry2,
  curry3,
  curry4,
  dissocPartialU,
  id,
  isArray,
  isDefined,
  isObject
} from "infestines"

//

function firstKey(o) {
  for (const k in o)
    return k
}

function lastKey(o) {
  let key
  for (const k in o)
    key = k
  return key
}

const isString = x => typeof x === "string"
const isNumber = x => typeof x === "number"

//

function reverse(from) {
  let to = null
  while (from) {
    to = from.length === 3 ? [to, from[1], from[2]] : [to, from[1]]
    from = from[0]
  }
  return to
}

//

const zipper = (left, focus, key, right, up) => isDefined(up)
  ? {left, focus, key, right, up}
  : {left, focus, key, right}

//

function intoObject(list, object) {
  while (list) {
    object[list[2]] = list[1]
    list = list[0]
  }
}

function fromObject(object, key, up) {
  let left = null
  let right = null
  let focus
  for (const k in object)
    if (isDefined(focus))
      right = [right, object[k], k]
    else
      if (key === k)
        focus = object[k]
      else
        left = [left, object[k], k]
  return zipper(left, focus, key, reverse(right), up)
}

//

function intoArray(list, array) {
  while (list) {
    array.push(list[1])
    list = list[0]
  }
}

function fromArray(array, key, up) {
  let left = null
  let right = null
  for (let i=0; i<key; ++i)
    left = [left, array[i]]
  for (let i=array.length-1; key < i; --i)
    right = [right, array[i]]
  return zipper(left, array[key], key, right, up)
}

//

export const get = z => z.focus
export const keyOf = z => z.key

const setU = (focus, z) => assocPartialU("focus", focus, z)
export const set = curry2(setU)

const modifyU = (f, z) => setU(f(get(z)), z)
export const modify = curry2(modifyU)

export function up({left, focus, key, right, up}) {
  switch (typeof key) {
    case "number": {
      const array = []
      intoArray(reverse(left), array)
      if (isDefined(focus))
        array.push(focus)
      intoArray(right, array)
      return assocPartialU("focus", array, up)
    }
    case "string": {
      const object = {}
      intoObject(reverse(left), object)
      if (isDefined(focus))
        object[key] = focus
      intoObject(right, object)
      return assocPartialU("focus", object, up)
    }
  }
}

function downToU(key, z) {
  const focus = z.focus
  if (isObject(focus) && isString(key) && key in focus)
    return fromObject(focus, key, dissocPartialU("focus", z))
  if (isArray(focus) && isNumber(key) && 0 <= key && key < focus.length)
    return fromArray(focus, key, dissocPartialU("focus", z))
}

export const downTo = curry2(downToU)

const downMost = head => z => {
  const focus = z.focus
  if (isObject(focus))
    return downToU(head ? firstKey(focus) : lastKey(focus), z)
  if (isArray(focus))
    return downToU(head ? 0 : focus.length-1, z)
}

export const downHead = downMost(true)
export const downLast = downMost(false)

export const left = ({left, focus, key, right, up}) =>
  left
  ? isNumber(key)
    ? zipper(left[0], left[1], key-1,   [right, focus], up)
    : zipper(left[0], left[1], left[2], [right, focus, key], up)
  : void 0

export const right = ({left, focus, key, right, up}) =>
  right
  ? isNumber(key)
    ? zipper([left, focus],      right[1], key+1,    right[0], up)
    : zipper([left, focus, key], right[1], right[2], right[0], up)
  : void 0

export function head(z) {const u = up(z); return u && downHead(u)}
export function last(z) {const u = up(z); return u && downLast(u)}

export const toZipper = focus => ({focus})

export function fromZipper(z) {const u=up(z); return u ? fromZipper(u) : get(z)}

function queryMoveU(move, b, f, z) {const m = move(z); return m ? f(m) : b}
export const queryMove = curry4(queryMoveU)

function bwd(move, z) {
  switch (move) {
    case left: return right
    case right: return left
    case up: return downTo(keyOf(z))
    default: return up
  }
}

const transformMoveU = (move, f, z) =>
  queryMoveU(move, z, x => queryMoveU(bwd(move, z), z, id, f(x)), z)
export const transformMove = curry3(transformMoveU)

const everywhereG = f => z =>
  transformMoveU(right, everywhereG(f), everywhereU(f, z))
const everywhereU = (f, z) =>
  modifyU(f, transformMoveU(downHead, everywhereG(f), z))
export const everywhere = curry2(everywhereU)
