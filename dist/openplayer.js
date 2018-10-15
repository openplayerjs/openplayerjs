(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["OpenPlayer"] = factory();
	else
		root["OpenPlayer"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 51);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(3);
var core = __webpack_require__(6);
var hide = __webpack_require__(16);
var redefine = __webpack_require__(21);
var ctx = __webpack_require__(18);
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if (target) redefine(target, key, out, type & $export.U);
    // export
    if (exports[key] != out) hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var store = __webpack_require__(42)('wks');
var uid = __webpack_require__(27);
var Symbol = __webpack_require__(3).Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),
/* 3 */
/***/ (function(module, exports) {

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var fails = __webpack_require__(7);

module.exports = function (method, arg) {
  return !!method && fails(function () {
    // eslint-disable-next-line no-useless-call
    arg ? method.call(null, function () { /* empty */ }, 1) : method.call(null);
  });
};


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

function getAbsoluteUrl(url) {
  var a;

  if (!a) {
    a = document.createElement('a');
  }

  a.href = url;
  return a.href;
}

exports.getAbsoluteUrl = getAbsoluteUrl;

function isVideo(element) {
  return element.tagName.toLowerCase() === 'video';
}

exports.isVideo = isVideo;

function isAudio(element) {
  return element.tagName.toLowerCase() === 'audio';
}

exports.isAudio = isAudio;

function loadScript(url) {
  return new Promise(function (resolve, reject) {
    var script = document.createElement('script');
    script.src = url;
    script.async = true;

    script.onload = function () {
      script.remove();
      resolve();
    };

    script.onerror = function () {
      script.remove();
      reject();
    };

    document.head.appendChild(script);
  });
}

exports.loadScript = loadScript;

function request(url, dataType, success, error) {
  var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
  var type;

  switch (dataType) {
    case 'text':
      type = 'text/plain';
      break;

    case 'json':
      type = 'application/json, text/javascript';
      break;

    case 'html':
      type = 'text/html';
      break;

    case 'xml':
      type = 'application/xml, text/xml';
      break;

    default:
      type = 'application/x-www-form-urlencoded; charset=UTF-8';
      break;
  }

  var completed = false;
  var accept = type !== 'application/x-www-form-urlencoded' ? "".concat(type, ", */*; q=0.01") : '*/'.concat('*');

  if (xhr) {
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Accept', accept);

    xhr.onreadystatechange = function () {
      if (completed) {
        return;
      }

      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          completed = true;
          var data;

          switch (dataType) {
            case 'json':
              data = JSON.parse(xhr.responseText);
              break;

            case 'xml':
              data = xhr.responseXML;
              break;

            default:
              data = xhr.responseText;
              break;
          }

          success(data);
        } else if (typeof error === 'function') {
          error(xhr.status);
        }
      }
    };

    xhr.send();
  }
}

exports.request = request;

function hasClass(target, className) {
  return !!(target.className.split(' ').indexOf(className) > -1);
}

exports.hasClass = hasClass;

function offset(el) {
  var rect = el.getBoundingClientRect();
  return {
    left: rect.left + (window.pageXOffset || document.documentElement.scrollLeft),
    top: rect.top + (window.pageYOffset || document.documentElement.scrollTop)
  };
}

exports.offset = offset;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

