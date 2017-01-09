(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.L = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.everywhere = exports.transformMove = exports.queryMove = exports.toZipper = exports.right = exports.left = exports.downLast = exports.downHead = exports.downPath = exports.downTo = exports.modify = exports.set = exports.keyOf = exports.get = undefined;
exports.up = up;
exports.head = head;
exports.last = last;
exports.fromZipper = fromZipper;
exports.pathOf = pathOf;

var _infestines = require("infestines");

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

var isString = function isString(x) {
  return typeof x === "string";
};
var isNumber = function isNumber(x) {
  return typeof x === "number";
};

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
  return (0, _infestines.isDefined)(up) ? { left: left, focus: focus, key: key, right: right, up: up } : { left: left, focus: focus, key: key, right: right };
};

//

function intoObject(list, object) {
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
    if ((0, _infestines.isDefined)(focus)) right = [right, object[k], k];else if (key === k) focus = object[k];else left = [left, object[k], k];
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

var get = exports.get = function get(z) {
  return z.focus;
};
var keyOf = exports.keyOf = function keyOf(z) {
  return z.key;
};

var setU = function setU(focus, z) {
  return (0, _infestines.assocPartialU)("focus", focus, z);
};
var set = exports.set = (0, _infestines.curry)(setU);

var modifyU = function modifyU(f, z) {
  return setU(f(get(z)), z);
};
var modify = exports.modify = (0, _infestines.curry)(modifyU);

function up(_ref) {
  var left = _ref.left,
      focus = _ref.focus,
      key = _ref.key,
      right = _ref.right,
      up = _ref.up;

  switch (typeof key) {
    case "number":
      {
        var array = [];
        intoArray(reverse(left), array);
        if ((0, _infestines.isDefined)(focus)) array.push(focus);
        intoArray(right, array);
        return (0, _infestines.assocPartialU)("focus", array, up);
      }
    case "string":
      {
        var object = {};
        intoObject(reverse(left), object);
        if ((0, _infestines.isDefined)(focus)) object[key] = focus;
        intoObject(right, object);
        return (0, _infestines.assocPartialU)("focus", object, up);
      }
  }
}

function downToU(key, z) {
  var focus = z.focus;
  if ((0, _infestines.isObject)(focus) && isString(key) && key in focus) return fromObject(focus, key, (0, _infestines.dissocPartialU)("focus", z));
  if ((0, _infestines.isArray)(focus) && isNumber(key) && 0 <= key && key < focus.length) return fromArray(focus, key, (0, _infestines.dissocPartialU)("focus", z));
}
var downTo = exports.downTo = (0, _infestines.curry)(downToU);

function downPathU(path, z) {
  for (var i = 0, n = path.length; z && i < n; ++i) {
    z = downToU(path[i], z);
  }return z;
}
var downPath = exports.downPath = (0, _infestines.curry)(downPathU);

var downMost = function downMost(head) {
  return function (z) {
    var focus = z.focus;
    if ((0, _infestines.isObject)(focus)) return downToU(head ? firstKey(focus) : lastKey(focus), z);
    if ((0, _infestines.isArray)(focus)) return downToU(head ? 0 : focus.length - 1, z);
  };
};

var downHead = exports.downHead = downMost(true);
var downLast = exports.downLast = downMost(false);

var left = exports.left = function left(_ref2) {
  var left = _ref2.left,
      focus = _ref2.focus,
      key = _ref2.key,
      right = _ref2.right,
      up = _ref2.up;
  return left ? isNumber(key) ? zipper(left[0], left[1], key - 1, [right, focus], up) : zipper(left[0], left[1], left[2], [right, focus, key], up) : void 0;
};

var right = exports.right = function right(_ref3) {
  var left = _ref3.left,
      focus = _ref3.focus,
      key = _ref3.key,
      right = _ref3.right,
      up = _ref3.up;
  return right ? isNumber(key) ? zipper([left, focus], right[1], key + 1, right[0], up) : zipper([left, focus, key], right[1], right[2], right[0], up) : void 0;
};

function head(z) {
  var u = up(z);return u && downHead(u);
}
function last(z) {
  var u = up(z);return u && downLast(u);
}

var toZipper = exports.toZipper = function toZipper(focus) {
  return { focus: focus };
};

function fromZipper(z) {
  var u = up(z);return u ? fromZipper(u) : get(z);
}

function queryMoveU(move, b, f, z) {
  var m = move(z);return m ? f(m) : b;
}
var queryMove = exports.queryMove = (0, _infestines.curry)(queryMoveU);

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
    return queryMoveU(bwd(move, z), z, _infestines.id, f(x));
  }, z);
};
var transformMove = exports.transformMove = (0, _infestines.curry)(transformMoveU);

