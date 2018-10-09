(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('infestines')) :
  typeof define === 'function' && define.amd ? define(['exports', 'infestines'], factory) :
  (factory((global.F = {}),global.I));
}(this, (function (exports,infestines) { 'use strict';

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
    return infestines.isDefined(up) ? { left: left, focus: focus, key: key, right: right, up: up } : { left: left, focus: focus, key: key, right: right

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
      if (infestines.isDefined(focus)) right = [right, object[k], k];else if (key === k) focus = object[k];else left = [left, object[k], k];
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
    return infestines.assocPartialU('focus', focus, z);
  };
  var set = /*#__PURE__*/infestines.curry(setU);

  var modifyU = function modifyU(f, z) {
    return setU(f(get(z)), z);
  };
  var modify = /*#__PURE__*/infestines.curry(modifyU);

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
          if (infestines.isDefined(focus)) array.push(focus);
          intoArray(right, array);
          return infestines.assocPartialU('focus', array, up);
        }
      case 'string':
        {
          var object = {};
          intoObject(reverse(left), object);
          if (infestines.isDefined(focus)) object[key] = focus;
          intoObject(right, object);
          return infestines.assocPartialU('focus', object, up);
        }
    }
  }

  function downToU(key, z) {
    var focus = z.focus;
    if (infestines.isObject(focus) && infestines.isString(key) && key in focus) return fromObject(focus, key, infestines.dissocPartialU('focus', z));
    if (infestines.isArray(focus) && infestines.isNumber(key) && 0 <= key && key < focus.length) return fromArray(focus, key, infestines.dissocPartialU('focus', z));
  }
  var downTo = /*#__PURE__*/infestines.curry(downToU);

  var downPath = /*#__PURE__*/infestines.curry(function (path, z) {
    for (var i = 0, n = path.length; z && i < n; ++i) {
      z = downToU(path[i], z);
    }return z;
  });

  var downMost = function downMost(head) {
    return function (z) {
      var focus = z.focus;
      if (infestines.isObject(focus)) return downToU(head ? firstKey(focus) : lastKey(focus), z);
      if (infestines.isArray(focus)) return downToU(head ? 0 : focus.length - 1, z);
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
    return left ? infestines.isNumber(key) ? zipper(left[0], left[1], key - 1, [right, focus], up) : zipper(left[0], left[1], left[2], [right, focus, key], up) : void 0;
  };

  var right = function right(_ref3) {
    var left = _ref3.left,
        focus = _ref3.focus,
        key = _ref3.key,
        right = _ref3.right,
        up = _ref3.up;
    return right ? infestines.isNumber(key) ? zipper([left, focus], right[1], key + 1, right[0], up) : zipper([left, focus, key], right[1], right[2], right[0], up) : void 0;
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
  var queryMove = /*#__PURE__*/infestines.curry(queryMoveU);

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
      return queryMoveU(bwd(move, z), z, infestines.id, f(x));
    }, z);
  };
  var transformMove = /*#__PURE__*/infestines.curry(transformMoveU);

  var everywhereG = function everywhereG(f) {
    return function (z) {
      return transformMoveU(right, everywhereG(f), everywhereU(f, z));
    };
  };
  var everywhereU = function everywhereU(f, z) {
    return modifyU(f, transformMoveU(downHead, everywhereG(f), z));
  };
  var everywhere = /*#__PURE__*/infestines.curry(everywhereU);

  function pathOf(z) {
    var path = [];
    while (z && infestines.isDefined(z.key)) {
      path.push(z.key);
      z = z.up;
    }
    return path.reverse();
  }

  exports.get = get;
  exports.keyOf = keyOf;
  exports.set = set;
  exports.modify = modify;
  exports.up = up;
  exports.downTo = downTo;
  exports.downPath = downPath;
  exports.downHead = downHead;
  exports.downLast = downLast;
  exports.left = left;
  exports.right = right;
  exports.head = head;
  exports.last = last;
  exports.toZipper = toZipper;
  exports.fromZipper = fromZipper;
  exports.queryMove = queryMove;
  exports.transformMove = transformMove;
  exports.everywhere = everywhere;
  exports.pathOf = pathOf;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