var core = module.exports = { version: '2.5.7' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.13 ToObject(argument)
var defined = __webpack_require__(37);
module.exports = function (it) {
  return Object(defined(it));
};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

// most Object methods by ES6 should accept primitives
var $export = __webpack_require__(0);
var core = __webpack_require__(6);
var fails = __webpack_require__(7);
module.exports = function (KEY, exec) {
  var fn = (core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
};


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(11);
var IE8_DOM_DEFINE = __webpack_require__(54);
var toPrimitive = __webpack_require__(39);
var dP = Object.defineProperty;

exports.f = __webpack_require__(12) ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(2);
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

// Thank's IE8 for his funny defineProperty
module.exports = !__webpack_require__(7)(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = __webpack_require__(29);
var defined = __webpack_require__(37);
module.exports = function (it) {
  return IObject(defined(it));
};


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.15 ToLength
var toInteger = __webpack_require__(32);
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

function addEvent(event, details) {
  if (typeof event !== 'string') {
    throw new Error('Event name must be a string');
  }

  return new CustomEvent(event, {
    detail: details
  });
}

exports.addEvent = addEvent;
exports.events = ['loadstart', 'durationchange', 'loadedmetadata', 'loadeddata', 'progress', 'canplay', 'canplaythrough', 'suspend', 'abort', 'error', 'emptied', 'stalled', 'play', 'playing', 'pause', 'waiting', 'seeking', 'seeked', 'timeupdate', 'ended', 'ratechange', 'volumechange'];

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(10);
var createDesc = __webpack_require__(26);
module.exports = __webpack_require__(12) ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),
/* 17 */
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

// optional / simple context binding
var aFunction = __webpack_require__(22);
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx = __webpack_require__(18);
var IObject = __webpack_require__(29);
var toObject = __webpack_require__(8);
var toLength = __webpack_require__(14);
var asc = __webpack_require__(83);
module.exports = function (TYPE, $create) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  var create = $create || asc;
  return function ($this, callbackfn, that) {
    var O = toObject($this);
    var self = IObject(O);
    var f = ctx(callbackfn, that, 3);
    var length = toLength(self.length);
    var index = 0;
    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var val, res;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      val = self[index];
      res = f(val, index, O);
      if (TYPE) {
        if (IS_MAP) result[index] = res;   // map
        else if (res) switch (TYPE) {
          case 3: return true;             // some
          case 5: return val;              // find
          case 6: return index;            // findIndex
          case 2: result.push(val);        // filter
        } else if (IS_EVERY) return false; // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NAV = window.navigator;
exports.UA = exports.NAV.userAgent.toLowerCase();
exports.IS_IPAD = /ipad/i.test(exports.UA) && !window.MSStream;
exports.IS_IPHONE = /iphone/i.test(exports.UA) && !window.MSStream;
exports.IS_IPOD = /ipod/i.test(exports.UA) && !window.MSStream;
exports.IS_IOS = /ipad|iphone|ipod/i.test(exports.UA) && !window.MSStream;
exports.IS_ANDROID = /android/i.test(exports.UA);
exports.IS_IE = /(trident|microsoft)/i.test(exports.NAV.appName);
exports.IS_EDGE = 'msLaunchUri' in exports.NAV && !('documentMode' in document);
exports.IS_CHROME = /chrome/i.test(exports.UA);
exports.IS_FIREFOX = /firefox/i.test(exports.UA);
exports.IS_SAFARI = /safari/i.test(exports.UA) && !exports.IS_CHROME;
exports.IS_STOCK_ANDROID = /^mozilla\/\d+\.\d+\s\(linux;\su;/i.test(exports.UA);
exports.HAS_MSE = 'MediaSource' in window;

exports.SUPPORTS_HLS = function () {
  var mediaSource = window.MediaSource || window.WebKitMediaSource;
  var sourceBuffer = window.SourceBuffer || window.WebKitSourceBuffer;
  var isTypeSupported = mediaSource && typeof mediaSource.isTypeSupported === 'function' && mediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');
  var sourceBufferValidAPI = !sourceBuffer || sourceBuffer.prototype && typeof sourceBuffer.prototype.appendBuffer === 'function' && typeof sourceBuffer.prototype.remove === 'function';
  return !!isTypeSupported && !!sourceBufferValidAPI && !exports.IS_SAFARI;
};

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(3);
var hide = __webpack_require__(16);
var has = __webpack_require__(17);
var SRC = __webpack_require__(27)('src');
var TO_STRING = 'toString';
var $toString = Function[TO_STRING];
var TPL = ('' + $toString).split(TO_STRING);

__webpack_require__(6).inspectSource = function (it) {
  return $toString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) has(val, 'name') || hide(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if (O === global) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    hide(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});


/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = __webpack_require__(56);
var enumBugKeys = __webpack_require__(43);

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};


/***/ }),
/* 24 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),
/* 25 */
/***/ (function(module, exports) {

module.exports = false;


/***/ }),
/* 26 */
/***/ (function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),
/* 27 */
/***/ (function(module, exports) {

var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};


/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = {};


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = __webpack_require__(24);
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = __webpack_require__(1)('unscopables');
var ArrayProto = Array.prototype;
if (ArrayProto[UNSCOPABLES] == undefined) __webpack_require__(16)(ArrayProto, UNSCOPABLES, {});
module.exports = function (key) {
  ArrayProto[UNSCOPABLES][key] = true;
};


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

function getExtension(url) {
  if (typeof url !== 'string') {
    throw new Error('`url` argument must be a string');
  }

  var baseUrl = url.split('?')[0];
  var baseName = baseUrl.split('\\').pop().split('/').pop();
  return baseName.indexOf('.') > -1 ? baseName.substring(baseName.lastIndexOf('.') + 1) : '';
}

exports.getExtension = getExtension;

function isHlsSource(url) {
  return /\.m3u8/i.test(url);
}

exports.isHlsSource = isHlsSource;

function isDashSource(url) {
  return /\.mpd/i.test(url);
}

exports.isDashSource = isDashSource;

function predictType(url) {
  var extension = getExtension(url);
  var type;

  if (!extension) {
    return 'video/mp4';
  }

  switch (extension) {
    case 'm3u8':
      type = 'application/x-mpegURL';
      break;

    case 'mpd':
      type = 'application/dash+xml';
      break;

    case 'mp3':
      type = 'audio/mp3';
      break;

    case 'webm':
      type = 'video/webm';
      break;

    default:
      type = 'video/mp4';
      break;
  }

  return type;
}

exports.predictType = predictType;

function isAutoplaySupported(autoplay, muted, callback) {
  var videoContent = document.createElement('video');
  videoContent.src = 'https://platform.galio.nl/op/media/xsmall.mp4';
  var playPromise = videoContent.play();

  if (playPromise !== undefined) {
    playPromise.then(function () {
      videoContent.pause();
      autoplay(true);
      muted(false);
      callback();
    }).catch(function () {
      videoContent.volume = 0;
      videoContent.muted = true;
      videoContent.play().then(function () {
        videoContent.pause();
        autoplay(true);
        muted(true);
        callback();
      }).catch(function () {
        videoContent.volume = 1;
        videoContent.muted = false;
        autoplay(false);
        muted(false);
        callback();
      });
    });
  } else {
    autoplay(!videoContent.paused || 'Promise' in window && playPromise instanceof Promise);
    videoContent.pause();
    muted(false);
    callback();
  }
}

exports.isAutoplaySupported = isAutoplaySupported;

/***/ }),
/* 32 */
/***/ (function(module, exports) {

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(32);
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

var def = __webpack_require__(10).f;
var has = __webpack_require__(17);
var TAG = __webpack_require__(1)('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

var META = __webpack_require__(27)('meta');
var isObject = __webpack_require__(2);
var has = __webpack_require__(17);
var setDesc = __webpack_require__(10).f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !__webpack_require__(7)(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};


/***/ }),
/* 36 */
/***/ (function(module, exports) {

exports.f = {}.propertyIsEnumerable;


/***/ }),
/* 37 */
/***/ (function(module, exports) {

// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(2);
var document = __webpack_require__(3).document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = __webpack_require__(2);
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = __webpack_require__(11);
var dPs = __webpack_require__(55);
var enumBugKeys = __webpack_require__(43);
var IE_PROTO = __webpack_require__(41)('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = __webpack_require__(38)('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  __webpack_require__(44).appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

var shared = __webpack_require__(42)('keys');
var uid = __webpack_require__(27);
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

var core = __webpack_require__(6);
var global = __webpack_require__(3);
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: __webpack_require__(25) ? 'pure' : 'global',
  copyright: '© 2018 Denis Pushkarev (zloirock.ru)'
});


/***/ }),
/* 43 */
/***/ (function(module, exports) {

// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

var document = __webpack_require__(3).document;
module.exports = document && document.documentElement;


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

// 7.2.2 IsArray(argument)
var cof = __webpack_require__(24);
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = __webpack_require__(24);
var TAG = __webpack_require__(1)('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};


/***/ }),
/* 47 */
/***/ (function(module, exports) {

exports.f = Object.getOwnPropertySymbols;


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

var pIE = __webpack_require__(36);
var createDesc = __webpack_require__(26);
var toIObject = __webpack_require__(13);
var toPrimitive = __webpack_require__(39);
var has = __webpack_require__(17);
var IE8_DOM_DEFINE = __webpack_require__(54);
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = __webpack_require__(12) ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

function formatTime(seconds, frameRate) {
  var f = Math.floor(seconds % 1 * (frameRate || 0));
  var s = Math.floor(seconds);
  var m = Math.floor(s / 60);
  var h = Math.floor(m / 60);

  var wrap = function wrap(value) {
    return value < 10 ? "0".concat(value) : value;
  };

  m = m % 60;
  s = s % 60;
  return "".concat(h > 0 ? "".concat(wrap(h), ":") : '').concat(wrap(m), ":").concat(wrap(s)).concat(f ? ":".concat(wrap(f)) : '');
}

exports.formatTime = formatTime;

function timeToSeconds(timecode) {
  var time = timecode.replace(/;/g, ':').split(':');
  var seconds = parseFloat(time[0]) * 60 * 60;
  seconds += parseFloat(time[1]) * 60;
  seconds += parseFloat(time[2]);
  return seconds;
}

exports.timeToSeconds = timeToSeconds;

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Native = function () {
  function Native(element, media) {
    _classCallCheck(this, Native);

    this.element = element;
    this.media = media;
    this.promise = new Promise(function (resolve) {
      resolve();
    });
  }

  _createClass(Native, [{
    key: "play",
    value: function play() {
      this.element.play();
    }
  }, {
    key: "pause",
    value: function pause() {
      this.element.pause();
    }
  }, {
    key: "volume",
    set: function set(value) {
      this.element.volume = value;
    },
    get: function get() {
      return this.element.volume;
    }
  }, {
    key: "muted",
    set: function set(value) {
      this.element.muted = value;
    },
    get: function get() {
      return this.element.muted;
    }
  }, {
    key: "playbackRate",
    set: function set(value) {
      this.element.playbackRate = value;
    },
    get: function get() {
      return this.element.playbackRate;
    }
  }, {
    key: "currentTime",
    set: function set(value) {
      this.element.currentTime = value;
    },
    get: function get() {
      return this.element.currentTime;
    }
  }, {
    key: "duration",
    get: function get() {
      return this.element.duration;
    }
  }, {
    key: "paused",
    get: function get() {
      return this.element.paused;
    }
  }, {
    key: "ended",
    get: function get() {
      return this.element.ended;
    }
  }]);

  return Native;
}();

exports.default = Native;

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", {
  value: true
});

__webpack_require__(73);

__webpack_require__(101);

__webpack_require__(124);

__webpack_require__(136);

var deepmerge_1 = __webpack_require__(137);

__webpack_require__(138);

__webpack_require__(139);

var controls_1 = __webpack_require__(140);

var media_1 = __webpack_require__(148);

var ads_1 = __webpack_require__(152);

var constants_1 = __webpack_require__(20);

var events_1 = __webpack_require__(15);

var general_1 = __webpack_require__(5);

var media_2 = __webpack_require__(31);

var Player = function () {
  function Player(element, ads, fill, options) {
    _classCallCheck(this, Player);

    this.events = {};
    this.autoplay = false;
    this.defaultOptions = {
      labels: {
        captions: 'CC/Subtitles',
        click: 'Click to unmute',
        fullscreen: 'Fullscreen',
        lang: {
          en: 'English'
        },
        live: 'Live Broadcast',
        mute: 'Mute',
        off: 'Off',
        pause: 'Pause',
        play: 'Play',
        progressRail: 'Time Rail',
        progressSlider: 'Time Slider',
        settings: 'Player Settings',
        speed: 'Speed',
        speedNormal: 'Normal',
        tap: 'Tap to unmute',
        toggleCaptions: 'Toggle Captions',
        unmute: 'Unmute',
        volume: 'Volume',
        volumeControl: 'Volume Control',
        volumeSlider: 'Volume Slider'
      },
      step: 0
    };
    this.element = element instanceof HTMLMediaElement ? element : document.getElementById(element);

    if (this.element) {
      this.ads = ads;
      this.fill = fill;
      this.autoplay = this.element.autoplay || false;
      this.volume = this.element.volume;
      this.options = deepmerge_1.default(this.defaultOptions, options || {});
      this.element.autoplay = false;
    }

    return this;
  }

  _createClass(Player, [{
    key: "init",
    value: function init() {
      if (this._isValid()) {
        this._wrapInstance();

        this._prepareMedia();

        this._createPlayButton();

        this._createUID();

        this._createControls();

        this._setEvents();

        this._autoplay();

        Player.instances[this.id] = this;
      }
    }
  }, {
    key: "load",
    value: function load() {
      if (this.isMedia()) {
        this.media.load();
      }
    }
  }, {
    key: "play",
    value: function play() {
      if (this.adsInstance) {
        this.adsInstance.play();
      } else {
        this.media.play();
      }
    }
  }, {
    key: "pause",
    value: function pause() {
      if (this.adsInstance) {
        this.adsInstance.pause();
      } else {
        this.media.pause();
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this = this;

      if (this.adsInstance) {
        this.adsInstance.pause();
        this.adsInstance.destroy();
      }

      var el = this.element;
      this.media.destroy();
      Object.keys(this.events).forEach(function (event) {
        el.removeEventListener(event, _this.events[event]);
      });
      this.controls.destroy();

      if (general_1.isVideo(this.element)) {
        this.playBtn.remove();
        this.loader.remove();
      }

      el.controls = true;
      el.removeAttribute('op-live');
      var parent = el.parentElement;
      parent.parentNode.replaceChild(el, parent);
      var e = events_1.addEvent('playerdestroyed');
      el.dispatchEvent(e);
    }
  }, {
    key: "getContainer",
    value: function getContainer() {
      return this.element.parentElement;
    }
  }, {
    key: "getControls",
    value: function getControls() {
      return this.controls;
    }
  }, {
    key: "getElement",
    value: function getElement() {
      return this.element;
    }
  }, {
    key: "getEvents",
    value: function getEvents() {
      return this.events;
    }
  }, {
    key: "getOptions",
    value: function getOptions() {
      return this.options;
    }
  }, {
    key: "activeElement",
    value: function activeElement() {
      return this.adsInstance && this.adsInstance.adsStarted ? this.adsInstance : this.media;
    }
  }, {
    key: "isMedia",
    value: function isMedia() {
      return this.activeElement() instanceof media_1.default;
    }
  }, {
    key: "isAd",
    value: function isAd() {
      return this.activeElement() instanceof ads_1.default;
    }
  }, {
    key: "getMedia",
    value: function getMedia() {
      return this.media;
    }
  }, {
    key: "getAd",
    value: function getAd() {
      return this.adsInstance;
    }
  }, {
    key: "addCaptions",
    value: function addCaptions(args) {
      if (args.default) {
        var tracks = this.element.querySelectorAll('tracks');

        for (var i = 0, total = tracks.length; i < total; i++) {
          tracks[i].default = false;
        }
      }

      var el = this.element;
      var track = document.createElement('track');
      track.srclang = args.srclang;
      track.src = args.src;
      track.kind = args.kind;
      track.label = args.label;
      track.default = args.default || null;
      this.element.appendChild(track);
      var e = events_1.addEvent('controlschanged');
      el.dispatchEvent(e);
    }
  }, {
    key: "_isValid",
    value: function _isValid() {
      var el = this.element;

      if (el instanceof HTMLElement === false) {
        return false;
      }

      if (!general_1.isAudio(el) && !general_1.isVideo(el)) {
        return false;
      }

      if (!el.classList.contains('op-player__media')) {
        return false;
      }

      return true;
    }
  }, {
    key: "_wrapInstance",
    value: function _wrapInstance() {
      var wrapper = document.createElement('div');
      wrapper.className = 'op-player op-player__keyboard--inactive';
      wrapper.className += general_1.isAudio(this.element) ? ' op-player__audio' : ' op-player__video';
      wrapper.tabIndex = 0;
      this.element.classList.remove('op-player');
      this.element.parentElement.insertBefore(wrapper, this.element);
      wrapper.appendChild(this.element);
      wrapper.addEventListener('keydown', function () {
        if (wrapper.classList.contains('op-player__keyboard--inactive')) {
          wrapper.classList.remove('op-player__keyboard--inactive');
        }
      });
      wrapper.addEventListener('click', function () {
        if (!wrapper.classList.contains('op-player__keyboard--inactive')) {
          wrapper.classList.add('op-player__keyboard--inactive');
        }
      });

      if (this.fill) {
        this._fill();
      }
    }
  }, {
    key: "_createControls",
    value: function _createControls() {
      if (constants_1.IS_IPHONE && general_1.isVideo(this.element)) {
        this.getContainer().classList.add('op-player__ios--iphone');
      }

      this.controls = new controls_1.default(this);
      this.controls.create();
    }
  }, {
    key: "_prepareMedia",
    value: function _prepareMedia() {
      try {
        this.media = new media_1.default(this.element, this.options, this.autoplay, Player.customMedia);
        this.media.load();

        if (this.ads) {
          var adsOptions = this.options && this.options.ads ? this.options.ads : undefined;
          var labels = this.options.labels;
          this.adsInstance = new ads_1.default(this.media, this.ads, labels, this.autoplay, adsOptions);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, {
    key: "_createUID",
    value: function _createUID() {
      if (this.element.id) {
        this.uid = this.element.id;
        this.element.removeAttribute('id');
      } else {
        var uid;

        do {
          uid = "om_".concat(Math.random().toString(36).substr(2, 9));
        } while (Player.instances[uid] !== undefined);

        this.uid = uid;
      }

      this.element.parentElement.id = this.uid;
    }
  }, {
    key: "_createPlayButton",
    value: function _createPlayButton() {
      var _this2 = this;

      if (general_1.isAudio(this.element)) {
        return;
      }

      this.playBtn = document.createElement('button');
      this.playBtn.className = 'op-player__play';
      this.playBtn.tabIndex = 0;
      this.playBtn.title = this.options.labels.play;
      this.playBtn.innerHTML = "<span>".concat(this.options.labels.play, "</span>");
      this.playBtn.setAttribute('aria-pressed', 'false');
      this.playBtn.setAttribute('aria-hidden', 'false');
      this.loader = document.createElement('span');
      this.loader.className = 'op-player__loader';
      this.loader.tabIndex = -1;
      this.loader.setAttribute('aria-hidden', 'true');
      this.element.parentElement.insertBefore(this.loader, this.element);
      this.element.parentElement.insertBefore(this.playBtn, this.element);
      this.playBtn.addEventListener('click', function () {
        if (_this2.adsInstance) {
          _this2.adsInstance.playRequested = true;
        }

        _this2.activeElement().play();
      });
    }
  }, {
    key: "_setEvents",
    value: function _setEvents() {
      var _this3 = this;

      if (general_1.isVideo(this.element)) {
        this.events.loadedmetadata = function () {
          var el = _this3.activeElement();

          if (el.paused) {
            _this3.playBtn.classList.remove('op-player__play--paused');

            _this3.playBtn.setAttribute('aria-pressed', 'false');

            _this3.playBtn.setAttribute('aria-hidden', 'false');
          }
        };

        this.events.waiting = function () {
          _this3.playBtn.setAttribute('aria-hidden', 'true');

          _this3.loader.setAttribute('aria-hidden', 'true');
        };

        this.events.seeking = function () {
          var el = _this3.activeElement();

          _this3.playBtn.setAttribute('aria-hidden', 'true');

          _this3.loader.setAttribute('aria-hidden', el instanceof media_1.default ? 'false' : 'true');
        };

        this.events.seeked = function () {
          var el = _this3.activeElement();

          _this3.playBtn.setAttribute('aria-hidden', el instanceof media_1.default ? 'false' : 'true');

          _this3.loader.setAttribute('aria-hidden', 'true');
        };

        this.events.play = function () {
          _this3.playBtn.classList.add('op-player__play--paused');

          setTimeout(function () {
            _this3.playBtn.setAttribute('aria-hidden', 'true');

            _this3.loader.setAttribute('aria-hidden', 'true');
          }, 350);
        };

        this.events.playing = function () {
          _this3.playBtn.setAttribute('aria-hidden', 'true');
        };

        this.events.pause = function () {
          _this3.playBtn.classList.remove('op-player__play--paused');

          _this3.loader.setAttribute('aria-hidden', 'true');

          var el = _this3.activeElement();

          _this3.playBtn.setAttribute('aria-hidden', el instanceof media_1.default ? 'false' : 'true');
        };
      }

      Object.keys(this.events).forEach(function (event) {
        _this3.element.addEventListener(event, _this3.events[event]);
      });

      this.events.keydown = function (e) {
        var el = _this3.activeElement();

        var isAd = el instanceof ads_1.default;
        var key = e.which || e.keyCode || 0;
        var newStep = _this3.options.step ? _this3.options.step : el.duration * 0.05;
        var step = el.duration !== Infinity ? newStep : 0;

        switch (key) {
          case 13:
          case 32:
            if (el.paused) {
              el.play();
            } else {
              el.pause();
            }

            break;

          case 36:
            if (!isAd) {
              el.currentTime = 0;
            }

            break;

          case 37:
          case 39:
            if (!isAd && el.duration !== Infinity) {
              el.currentTime += key === 37 ? step * -1 : step;

              if (el.currentTime < 0) {
                el.currentTime = 0;
              } else if (el.currentTime >= el.duration) {
                el.currentTime = el.duration;
              }
            }

            break;

          case 38:
          case 40:
            var newVol = key === 38 ? Math.min(el.volume + 0.1, 1) : Math.max(el.volume - 0.1, 0);
            el.volume = newVol;
            el.muted = !(newVol > 0);
            break;

          case 35:
            if (!isAd) {
              el.currentTime = el.duration;
            }

            break;

          case 70:
            if (!e.ctrlKey && typeof _this3.controls.fullscreen.fullScreenEnabled !== 'undefined') {
              _this3.controls.fullscreen.toggleFullscreen();
            }

            break;

          default:
            return true;
        }

        e.preventDefault();
      };

      this.getContainer().addEventListener('keydown', this.events.keydown);
    }
  }, {
    key: "_autoplay",
    value: function _autoplay() {
      var _this4 = this;

      if (this.autoplay) {
        this.autoplay = false;
        media_2.isAutoplaySupported(function (autoplay) {
          _this4.canAutoplay = autoplay;
        }, function (muted) {
          _this4.canAutoplayMuted = muted;
        }, function () {
          if (_this4.canAutoplayMuted) {
            _this4.activeElement().muted = true;
            _this4.activeElement().volume = 0;
            var e = events_1.addEvent('volumechange');

            _this4.element.dispatchEvent(e);

            var volumeEl = document.createElement('div');
            var action = constants_1.IS_IOS || constants_1.IS_ANDROID ? _this4.options.labels.tap : _this4.options.labels.click;
            volumeEl.className = 'op-player__unmute';
            volumeEl.innerHTML = "<span>".concat(action, "</span>");
            volumeEl.addEventListener('click', function () {
              _this4.activeElement().muted = false;
              _this4.activeElement().volume = _this4.volume;
              var event = events_1.addEvent('volumechange');

              _this4.element.dispatchEvent(event);

              volumeEl.remove();
            });

            var target = _this4.getContainer();

            target.insertBefore(volumeEl, target.firstChild);
          }

          if (!_this4.adsInstance && (_this4.canAutoplay || _this4.canAutoplayMuted)) {
            _this4.play();
          }
        });
      }
    }
  }, {
    key: "_fill",
    value: function _fill() {
      if (!general_1.isAudio(this.element) && !constants_1.IS_IPHONE) {
        this.getContainer().classList.add('op-player__full');
      }
    }
  }, {
    key: "src",
    set: function set(media) {
      if (this.media instanceof media_1.default) {
        this.media.mediaFiles = [];
        this.media.src = media;
      }
    },
    get: function get() {
      return this.media.src;
    }
  }, {
    key: "id",
    get: function get() {
      return this.uid;
    }
  }], [{
    key: "init",
    value: function init() {
      Player.instances = {};
      var targets = document.querySelectorAll('video.op-player, audio.op-player');

      for (var i = 0, total = targets.length; i < total; i++) {
        var target = targets[i];
        var player = new Player(target, target.getAttribute('data-op-ads'), !!target.getAttribute('data-op-fill'), JSON.parse(target.getAttribute('data-op-options')));
        player.init();
      }
    }
  }, {
    key: "addMedia",
    value: function addMedia(name, mimeType, valid, media) {
      Player.customMedia.media[mimeType] = media;
      Player.customMedia.optionsKey[mimeType] = name;
      Player.customMedia.rules.push(valid);
    }
  }]);

  return Player;
}();

Player.instances = {};
Player.customMedia = {
  media: {},
  optionsKey: {},
  rules: []
};
exports.default = Player;
window.OpenPlayer = Player;
Player.init();

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $at = __webpack_require__(74)(true);

// 21.1.3.27 String.prototype[@@iterator]()
__webpack_require__(53)(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var LIBRARY = __webpack_require__(25);
var $export = __webpack_require__(0);
var redefine = __webpack_require__(21);
var hide = __webpack_require__(16);
var Iterators = __webpack_require__(28);
var $iterCreate = __webpack_require__(75);
var setToStringTag = __webpack_require__(34);
var getPrototypeOf = __webpack_require__(58);
var ITERATOR = __webpack_require__(1)('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = !__webpack_require__(12) && !__webpack_require__(7)(function () {
  return Object.defineProperty(__webpack_require__(38)('div'), 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(10);
var anObject = __webpack_require__(11);
var getKeys = __webpack_require__(23);

module.exports = __webpack_require__(12) ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(17);
var toIObject = __webpack_require__(13);
var arrayIndexOf = __webpack_require__(57)(false);
var IE_PROTO = __webpack_require__(41)('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

// false -> Array#indexOf
// true  -> Array#includes
var toIObject = __webpack_require__(13);
var toLength = __webpack_require__(14);
var toAbsoluteIndex = __webpack_require__(33);
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = __webpack_require__(17);
var toObject = __webpack_require__(8);
var IE_PROTO = __webpack_require__(41)('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

// call something on iterator step with safe closing on error
var anObject = __webpack_require__(11);
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};


/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

// check on default Array iterator
var Iterators = __webpack_require__(28);
var ITERATOR = __webpack_require__(1)('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $defineProperty = __webpack_require__(10);
var createDesc = __webpack_require__(26);

module.exports = function (object, index, value) {
  if (index in object) $defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

var classof = __webpack_require__(46);
var ITERATOR = __webpack_require__(1)('iterator');
var Iterators = __webpack_require__(28);
module.exports = __webpack_require__(6).getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

var ITERATOR = __webpack_require__(1)('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};


/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

var aFunction = __webpack_require__(22);
var toObject = __webpack_require__(8);
var IObject = __webpack_require__(29);
var toLength = __webpack_require__(14);

module.exports = function (that, callbackfn, aLen, memo, isRight) {
  aFunction(callbackfn);
  var O = toObject(that);
  var self = IObject(O);
  var length = toLength(O.length);
  var index = isRight ? length - 1 : 0;
  var i = isRight ? -1 : 1;
  if (aLen < 2) for (;;) {
    if (index in self) {
      memo = self[index];
      index += i;
      break;
    }
    index += i;
    if (isRight ? index < 0 : length <= index) {
      throw TypeError('Reduce of empty array with no initial value');
    }
  }
  for (;isRight ? index >= 0 : length > index; index += i) if (index in self) {
    memo = callbackfn(memo, self[index], index, O);
  }
  return memo;
};


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var global = __webpack_require__(3);
var dP = __webpack_require__(10);
var DESCRIPTORS = __webpack_require__(12);
var SPECIES = __webpack_require__(1)('species');

module.exports = function (KEY) {
  var C = global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};


/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var addToUnscopables = __webpack_require__(30);
var step = __webpack_require__(100);
var Iterators = __webpack_require__(28);
var toIObject = __webpack_require__(13);

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = __webpack_require__(53)(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');


/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

exports.f = __webpack_require__(1);


/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = __webpack_require__(13);
var gOPN = __webpack_require__(69).f;
var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};


/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = __webpack_require__(56);
var hiddenKeys = __webpack_require__(43).concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 19.1.3.6 Object.prototype.toString()
var classof = __webpack_require__(46);
var test = {};
test[__webpack_require__(1)('toStringTag')] = 'z';
if (test + '' != '[object z]') {
  __webpack_require__(21)(Object.prototype, 'toString', function toString() {
    return '[object ' + classof(this) + ']';
  }, true);
}


/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

var ctx = __webpack_require__(18);
var invoke = __webpack_require__(130);
var html = __webpack_require__(44);
var cel = __webpack_require__(38);
var global = __webpack_require__(3);
var process = global.process;
var setTask = global.setImmediate;
var clearTask = global.clearImmediate;
var MessageChannel = global.MessageChannel;
var Dispatch = global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;
var run = function () {
  var id = +this;
  // eslint-disable-next-line no-prototype-builtins
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function (event) {
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!setTask || !clearTask) {
  setTask = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (__webpack_require__(24)(process) == 'process') {
    defer = function (id) {
      process.nextTick(ctx(run, id, 1));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if (MessageChannel) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
    defer = function (id) {
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in cel('script')) {
    defer = function (id) {
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set: setTask,
  clear: clearTask
};


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 25.4.1.5 NewPromiseCapability(C)
var aFunction = __webpack_require__(22);

function PromiseCapability(C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject = aFunction(reject);
}

module.exports.f = function (C) {
  return new PromiseCapability(C);
};


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(52);
__webpack_require__(76);
__webpack_require__(77);
__webpack_require__(78);
__webpack_require__(79);
__webpack_require__(80);
__webpack_require__(81);
__webpack_require__(82);
__webpack_require__(85);
__webpack_require__(86);
__webpack_require__(87);
__webpack_require__(88);
__webpack_require__(89);
__webpack_require__(90);
__webpack_require__(91);
__webpack_require__(92);
__webpack_require__(93);
__webpack_require__(95);
__webpack_require__(97);
__webpack_require__(98);
__webpack_require__(99);
__webpack_require__(66);
module.exports = __webpack_require__(6).Array;


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(32);
var defined = __webpack_require__(37);
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};


/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var create = __webpack_require__(40);
var descriptor = __webpack_require__(26);
var setToStringTag = __webpack_require__(34);
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
__webpack_require__(16)(IteratorPrototype, __webpack_require__(1)('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};


/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
var $export = __webpack_require__(0);

$export($export.S, 'Array', { isArray: __webpack_require__(45) });


/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ctx = __webpack_require__(18);
var $export = __webpack_require__(0);
var toObject = __webpack_require__(8);
var call = __webpack_require__(59);
var isArrayIter = __webpack_require__(60);
var toLength = __webpack_require__(14);
var createProperty = __webpack_require__(61);
var getIterFn = __webpack_require__(62);

$export($export.S + $export.F * !__webpack_require__(63)(function (iter) { Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
    var O = toObject(arrayLike);
    var C = typeof this == 'function' ? this : Array;
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var index = 0;
    var iterFn = getIterFn(O);
    var length, result, step, iterator;
    if (mapping) mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
      for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for (result = new C(length); length > index; index++) {
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});


/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $export = __webpack_require__(0);
var createProperty = __webpack_require__(61);

// WebKit Array.of isn't generic
$export($export.S + $export.F * __webpack_require__(7)(function () {
  function F() { /* empty */ }
  return !(Array.of.call(F) instanceof F);
}), 'Array', {
  // 22.1.2.3 Array.of( ...items)
  of: function of(/* ...args */) {
    var index = 0;
    var aLen = arguments.length;
    var result = new (typeof this == 'function' ? this : Array)(aLen);
    while (aLen > index) createProperty(result, index, arguments[index++]);
    result.length = aLen;
    return result;
  }
});


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 22.1.3.13 Array.prototype.join(separator)
var $export = __webpack_require__(0);
var toIObject = __webpack_require__(13);
var arrayJoin = [].join;

// fallback for not array-like strings
$export($export.P + $export.F * (__webpack_require__(29) != Object || !__webpack_require__(4)(arrayJoin)), 'Array', {
  join: function join(separator) {
    return arrayJoin.call(toIObject(this), separator === undefined ? ',' : separator);
  }
});


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $export = __webpack_require__(0);
var html = __webpack_require__(44);
var cof = __webpack_require__(24);
var toAbsoluteIndex = __webpack_require__(33);
var toLength = __webpack_require__(14);
var arraySlice = [].slice;

// fallback for not array-like ES3 strings and DOM objects
$export($export.P + $export.F * __webpack_require__(7)(function () {
  if (html) arraySlice.call(html);
}), 'Array', {
  slice: function slice(begin, end) {
    var len = toLength(this.length);
    var klass = cof(this);
    end = end === undefined ? len : end;
    if (klass == 'Array') return arraySlice.call(this, begin, end);
    var start = toAbsoluteIndex(begin, len);
    var upTo = toAbsoluteIndex(end, len);
    var size = toLength(upTo - start);
    var cloned = new Array(size);
    var i = 0;
    for (; i < size; i++) cloned[i] = klass == 'String'
      ? this.charAt(start + i)
      : this[start + i];
    return cloned;
  }
});


/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $export = __webpack_require__(0);
var aFunction = __webpack_require__(22);
var toObject = __webpack_require__(8);
var fails = __webpack_require__(7);
var $sort = [].sort;
var test = [1, 2, 3];

$export($export.P + $export.F * (fails(function () {
  // IE8-
  test.sort(undefined);
}) || !fails(function () {
  // V8 bug
  test.sort(null);
  // Old WebKit
}) || !__webpack_require__(4)($sort)), 'Array', {
  // 22.1.3.25 Array.prototype.sort(comparefn)
  sort: function sort(comparefn) {
    return comparefn === undefined
      ? $sort.call(toObject(this))
      : $sort.call(toObject(this), aFunction(comparefn));
  }
});


/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $export = __webpack_require__(0);
var $forEach = __webpack_require__(19)(0);
var STRICT = __webpack_require__(4)([].forEach, true);

$export($export.P + $export.F * !STRICT, 'Array', {
  // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
  forEach: function forEach(callbackfn /* , thisArg */) {
    return $forEach(this, callbackfn, arguments[1]);
  }
});


/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = __webpack_require__(84);

module.exports = function (original, length) {
  return new (speciesConstructor(original))(length);
};


/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(2);
var isArray = __webpack_require__(45);
var SPECIES = __webpack_require__(1)('species');

module.exports = function (original) {
  var C;
  if (isArray(original)) {
    C = original.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
    if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return C === undefined ? Array : C;
};


/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $export = __webpack_require__(0);
var $map = __webpack_require__(19)(1);

$export($export.P + $export.F * !__webpack_require__(4)([].map, true), 'Array', {
  // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
  map: function map(callbackfn /* , thisArg */) {
    return $map(this, callbackfn, arguments[1]);
  }
});


/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $export = __webpack_require__(0);
var $filter = __webpack_require__(19)(2);

$export($export.P + $export.F * !__webpack_require__(4)([].filter, true), 'Array', {
  // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
  filter: function filter(callbackfn /* , thisArg */) {
    return $filter(this, callbackfn, arguments[1]);
  }
});


/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $export = __webpack_require__(0);
var $some = __webpack_require__(19)(3);

$export($export.P + $export.F * !__webpack_require__(4)([].some, true), 'Array', {
  // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
  some: function some(callbackfn /* , thisArg */) {
    return $some(this, callbackfn, arguments[1]);
  }
});


/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $export = __webpack_require__(0);
var $every = __webpack_require__(19)(4);

$export($export.P + $export.F * !__webpack_require__(4)([].every, true), 'Array', {
  // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
  every: function every(callbackfn /* , thisArg */) {
    return $every(this, callbackfn, arguments[1]);
  }
});


/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $export = __webpack_require__(0);
var $reduce = __webpack_require__(64);

$export($export.P + $export.F * !__webpack_require__(4)([].reduce, true), 'Array', {
  // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
  reduce: function reduce(callbackfn /* , initialValue */) {
    return $reduce(this, callbackfn, arguments.length, arguments[1], false);
  }
});


/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $export = __webpack_require__(0);
var $reduce = __webpack_require__(64);

$export($export.P + $export.F * !__webpack_require__(4)([].reduceRight, true), 'Array', {
  // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
  reduceRight: function reduceRight(callbackfn /* , initialValue */) {
    return $reduce(this, callbackfn, arguments.length, arguments[1], true);
  }
});


/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $export = __webpack_require__(0);
var $indexOf = __webpack_require__(57)(false);
var $native = [].indexOf;
var NEGATIVE_ZERO = !!$native && 1 / [1].indexOf(1, -0) < 0;

$export($export.P + $export.F * (NEGATIVE_ZERO || !__webpack_require__(4)($native)), 'Array', {
  // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
  indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
    return NEGATIVE_ZERO
      // convert -0 to +0
      ? $native.apply(this, arguments) || 0
      : $indexOf(this, searchElement, arguments[1]);
  }
});


/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $export = __webpack_require__(0);
var toIObject = __webpack_require__(13);
var toInteger = __webpack_require__(32);
var toLength = __webpack_require__(14);
var $native = [].lastIndexOf;
var NEGATIVE_ZERO = !!$native && 1 / [1].lastIndexOf(1, -0) < 0;

$export($export.P + $export.F * (NEGATIVE_ZERO || !__webpack_require__(4)($native)), 'Array', {
  // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
  lastIndexOf: function lastIndexOf(searchElement /* , fromIndex = @[*-1] */) {
    // convert -0 to +0
    if (NEGATIVE_ZERO) return $native.apply(this, arguments) || 0;
    var O = toIObject(this);
    var length = toLength(O.length);
    var index = length - 1;
    if (arguments.length > 1) index = Math.min(index, toInteger(arguments[1]));
    if (index < 0) index = length + index;
    for (;index >= 0; index--) if (index in O) if (O[index] === searchElement) return index || 0;
    return -1;
  }
});


/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

// 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
var $export = __webpack_require__(0);

$export($export.P, 'Array', { copyWithin: __webpack_require__(94) });

__webpack_require__(30)('copyWithin');


/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)

var toObject = __webpack_require__(8);
var toAbsoluteIndex = __webpack_require__(33);
var toLength = __webpack_require__(14);

module.exports = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
  var O = toObject(this);
  var len = toLength(O.length);
  var to = toAbsoluteIndex(target, len);
  var from = toAbsoluteIndex(start, len);
  var end = arguments.length > 2 ? arguments[2] : undefined;
  var count = Math.min((end === undefined ? len : toAbsoluteIndex(end, len)) - from, len - to);
  var inc = 1;
  if (from < to && to < from + count) {
    inc = -1;
    from += count - 1;
    to += count - 1;
  }
  while (count-- > 0) {
    if (from in O) O[to] = O[from];
    else delete O[to];
    to += inc;
    from += inc;
  } return O;
};


/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

// 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
var $export = __webpack_require__(0);

$export($export.P, 'Array', { fill: __webpack_require__(96) });

__webpack_require__(30)('fill');


/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)

var toObject = __webpack_require__(8);
var toAbsoluteIndex = __webpack_require__(33);
var toLength = __webpack_require__(14);
module.exports = function fill(value /* , start = 0, end = @length */) {
  var O = toObject(this);
  var length = toLength(O.length);
  var aLen = arguments.length;
  var index = toAbsoluteIndex(aLen > 1 ? arguments[1] : undefined, length);
  var end = aLen > 2 ? arguments[2] : undefined;
  var endPos = end === undefined ? length : toAbsoluteIndex(end, length);
  while (endPos > index) O[index++] = value;
  return O;
};


/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
var $export = __webpack_require__(0);
var $find = __webpack_require__(19)(5);
var KEY = 'find';
var forced = true;
// Shouldn't skip holes
if (KEY in []) Array(1)[KEY](function () { forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  find: function find(callbackfn /* , that = undefined */) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
__webpack_require__(30)(KEY);


/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
var $export = __webpack_require__(0);
var $find = __webpack_require__(19)(6);
var KEY = 'findIndex';
var forced = true;
// Shouldn't skip holes
if (KEY in []) Array(1)[KEY](function () { forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  findIndex: function findIndex(callbackfn /* , that = undefined */) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
__webpack_require__(30)(KEY);


/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(65)('Array');


/***/ }),
/* 100 */
/***/ (function(module, exports) {

module.exports = function (done, value) {
  return { value: value, done: !!done };
};


/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(102);
__webpack_require__(105);
__webpack_require__(106);
__webpack_require__(107);
__webpack_require__(108);
__webpack_require__(109);
__webpack_require__(110);
__webpack_require__(111);
__webpack_require__(112);
__webpack_require__(113);
__webpack_require__(114);
__webpack_require__(115);
__webpack_require__(116);
__webpack_require__(117);
__webpack_require__(118);
__webpack_require__(120);
__webpack_require__(122);
__webpack_require__(70);

module.exports = __webpack_require__(6).Object;


/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// ECMAScript 6 symbols shim
var global = __webpack_require__(3);
var has = __webpack_require__(17);
var DESCRIPTORS = __webpack_require__(12);
var $export = __webpack_require__(0);
var redefine = __webpack_require__(21);
var META = __webpack_require__(35).KEY;
var $fails = __webpack_require__(7);
var shared = __webpack_require__(42);
var setToStringTag = __webpack_require__(34);
var uid = __webpack_require__(27);
var wks = __webpack_require__(1);
var wksExt = __webpack_require__(67);
var wksDefine = __webpack_require__(103);
var enumKeys = __webpack_require__(104);
var isArray = __webpack_require__(45);
var anObject = __webpack_require__(11);
var isObject = __webpack_require__(2);
var toIObject = __webpack_require__(13);
var toPrimitive = __webpack_require__(39);
var createDesc = __webpack_require__(26);
var _create = __webpack_require__(40);
var gOPNExt = __webpack_require__(68);
var $GOPD = __webpack_require__(48);
var $DP = __webpack_require__(10);
var $keys = __webpack_require__(23);
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function';
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP({}, 'a', {
    get: function () { return dP(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP(it, key, D);
  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, { enumerable: createDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  __webpack_require__(69).f = gOPNExt.f = $getOwnPropertyNames;
  __webpack_require__(36).f = $propertyIsEnumerable;
  __webpack_require__(47).f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !__webpack_require__(25)) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    $replacer = replacer = args[1];
    if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    if (!isArray(replacer)) replacer = function (key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(16)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);


/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(3);
var core = __webpack_require__(6);
var LIBRARY = __webpack_require__(25);
var wksExt = __webpack_require__(67);
var defineProperty = __webpack_require__(10).f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};


/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

// all enumerable object keys, includes symbols
var getKeys = __webpack_require__(23);
var gOPS = __webpack_require__(47);
var pIE = __webpack_require__(36);
module.exports = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};


/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(0);
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', { create: __webpack_require__(40) });


/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(0);
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !__webpack_require__(12), 'Object', { defineProperty: __webpack_require__(10).f });


/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(0);
// 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
$export($export.S + $export.F * !__webpack_require__(12), 'Object', { defineProperties: __webpack_require__(55) });


/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject = __webpack_require__(13);
var $getOwnPropertyDescriptor = __webpack_require__(48).f;

__webpack_require__(9)('getOwnPropertyDescriptor', function () {
  return function getOwnPropertyDescriptor(it, key) {
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});


/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.9 Object.getPrototypeOf(O)
var toObject = __webpack_require__(8);
var $getPrototypeOf = __webpack_require__(58);

__webpack_require__(9)('getPrototypeOf', function () {
  return function getPrototypeOf(it) {
    return $getPrototypeOf(toObject(it));
  };
});


/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.14 Object.keys(O)
var toObject = __webpack_require__(8);
var $keys = __webpack_require__(23);

__webpack_require__(9)('keys', function () {
  return function keys(it) {
    return $keys(toObject(it));
  };
});


/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.7 Object.getOwnPropertyNames(O)
__webpack_require__(9)('getOwnPropertyNames', function () {
  return __webpack_require__(68).f;
});


/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.5 Object.freeze(O)
var isObject = __webpack_require__(2);
var meta = __webpack_require__(35).onFreeze;

__webpack_require__(9)('freeze', function ($freeze) {
  return function freeze(it) {
    return $freeze && isObject(it) ? $freeze(meta(it)) : it;
  };
});


/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.17 Object.seal(O)
var isObject = __webpack_require__(2);
var meta = __webpack_require__(35).onFreeze;

__webpack_require__(9)('seal', function ($seal) {
  return function seal(it) {
    return $seal && isObject(it) ? $seal(meta(it)) : it;
  };
});


/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.15 Object.preventExtensions(O)
var isObject = __webpack_require__(2);
var meta = __webpack_require__(35).onFreeze;

__webpack_require__(9)('preventExtensions', function ($preventExtensions) {
  return function preventExtensions(it) {
    return $preventExtensions && isObject(it) ? $preventExtensions(meta(it)) : it;
  };
});


/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.12 Object.isFrozen(O)
var isObject = __webpack_require__(2);

__webpack_require__(9)('isFrozen', function ($isFrozen) {
  return function isFrozen(it) {
    return isObject(it) ? $isFrozen ? $isFrozen(it) : false : true;
  };
});


/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.13 Object.isSealed(O)
var isObject = __webpack_require__(2);

__webpack_require__(9)('isSealed', function ($isSealed) {
  return function isSealed(it) {
    return isObject(it) ? $isSealed ? $isSealed(it) : false : true;
  };
});


/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.11 Object.isExtensible(O)
var isObject = __webpack_require__(2);

__webpack_require__(9)('isExtensible', function ($isExtensible) {
  return function isExtensible(it) {
    return isObject(it) ? $isExtensible ? $isExtensible(it) : true : false;
  };
});


/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.3.1 Object.assign(target, source)
var $export = __webpack_require__(0);

$export($export.S + $export.F, 'Object', { assign: __webpack_require__(119) });


/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 19.1.2.1 Object.assign(target, source, ...)
var getKeys = __webpack_require__(23);
var gOPS = __webpack_require__(47);
var pIE = __webpack_require__(36);
var toObject = __webpack_require__(8);
var IObject = __webpack_require__(29);
var $assign = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || __webpack_require__(7)(function () {
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var S = Symbol();
  var K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function (k) { B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject(target);
  var aLen = arguments.length;
  var index = 1;
  var getSymbols = gOPS.f;
  var isEnum = pIE.f;
  while (aLen > index) {
    var S = IObject(arguments[index++]);
    var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
  } return T;
} : $assign;


/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.3.10 Object.is(value1, value2)
var $export = __webpack_require__(0);
$export($export.S, 'Object', { is: __webpack_require__(121) });


/***/ }),
/* 121 */
/***/ (function(module, exports) {

// 7.2.9 SameValue(x, y)
module.exports = Object.is || function is(x, y) {
  // eslint-disable-next-line no-self-compare
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};


/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = __webpack_require__(0);
$export($export.S, 'Object', { setPrototypeOf: __webpack_require__(123).set });


/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = __webpack_require__(2);
var anObject = __webpack_require__(11);
var check = function (O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function (test, buggy, set) {
      try {
        set = __webpack_require__(18)(Function.call, __webpack_require__(48).f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) { buggy = true; }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy) O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};


/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(70);
__webpack_require__(52);
__webpack_require__(125);
__webpack_require__(126);
module.exports = __webpack_require__(6).Promise;


/***/ }),
/* 125 */
/***/ (function(module, exports, __webpack_require__) {

var $iterators = __webpack_require__(66);
var getKeys = __webpack_require__(23);
var redefine = __webpack_require__(21);
var global = __webpack_require__(3);
var hide = __webpack_require__(16);
var Iterators = __webpack_require__(28);
var wks = __webpack_require__(1);
var ITERATOR = wks('iterator');
var TO_STRING_TAG = wks('toStringTag');
var ArrayValues = Iterators.Array;

var DOMIterables = {
  CSSRuleList: true, // TODO: Not spec compliant, should be false.
  CSSStyleDeclaration: false,
  CSSValueList: false,
  ClientRectList: false,
  DOMRectList: false,
  DOMStringList: false,
  DOMTokenList: true,
  DataTransferItemList: false,
  FileList: false,
  HTMLAllCollection: false,
  HTMLCollection: false,
  HTMLFormElement: false,
  HTMLSelectElement: false,
  MediaList: true, // TODO: Not spec compliant, should be false.
  MimeTypeArray: false,
  NamedNodeMap: false,
  NodeList: true,
  PaintRequestList: false,
  Plugin: false,
  PluginArray: false,
  SVGLengthList: false,
  SVGNumberList: false,
  SVGPathSegList: false,
  SVGPointList: false,
  SVGStringList: false,
  SVGTransformList: false,
  SourceBufferList: false,
  StyleSheetList: true, // TODO: Not spec compliant, should be false.
  TextTrackCueList: false,
  TextTrackList: false,
  TouchList: false
};

for (var collections = getKeys(DOMIterables), i = 0; i < collections.length; i++) {
  var NAME = collections[i];
  var explicit = DOMIterables[NAME];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  var key;
  if (proto) {
    if (!proto[ITERATOR]) hide(proto, ITERATOR, ArrayValues);
    if (!proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
    Iterators[NAME] = ArrayValues;
    if (explicit) for (key in $iterators) if (!proto[key]) redefine(proto, key, $iterators[key], true);
  }
}


/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var LIBRARY = __webpack_require__(25);
var global = __webpack_require__(3);
var ctx = __webpack_require__(18);
var classof = __webpack_require__(46);
var $export = __webpack_require__(0);
var isObject = __webpack_require__(2);
var aFunction = __webpack_require__(22);
var anInstance = __webpack_require__(127);
var forOf = __webpack_require__(128);
var speciesConstructor = __webpack_require__(129);
var task = __webpack_require__(71).set;
var microtask = __webpack_require__(131)();
var newPromiseCapabilityModule = __webpack_require__(72);
var perform = __webpack_require__(132);
var userAgent = __webpack_require__(133);
var promiseResolve = __webpack_require__(134);
var PROMISE = 'Promise';
var TypeError = global.TypeError;
var process = global.process;
var versions = process && process.versions;
var v8 = versions && versions.v8 || '';
var $Promise = global[PROMISE];
var isNode = classof(process) == 'process';
var empty = function () { /* empty */ };
var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
var newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f;

var USE_NATIVE = !!function () {
  try {
    // correct subclassing with @@species support
    var promise = $Promise.resolve(1);
    var FakePromise = (promise.constructor = {})[__webpack_require__(1)('species')] = function (exec) {
      exec(empty, empty);
    };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function')
      && promise.then(empty) instanceof FakePromise
      // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
      // we can't detect it synchronously, so just check versions
      && v8.indexOf('6.6') !== 0
      && userAgent.indexOf('Chrome/66') === -1;
  } catch (e) { /* empty */ }
}();

// helpers
var isThenable = function (it) {
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var notify = function (promise, isReject) {
  if (promise._n) return;
  promise._n = true;
  var chain = promise._c;
  microtask(function () {
    var value = promise._v;
    var ok = promise._s == 1;
    var i = 0;
    var run = function (reaction) {
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;
      try {
        if (handler) {
          if (!ok) {
            if (promise._h == 2) onHandleUnhandled(promise);
            promise._h = 1;
          }
          if (handler === true) result = value;
          else {
            if (domain) domain.enter();
            result = handler(value); // may throw
            if (domain) {
              domain.exit();
              exited = true;
            }
          }
          if (result === reaction.promise) {
            reject(TypeError('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (e) {
        if (domain && !exited) domain.exit();
        reject(e);
      }
    };
    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if (isReject && !promise._h) onUnhandled(promise);
  });
};
var onUnhandled = function (promise) {
  task.call(global, function () {
    var value = promise._v;
    var unhandled = isUnhandled(promise);
    var result, handler, console;
    if (unhandled) {
      result = perform(function () {
        if (isNode) {
          process.emit('unhandledRejection', value, promise);
        } else if (handler = global.onunhandledrejection) {
          handler({ promise: promise, reason: value });
        } else if ((console = global.console) && console.error) {
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if (unhandled && result.e) throw result.v;
  });
};
var isUnhandled = function (promise) {
  return promise._h !== 1 && (promise._a || promise._c).length === 0;
};
var onHandleUnhandled = function (promise) {
  task.call(global, function () {
    var handler;
    if (isNode) {
      process.emit('rejectionHandled', promise);
    } else if (handler = global.onrejectionhandled) {
      handler({ promise: promise, reason: promise._v });
    }
  });
};
var $reject = function (value) {
  var promise = this;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if (!promise._a) promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function (value) {
  var promise = this;
  var then;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if (promise === value) throw TypeError("Promise can't be resolved itself");
    if (then = isThenable(value)) {
      microtask(function () {
        var wrapper = { _w: promise, _d: false }; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch (e) {
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch (e) {
    $reject.call({ _w: promise, _d: false }, e); // wrap
  }
};

// constructor polyfill
if (!USE_NATIVE) {
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor) {
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch (err) {
      $reject.call(this, err);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal = function Promise(executor) {
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = __webpack_require__(135)($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected) {
      var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if (this._a) this._a.push(reaction);
      if (this._s) notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject = ctx($reject, promise, 1);
  };
  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
    return C === $Promise || C === Wrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Promise: $Promise });
__webpack_require__(34)($Promise, PROMISE);
__webpack_require__(65)(PROMISE);
Wrapper = __webpack_require__(6)[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    var $$reject = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x) {
    return promiseResolve(LIBRARY && this === Wrapper ? $Promise : this, x);
  }
});
$export($export.S + $export.F * !(USE_NATIVE && __webpack_require__(63)(function (iter) {
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var values = [];
      var index = 0;
      var remaining = 1;
      forOf(iterable, false, function (promise) {
        var $index = index++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.e) reject(result.v);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = perform(function () {
      forOf(iterable, false, function (promise) {
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if (result.e) reject(result.v);
    return capability.promise;
  }
});


/***/ }),
/* 127 */
/***/ (function(module, exports) {

module.exports = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};


/***/ }),
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

var ctx = __webpack_require__(18);
var call = __webpack_require__(59);
var isArrayIter = __webpack_require__(60);
var anObject = __webpack_require__(11);
var toLength = __webpack_require__(14);
var getIterFn = __webpack_require__(62);
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
  var f = ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = call(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;


/***/ }),
/* 129 */
/***/ (function(module, exports, __webpack_require__) {

// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject = __webpack_require__(11);
var aFunction = __webpack_require__(22);
var SPECIES = __webpack_require__(1)('species');
module.exports = function (O, D) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};


/***/ }),
/* 130 */
/***/ (function(module, exports) {

// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function (fn, args, that) {
  var un = that === undefined;
  switch (args.length) {
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return fn.apply(that, args);
};


/***/ }),
/* 131 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(3);
var macrotask = __webpack_require__(71).set;
var Observer = global.MutationObserver || global.WebKitMutationObserver;
var process = global.process;
var Promise = global.Promise;
var isNode = __webpack_require__(24)(process) == 'process';

module.exports = function () {
  var head, last, notify;

  var flush = function () {
    var parent, fn;
    if (isNode && (parent = process.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (e) {
        if (head) notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // Node.js
  if (isNode) {
    notify = function () {
      process.nextTick(flush);
    };
  // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
  } else if (Observer && !(global.navigator && global.navigator.standalone)) {
    var toggle = true;
    var node = document.createTextNode('');
    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
    notify = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (Promise && Promise.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    var promise = Promise.resolve(undefined);
    notify = function () {
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function (fn) {
    var task = { fn: fn, next: undefined };
    if (last) last.next = task;
    if (!head) {
      head = task;
      notify();
    } last = task;
  };
};


/***/ }),
/* 132 */
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return { e: false, v: exec() };
  } catch (e) {
    return { e: true, v: e };
  }
};


/***/ }),
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(3);
var navigator = global.navigator;

module.exports = navigator && navigator.userAgent || '';


/***/ }),
/* 134 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(11);
var isObject = __webpack_require__(2);
var newPromiseCapability = __webpack_require__(72);

module.exports = function (C, x) {
  anObject(C);
  if (isObject(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};


/***/ }),
/* 135 */
/***/ (function(module, exports, __webpack_require__) {

var redefine = __webpack_require__(21);
module.exports = function (target, src, safe) {
  for (var key in src) redefine(target, key, src[key], safe);
  return target;
};


/***/ }),
/* 136 */
/***/ (function(module, exports) {

// Polyfill for creating CustomEvents on IE9/10/11

// code pulled from:
// https://github.com/d4tocchini/customevent-polyfill
// https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent#Polyfill

(function() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    var ce = new window.CustomEvent('test', { cancelable: true });
    ce.preventDefault();
    if (ce.defaultPrevented !== true) {
      // IE has problems with .preventDefault() on custom events
      // http://stackoverflow.com/questions/23349191
      throw new Error('Could not prevent default');
    }
  } catch (e) {
    var CustomEvent = function(event, params) {
      var evt, origPrevent;
      params = params || {
        bubbles: false,
        cancelable: false,
        detail: undefined
      };

      evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(
        event,
        params.bubbles,
        params.cancelable,
        params.detail
      );
      origPrevent = evt.preventDefault;
      evt.preventDefault = function() {
        origPrevent.call(this);
        try {
          Object.defineProperty(this, 'defaultPrevented', {
            get: function() {
              return true;
            }
          });
        } catch (e) {
          this.defaultPrevented = true;
        }
      };
      return evt;
    };

    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent; // expose definition to window
  }
})();


/***/ }),
/* 137 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var isMergeableObject = function isMergeableObject(value) {
	return isNonNullObject(value)
		&& !isSpecial(value)
};

function isNonNullObject(value) {
	return !!value && typeof value === 'object'
}

function isSpecial(value) {
	var stringValue = Object.prototype.toString.call(value);

	return stringValue === '[object RegExp]'
		|| stringValue === '[object Date]'
		|| isReactElement(value)
}

// see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

function isReactElement(value) {
	return value.$$typeof === REACT_ELEMENT_TYPE
}

function emptyTarget(val) {
	return Array.isArray(val) ? [] : {}
}

function cloneUnlessOtherwiseSpecified(value, options) {
	return (options.clone !== false && options.isMergeableObject(value))
		? deepmerge(emptyTarget(value), value, options)
		: value
}

function defaultArrayMerge(target, source, options) {
	return target.concat(source).map(function(element) {
		return cloneUnlessOtherwiseSpecified(element, options)
	})
}

function mergeObject(target, source, options) {
	var destination = {};
	if (options.isMergeableObject(target)) {
		Object.keys(target).forEach(function(key) {
			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
		});
	}
	Object.keys(source).forEach(function(key) {
		if (!options.isMergeableObject(source[key]) || !target[key]) {
			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
		} else {
			destination[key] = deepmerge(target[key], source[key], options);
		}
	});
	return destination
}

function deepmerge(target, source, options) {
	options = options || {};
	options.arrayMerge = options.arrayMerge || defaultArrayMerge;
	options.isMergeableObject = options.isMergeableObject || isMergeableObject;

	var sourceIsArray = Array.isArray(source);
	var targetIsArray = Array.isArray(target);
	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, options)
	} else if (sourceIsArray) {
		return options.arrayMerge(target, source, options)
	} else {
		return mergeObject(target, source, options)
	}
}

deepmerge.all = function deepmergeAll(array, options) {
	if (!Array.isArray(array)) {
		throw new Error('first argument should be an array')
	}

	return array.reduce(function(prev, next) {
		return deepmerge(prev, next, options)
	}, {})
};

var deepmerge_1 = deepmerge;

/* harmony default export */ __webpack_exports__["default"] = (deepmerge_1);


/***/ }),
/* 138 */
/***/ (function(module, exports) {

// element-closest | CC0-1.0 | github.com/jonathantneal/closest

(function (ElementProto) {
	if (typeof ElementProto.matches !== 'function') {
		ElementProto.matches = ElementProto.msMatchesSelector || ElementProto.mozMatchesSelector || ElementProto.webkitMatchesSelector || function matches(selector) {
			var element = this;
			var elements = (element.document || element.ownerDocument).querySelectorAll(selector);
			var index = 0;

			while (elements[index] && elements[index] !== element) {
				++index;
			}

			return Boolean(elements[index]);
		};
	}

	if (typeof ElementProto.closest !== 'function') {
		ElementProto.closest = function closest(selector) {
			var element = this;

			while (element && element.nodeType === 1) {
				if (element.matches(selector)) {
					return element;
				}

				element = element.parentNode;
			}

			return null;
		};
	}
})(window.Element.prototype);


/***/ }),
/* 139 */
/***/ (function(module, exports) {

(function (arr) {
  arr.forEach(function (item) {
    if (item.hasOwnProperty('remove')) {
      return;
    }
    Object.defineProperty(item, 'remove', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function remove() {
        this.parentNode.removeChild(this);
      }
    });
  });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);

/***/ }),
/* 140 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var captions_1 = __webpack_require__(141);

var fullscreen_1 = __webpack_require__(142);

var play_1 = __webpack_require__(143);

var progress_1 = __webpack_require__(144);

var settings_1 = __webpack_require__(145);

var time_1 = __webpack_require__(146);

var volume_1 = __webpack_require__(147);

var constants_1 = __webpack_require__(20);

var events_1 = __webpack_require__(15);

var general_1 = __webpack_require__(5);

var Controls = function () {
  function Controls(player) {
    _classCallCheck(this, Controls);

    this.events = {
      media: {},
      mouse: {}
    };
    this.player = player;

    this._setElements();

    return this;
  }

  _createClass(Controls, [{
    key: "create",
    value: function create() {
      var _this = this;

      this.player.getElement().controls = false;
      var isMediaVideo = general_1.isVideo(this.player.getElement());
      this.controls = document.createElement('div');
      this.controls.className = 'op-controls';
      this.player.getContainer().appendChild(this.controls);

      this._buildElements();

      this.events.controlschanged = function () {
        _this.destroy();

        _this._setElements();

        _this.create();
      };

      this.player.getElement().addEventListener('controlschanged', this.events.controlschanged);

      if (!constants_1.IS_ANDROID && !constants_1.IS_IOS) {
        this.events.mouse.mouseenter = function () {
          if (isMediaVideo) {
            _this._stopControlTimer();

            _this.player.getContainer().classList.remove('op-controls--hidden');

            _this._startControlTimer(2500);
          }
        };

        this.events.mouse.mousemove = function () {
          if (isMediaVideo) {
            _this.player.getContainer().classList.remove('op-controls--hidden');

            _this._startControlTimer(2500);
          }
        };

        this.events.mouse.mouseleave = function () {
          if (isMediaVideo) {
            _this._startControlTimer(1000);
          }
        };

        this.events.media.pause = function () {
          _this.player.getContainer().classList.remove('op-controls--hidden');

          _this._stopControlTimer();
        };

        Object.keys(this.events.media).forEach(function (event) {
          _this.player.getElement().addEventListener(event, _this.events.media[event]);
        });
        Object.keys(this.events.mouse).forEach(function (event) {
          _this.player.getContainer().addEventListener(event, _this.events.mouse[event]);
        });

        this._startControlTimer(3000);
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this2 = this;

      if (!constants_1.IS_ANDROID && !constants_1.IS_IOS) {
        Object.keys(this.events.mouse).forEach(function (event) {
          _this2.player.getContainer().removeEventListener(event, _this2.events.mouse[event]);
        });
        Object.keys(this.events.media).forEach(function (event) {
          _this2.player.getElement().removeEventListener(event, _this2.events.media[event]);
        });

        this._stopControlTimer();
      }

      this.player.getElement().removeEventListener('controlschanged', this.events.controlschanged);
      this.items.forEach(function (item) {
        item.destroy();
      });
      this.controls.remove();
    }
  }, {
    key: "getContainer",
    value: function getContainer() {
      return this.controls;
    }
  }, {
    key: "_startControlTimer",
    value: function _startControlTimer(time) {
      var _this3 = this;

      var el = this.player.activeElement();

      this._stopControlTimer();

      this.timer = window.setTimeout(function () {
        if ((!el.paused || !el.ended) && general_1.isVideo(_this3.player.getElement())) {
          _this3.player.getContainer().classList.add('op-controls--hidden');

          _this3._stopControlTimer();

          var event = events_1.addEvent('controlshidden');

          _this3.player.getElement().dispatchEvent(event);
        }
      }, time);
    }
  }, {
    key: "_stopControlTimer",
    value: function _stopControlTimer() {
      if (this.timer !== null) {
        clearTimeout(this.timer);
        delete this.timer;
        this.timer = null;
      }
    }
  }, {
    key: "_setElements",
    value: function _setElements() {
      this.play = new play_1.default(this.player);
      this.time = new time_1.default(this.player);
      this.progress = new progress_1.default(this.player);
      this.volume = new volume_1.default(this.player);
      this.captions = new captions_1.default(this.player);
      this.settings = new settings_1.default(this.player);
      this.items = [this.play, this.time, this.progress, this.volume, this.captions, this.settings];

      if (general_1.isVideo(this.player.getElement())) {
        this.fullscreen = new fullscreen_1.default(this.player);
        this.items.push(this.fullscreen);
      }
    }
  }, {
    key: "_buildElements",
    value: function _buildElements() {
      var _this4 = this;

      this.items.forEach(function (item) {
        item.create();
      });
      this.items.forEach(function (item) {
        if (typeof item.addSettings === 'function') {
          var menuItem = item.addSettings();

          if (Object.keys(menuItem).length) {
            _this4.settings.addItem(menuItem.name, menuItem.key, menuItem.default, menuItem.subitems, menuItem.className);
          }
        }
      });
      var e = events_1.addEvent('controlschanged');
      this.controls.dispatchEvent(e);
    }
  }]);

  return Controls;
}();

exports.default = Controls;

/***/ }),
/* 141 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var events_1 = __webpack_require__(15);

var general_1 = __webpack_require__(5);

var time_1 = __webpack_require__(49);

var Captions = function () {
  function Captions(player) {
    _classCallCheck(this, Captions);

    this.events = {
      button: {},
      global: {},
      media: {}
    };
    this.tracks = {};
    this.trackUrlList = {};
    this.player = player;
    this.labels = player.getOptions().labels;
    this.trackList = this.player.getElement().textTracks;
    this.hasTracks = !!this.trackList.length;
    return this;
  }

  _createClass(Captions, [{
    key: "create",
    value: function create() {
      var _this = this;

      if (!this.hasTracks) {
        return;
      }

      this.button = document.createElement('button');
      this.button.className = 'op-controls__captions op-control__right';
      this.button.tabIndex = 0;
      this.button.title = this.labels.toggleCaptions;
      this.button.setAttribute('aria-controls', this.player.id);
      this.button.setAttribute('aria-pressed', 'false');
      this.button.setAttribute('aria-label', this.labels.toggleCaptions);
      this.button.setAttribute('data-active-captions', 'off');
      this.button.innerHTML = "<span class=\"op-sr\">".concat(this.labels.toggleCaptions, "</span>");

      var _loop = function _loop(i, tracks, total) {
        var element = tracks[i];

        if (element.kind === 'subtitles') {
          if (element.default) {
            _this.default = element.srclang;

            _this.button.setAttribute('data-active-captions', element.srclang);
          }

          var trackUrl = general_1.getAbsoluteUrl(element.src);

          if (_this.trackList[i].language === element.srclang) {
            if (_this.trackList[i].cues && _this.trackList[i].cues.length) {
              _this.tracks[element.srclang] = _this._getNativeCues(_this.trackList[i]);

              _this._prepareTrack(i, element.srclang, trackUrl, element.default || false);
            } else {
              general_1.request(trackUrl, 'text', function (d) {
                _this.tracks[element.srclang] = _this._getCuesFromText(d);

                _this._prepareTrack(i, element.srclang, trackUrl, element.default || false);
              }, function () {
                delete _this.trackList[i];
                element.remove();
                var details = {
                  detail: {
                    id: element.srclang,
                    type: 'captions'
                  }
                };
                var e = events_1.addEvent('settingremoved', details);

                _this.player.getElement().dispatchEvent(e);

                setTimeout(function () {
                  var ev = events_1.addEvent('controlschanged');

                  _this.player.getElement().dispatchEvent(ev);
                }, 200);
              });
            }
          }
        }
      };

      for (var i = 0, tracks = this.player.getElement().querySelectorAll('track'), total = tracks.length; i < total; i++) {
        _loop(i, tracks, total);
      }

      this.captions = document.createElement('div');
      this.captions.className = 'op-captions';
      this.captions.innerHTML = '<span></span>';
      var container = this.captions.querySelector('span');

      this.events.media.timeupdate = function () {
        if (_this.player.isMedia()) {
          var currentCues = _this.tracks[_this.current.language];

          if (currentCues !== undefined) {
            var index = _this._search(currentCues, _this.player.getMedia().currentTime);

            container.innerHTML = '';

            if (index > -1 && general_1.hasClass(_this.button, 'op-controls__captions--on')) {
              _this.captions.classList.add('op-captions--on');

              container.innerHTML = _this._sanitize(currentCues[index].text);
            } else {
              _this._hide();
            }
          }
        } else {
          _this._hide();
        }
      };

      this.events.button.click = function (e) {
        var button = e.target;
        button.setAttribute('aria-pressed', 'true');

        if (general_1.hasClass(button, 'op-controls__captions--on')) {
          _this._hide();

          button.classList.remove('op-controls__captions--on');
        } else {
          _this._show();

          button.classList.add('op-controls__captions--on');
        }
      };

      this.button.addEventListener('click', this.events.button.click);

      if (this.hasTracks) {
        var target = this.player.getContainer();
        target.insertBefore(this.captions, target.firstChild);
        this.player.getControls().getContainer().appendChild(this.button);
      }

      if (this.trackList.length <= 1) {
        return;
      }

      this.events.global.click = function (e) {
        var option = e.target;

        if (option.closest("#".concat(_this.player.id)) && general_1.hasClass(option, 'op-subtitles__option')) {
          var language = option.getAttribute('data-value').replace('captions-', '');
          _this.current = Array.from(_this.trackList).filter(function (item) {
            return item.language === language;
          }).pop();

          _this._show();

          _this.button.setAttribute('data-active-captions', language);

          var event = events_1.addEvent('captionschanged');

          _this.player.getElement().dispatchEvent(event);
        }
      };

      if (typeof this.events.global.click !== 'undefined') {
        document.addEventListener('click', this.events.global.click);
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (typeof this.events.global.click !== 'undefined') {
        document.removeEventListener('click', this.events.global.click);
      }

      if (this.hasTracks) {
        this.button.removeEventListener('click', this.events.button.click);
        this.player.getElement().removeEventListener('timeupdate', this.events.media.timeupdate);
        this.button.remove();
        this.captions.remove();
      }
    }
  }, {
    key: "addSettings",
    value: function addSettings() {
      var _this2 = this;

      if (this.trackList.length <= 1) {
        return {};
      }

      var subitems = [{
        key: 'off',
        label: this.labels.off
      }];

      var _loop2 = function _loop2(i, total) {
        var track = _this2.trackList[i];
        subitems = subitems.filter(function (el) {
          return el.key !== track.language;
        });
        subitems.push({
          key: track.language,
          label: _this2.labels.lang[track.language] || _this2.trackList[i].label
        });
      };

      for (var i = 0, total = this.trackList.length; i < total; i++) {
        _loop2(i, total);
      }

      return subitems.length > 2 ? {
        className: 'op-subtitles__option',
        default: this.default || 'off',
        key: 'captions',
        name: this.labels.captions,
        subitems: subitems
      } : {};
    }
  }, {
    key: "_getCuesFromText",
    value: function _getCuesFromText(webvttText) {
      var lines = webvttText.split(/\r?\n/);
      var entries = [];
      var urlRegexp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
      var timePattern = '^((?:[0-9]{1,2}:)?[0-9]{2}:[0-9]{2}([,.][0-9]{1,3})?) --> ';
      timePattern += '((?:[0-9]{1,2}:)?[0-9]{2}:[0-9]{2}([,.][0-9]{3})?)(.*?)$';
      var regexp = new RegExp(timePattern);
      var identifier;

      function isJson(item) {
        item = typeof item !== 'string' ? JSON.stringify(item) : item;

        try {
          item = JSON.parse(item);
        } catch (e) {
          return false;
        }

        if (_typeof(item) === 'object' && item !== null) {
          return true;
        }

        return false;
      }

      for (var i = 0, total = lines.length; i < total; i++) {
        var timecode = regexp.exec(lines[i]);

        if (timecode && i < lines.length) {
          if (i - 1 >= 0 && lines[i - 1] !== '') {
            identifier = lines[i - 1];
          }

          i++;
          var cue = lines[i];
          i++;

          while (lines[i] !== '' && i < lines.length) {
            cue = "".concat(cue, "\n").concat(lines[i]);
            i++;
          }

          cue = cue.trim().replace(urlRegexp, "<a href='$1' target='_blank'>$1</a>");
          var initTime = time_1.timeToSeconds(timecode[1]);
          entries.push({
            endTime: time_1.timeToSeconds(timecode[3]),
            identifier: identifier,
            settings: isJson(timecode[5]) ? JSON.parse(timecode[5]) : {},
            startTime: initTime === 0 ? 0.200 : initTime,
            text: cue
          });
        }

        identifier = '';
      }

      return entries;
    }
  }, {
    key: "_getNativeCues",
    value: function _getNativeCues(track) {
      var cues = [];
      Object.keys(track.cues).forEach(function (index) {
        var j = parseInt(index, 10);
        var current = track.cues[j];
        cues.push({
          endTime: current.endTime,
          identifier: current.id,
          settings: {},
          startTime: current.startTime,
          text: current.text
        });
      });
      return cues;
    }
  }, {
    key: "_show",
    value: function _show() {
      if (!this.captions || !this.current || this.current.cues === undefined) {
        return;
      }

      var container = this.captions.querySelector('span');
      container.innerHTML = '';
      this.player.getElement().addEventListener('timeupdate', this.events.media.timeupdate);
    }
  }, {
    key: "_hide",
    value: function _hide() {
      this.captions.classList.remove('op-captions--on');
      this.button.setAttribute('data-active-captions', 'none');
    }
  }, {
    key: "_search",
    value: function _search(tracks, currentTime) {
      var low = 0;
      var high = tracks.length - 1;

      while (low <= high) {
        var mid = low + high >> 1;
        var start = tracks[mid].startTime;
        var stop = tracks[mid].endTime;

        if (currentTime >= start && currentTime < stop) {
          return mid;
        } else if (start < currentTime) {
          low = mid + 1;
        } else if (start > currentTime) {
          high = mid - 1;
        }
      }

      return -1;
    }
  }, {
    key: "_sanitize",
    value: function _sanitize(html) {
      var div = document.createElement('div');
      div.innerHTML = html;
      var scripts = div.getElementsByTagName('script');
      var i = scripts.length;

      while (i--) {
        scripts[i].remove();
      }

      var allElements = div.getElementsByTagName('*');

      for (var index = 0, n = allElements.length; index < n; index++) {
        var attributesObj = allElements[index].attributes;
        var attributes = Array.prototype.slice.call(attributesObj);

        for (var j = 0, total = attributes.length; j < total; j++) {
          if (/^(on|javascript:)/.test(attributes[j].name)) {
            allElements[index].remove();
          } else if (attributes[j].name === 'style') {
            allElements[index].removeAttribute(attributes[j].name);
          }
        }
      }

      return div.innerHTML;
    }
  }, {
    key: "_prepareTrack",
    value: function _prepareTrack(index, language, trackUrl) {
      var _this3 = this;

      var defaultTrack = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      this.trackUrlList[language] = trackUrl;
      this.trackList[index].mode = 'hidden';

      if (defaultTrack) {
        this.default = language;
        this.button.classList.add('op-controls__captions--on');
        this.button.setAttribute('data-active-captions', language);
        this.current = Array.from(this.trackList).filter(function (item) {
          return item.language === _this3.default;
        }).pop();
      } else {
        this.current = this.trackList[0];
      }

      this._show();

      if (!this.player.getContainer().classList.contains('op-captions--detected')) {
        this.player.getContainer().classList.add('op-captions--detected');
      }
    }
  }]);

  return Captions;
}();

exports.default = Captions;

/***/ }),
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Fullscreen = function () {
  function Fullscreen(player) {
    _classCallCheck(this, Fullscreen);

    this.player = player;
    this.labels = player.getOptions().labels;
    this.isFullscreen = false;
    var target = document;
    this.fullScreenEnabled = !!(target.fullscreenEnabled || target.mozFullScreenEnabled || target.msFullscreenEnabled || target.webkitSupportsFullscreen || target.webkitFullscreenEnabled || document.createElement('video').webkitRequestFullScreen);
    return this;
  }

  _createClass(Fullscreen, [{
    key: "create",
    value: function create() {
      var _this = this;

      this.button = document.createElement('button');
      this.button.type = 'button';
      this.button.className = 'op-controls__fullscreen op-control__right';
      this.button.tabIndex = 0;
      this.button.title = this.labels.fullscreen;
      this.button.setAttribute('aria-controls', this.player.id);
      this.button.setAttribute('aria-pressed', 'false');
      this.button.setAttribute('aria-label', this.labels.fullscreen);
      this.button.innerHTML = "<span class=\"op-sr\">".concat(this.labels.fullscreen, "</span>");

      this.clickEvent = function () {
        _this.button.setAttribute('aria-pressed', 'true');

        _this.toggleFullscreen();
      };

      this.fullscreenEvents = ['fullscreenchange', 'mozfullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'];

      this._setFullscreenData(false);

      this.fullscreenEvents.forEach(function (event) {
        document.addEventListener(event, _this._fullscreenChange.bind(_this));
      });
      this.button.addEventListener('click', this.clickEvent.bind(this));
      this.player.getControls().getContainer().appendChild(this.button);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this2 = this;

      this.fullscreenEvents.forEach(function (event) {
        document.removeEventListener(event, _this2._fullscreenChange.bind(_this2));
      });
      this.button.removeEventListener('click', this.clickEvent.bind(this));
      this.button.remove();
    }
  }, {
    key: "toggleFullscreen",
    value: function toggleFullscreen() {
      if (this.isFullscreen) {
        var target = document;

        if (target.exitFullscreen) {
          target.exitFullscreen();
        } else if (target.mozCancelFullScreen) {
          target.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          target.webkitCancelFullScreen();
        } else if (target.msExitFullscreen) {
          target.msExitFullscreen();
        } else {
          this._fullscreenChange();
        }
      } else {
        var video = this.player.getElement();
        this.fullscreenWidth = window.screen.width;
        this.fullscreenHeight = window.screen.height;

        if (video.requestFullscreen) {
          video.parentElement.requestFullscreen();
        } else if (video.mozRequestFullScreen) {
          video.parentElement.mozRequestFullScreen();
        } else if (video.webkitRequestFullScreen) {
          video.parentElement.webkitRequestFullScreen();
        } else if (video.msRequestFullscreen) {
          video.parentElement.msRequestFullscreen();
        } else if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        } else {
          this._fullscreenChange();
        }
      }
    }
  }, {
    key: "_fullscreenChange",
    value: function _fullscreenChange() {
      var width = this.isFullscreen ? 0 : this.fullscreenWidth;
      var height = this.isFullscreen ? 0 : this.fullscreenHeight;

      this._setFullscreenData(!this.isFullscreen);

      if (this.player.isAd()) {
        this.player.getAd().resizeAds(width, height);
      }

      this.isFullscreen = !this.isFullscreen;

      this._resize(width, height);
    }
  }, {
    key: "_setFullscreenData",
    value: function _setFullscreenData(state) {
      this.player.getContainer().setAttribute('data-fullscreen', (!!state).toString());

      if (state) {
        this.button.classList.add('op-controls__fullscreen--out');
      } else {
        this.button.classList.remove('op-controls__fullscreen--out');
      }
    }
  }, {
    key: "_resize",
    value: function _resize(width, height) {
      var wrapper = this.player.getContainer();
      var video = this.player.getElement();
      wrapper.style.width = width ? '100%' : null;
      wrapper.style.height = height ? '100%' : null;
      video.style.width = width ? '100%' : null;
      video.style.height = height ? '100%' : null;
    }
  }]);

  return Fullscreen;
}();

exports.default = Fullscreen;

/***/ }),
/* 143 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var player_1 = __webpack_require__(51);

var events_1 = __webpack_require__(15);

var general_1 = __webpack_require__(5);

var Play = function () {
  function Play(player) {
    _classCallCheck(this, Play);

    this.events = {
      controls: {},
      media: {}
    };
    this.player = player;
    this.labels = this.player.getOptions().labels;
    return this;
  }

  _createClass(Play, [{
    key: "create",
    value: function create() {
      var _this = this;

      this.button = document.createElement('button');
      this.button.type = 'button';
      this.button.className = 'op-controls__playpause';
      this.button.tabIndex = 0;
      this.button.title = this.labels.play;
      this.button.setAttribute('aria-controls', this.player.id);
      this.button.setAttribute('aria-pressed', 'false');
      this.button.setAttribute('aria-label', this.labels.play);
      this.button.innerHTML = "<span class=\"op-sr\">".concat(this.labels.play, "/").concat(this.labels.pause, "</span>");
      this.player.getControls().getContainer().appendChild(this.button);

      this.events.media.click = function (e) {
        _this.button.setAttribute('aria-pressed', 'true');

        var el = _this.player.activeElement();

        if (el.paused || el.ended) {
          if (_this.player.adsInstance) {
            _this.player.adsInstance.playRequested = true;
          }

          el.play();
        } else {
          el.pause();
        }

        e.preventDefault();
      };

      this.events.media.play = function () {
        if (_this.player.activeElement().ended) {
          if (_this.player.isMedia()) {
            _this.button.classList.add('op-controls__playpause--replay');
          } else {
            _this.button.classList.add('op-controls__playpause--pause');
          }

          _this.button.title = _this.labels.play;

          _this.button.setAttribute('aria-label', _this.labels.play);
        } else {
          _this.button.classList.remove('op-controls__playpause--replay');

          _this.button.classList.add('op-controls__playpause--pause');

          _this.button.title = _this.labels.pause;

          _this.button.setAttribute('aria-label', _this.labels.pause);

          Object.keys(player_1.default.instances).forEach(function (key) {
            if (key !== _this.player.id) {
              var target = player_1.default.instances[key].activeElement();
              target.pause();
            }
          });
        }
      };

      this.events.media.loadedmetadata = function () {
        if (general_1.hasClass(_this.button, 'op-controls__playpause--pause')) {
          _this.button.classList.remove('op-controls__playpause--replay');

          _this.button.classList.remove('op-controls__playpause--pause');

          _this.button.title = _this.labels.play;

          _this.button.setAttribute('aria-label', _this.labels.play);
        }
      };

      this.events.media.playing = function () {
        if (!general_1.hasClass(_this.button, 'op-controls__playpause--pause')) {
          _this.button.classList.remove('op-controls__playpause--replay');

          _this.button.classList.add('op-controls__playpause--pause');

          _this.button.title = _this.labels.pause;

          _this.button.setAttribute('aria-label', _this.labels.pause);
        }
      };

      this.events.media.pause = function () {
        _this.button.classList.remove('op-controls__playpause--pause');

        _this.button.title = _this.labels.play;

        _this.button.setAttribute('aria-label', _this.labels.play);
      };

      this.events.media.ended = function () {
        if (_this.player.activeElement().ended && _this.player.isMedia()) {
          _this.button.classList.add('op-controls__playpause--replay');

          _this.button.classList.remove('op-controls__playpause--pause');
        } else {
          _this.button.classList.remove('op-controls__playpause--replay');

          _this.button.classList.add('op-controls__playpause--pause');
        }

        _this.button.title = _this.labels.play;

        _this.button.setAttribute('aria-label', _this.labels.play);
      };

      this.events.media['adsmediaended'] = function () {
        _this.button.classList.remove('op-controls__playpause--replay');

        _this.button.classList.add('op-controls__playpause--pause');

        _this.button.title = _this.labels.pause;

        _this.button.setAttribute('aria-label', _this.labels.pause);
      };

      var element = this.player.getElement();

      this.events.controls.controlschanged = function () {
        if (!_this.player.activeElement().paused) {
          var event = events_1.addEvent('playing');
          element.dispatchEvent(event);
        }
      };

      Object.keys(this.events.media).forEach(function (event) {
        element.addEventListener(event, _this.events.media[event]);
      });
      this.player.getControls().getContainer().addEventListener('controlschanged', this.events.controls.controlschanged);
      this.button.addEventListener('click', this.events.media.click);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this2 = this;

      Object.keys(this.events.media).forEach(function (event) {
        _this2.player.getElement().removeEventListener(event, _this2.events.media[event]);
      });
      this.player.getControls().getContainer().removeEventListener('controlschanged', this.events.controls.controlschanged);
      this.button.removeEventListener('click', this.events.media.click);
      this.button.remove();
    }
  }]);

  return Play;
}();

exports.default = Play;

/***/ }),
/* 144 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var constants_1 = __webpack_require__(20);

var general_1 = __webpack_require__(5);

var time_1 = __webpack_require__(49);

var Progress = function () {
  function Progress(player) {
    _classCallCheck(this, Progress);

    this.events = {
      container: {},
      global: {},
      media: {},
      slider: {}
    };
    this.player = player;
    this.labels = player.getOptions().labels;
    this.forcePause = false;
    return this;
  }

  _createClass(Progress, [{
    key: "create",
    value: function create() {
      var _this = this;

      this.progress = document.createElement('div');
      this.progress.className = 'op-controls__progress';
      this.progress.tabIndex = 0;
      this.progress.setAttribute('aria-label', this.labels.progressSlider);
      this.progress.setAttribute('aria-valuemin', '0');
      this.slider = document.createElement('input');
      this.slider.type = 'range';
      this.slider.className = 'op-controls__progress--seek';
      this.slider.tabIndex = -1;
      this.slider.setAttribute('min', '0');
      this.slider.setAttribute('max', '0');
      this.slider.setAttribute('step', '0.1');
      this.slider.value = '0';
      this.slider.setAttribute('aria-label', this.labels.progressRail);
      this.slider.setAttribute('role', 'slider');
      this.buffer = document.createElement('progress');
      this.buffer.className = 'op-controls__progress--buffer';
      this.buffer.setAttribute('max', '100');
      this.buffer.value = 0;
      this.played = document.createElement('progress');
      this.played.className = 'op-controls__progress--played';
      this.played.setAttribute('max', '100');
      this.played.setAttribute('role', 'presentation');
      this.played.value = 0;
      this.progress.appendChild(this.slider);
      this.progress.appendChild(this.played);
      this.progress.appendChild(this.buffer);

      if (!constants_1.IS_IOS && !constants_1.IS_ANDROID) {
        this.tooltip = document.createElement('span');
        this.tooltip.className = 'op-controls__tooltip';
        this.tooltip.tabIndex = -1;
        this.tooltip.innerHTML = '00:00';
        this.progress.appendChild(this.tooltip);
      }

      this.events.media.loadedmetadata = function () {
        var el = _this.player.activeElement();

        if (el.duration !== Infinity && !_this.player.getElement().getAttribute('op-live')) {
          _this.slider.setAttribute('max', "".concat(el.duration));

          var current = _this.player.isMedia() ? el.currentTime : el.duration - el.currentTime;
          _this.slider.value = current.toString();

          _this.progress.setAttribute('aria-valuemax', el.duration.toString());
        } else {
          _this.destroy();
        }
      };

      this.events.media.progress = function (e) {
        var el = e.target;

        if (el.duration !== Infinity && !_this.player.getElement().getAttribute('op-live')) {
          if (el.duration > 0) {
            for (var i = 0, total = el.buffered.length; i < total; i++) {
              if (el.buffered.start(el.buffered.length - 1 - i) < el.currentTime) {
                _this.buffer.value = el.buffered.end(el.buffered.length - 1 - i) / el.duration * 100;
                break;
              }
            }
          }
        }
      };

      this.events.media.pause = function () {
        var el = _this.player.activeElement();

        if (el.duration !== Infinity && !_this.player.getElement().getAttribute('op-live')) {
          var current = el.currentTime;

          _this.progress.setAttribute('aria-valuenow', current.toString());

          _this.progress.setAttribute('aria-valuetext', time_1.formatTime(current));
        }
      };

      this.events.media.play = function () {
        if (_this.player.activeElement().duration !== Infinity && !_this.player.getElement().getAttribute('op-live')) {
          _this.progress.removeAttribute('aria-valuenow');

          _this.progress.removeAttribute('aria-valuetext');
        }
      };

      this.events.media.timeupdate = function () {
        var el = _this.player.activeElement();

        if (el.duration !== Infinity && !_this.player.getElement().getAttribute('op-live')) {
          if (!_this.slider.getAttribute('max') || _this.slider.getAttribute('max') === '0' || parseFloat(_this.slider.getAttribute('max')) !== el.duration) {
            _this.slider.setAttribute('max', "".concat(el.duration));
          }

          var current = _this.player.isMedia() ? el.currentTime : el.duration - el.currentTime + 1 >= 100 ? 100 : el.duration - el.currentTime + 1;
          var min = parseFloat(_this.slider.min);
          var max = parseFloat(_this.slider.max);
          _this.slider.value = current.toString();
          _this.slider.style.backgroundSize = "".concat((current - min) * 100 / (max - min), "% 100%");
          _this.played.value = el.duration <= 0 || isNaN(el.duration) || !isFinite(el.duration) ? 0 : current / el.duration * 100;
        } else {
          _this.destroy();
        }
      };

      this.events.media.ended = function () {
        _this.slider.style.backgroundSize = '0% 100%';

        _this.slider.setAttribute('max', '0');

        _this.buffer.value = 0;
        _this.played.value = 0;
      };

      var updateSlider = function updateSlider(e) {
        if (general_1.hasClass(_this.slider, 'op-progress--pressed')) {
          return;
        }

        var target = e.target;

        _this.slider.classList.add('.op-progress--pressed');

        var el = _this.player.activeElement();

        var min = parseFloat(target.min);
        var max = parseFloat(target.max);
        var val = parseFloat(target.value);
        _this.slider.style.backgroundSize = "".concat((val - min) * 100 / (max - min), "% 100%");

        _this.slider.classList.remove('.op-progress--pressed');

        el.currentTime = val;
        e.preventDefault();
      };

      var forcePause = function forcePause(e) {
        var el = _this.player.activeElement();

        if ((e.which === 1 || e.which === 0) && _this.player.isMedia()) {
          if (!el.paused) {
            el.pause();
            _this.forcePause = true;
          }
        }
      };

      var releasePause = function releasePause() {
        var el = _this.player.activeElement();

        if (_this.forcePause === true && _this.player.isMedia()) {
          if (el.paused) {
            el.play();
            _this.forcePause = false;
          }
        }
      };

      var mobileForcePause = function mobileForcePause(e) {
        var el = _this.player.activeElement();

        if (el.duration === Infinity) {
          return true;
        }

        var x = e.originalEvent && e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0].pageX : e.pageX;
        var pos = x - general_1.offset(_this.progress).left;
        var percentage = pos / _this.progress.offsetWidth;
        var time = percentage * el.duration;
        _this.slider.value = time.toString();
        updateSlider(e);
        forcePause(e);
        e.preventDefault();
      };

      this.events.slider.input = updateSlider.bind(this);
      this.events.slider.change = updateSlider.bind(this);
      this.events.slider.mousedown = forcePause.bind(this);
      this.events.slider.mouseup = releasePause.bind(this);
      this.events.slider.touchstart = mobileForcePause.bind(this);
      this.events.slider.touchend = releasePause.bind(this);

      if (!constants_1.IS_IOS && !constants_1.IS_ANDROID) {
        this.events.container.mousemove = function (e) {
          var el = _this.player.activeElement();

          if (el.duration === Infinity || _this.player.isAd()) {
            return true;
          }

          var x = e.originalEvent && e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0].pageX : e.pageX;
          var pos = x - general_1.offset(_this.progress).left;
          var half = _this.tooltip.offsetWidth / 2;
          var percentage = pos / _this.progress.offsetWidth;
          var time = percentage * el.duration;

          var mediaContainer = _this.player.getContainer();

          var limit = mediaContainer.offsetWidth - _this.tooltip.offsetWidth;

          if (pos <= 0 || x - general_1.offset(mediaContainer).left <= half) {
            pos = 0;
          } else if (x - general_1.offset(mediaContainer).left >= limit) {
            pos = limit;
          } else {
            pos -= half;
          }

          if (percentage >= 0 && percentage <= 1) {
            _this.tooltip.classList.add('op-controls__tooltip--visible');
          } else {
            _this.tooltip.classList.remove('op-controls__tooltip--visible');
          }

          _this.tooltip.style.left = "".concat(pos, "px");
          _this.tooltip.innerHTML = isNaN(time) ? '00:00' : time_1.formatTime(time);
        };

        this.events.global.mousemove = function (e) {
          if (!e.target.closest('.op-controls__progress') || _this.player.isAd()) {
            _this.tooltip.classList.remove('op-controls__tooltip--visible');
          }
        };
      }

      Object.keys(this.events.media).forEach(function (event) {
        _this.player.getElement().addEventListener(event, _this.events.media[event]);
      });
      Object.keys(this.events.slider).forEach(function (event) {
        _this.slider.addEventListener(event, _this.events.slider[event]);
      });
      this.progress.addEventListener('keydown', this.player.getEvents().keydown);
      this.progress.addEventListener('mousemove', this.events.container.mousemove);
      document.addEventListener('mousemove', this.events.global.mousemove);
      this.player.getControls().getContainer().appendChild(this.progress);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this2 = this;

      Object.keys(this.events).forEach(function (event) {
        _this2.player.getElement().removeEventListener(event, _this2.events[event]);
      });
      Object.keys(this.events.slider).forEach(function (event) {
        _this2.slider.removeEventListener(event, _this2.events.slider[event]);
      });
      this.progress.removeEventListener('keydown', this.player.getEvents().keydown);
      this.progress.removeEventListener('mousemove', this.events.container.mousemove);
      document.removeEventListener('mousemove', this.events.global.mousemove);
      this.buffer.remove();
      this.played.remove();
      this.slider.remove();

      if (!constants_1.IS_IOS && !constants_1.IS_ANDROID) {
        this.tooltip.remove();
      }

      this.progress.remove();
    }
  }]);

  return Progress;
}();

exports.default = Progress;

/***/ }),
/* 145 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var general_1 = __webpack_require__(5);

var Settings = function () {
  function Settings(player) {
    _classCallCheck(this, Settings);

    this.submenu = {};
    this.events = {
      global: {},
      media: {}
    };
    this.player = player;
    this.labels = player.getOptions().labels;
    return this;
  }

  _createClass(Settings, [{
    key: "create",
    value: function create() {
      var _this = this;

      this.button = document.createElement('button');
      this.button.className = 'op-controls__settings op-control__right';
      this.button.tabIndex = 0;
      this.button.title = this.labels.settings;
      this.button.setAttribute('aria-controls', this.player.id);
      this.button.setAttribute('aria-pressed', 'false');
      this.button.setAttribute('aria-label', this.labels.settings);
      this.button.innerHTML = "<span class=\"op-sr\">".concat(this.labels.settings, "</span>");
      this.menu = document.createElement('div');
      this.menu.className = 'op-settings';
      this.menu.setAttribute('aria-hidden', 'true');
      this.menu.innerHTML = '<div class="op-settings__menu" role="menu"></div>';

      this.clickEvent = function () {
        _this.button.setAttribute('aria-pressed', 'true');

        _this.menu.setAttribute('aria-hidden', _this.menu.getAttribute('aria-hidden') === 'false' ? 'true' : 'false');
      };

      this.hideEvent = function () {
        var timeout;

        if (timeout) {
          window.cancelAnimationFrame(timeout);
        }

        timeout = window.requestAnimationFrame(function () {
          _this.menu.innerHTML = _this.originalOutput;

          _this.menu.setAttribute('aria-hidden', 'true');
        });
      };

      this.removeEvent = function (e) {
        var _e$detail = e.detail,
            id = _e$detail.id,
            type = _e$detail.type;

        _this.removeItem(id, type);
      };

      this.events.media.controlshidden = this.hideEvent.bind(this);
      this.events.media.settingremoved = this.removeEvent.bind(this);
      this.events.media.play = this.hideEvent.bind(this);
      this.events.media.pause = this.hideEvent.bind(this);

      this.events.global.click = function (e) {
        if (e.target.closest("#".concat(_this.player.id)) && general_1.hasClass(e.target, 'op-speed__option')) {
          _this.player.getMedia().playbackRate = parseFloat(e.target.getAttribute('data-value').replace('speed-', ''));
        }
      };

      this.events.global.resize = this.hideEvent.bind(this);
      this.button.addEventListener('click', this.clickEvent.bind(this));
      Object.keys(this.events).forEach(function (event) {
        _this.player.getElement().addEventListener(event, _this.events.media[event]);
      });
      document.addEventListener('click', this.events.global.click);
      window.addEventListener('resize', this.events.global.resize);
      this.player.getControls().getContainer().appendChild(this.button);
      this.player.getContainer().appendChild(this.menu);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this2 = this;

      this.button.removeEventListener('click', this.clickEvent.bind(this));
      Object.keys(this.events).forEach(function (event) {
        _this2.player.getElement().removeEventListener(event, _this2.events.media[event]);
      });
      document.removeEventListener('click', this.events.global.click);
      window.removeEventListener('resize', this.events.global.resize);

      if (this.events.global['settings.submenu'] !== undefined) {
        document.removeEventListener('click', this.events.global['settings.submenu']);
        this.player.getElement().removeEventListener('controlshidden', this.hideEvent);
      }

      this.menu.remove();
      this.button.remove();
      this.player.getMedia().playbackRate = 1;
    }
  }, {
    key: "addSettings",
    value: function addSettings() {
      return {
        className: 'op-speed__option',
        default: '1',
        key: 'speed',
        name: this.labels.speed,
        subitems: [{
          key: '0.25',
          label: '0.25'
        }, {
          key: '0.5',
          label: '0.5'
        }, {
          key: '0.75',
          label: '0.75'
        }, {
          key: '1',
          label: this.labels.speedNormal
        }, {
          key: '1.25',
          label: '1.25'
        }, {
          key: '1.5',
          label: '1.5'
        }, {
          key: '2',
          label: '2'
        }]
      };
    }
  }, {
    key: "addItem",
    value: function addItem(name, key, defaultValue, submenu, className) {
      var _this3 = this;

      var menuItem = document.createElement('div');
      menuItem.className = 'op-settings__menu-item';
      menuItem.tabIndex = 0;
      menuItem.setAttribute('role', 'menuitemradio');
      menuItem.innerHTML = "<div class=\"op-settings__menu-label\" data-value=\"".concat(key, "-").concat(defaultValue, "\">").concat(name, "</div>\n            <div class=\"op-settings__menu-content\">").concat(submenu.find(function (x) {
        return x.key === defaultValue;
      }).label, "</div>");
      this.menu.querySelector('.op-settings__menu').appendChild(menuItem);
      this.originalOutput = this.menu.innerHTML;

      if (submenu) {
        var subItems = "\n                <div class=\"op-settings__header\">\n                    <button type=\"button\" class=\"op-settings__back\">".concat(name, "</button>\n                </div>\n                <div class=\"op-settings__menu\" role=\"menu\" id=\"menu-item-").concat(key, "\">\n                    ").concat(submenu.map(function (item) {
          return "\n                    <div class=\"op-settings__submenu-item\" tabindex=\"0\" role=\"menuitemradio\"\n                        aria-checked=\"".concat(defaultValue === item.key ? 'true' : 'false', "\">\n                        <div class=\"op-settings__submenu-label ").concat(className || '', "\" data-value=\"").concat(key, "-").concat(item.key, "\">").concat(item.label, "</div>\n                    </div>");
        }).join(''), "\n                </div>");
        this.submenu[key] = subItems;
      }

      this.events.global['settings.submenu'] = function (e) {
        var target = e.target;

        if (target.closest("#".concat(_this3.player.id))) {
          if (general_1.hasClass(target, 'op-settings__back')) {
            _this3.menu.classList.add('op-settings--sliding');

            setTimeout(function () {
              _this3.menu.innerHTML = _this3.originalOutput;

              _this3.menu.classList.remove('op-settings--sliding');
            }, 100);
          } else if (general_1.hasClass(target, 'op-settings__menu-content')) {
            var fragments = target.parentElement.querySelector('.op-settings__menu-label').getAttribute('data-value').split('-');
            fragments.pop();
            var current = fragments.join('-');

            if (_typeof(_this3.submenu[current]) !== undefined) {
              _this3.menu.classList.add('op-settings--sliding');

              setTimeout(function () {
                _this3.menu.innerHTML = _this3.submenu[current];

                _this3.menu.classList.remove('op-settings--sliding');
              }, 100);
            }
          } else if (general_1.hasClass(target, 'op-settings__submenu-label')) {
            var _current = target.getAttribute('data-value');

            var value = _current.replace("".concat(key, "-"), '');

            var label = target.innerText;

            var menuTarget = _this3.menu.querySelector("#menu-item-".concat(key, " .op-settings__submenu-item[aria-checked=true]"));

            if (menuTarget) {
              menuTarget.setAttribute('aria-checked', 'false');
              target.parentElement.setAttribute('aria-checked', 'true');
              _this3.submenu[key] = _this3.menu.innerHTML;

              _this3.menu.classList.add('op-settings--sliding');

              setTimeout(function () {
                _this3.menu.innerHTML = _this3.originalOutput;

                var prev = _this3.menu.querySelector(".op-settings__menu-label[data-value=\"".concat(key, "-").concat(defaultValue, "\"]"));

                prev.setAttribute('data-value', "".concat(_current));
                prev.nextElementSibling.innerHTML = label;
                defaultValue = value;
                _this3.originalOutput = _this3.menu.innerHTML;

                _this3.menu.classList.remove('op-settings--sliding');
              }, 100);
            }
          }
        } else {
          _this3.hideEvent();
        }
      };

      document.addEventListener('click', this.events.global['settings.submenu']);
      this.player.getElement().addEventListener('controlshidden', this.hideEvent);
    }
  }, {
    key: "removeItem",
    value: function removeItem(id, type) {
      var minItems = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;
      var target = this.player.getElement().querySelector(".op-settings__submenu-label[data-value=".concat(type, "-").concat(id, "]"));

      if (target) {
        target.remove();
      }

      if (this.player.getElement().querySelectorAll(".op-settings__submenu-label[data-value^=".concat(type, "]")).length < minItems) {
        delete this.submenu[type];
        this.player.getElement().querySelector(".op-settings__menu-label[data-value^=".concat(type, "]")).closest('.op-settings__menu-item').remove();
      }
    }
  }]);

  return Settings;
}();

exports.default = Settings;

/***/ }),
/* 146 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var time_1 = __webpack_require__(49);

var Time = function () {
  function Time(player) {
    _classCallCheck(this, Time);

    this.events = {
      controls: {},
      media: {}
    };
    this.player = player;
    this.labels = player.getOptions().labels;
    return this;
  }

  _createClass(Time, [{
    key: "create",
    value: function create() {
      var _this = this;

      this.current = document.createElement('time');
      this.current.className = 'op-controls__current';
      this.current.setAttribute('role', 'timer');
      this.current.setAttribute('aria-live', 'off');
      this.current.setAttribute('aria-hidden', 'false');
      this.current.innerText = '0:00';
      this.delimiter = document.createElement('span');
      this.delimiter.className = 'op-controls__time-delimiter';
      this.delimiter.setAttribute('aria-hidden', 'false');
      this.delimiter.innerText = '/';
      this.duration = document.createElement('time');
      this.duration.className = 'op-controls__duration';
      this.duration.setAttribute('aria-hidden', 'false');
      this.duration.innerText = '0:00';

      var setInitialTime = function setInitialTime() {
        var el = _this.player.activeElement();

        if (el.duration !== Infinity && !_this.player.getElement().getAttribute('op-live')) {
          var duration = !isNaN(el.duration) ? el.duration : 0;
          _this.duration.innerText = time_1.formatTime(duration);
          _this.current.innerText = time_1.formatTime(el.currentTime);
        } else {
          _this.duration.setAttribute('aria-hidden', 'true');

          _this.delimiter.setAttribute('aria-hidden', 'true');
        }
      };

      this.events.media.loadedmetadata = setInitialTime.bind(this);
      this.events.controls.controlschanged = setInitialTime.bind(this);

      this.events.media.timeupdate = function () {
        var el = _this.player.activeElement();

        if (el.duration !== Infinity && !_this.player.getElement().getAttribute('op-live')) {
          var duration = time_1.formatTime(el.duration);

          if (!isNaN(el.duration) && duration !== _this.duration.innerText) {
            _this.duration.innerText = duration;

            _this.duration.setAttribute('aria-hidden', 'false');

            _this.delimiter.setAttribute('aria-hidden', 'false');
          }

          _this.current.innerText = time_1.formatTime(el.currentTime);
        } else if (_this.duration.getAttribute('aria-hidden') === 'false') {
          _this.duration.setAttribute('aria-hidden', 'true');

          _this.delimiter.setAttribute('aria-hidden', 'true');

          _this.current.innerText = _this.labels.live;
        }
      };

      this.events.media.ended = function () {
        var el = _this.player.activeElement();

        if (_this.player.isMedia() && _this.duration.innerText !== '0:00') {
          _this.duration.innerText = time_1.formatTime(el.duration);
        }
      };

      Object.keys(this.events.media).forEach(function (event) {
        _this.player.getElement().addEventListener(event, _this.events.media[event]);
      });
      this.player.getControls().getContainer().addEventListener('controlschanged', this.events.controls.controlschanged);
      var controls = this.player.getControls().getContainer();
      controls.appendChild(this.current);
      controls.appendChild(this.delimiter);
      controls.appendChild(this.duration);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this2 = this;

      Object.keys(this.events.media).forEach(function (event) {
        _this2.player.getElement().removeEventListener(event, _this2.events.media[event]);
      });
      this.player.getControls().getContainer().removeEventListener('controlschanged', this.events.controls.controlschanged);
      this.current.remove();
      this.delimiter.remove();
      this.duration.remove();
    }
  }]);

  return Time;
}();

exports.default = Time;

/***/ }),
/* 147 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var constants_1 = __webpack_require__(20);

var events_1 = __webpack_require__(15);

var general_1 = __webpack_require__(5);

var Volume = function () {
  function Volume(player) {
    _classCallCheck(this, Volume);

    this.events = {
      button: {},
      media: {},
      slider: {}
    };
    this.player = player;
    this.labels = player.getOptions().labels;
    this.volume = this.player.getMedia().volume;
    return this;
  }

  _createClass(Volume, [{
    key: "create",
    value: function create() {
      var _this = this;

      this.container = document.createElement('div');
      this.container.className = 'op-controls__volume';
      this.container.tabIndex = 0;
      this.container.setAttribute('aria-valuemin', '0');
      this.container.setAttribute('aria-valuemax', '100');
      this.container.setAttribute('aria-valuenow', "".concat(this.volume));
      this.container.setAttribute('aria-valuetext', "".concat(this.labels.volume, ": ").concat(this.volume));
      this.container.setAttribute('aria-orientation', 'vertical');
      this.container.setAttribute('aria-label', this.labels.volumeSlider);
      this.slider = document.createElement('input');
      this.slider.type = 'range';
      this.slider.className = 'op-controls__volume--input';
      this.slider.tabIndex = -1;
      this.slider.value = this.player.getMedia().volume.toString();
      this.slider.setAttribute('min', '0');
      this.slider.setAttribute('max', '1');
      this.slider.setAttribute('step', '0.1');
      this.slider.setAttribute('aria-label', this.labels.volumeControl);
      this.display = document.createElement('progress');
      this.display.className = 'op-controls__volume--display';
      this.display.setAttribute('max', '10');
      this.display.setAttribute('role', 'presentation');
      this.display.value = this.player.getMedia().volume * 10;
      this.container.appendChild(this.slider);
      this.container.appendChild(this.display);
      this.button = document.createElement('button');
      this.button.type = 'button';
      this.button.className = 'op-controls__mute';
      this.button.tabIndex = 0;
      this.button.title = this.labels.mute;
      this.button.setAttribute('aria-controls', this.player.id);
      this.button.setAttribute('aria-pressed', 'false');
      this.button.setAttribute('aria-label', this.labels.mute);
      this.button.innerHTML = "<span class=\"op-sr\">".concat(this.labels.mute, "</span>");

      var updateSlider = function updateSlider(element) {
        var mediaVolume = element.volume * 1;
        var vol = Math.floor(mediaVolume * 100);
        _this.slider.value = "".concat(element.volume);
        _this.display.value = mediaVolume * 10;

        _this.container.setAttribute('aria-valuenow', "".concat(vol));

        _this.container.setAttribute('aria-valuetext', "".concat(_this.labels.volume, ": ").concat(vol));
      };

      var updateButton = function updateButton(element) {
        var vol = element.volume;

        if (vol <= 0.5 && vol > 0) {
          _this.button.classList.remove('op-controls__mute--muted');

          _this.button.classList.add('op-controls__mute--half');
        } else if (vol === 0) {
          _this.button.classList.add('op-controls__mute--muted');

          _this.button.classList.remove('op-controls__mute--half');
        } else {
          _this.button.classList.remove('op-controls__mute--muted');

          _this.button.classList.remove('op-controls__mute--half');
        }
      };

      var updateVolume = function updateVolume(event) {
        var el = _this.player.activeElement();

        var value = parseFloat(event.target.value);
        el.volume = value;
        el.muted = el.volume === 0;
        _this.volume = value;

        if (!el.muted && _this.player.getContainer().querySelector('.op-player__unmute')) {
          _this.player.getContainer().querySelector('.op-player__unmute').remove();
        }

        var e = events_1.addEvent('volumechange');

        _this.player.getElement().dispatchEvent(e);
      };

      this.events.media.volumechange = function () {
        var el = _this.player.activeElement();

        updateSlider(el);
        updateButton(el);
      };

      this.events.media.timeupdate = function () {
        if (general_1.isAudio(_this.player.getElement()) && (_this.player.activeElement().duration === Infinity || _this.player.getElement().getAttribute('op-live'))) {
          _this.button.classList.add('op-control__right');
        }
      };

      this.events.media.loadedmetadata = function () {
        var el = _this.player.activeElement();

        if (el.muted) {
          el.volume = 0;
          el.muted = true;
          var e = events_1.addEvent('volumechange');

          _this.player.getElement().dispatchEvent(e);
        }
      };

      this.events.slider.input = updateVolume.bind(this);
      this.events.slider.change = updateVolume.bind(this);

      this.events.button.click = function () {
        _this.button.setAttribute('aria-pressed', 'true');

        var el = _this.player.activeElement();

        el.muted = !el.muted;

        if (el.muted) {
          el.volume = 0;
          _this.button.title = _this.labels.unmute;

          _this.button.setAttribute('aria-label', _this.labels.unmute);
        } else {
          el.volume = _this.volume;
          _this.button.title = _this.labels.mute;

          _this.button.setAttribute('aria-label', _this.labels.mute);
        }

        var event = events_1.addEvent('volumechange');

        _this.player.getElement().dispatchEvent(event);
      };

      this.button.addEventListener('click', this.events.button.click);
      Object.keys(this.events.media).forEach(function (event) {
        _this.player.getElement().addEventListener(event, _this.events.media[event]);
      });
      Object.keys(this.events.slider).forEach(function (event) {
        _this.slider.addEventListener(event, _this.events.slider[event]);
      });

      if (!constants_1.IS_ANDROID && !constants_1.IS_IOS) {
        var controls = this.player.getControls().getContainer();
        controls.appendChild(this.button);
        controls.appendChild(this.container);
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this2 = this;

      this.button.removeEventListener('click', this.events.button.click);
      Object.keys(this.events.media).forEach(function (event) {
        _this2.player.getElement().removeEventListener(event, _this2.events.media[event]);
      });
      Object.keys(this.events.slider).forEach(function (event) {
        _this2.slider.removeEventListener(event, _this2.events.slider[event]);
      });
      this.slider.remove();
      this.display.remove();
      this.container.remove();
    }
  }]);

  return Volume;
}();

exports.default = Volume;

/***/ }),
/* 148 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var dash_1 = __webpack_require__(149);

var hls_1 = __webpack_require__(150);

var html5_1 = __webpack_require__(151);

var source = __webpack_require__(31);

var Media = function () {
  function Media(element, options) {
    var autoplay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var customMedia = arguments.length > 3 ? arguments[3] : undefined;

    _classCallCheck(this, Media);

    this.customMedia = {
      media: {},
      optionsKey: {},
      rules: []
    };
    this.element = element;
    this.options = options;
    this.mediaFiles = this._getMediaFiles();
    this.promisePlay = null;
    this.customMedia = customMedia;
    this.autoplay = autoplay;
    return this;
  }

  _createClass(Media, [{
    key: "canPlayType",
    value: function canPlayType(mimeType) {
      return this.media.canPlayType(mimeType);
    }
  }, {
    key: "load",
    value: function load() {
      this._loadSources(this.mediaFiles);
    }
  }, {
    key: "play",
    value: function play() {
      var _this = this;

      this.promisePlay = new Promise(function (resolve) {
        resolve();
      }).then(function () {
        _this.media.promise.then(function () {
          _this.media.play();
        });
      });
      return this.promisePlay;
    }
  }, {
    key: "pause",
    value: function pause() {
      var _this2 = this;

      if (this.promisePlay) {
        this.promisePlay.then(function () {
          _this2.media.pause();
        });
      } else {
        this.media.pause();
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.media.destroy();
    }
  }, {
    key: "_loadSources",
    value: function _loadSources(sources) {
      var _this3 = this;

      if (!sources.length) {
        throw new TypeError('Media not set');
      }

      if (this.media && typeof this.media.destroy === 'function') {
        var sameMedia = sources.length === 1 && sources[0].src === this.media.media.src;

        if (!sameMedia) {
          this.media.destroy();
        }
      }

      sources.some(function (media) {
        try {
          _this3.media = _this3._invoke(media);
        } catch (e) {
          _this3.media = new html5_1.default(_this3.element, media);
        }

        var canPlay = _this3.canPlayType(media.type);

        if (!canPlay) {
          _this3.media = new html5_1.default(_this3.element, media);
          return _this3.canPlayType(media.type);
        }

        return canPlay;
      });

      try {
        if (this.media === null) {
          throw new TypeError('Media cannot be played with any valid media type');
        }

        this.media.promise.then(function () {
          _this3.media.load();
        });
      } catch (e) {
        this.media.destroy();
        throw e;
      }
    }
  }, {
    key: "_getMediaFiles",
    value: function _getMediaFiles() {
      var mediaFiles = [];
      var sourceTags = this.element.querySelectorAll('source');
      var nodeSource = this.element.src;

      if (nodeSource) {
        mediaFiles.push({
          src: nodeSource,
          type: this.element.getAttribute('type') || source.predictType(nodeSource)
        });
      }

      for (var i = 0, total = sourceTags.length; i < total; i++) {
        var item = sourceTags[i];
        var src = item.src;
        mediaFiles.push({
          src: src,
          type: item.getAttribute('type') || source.predictType(src)
        });
      }

      return mediaFiles;
    }
  }, {
    key: "_invoke",
    value: function _invoke(media) {
      var _this4 = this;

      if (Object.keys(this.customMedia.media).length) {
        var customRef;
        this.customMedia.rules.forEach(function (rule) {
          var type = rule(media.src);

          if (type) {
            var customMedia = _this4.customMedia.media[type];
            var customOptions = _this4.options[_this4.customMedia.optionsKey[type]] || undefined;
            customRef = customMedia(_this4.element, media, _this4.autoplay, customOptions);
          }
        });

        if (customRef) {
          customRef.create();
          return customRef;
        } else {
          return new html5_1.default(this.element, media);
        }
      } else if (source.isHlsSource(media.src)) {
        var hlsOptions = this.options && this.options.hls ? this.options.hls : undefined;
        return new hls_1.default(this.element, media, this.autoplay, hlsOptions);
      } else if (source.isDashSource(media.src)) {
        var dashOptions = this.options && this.options.dash ? this.options.dash : undefined;
        return new dash_1.default(this.element, media, dashOptions);
      }

      return new html5_1.default(this.element, media);
    }
  }, {
    key: "src",
    set: function set(media) {
      var _this5 = this;

      if (typeof media === 'string') {
        this.mediaFiles.push({
          src: media,
          type: source.predictType(media)
        });
      } else if (Array.isArray(media)) {
        this.mediaFiles = media;
      } else if (_typeof(media) === 'object') {
        this.mediaFiles.push(media);
      }

      this.mediaFiles.some(function (file) {
        return _this5.canPlayType(file.type);
      });

      if (this.element.src) {
        this.element.setAttribute('data-op-file', this.mediaFiles[0].src);
      }

      this.element.src = this.mediaFiles[0].src;
      this.media.src = this.mediaFiles[0];
    },
    get: function get() {
      return this.mediaFiles;
    }
  }, {
    key: "volume",
    set: function set(value) {
      this.media.volume = value;
    },
    get: function get() {
      return this.media.volume;
    }
  }, {
    key: "muted",
    set: function set(value) {
      this.media.muted = value;
    },
    get: function get() {
      return this.media.muted;
    }
  }, {
    key: "playbackRate",
    get: function get() {
      return this.media.playbackRate;
    },
    set: function set(value) {
      this.media.playbackRate = value;
    }
  }, {
    key: "currentTime",
    set: function set(value) {
      this.media.currentTime = value;
    },
    get: function get() {
      return this.media.currentTime;
    }
  }, {
    key: "duration",
    get: function get() {
      var duration = this.media.duration;

      if (duration === Infinity && this.element.seekable && this.element.seekable.length) {
        return this.element.seekable.end(0);
      }

      return duration;
    }
  }, {
    key: "paused",
    get: function get() {
      return this.media.paused;
    }
  }, {
    key: "ended",
    get: function get() {
      return this.media.ended;
    }
  }]);

  return Media;
}();

exports.default = Media;

/***/ }),
/* 149 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var constants_1 = __webpack_require__(20);

var events_1 = __webpack_require__(15);

var general_1 = __webpack_require__(5);

var media_1 = __webpack_require__(31);

var native_1 = __webpack_require__(50);

var DashMedia = function (_native_1$default) {
  _inherits(DashMedia, _native_1$default);

  function DashMedia(element, mediaSource, options) {
    var _this;

    _classCallCheck(this, DashMedia);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(DashMedia).call(this, element, mediaSource));
    _this.events = {};
    _this.options = options;

    function createInstance() {
      this.player = dashjs.MediaPlayer().create();
    }

    _this.promise = typeof dashjs === 'undefined' ? general_1.loadScript('https://cdn.dashjs.org/latest/dash.all.min.js') : new Promise(function (resolve) {
      return resolve();
    });

    _this.promise.then(createInstance.bind(_assertThisInitialized(_assertThisInitialized(_this))));

    return _possibleConstructorReturn(_this, _assertThisInitialized(_assertThisInitialized(_this)));
  }

  _createClass(DashMedia, [{
    key: "canPlayType",
    value: function canPlayType(mimeType) {
      return constants_1.HAS_MSE && mimeType === 'application/dash+xml';
    }
  }, {
    key: "load",
    value: function load() {
      var _this2 = this;

      this._preparePlayer();

      this.player.attachSource(this.media.src);
      var e = events_1.addEvent('loadedmetadata');
      this.element.dispatchEvent(e);

      if (!this.events) {
        this.events = dashjs.MediaPlayer.events;
        Object.keys(this.events).forEach(function (event) {
          _this2.player.on(_this2.events[event], _this2._assign.bind(_this2));
        });
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this._revoke();
    }
  }, {
    key: "_assign",
    value: function _assign(event) {
      if (event.type === 'error') {
        console.error(event);
      } else {
        var e = events_1.addEvent(event.type, event);
        this.element.dispatchEvent(e);
      }
    }
  }, {
    key: "_revoke",
    value: function _revoke() {
      var _this3 = this;

      if (this.events) {
        Object.keys(this.events).forEach(function (event) {
          _this3.player.off(_this3.events[event], _this3._assign.bind(_this3));
        });
        this.events = null;
      }

      this.player.reset();
    }
  }, {
    key: "_preparePlayer",
    value: function _preparePlayer() {
      this.player.getDebug().setLogToBrowserConsole(false);
      this.player.initialize();
      this.player.setScheduleWhilePaused(false);
      this.player.setFastSwitchEnabled(true);
      this.player.attachView(this.element);
      this.player.setAutoPlay(false);

      if (this.options && _typeof(this.options.drm) === 'object' && Object.keys(this.options.drm).length) {
        this.player.setProtectionData(this.options.drm);

        if (this.options.robustnessLevel && this.options.robustnessLevel) {
          this.player.getProtectionController().setRobustnessLevel(this.options.robustnessLevel);
        }
      }
    }
  }, {
    key: "src",
    set: function set(media) {
      var _this4 = this;

      if (media_1.isDashSource(media.src)) {
        this._revoke();

        this.player = dashjs.MediaPlayer().create();

        this._preparePlayer();

        this.player.attachSource(media.src);
        this.events = dashjs.MediaPlayer.events;
        Object.keys(this.events).forEach(function (event) {
          _this4.player.on(_this4.events[event], _this4._assign.bind(_this4));
        });
      }
    }
  }]);

  return DashMedia;
}(native_1.default);

exports.default = DashMedia;

/***/ }),
/* 150 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

var __rest = this && this.__rest || function (s, e) {
  var t = {};

  for (var p in s) {
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  }

  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
  }
  return t;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var constants_1 = __webpack_require__(20);

var events_1 = __webpack_require__(15);

var general_1 = __webpack_require__(5);

var media_1 = __webpack_require__(31);

var native_1 = __webpack_require__(50);

var HlsMedia = function (_native_1$default) {
  _inherits(HlsMedia, _native_1$default);

  function HlsMedia(element, mediaSource) {
    var _this;

    var autoplay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var options = arguments.length > 3 ? arguments[3] : undefined;

    _classCallCheck(this, HlsMedia);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(HlsMedia).call(this, element, mediaSource));
    _this.events = {};
    _this.options = options;
    _this.element = element;
    _this.media = mediaSource;
    _this.autoplay = autoplay;
    _this.promise = typeof Hls === 'undefined' ? general_1.loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js') : new Promise(function (resolve) {
      return resolve();
    });

    _this.promise.then(_this._create.bind(_assertThisInitialized(_assertThisInitialized(_this))));

    return _possibleConstructorReturn(_this, _assertThisInitialized(_assertThisInitialized(_this)));
  }

  _createClass(HlsMedia, [{
    key: "canPlayType",
    value: function canPlayType(mimeType) {
      return constants_1.SUPPORTS_HLS() && mimeType === 'application/x-mpegURL';
    }
  }, {
    key: "load",
    value: function load() {
      var _this2 = this;

      this.player.detachMedia();
      this.player.loadSource(this.media.src);
      this.player.attachMedia(this.element);
      var e = events_1.addEvent('loadedmetadata');
      this.element.dispatchEvent(e);

      if (!this.events) {
        this.events = Hls.Events;
        Object.keys(this.events).forEach(function (event) {
          _this2.player.on(_this2.events[event], function () {
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            return _this2._assign(_this2.events[event], args);
          });
        });
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this._revoke();
    }
  }, {
    key: "_create",
    value: function _create() {
      var _this3 = this;

      var options = this.options;

      if (!options) {
        options = {};
      }

      var autoplay = !!(this.element.preload === 'auto' || this.autoplay);
      options.autoStartLoad = autoplay;
      this.player = new Hls(this.options);
      this.events = Hls.Events;
      Object.keys(this.events).forEach(function (event) {
        _this3.player.on(_this3.events[event], function () {
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          return _this3._assign(_this3.events[event], args);
        });
      });

      if (!autoplay) {
        this.element.addEventListener('play', function () {
          if (_this3.player) {
            _this3.player.startLoad();
          }
        });
        this.element.addEventListener('pause', function () {
          if (_this3.player) {
            _this3.player.stopLoad();
          }
        });
      }
    }
  }, {
    key: "_assign",
    value: function _assign(event, data) {
      if (event === 'hlsError') {
        console.warn(data);
        data = data[1];

        var _data = data,
            type = _data.type,
            fatal = _data.fatal,
            details = __rest(data, ["type", "fatal"]);

        if (fatal) {
          switch (type) {
            case 'mediaError':
              var now = new Date().getTime();

              if (!this.recoverDecodingErrorDate || now - this.recoverDecodingErrorDate > 3000) {
                this.recoverDecodingErrorDate = new Date().getTime();
                this.player.recoverMediaError();
              } else if (!this.recoverSwapAudioCodecDate || now - this.recoverSwapAudioCodecDate > 3000) {
                this.recoverSwapAudioCodecDate = new Date().getTime();
                console.warn('Attempting to swap Audio Codec and recover from media error');
                this.player.swapAudioCodec();
                this.player.recoverMediaError();
              } else {
                var msg = 'Cannot recover, last media error recovery failed';
                console.error(msg);
                var mediaEvent = events_1.addEvent(type, details);
                this.element.dispatchEvent(mediaEvent);
              }

              break;

            case 'networkError':
              var message = 'Network error';
              console.error(message);
              var networkEvent = events_1.addEvent(type, details);
              this.element.dispatchEvent(networkEvent);
              break;

            default:
              this.player.destroy();
              var fatalEvent = events_1.addEvent(type, details);
              this.element.dispatchEvent(fatalEvent);
              break;
          }
        } else {
          var errorEvent = events_1.addEvent(type, details);
          this.element.dispatchEvent(errorEvent);
        }
      } else {
        if (event === 'hlsLevelLoaded' && data[1].details.live === true) {
          this.element.setAttribute('op-live', 'true');
          var timeEvent = events_1.addEvent('timeupdate');
          this.element.dispatchEvent(timeEvent);
        }

        var e = events_1.addEvent(event, data[1]);
        this.element.dispatchEvent(e);
      }
    }
  }, {
    key: "_revoke",
    value: function _revoke() {
      var _this4 = this;

      this.player.stopLoad();

      if (this.events) {
        Object.keys(this.events).forEach(function (event) {
          _this4.player.off(_this4.events[event], function () {
            for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
              args[_key3] = arguments[_key3];
            }

            return _this4._assign(_this4.events[event], args);
          });
        });
      }

      this.element.removeEventListener('play', function () {
        if (_this4.player) {
          _this4.player.startLoad();
        }
      });
      this.element.removeEventListener('pause', function () {
        if (_this4.player) {
          _this4.player.stopLoad();
        }
      });
      this.player.destroy();
    }
  }, {
    key: "src",
    set: function set(media) {
      var _this5 = this;

      if (media_1.isHlsSource(media.src)) {
        this._revoke();

        this.player = new Hls(this.options);
        this.player.loadSource(media.src);
        this.player.attachMedia(this.element);
        this.events = Hls.Events;
        Object.keys(this.events).forEach(function (event) {
          _this5.player.on(_this5.events[event], function () {
            for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
              args[_key4] = arguments[_key4];
            }

            return _this5._assign(_this5.events[event], args);
          });
        });
      }
    }
  }]);

  return HlsMedia;
}(native_1.default);

exports.default = HlsMedia;

/***/ }),
/* 151 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var general_1 = __webpack_require__(5);

var native_1 = __webpack_require__(50);

var HTML5Media = function (_native_1$default) {
  _inherits(HTML5Media, _native_1$default);

  function HTML5Media(element, mediaFile) {
    var _this;

    _classCallCheck(this, HTML5Media);

    if (!general_1.isAudio(element) && !general_1.isVideo(element)) {
      throw new TypeError('Native method only supports video/audio tags');
    }

    _this = _possibleConstructorReturn(this, _getPrototypeOf(HTML5Media).call(this, element, mediaFile));
    return _possibleConstructorReturn(_this, _assertThisInitialized(_assertThisInitialized(_this)));
  }

  _createClass(HTML5Media, [{
    key: "canPlayType",
    value: function canPlayType(mimeType) {
      return !!this.element.canPlayType(mimeType).replace('no', '');
    }
  }, {
    key: "load",
    value: function load() {
      this.element.load();
    }
  }, {
    key: "destroy",
    value: function destroy() {
      return this;
    }
  }, {
    key: "src",
    set: function set(media) {
      this.element.src = media.src;
    }
  }]);

  return HTML5Media;
}(native_1.default);

exports.default = HTML5Media;

/***/ }),
/* 152 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var constants_1 = __webpack_require__(20);

var events_1 = __webpack_require__(15);

var general_1 = __webpack_require__(5);

var media_1 = __webpack_require__(31);

var Ads = function () {
  function Ads(media, ads, labels, autoStart, options) {
    var _this = this;

    _classCallCheck(this, Ads);

    this.adsEnded = false;
    this.adsDone = false;
    this.adsActive = false;
    this.adsStarted = false;
    this.intervalTimer = 0;
    this.adsMuted = false;
    this.adsDuration = 0;
    this.adsCurrentTime = 0;
    this.adsManager = null;
    this.autoplayAllowed = false;
    this.autoplayRequiresMuted = false;
    this.autoStart = false;
    this.playTriggered = false;
    this.currentAdsIndex = 0;
    this.lastTimePaused = 0;
    this.mediaStarted = false;
    var defaultOpts = {
      debug: false,
      url: 'https://imasdk.googleapis.com/js/sdkloader/ima3.js'
    };
    this.ads = ads;
    this.media = media;
    this.element = media.element;
    this.autoStart = autoStart || false;
    this.adsOptions = Object.assign({}, defaultOpts, options);
    this.playTriggered = false;
    this.originalVolume = this.element.volume;
    this.adsVolume = this.originalVolume;
    var path = this.adsOptions.debug ? this.adsOptions.url.replace(/(\.js$)/, '_debug.js') : this.adsOptions.url;

    if (this.autoStart === true) {
      media_1.isAutoplaySupported(function (autoplay) {
        _this.autoplayAllowed = autoplay;
      }, function (muted) {
        _this.autoplayRequiresMuted = muted;
      }, function () {
        if (_this.autoplayRequiresMuted || constants_1.IS_IOS) {
          _this.adsMuted = true;
          _this.media.muted = true;
          _this.adsVolume = 0;
          _this.media.volume = 0;
          var e = events_1.addEvent('volumechange');

          _this.element.dispatchEvent(e);

          var volumeEl = document.createElement('div');
          var action = constants_1.IS_IOS || constants_1.IS_ANDROID ? labels.tap : labels.click;
          volumeEl.className = 'op-player__unmute';
          volumeEl.innerHTML = "<span>".concat(action, "</span>");
          volumeEl.addEventListener('click', function () {
            _this.adsMuted = false;
            _this.media.muted = false;
            _this.adsVolume = _this.originalVolume;
            _this.media.volume = _this.originalVolume;

            _this.adsManager.setVolume(_this.originalVolume);

            var event = events_1.addEvent('volumechange');

            _this.element.dispatchEvent(event);

            volumeEl.remove();
          });
          var target = _this.element.parentElement;
          target.insertBefore(volumeEl, target.firstChild);
        }

        _this.promise = typeof google === 'undefined' || typeof google.ima === 'undefined' ? general_1.loadScript(path) : new Promise(function (resolve) {
          return resolve();
        });

        _this.promise.then(_this.load.bind(_this));
      });
    } else {
      this.promise = typeof google === 'undefined' || typeof google.ima === 'undefined' ? general_1.loadScript(path) : new Promise(function (resolve) {
        return resolve();
      });
      this.promise.then(this.load.bind(this));
    }

    return this;
  }

  _createClass(Ads, [{
    key: "load",
    value: function load() {
      this.adsStarted = true;
      this.adsContainer = document.createElement('div');
      this.adsContainer.id = 'op-ads';
      this.adsContainer.tabIndex = -1;
      this.element.parentElement.insertBefore(this.adsContainer, this.element.nextSibling);
      this.mediaSources = this.media.src;
      google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED);
      this.adDisplayContainer = new google.ima.AdDisplayContainer(this.adsContainer, this.element);
      this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);
      this.adsLoader.getSettings().setDisableCustomPlaybackForIOS10Plus(true);
      this.adsLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, this._loaded.bind(this));
      this.adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._error.bind(this));
      window.addEventListener('resize', this.resizeAds.bind(this));

      if (this.autoStart === true) {
        if (!this.adsDone) {
          this.adsDone = true;
          this.adDisplayContainer.initialize();
          this.media.load();
        }

        this._requestAds();
      }
    }
  }, {
    key: "play",
    value: function play() {
      if (!this.adsDone) {
        this.adsDone = true;
        this.adDisplayContainer.initialize();
        this.media.load();

        if (constants_1.IS_IOS || constants_1.IS_ANDROID) {
          this.preloadContent = this._contentLoadedAction;
          this.element.addEventListener('loadedmetadata', this._contentLoadedAction.bind(this), false);
          this.media.load();
        } else {
          this._contentLoadedAction();
        }

        return;
      }

      if (this.adsManager) {
        this.adsActive = true;
        this.adsManager.resume();
        var e = events_1.addEvent('play');
        this.element.dispatchEvent(e);
      }
    }
  }, {
    key: "pause",
    value: function pause() {
      if (this.adsManager) {
        this.adsActive = false;
        this.adsManager.pause();
        var e = events_1.addEvent('pause');
        this.element.dispatchEvent(e);
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this2 = this;

      if (this.events) {
        this.events.forEach(function (event) {
          _this2.adsManager.removeEventListener(event, _this2._assign.bind(_this2));
        });
      }

      this.events = [];
      this.adsLoader.removeEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._error.bind(this));
      this.adsLoader.removeEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, this._loaded.bind(this));
      var destroy = !Array.isArray(this.ads) || this.currentAdsIndex > this.ads.length;

      if (this.adsManager && destroy) {
        this.adsManager.destroy();
      }

      this.element.removeEventListener('ended', this._contentEndedListener.bind(this));
      window.removeEventListener('resize', this.resizeAds.bind(this));
      this.adsContainer.remove();
    }
  }, {
    key: "resizeAds",
    value: function resizeAds(width, height) {
      var _this3 = this;

      if (this.adsManager) {
        var target = this.element;
        var mode = target.getAttribute('data-fullscreen') === 'true' ? google.ima.ViewMode.FULLSCREEN : google.ima.ViewMode.NORMAL;
        var timeout;

        if (timeout) {
          window.cancelAnimationFrame(timeout);
        }

        timeout = window.requestAnimationFrame(function () {
          _this3.adsManager.resize(width && height ? width : target.offsetWidth, width && height ? height : target.offsetHeight, mode);
        });
      }
    }
  }, {
    key: "_assign",
    value: function _assign(event) {
      var _this4 = this;

      var ad = event.getAd();

      switch (event.type) {
        case google.ima.AdEvent.Type.LOADED:
          if (!ad.isLinear()) {
            this._onContentResumeRequested();
          } else {
            if (!this.media.paused) {
              this.media.pause();
            }

            this.element.parentElement.classList.add('op-ads--active');
            this.adsDuration = ad.getDuration();
            this.adsCurrentTime = ad.getDuration();

            if (!this.mediaStarted) {
              var loadedEvent = events_1.addEvent('loadedmetadata');
              this.element.dispatchEvent(loadedEvent);
              var resizeEvent = events_1.addEvent('resize');
              window.dispatchEvent(resizeEvent);
              this.mediaStarted = true;
            }
          }

          break;

        case google.ima.AdEvent.Type.STARTED:
          if (ad.isLinear()) {
            this.adsActive = true;
            var playEvent = events_1.addEvent('play');
            this.element.dispatchEvent(playEvent);

            if (this.media.ended) {
              this.adsEnded = false;
              var endEvent = events_1.addEvent('adsmediaended');
              this.element.dispatchEvent(endEvent);
            }

            this.intervalTimer = window.setInterval(function () {
              if (_this4.adsActive === true) {
                _this4.adsCurrentTime = Math.round(_this4.adsManager.getRemainingTime());
                var timeEvent = events_1.addEvent('timeupdate');

                _this4.element.dispatchEvent(timeEvent);
              }
            }, 300);
          }

          break;

        case google.ima.AdEvent.Type.COMPLETE:
        case google.ima.AdEvent.Type.SKIPPED:
          if (ad.isLinear()) {
            this.element.parentElement.classList.remove('op-ads--active');
            this.adsActive = false;
            clearInterval(this.intervalTimer);
          }

          break;

        case google.ima.AdEvent.Type.VOLUME_CHANGED:
        case google.ima.AdEvent.Type.VOLUME_MUTED:
          if (ad.isLinear()) {
            var volumeEvent = events_1.addEvent('volumechange');
            this.element.dispatchEvent(volumeEvent);
          }

          break;

        case google.ima.AdEvent.ALL_ADS_COMPLETED:
          if (ad.isLinear()) {
            this.adsActive = false;
            this.adsEnded = true;
            this.element.parentElement.classList.remove('op-ads--active');
          }

          break;
      }

      var e = events_1.addEvent("ads".concat(event.type));
      this.element.dispatchEvent(e);
    }
  }, {
    key: "_error",
    value: function _error(event) {
      console.error("Ad error: ".concat(event.getError().toString()));

      if (Array.isArray(this.ads) && this.ads.length > 1 && this.currentAdsIndex <= this.ads.length) {
        this.currentAdsIndex++;
        this.playTriggered = true;
        this.adsStarted = true;
        this.destroy();
        this.load();
      } else {
        if (this.adsManager) {
          this.adsManager.destroy();
        }

        var unmuteEl = this.element.parentElement.querySelector('.op-player__unmute');

        if (unmuteEl) {
          unmuteEl.remove();
        }

        if (this.autoStart === true || this.adsStarted === true) {
          this.adsActive = false;

          this._resumeMedia();
        }
      }
    }
  }, {
    key: "_loaded",
    value: function _loaded(adsManagerLoadedEvent) {
      var adsRenderingSettings = new google.ima.AdsRenderingSettings();
      adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = false;
      this.adsManager = adsManagerLoadedEvent.getAdsManager(this.element, adsRenderingSettings);

      this._start(this.adsManager);
    }
  }, {
    key: "_start",
    value: function _start(manager) {
      var _this5 = this;

      manager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._error.bind(this));
      manager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, this._onContentPauseRequested.bind(this));
      manager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, this._onContentResumeRequested.bind(this));
      this.events = [google.ima.AdEvent.Type.ALL_ADS_COMPLETED, google.ima.AdEvent.Type.CLICK, google.ima.AdEvent.Type.COMPLETE, google.ima.AdEvent.Type.FIRST_QUARTILE, google.ima.AdEvent.Type.LOADED, google.ima.AdEvent.Type.MIDPOINT, google.ima.AdEvent.Type.PAUSED, google.ima.AdEvent.Type.STARTED, google.ima.AdEvent.Type.THIRD_QUARTILE, google.ima.AdEvent.Type.SKIPPED, google.ima.AdEvent.Type.VOLUME_CHANGED, google.ima.AdEvent.Type.VOLUME_MUTED];
      this.events.forEach(function (event) {
        manager.addEventListener(event, _this5._assign.bind(_this5));
      });

      if (this.autoStart === true || this.playTriggered === true) {
        this.playTriggered = false;
        manager.init(this.element.offsetWidth, this.element.offsetHeight, this.element.parentElement.getAttribute('data-fullscreen') === 'true' ? google.ima.ViewMode.FULLSCREEN : google.ima.ViewMode.NORMAL);
        manager.start();
        var e = events_1.addEvent('play');
        this.element.dispatchEvent(e);
        var event = events_1.addEvent('playing');
        this.element.dispatchEvent(event);
      }
    }
  }, {
    key: "_contentEndedListener",
    value: function _contentEndedListener() {
      this.adsEnded = true;
      this.adsActive = false;
      this.adsStarted = false;
      this.adsLoader.contentComplete();
    }
  }, {
    key: "_onContentPauseRequested",
    value: function _onContentPauseRequested() {
      this.element.removeEventListener('ended', this._contentEndedListener.bind(this));
      this.lastTimePaused = this.media.currentTime;

      if (this.adsStarted) {
        this.media.pause();
      } else {
        this.adsStarted = true;
      }

      var e = events_1.addEvent('play');
      this.element.dispatchEvent(e);
    }
  }, {
    key: "_onContentResumeRequested",
    value: function _onContentResumeRequested() {
      this.element.addEventListener('ended', this._contentEndedListener.bind(this));
      this.media.src = this.mediaSources;
      this.element.addEventListener('loadedmetadata', this._loadedMetadataHandler.bind(this));
      this.media.load();
    }
  }, {
    key: "_loadedMetadataHandler",
    value: function _loadedMetadataHandler() {
      if (this.media.currentTime === 0 || this.element.seekable.length) {
        if (this.media.currentTime === 0 || this.element.seekable.end(0) > this.lastTimePaused) {
          this.media.currentTime = this.lastTimePaused;
          this.element.controls = !!(constants_1.IS_IPHONE && general_1.isVideo(this.element));
          this.element.removeEventListener('loadedmetadata', this._loadedMetadataHandler.bind(this));

          this._resumeMedia();
        }
      } else {
        setTimeout(this._loadedMetadataHandler.bind(this), 100);
      }
    }
  }, {
    key: "_resumeMedia",
    value: function _resumeMedia() {
      var _this6 = this;

      this.intervalTimer = 0;
      this.adsMuted = false;
      this.adsStarted = false;
      this.adsDuration = 0;
      this.adsCurrentTime = 0;
      this.element.parentElement.classList.remove('op-ads--active');

      if (!this.media.ended) {
        setTimeout(function () {
          _this6.media.play();

          var playEvent = events_1.addEvent('play');

          _this6.element.dispatchEvent(playEvent);
        }, 50);
      } else {
        var event = events_1.addEvent('ended');
        this.element.dispatchEvent(event);
      }
    }
  }, {
    key: "_requestAds",
    value: function _requestAds() {
      this.adsRequest = new google.ima.AdsRequest();
      this.adsRequest.adTagUrl = Array.isArray(this.ads) ? this.ads[this.currentAdsIndex] : this.ads;
      var width = this.element.parentElement.offsetWidth;
      var height = this.element.parentElement.offsetWidth;
      this.adsRequest.linearAdSlotWidth = width;
      this.adsRequest.linearAdSlotHeight = height;
      this.adsRequest.setAdWillAutoPlay(this.autoplayAllowed);
      this.adsRequest.setAdWillPlayMuted(this.autoplayRequiresMuted);
      this.adsLoader.requestAds(this.adsRequest);
    }
  }, {
    key: "_contentLoadedAction",
    value: function _contentLoadedAction() {
      if (this.preloadContent) {
        this.element.removeEventListener('loadedmetadata', this.preloadContent.bind(this));
        this.preloadContent = null;
      }

      this._requestAds();
    }
  }, {
    key: "playRequested",
    set: function set(value) {
      this.playTriggered = value;
    }
  }, {
    key: "volume",
    set: function set(value) {
      this.adsVolume = value;
      this.adsManager.setVolume(value);
      this.media.volume = value;
      this.media.muted = value === 0;
      this.adsMuted = value === 0;
    },
    get: function get() {
      return this.adsVolume;
    }
  }, {
    key: "muted",
    set: function set(value) {
      if (value === true) {
        this.adsManager.setVolume(0);
        this.adsMuted = true;
        this.media.muted = true;
        this.media.volume = 0;
      } else {
        this.adsManager.setVolume(this.adsVolume);
        this.adsMuted = false;
        this.media.muted = false;
        this.media.volume = this.adsVolume;
      }
    },
    get: function get() {
      return this.adsMuted;
    }
  }, {
    key: "currentTime",
    set: function set(value) {
      this.adsCurrentTime = value;
    },
    get: function get() {
      return this.adsCurrentTime;
    }
  }, {
    key: "duration",
    get: function get() {
      return this.adsDuration;
    }
  }, {
    key: "paused",
    get: function get() {
      return !this.adsActive;
    }
  }, {
    key: "ended",
    get: function get() {
      return this.adsEnded;
    }
  }]);

  return Ads;
}();

exports.default = Ads;

/***/ })
/******/ ])["default"];
});