import { assocPartialU, curry, dissocPartialU, id, isArray, isDefined, isNumber, isObject, isString } from 'infestines';

//

function firstKey(o) {
  for (var k in o) {
    return k;
  }
}

function lastKey(o) {
  var key = void 0;
  for (var k in o) {
    key = k;
  }return key;
}

//

function reverse(from) {
  var to = null;
  while (from) {
    to = from.length === 3 ? [to, from[1], from[2]] : [to, from[1]];
    from = from[0];
  }
  return to;
}

//

var zipper = function zipper(left, focus, key, right, up) {
  return isDefined(up) ? { left: left, focus: focus, key: key, right: right, up: up } : { left: left, focus: focus, key: key, right: right

    //

  };
};function intoObject(list, object) {
  while (list) {
    object[list[2]] = list[1];
    list = list[0];
  }
}

function fromObject(object, key, up) {
  var left = null;
  var right = null;
  var focus = void 0;
  for (var k in object) {
    if (isDefined(focus)) right = [right, object[k], k];else if (key === k) focus = object[k];else left = [left, object[k], k];
  }return zipper(left, focus, key, reverse(right), up);
}

//

function intoArray(list, array) {
  while (list) {
    array.push(list[1]);
    list = list[0];
  }
}

function fromArray(array, key, up) {
  var left = null;
  var right = null;
  for (var i = 0; i < key; ++i) {
    left = [left, array[i]];
  }for (var _i = array.length - 1; key < _i; --_i) {
    right = [right, array[_i]];
  }return zipper(left, array[key], key, right, up);
}

//

var get = function get(z) {
  return z.focus;
};
var keyOf = function keyOf(z) {
  return z.key;
};

var setU = function setU(focus, z) {
  return assocPartialU('focus', focus, z);
};
var set = /*#__PURE__*/curry(setU);

var modifyU = function modifyU(f, z) {
  return setU(f(get(z)), z);
};
var modify = /*#__PURE__*/curry(modifyU);

function up(_ref) {
  var left = _ref.left,
      focus = _ref.focus,
      key = _ref.key,
      right = _ref.right,
      up = _ref.up;

  switch (typeof key) {
    case 'number':
      {
        var array = [];
        intoArray(reverse(left), array);
        if (isDefined(focus)) array.push(focus);
        intoArray(right, array);
        return assocPartialU('focus', array, up);
      }
    case 'string':
      {
        var object = {};
        intoObject(reverse(left), object);
        if (isDefined(focus)) object[key] = focus;
        intoObject(right, object);
        return assocPartialU('focus', object, up);
      }
  }
}

function downToU(key, z) {
  var focus = z.focus;
  if (isObject(focus) && isString(key) && key in focus) return fromObject(focus, key, dissocPartialU('focus', z));
  if (isArray(focus) && isNumber(key) && 0 <= key && key < focus.length) return fromArray(focus, key, dissocPartialU('focus', z));
}
var downTo = /*#__PURE__*/curry(downToU);

var downPath = /*#__PURE__*/curry(function (path, z) {
  for (var i = 0, n = path.length; z && i < n; ++i) {
    z = downToU(path[i], z);
  }return z;
});

var downMost = function downMost(head) {
  return function (z) {
    var focus = z.focus;
    if (isObject(focus)) return downToU(head ? firstKey(focus) : lastKey(focus), z);
    if (isArray(focus)) return downToU(head ? 0 : focus.length - 1, z);
  };
};

var downHead = /*#__PURE__*/downMost(true);
var downLast = /*#__PURE__*/downMost(false);

var left = function left(_ref2) {
  var left = _ref2.left,
      focus = _ref2.focus,
      key = _ref2.key,
      right = _ref2.right,
      up = _ref2.up;
  return left ? isNumber(key) ? zipper(left[0], left[1], key - 1, [right, focus], up) : zipper(left[0], left[1], left[2], [right, focus, key], up) : void 0;
};

var right = function right(_ref3) {
  var left = _ref3.left,
      focus = _ref3.focus,
      key = _ref3.key,
      right = _ref3.right,
      up = _ref3.up;
  return right ? isNumber(key) ? zipper([left, focus], right[1], key + 1, right[0], up) : zipper([left, focus, key], right[1], right[2], right[0], up) : void 0;
};

function head(z) {
  var u = up(z);
  return u && downHead(u);
}
function last(z) {
  var u = up(z);
  return u && downLast(u);
}

var toZipper = function toZipper(focus) {
  return { focus: focus };
};

function fromZipper(z) {
  var u = up(z);
  return u ? fromZipper(u) : get(z);
}

function queryMoveU(move, b, f, z) {
  var m = move(z);
  return m ? f(m) : b;
}
var queryMove = /*#__PURE__*/curry(queryMoveU);

function bwd(move, z) {
  switch (move) {
    case left:
      return right;
    case right:
      return left;
    case up:
      return downTo(keyOf(z));
    default:
      return up;
  }
}

var transformMoveU = function transformMoveU(move, f, z) {
  return queryMoveU(move, z, function (x) {
    return queryMoveU(bwd(move, z), z, id, f(x));
  }, z);
};
var transformMove = /*#__PURE__*/curry(transformMoveU);

var everywhereG = function everywhereG(f) {
  return function (z) {
    return transformMoveU(right, everywhereG(f), everywhereU(f, z));
  };
};
var everywhereU = function everywhereU(f, z) {
  return modifyU(f, transformMoveU(downHead, everywhereG(f), z));
};
var everywhere = /*#__PURE__*/curry(everywhereU);

function pathOf(z) {
  var path = [];
  while (z && isDefined(z.key)) {
    path.push(z.key);
    z = z.up;
  }
  return path.reverse();
}

export { get, keyOf, set, modify, up, downTo, downPath, downHead, downLast, left, right, head, last, toZipper, fromZipper, queryMove, transformMove, everywhere, pathOf };