var everywhereG = function everywhereG(f) {
  return function (z) {
    return transformMoveU(right, everywhereG(f), everywhereU(f, z));
  };
};
var everywhereU = function everywhereU(f, z) {
  return modifyU(f, transformMoveU(downHead, everywhereG(f), z));
};
var everywhere = exports.everywhere = (0, _infestines.curry)(everywhereU);

function pathOf(z) {
  var path = [];
  while (z && (0, _infestines.isDefined)(z.key)) {
    path.unshift(z.key);
    z = z.up;
  }
  return path;
}

},{"infestines":undefined}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZmFzdGVuZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7UUNrR2dCLEUsR0FBQSxFO1FBOERBLEksR0FBQSxJO1FBQ0EsSSxHQUFBLEk7UUFJQSxVLEdBQUEsVTtRQXdCQSxNLEdBQUEsTTs7QUE3TGhCOztBQVVBOztBQUVBLFNBQVMsUUFBVCxDQUFrQixDQUFsQixFQUFxQjtBQUNuQixPQUFLLElBQU0sQ0FBWCxJQUFnQixDQUFoQjtBQUNFLFdBQU8sQ0FBUDtBQURGO0FBRUQ7O0FBRUQsU0FBUyxPQUFULENBQWlCLENBQWpCLEVBQW9CO0FBQ2xCLE1BQUksWUFBSjtBQUNBLE9BQUssSUFBTSxDQUFYLElBQWdCLENBQWhCO0FBQ0UsVUFBTSxDQUFOO0FBREYsR0FFQSxPQUFPLEdBQVA7QUFDRDs7QUFFRCxJQUFNLFdBQVcsU0FBWCxRQUFXO0FBQUEsU0FBSyxPQUFPLENBQVAsS0FBYSxRQUFsQjtBQUFBLENBQWpCO0FBQ0EsSUFBTSxXQUFXLFNBQVgsUUFBVztBQUFBLFNBQUssT0FBTyxDQUFQLEtBQWEsUUFBbEI7QUFBQSxDQUFqQjs7QUFFQTs7QUFFQSxTQUFTLE9BQVQsQ0FBaUIsSUFBakIsRUFBdUI7QUFDckIsTUFBSSxLQUFLLElBQVQ7QUFDQSxTQUFPLElBQVAsRUFBYTtBQUNYLFNBQUssS0FBSyxNQUFMLEtBQWdCLENBQWhCLEdBQW9CLENBQUMsRUFBRCxFQUFLLEtBQUssQ0FBTCxDQUFMLEVBQWMsS0FBSyxDQUFMLENBQWQsQ0FBcEIsR0FBNkMsQ0FBQyxFQUFELEVBQUssS0FBSyxDQUFMLENBQUwsQ0FBbEQ7QUFDQSxXQUFPLEtBQUssQ0FBTCxDQUFQO0FBQ0Q7QUFDRCxTQUFPLEVBQVA7QUFDRDs7QUFFRDs7QUFFQSxJQUFNLFNBQVMsU0FBVCxNQUFTLENBQUMsSUFBRCxFQUFPLEtBQVAsRUFBYyxHQUFkLEVBQW1CLEtBQW5CLEVBQTBC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U0FDbEIsUUFBUSxDQUFSLEVBQVcsZUFBZSxRQUFmLEVBQXlCLFlBQVksQ0FBWixDQUF6QixFQUF5QyxDQUF6QyxDQUFYLENBRGtCO0FBQUEsQ0FBcEI7QUFFTyxJQUFNLGtDQUFhLHVCQUFNLFdBQU4sQ0FBbkI7O0FBRUEsU0FBUyxNQUFULENBQWdCLENBQWhCLEVBQW1CO0FBQ3hCLE1BQU0sT0FBTyxFQUFiO0FBQ0EsU0FBTyxLQUFLLDJCQUFVLEVBQUUsR0FBWixDQUFaLEVBQThCO0FBQzVCLFNBQUssT0FBTCxDQUFhLEVBQUUsR0FBZjtBQUNBLFFBQUksRUFBRSxFQUFOO0FBQ0Q7QUFDRCxTQUFPLElBQVA7QUFDRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQge1xuICBhc3NvY1BhcnRpYWxVLFxuICBjdXJyeSxcbiAgZGlzc29jUGFydGlhbFUsXG4gIGlkLFxuICBpc0FycmF5LFxuICBpc0RlZmluZWQsXG4gIGlzT2JqZWN0XG59IGZyb20gXCJpbmZlc3RpbmVzXCJcblxuLy9cblxuZnVuY3Rpb24gZmlyc3RLZXkobykge1xuICBmb3IgKGNvbnN0IGsgaW4gbylcbiAgICByZXR1cm4ga1xufVxuXG5mdW5jdGlvbiBsYXN0S2V5KG8pIHtcbiAgbGV0IGtleVxuICBmb3IgKGNvbnN0IGsgaW4gbylcbiAgICBrZXkgPSBrXG4gIHJldHVybiBrZXlcbn1cblxuY29uc3QgaXNTdHJpbmcgPSB4ID0+IHR5cGVvZiB4ID09PSBcInN0cmluZ1wiXG5jb25zdCBpc051bWJlciA9IHggPT4gdHlwZW9mIHggPT09IFwibnVtYmVyXCJcblxuLy9cblxuZnVuY3Rpb24gcmV2ZXJzZShmcm9tKSB7XG4gIGxldCB0byA9IG51bGxcbiAgd2hpbGUgKGZyb20pIHtcbiAgICB0byA9IGZyb20ubGVuZ3RoID09PSAzID8gW3RvLCBmcm9tWzFdLCBmcm9tWzJdXSA6IFt0bywgZnJvbVsxXV1cbiAgICBmcm9tID0gZnJvbVswXVxuICB9XG4gIHJldHVybiB0b1xufVxuXG4vL1xuXG5jb25zdCB6aXBwZXIgPSAobGVmdCwgZm9jdXMsIGtleSwgcmlnaHQsIHVwKSA9PiBpc0RlZmluZWQodXApXG4gID8ge2xlZnQsIGZvY3VzLCBrZXksIHJpZ2h0LCB1cH1cbiAgOiB7bGVmdCwgZm9jdXMsIGtleSwgcmlnaHR9XG5cbi8vXG5cbmZ1bmN0aW9uIGludG9PYmplY3QobGlzdCwgb2JqZWN0KSB7XG4gIHdoaWxlIChsaXN0KSB7XG4gICAgb2JqZWN0W2xpc3RbMl1dID0gbGlzdFsxXVxuICAgIGxpc3QgPSBsaXN0WzBdXG4gIH1cbn1cblxuZnVuY3Rpb24gZnJvbU9iamVjdChvYmplY3QsIGtleSwgdXApIHtcbiAgbGV0IGxlZnQgPSBudWxsXG4gIGxldCByaWdodCA9IG51bGxcbiAgbGV0IGZvY3VzXG4gIGZvciAoY29uc3QgayBpbiBvYmplY3QpXG4gICAgaWYgKGlzRGVmaW5lZChmb2N1cykpXG4gICAgICByaWdodCA9IFtyaWdodCwgb2JqZWN0W2tdLCBrXVxuICAgIGVsc2VcbiAgICAgIGlmIChrZXkgPT09IGspXG4gICAgICAgIGZvY3VzID0gb2JqZWN0W2tdXG4gICAgICBlbHNlXG4gICAgICAgIGxlZnQgPSBbbGVmdCwgb2JqZWN0W2tdLCBrXVxuICByZXR1cm4gemlwcGVyKGxlZnQsIGZvY3VzLCBrZXksIHJldmVyc2UocmlnaHQpLCB1cClcbn1cblxuLy9cblxuZnVuY3Rpb24gaW50b0FycmF5KGxpc3QsIGFycmF5KSB7XG4gIHdoaWxlIChsaXN0KSB7XG4gICAgYXJyYXkucHVzaChsaXN0WzFdKVxuICAgIGxpc3QgPSBsaXN0WzBdXG4gIH1cbn1cblxuZnVuY3Rpb24gZnJvbUFycmF5KGFycmF5LCBrZXksIHVwKSB7XG4gIGxldCBsZWZ0ID0gbnVsbFxuICBsZXQgcmlnaHQgPSBudWxsXG4gIGZvciAobGV0IGk9MDsgaTxrZXk7ICsraSlcbiAgICBsZWZ0ID0gW2xlZnQsIGFycmF5W2ldXVxuICBmb3IgKGxldCBpPWFycmF5Lmxlbmd0aC0xOyBrZXkgPCBpOyAtLWkpXG4gICAgcmlnaHQgPSBbcmlnaHQsIGFycmF5W2ldXVxuICByZXR1cm4gemlwcGVyKGxlZnQsIGFycmF5W2tleV0sIGtleSwgcmlnaHQsIHVwKVxufVxuXG4vL1xuXG5leHBvcnQgY29uc3QgZ2V0ID0geiA9PiB6LmZvY3VzXG5leHBvcnQgY29uc3Qga2V5T2YgPSB6ID0+IHoua2V5XG5cbmNvbnN0IHNldFUgPSAoZm9jdXMsIHopID0+IGFzc29jUGFydGlhbFUoXCJmb2N1c1wiLCBmb2N1cywgeilcbmV4cG9ydCBjb25zdCBzZXQgPSBjdXJyeShzZXRVKVxuXG5jb25zdCBtb2RpZnlVID0gKGYsIHopID0+IHNldFUoZihnZXQoeikpLCB6KVxuZXhwb3J0IGNvbnN0IG1vZGlmeSA9IGN1cnJ5KG1vZGlmeVUpXG5cbmV4cG9ydCBmdW5jdGlvbiB1cCh7bGVmdCwgZm9jdXMsIGtleSwgcmlnaHQsIHVwfSkge1xuICBzd2l0Y2ggKHR5cGVvZiBrZXkpIHtcbiAgICBjYXNlIFwibnVtYmVyXCI6IHtcbiAgICAgIGNvbnN0IGFycmF5ID0gW11cbiAgICAgIGludG9BcnJheShyZXZlcnNlKGxlZnQpLCBhcnJheSlcbiAgICAgIGlmIChpc0RlZmluZWQoZm9jdXMpKVxuICAgICAgICBhcnJheS5wdXNoKGZvY3VzKVxuICAgICAgaW50b0FycmF5KHJpZ2h0LCBhcnJheSlcbiAgICAgIHJldHVybiBhc3NvY1BhcnRpYWxVKFwiZm9jdXNcIiwgYXJyYXksIHVwKVxuICAgIH1cbiAgICBjYXNlIFwic3RyaW5nXCI6IHtcbiAgICAgIGNvbnN0IG9iamVjdCA9IHt9XG4gICAgICBpbnRvT2JqZWN0KHJldmVyc2UobGVmdCksIG9iamVjdClcbiAgICAgIGlmIChpc0RlZmluZWQoZm9jdXMpKVxuICAgICAgICBvYmplY3Rba2V5XSA9IGZvY3VzXG4gICAgICBpbnRvT2JqZWN0KHJpZ2h0LCBvYmplY3QpXG4gICAgICByZXR1cm4gYXNzb2NQYXJ0aWFsVShcImZvY3VzXCIsIG9iamVjdCwgdXApXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGRvd25Ub1Uoa2V5LCB6KSB7XG4gIGNvbnN0IGZvY3VzID0gei5mb2N1c1xuICBpZiAoaXNPYmplY3QoZm9jdXMpICYmIGlzU3RyaW5nKGtleSkgJiYga2V5IGluIGZvY3VzKVxuICAgIHJldHVybiBmcm9tT2JqZWN0KGZvY3VzLCBrZXksIGRpc3NvY1BhcnRpYWxVKFwiZm9jdXNcIiwgeikpXG4gIGlmIChpc0FycmF5KGZvY3VzKSAmJiBpc051bWJlcihrZXkpICYmIDAgPD0ga2V5ICYmIGtleSA8IGZvY3VzLmxlbmd0aClcbiAgICByZXR1cm4gZnJvbUFycmF5KGZvY3VzLCBrZXksIGRpc3NvY1BhcnRpYWxVKFwiZm9jdXNcIiwgeikpXG59XG5leHBvcnQgY29uc3QgZG93blRvID0gY3VycnkoZG93blRvVSlcblxuZnVuY3Rpb24gZG93blBhdGhVKHBhdGgsIHopIHtcbiAgZm9yIChsZXQgaT0wLCBuPXBhdGgubGVuZ3RoOyB6ICYmIGk8bjsgKytpKVxuICAgIHogPSBkb3duVG9VKHBhdGhbaV0sIHopXG4gIHJldHVybiB6XG59XG5leHBvcnQgY29uc3QgZG93blBhdGggPSBjdXJyeShkb3duUGF0aFUpXG5cbmNvbnN0IGRvd25Nb3N0ID0gaGVhZCA9PiB6ID0+IHtcbiAgY29uc3QgZm9jdXMgPSB6LmZvY3VzXG4gIGlmIChpc09iamVjdChmb2N1cykpXG4gICAgcmV0dXJuIGRvd25Ub1UoaGVhZCA/IGZpcnN0S2V5KGZvY3VzKSA6IGxhc3RLZXkoZm9jdXMpLCB6KVxuICBpZiAoaXNBcnJheShmb2N1cykpXG4gICAgcmV0dXJuIGRvd25Ub1UoaGVhZCA/IDAgOiBmb2N1cy5sZW5ndGgtMSwgeilcbn1cblxuZXhwb3J0IGNvbnN0IGRvd25IZWFkID0gZG93bk1vc3QodHJ1ZSlcbmV4cG9ydCBjb25zdCBkb3duTGFzdCA9IGRvd25Nb3N0KGZhbHNlKVxuXG5leHBvcnQgY29uc3QgbGVmdCA9ICh7bGVmdCwgZm9jdXMsIGtleSwgcmlnaHQsIHVwfSkgPT5cbiAgbGVmdFxuICA/IGlzTnVtYmVyKGtleSlcbiAgICA/IHppcHBlcihsZWZ0WzBdLCBsZWZ0WzFdLCBrZXktMSwgICBbcmlnaHQsIGZvY3VzXSwgdXApXG4gICAgOiB6aXBwZXIobGVmdFswXSwgbGVmdFsxXSwgbGVmdFsyXSwgW3JpZ2h0LCBmb2N1cywga2V5XSwgdXApXG4gIDogdm9pZCAwXG5cbmV4cG9ydCBjb25zdCByaWdodCA9ICh7bGVmdCwgZm9jdXMsIGtleSwgcmlnaHQsIHVwfSkgPT5cbiAgcmlnaHRcbiAgPyBpc051bWJlcihrZXkpXG4gICAgPyB6aXBwZXIoW2xlZnQsIGZvY3VzXSwgICAgICByaWdodFsxXSwga2V5KzEsICAgIHJpZ2h0WzBdLCB1cClcbiAgICA6IHppcHBlcihbbGVmdCwgZm9jdXMsIGtleV0sIHJpZ2h0WzFdLCByaWdodFsyXSwgcmlnaHRbMF0sIHVwKVxuICA6IHZvaWQgMFxuXG5leHBvcnQgZnVuY3Rpb24gaGVhZCh6KSB7Y29uc3QgdSA9IHVwKHopOyByZXR1cm4gdSAmJiBkb3duSGVhZCh1KX1cbmV4cG9ydCBmdW5jdGlvbiBsYXN0KHopIHtjb25zdCB1ID0gdXAoeik7IHJldHVybiB1ICYmIGRvd25MYXN0KHUpfVxuXG5leHBvcnQgY29uc3QgdG9aaXBwZXIgPSBmb2N1cyA9PiAoe2ZvY3VzfSlcblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21aaXBwZXIoeikge2NvbnN0IHU9dXAoeik7IHJldHVybiB1ID8gZnJvbVppcHBlcih1KSA6IGdldCh6KX1cblxuZnVuY3Rpb24gcXVlcnlNb3ZlVShtb3ZlLCBiLCBmLCB6KSB7Y29uc3QgbSA9IG1vdmUoeik7IHJldHVybiBtID8gZihtKSA6IGJ9XG5leHBvcnQgY29uc3QgcXVlcnlNb3ZlID0gY3VycnkocXVlcnlNb3ZlVSlcblxuZnVuY3Rpb24gYndkKG1vdmUsIHopIHtcbiAgc3dpdGNoIChtb3ZlKSB7XG4gICAgY2FzZSBsZWZ0OiByZXR1cm4gcmlnaHRcbiAgICBjYXNlIHJpZ2h0OiByZXR1cm4gbGVmdFxuICAgIGNhc2UgdXA6IHJldHVybiBkb3duVG8oa2V5T2YoeikpXG4gICAgZGVmYXVsdDogcmV0dXJuIHVwXG4gIH1cbn1cblxuY29uc3QgdHJhbnNmb3JtTW92ZVUgPSAobW92ZSwgZiwgeikgPT5cbiAgcXVlcnlNb3ZlVShtb3ZlLCB6LCB4ID0+IHF1ZXJ5TW92ZVUoYndkKG1vdmUsIHopLCB6LCBpZCwgZih4KSksIHopXG5leHBvcnQgY29uc3QgdHJhbnNmb3JtTW92ZSA9IGN1cnJ5KHRyYW5zZm9ybU1vdmVVKVxuXG5jb25zdCBldmVyeXdoZXJlRyA9IGYgPT4geiA9PlxuICB0cmFuc2Zvcm1Nb3ZlVShyaWdodCwgZXZlcnl3aGVyZUcoZiksIGV2ZXJ5d2hlcmVVKGYsIHopKVxuY29uc3QgZXZlcnl3aGVyZVUgPSAoZiwgeikgPT5cbiAgbW9kaWZ5VShmLCB0cmFuc2Zvcm1Nb3ZlVShkb3duSGVhZCwgZXZlcnl3aGVyZUcoZiksIHopKVxuZXhwb3J0IGNvbnN0IGV2ZXJ5d2hlcmUgPSBjdXJyeShldmVyeXdoZXJlVSlcblxuZXhwb3J0IGZ1bmN0aW9uIHBhdGhPZih6KSB7XG4gIGNvbnN0IHBhdGggPSBbXVxuICB3aGlsZSAoeiAmJiBpc0RlZmluZWQoei5rZXkpKSB7XG4gICAgcGF0aC51bnNoaWZ0KHoua2V5KVxuICAgIHogPSB6LnVwXG4gIH1cbiAgcmV0dXJuIHBhdGhcbn1cbiJdfQ==
