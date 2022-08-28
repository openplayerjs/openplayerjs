(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["OpenPlayer"] = factory();
	else
		root["OpenPlayer"] = factory();
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 669:
/***/ ((module) => {

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

module.exports = _arrayLikeToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 858:
/***/ ((module) => {

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

module.exports = _arrayWithHoles, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 506:
/***/ ((module) => {

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

module.exports = _assertThisInitialized, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 926:
/***/ ((module) => {

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

module.exports = _asyncToGenerator, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 358:
/***/ ((module) => {

function _classApplyDescriptorGet(receiver, descriptor) {
  if (descriptor.get) {
    return descriptor.get.call(receiver);
  }

  return descriptor.value;
}

module.exports = _classApplyDescriptorGet, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 625:
/***/ ((module) => {

function _classApplyDescriptorSet(receiver, descriptor, value) {
  if (descriptor.set) {
    descriptor.set.call(receiver, value);
  } else {
    if (!descriptor.writable) {
      throw new TypeError("attempted to set read only private field");
    }

    descriptor.value = value;
  }
}

module.exports = _classApplyDescriptorSet, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 575:
/***/ ((module) => {

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 486:
/***/ ((module) => {

function _classExtractFieldDescriptor(receiver, privateMap, action) {
  if (!privateMap.has(receiver)) {
    throw new TypeError("attempted to " + action + " private field on non-instance");
  }

  return privateMap.get(receiver);
}

module.exports = _classExtractFieldDescriptor, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 226:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var classApplyDescriptorGet = __webpack_require__(358);

var classExtractFieldDescriptor = __webpack_require__(486);

function _classPrivateFieldGet(receiver, privateMap) {
  var descriptor = classExtractFieldDescriptor(receiver, privateMap, "get");
  return classApplyDescriptorGet(receiver, descriptor);
}

module.exports = _classPrivateFieldGet, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 962:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var classApplyDescriptorSet = __webpack_require__(625);

var classExtractFieldDescriptor = __webpack_require__(486);

function _classPrivateFieldSet(receiver, privateMap, value) {
  var descriptor = classExtractFieldDescriptor(receiver, privateMap, "set");
  classApplyDescriptorSet(receiver, descriptor, value);
  return value;
}

module.exports = _classPrivateFieldSet, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 913:
/***/ ((module) => {

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

module.exports = _createClass, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 713:
/***/ ((module) => {

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

module.exports = _defineProperty, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 754:
/***/ ((module) => {

function _getPrototypeOf(o) {
  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  return _getPrototypeOf(o);
}

module.exports = _getPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 205:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var setPrototypeOf = __webpack_require__(489);

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.defineProperty(subClass, "prototype", {
    writable: false
  });
  if (superClass) setPrototypeOf(subClass, superClass);
}

module.exports = _inherits, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 884:
/***/ ((module) => {

function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

module.exports = _iterableToArrayLimit, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 521:
/***/ ((module) => {

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

module.exports = _nonIterableRest, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 479:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var objectWithoutPropertiesLoose = __webpack_require__(316);

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = objectWithoutPropertiesLoose(source, excluded);
  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

module.exports = _objectWithoutProperties, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 316:
/***/ ((module) => {

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

module.exports = _objectWithoutPropertiesLoose, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 585:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(8)["default"]);

var assertThisInitialized = __webpack_require__(506);

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }

  return assertThisInitialized(self);
}

module.exports = _possibleConstructorReturn, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 591:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(8)["default"]);

function _regeneratorRuntime() {
  "use strict";
  /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */

  module.exports = _regeneratorRuntime = function _regeneratorRuntime() {
    return exports;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  var exports = {},
      Op = Object.prototype,
      hasOwn = Op.hasOwnProperty,
      $Symbol = "function" == typeof Symbol ? Symbol : {},
      iteratorSymbol = $Symbol.iterator || "@@iterator",
      asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator",
      toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    return Object.defineProperty(obj, key, {
      value: value,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }), obj[key];
  }

  try {
    define({}, "");
  } catch (err) {
    define = function define(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator,
        generator = Object.create(protoGenerator.prototype),
        context = new Context(tryLocsList || []);
    return generator._invoke = function (innerFn, self, context) {
      var state = "suspendedStart";
      return function (method, arg) {
        if ("executing" === state) throw new Error("Generator is already running");

        if ("completed" === state) {
          if ("throw" === method) throw arg;
          return doneResult();
        }

        for (context.method = method, context.arg = arg;;) {
          var delegate = context.delegate;

          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);

            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }

          if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) {
            if ("suspendedStart" === state) throw state = "completed", context.arg;
            context.dispatchException(context.arg);
          } else "return" === context.method && context.abrupt("return", context.arg);
          state = "executing";
          var record = tryCatch(innerFn, self, context);

          if ("normal" === record.type) {
            if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue;
            return {
              value: record.arg,
              done: context.done
            };
          }

          "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg);
        }
      };
    }(innerFn, self, context), generator;
  }

  function tryCatch(fn, obj, arg) {
    try {
      return {
        type: "normal",
        arg: fn.call(obj, arg)
      };
    } catch (err) {
      return {
        type: "throw",
        arg: err
      };
    }
  }

  exports.wrap = wrap;
  var ContinueSentinel = {};

  function Generator() {}

  function GeneratorFunction() {}

  function GeneratorFunctionPrototype() {}

  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });
  var getProto = Object.getPrototypeOf,
      NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype);
  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);

  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
      define(prototype, method, function (arg) {
        return this._invoke(method, arg);
      });
    });
  }

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);

      if ("throw" !== record.type) {
        var result = record.arg,
            value = result.value;
        return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) {
          invoke("next", value, resolve, reject);
        }, function (err) {
          invoke("throw", err, resolve, reject);
        }) : PromiseImpl.resolve(value).then(function (unwrapped) {
          result.value = unwrapped, resolve(result);
        }, function (error) {
          return invoke("throw", error, resolve, reject);
        });
      }

      reject(record.arg);
    }

    var previousPromise;

    this._invoke = function (method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function (resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
    };
  }

  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];

    if (undefined === method) {
      if (context.delegate = null, "throw" === context.method) {
        if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel;
        context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);
    if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel;
    var info = record.arg;
    return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel);
  }

  function pushTryEntry(locs) {
    var entry = {
      tryLoc: locs[0]
    };
    1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal", delete record.arg, entry.completion = record;
  }

  function Context(tryLocsList) {
    this.tryEntries = [{
      tryLoc: "root"
    }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0);
  }

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) return iteratorMethod.call(iterable);
      if ("function" == typeof iterable.next) return iterable;

      if (!isNaN(iterable.length)) {
        var i = -1,
            next = function next() {
          for (; ++i < iterable.length;) {
            if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next;
          }

          return next.value = undefined, next.done = !0, next;
        };

        return next.next = next;
      }
    }

    return {
      next: doneResult
    };
  }

  function doneResult() {
    return {
      value: undefined,
      done: !0
    };
  }

  return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) {
    var ctor = "function" == typeof genFun && genFun.constructor;
    return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name));
  }, exports.mark = function (genFun) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun;
  }, exports.awrap = function (arg) {
    return {
      __await: arg
    };
  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    void 0 === PromiseImpl && (PromiseImpl = Promise);
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
    return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) {
      return result.done ? result.value : iter.next();
    });
  }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () {
    return this;
  }), define(Gp, "toString", function () {
    return "[object Generator]";
  }), exports.keys = function (object) {
    var keys = [];

    for (var key in object) {
      keys.push(key);
    }

    return keys.reverse(), function next() {
      for (; keys.length;) {
        var key = keys.pop();
        if (key in object) return next.value = key, next.done = !1, next;
      }

      return next.done = !0, next;
    };
  }, exports.values = values, Context.prototype = {
    constructor: Context,
    reset: function reset(skipTempReset) {
      if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) {
        "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined);
      }
    },
    stop: function stop() {
      this.done = !0;
      var rootRecord = this.tryEntries[0].completion;
      if ("throw" === rootRecord.type) throw rootRecord.arg;
      return this.rval;
    },
    dispatchException: function dispatchException(exception) {
      if (this.done) throw exception;
      var context = this;

      function handle(loc, caught) {
        return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i],
            record = entry.completion;
        if ("root" === entry.tryLoc) return handle("end");

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc"),
              hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
            if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
          } else {
            if (!hasFinally) throw new Error("try statement without catch or finally");
            if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
          }
        }
      }
    },
    abrupt: function abrupt(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null);
      var record = finallyEntry ? finallyEntry.completion : {};
      return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record);
    },
    complete: function complete(record, afterLoc) {
      if ("throw" === record.type) throw record.arg;
      return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel;
    },
    finish: function finish(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
      }
    },
    "catch": function _catch(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;

          if ("throw" === record.type) {
            var thrown = record.arg;
            resetTryEntry(entry);
          }

          return thrown;
        }
      }

      throw new Error("illegal catch attempt");
    },
    delegateYield: function delegateYield(iterable, resultName, nextLoc) {
      return this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      }, "next" === this.method && (this.arg = undefined), ContinueSentinel;
    }
  }, exports;
}

module.exports = _regeneratorRuntime, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 489:
/***/ ((module) => {

function _setPrototypeOf(o, p) {
  module.exports = _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  return _setPrototypeOf(o, p);
}

module.exports = _setPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 38:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayWithHoles = __webpack_require__(858);

var iterableToArrayLimit = __webpack_require__(884);

var unsupportedIterableToArray = __webpack_require__(379);

var nonIterableRest = __webpack_require__(521);

function _slicedToArray(arr, i) {
  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableRest();
}

module.exports = _slicedToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 8:
/***/ ((module) => {

function _typeof(obj) {
  "@babel/helpers - typeof";

  return (module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports), _typeof(obj);
}

module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 379:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayLikeToArray = __webpack_require__(669);

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
}

module.exports = _unsupportedIterableToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 757:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// TODO(Babel 8): Remove this file.

var runtime = __webpack_require__(591)();
module.exports = runtime;

// Copied from https://github.com/facebook/regenerator/blob/main/packages/runtime/runtime.js#L736=
try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
var __webpack_exports__ = {};

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ player)
});

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/typeof.js
var helpers_typeof = __webpack_require__(8);
var typeof_default = /*#__PURE__*/__webpack_require__.n(helpers_typeof);
// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/asyncToGenerator.js
var asyncToGenerator = __webpack_require__(926);
var asyncToGenerator_default = /*#__PURE__*/__webpack_require__.n(asyncToGenerator);
// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/classCallCheck.js
var classCallCheck = __webpack_require__(575);
var classCallCheck_default = /*#__PURE__*/__webpack_require__.n(classCallCheck);
// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/createClass.js
var createClass = __webpack_require__(913);
var createClass_default = /*#__PURE__*/__webpack_require__.n(createClass);
// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/defineProperty.js
var defineProperty = __webpack_require__(713);
var defineProperty_default = /*#__PURE__*/__webpack_require__.n(defineProperty);
// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/classPrivateFieldGet.js
var classPrivateFieldGet = __webpack_require__(226);
var classPrivateFieldGet_default = /*#__PURE__*/__webpack_require__.n(classPrivateFieldGet);
// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/classPrivateFieldSet.js
var classPrivateFieldSet = __webpack_require__(962);
var classPrivateFieldSet_default = /*#__PURE__*/__webpack_require__.n(classPrivateFieldSet);
// EXTERNAL MODULE: ./node_modules/@babel/runtime/regenerator/index.js
var regenerator = __webpack_require__(757);
var regenerator_default = /*#__PURE__*/__webpack_require__.n(regenerator);
// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/slicedToArray.js
var slicedToArray = __webpack_require__(38);
var slicedToArray_default = /*#__PURE__*/__webpack_require__.n(slicedToArray);
;// CONCATENATED MODULE: ./src/utils/constants.ts
var NAV = typeof window !== 'undefined' ? window.navigator : null;
var UA = NAV ? NAV.userAgent.toLowerCase() : null;
var IS_IPAD = UA ? /ipad/i.test(UA) && !window.MSStream : false;
var IS_IPHONE = UA ? /iphone/i.test(UA) && !window.MSStream : false;
var IS_IPOD = UA ? /ipod/i.test(UA) && !window.MSStream : false;
var IS_IOS = UA ? /ipad|iphone|ipod/i.test(UA) && !window.MSStream : false;
var IS_ANDROID = UA ? /android/i.test(UA) : false;
var IS_EDGE = NAV ? 'msLaunchUri' in NAV && !('documentMode' in document) : false;
var IS_CHROME = UA ? /chrome/i.test(UA) : false;
var IS_FIREFOX = UA ? /firefox/i.test(UA) : false;
var IS_SAFARI = UA ? /safari/i.test(UA) && !IS_CHROME : false;
var IS_STOCK_ANDROID = UA ? /^mozilla\/\d+\.\d+\s\(linux;\su;/i.test(UA) : false;
var HAS_MSE = typeof window !== 'undefined' ? 'MediaSource' in window : false;
var SUPPORTS_HLS = function SUPPORTS_HLS() {
  if (typeof window === 'undefined') {
    return false;
  }

  var mediaSource = window.MediaSource || window.WebKitMediaSource;
  var sourceBuffer = window.SourceBuffer || window.WebKitSourceBuffer;
  var isTypeSupported = mediaSource && typeof mediaSource.isTypeSupported === 'function' && mediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');
  var sourceBufferValidAPI = !sourceBuffer || sourceBuffer.prototype && typeof sourceBuffer.prototype.appendBuffer === 'function' && typeof sourceBuffer.prototype.remove === 'function';
  return !!isTypeSupported && !!sourceBufferValidAPI && !IS_SAFARI;
};
var DVR_THRESHOLD = 120;
var EVENT_OPTIONS = {
  passive: false
};
;// CONCATENATED MODULE: ./src/utils/general.ts

function getAbsoluteUrl(url) {
  var a = document.createElement('a');
  a.href = url;
  return a.href;
}
function isVideo(element) {
  return element.tagName.toLowerCase() === 'video';
}
function isAudio(element) {
  return element.tagName.toLowerCase() === 'audio';
}
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
      reject(new Error("".concat(url, " could not be loaded")));
    };

    if (document.head) {
      document.head.appendChild(script);
    }
  });
}
function offset(el) {
  var rect = el.getBoundingClientRect();
  return {
    left: rect.left + (window.pageXOffset || document.documentElement.scrollLeft),
    top: rect.top + (window.pageYOffset || document.documentElement.scrollTop)
  };
}
function sanitize(html) {
  var plainText = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var parser = new DOMParser();
  var content = parser.parseFromString(html, 'text/html');
  var formattedContent = content.body || document.createElement('body');
  var scripts = formattedContent.querySelectorAll('script');

  for (var i = 0, total = scripts.length; i < total; i++) {
    scripts[i].remove();
  }

  var clean = function clean(element) {
    var nodes = element.children;

    for (var _i = 0, _total = nodes.length; _i < _total; _i++) {
      var node = nodes[_i];
      var attributes = node.attributes;

      for (var j = 0, t = attributes.length; j < t; j++) {
        var _attributes$j = attributes[j],
            name = _attributes$j.name,
            value = _attributes$j.value;
        var val = value.replace(/\s+/g, '').toLowerCase();

        if (['src', 'href', 'xlink:href'].includes(name)) {
          if (val.includes('javascript:') || val.includes('data:')) {
            node.removeAttribute(name);
          }
        }

        if (name.startsWith('on')) {
          node.removeAttribute(name);
        }
      }

      clean(node);
    }
  };

  clean(formattedContent);
  return plainText ? (formattedContent.textContent || '').replace(/\s{2,}/g, '') : formattedContent.innerHTML;
}
function isXml(input) {
  var parsedXml;

  if (typeof DOMParser !== 'undefined') {
    parsedXml = function parsedXml(text) {
      return new DOMParser().parseFromString(text, 'text/xml');
    };
  } else {
    return false;
  }

  try {
    var response = parsedXml(input);

    if (response.getElementsByTagName('parsererror').length > 0) {
      return false;
    }
  } catch (e) {
    return false;
  }

  return true;
}
function isJson(item) {
  item = typeof item !== 'string' ? JSON.stringify(item) : item;

  try {
    item = JSON.parse(item);
  } catch (e) {
    return false;
  }

  if (typeof_default()(item) === 'object' && item !== null) {
    return true;
  }

  return false;
}
function addEvent(event, details) {
  var detail = {};

  if (details && details.detail) {
    detail = {
      detail: details.detail
    };
  }

  return new CustomEvent(event, detail);
}
;// CONCATENATED MODULE: ./src/utils/time.ts
function formatTime(seconds, frameRate) {
  var f = Math.floor(seconds % 1 * (frameRate || 0));
  var s = Math.floor(seconds);
  var m = Math.floor(s / 60);
  var h = Math.floor(m / 60);

  var wrap = function wrap(value) {
    var formattedVal = value.toString();

    if (value < 10) {
      if (value <= 0) {
        return '00';
      }

      return "0".concat(formattedVal);
    }

    return formattedVal;
  };

  m %= 60;
  s %= 60;
  return "".concat(h > 0 ? "".concat(wrap(h), ":") : '').concat(wrap(m), ":").concat(wrap(s)).concat(f ? ":".concat(wrap(f)) : '');
}
function timeToSeconds(timeCode) {
  var time = timeCode.replace(/;/g, ':').split(':');
  var seconds = 0;

  if (time.length === 3) {
    seconds += parseFloat(time[0]) * 60 * 60;
    seconds += parseFloat(time[1]) * 60;
    seconds += parseFloat(time[2]);
  } else {
    seconds += parseFloat(time[0]) * 60;
    seconds += parseFloat(time[1]);
  }

  return seconds;
}
;// CONCATENATED MODULE: ./src/controls/captions.ts






function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }





var _player = new WeakMap();

var _button = new WeakMap();

var _captions = new WeakMap();

var _menu = new WeakMap();

var _events = new WeakMap();

var _langTracks = new WeakMap();

var _mediaTrackList = new WeakMap();

var _trackUrlList = new WeakMap();

var _hasTracks = new WeakMap();

var _currentTrack = new WeakMap();

var _default = new WeakMap();

var _controlPosition = new WeakMap();

var _controlLayer = new WeakMap();

var Captions = function () {
  function Captions(player, position, layer) {
    classCallCheck_default()(this, Captions);

    _classPrivateFieldInitSpec(this, _player, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _button, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _captions, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _menu, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _events, {
      writable: true,
      value: {
        button: {},
        global: {},
        media: {}
      }
    });

    _classPrivateFieldInitSpec(this, _langTracks, {
      writable: true,
      value: {}
    });

    _classPrivateFieldInitSpec(this, _mediaTrackList, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _trackUrlList, {
      writable: true,
      value: {}
    });

    _classPrivateFieldInitSpec(this, _hasTracks, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _currentTrack, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _default, {
      writable: true,
      value: 'off'
    });

    _classPrivateFieldInitSpec(this, _controlPosition, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _controlLayer, {
      writable: true,
      value: void 0
    });

    classPrivateFieldSet_default()(this, _player, player);

    classPrivateFieldSet_default()(this, _controlPosition, position);

    classPrivateFieldSet_default()(this, _controlLayer, layer);

    this._getCuesFromText = this._getCuesFromText.bind(this);
    this._getNativeCues = this._getNativeCues.bind(this);
    this._displayCaptions = this._displayCaptions.bind(this);
    this._hideCaptions = this._hideCaptions.bind(this);
    this._search = this._search.bind(this);
    this._prepareTrack = this._prepareTrack.bind(this);
    this._formatMenuItems = this._formatMenuItems.bind(this);
  }

  createClass_default()(Captions, [{
    key: "create",
    value: function create() {
      var _this = this;

      var trackList = classPrivateFieldGet_default()(this, _player).getElement().textTracks;

      var tracks = [];

      for (var i = 0, total = trackList.length; i < total; i++) {
        var selector = ["track[kind=\"subtitles\"][srclang=\"".concat(trackList[i].language, "\"][label=\"").concat(trackList[i].label, "\"]"), "track[kind=\"captions\"][srclang=\"".concat(trackList[i].language, "\"][label=\"").concat(trackList[i].label, "\"]")];

        var tag = classPrivateFieldGet_default()(this, _player).getElement().querySelector(selector.join(', '));

        if (tag) {
          tracks.push(trackList[i]);
        }
      }

      if (!tracks.length) {
        for (var _i = 0, _total = trackList.length; _i < _total; _i++) {
          tracks.push(trackList[_i]);
        }
      }

      classPrivateFieldSet_default()(this, _mediaTrackList, tracks);

      classPrivateFieldSet_default()(this, _hasTracks, !!classPrivateFieldGet_default()(this, _mediaTrackList).length);

      if (!classPrivateFieldGet_default()(this, _hasTracks)) {
        return;
      }

      var _classPrivateFieldGet2 = classPrivateFieldGet_default()(this, _player).getOptions(),
          labels = _classPrivateFieldGet2.labels,
          detachMenus = _classPrivateFieldGet2.detachMenus;

      classPrivateFieldSet_default()(this, _button, document.createElement('button'));

      classPrivateFieldGet_default()(this, _button).className = "op-controls__captions op-control__".concat(classPrivateFieldGet_default()(this, _controlPosition));
      classPrivateFieldGet_default()(this, _button).tabIndex = 0;
      classPrivateFieldGet_default()(this, _button).title = (labels === null || labels === void 0 ? void 0 : labels.toggleCaptions) || '';

      classPrivateFieldGet_default()(this, _button).setAttribute('aria-controls', classPrivateFieldGet_default()(this, _player).id);

      classPrivateFieldGet_default()(this, _button).setAttribute('aria-pressed', 'false');

      classPrivateFieldGet_default()(this, _button).setAttribute('aria-label', (labels === null || labels === void 0 ? void 0 : labels.toggleCaptions) || '');

      classPrivateFieldGet_default()(this, _button).setAttribute('data-active-captions', 'off');

      if (detachMenus) {
        classPrivateFieldGet_default()(this, _button).classList.add('op-control--no-hover');

        classPrivateFieldSet_default()(this, _menu, document.createElement('div'));

        classPrivateFieldGet_default()(this, _menu).className = 'op-settings op-captions__menu';

        classPrivateFieldGet_default()(this, _menu).setAttribute('aria-hidden', 'true');

        classPrivateFieldGet_default()(this, _menu).innerHTML = "<div class=\"op-settings__menu\" role=\"menu\" id=\"menu-item-captions\">\n                <div class=\"op-settings__submenu-item\" tabindex=\"0\" role=\"menuitemradio\" aria-checked=\"".concat(classPrivateFieldGet_default()(this, _default) === 'off' ? 'true' : 'false', "\">\n                    <div class=\"op-settings__submenu-label op-subtitles__option\" data-value=\"captions-off\">").concat(labels === null || labels === void 0 ? void 0 : labels.off, "</div>\n                </div>\n            </div>");
      }

      var _loop = function _loop(i, trackItems, total) {
        var element = trackItems[i];

        if (element.kind === 'subtitles' || element.kind === 'captions') {
          if (element.default) {
            classPrivateFieldSet_default()(_this, _default, element.srclang);

            classPrivateFieldGet_default()(_this, _button).setAttribute('data-active-captions', element.srclang);
          }

          var trackUrl = getAbsoluteUrl(element.src);

          var currTrack = classPrivateFieldGet_default()(_this, _mediaTrackList)[i];

          if (currTrack && currTrack.language === element.srclang) {
            if (currTrack.cues && currTrack.cues.length > 0) {
              classPrivateFieldGet_default()(_this, _langTracks)[element.srclang] = _this._getNativeCues(classPrivateFieldGet_default()(_this, _mediaTrackList)[i]);

              _this._prepareTrack(i, element.srclang, trackUrl, element.default || false);
            } else {
              fetch(trackUrl).then(function (response) {
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }

                return response.text();
              }).then(function (d) {
                classPrivateFieldGet_default()(_this, _langTracks)[element.srclang] = _this._getCuesFromText(d);

                _this._prepareTrack(i, element.srclang, trackUrl, element.default || false);

                var selector = ".op-subtitles__option[data-value=\"captions-".concat(classPrivateFieldGet_default()(_this, _mediaTrackList)[i].language, "\"]");

                if (classPrivateFieldGet_default()(_this, _menu) && !classPrivateFieldGet_default()(_this, _menu).querySelector(selector)) {
                  var item = document.createElement('div');
                  var label = labels !== null && labels !== void 0 && labels.lang ? labels.lang[classPrivateFieldGet_default()(_this, _mediaTrackList)[i].language] : null;
                  item.className = 'op-settings__submenu-item';
                  item.tabIndex = 0;
                  item.setAttribute('role', 'menuitemradio');
                  item.setAttribute('aria-checked', classPrivateFieldGet_default()(_this, _default) === classPrivateFieldGet_default()(_this, _mediaTrackList)[i].language ? 'true' : 'false');
                  item.innerHTML = "<div class=\"op-settings__submenu-label op-subtitles__option\"\n                                        data-value=\"captions-".concat(classPrivateFieldGet_default()(_this, _mediaTrackList)[i].language, "\">\n                                        ").concat(label || classPrivateFieldGet_default()(_this, _mediaTrackList)[i].label, "\n                                    </div>");

                  classPrivateFieldGet_default()(_this, _menu).appendChild(item);
                }
              });
            }
          }
        }
      };

      for (var i = 0, trackItems = classPrivateFieldGet_default()(this, _player).getElement().querySelectorAll('track'), total = trackItems.length; i < total; i++) {
        _loop(i, trackItems, total);
      }

      classPrivateFieldSet_default()(this, _captions, document.createElement('div'));

      classPrivateFieldGet_default()(this, _captions).className = 'op-captions';
      classPrivateFieldGet_default()(this, _captions).innerHTML = '<span></span>';

      var container = classPrivateFieldGet_default()(this, _captions).querySelector('span');

      classPrivateFieldGet_default()(this, _events).media.timeupdate = function () {
        if (classPrivateFieldGet_default()(_this, _player).isMedia()) {
          if (classPrivateFieldGet_default()(_this, _currentTrack)) {
            var currentCues = classPrivateFieldGet_default()(_this, _langTracks)[classPrivateFieldGet_default()(_this, _currentTrack).language];

            if (container && currentCues !== undefined) {
              var index = _this._search(currentCues, classPrivateFieldGet_default()(_this, _player).getMedia().currentTime);

              container.innerHTML = '';

              if (index > -1 && classPrivateFieldGet_default()(_this, _button).classList.contains('op-controls__captions--on')) {
                classPrivateFieldGet_default()(_this, _captions).classList.add('op-captions--on');

                container.innerHTML = sanitize(currentCues[index].text, false);
              } else {
                _this._hideCaptions();
              }
            }
          } else {
            _this._hideCaptions();
          }
        } else {
          _this._hideCaptions();
        }
      };

      classPrivateFieldGet_default()(this, _events).button.click = function (e) {
        var button = e.target;

        if (detachMenus) {
          var menus = classPrivateFieldGet_default()(_this, _player).getContainer().querySelectorAll('.op-settings');

          for (var _i2 = 0, _total2 = menus.length; _i2 < _total2; ++_i2) {
            if (menus[_i2] !== classPrivateFieldGet_default()(_this, _menu)) {
              menus[_i2].setAttribute('aria-hidden', 'true');
            }
          }

          if (classPrivateFieldGet_default()(_this, _menu).getAttribute('aria-hidden') === 'true') {
            classPrivateFieldGet_default()(_this, _menu).setAttribute('aria-hidden', 'false');
          } else {
            classPrivateFieldGet_default()(_this, _menu).setAttribute('aria-hidden', 'true');
          }
        } else {
          button.setAttribute('aria-pressed', 'true');

          if (button.classList.contains('op-controls__captions--on')) {
            _this._hideCaptions();

            button.classList.remove('op-controls__captions--on');
            button.setAttribute('data-active-captions', 'off');
          } else {
            if (!classPrivateFieldGet_default()(_this, _currentTrack)) {
              var _classPrivateFieldGet3 = classPrivateFieldGet_default()(_this, _mediaTrackList),
                  _classPrivateFieldGet4 = slicedToArray_default()(_classPrivateFieldGet3, 1),
                  track = _classPrivateFieldGet4[0];

              classPrivateFieldSet_default()(_this, _currentTrack, track);
            }

            _this._displayCaptions();

            button.classList.add('op-controls__captions--on');
            button.setAttribute('data-active-captions', classPrivateFieldGet_default()(_this, _currentTrack).language);
          }
        }
      };

      classPrivateFieldGet_default()(this, _events).button.mouseover = function () {
        if (!IS_IOS && !IS_ANDROID && detachMenus) {
          var menus = classPrivateFieldGet_default()(_this, _player).getContainer().querySelectorAll('.op-settings');

          for (var _i3 = 0, _total3 = menus.length; _i3 < _total3; ++_i3) {
            if (menus[_i3] !== classPrivateFieldGet_default()(_this, _menu)) {
              menus[_i3].setAttribute('aria-hidden', 'true');
            }
          }

          if (classPrivateFieldGet_default()(_this, _menu).getAttribute('aria-hidden') === 'true') {
            classPrivateFieldGet_default()(_this, _menu).setAttribute('aria-hidden', 'false');
          }
        }
      };

      classPrivateFieldGet_default()(this, _events).button.mouseout = function () {
        if (!IS_IOS && !IS_ANDROID && detachMenus) {
          var menus = classPrivateFieldGet_default()(_this, _player).getContainer().querySelectorAll('.op-settings');

          for (var _i4 = 0, _total4 = menus.length; _i4 < _total4; ++_i4) {
            menus[_i4].setAttribute('aria-hidden', 'true');
          }

          if (classPrivateFieldGet_default()(_this, _menu).getAttribute('aria-hidden') === 'false') {
            classPrivateFieldGet_default()(_this, _menu).setAttribute('aria-hidden', 'true');
          }
        }
      };

      if (classPrivateFieldGet_default()(this, _hasTracks)) {
        var target = classPrivateFieldGet_default()(this, _player).getContainer();

        target.insertBefore(classPrivateFieldGet_default()(this, _captions), target.firstChild);

        if (detachMenus) {
          var itemContainer = document.createElement('div');
          itemContainer.className = "op-controls__container op-control__".concat(classPrivateFieldGet_default()(this, _controlPosition));
          itemContainer.appendChild(classPrivateFieldGet_default()(this, _button));
          itemContainer.appendChild(classPrivateFieldGet_default()(this, _menu));

          classPrivateFieldGet_default()(this, _player).getControls().getLayer(classPrivateFieldGet_default()(this, _controlLayer)).appendChild(itemContainer);
        } else {
          classPrivateFieldGet_default()(this, _player).getControls().getLayer(classPrivateFieldGet_default()(this, _controlLayer)).appendChild(classPrivateFieldGet_default()(this, _button));
        }

        classPrivateFieldGet_default()(this, _button).addEventListener('click', classPrivateFieldGet_default()(this, _events).button.click, EVENT_OPTIONS);
      }

      if (classPrivateFieldGet_default()(this, _mediaTrackList).length <= 1 && !detachMenus || !classPrivateFieldGet_default()(this, _mediaTrackList).length && detachMenus) {
        return;
      }

      classPrivateFieldGet_default()(this, _events).global.click = function (e) {
        var option = e.target;

        if (option.closest("#".concat(classPrivateFieldGet_default()(_this, _player).id)) && option.classList.contains('op-subtitles__option')) {
          var langEl = option.getAttribute('data-value');
          var language = langEl ? langEl.replace('captions-', '') : '';
          var currentLang = Array.from(classPrivateFieldGet_default()(_this, _mediaTrackList)).filter(function (item) {
            return item.language === language;
          });

          classPrivateFieldSet_default()(_this, _currentTrack, currentLang ? currentLang.pop() : undefined);

          if (detachMenus) {
            if (classPrivateFieldGet_default()(_this, _button).classList.contains('op-controls__captions--on')) {
              _this._hideCaptions();

              classPrivateFieldGet_default()(_this, _button).classList.remove('op-controls__captions--on');

              classPrivateFieldGet_default()(_this, _button).setAttribute('data-active-captions', 'off');
            } else {
              _this._displayCaptions();

              classPrivateFieldGet_default()(_this, _button).classList.add('op-controls__captions--on');

              classPrivateFieldGet_default()(_this, _button).setAttribute('data-active-captions', language);
            }

            if (option.parentElement && option.parentElement.parentElement) {
              var captions = option.parentElement.parentElement.querySelectorAll('.op-settings__submenu-item');

              for (var _i5 = 0, _total5 = captions.length; _i5 < _total5; ++_i5) {
                captions[_i5].setAttribute('aria-checked', 'false');
              }
            }

            if (option.parentElement) {
              option.parentElement.setAttribute('aria-checked', 'true');
            }

            classPrivateFieldGet_default()(_this, _menu).setAttribute('aria-hidden', 'false');
          } else {
            _this._displayCaptions();

            classPrivateFieldGet_default()(_this, _button).setAttribute('data-active-captions', language);
          }

          var event = addEvent('captionschanged');

          classPrivateFieldGet_default()(_this, _player).getElement().dispatchEvent(event);
        }
      };

      if (detachMenus) {
        classPrivateFieldGet_default()(this, _button).addEventListener('mouseover', classPrivateFieldGet_default()(this, _events).button.mouseover, EVENT_OPTIONS);

        classPrivateFieldGet_default()(this, _menu).addEventListener('mouseover', classPrivateFieldGet_default()(this, _events).button.mouseover, EVENT_OPTIONS);

        classPrivateFieldGet_default()(this, _menu).addEventListener('mouseout', classPrivateFieldGet_default()(this, _events).button.mouseout, EVENT_OPTIONS);

        classPrivateFieldGet_default()(this, _player).getElement().addEventListener('controlshidden', classPrivateFieldGet_default()(this, _events).button.mouseout, EVENT_OPTIONS);
      }

      if (typeof classPrivateFieldGet_default()(this, _events).global.click !== 'undefined') {
        document.addEventListener('click', classPrivateFieldGet_default()(this, _events).global.click, EVENT_OPTIONS);
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _classPrivateFieldGet5 = classPrivateFieldGet_default()(this, _player).getOptions(),
          detachMenus = _classPrivateFieldGet5.detachMenus;

      if (typeof classPrivateFieldGet_default()(this, _events).global.click !== 'undefined') {
        document.removeEventListener('click', classPrivateFieldGet_default()(this, _events).global.click);
      }

      if (classPrivateFieldGet_default()(this, _hasTracks)) {
        classPrivateFieldGet_default()(this, _button).removeEventListener('click', classPrivateFieldGet_default()(this, _events).button.click);

        if (detachMenus) {
          classPrivateFieldGet_default()(this, _button).removeEventListener('mouseover', classPrivateFieldGet_default()(this, _events).button.mouseover);

          classPrivateFieldGet_default()(this, _menu).removeEventListener('mouseover', classPrivateFieldGet_default()(this, _events).button.mouseover);

          classPrivateFieldGet_default()(this, _menu).removeEventListener('mouseout', classPrivateFieldGet_default()(this, _events).button.mouseout);

          classPrivateFieldGet_default()(this, _player).getElement().removeEventListener('controlshidden', classPrivateFieldGet_default()(this, _events).button.mouseout);

          classPrivateFieldGet_default()(this, _menu).remove();
        }

        classPrivateFieldGet_default()(this, _player).getElement().removeEventListener('timeupdate', classPrivateFieldGet_default()(this, _events).media.timeupdate);

        classPrivateFieldGet_default()(this, _button).remove();

        classPrivateFieldGet_default()(this, _captions).remove();
      }
    }
  }, {
    key: "addSettings",
    value: function addSettings() {
      var _classPrivateFieldGet6 = classPrivateFieldGet_default()(this, _player).getOptions(),
          detachMenus = _classPrivateFieldGet6.detachMenus,
          labels = _classPrivateFieldGet6.labels;

      if (detachMenus || classPrivateFieldGet_default()(this, _mediaTrackList).length <= 1) {
        return {};
      }

      var subitems = this._formatMenuItems();

      return subitems.length > 2 ? {
        className: 'op-subtitles__option',
        default: classPrivateFieldGet_default()(this, _default) || 'off',
        key: 'captions',
        name: (labels === null || labels === void 0 ? void 0 : labels.captions) || '',
        subitems: subitems
      } : {};
    }
  }, {
    key: "_getCuesFromText",
    value: function _getCuesFromText(vttText) {
      var lines = vttText.split(/\r?\n/);
      var entries = [];
      var urlRegexp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;
      var timePattern = '^((?:[0-9]{1,2}:)?[0-9]{2}:[0-9]{2}([,.][0-9]{1,3})?) --> ';
      timePattern += '((?:[0-9]{1,2}:)?[0-9]{2}:[0-9]{2}([,.][0-9]{3})?)(.*?)$';
      var regexp = new RegExp(timePattern);
      var identifier;

      for (var i = 0, total = lines.length; i < total; i++) {
        var timeCode = regexp.exec(lines[i]);

        if (timeCode && i < lines.length) {
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
          var initTime = timeToSeconds(timeCode[1]);
          entries.push({
            endTime: timeToSeconds(timeCode[3]),
            identifier: identifier || '',
            settings: isJson(timeCode[5]) ? JSON.parse(timeCode[5]) : {},
            startTime: initTime === 0 ? 0.2 : initTime,
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
      var trackCues = track.cues;
      Object.keys(trackCues).forEach(function (index) {
        var j = parseInt(index, 10);
        var current = trackCues[j];
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
    key: "_displayCaptions",
    value: function _displayCaptions() {
      if (!classPrivateFieldGet_default()(this, _captions) || !classPrivateFieldGet_default()(this, _currentTrack) || classPrivateFieldGet_default()(this, _currentTrack).cues === undefined) {
        return;
      }

      var container = classPrivateFieldGet_default()(this, _captions).querySelector('span');

      if (container) {
        container.innerHTML = '';
      }

      classPrivateFieldGet_default()(this, _player).getElement().addEventListener('timeupdate', classPrivateFieldGet_default()(this, _events).media.timeupdate, EVENT_OPTIONS);
    }
  }, {
    key: "_hideCaptions",
    value: function _hideCaptions() {
      classPrivateFieldGet_default()(this, _captions).classList.remove('op-captions--on');

      if (!classPrivateFieldGet_default()(this, _currentTrack)) {
        classPrivateFieldGet_default()(this, _button).classList.remove('op-controls__captions--on');

        classPrivateFieldGet_default()(this, _button).setAttribute('data-active-captions', 'off');
      }
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
        }

        if (start < currentTime) {
          low = mid + 1;
        } else if (start > currentTime) {
          high = mid - 1;
        }
      }

      return -1;
    }
  }, {
    key: "_prepareTrack",
    value: function _prepareTrack(index, language, trackUrl) {
      var _this2 = this;

      var showTrack = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      classPrivateFieldGet_default()(this, _trackUrlList)[language] = trackUrl;
      classPrivateFieldGet_default()(this, _mediaTrackList)[index].mode = 'disabled';

      if (showTrack) {
        classPrivateFieldSet_default()(this, _default, language);

        classPrivateFieldGet_default()(this, _button).classList.add('op-controls__captions--on');

        classPrivateFieldGet_default()(this, _button).setAttribute('data-active-captions', language);

        classPrivateFieldSet_default()(this, _currentTrack, Array.from(classPrivateFieldGet_default()(this, _mediaTrackList)).filter(function (item) {
          return item.language === classPrivateFieldGet_default()(_this2, _default);
        }).pop());

        this._displayCaptions();

        if (!classPrivateFieldGet_default()(this, _player).getContainer().classList.contains('op-captions--detected')) {
          classPrivateFieldGet_default()(this, _player).getContainer().classList.add('op-captions--detected');
        }
      }
    }
  }, {
    key: "_formatMenuItems",
    value: function _formatMenuItems() {
      var _this3 = this;

      var _classPrivateFieldGet7 = classPrivateFieldGet_default()(this, _player).getOptions(),
          labels = _classPrivateFieldGet7.labels;

      var items = [{
        key: 'off',
        label: (labels === null || labels === void 0 ? void 0 : labels.off) || ''
      }];

      var _loop2 = function _loop2(i, total) {
        var track = classPrivateFieldGet_default()(_this3, _mediaTrackList)[i];

        var label = labels !== null && labels !== void 0 && labels.lang ? labels.lang[track.language] : null;
        items = items.filter(function (el) {
          return el.key !== track.language;
        });
        items.push({
          key: track.language,
          label: label || classPrivateFieldGet_default()(_this3, _mediaTrackList)[i].label
        });
      };

      for (var i = 0, total = classPrivateFieldGet_default()(this, _mediaTrackList).length; i < total; i++) {
        _loop2(i, total);
      }

      return items;
    }
  }]);

  return Captions;
}();

/* harmony default export */ const captions = (Captions);
;// CONCATENATED MODULE: ./src/controls/fullscreen.ts






function fullscreen_classPrivateFieldInitSpec(obj, privateMap, value) { fullscreen_checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function fullscreen_checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }



var fullscreen_player = new WeakMap();

var _isFullscreen = new WeakMap();

var fullscreen_button = new WeakMap();

var _fullscreenEvents = new WeakMap();

var _fullscreenWidth = new WeakMap();

var _fullscreenHeight = new WeakMap();

var _clickEvent = new WeakMap();

var fullscreen_controlPosition = new WeakMap();

var fullscreen_controlLayer = new WeakMap();

var Fullscreen = function () {
  function Fullscreen(player, position, layer) {
    var _this = this;

    classCallCheck_default()(this, Fullscreen);

    defineProperty_default()(this, "fullScreenEnabled", void 0);

    fullscreen_classPrivateFieldInitSpec(this, fullscreen_player, {
      writable: true,
      value: void 0
    });

    fullscreen_classPrivateFieldInitSpec(this, _isFullscreen, {
      writable: true,
      value: void 0
    });

    fullscreen_classPrivateFieldInitSpec(this, fullscreen_button, {
      writable: true,
      value: void 0
    });

    fullscreen_classPrivateFieldInitSpec(this, _fullscreenEvents, {
      writable: true,
      value: []
    });

    fullscreen_classPrivateFieldInitSpec(this, _fullscreenWidth, {
      writable: true,
      value: 0
    });

    fullscreen_classPrivateFieldInitSpec(this, _fullscreenHeight, {
      writable: true,
      value: 0
    });

    fullscreen_classPrivateFieldInitSpec(this, _clickEvent, {
      writable: true,
      value: void 0
    });

    fullscreen_classPrivateFieldInitSpec(this, fullscreen_controlPosition, {
      writable: true,
      value: void 0
    });

    fullscreen_classPrivateFieldInitSpec(this, fullscreen_controlLayer, {
      writable: true,
      value: void 0
    });

    classPrivateFieldSet_default()(this, fullscreen_player, player);

    classPrivateFieldSet_default()(this, fullscreen_controlPosition, position);

    classPrivateFieldSet_default()(this, fullscreen_controlLayer, layer);

    classPrivateFieldSet_default()(this, _isFullscreen, document.body.classList.contains('op-fullscreen__on'));

    var target = document;
    this.fullScreenEnabled = !!(target.fullscreenEnabled || target.mozFullScreenEnabled || target.msFullscreenEnabled || target.webkitSupportsFullscreen || target.webkitFullscreenEnabled || document.createElement('video').webkitRequestFullScreen);
    this._enterSpaceKeyEvent = this._enterSpaceKeyEvent.bind(this);
    this._resize = this._resize.bind(this);
    this._fullscreenChange = this._fullscreenChange.bind(this);
    this._setFullscreen = this._setFullscreen.bind(this);
    this._unsetFullscreen = this._unsetFullscreen.bind(this);

    classPrivateFieldSet_default()(this, _fullscreenEvents, ['fullscreenchange', 'mozfullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange']);

    classPrivateFieldGet_default()(this, _fullscreenEvents).forEach(function (event) {
      document.addEventListener(event, _this._fullscreenChange, EVENT_OPTIONS);
    });

    this._setFullscreenData(false);

    classPrivateFieldGet_default()(this, fullscreen_player).getContainer().addEventListener('keydown', this._enterSpaceKeyEvent, EVENT_OPTIONS);

    if (IS_IPHONE) {
      classPrivateFieldGet_default()(this, fullscreen_player).getElement().addEventListener('webkitbeginfullscreen', this._setFullscreen, EVENT_OPTIONS);

      classPrivateFieldGet_default()(this, fullscreen_player).getElement().addEventListener('webkitendfullscreen', this._unsetFullscreen, EVENT_OPTIONS);
    }
  }

  createClass_default()(Fullscreen, [{
    key: "create",
    value: function create() {
      var _this2 = this;

      var _classPrivateFieldGet2 = classPrivateFieldGet_default()(this, fullscreen_player).getOptions(),
          labels = _classPrivateFieldGet2.labels;

      classPrivateFieldSet_default()(this, fullscreen_button, document.createElement('button'));

      classPrivateFieldGet_default()(this, fullscreen_button).type = 'button';
      classPrivateFieldGet_default()(this, fullscreen_button).className = "op-controls__fullscreen op-control__".concat(classPrivateFieldGet_default()(this, fullscreen_controlPosition));
      classPrivateFieldGet_default()(this, fullscreen_button).tabIndex = 0;
      classPrivateFieldGet_default()(this, fullscreen_button).title = (labels === null || labels === void 0 ? void 0 : labels.fullscreen) || '';

      classPrivateFieldGet_default()(this, fullscreen_button).setAttribute('aria-controls', classPrivateFieldGet_default()(this, fullscreen_player).id);

      classPrivateFieldGet_default()(this, fullscreen_button).setAttribute('aria-pressed', 'false');

      classPrivateFieldGet_default()(this, fullscreen_button).setAttribute('aria-label', (labels === null || labels === void 0 ? void 0 : labels.fullscreen) || '');

      classPrivateFieldSet_default()(this, _clickEvent, function () {
        classPrivateFieldGet_default()(_this2, fullscreen_button).setAttribute('aria-pressed', 'true');

        _this2.toggleFullscreen();
      });

      classPrivateFieldSet_default()(this, _clickEvent, classPrivateFieldGet_default()(this, _clickEvent).bind(this));

      classPrivateFieldGet_default()(this, fullscreen_button).addEventListener('click', classPrivateFieldGet_default()(this, _clickEvent), EVENT_OPTIONS);

      classPrivateFieldGet_default()(this, fullscreen_player).getControls().getLayer(classPrivateFieldGet_default()(this, fullscreen_controlLayer)).appendChild(classPrivateFieldGet_default()(this, fullscreen_button));
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this3 = this;

      classPrivateFieldGet_default()(this, fullscreen_player).getContainer().removeEventListener('keydown', this._enterSpaceKeyEvent);

      classPrivateFieldGet_default()(this, _fullscreenEvents).forEach(function (event) {
        document.removeEventListener(event, _this3._fullscreenChange);
      });

      if (IS_IPHONE) {
        classPrivateFieldGet_default()(this, fullscreen_player).getElement().removeEventListener('webkitbeginfullscreen', this._setFullscreen);

        classPrivateFieldGet_default()(this, fullscreen_player).getElement().removeEventListener('webkitendfullscreen', this._unsetFullscreen);
      }

      classPrivateFieldGet_default()(this, fullscreen_button).removeEventListener('click', classPrivateFieldGet_default()(this, _clickEvent));

      classPrivateFieldGet_default()(this, fullscreen_button).remove();
    }
  }, {
    key: "toggleFullscreen",
    value: function toggleFullscreen() {
      if (classPrivateFieldGet_default()(this, _isFullscreen)) {
        var target = document;

        if (target.exitFullscreen) {
          target.exitFullscreen();
        } else if (target.mozCancelFullScreen) {
          target.mozCancelFullScreen();
        } else if (target.webkitCancelFullScreen) {
          target.webkitCancelFullScreen();
        } else if (target.msExitFullscreen) {
          target.msExitFullscreen();
        } else {
          this._fullscreenChange();
        }

        document.body.classList.remove('op-fullscreen__on');
      } else {
        var video = classPrivateFieldGet_default()(this, fullscreen_player).getElement();

        classPrivateFieldSet_default()(this, _fullscreenWidth, window.screen.width);

        classPrivateFieldSet_default()(this, _fullscreenHeight, window.screen.height);

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

        document.body.classList.add('op-fullscreen__on');
      }

      if (typeof window !== 'undefined' && (IS_ANDROID || IS_IPHONE)) {
        var _window = window,
            screen = _window.screen;

        if (screen.orientation && !classPrivateFieldGet_default()(this, _isFullscreen)) {
          screen.orientation.lock('landscape');
        }
      }
    }
  }, {
    key: "_fullscreenChange",
    value: function _fullscreenChange() {
      var width = classPrivateFieldGet_default()(this, _isFullscreen) ? undefined : classPrivateFieldGet_default()(this, _fullscreenWidth);
      var height = classPrivateFieldGet_default()(this, _isFullscreen) ? undefined : classPrivateFieldGet_default()(this, _fullscreenHeight);

      this._setFullscreenData(!classPrivateFieldGet_default()(this, _isFullscreen));

      if (classPrivateFieldGet_default()(this, fullscreen_player).isAd()) {
        classPrivateFieldGet_default()(this, fullscreen_player).getAd().resizeAds(width, height);
      }

      classPrivateFieldSet_default()(this, _isFullscreen, !classPrivateFieldGet_default()(this, _isFullscreen));

      if (classPrivateFieldGet_default()(this, _isFullscreen)) {
        document.body.classList.add('op-fullscreen__on');
      } else {
        document.body.classList.remove('op-fullscreen__on');
      }

      this._resize(width, height);
    }
  }, {
    key: "_setFullscreenData",
    value: function _setFullscreenData(isFullscreen) {
      classPrivateFieldGet_default()(this, fullscreen_player).getContainer().setAttribute('data-fullscreen', (!!isFullscreen).toString());

      if (classPrivateFieldGet_default()(this, fullscreen_button)) {
        if (isFullscreen) {
          classPrivateFieldGet_default()(this, fullscreen_button).classList.add('op-controls__fullscreen--out');
        } else {
          classPrivateFieldGet_default()(this, fullscreen_button).classList.remove('op-controls__fullscreen--out');
        }
      }
    }
  }, {
    key: "_resize",
    value: function _resize(width, height) {
      var wrapper = classPrivateFieldGet_default()(this, fullscreen_player).getContainer();

      var video = classPrivateFieldGet_default()(this, fullscreen_player).getElement();

      var options = classPrivateFieldGet_default()(this, fullscreen_player).getOptions();

      var styles = '';

      if (width) {
        wrapper.style.width = '100%';
        video.style.width = '100%';
      } else if (options.width) {
        var defaultWidth = typeof options.width === 'number' ? "".concat(options.width, "px") : options.width;
        styles += "width: ".concat(defaultWidth, " !important;");
        video.style.removeProperty('width');
      } else {
        video.style.removeProperty('width');
        wrapper.style.removeProperty('width');
      }

      if (height) {
        video.style.height = '100%';
        wrapper.style.height = '100%';
      } else if (options.height) {
        var defaultHeight = typeof options.height === 'number' ? "".concat(options.height, "px") : options.height;
        styles += "height: ".concat(defaultHeight, " !important;");
        video.style.removeProperty('height');
      } else {
        video.style.removeProperty('height');
        wrapper.style.removeProperty('height');
      }

      if (styles) {
        wrapper.setAttribute('style', styles);
      }
    }
  }, {
    key: "_enterSpaceKeyEvent",
    value: function _enterSpaceKeyEvent(e) {
      var _document, _document$activeEleme;

      var key = e.which || e.keyCode || 0;
      var fullscreenBtnFocused = (_document = document) === null || _document === void 0 ? void 0 : (_document$activeEleme = _document.activeElement) === null || _document$activeEleme === void 0 ? void 0 : _document$activeEleme.classList.contains('op-controls__fullscreen');

      if (fullscreenBtnFocused && (key === 13 || key === 32)) {
        this.toggleFullscreen();
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }, {
    key: "_setFullscreen",
    value: function _setFullscreen() {
      classPrivateFieldSet_default()(this, _isFullscreen, true);

      this._setFullscreenData(true);

      document.body.classList.add('op-fullscreen__on');
    }
  }, {
    key: "_unsetFullscreen",
    value: function _unsetFullscreen() {
      classPrivateFieldSet_default()(this, _isFullscreen, false);

      this._setFullscreenData(false);

      document.body.classList.remove('op-fullscreen__on');
    }
  }]);

  return Fullscreen;
}();

/* harmony default export */ const fullscreen = (Fullscreen);
;// CONCATENATED MODULE: ./src/utils/media.ts

function getExtension(url) {
  var baseUrl = url.split('?')[0];
  var baseFrags = (baseUrl || '').split('\\');
  var baseUrlFragment = (baseFrags || []).pop();
  var baseNameFrags = (baseUrlFragment || '').split('/');
  var baseName = (baseNameFrags || []).pop() || '';
  return baseName.includes('.') ? baseName.substring(baseName.lastIndexOf('.') + 1) : '';
}
function isHlsSource(media) {
  return /\.m3u8$/i.test(media.src) || ['application/x-mpegURL', 'application/vnd.apple.mpegurl'].includes(media.type);
}
function isM3USource(media) {
  return /\.m3u$/i.test(media.src);
}
function isDashSource(media) {
  return /\.mpd/i.test(media.src) || media.type === 'application/dash+xml';
}
function isFlvSource(media) {
  return /(^rtmp:\/\/|\.flv$)/i.test(media.src) || ['video/x-flv', 'video/flv'].includes(media.type);
}
function predictMimeType(url, element) {
  var extension = getExtension(url);

  if (!extension) {
    return isAudio(element) ? 'audio/mp3' : 'video/mp4';
  }

  switch (extension) {
    case 'm3u8':
    case 'm3u':
      return 'application/x-mpegURL';

    case 'mpd':
      return 'application/dash+xml';

    case 'mp4':
      return isAudio(element) ? 'audio/mp4' : 'video/mp4';

    case 'mp3':
      return 'audio/mp3';

    case 'webm':
      return isAudio(element) ? 'audio/webm' : 'video/webm';

    case 'ogg':
      return isAudio(element) ? 'audio/ogg' : 'video/ogg';

    case 'ogv':
      return 'video/ogg';

    case 'oga':
      return 'audio/ogg';

    case '3gp':
      return 'audio/3gpp';

    case 'wav':
      return 'audio/wav';

    case 'aac':
      return 'audio/aac';

    case 'flac':
      return 'audio/flac';

    default:
      return isAudio(element) ? 'audio/mp3' : 'video/mp4';
  }
}
function isAutoplaySupported(media, defaultVol, autoplay, muted, callback) {
  var playPromise = media.play();

  if (playPromise !== undefined) {
    playPromise.then(function () {
      media.pause();
      autoplay(true);
      muted(false);
      callback();
    }).catch(function () {
      media.volume = 0;
      media.muted = true;
      media.play().then(function () {
        media.pause();
        autoplay(true);
        muted(true);
        callback();
      }).catch(function () {
        media.volume = defaultVol;
        media.muted = false;
        autoplay(false);
        muted(false);
        callback();
      });
    });
  } else {
    autoplay(!media.paused || 'Promise' in window && playPromise instanceof Promise);
    media.pause();
    muted(false);
    callback();
  }
}
;// CONCATENATED MODULE: ./src/controls/levels.ts






function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { defineProperty_default()(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function levels_classPrivateFieldInitSpec(obj, privateMap, value) { levels_checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function levels_checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }





var levels_player = new WeakMap();

var levels_button = new WeakMap();

var levels_menu = new WeakMap();

var levels_events = new WeakMap();

var _levels = new WeakMap();

var _defaultLevel = new WeakMap();

var levels_controlPosition = new WeakMap();

var levels_controlLayer = new WeakMap();

var Levels = function () {
  function Levels(player, position, layer) {
    classCallCheck_default()(this, Levels);

    levels_classPrivateFieldInitSpec(this, levels_player, {
      writable: true,
      value: void 0
    });

    levels_classPrivateFieldInitSpec(this, levels_button, {
      writable: true,
      value: void 0
    });

    levels_classPrivateFieldInitSpec(this, levels_menu, {
      writable: true,
      value: void 0
    });

    levels_classPrivateFieldInitSpec(this, levels_events, {
      writable: true,
      value: {
        button: {},
        global: {},
        media: {}
      }
    });

    levels_classPrivateFieldInitSpec(this, _levels, {
      writable: true,
      value: []
    });

    levels_classPrivateFieldInitSpec(this, _defaultLevel, {
      writable: true,
      value: ''
    });

    levels_classPrivateFieldInitSpec(this, levels_controlPosition, {
      writable: true,
      value: void 0
    });

    levels_classPrivateFieldInitSpec(this, levels_controlLayer, {
      writable: true,
      value: void 0
    });

    classPrivateFieldSet_default()(this, levels_player, player);

    classPrivateFieldSet_default()(this, levels_controlPosition, position);

    classPrivateFieldSet_default()(this, levels_controlLayer, layer);
  }

  createClass_default()(Levels, [{
    key: "create",
    value: function create() {
      var _this = this;

      var _classPrivateFieldGet2 = classPrivateFieldGet_default()(this, levels_player).getOptions(),
          labels = _classPrivateFieldGet2.labels,
          startLevel = _classPrivateFieldGet2.defaultLevel,
          detachMenus = _classPrivateFieldGet2.detachMenus;

      var initialLevel = startLevel !== null ? parseInt(startLevel || '0', 10) : classPrivateFieldGet_default()(this, levels_player).getMedia().level;

      classPrivateFieldSet_default()(this, _defaultLevel, "".concat(initialLevel));

      var menuItems = this._formatMenuItems();

      var defaultLevel = menuItems.length ? menuItems.find(function (items) {
        return items.key === classPrivateFieldGet_default()(_this, _defaultLevel);
      }) : null;
      var defaultLabel = defaultLevel ? defaultLevel.label : (labels === null || labels === void 0 ? void 0 : labels.auto) || '';
      var levelSet = false;

      classPrivateFieldSet_default()(this, levels_button, document.createElement('button'));

      classPrivateFieldGet_default()(this, levels_button).className = "op-controls__levels op-control__".concat(classPrivateFieldGet_default()(this, levels_controlPosition));
      classPrivateFieldGet_default()(this, levels_button).tabIndex = 0;
      classPrivateFieldGet_default()(this, levels_button).title = (labels === null || labels === void 0 ? void 0 : labels.mediaLevels) || '';

      classPrivateFieldGet_default()(this, levels_button).setAttribute('aria-controls', classPrivateFieldGet_default()(this, levels_player).id);

      classPrivateFieldGet_default()(this, levels_button).setAttribute('aria-label', (labels === null || labels === void 0 ? void 0 : labels.mediaLevels) || '');

      classPrivateFieldGet_default()(this, levels_button).setAttribute('data-active-level', classPrivateFieldGet_default()(this, _defaultLevel));

      classPrivateFieldGet_default()(this, levels_button).innerHTML = "<span>".concat(defaultLabel, "</span>");

      var loadLevelsEvent = function loadLevelsEvent() {
        if (!classPrivateFieldGet_default()(_this, _levels).length) {
          _this._gatherLevels();

          setTimeout(function () {
            classPrivateFieldGet_default()(_this, levels_player).getMedia().level = initialLevel;
            var e = addEvent('controlschanged');

            classPrivateFieldGet_default()(_this, levels_player).getElement().dispatchEvent(e);
          }, 0);
        } else if (!levelSet) {
          classPrivateFieldGet_default()(_this, levels_player).getMedia().level = initialLevel;
          levelSet = true;
        }
      };

      classPrivateFieldGet_default()(this, levels_events).media.loadedmetadata = loadLevelsEvent.bind(this);
      classPrivateFieldGet_default()(this, levels_events).media.manifestLoaded = loadLevelsEvent.bind(this);
      classPrivateFieldGet_default()(this, levels_events).media.hlsManifestParsed = loadLevelsEvent.bind(this);

      if (detachMenus) {
        this._buildMenu();

        classPrivateFieldGet_default()(this, levels_events).button.click = function () {
          if (detachMenus) {
            var menus = classPrivateFieldGet_default()(_this, levels_player).getContainer().querySelectorAll('.op-settings');

            for (var i = 0, total = menus.length; i < total; ++i) {
              if (menus[i] !== classPrivateFieldGet_default()(_this, levels_menu)) {
                menus[i].setAttribute('aria-hidden', 'true');
              }
            }

            if (classPrivateFieldGet_default()(_this, levels_menu).getAttribute('aria-hidden') === 'true') {
              classPrivateFieldGet_default()(_this, levels_menu).setAttribute('aria-hidden', 'false');
            } else {
              classPrivateFieldGet_default()(_this, levels_menu).setAttribute('aria-hidden', 'true');
            }
          }
        };

        classPrivateFieldGet_default()(this, levels_events).button.mouseover = function () {
          if (!IS_IOS && !IS_ANDROID) {
            var menus = classPrivateFieldGet_default()(_this, levels_player).getContainer().querySelectorAll('.op-settings');

            for (var i = 0, total = menus.length; i < total; ++i) {
              if (menus[i] !== classPrivateFieldGet_default()(_this, levels_menu)) {
                menus[i].setAttribute('aria-hidden', 'true');
              }
            }

            if (classPrivateFieldGet_default()(_this, levels_menu).getAttribute('aria-hidden') === 'true') {
              classPrivateFieldGet_default()(_this, levels_menu).setAttribute('aria-hidden', 'false');
            }
          }
        };

        classPrivateFieldGet_default()(this, levels_events).button.mouseout = function () {
          if (!IS_IOS && !IS_ANDROID) {
            var menus = classPrivateFieldGet_default()(_this, levels_player).getContainer().querySelectorAll('.op-settings');

            for (var i = 0, total = menus.length; i < total; ++i) {
              menus[i].setAttribute('aria-hidden', 'true');
            }

            if (classPrivateFieldGet_default()(_this, levels_menu).getAttribute('aria-hidden') === 'false') {
              classPrivateFieldGet_default()(_this, levels_menu).setAttribute('aria-hidden', 'true');
            }
          }
        };

        classPrivateFieldGet_default()(this, levels_button).addEventListener('click', classPrivateFieldGet_default()(this, levels_events).button.click, EVENT_OPTIONS);

        classPrivateFieldGet_default()(this, levels_button).addEventListener('mouseover', classPrivateFieldGet_default()(this, levels_events).button.mouseover, EVENT_OPTIONS);

        classPrivateFieldGet_default()(this, levels_menu).addEventListener('mouseover', classPrivateFieldGet_default()(this, levels_events).button.mouseover, EVENT_OPTIONS);

        classPrivateFieldGet_default()(this, levels_menu).addEventListener('mouseout', classPrivateFieldGet_default()(this, levels_events).button.mouseout, EVENT_OPTIONS);

        classPrivateFieldGet_default()(this, levels_player).getElement().addEventListener('controlshidden', classPrivateFieldGet_default()(this, levels_events).button.mouseout, EVENT_OPTIONS);
      }

      classPrivateFieldGet_default()(this, levels_events).global.click = function (e) {
        var option = e.target;

        var _classPrivateFieldGet3 = classPrivateFieldGet_default()(_this, levels_player).getMedia(),
            currentTime = _classPrivateFieldGet3.currentTime;

        var isPaused = classPrivateFieldGet_default()(_this, levels_player).getMedia().paused;

        if (option.closest("#".concat(classPrivateFieldGet_default()(_this, levels_player).id)) && option.classList.contains('op-levels__option')) {
          var levelVal = option.getAttribute('data-value');
          var level = levelVal ? levelVal.replace('levels-', '') : '-1';

          classPrivateFieldSet_default()(_this, _defaultLevel, "".concat(level));

          if (detachMenus) {
            classPrivateFieldGet_default()(_this, levels_button).setAttribute('data-active-level', "".concat(level));

            classPrivateFieldGet_default()(_this, levels_button).innerHTML = "<span>".concat(sanitize(option.innerText, true), "</span>");
            var levels = option.parentElement && option.parentElement.parentElement ? option.parentElement.parentElement.querySelectorAll('.op-settings__submenu-item') : [];

            for (var i = 0, total = levels.length; i < total; ++i) {
              levels[i].setAttribute('aria-checked', 'false');
            }

            if (option.parentElement) {
              option.parentElement.setAttribute('aria-checked', 'true');
            }

            classPrivateFieldGet_default()(_this, levels_menu).setAttribute('aria-hidden', 'false');
          }

          classPrivateFieldGet_default()(_this, levels_player).getMedia().level = level;
          classPrivateFieldGet_default()(_this, levels_player).getMedia().currentTime = currentTime;

          if (!isPaused) {
            classPrivateFieldGet_default()(_this, levels_player).play();
          }

          var event = addEvent('levelchanged', {
            detail: {
              label: option.innerText.trim(),
              level: level
            }
          });

          classPrivateFieldGet_default()(_this, levels_player).getElement().dispatchEvent(event);

          e.preventDefault();
          e.stopPropagation();
        }
      };

      var connection = (NAV === null || NAV === void 0 ? void 0 : NAV.connection) || (NAV === null || NAV === void 0 ? void 0 : NAV.mozConnection) || (NAV === null || NAV === void 0 ? void 0 : NAV.webkitConnection);

      classPrivateFieldGet_default()(this, levels_events).global.connection = function () {
        var media = classPrivateFieldGet_default()(_this, levels_player).getMedia().current;

        if (!isDashSource(media) && !isHlsSource(media)) {
          var type = (connection === null || connection === void 0 ? void 0 : connection.effectiveType) || '';

          var levels = classPrivateFieldGet_default()(_this, _levels).map(function (item) {
            return _objectSpread(_objectSpread({}, item), {}, {
              resolution: parseInt(item.label.replace('p', ''), 10)
            });
          });

          var level = levels.find(function (item) {
            return item.resolution < 360;
          });

          if (type === '4g') {
            level = levels.find(function (item) {
              return item.resolution >= 720;
            });
          } else if (type === '3g') {
            level = levels.find(function (item) {
              return item.resolution >= 360 && item.resolution < 720;
            });
          }

          if (level) {
            classPrivateFieldGet_default()(_this, levels_player).pause();

            classPrivateFieldGet_default()(_this, levels_player).getMedia().level = level.id;

            classPrivateFieldGet_default()(_this, levels_player).play();
          }
        }
      };

      Object.keys(classPrivateFieldGet_default()(this, levels_events).media).forEach(function (event) {
        classPrivateFieldGet_default()(_this, levels_player).getElement().addEventListener(event, classPrivateFieldGet_default()(_this, levels_events).media[event], EVENT_OPTIONS);
      });
      document.addEventListener('click', classPrivateFieldGet_default()(this, levels_events).global.click, EVENT_OPTIONS);

      if (connection) {
        connection.addEventListener('change', classPrivateFieldGet_default()(this, levels_events).global.connection, EVENT_OPTIONS);
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this2 = this;

      var _classPrivateFieldGet4 = classPrivateFieldGet_default()(this, levels_player).getOptions(),
          detachMenus = _classPrivateFieldGet4.detachMenus;

      var connection = (NAV === null || NAV === void 0 ? void 0 : NAV.connection) || (NAV === null || NAV === void 0 ? void 0 : NAV.mozConnection) || (NAV === null || NAV === void 0 ? void 0 : NAV.webkitConnection);
      Object.keys(classPrivateFieldGet_default()(this, levels_events).media).forEach(function (event) {
        classPrivateFieldGet_default()(_this2, levels_player).getElement().removeEventListener(event, classPrivateFieldGet_default()(_this2, levels_events).media[event]);
      });
      document.removeEventListener('click', classPrivateFieldGet_default()(this, levels_events).global.click);

      if (connection) {
        connection.removeEventListener('change', classPrivateFieldGet_default()(this, levels_events).global.connection);
      }

      if (detachMenus) {
        classPrivateFieldGet_default()(this, levels_button).removeEventListener('click', classPrivateFieldGet_default()(this, levels_events).button.click);

        classPrivateFieldGet_default()(this, levels_button).remove();

        classPrivateFieldGet_default()(this, levels_button).removeEventListener('mouseover', classPrivateFieldGet_default()(this, levels_events).button.mouseover);

        classPrivateFieldGet_default()(this, levels_menu).removeEventListener('mouseover', classPrivateFieldGet_default()(this, levels_events).button.mouseover);

        classPrivateFieldGet_default()(this, levels_menu).removeEventListener('mouseout', classPrivateFieldGet_default()(this, levels_events).button.mouseout);

        classPrivateFieldGet_default()(this, levels_player).getElement().removeEventListener('controlshidden', classPrivateFieldGet_default()(this, levels_events).button.mouseout);

        classPrivateFieldGet_default()(this, levels_menu).remove();
      }
    }
  }, {
    key: "addSettings",
    value: function addSettings() {
      var _classPrivateFieldGet5 = classPrivateFieldGet_default()(this, levels_player).getOptions(),
          labels = _classPrivateFieldGet5.labels,
          detachMenus = _classPrivateFieldGet5.detachMenus;

      if (detachMenus) {
        return {};
      }

      var subitems = this._formatMenuItems();

      return subitems.length > 2 ? {
        className: 'op-levels__option',
        default: classPrivateFieldGet_default()(this, _defaultLevel) || '-1',
        key: 'levels',
        name: labels === null || labels === void 0 ? void 0 : labels.levels,
        subitems: subitems
      } : {};
    }
  }, {
    key: "_formatMenuItems",
    value: function _formatMenuItems() {
      var _classPrivateFieldGet6 = classPrivateFieldGet_default()(this, levels_player).getOptions(),
          labels = _classPrivateFieldGet6.labels;

      var levels = this._gatherLevels();

      var total = levels.length;
      var items = total ? [{
        key: '-1',
        label: labels === null || labels === void 0 ? void 0 : labels.auto
      }] : [];

      var _loop = function _loop(i) {
        var level = levels[i];
        items = items.filter(function (el) {
          return el.key !== level.id;
        });
        items.push({
          key: level.id,
          label: level.label
        });
      };

      for (var i = 0; i < total; i++) {
        _loop(i);
      }

      return items.reduce(function (acc, current) {
        var duplicate = acc.find(function (item) {
          return item.label === current.label;
        });

        if (!duplicate) {
          return acc.concat([current]);
        }

        return acc;
      }, []).sort(function (a, b) {
        return parseInt((a === null || a === void 0 ? void 0 : a.label) || '', 10) > parseInt((b === null || b === void 0 ? void 0 : b.label) || '', 10) ? 1 : -1;
      });
    }
  }, {
    key: "_getResolutionsLabel",
    value: function _getResolutionsLabel(height) {
      var _classPrivateFieldGet7 = classPrivateFieldGet_default()(this, levels_player).getOptions(),
          labels = _classPrivateFieldGet7.labels;

      if (height >= 4320) {
        return '8K';
      }

      if (height >= 2160) {
        return '4K';
      }

      if (height >= 1440) {
        return '1440p';
      }

      if (height >= 1080) {
        return '1080p';
      }

      if (height >= 720) {
        return '720p';
      }

      if (height >= 480) {
        return '480p';
      }

      if (height >= 360) {
        return '360p';
      }

      if (height >= 240) {
        return '240p';
      }

      if (height >= 144) {
        return '144p';
      }

      return (labels === null || labels === void 0 ? void 0 : labels.auto) || '';
    }
  }, {
    key: "_gatherLevels",
    value: function _gatherLevels() {
      var _this3 = this;

      if (!classPrivateFieldGet_default()(this, _levels).length) {
        classPrivateFieldGet_default()(this, levels_player).getMedia().levels.forEach(function (level) {
          classPrivateFieldGet_default()(_this3, _levels).push(_objectSpread(_objectSpread({}, level), {}, {
            label: level.label || _this3._getResolutionsLabel(level.height)
          }));
        });
      }

      return classPrivateFieldGet_default()(this, _levels);
    }
  }, {
    key: "_buildMenu",
    value: function _buildMenu() {
      var _this4 = this;

      var _classPrivateFieldGet8 = classPrivateFieldGet_default()(this, levels_player).getOptions(),
          detachMenus = _classPrivateFieldGet8.detachMenus;

      if (detachMenus) {
        classPrivateFieldGet_default()(this, levels_button).classList.add('op-control--no-hover');

        classPrivateFieldSet_default()(this, levels_menu, document.createElement('div'));

        classPrivateFieldGet_default()(this, levels_menu).className = 'op-settings op-levels__menu';

        classPrivateFieldGet_default()(this, levels_menu).setAttribute('aria-hidden', 'true');

        var className = 'op-levels__option';

        var options = this._formatMenuItems();

        var menu = "<div class=\"op-settings__menu\" role=\"menu\" id=\"menu-item-levels\">\n                ".concat(options.map(function (item) {
          return "\n                <div class=\"op-settings__submenu-item\" tabindex=\"0\" role=\"menuitemradio\"\n                    aria-checked=\"".concat(classPrivateFieldGet_default()(_this4, _defaultLevel) === item.key ? 'true' : 'false', "\">\n                    <div class=\"op-settings__submenu-label ").concat(className || '', "\" data-value=\"levels-").concat(item.key, "\">").concat(item.label, "</div>\n                </div>");
        }).join(''), "\n            </div>");
        classPrivateFieldGet_default()(this, levels_menu).innerHTML = menu;
        var itemContainer = document.createElement('div');
        itemContainer.className = "op-controls__container op-control__".concat(classPrivateFieldGet_default()(this, levels_controlPosition));
        itemContainer.appendChild(classPrivateFieldGet_default()(this, levels_button));
        itemContainer.appendChild(classPrivateFieldGet_default()(this, levels_menu));

        classPrivateFieldGet_default()(this, levels_player).getControls().getLayer(classPrivateFieldGet_default()(this, levels_controlLayer)).appendChild(itemContainer);
      }
    }
  }]);

  return Levels;
}();

/* harmony default export */ const levels = (Levels);
;// CONCATENATED MODULE: ./src/controls/play.ts





function play_classPrivateFieldInitSpec(obj, privateMap, value) { play_checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function play_checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }





var play_player = new WeakMap();

var play_button = new WeakMap();

var play_events = new WeakMap();

var play_controlPosition = new WeakMap();

var play_controlLayer = new WeakMap();

var Play = function () {
  function Play(player, position, layer) {
    classCallCheck_default()(this, Play);

    play_classPrivateFieldInitSpec(this, play_player, {
      writable: true,
      value: void 0
    });

    play_classPrivateFieldInitSpec(this, play_button, {
      writable: true,
      value: void 0
    });

    play_classPrivateFieldInitSpec(this, play_events, {
      writable: true,
      value: {
        controls: {},
        media: {}
      }
    });

    play_classPrivateFieldInitSpec(this, play_controlPosition, {
      writable: true,
      value: void 0
    });

    play_classPrivateFieldInitSpec(this, play_controlLayer, {
      writable: true,
      value: void 0
    });

    classPrivateFieldSet_default()(this, play_player, player);

    classPrivateFieldSet_default()(this, play_controlPosition, position);

    classPrivateFieldSet_default()(this, play_controlLayer, layer);

    this._enterSpaceKeyEvent = this._enterSpaceKeyEvent.bind(this);
  }

  createClass_default()(Play, [{
    key: "create",
    value: function create() {
      var _this = this,
          _classPrivateFieldGet4;

      var _classPrivateFieldGet2 = classPrivateFieldGet_default()(this, play_player).getOptions(),
          labels = _classPrivateFieldGet2.labels;

      classPrivateFieldSet_default()(this, play_button, document.createElement('button'));

      classPrivateFieldGet_default()(this, play_button).type = 'button';
      classPrivateFieldGet_default()(this, play_button).className = "op-controls__playpause op-control__".concat(classPrivateFieldGet_default()(this, play_controlPosition));
      classPrivateFieldGet_default()(this, play_button).tabIndex = 0;
      classPrivateFieldGet_default()(this, play_button).title = (labels === null || labels === void 0 ? void 0 : labels.play) || '';

      classPrivateFieldGet_default()(this, play_button).setAttribute('aria-controls', classPrivateFieldGet_default()(this, play_player).id);

      classPrivateFieldGet_default()(this, play_button).setAttribute('aria-pressed', 'false');

      classPrivateFieldGet_default()(this, play_button).setAttribute('aria-label', (labels === null || labels === void 0 ? void 0 : labels.play) || '');

      classPrivateFieldGet_default()(this, play_player).getControls().getLayer(classPrivateFieldGet_default()(this, play_controlLayer)).appendChild(classPrivateFieldGet_default()(this, play_button));

      classPrivateFieldGet_default()(this, play_events).button = function (e) {
        classPrivateFieldGet_default()(_this, play_button).setAttribute('aria-pressed', 'true');

        var el = classPrivateFieldGet_default()(_this, play_player).activeElement();

        if (el.paused || el.ended) {
          if (classPrivateFieldGet_default()(_this, play_player).getAd()) {
            classPrivateFieldGet_default()(_this, play_player).getAd().playRequested = true;
          }

          el.play();

          classPrivateFieldGet_default()(_this, play_events).media.play();
        } else {
          el.pause();

          classPrivateFieldGet_default()(_this, play_events).media.pause();
        }

        e.preventDefault();
        e.stopPropagation();
      };

      var isAudioEl = isAudio(classPrivateFieldGet_default()(this, play_player).getElement());

      classPrivateFieldGet_default()(this, play_events).media.play = function () {
        if (classPrivateFieldGet_default()(_this, play_player).activeElement().ended) {
          if (classPrivateFieldGet_default()(_this, play_player).isMedia()) {
            classPrivateFieldGet_default()(_this, play_button).classList.add('op-controls__playpause--replay');
          } else {
            classPrivateFieldGet_default()(_this, play_button).classList.add('op-controls__playpause--pause');
          }

          classPrivateFieldGet_default()(_this, play_button).title = (labels === null || labels === void 0 ? void 0 : labels.play) || '';

          classPrivateFieldGet_default()(_this, play_button).setAttribute('aria-label', (labels === null || labels === void 0 ? void 0 : labels.play) || '');
        } else {
          var _classPrivateFieldGet3;

          classPrivateFieldGet_default()(_this, play_button).classList.remove('op-controls__playpause--replay');

          classPrivateFieldGet_default()(_this, play_button).classList.add('op-controls__playpause--pause');

          classPrivateFieldGet_default()(_this, play_button).title = (labels === null || labels === void 0 ? void 0 : labels.pause) || '';

          classPrivateFieldGet_default()(_this, play_button).setAttribute('aria-label', (labels === null || labels === void 0 ? void 0 : labels.pause) || '');

          if ((_classPrivateFieldGet3 = classPrivateFieldGet_default()(_this, play_player).getOptions()) !== null && _classPrivateFieldGet3 !== void 0 && _classPrivateFieldGet3.pauseOthers) {
            Object.keys(player.instances).forEach(function (key) {
              if (key !== classPrivateFieldGet_default()(_this, play_player).id) {
                var target = player.instances[key].activeElement();
                target.pause();
              }
            });
          }
        }
      };

      classPrivateFieldGet_default()(this, play_events).media.loadedmetadata = function () {
        if (classPrivateFieldGet_default()(_this, play_button).classList.contains('op-controls__playpause--pause')) {
          classPrivateFieldGet_default()(_this, play_button).classList.remove('op-controls__playpause--replay');

          classPrivateFieldGet_default()(_this, play_button).classList.remove('op-controls__playpause--pause');

          classPrivateFieldGet_default()(_this, play_button).title = (labels === null || labels === void 0 ? void 0 : labels.play) || '';

          classPrivateFieldGet_default()(_this, play_button).setAttribute('aria-label', (labels === null || labels === void 0 ? void 0 : labels.play) || '');
        }
      };

      classPrivateFieldGet_default()(this, play_events).media.playing = function () {
        if (!classPrivateFieldGet_default()(_this, play_button).classList.contains('op-controls__playpause--pause')) {
          classPrivateFieldGet_default()(_this, play_button).classList.remove('op-controls__playpause--replay');

          classPrivateFieldGet_default()(_this, play_button).classList.add('op-controls__playpause--pause');

          classPrivateFieldGet_default()(_this, play_button).title = (labels === null || labels === void 0 ? void 0 : labels.pause) || '';

          classPrivateFieldGet_default()(_this, play_button).setAttribute('aria-label', (labels === null || labels === void 0 ? void 0 : labels.pause) || '');
        }
      };

      classPrivateFieldGet_default()(this, play_events).media.pause = function () {
        classPrivateFieldGet_default()(_this, play_button).classList.remove('op-controls__playpause--pause');

        classPrivateFieldGet_default()(_this, play_button).title = (labels === null || labels === void 0 ? void 0 : labels.play) || '';

        classPrivateFieldGet_default()(_this, play_button).setAttribute('aria-label', (labels === null || labels === void 0 ? void 0 : labels.play) || '');
      };

      classPrivateFieldGet_default()(this, play_events).media.ended = function () {
        if (classPrivateFieldGet_default()(_this, play_player).activeElement().ended && classPrivateFieldGet_default()(_this, play_player).isMedia()) {
          classPrivateFieldGet_default()(_this, play_button).classList.add('op-controls__playpause--replay');

          classPrivateFieldGet_default()(_this, play_button).classList.remove('op-controls__playpause--pause');
        } else if (classPrivateFieldGet_default()(_this, play_player).getElement().currentTime >= classPrivateFieldGet_default()(_this, play_player).getElement().duration || classPrivateFieldGet_default()(_this, play_player).getElement().currentTime <= 0) {
          classPrivateFieldGet_default()(_this, play_button).classList.add('op-controls__playpause--replay');

          classPrivateFieldGet_default()(_this, play_button).classList.remove('op-controls__playpause--pause');
        } else {
          classPrivateFieldGet_default()(_this, play_button).classList.remove('op-controls__playpause--replay');

          classPrivateFieldGet_default()(_this, play_button).classList.add('op-controls__playpause--pause');
        }

        classPrivateFieldGet_default()(_this, play_button).title = (labels === null || labels === void 0 ? void 0 : labels.play) || '';

        classPrivateFieldGet_default()(_this, play_button).setAttribute('aria-label', (labels === null || labels === void 0 ? void 0 : labels.play) || '');
      };

      classPrivateFieldGet_default()(this, play_events).media.adsmediaended = function () {
        classPrivateFieldGet_default()(_this, play_button).classList.remove('op-controls__playpause--replay');

        classPrivateFieldGet_default()(_this, play_button).classList.add('op-controls__playpause--pause');

        classPrivateFieldGet_default()(_this, play_button).title = (labels === null || labels === void 0 ? void 0 : labels.pause) || '';

        classPrivateFieldGet_default()(_this, play_button).setAttribute('aria-label', (labels === null || labels === void 0 ? void 0 : labels.pause) || '');
      };

      classPrivateFieldGet_default()(this, play_events).media.playererror = function () {
        if (isAudioEl) {
          var el = classPrivateFieldGet_default()(_this, play_player).activeElement();

          el.pause();
        }
      };

      var element = classPrivateFieldGet_default()(this, play_player).getElement();

      classPrivateFieldGet_default()(this, play_events).controls.controlschanged = function () {
        if (!classPrivateFieldGet_default()(_this, play_player).activeElement().paused) {
          var event = addEvent('playing');
          element.dispatchEvent(event);
        }
      };

      Object.keys(classPrivateFieldGet_default()(this, play_events).media).forEach(function (event) {
        element.addEventListener(event, classPrivateFieldGet_default()(_this, play_events).media[event], EVENT_OPTIONS);
      });

      if ((_classPrivateFieldGet4 = classPrivateFieldGet_default()(this, play_player).getOptions().media) !== null && _classPrivateFieldGet4 !== void 0 && _classPrivateFieldGet4.pauseOnClick) {
        element.addEventListener('click', classPrivateFieldGet_default()(this, play_events).button, EVENT_OPTIONS);
      }

      classPrivateFieldGet_default()(this, play_player).getControls().getContainer().addEventListener('controlschanged', classPrivateFieldGet_default()(this, play_events).controls.controlschanged, EVENT_OPTIONS);

      classPrivateFieldGet_default()(this, play_player).getContainer().addEventListener('keydown', this._enterSpaceKeyEvent, EVENT_OPTIONS);

      classPrivateFieldGet_default()(this, play_button).addEventListener('click', classPrivateFieldGet_default()(this, play_events).button, EVENT_OPTIONS);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this2 = this,
          _classPrivateFieldGet5;

      Object.keys(classPrivateFieldGet_default()(this, play_events).media).forEach(function (event) {
        classPrivateFieldGet_default()(_this2, play_player).getElement().removeEventListener(event, classPrivateFieldGet_default()(_this2, play_events).media[event]);
      });

      if ((_classPrivateFieldGet5 = classPrivateFieldGet_default()(this, play_player).getOptions().media) !== null && _classPrivateFieldGet5 !== void 0 && _classPrivateFieldGet5.pauseOnClick) {
        classPrivateFieldGet_default()(this, play_player).getElement().removeEventListener('click', classPrivateFieldGet_default()(this, play_events).button);
      }

      classPrivateFieldGet_default()(this, play_player).getControls().getContainer().removeEventListener('controlschanged', classPrivateFieldGet_default()(this, play_events).controls.controlschanged);

      classPrivateFieldGet_default()(this, play_player).getContainer().removeEventListener('keydown', this._enterSpaceKeyEvent);

      classPrivateFieldGet_default()(this, play_button).removeEventListener('click', classPrivateFieldGet_default()(this, play_events).button);

      classPrivateFieldGet_default()(this, play_button).remove();
    }
  }, {
    key: "_enterSpaceKeyEvent",
    value: function _enterSpaceKeyEvent(e) {
      var _document, _document$activeEleme;

      var key = e.which || e.keyCode || 0;
      var playBtnFocused = (_document = document) === null || _document === void 0 ? void 0 : (_document$activeEleme = _document.activeElement) === null || _document$activeEleme === void 0 ? void 0 : _document$activeEleme.classList.contains('op-controls__playpause');

      if (playBtnFocused && (key === 13 || key === 32)) {
        classPrivateFieldGet_default()(this, play_events).button(e);
      }
    }
  }]);

  return Play;
}();

/* harmony default export */ const play = (Play);
;// CONCATENATED MODULE: ./src/controls/progress.ts





function progress_classPrivateFieldInitSpec(obj, privateMap, value) { progress_checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function progress_checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }





var progress_player = new WeakMap();

var _progress = new WeakMap();

var _slider = new WeakMap();

var _buffer = new WeakMap();

var _played = new WeakMap();

var _tooltip = new WeakMap();

var progress_events = new WeakMap();

var _forcePause = new WeakMap();

var progress_controlPosition = new WeakMap();

var progress_controlLayer = new WeakMap();

var Progress = function () {
  function Progress(player, position, layer) {
    classCallCheck_default()(this, Progress);

    progress_classPrivateFieldInitSpec(this, progress_player, {
      writable: true,
      value: void 0
    });

    progress_classPrivateFieldInitSpec(this, _progress, {
      writable: true,
      value: void 0
    });

    progress_classPrivateFieldInitSpec(this, _slider, {
      writable: true,
      value: void 0
    });

    progress_classPrivateFieldInitSpec(this, _buffer, {
      writable: true,
      value: void 0
    });

    progress_classPrivateFieldInitSpec(this, _played, {
      writable: true,
      value: void 0
    });

    progress_classPrivateFieldInitSpec(this, _tooltip, {
      writable: true,
      value: void 0
    });

    progress_classPrivateFieldInitSpec(this, progress_events, {
      writable: true,
      value: {
        container: {},
        controls: {},
        global: {},
        media: {},
        slider: {}
      }
    });

    progress_classPrivateFieldInitSpec(this, _forcePause, {
      writable: true,
      value: false
    });

    progress_classPrivateFieldInitSpec(this, progress_controlPosition, {
      writable: true,
      value: void 0
    });

    progress_classPrivateFieldInitSpec(this, progress_controlLayer, {
      writable: true,
      value: void 0
    });

    classPrivateFieldSet_default()(this, progress_player, player);

    classPrivateFieldSet_default()(this, progress_controlPosition, position);

    classPrivateFieldSet_default()(this, progress_controlLayer, layer);

    this._enterSpaceKeyEvent = this._enterSpaceKeyEvent.bind(this);
  }

  createClass_default()(Progress, [{
    key: "create",
    value: function create() {
      var _this = this,
          _classPrivateFieldGet4;

      var _classPrivateFieldGet2 = classPrivateFieldGet_default()(this, progress_player).getOptions(),
          labels = _classPrivateFieldGet2.labels,
          progress = _classPrivateFieldGet2.progress;

      classPrivateFieldSet_default()(this, _progress, document.createElement('div'));

      classPrivateFieldGet_default()(this, _progress).className = "op-controls__progress op-control__".concat(classPrivateFieldGet_default()(this, progress_controlPosition));
      classPrivateFieldGet_default()(this, _progress).tabIndex = 0;

      classPrivateFieldGet_default()(this, _progress).setAttribute('aria-label', (labels === null || labels === void 0 ? void 0 : labels.progressSlider) || '');

      classPrivateFieldGet_default()(this, _progress).setAttribute('aria-valuemin', '0');

      classPrivateFieldSet_default()(this, _slider, document.createElement('input'));

      classPrivateFieldGet_default()(this, _slider).type = 'range';
      classPrivateFieldGet_default()(this, _slider).className = 'op-controls__progress--seek';
      classPrivateFieldGet_default()(this, _slider).tabIndex = -1;

      classPrivateFieldGet_default()(this, _slider).setAttribute('min', '0');

      classPrivateFieldGet_default()(this, _slider).setAttribute('max', '0');

      classPrivateFieldGet_default()(this, _slider).setAttribute('step', '0.1');

      classPrivateFieldGet_default()(this, _slider).value = '0';

      classPrivateFieldGet_default()(this, _slider).setAttribute('aria-label', (labels === null || labels === void 0 ? void 0 : labels.progressRail) || '');

      classPrivateFieldGet_default()(this, _slider).setAttribute('role', 'slider');

      classPrivateFieldSet_default()(this, _buffer, document.createElement('progress'));

      classPrivateFieldGet_default()(this, _buffer).className = 'op-controls__progress--buffer';

      classPrivateFieldGet_default()(this, _buffer).setAttribute('max', '100');

      classPrivateFieldGet_default()(this, _buffer).value = 0;

      classPrivateFieldSet_default()(this, _played, document.createElement('progress'));

      classPrivateFieldGet_default()(this, _played).className = 'op-controls__progress--played';

      classPrivateFieldGet_default()(this, _played).setAttribute('max', '100');

      classPrivateFieldGet_default()(this, _played).setAttribute('role', 'presentation');

      classPrivateFieldGet_default()(this, _played).value = 0;

      classPrivateFieldGet_default()(this, _progress).appendChild(classPrivateFieldGet_default()(this, _slider));

      classPrivateFieldGet_default()(this, _progress).appendChild(classPrivateFieldGet_default()(this, _played));

      classPrivateFieldGet_default()(this, _progress).appendChild(classPrivateFieldGet_default()(this, _buffer));

      if (!IS_IOS && !IS_ANDROID) {
        classPrivateFieldSet_default()(this, _tooltip, document.createElement('span'));

        classPrivateFieldGet_default()(this, _tooltip).className = 'op-controls__tooltip';
        classPrivateFieldGet_default()(this, _tooltip).tabIndex = -1;
        classPrivateFieldGet_default()(this, _tooltip).innerHTML = '00:00';

        classPrivateFieldGet_default()(this, _progress).appendChild(classPrivateFieldGet_default()(this, _tooltip));
      }

      var setInitialProgress = function setInitialProgress() {
        var _classPrivateFieldGet3;

        if (classPrivateFieldGet_default()(_this, _slider).classList.contains('error')) {
          classPrivateFieldGet_default()(_this, _slider).classList.remove('error');
        }

        var el = classPrivateFieldGet_default()(_this, progress_player).activeElement();

        if (el.duration !== Infinity && !classPrivateFieldGet_default()(_this, progress_player).getElement().getAttribute('op-live__enabled') && !classPrivateFieldGet_default()(_this, progress_player).getElement().getAttribute('op-dvr__enabled')) {
          classPrivateFieldGet_default()(_this, _slider).setAttribute('max', "".concat(el.duration));

          var current = classPrivateFieldGet_default()(_this, progress_player).isMedia() ? el.currentTime : el.duration - el.currentTime;
          classPrivateFieldGet_default()(_this, _slider).value = current.toString();

          classPrivateFieldGet_default()(_this, _progress).setAttribute('aria-valuemax', el.duration.toString());
        } else if (classPrivateFieldGet_default()(_this, progress_player).getElement().getAttribute('op-dvr__enabled')) {
          classPrivateFieldGet_default()(_this, _slider).setAttribute('max', '1');

          classPrivateFieldGet_default()(_this, _slider).value = '1';
          classPrivateFieldGet_default()(_this, _slider).style.backgroundSize = '100% 100%';
          classPrivateFieldGet_default()(_this, _played).value = 1;

          classPrivateFieldGet_default()(_this, _progress).setAttribute('aria-valuemax', '1');

          classPrivateFieldGet_default()(_this, _progress).setAttribute('aria-hidden', 'false');
        } else if (!((_classPrivateFieldGet3 = classPrivateFieldGet_default()(_this, progress_player).getOptions().live) !== null && _classPrivateFieldGet3 !== void 0 && _classPrivateFieldGet3.showProgress)) {
          classPrivateFieldGet_default()(_this, _progress).setAttribute('aria-hidden', 'true');
        }
      };

      var lastCurrentTime = 0;
      var defaultDuration = ((_classPrivateFieldGet4 = classPrivateFieldGet_default()(this, progress_player).getOptions().progress) === null || _classPrivateFieldGet4 === void 0 ? void 0 : _classPrivateFieldGet4.duration) || 0;
      var isAudioEl = isAudio(classPrivateFieldGet_default()(this, progress_player).getElement());
      classPrivateFieldGet_default()(this, progress_events).media.loadedmetadata = setInitialProgress.bind(this);
      classPrivateFieldGet_default()(this, progress_events).controls.controlschanged = setInitialProgress.bind(this);

      classPrivateFieldGet_default()(this, progress_events).media.progress = function (e) {
        var _classPrivateFieldGet5;

        var el = e.target;

        if (el.duration !== Infinity && !classPrivateFieldGet_default()(_this, progress_player).getElement().getAttribute('op-live__enabled')) {
          if (el.duration > 0) {
            for (var i = 0, total = el.buffered.length; i < total; i++) {
              if (el.buffered.start(el.buffered.length - 1 - i) < el.currentTime) {
                classPrivateFieldGet_default()(_this, _buffer).value = el.buffered.end(el.buffered.length - 1 - i) / el.duration * 100;
                break;
              }
            }
          }
        } else if (!classPrivateFieldGet_default()(_this, progress_player).getElement().getAttribute('op-dvr__enabled') && classPrivateFieldGet_default()(_this, _progress).getAttribute('aria-hidden') === 'false' && !((_classPrivateFieldGet5 = classPrivateFieldGet_default()(_this, progress_player).getOptions().live) !== null && _classPrivateFieldGet5 !== void 0 && _classPrivateFieldGet5.showProgress)) {
          classPrivateFieldGet_default()(_this, _progress).setAttribute('aria-hidden', 'true');
        }
      };

      classPrivateFieldGet_default()(this, progress_events).media.waiting = function () {
        if (isAudioEl && !classPrivateFieldGet_default()(_this, _slider).classList.contains('loading')) {
          classPrivateFieldGet_default()(_this, _slider).classList.add('loading');
        }

        if (isAudioEl && classPrivateFieldGet_default()(_this, _slider).classList.contains('error')) {
          classPrivateFieldGet_default()(_this, _slider).classList.remove('error');
        }
      };

      classPrivateFieldGet_default()(this, progress_events).media.playererror = function () {
        if (isAudioEl && !classPrivateFieldGet_default()(_this, _slider).classList.contains('error')) {
          classPrivateFieldGet_default()(_this, _slider).classList.add('error');
        }

        if (isAudioEl && classPrivateFieldGet_default()(_this, _slider).classList.contains('loading')) {
          classPrivateFieldGet_default()(_this, _slider).classList.remove('loading');
        }
      };

      classPrivateFieldGet_default()(this, progress_events).media.pause = function () {
        var el = classPrivateFieldGet_default()(_this, progress_player).activeElement();

        if (el.duration !== Infinity && !classPrivateFieldGet_default()(_this, progress_player).getElement().getAttribute('op-live__enabled')) {
          var current = el.currentTime;

          classPrivateFieldGet_default()(_this, _progress).setAttribute('aria-valuenow', current.toString());

          classPrivateFieldGet_default()(_this, _progress).setAttribute('aria-valuetext', formatTime(current));
        }
      };

      classPrivateFieldGet_default()(this, progress_events).media.play = function () {
        if (isAudioEl && classPrivateFieldGet_default()(_this, _slider).classList.contains('loading')) {
          classPrivateFieldGet_default()(_this, _slider).classList.remove('loading');
        }

        if (isAudioEl && classPrivateFieldGet_default()(_this, _slider).classList.contains('error')) {
          classPrivateFieldGet_default()(_this, _slider).classList.remove('error');
        }

        if (classPrivateFieldGet_default()(_this, progress_player).activeElement().duration !== Infinity && !classPrivateFieldGet_default()(_this, progress_player).getElement().getAttribute('op-live__enabled')) {
          classPrivateFieldGet_default()(_this, _progress).removeAttribute('aria-valuenow');

          classPrivateFieldGet_default()(_this, _progress).removeAttribute('aria-valuetext');
        }
      };

      classPrivateFieldGet_default()(this, progress_events).media.playing = function () {
        if (isAudioEl && classPrivateFieldGet_default()(_this, _slider).classList.contains('loading')) {
          classPrivateFieldGet_default()(_this, _slider).classList.remove('loading');
        }

        if (isAudioEl && classPrivateFieldGet_default()(_this, _slider).classList.contains('error')) {
          classPrivateFieldGet_default()(_this, _slider).classList.remove('error');
        }
      };

      classPrivateFieldGet_default()(this, progress_events).media.timeupdate = function () {
        var _classPrivateFieldGet6;

        var el = classPrivateFieldGet_default()(_this, progress_player).activeElement();

        if (el.duration !== Infinity && (!classPrivateFieldGet_default()(_this, progress_player).getElement().getAttribute('op-live__enabled') || classPrivateFieldGet_default()(_this, progress_player).getElement().getAttribute('op-dvr__enabled'))) {
          if (!classPrivateFieldGet_default()(_this, _slider).getAttribute('max') || classPrivateFieldGet_default()(_this, _slider).getAttribute('max') === '0' || parseFloat(classPrivateFieldGet_default()(_this, _slider).getAttribute('max') || '-1') !== el.duration) {
            classPrivateFieldGet_default()(_this, _slider).setAttribute('max', "".concat(el.duration));

            classPrivateFieldGet_default()(_this, _progress).setAttribute('aria-hidden', 'false');
          }

          var duration = el.duration - el.currentTime + 1 >= 100 ? 100 : el.duration - el.currentTime + 1;
          var current = classPrivateFieldGet_default()(_this, progress_player).isMedia() ? el.currentTime : duration;
          var min = parseFloat(classPrivateFieldGet_default()(_this, _slider).min);
          var max = parseFloat(classPrivateFieldGet_default()(_this, _slider).max);
          classPrivateFieldGet_default()(_this, _slider).value = current.toString();
          classPrivateFieldGet_default()(_this, _slider).style.backgroundSize = "".concat((current - min) * 100 / (max - min), "% 100%");
          classPrivateFieldGet_default()(_this, _played).value = el.duration <= 0 || Number.isNaN(el.duration) || !Number.isFinite(el.duration) ? defaultDuration : current / el.duration * 100;

          if (classPrivateFieldGet_default()(_this, progress_player).getElement().getAttribute('op-dvr__enabled') && Math.floor(classPrivateFieldGet_default()(_this, _played).value) >= 99) {
            lastCurrentTime = el.currentTime;

            classPrivateFieldGet_default()(_this, _progress).setAttribute('aria-hidden', 'false');
          }
        } else if (!classPrivateFieldGet_default()(_this, progress_player).getElement().getAttribute('op-dvr__enabled') && classPrivateFieldGet_default()(_this, _progress).getAttribute('aria-hidden') === 'false' && !((_classPrivateFieldGet6 = classPrivateFieldGet_default()(_this, progress_player).getOptions().live) !== null && _classPrivateFieldGet6 !== void 0 && _classPrivateFieldGet6.showProgress)) {
          classPrivateFieldGet_default()(_this, _progress).setAttribute('aria-hidden', 'true');
        }
      };

      classPrivateFieldGet_default()(this, progress_events).media.durationchange = function () {
        var el = classPrivateFieldGet_default()(_this, progress_player).activeElement();

        var current = classPrivateFieldGet_default()(_this, progress_player).isMedia() ? el.currentTime : el.duration - el.currentTime;

        classPrivateFieldGet_default()(_this, _slider).setAttribute('max', "".concat(el.duration));

        classPrivateFieldGet_default()(_this, _progress).setAttribute('aria-valuemax', el.duration.toString());

        classPrivateFieldGet_default()(_this, _played).value = el.duration <= 0 || Number.isNaN(el.duration) || !Number.isFinite(el.duration) ? defaultDuration : current / el.duration * 100;
      };

      classPrivateFieldGet_default()(this, progress_events).media.ended = function () {
        classPrivateFieldGet_default()(_this, _slider).style.backgroundSize = '0% 100%';

        classPrivateFieldGet_default()(_this, _slider).setAttribute('max', '0');

        classPrivateFieldGet_default()(_this, _buffer).value = 0;
        classPrivateFieldGet_default()(_this, _played).value = 0;
      };

      var updateSlider = function updateSlider(e) {
        var el = classPrivateFieldGet_default()(_this, progress_player).activeElement();

        var target = e.target;
        var value = parseFloat(target.value);

        if (classPrivateFieldGet_default()(_this, _slider).classList.contains('op-progress--pressed') || value < el.currentTime && !(progress !== null && progress !== void 0 && progress.allowRewind) || value > el.currentTime && !(progress !== null && progress !== void 0 && progress.allowSkip)) {
          classPrivateFieldGet_default()(_this, _slider).value = el.currentTime.toString();
          return;
        }

        classPrivateFieldGet_default()(_this, _slider).classList.add('.op-progress--pressed');

        var min = parseFloat(target.min);
        var max = parseFloat(target.max);
        var val = parseFloat(target.value);
        classPrivateFieldGet_default()(_this, _slider).style.backgroundSize = "".concat((val - min) * 100 / (max - min), "% 100%");
        classPrivateFieldGet_default()(_this, _played).value = el.duration <= 0 || Number.isNaN(el.duration) || !Number.isFinite(el.duration) ? defaultDuration : val / el.duration * 100;

        if (classPrivateFieldGet_default()(_this, progress_player).getElement().getAttribute('op-dvr__enabled')) {
          el.currentTime = Math.round(classPrivateFieldGet_default()(_this, _played).value) >= 99 ? lastCurrentTime : val;
        } else {
          el.currentTime = val;
        }

        classPrivateFieldGet_default()(_this, _slider).classList.remove('.op-progress--pressed');
      };

      var forcePause = function forcePause(e) {
        var el = classPrivateFieldGet_default()(_this, progress_player).activeElement();

        var key = e.which || e.keyCode || 0;

        var target = classPrivateFieldGet_default()(_this, _slider);

        var value = Math.round(Number(target.value));
        var current = Math.round(el.currentTime);
        var isProgressManipulationAllowed = value < current && (progress === null || progress === void 0 ? void 0 : progress.allowRewind) || value >= current && (progress === null || progress === void 0 ? void 0 : progress.allowSkip);

        if (isProgressManipulationAllowed && (key === 1 || key === 0) && classPrivateFieldGet_default()(_this, progress_player).isMedia() && !el.paused) {
          el.pause();

          classPrivateFieldSet_default()(_this, _forcePause, true);
        }
      };

      var releasePause = function releasePause() {
        var el = classPrivateFieldGet_default()(_this, progress_player).activeElement();

        if (classPrivateFieldGet_default()(_this, _forcePause) === true && classPrivateFieldGet_default()(_this, progress_player).isMedia()) {
          if (el.paused) {
            el.play();

            classPrivateFieldSet_default()(_this, _forcePause, false);
          }
        }
      };

      var mobileForcePause = function mobileForcePause(e) {
        var el = classPrivateFieldGet_default()(_this, progress_player).activeElement();

        if (el.duration !== Infinity) {
          var _changedTouches$;

          var changedTouches = e.changedTouches;
          var x = ((_changedTouches$ = changedTouches[0]) === null || _changedTouches$ === void 0 ? void 0 : _changedTouches$.pageX) || 0;
          var pos = x - offset(classPrivateFieldGet_default()(_this, _progress)).left;

          var percentage = pos / classPrivateFieldGet_default()(_this, _progress).offsetWidth;

          var time = percentage * el.duration;

          if (time < el.currentTime && progress !== null && progress !== void 0 && progress.allowRewind || time > el.currentTime && progress !== null && progress !== void 0 && progress.allowSkip) {
            classPrivateFieldGet_default()(_this, _slider).value = time.toString();
            updateSlider(e);

            if (!el.paused) {
              el.pause();

              classPrivateFieldSet_default()(_this, _forcePause, true);
            }
          }
        }
      };

      classPrivateFieldGet_default()(this, progress_events).slider.input = updateSlider.bind(this);
      classPrivateFieldGet_default()(this, progress_events).slider.change = updateSlider.bind(this);
      classPrivateFieldGet_default()(this, progress_events).slider.mousedown = forcePause.bind(this);
      classPrivateFieldGet_default()(this, progress_events).slider.mouseup = releasePause.bind(this);
      classPrivateFieldGet_default()(this, progress_events).slider.touchstart = mobileForcePause.bind(this);
      classPrivateFieldGet_default()(this, progress_events).slider.touchend = releasePause.bind(this);

      if (!IS_IOS && !IS_ANDROID) {
        classPrivateFieldGet_default()(this, progress_events).container.mousemove = function (e) {
          var el = classPrivateFieldGet_default()(_this, progress_player).activeElement();

          if (el.duration !== Infinity && !classPrivateFieldGet_default()(_this, progress_player).isAd()) {
            var x = e.pageX;
            var pos = x - offset(classPrivateFieldGet_default()(_this, _progress)).left;
            var half = classPrivateFieldGet_default()(_this, _tooltip).offsetWidth / 2;

            var percentage = pos / classPrivateFieldGet_default()(_this, _progress).offsetWidth;

            var time = percentage * el.duration;

            var mediaContainer = classPrivateFieldGet_default()(_this, progress_player).getContainer();

            var limit = mediaContainer.offsetWidth - classPrivateFieldGet_default()(_this, _tooltip).offsetWidth;

            if (pos <= 0 || x - offset(mediaContainer).left <= half) {
              pos = 0;
            } else if (x - offset(mediaContainer).left >= limit) {
              pos = limit - offset(classPrivateFieldGet_default()(_this, _slider)).left - 10;
            } else {
              pos -= half;
            }

            if (percentage >= 0 && percentage <= 1) {
              classPrivateFieldGet_default()(_this, _tooltip).classList.add('op-controls__tooltip--visible');
            } else {
              classPrivateFieldGet_default()(_this, _tooltip).classList.remove('op-controls__tooltip--visible');
            }

            classPrivateFieldGet_default()(_this, _tooltip).style.left = "".concat(pos, "px");
            classPrivateFieldGet_default()(_this, _tooltip).innerHTML = Number.isNaN(time) ? '00:00' : formatTime(time);
          }
        };

        classPrivateFieldGet_default()(this, progress_events).global.mousemove = function (e) {
          if (!e.target.closest('.op-controls__progress') || classPrivateFieldGet_default()(_this, progress_player).isAd()) {
            classPrivateFieldGet_default()(_this, _tooltip).classList.remove('op-controls__tooltip--visible');
          }
        };
      }

      Object.keys(classPrivateFieldGet_default()(this, progress_events).media).forEach(function (event) {
        classPrivateFieldGet_default()(_this, progress_player).getElement().addEventListener(event, classPrivateFieldGet_default()(_this, progress_events).media[event], EVENT_OPTIONS);
      });
      Object.keys(classPrivateFieldGet_default()(this, progress_events).slider).forEach(function (event) {
        classPrivateFieldGet_default()(_this, _slider).addEventListener(event, classPrivateFieldGet_default()(_this, progress_events).slider[event], EVENT_OPTIONS);
      });

      classPrivateFieldGet_default()(this, _progress).addEventListener('keydown', classPrivateFieldGet_default()(this, progress_player).getEvents().keydown, EVENT_OPTIONS);

      classPrivateFieldGet_default()(this, _progress).addEventListener('mousemove', classPrivateFieldGet_default()(this, progress_events).container.mousemove, EVENT_OPTIONS);

      document.addEventListener('mousemove', classPrivateFieldGet_default()(this, progress_events).global.mousemove, EVENT_OPTIONS);

      classPrivateFieldGet_default()(this, progress_player).getContainer().addEventListener('keydown', this._enterSpaceKeyEvent, EVENT_OPTIONS);

      classPrivateFieldGet_default()(this, progress_player).getControls().getContainer().addEventListener('controlschanged', classPrivateFieldGet_default()(this, progress_events).controls.controlschanged, EVENT_OPTIONS);

      classPrivateFieldGet_default()(this, progress_player).getControls().getLayer(classPrivateFieldGet_default()(this, progress_controlLayer)).appendChild(classPrivateFieldGet_default()(this, _progress));
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this2 = this;

      Object.keys(classPrivateFieldGet_default()(this, progress_events)).forEach(function (event) {
        classPrivateFieldGet_default()(_this2, progress_player).getElement().removeEventListener(event, classPrivateFieldGet_default()(_this2, progress_events)[event]);
      });
      Object.keys(classPrivateFieldGet_default()(this, progress_events).slider).forEach(function (event) {
        classPrivateFieldGet_default()(_this2, _slider).removeEventListener(event, classPrivateFieldGet_default()(_this2, progress_events).slider[event]);
      });

      classPrivateFieldGet_default()(this, _progress).removeEventListener('keydown', classPrivateFieldGet_default()(this, progress_player).getEvents().keydown);

      classPrivateFieldGet_default()(this, _progress).removeEventListener('mousemove', classPrivateFieldGet_default()(this, progress_events).container.mousemove);

      document.removeEventListener('mousemove', classPrivateFieldGet_default()(this, progress_events).global.mousemove);

      classPrivateFieldGet_default()(this, progress_player).getContainer().removeEventListener('keydown', this._enterSpaceKeyEvent);

      classPrivateFieldGet_default()(this, progress_player).getControls().getContainer().removeEventListener('controlschanged', classPrivateFieldGet_default()(this, progress_events).controls.controlschanged);

      classPrivateFieldGet_default()(this, _buffer).remove();

      classPrivateFieldGet_default()(this, _played).remove();

      classPrivateFieldGet_default()(this, _slider).remove();

      if (!IS_IOS && !IS_ANDROID) {
        classPrivateFieldGet_default()(this, _tooltip).remove();
      }

      classPrivateFieldGet_default()(this, _progress).remove();
    }
  }, {
    key: "_enterSpaceKeyEvent",
    value: function _enterSpaceKeyEvent(e) {
      var el = classPrivateFieldGet_default()(this, progress_player).activeElement();

      var isAd = classPrivateFieldGet_default()(this, progress_player).isAd();

      var key = e.which || e.keyCode || 0;

      if (!isAd && key >= 48 && key <= 57 && el.duration !== Infinity) {
        var step = 0;

        for (var i = 48, limit = 57; i <= limit; i++) {
          if (i < key) {
            step++;
          }
        }

        el.currentTime = el.duration * (0.1 * step);
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }]);

  return Progress;
}();

/* harmony default export */ const progress = (Progress);
;// CONCATENATED MODULE: ./src/controls/settings.ts






function settings_classPrivateFieldInitSpec(obj, privateMap, value) { settings_checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function settings_checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }




var settings_player = new WeakMap();

var _submenu = new WeakMap();

var settings_button = new WeakMap();

var settings_menu = new WeakMap();

var settings_events = new WeakMap();

var _originalOutput = new WeakMap();

var settings_controlPosition = new WeakMap();

var settings_controlLayer = new WeakMap();

var Settings = function () {
  function Settings(player, position, layer) {
    classCallCheck_default()(this, Settings);

    settings_classPrivateFieldInitSpec(this, settings_player, {
      writable: true,
      value: void 0
    });

    settings_classPrivateFieldInitSpec(this, _submenu, {
      writable: true,
      value: {}
    });

    settings_classPrivateFieldInitSpec(this, settings_button, {
      writable: true,
      value: void 0
    });

    settings_classPrivateFieldInitSpec(this, settings_menu, {
      writable: true,
      value: void 0
    });

    settings_classPrivateFieldInitSpec(this, settings_events, {
      writable: true,
      value: {
        global: {},
        media: {}
      }
    });

    settings_classPrivateFieldInitSpec(this, _originalOutput, {
      writable: true,
      value: ''
    });

    settings_classPrivateFieldInitSpec(this, settings_controlPosition, {
      writable: true,
      value: void 0
    });

    settings_classPrivateFieldInitSpec(this, settings_controlLayer, {
      writable: true,
      value: void 0
    });

    defineProperty_default()(this, "clickEvent", void 0);

    defineProperty_default()(this, "hideEvent", void 0);

    defineProperty_default()(this, "removeEvent", void 0);

    classPrivateFieldSet_default()(this, settings_player, player);

    classPrivateFieldSet_default()(this, settings_controlPosition, position);

    classPrivateFieldSet_default()(this, settings_controlLayer, layer);

    this._enterSpaceKeyEvent = this._enterSpaceKeyEvent.bind(this);
  }

  createClass_default()(Settings, [{
    key: "create",
    value: function create() {
      var _this = this;

      var _classPrivateFieldGet2 = classPrivateFieldGet_default()(this, settings_player).getOptions(),
          labels = _classPrivateFieldGet2.labels;

      classPrivateFieldSet_default()(this, settings_button, document.createElement('button'));

      classPrivateFieldGet_default()(this, settings_button).className = "op-controls__settings op-control__".concat(classPrivateFieldGet_default()(this, settings_controlPosition));
      classPrivateFieldGet_default()(this, settings_button).tabIndex = 0;
      classPrivateFieldGet_default()(this, settings_button).title = (labels === null || labels === void 0 ? void 0 : labels.settings) || '';

      classPrivateFieldGet_default()(this, settings_button).setAttribute('aria-controls', classPrivateFieldGet_default()(this, settings_player).id);

      classPrivateFieldGet_default()(this, settings_button).setAttribute('aria-pressed', 'false');

      classPrivateFieldGet_default()(this, settings_button).setAttribute('aria-label', (labels === null || labels === void 0 ? void 0 : labels.settings) || '');

      classPrivateFieldSet_default()(this, settings_menu, document.createElement('div'));

      classPrivateFieldGet_default()(this, settings_menu).className = 'op-settings';

      classPrivateFieldGet_default()(this, settings_menu).setAttribute('aria-hidden', 'true');

      classPrivateFieldGet_default()(this, settings_menu).innerHTML = '<div class="op-settings__menu" role="menu"></div>';

      this.clickEvent = function () {
        classPrivateFieldGet_default()(_this, settings_button).setAttribute('aria-pressed', 'true');

        var menus = classPrivateFieldGet_default()(_this, settings_player).getContainer().querySelectorAll('.op-settings');

        for (var i = 0, total = menus.length; i < total; ++i) {
          if (menus[i] !== classPrivateFieldGet_default()(_this, settings_menu)) {
            menus[i].setAttribute('aria-hidden', 'true');
          }
        }

        classPrivateFieldGet_default()(_this, settings_menu).setAttribute('aria-hidden', classPrivateFieldGet_default()(_this, settings_menu).getAttribute('aria-hidden') === 'false' ? 'true' : 'false');
      };

      this.hideEvent = function () {
        var timeout;

        if (timeout && typeof window !== 'undefined') {
          window.cancelAnimationFrame(timeout);
        }

        if (typeof window !== 'undefined') {
          timeout = window.requestAnimationFrame(function () {
            classPrivateFieldGet_default()(_this, settings_menu).innerHTML = classPrivateFieldGet_default()(_this, _originalOutput);

            classPrivateFieldGet_default()(_this, settings_menu).setAttribute('aria-hidden', 'true');
          });
        }
      };

      this.removeEvent = function (e) {
        var _e$detail = e.detail,
            id = _e$detail.id,
            type = _e$detail.type;

        _this.removeItem(id, type);
      };

      this.clickEvent = this.clickEvent.bind(this);
      this.hideEvent = this.hideEvent.bind(this);
      this.removeEvent = this.removeEvent.bind(this);
      classPrivateFieldGet_default()(this, settings_events).media.controlshidden = this.hideEvent.bind(this);
      classPrivateFieldGet_default()(this, settings_events).media.settingremoved = this.removeEvent.bind(this);
      classPrivateFieldGet_default()(this, settings_events).media.play = this.hideEvent.bind(this);
      classPrivateFieldGet_default()(this, settings_events).media.pause = this.hideEvent.bind(this);

      classPrivateFieldGet_default()(this, settings_player).getContainer().addEventListener('keydown', this._enterSpaceKeyEvent, EVENT_OPTIONS);

      classPrivateFieldGet_default()(this, settings_events).global.click = function (e) {
        var target = e.target;
        var current = target;

        if (current !== null && current !== void 0 && current.closest("#".concat(classPrivateFieldGet_default()(_this, settings_player).id)) && current !== null && current !== void 0 && current.classList.contains('op-speed__option')) {
          var level = (current === null || current === void 0 ? void 0 : current.getAttribute('data-value')) || '';
          classPrivateFieldGet_default()(_this, settings_player).getMedia().playbackRate = parseFloat(level.replace('speed-', ''));
        }
      };

      classPrivateFieldGet_default()(this, settings_events).global.resize = this.hideEvent.bind(this);

      classPrivateFieldGet_default()(this, settings_button).addEventListener('click', this.clickEvent, EVENT_OPTIONS);

      Object.keys(classPrivateFieldGet_default()(this, settings_events)).forEach(function (event) {
        classPrivateFieldGet_default()(_this, settings_player).getElement().addEventListener(event, classPrivateFieldGet_default()(_this, settings_events).media[event], EVENT_OPTIONS);
      });
      document.addEventListener('click', classPrivateFieldGet_default()(this, settings_events).global.click, EVENT_OPTIONS);
      document.addEventListener('keydown', classPrivateFieldGet_default()(this, settings_events).global.click, EVENT_OPTIONS);

      if (typeof window !== 'undefined') {
        window.addEventListener('resize', classPrivateFieldGet_default()(this, settings_events).global.resize, EVENT_OPTIONS);
      }

      classPrivateFieldGet_default()(this, settings_player).getControls().getLayer(classPrivateFieldGet_default()(this, settings_controlLayer)).appendChild(classPrivateFieldGet_default()(this, settings_button));

      classPrivateFieldGet_default()(this, settings_player).getContainer().appendChild(classPrivateFieldGet_default()(this, settings_menu));
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this2 = this;

      classPrivateFieldGet_default()(this, settings_button).removeEventListener('click', this.clickEvent);

      Object.keys(classPrivateFieldGet_default()(this, settings_events)).forEach(function (event) {
        classPrivateFieldGet_default()(_this2, settings_player).getElement().removeEventListener(event, classPrivateFieldGet_default()(_this2, settings_events).media[event]);
      });
      document.removeEventListener('click', classPrivateFieldGet_default()(this, settings_events).global.click);
      document.removeEventListener('keydown', classPrivateFieldGet_default()(this, settings_events).global.click);

      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', classPrivateFieldGet_default()(this, settings_events).global.resize);
      }

      if (classPrivateFieldGet_default()(this, settings_events).global['settings.submenu'] !== undefined) {
        document.removeEventListener('click', classPrivateFieldGet_default()(this, settings_events).global['settings.submenu']);

        classPrivateFieldGet_default()(this, settings_player).getElement().removeEventListener('controlshidden', this.hideEvent);
      }

      classPrivateFieldGet_default()(this, settings_player).getContainer().removeEventListener('keydown', this._enterSpaceKeyEvent);

      classPrivateFieldGet_default()(this, settings_menu).remove();

      classPrivateFieldGet_default()(this, settings_button).remove();
    }
  }, {
    key: "addSettings",
    value: function addSettings() {
      var media = classPrivateFieldGet_default()(this, settings_player).getMedia();

      var _classPrivateFieldGet3 = classPrivateFieldGet_default()(this, settings_player).getOptions(),
          labels = _classPrivateFieldGet3.labels;

      var rate = 1;

      if (classPrivateFieldGet_default()(this, settings_player) && media) {
        rate = media.defaultPlaybackRate !== media.playbackRate ? media.playbackRate : media.defaultPlaybackRate;
      }

      return {
        className: 'op-speed__option',
        default: rate.toString(),
        key: 'speed',
        name: (labels === null || labels === void 0 ? void 0 : labels.speed) || '',
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
          label: (labels === null || labels === void 0 ? void 0 : labels.speedNormal) || ''
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

      var dataValue = "".concat(key, "-").concat(sanitize(defaultValue, true));
      var menuItem = document.createElement('div');
      menuItem.className = 'op-settings__menu-item';
      menuItem.tabIndex = 0;
      menuItem.setAttribute('role', 'menuitemradio');
      menuItem.innerHTML = "<div class=\"op-settings__menu-label\" data-value=\"".concat(dataValue, "\">").concat(name, "</div>");
      var submenuMatch = submenu ? submenu.find(function (x) {
        return x.key === defaultValue;
      }) : null;

      if (submenuMatch) {
        menuItem.innerHTML += "<div class=\"op-settings__menu-content\" tabindex=\"0\">".concat(submenuMatch.label, "</div>");
      }

      var mainMenu = classPrivateFieldGet_default()(this, settings_menu).querySelector('.op-settings__menu');

      if (mainMenu) {
        mainMenu.appendChild(menuItem);
      }

      classPrivateFieldSet_default()(this, _originalOutput, classPrivateFieldGet_default()(this, settings_menu).innerHTML);

      if (submenu) {
        var subItems = "\n                <div class=\"op-settings__header\">\n                    <button type=\"button\" class=\"op-settings__back\" tabindex=\"0\">".concat(name, "</button>\n                </div>\n                <div class=\"op-settings__menu\" role=\"menu\" id=\"menu-item-").concat(key, "\">\n                    ").concat(submenu.map(function (item) {
          return "\n                    <div class=\"op-settings__submenu-item\" role=\"menuitemradio\" aria-checked=\"".concat(defaultValue === item.key ? 'true' : 'false', "\">\n                        <div class=\"op-settings__submenu-label ").concat(className || '', "\" tabindex=\"0\" data-value=\"").concat(key, "-").concat(item.key, "\">\n                            ").concat(item.label, "\n                        </div>\n                    </div>");
        }).join(''), "\n                </div>");
        classPrivateFieldGet_default()(this, _submenu)[key] = subItems;
      }

      classPrivateFieldGet_default()(this, settings_events).global['settings.submenu'] = function (e) {
        var target = e.target;

        if (target.closest("#".concat(classPrivateFieldGet_default()(_this3, settings_player).id))) {
          if (target.classList.contains('op-settings__back')) {
            classPrivateFieldGet_default()(_this3, settings_menu).classList.add('op-settings--sliding');

            setTimeout(function () {
              classPrivateFieldGet_default()(_this3, settings_menu).innerHTML = classPrivateFieldGet_default()(_this3, _originalOutput);

              classPrivateFieldGet_default()(_this3, settings_menu).classList.remove('op-settings--sliding');
            }, 100);
          } else if (target.classList.contains('op-settings__menu-content')) {
            var labelEl = target.parentElement ? target.parentElement.querySelector('.op-settings__menu-label') : null;
            var label = labelEl ? labelEl.getAttribute('data-value') : null;
            var fragments = label ? label.split('-') : [];

            if (fragments.length > 0) {
              fragments.pop();
              var current = fragments.join('-').replace(/^\-|\-$/, '');

              if (typeof classPrivateFieldGet_default()(_this3, _submenu)[current] !== 'undefined') {
                classPrivateFieldGet_default()(_this3, settings_menu).classList.add('op-settings--sliding');

                setTimeout(function () {
                  classPrivateFieldGet_default()(_this3, settings_menu).innerHTML = classPrivateFieldGet_default()(_this3, _submenu)[current];

                  classPrivateFieldGet_default()(_this3, settings_menu).classList.remove('op-settings--sliding');
                }, 100);
              }
            }
          } else if (target.classList.contains('op-settings__submenu-label')) {
            var _current = target.getAttribute('data-value');

            var value = _current ? _current.replace("".concat(key, "-"), '') : '';
            var _label = target.innerText;

            var menuTarget = classPrivateFieldGet_default()(_this3, settings_menu).querySelector("#menu-item-".concat(key, " .op-settings__submenu-item[aria-checked=true]"));

            if (menuTarget) {
              menuTarget.setAttribute('aria-checked', 'false');

              if (target.parentElement) {
                target.parentElement.setAttribute('aria-checked', 'true');
              }

              classPrivateFieldGet_default()(_this3, _submenu)[key] = classPrivateFieldGet_default()(_this3, settings_menu).innerHTML;

              classPrivateFieldGet_default()(_this3, settings_menu).classList.add('op-settings--sliding');

              setTimeout(function () {
                classPrivateFieldGet_default()(_this3, settings_menu).innerHTML = classPrivateFieldGet_default()(_this3, _originalOutput);

                var prev = classPrivateFieldGet_default()(_this3, settings_menu).querySelector(".op-settings__menu-label[data-value=\"".concat(key, "-").concat(defaultValue, "\"]"));

                if (prev) {
                  prev.setAttribute('data-value', "".concat(_current));

                  if (prev.nextElementSibling) {
                    prev.nextElementSibling.textContent = _label;
                  }
                }

                defaultValue = value;

                classPrivateFieldSet_default()(_this3, _originalOutput, classPrivateFieldGet_default()(_this3, settings_menu).innerHTML);

                classPrivateFieldGet_default()(_this3, settings_menu).classList.remove('op-settings--sliding');
              }, 100);
            }
          }
        } else {
          _this3.hideEvent();
        }
      };

      document.addEventListener('click', classPrivateFieldGet_default()(this, settings_events).global['settings.submenu'], EVENT_OPTIONS);

      classPrivateFieldGet_default()(this, settings_player).getElement().addEventListener('controlshidden', this.hideEvent, EVENT_OPTIONS);
    }
  }, {
    key: "removeItem",
    value: function removeItem(id, type) {
      var minItems = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;

      var target = classPrivateFieldGet_default()(this, settings_player).getElement().querySelector(".op-settings__submenu-label[data-value=".concat(type, "-").concat(id, "]"));

      if (target) {
        target.remove();
      }

      if (classPrivateFieldGet_default()(this, settings_player).getElement().querySelectorAll(".op-settings__submenu-label[data-value^=".concat(type, "]")).length < minItems) {
        delete classPrivateFieldGet_default()(this, _submenu)[type];

        var label = classPrivateFieldGet_default()(this, settings_player).getElement().querySelector(".op-settings__menu-label[data-value^=".concat(type, "]"));

        var menuItem = label ? label.closest('.op-settings__menu-item') : null;

        if (menuItem) {
          menuItem.remove();
        }
      }
    }
  }, {
    key: "_enterSpaceKeyEvent",
    value: function _enterSpaceKeyEvent(e) {
      var _document, _document$activeEleme, _document2, _document2$activeElem, _document3, _document3$activeElem, _document4, _document4$activeElem;

      var key = e.which || e.keyCode || 0;

      var isAd = classPrivateFieldGet_default()(this, settings_player).isAd();

      var settingsBtnFocused = (_document = document) === null || _document === void 0 ? void 0 : (_document$activeEleme = _document.activeElement) === null || _document$activeEleme === void 0 ? void 0 : _document$activeEleme.classList.contains('op-controls__settings');
      var menuFocused = ((_document2 = document) === null || _document2 === void 0 ? void 0 : (_document2$activeElem = _document2.activeElement) === null || _document2$activeElem === void 0 ? void 0 : _document2$activeElem.classList.contains('op-settings__menu-content')) || ((_document3 = document) === null || _document3 === void 0 ? void 0 : (_document3$activeElem = _document3.activeElement) === null || _document3$activeElem === void 0 ? void 0 : _document3$activeElem.classList.contains('op-settings__back')) || ((_document4 = document) === null || _document4 === void 0 ? void 0 : (_document4$activeElem = _document4.activeElement) === null || _document4$activeElem === void 0 ? void 0 : _document4$activeElem.classList.contains('op-settings__submenu-label'));

      if (!isAd) {
        if (settingsBtnFocused && (key === 13 || key === 32)) {
          this.clickEvent();
          e.preventDefault();
          e.stopPropagation();
        } else if (menuFocused && (key === 13 || key === 32)) {
          classPrivateFieldGet_default()(this, settings_events).global['settings.submenu'](e);

          e.preventDefault();
          e.stopPropagation();
        }
      }
    }
  }]);

  return Settings;
}();

/* harmony default export */ const settings = (Settings);
;// CONCATENATED MODULE: ./src/controls/time.ts





function time_classPrivateFieldInitSpec(obj, privateMap, value) { time_checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function time_checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }




var time_player = new WeakMap();

var _currentTime = new WeakMap();

var _delimiter = new WeakMap();

var _duration = new WeakMap();

var _container = new WeakMap();

var time_events = new WeakMap();

var time_controlPosition = new WeakMap();

var time_controlLayer = new WeakMap();

var Time = function () {
  function Time(player, position, layer) {
    classCallCheck_default()(this, Time);

    time_classPrivateFieldInitSpec(this, time_player, {
      writable: true,
      value: void 0
    });

    time_classPrivateFieldInitSpec(this, _currentTime, {
      writable: true,
      value: void 0
    });

    time_classPrivateFieldInitSpec(this, _delimiter, {
      writable: true,
      value: void 0
    });

    time_classPrivateFieldInitSpec(this, _duration, {
      writable: true,
      value: void 0
    });

    time_classPrivateFieldInitSpec(this, _container, {
      writable: true,
      value: void 0
    });

    time_classPrivateFieldInitSpec(this, time_events, {
      writable: true,
      value: {
        controls: {},
        media: {}
      }
    });

    time_classPrivateFieldInitSpec(this, time_controlPosition, {
      writable: true,
      value: void 0
    });

    time_classPrivateFieldInitSpec(this, time_controlLayer, {
      writable: true,
      value: void 0
    });

    classPrivateFieldSet_default()(this, time_player, player);

    classPrivateFieldSet_default()(this, time_controlPosition, position);

    classPrivateFieldSet_default()(this, time_controlLayer, layer);
  }

  createClass_default()(Time, [{
    key: "create",
    value: function create() {
      var _this = this;

      var _classPrivateFieldGet2 = classPrivateFieldGet_default()(this, time_player).getOptions(),
          labels = _classPrivateFieldGet2.labels,
          progress = _classPrivateFieldGet2.progress;

      classPrivateFieldSet_default()(this, _currentTime, document.createElement('time'));

      classPrivateFieldGet_default()(this, _currentTime).className = 'op-controls__current';

      classPrivateFieldGet_default()(this, _currentTime).setAttribute('role', 'timer');

      classPrivateFieldGet_default()(this, _currentTime).setAttribute('aria-live', 'off');

      classPrivateFieldGet_default()(this, _currentTime).setAttribute('aria-hidden', 'false');

      classPrivateFieldGet_default()(this, _currentTime).innerText = '0:00';
      var showOnlyCurrent = (progress === null || progress === void 0 ? void 0 : progress.showCurrentTimeOnly) || false;

      if (!showOnlyCurrent) {
        classPrivateFieldSet_default()(this, _delimiter, document.createElement('span'));

        classPrivateFieldGet_default()(this, _delimiter).className = 'op-controls__time-delimiter';

        classPrivateFieldGet_default()(this, _delimiter).setAttribute('aria-hidden', 'false');

        classPrivateFieldGet_default()(this, _delimiter).innerText = '/';

        classPrivateFieldSet_default()(this, _duration, document.createElement('time'));

        classPrivateFieldGet_default()(this, _duration).className = 'op-controls__duration';

        classPrivateFieldGet_default()(this, _duration).setAttribute('aria-hidden', 'false');

        classPrivateFieldGet_default()(this, _duration).innerText = formatTime((progress === null || progress === void 0 ? void 0 : progress.duration) || 0);
      }

      var controls = classPrivateFieldGet_default()(this, time_player).getControls().getLayer(classPrivateFieldGet_default()(this, time_controlLayer));

      classPrivateFieldSet_default()(this, _container, document.createElement('span'));

      classPrivateFieldGet_default()(this, _container).className = "op-controls-time op-control__".concat(classPrivateFieldGet_default()(this, time_controlPosition));

      classPrivateFieldGet_default()(this, _container).appendChild(classPrivateFieldGet_default()(this, _currentTime));

      if (!showOnlyCurrent) {
        classPrivateFieldGet_default()(this, _container).appendChild(classPrivateFieldGet_default()(this, _delimiter));

        classPrivateFieldGet_default()(this, _container).appendChild(classPrivateFieldGet_default()(this, _duration));
      }

      controls.appendChild(classPrivateFieldGet_default()(this, _container));

      var setInitialTime = function setInitialTime() {
        var el = classPrivateFieldGet_default()(_this, time_player).activeElement();

        if (el.duration !== Infinity && !classPrivateFieldGet_default()(_this, time_player).getElement().getAttribute('op-live__enabled')) {
          if (!showOnlyCurrent) {
            var _classPrivateFieldGet3;

            var duration = !Number.isNaN(el.duration) ? el.duration : ((_classPrivateFieldGet3 = classPrivateFieldGet_default()(_this, time_player).getOptions().progress) === null || _classPrivateFieldGet3 === void 0 ? void 0 : _classPrivateFieldGet3.duration) || 0;
            classPrivateFieldGet_default()(_this, _duration).innerText = formatTime(duration);
          }

          classPrivateFieldGet_default()(_this, _currentTime).innerText = formatTime(el.currentTime);
        } else if (!showOnlyCurrent) {
          classPrivateFieldGet_default()(_this, _duration).setAttribute('aria-hidden', 'true');

          classPrivateFieldGet_default()(_this, _delimiter).setAttribute('aria-hidden', 'true');
        }
      };

      classPrivateFieldGet_default()(this, time_events).media.loadedmetadata = setInitialTime.bind(this);
      classPrivateFieldGet_default()(this, time_events).controls.controlschanged = setInitialTime.bind(this);

      var _ref = classPrivateFieldGet_default()(this, time_player).getOptions().live || {},
          showLiveLabel = _ref.showLabel;

      classPrivateFieldGet_default()(this, time_events).media.timeupdate = function () {
        var el = classPrivateFieldGet_default()(_this, time_player).activeElement();

        if (el.duration !== Infinity && !classPrivateFieldGet_default()(_this, time_player).getElement().getAttribute('op-live__enabled') && !classPrivateFieldGet_default()(_this, time_player).getElement().getAttribute('op-dvr__enabled')) {
          var duration = formatTime(el.duration);

          if (!showOnlyCurrent && !Number.isNaN(el.duration) && duration !== classPrivateFieldGet_default()(_this, _duration).innerText) {
            classPrivateFieldGet_default()(_this, _duration).innerText = duration;

            classPrivateFieldGet_default()(_this, _duration).setAttribute('aria-hidden', 'false');

            classPrivateFieldGet_default()(_this, _delimiter).setAttribute('aria-hidden', 'false');
          } else if (showOnlyCurrent || duration !== classPrivateFieldGet_default()(_this, _duration).innerText) {
            classPrivateFieldGet_default()(_this, _currentTime).innerText = showLiveLabel ? (labels === null || labels === void 0 ? void 0 : labels.live) || '' : formatTime(el.currentTime);
          }

          classPrivateFieldGet_default()(_this, _currentTime).innerText = formatTime(el.currentTime);
        } else if (classPrivateFieldGet_default()(_this, time_player).getElement().getAttribute('op-dvr__enabled')) {
          if (!showOnlyCurrent) {
            classPrivateFieldGet_default()(_this, _duration).setAttribute('aria-hidden', 'true');

            classPrivateFieldGet_default()(_this, _delimiter).setAttribute('aria-hidden', 'true');
          }

          classPrivateFieldGet_default()(_this, _currentTime).innerText = formatTime(el.currentTime);
        } else if (showOnlyCurrent || !classPrivateFieldGet_default()(_this, time_player).getElement().getAttribute('op-dvr__enabled') && classPrivateFieldGet_default()(_this, _duration).getAttribute('aria-hidden') === 'false') {
          if (!showOnlyCurrent) {
            classPrivateFieldGet_default()(_this, _duration).setAttribute('aria-hidden', 'true');

            classPrivateFieldGet_default()(_this, _delimiter).setAttribute('aria-hidden', 'true');
          }

          classPrivateFieldGet_default()(_this, _currentTime).innerText = showLiveLabel ? (labels === null || labels === void 0 ? void 0 : labels.live) || '' : formatTime(el.currentTime);
        } else {
          classPrivateFieldGet_default()(_this, _currentTime).innerText = showLiveLabel ? (labels === null || labels === void 0 ? void 0 : labels.live) || '' : formatTime(el.currentTime);
        }
      };

      classPrivateFieldGet_default()(this, time_events).media.ended = function () {
        var _classPrivateFieldGet4;

        var el = classPrivateFieldGet_default()(_this, time_player).activeElement();

        var duration = !Number.isNaN(el.duration) ? el.duration : ((_classPrivateFieldGet4 = classPrivateFieldGet_default()(_this, time_player).getOptions().progress) === null || _classPrivateFieldGet4 === void 0 ? void 0 : _classPrivateFieldGet4.duration) || 0;

        if (!showOnlyCurrent && classPrivateFieldGet_default()(_this, time_player).isMedia()) {
          classPrivateFieldGet_default()(_this, _duration).innerText = formatTime(duration);
        }
      };

      Object.keys(classPrivateFieldGet_default()(this, time_events).media).forEach(function (event) {
        classPrivateFieldGet_default()(_this, time_player).getElement().addEventListener(event, classPrivateFieldGet_default()(_this, time_events).media[event], EVENT_OPTIONS);
      });

      classPrivateFieldGet_default()(this, time_player).getControls().getContainer().addEventListener('controlschanged', classPrivateFieldGet_default()(this, time_events).controls.controlschanged, EVENT_OPTIONS);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this2 = this;

      Object.keys(classPrivateFieldGet_default()(this, time_events).media).forEach(function (event) {
        classPrivateFieldGet_default()(_this2, time_player).getElement().removeEventListener(event, classPrivateFieldGet_default()(_this2, time_events).media[event]);
      });

      classPrivateFieldGet_default()(this, time_player).getControls().getContainer().removeEventListener('controlschanged', classPrivateFieldGet_default()(this, time_events).controls.controlschanged);

      classPrivateFieldGet_default()(this, _currentTime).remove();

      var _ref2 = classPrivateFieldGet_default()(this, time_player).getOptions().progress || {},
          showCurrentTimeOnly = _ref2.showCurrentTimeOnly;

      if (!showCurrentTimeOnly) {
        classPrivateFieldGet_default()(this, _delimiter).remove();

        classPrivateFieldGet_default()(this, _duration).remove();
      }

      classPrivateFieldGet_default()(this, _container).remove();
    }
  }]);

  return Time;
}();

/* harmony default export */ const time = (Time);
;// CONCATENATED MODULE: ./src/controls/volume.ts





function volume_classPrivateFieldInitSpec(obj, privateMap, value) { volume_checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function volume_checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }




var volume_player = new WeakMap();

var volume_button = new WeakMap();

var volume_container = new WeakMap();

var _display = new WeakMap();

var volume_slider = new WeakMap();

var volume_events = new WeakMap();

var _volume = new WeakMap();

var volume_controlPosition = new WeakMap();

var volume_controlLayer = new WeakMap();

var Volume = function () {
  function Volume(player, position, layer) {
    classCallCheck_default()(this, Volume);

    volume_classPrivateFieldInitSpec(this, volume_player, {
      writable: true,
      value: void 0
    });

    volume_classPrivateFieldInitSpec(this, volume_button, {
      writable: true,
      value: void 0
    });

    volume_classPrivateFieldInitSpec(this, volume_container, {
      writable: true,
      value: void 0
    });

    volume_classPrivateFieldInitSpec(this, _display, {
      writable: true,
      value: void 0
    });

    volume_classPrivateFieldInitSpec(this, volume_slider, {
      writable: true,
      value: void 0
    });

    volume_classPrivateFieldInitSpec(this, volume_events, {
      writable: true,
      value: {
        button: {},
        media: {},
        slider: {}
      }
    });

    volume_classPrivateFieldInitSpec(this, _volume, {
      writable: true,
      value: void 0
    });

    volume_classPrivateFieldInitSpec(this, volume_controlPosition, {
      writable: true,
      value: void 0
    });

    volume_classPrivateFieldInitSpec(this, volume_controlLayer, {
      writable: true,
      value: void 0
    });

    classPrivateFieldSet_default()(this, volume_player, player);

    classPrivateFieldSet_default()(this, _volume, classPrivateFieldGet_default()(this, volume_player).getMedia().volume);

    classPrivateFieldSet_default()(this, volume_controlPosition, position);

    classPrivateFieldSet_default()(this, volume_controlLayer, layer);

    this._enterSpaceKeyEvent = this._enterSpaceKeyEvent.bind(this);
  }

  createClass_default()(Volume, [{
    key: "create",
    value: function create() {
      var _this = this;

      var _classPrivateFieldGet2 = classPrivateFieldGet_default()(this, volume_player).getOptions(),
          labels = _classPrivateFieldGet2.labels;

      classPrivateFieldSet_default()(this, volume_container, document.createElement('div'));

      classPrivateFieldGet_default()(this, volume_container).className = "op-controls__volume op-control__".concat(classPrivateFieldGet_default()(this, volume_controlPosition));
      classPrivateFieldGet_default()(this, volume_container).tabIndex = 0;

      classPrivateFieldGet_default()(this, volume_container).setAttribute('aria-valuemin', '0');

      classPrivateFieldGet_default()(this, volume_container).setAttribute('aria-valuemax', '100');

      classPrivateFieldGet_default()(this, volume_container).setAttribute('aria-valuenow', "".concat(classPrivateFieldGet_default()(this, _volume)));

      classPrivateFieldGet_default()(this, volume_container).setAttribute('aria-valuetext', "".concat((labels === null || labels === void 0 ? void 0 : labels.volume) || '', ": ").concat(classPrivateFieldGet_default()(this, _volume)));

      classPrivateFieldGet_default()(this, volume_container).setAttribute('aria-orientation', 'vertical');

      classPrivateFieldGet_default()(this, volume_container).setAttribute('aria-label', (labels === null || labels === void 0 ? void 0 : labels.volumeSlider) || '');

      classPrivateFieldSet_default()(this, volume_slider, document.createElement('input'));

      classPrivateFieldGet_default()(this, volume_slider).type = 'range';
      classPrivateFieldGet_default()(this, volume_slider).className = 'op-controls__volume--input';
      classPrivateFieldGet_default()(this, volume_slider).tabIndex = -1;
      classPrivateFieldGet_default()(this, volume_slider).value = classPrivateFieldGet_default()(this, volume_player).getMedia().volume.toString();

      classPrivateFieldGet_default()(this, volume_slider).setAttribute('min', '0');

      classPrivateFieldGet_default()(this, volume_slider).setAttribute('max', '1');

      classPrivateFieldGet_default()(this, volume_slider).setAttribute('step', '0.1');

      classPrivateFieldGet_default()(this, volume_slider).setAttribute('aria-label', (labels === null || labels === void 0 ? void 0 : labels.volumeControl) || '');

      classPrivateFieldSet_default()(this, _display, document.createElement('progress'));

      classPrivateFieldGet_default()(this, _display).className = 'op-controls__volume--display';

      classPrivateFieldGet_default()(this, _display).setAttribute('max', '10');

      classPrivateFieldGet_default()(this, _display).setAttribute('role', 'presentation');

      classPrivateFieldGet_default()(this, _display).value = classPrivateFieldGet_default()(this, volume_player).getMedia().volume * 10;

      classPrivateFieldGet_default()(this, volume_container).appendChild(classPrivateFieldGet_default()(this, volume_slider));

      classPrivateFieldGet_default()(this, volume_container).appendChild(classPrivateFieldGet_default()(this, _display));

      classPrivateFieldSet_default()(this, volume_button, document.createElement('button'));

      classPrivateFieldGet_default()(this, volume_button).type = 'button';
      classPrivateFieldGet_default()(this, volume_button).className = "op-controls__mute op-control__".concat(classPrivateFieldGet_default()(this, volume_controlPosition));
      classPrivateFieldGet_default()(this, volume_button).tabIndex = 0;
      classPrivateFieldGet_default()(this, volume_button).title = (labels === null || labels === void 0 ? void 0 : labels.mute) || '';

      classPrivateFieldGet_default()(this, volume_button).setAttribute('aria-controls', classPrivateFieldGet_default()(this, volume_player).id);

      classPrivateFieldGet_default()(this, volume_button).setAttribute('aria-pressed', 'false');

      classPrivateFieldGet_default()(this, volume_button).setAttribute('aria-label', (labels === null || labels === void 0 ? void 0 : labels.mute) || '');

      var updateSlider = function updateSlider(element) {
        var mediaVolume = element.volume * 1;
        var vol = Math.floor(mediaVolume * 100);
        classPrivateFieldGet_default()(_this, volume_slider).value = "".concat(element.volume);
        classPrivateFieldGet_default()(_this, _display).value = mediaVolume * 10;

        classPrivateFieldGet_default()(_this, volume_container).setAttribute('aria-valuenow', "".concat(vol));

        classPrivateFieldGet_default()(_this, volume_container).setAttribute('aria-valuetext', "".concat(labels === null || labels === void 0 ? void 0 : labels.volume, ": ").concat(vol));
      };

      var updateButton = function updateButton(element) {
        var vol = element.volume;

        if (vol <= 0.5 && vol > 0) {
          classPrivateFieldGet_default()(_this, volume_button).classList.remove('op-controls__mute--muted');

          classPrivateFieldGet_default()(_this, volume_button).classList.add('op-controls__mute--half');
        } else if (vol === 0) {
          classPrivateFieldGet_default()(_this, volume_button).classList.add('op-controls__mute--muted');

          classPrivateFieldGet_default()(_this, volume_button).classList.remove('op-controls__mute--half');
        } else {
          classPrivateFieldGet_default()(_this, volume_button).classList.remove('op-controls__mute--muted');

          classPrivateFieldGet_default()(_this, volume_button).classList.remove('op-controls__mute--half');
        }
      };

      var updateVolume = function updateVolume(event) {
        var el = classPrivateFieldGet_default()(_this, volume_player).activeElement();

        var value = parseFloat(event.target.value);
        el.volume = value;
        el.muted = el.volume === 0;

        classPrivateFieldSet_default()(_this, _volume, value);

        var unmuteEl = classPrivateFieldGet_default()(_this, volume_player).getContainer().querySelector('.op-player__unmute');

        if (!el.muted && unmuteEl) {
          unmuteEl.remove();
        }

        var e = addEvent('volumechange');

        classPrivateFieldGet_default()(_this, volume_player).getElement().dispatchEvent(e);
      };

      classPrivateFieldGet_default()(this, volume_events).media.volumechange = function () {
        var el = classPrivateFieldGet_default()(_this, volume_player).activeElement();

        updateSlider(el);
        updateButton(el);
      };

      classPrivateFieldGet_default()(this, volume_events).media.loadedmetadata = function () {
        var el = classPrivateFieldGet_default()(_this, volume_player).activeElement();

        if (el.muted) {
          el.volume = 0;
        }

        var e = addEvent('volumechange');

        classPrivateFieldGet_default()(_this, volume_player).getElement().dispatchEvent(e);
      };

      classPrivateFieldGet_default()(this, volume_events).slider.input = updateVolume.bind(this);
      classPrivateFieldGet_default()(this, volume_events).slider.change = updateVolume.bind(this);

      classPrivateFieldGet_default()(this, volume_events).button.click = function () {
        classPrivateFieldGet_default()(_this, volume_button).setAttribute('aria-pressed', 'true');

        var el = classPrivateFieldGet_default()(_this, volume_player).activeElement();

        el.muted = !el.muted;

        if (el.muted) {
          el.volume = 0;
          classPrivateFieldGet_default()(_this, volume_button).title = (labels === null || labels === void 0 ? void 0 : labels.unmute) || '';

          classPrivateFieldGet_default()(_this, volume_button).setAttribute('aria-label', (labels === null || labels === void 0 ? void 0 : labels.unmute) || '');
        } else {
          el.volume = classPrivateFieldGet_default()(_this, _volume);
          classPrivateFieldGet_default()(_this, volume_button).title = (labels === null || labels === void 0 ? void 0 : labels.mute) || '';

          classPrivateFieldGet_default()(_this, volume_button).setAttribute('aria-label', (labels === null || labels === void 0 ? void 0 : labels.mute) || '');
        }

        var event = addEvent('volumechange');

        classPrivateFieldGet_default()(_this, volume_player).getElement().dispatchEvent(event);
      };

      classPrivateFieldGet_default()(this, volume_button).addEventListener('click', classPrivateFieldGet_default()(this, volume_events).button.click, EVENT_OPTIONS);

      Object.keys(classPrivateFieldGet_default()(this, volume_events).media).forEach(function (event) {
        classPrivateFieldGet_default()(_this, volume_player).getElement().addEventListener(event, classPrivateFieldGet_default()(_this, volume_events).media[event], EVENT_OPTIONS);
      });
      Object.keys(classPrivateFieldGet_default()(this, volume_events).slider).forEach(function (event) {
        classPrivateFieldGet_default()(_this, volume_slider).addEventListener(event, classPrivateFieldGet_default()(_this, volume_events).slider[event], EVENT_OPTIONS);
      });

      classPrivateFieldGet_default()(this, volume_player).getContainer().addEventListener('keydown', this._enterSpaceKeyEvent, EVENT_OPTIONS);

      if (!IS_ANDROID && !IS_IOS || !classPrivateFieldGet_default()(this, volume_player).getOptions().useDeviceVolume) {
        var controls = classPrivateFieldGet_default()(this, volume_player).getControls().getLayer(classPrivateFieldGet_default()(this, volume_controlLayer));

        controls.appendChild(classPrivateFieldGet_default()(this, volume_button));
        controls.appendChild(classPrivateFieldGet_default()(this, volume_container));
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this2 = this;

      classPrivateFieldGet_default()(this, volume_button).removeEventListener('click', classPrivateFieldGet_default()(this, volume_events).button.click);

      Object.keys(classPrivateFieldGet_default()(this, volume_events).media).forEach(function (event) {
        classPrivateFieldGet_default()(_this2, volume_player).getElement().removeEventListener(event, classPrivateFieldGet_default()(_this2, volume_events).media[event]);
      });
      Object.keys(classPrivateFieldGet_default()(this, volume_events).slider).forEach(function (event) {
        classPrivateFieldGet_default()(_this2, volume_slider).removeEventListener(event, classPrivateFieldGet_default()(_this2, volume_events).slider[event]);
      });

      classPrivateFieldGet_default()(this, volume_player).getContainer().removeEventListener('keydown', this._enterSpaceKeyEvent);

      classPrivateFieldGet_default()(this, volume_slider).remove();

      classPrivateFieldGet_default()(this, _display).remove();

      classPrivateFieldGet_default()(this, volume_container).remove();
    }
  }, {
    key: "_enterSpaceKeyEvent",
    value: function _enterSpaceKeyEvent(e) {
      var _document, _document$activeEleme;

      var key = e.which || e.keyCode || 0;

      var el = classPrivateFieldGet_default()(this, volume_player).activeElement();

      var playBtnFocused = (_document = document) === null || _document === void 0 ? void 0 : (_document$activeEleme = _document.activeElement) === null || _document$activeEleme === void 0 ? void 0 : _document$activeEleme.classList.contains('op-controls__mute');

      if (playBtnFocused && (key === 13 || key === 32)) {
        el.muted = !el.muted;
        el.volume = el.muted ? 0 : classPrivateFieldGet_default()(this, _volume);

        classPrivateFieldGet_default()(this, volume_events).button.click();

        e.preventDefault();
        e.stopPropagation();
      }
    }
  }]);

  return Volume;
}();

/* harmony default export */ const volume = (Volume);
;// CONCATENATED MODULE: ./src/controls.ts







function controls_classPrivateFieldInitSpec(obj, privateMap, value) { controls_checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function controls_checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }












var _settings = new WeakMap();

var _timer = new WeakMap();

var _controls = new WeakMap();

var controls_player = new WeakMap();

var _items = new WeakMap();

var _controlEls = new WeakMap();

var Controls = function () {
  function Controls(player) {
    classCallCheck_default()(this, Controls);

    defineProperty_default()(this, "events", {
      media: {},
      mouse: {}
    });

    controls_classPrivateFieldInitSpec(this, _settings, {
      writable: true,
      value: void 0
    });

    controls_classPrivateFieldInitSpec(this, _timer, {
      writable: true,
      value: 0
    });

    controls_classPrivateFieldInitSpec(this, _controls, {
      writable: true,
      value: void 0
    });

    controls_classPrivateFieldInitSpec(this, controls_player, {
      writable: true,
      value: void 0
    });

    controls_classPrivateFieldInitSpec(this, _items, {
      writable: true,
      value: void 0
    });

    controls_classPrivateFieldInitSpec(this, _controlEls, {
      writable: true,
      value: {
        Captions: captions,
        Fullscreen: fullscreen,
        Levels: levels,
        Play: play,
        Progress: progress,
        Settings: settings,
        Time: time,
        Volume: volume
      }
    });

    classPrivateFieldSet_default()(this, controls_player, player);

    this._setElements();
  }

  createClass_default()(Controls, [{
    key: "create",
    value: function create() {
      var _this = this;

      classPrivateFieldGet_default()(this, controls_player).getElement().controls = false;
      var isMediaVideo = isVideo(classPrivateFieldGet_default()(this, controls_player).getElement());

      this._createControlsLayer();

      this._buildElements();

      this.events.controlschanged = function () {
        _this.destroy();

        _this._setElements();

        _this.create();
      };

      this.events.ended = function () {
        classPrivateFieldGet_default()(_this, controls_player).getContainer().classList.remove('op-controls--hidden');
      };

      classPrivateFieldGet_default()(this, controls_player).getElement().addEventListener('controlschanged', this.events.controlschanged, EVENT_OPTIONS);

      classPrivateFieldGet_default()(this, controls_player).getElement().addEventListener('ended', this.events.ended, EVENT_OPTIONS);

      var _ref = classPrivateFieldGet_default()(this, controls_player).getOptions().controls || {},
          alwaysVisible = _ref.alwaysVisible;

      if (!alwaysVisible) {
        var showControls = function showControls() {
          if (isMediaVideo) {
            classPrivateFieldGet_default()(_this, controls_player).getContainer().classList.remove('op-controls--hidden');

            _this._stopControlTimer();
          }
        };

        this.events.mouse.mouseenter = function () {
          if (isMediaVideo && !classPrivateFieldGet_default()(_this, controls_player).activeElement().paused) {
            _this._stopControlTimer();

            if (classPrivateFieldGet_default()(_this, controls_player).activeElement().currentTime) {
              classPrivateFieldGet_default()(_this, controls_player).playBtn.setAttribute('aria-hidden', classPrivateFieldGet_default()(_this, controls_player).isMedia() ? 'false' : 'true');

              classPrivateFieldGet_default()(_this, controls_player).loader.setAttribute('aria-hidden', 'true');
            } else if (classPrivateFieldGet_default()(_this, controls_player).getOptions().showLoaderOnInit) {
              classPrivateFieldGet_default()(_this, controls_player).playBtn.setAttribute('aria-hidden', 'true');

              classPrivateFieldGet_default()(_this, controls_player).loader.setAttribute('aria-hidden', 'false');
            }

            classPrivateFieldGet_default()(_this, controls_player).getContainer().classList.remove('op-controls--hidden');

            _this._startControlTimer(2500);
          }
        };

        this.events.mouse.mousemove = function () {
          if (isMediaVideo && !classPrivateFieldGet_default()(_this, controls_player).activeElement().paused) {
            if (classPrivateFieldGet_default()(_this, controls_player).activeElement().currentTime) {
              classPrivateFieldGet_default()(_this, controls_player).loader.setAttribute('aria-hidden', 'true');

              classPrivateFieldGet_default()(_this, controls_player).playBtn.setAttribute('aria-hidden', classPrivateFieldGet_default()(_this, controls_player).isMedia() ? 'false' : 'true');
            } else {
              classPrivateFieldGet_default()(_this, controls_player).playBtn.setAttribute('aria-hidden', classPrivateFieldGet_default()(_this, controls_player).getOptions().showLoaderOnInit ? 'true' : 'false');

              classPrivateFieldGet_default()(_this, controls_player).loader.setAttribute('aria-hidden', classPrivateFieldGet_default()(_this, controls_player).getOptions().showLoaderOnInit ? 'false' : 'true');
            }

            classPrivateFieldGet_default()(_this, controls_player).getContainer().classList.remove('op-controls--hidden');

            _this._startControlTimer(2500);
          }
        };

        this.events.mouse.mouseleave = function () {
          if (isMediaVideo && !classPrivateFieldGet_default()(_this, controls_player).activeElement().paused) {
            _this._startControlTimer(1000);
          }
        };

        this.events.media.play = function () {
          if (isMediaVideo) {
            _this._startControlTimer(classPrivateFieldGet_default()(_this, controls_player).getOptions().hidePlayBtnTimer || 350);
          }
        };

        this.events.media.loadedmetadata = showControls.bind(this);
        this.events.media.pause = showControls.bind(this);
        this.events.media.waiting = showControls.bind(this);
        this.events.media.stalled = showControls.bind(this);
        this.events.media.playererror = showControls.bind(this);
        Object.keys(this.events.media).forEach(function (event) {
          classPrivateFieldGet_default()(_this, controls_player).getElement().addEventListener(event, _this.events.media[event], EVENT_OPTIONS);
        });

        if (IS_ANDROID || IS_IOS) {
          classPrivateFieldGet_default()(this, controls_player).getContainer().addEventListener('click', this.events.mouse.mouseenter, EVENT_OPTIONS);
        } else {
          Object.keys(this.events.mouse).forEach(function (event) {
            classPrivateFieldGet_default()(_this, controls_player).getContainer().addEventListener(event, _this.events.mouse[event], EVENT_OPTIONS);
          });
        }

        if (isMediaVideo && !classPrivateFieldGet_default()(this, controls_player).activeElement().paused) {
          this._startControlTimer(3000);
        }
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this2 = this;

      if (!IS_ANDROID && !IS_IOS) {
        Object.keys(this.events.mouse).forEach(function (event) {
          classPrivateFieldGet_default()(_this2, controls_player).getContainer().removeEventListener(event, _this2.events.mouse[event]);
        });
        Object.keys(this.events.media).forEach(function (event) {
          classPrivateFieldGet_default()(_this2, controls_player).getElement().removeEventListener(event, _this2.events.media[event]);
        });

        this._stopControlTimer();
      }

      classPrivateFieldGet_default()(this, controls_player).getElement().removeEventListener('controlschanged', this.events.controlschanged);

      classPrivateFieldGet_default()(this, controls_player).getElement().removeEventListener('ended', this.events.ended);

      Object.keys(classPrivateFieldGet_default()(this, _items)).forEach(function (position) {
        classPrivateFieldGet_default()(_this2, _items)[position].forEach(function (item) {
          if (item.custom) {
            _this2._destroyCustomElement(item);
          } else if (typeof item.destroy === 'function') {
            item.destroy();
          }
        });
      });

      classPrivateFieldGet_default()(this, _controls).remove();
    }
  }, {
    key: "getContainer",
    value: function getContainer() {
      return classPrivateFieldGet_default()(this, _controls);
    }
  }, {
    key: "getLayer",
    value: function getLayer(layer) {
      return classPrivateFieldGet_default()(this, _controls).querySelector(".op-controls-layer__".concat(layer)) || classPrivateFieldGet_default()(this, _controls);
    }
  }, {
    key: "_createControlsLayer",
    value: function _createControlsLayer() {
      if (!classPrivateFieldGet_default()(this, _controls) || !classPrivateFieldGet_default()(this, controls_player).getContainer().querySelector('.op-controls')) {
        classPrivateFieldSet_default()(this, _controls, document.createElement('div'));

        classPrivateFieldGet_default()(this, _controls).className = 'op-controls';

        classPrivateFieldGet_default()(this, controls_player).getContainer().appendChild(classPrivateFieldGet_default()(this, _controls));

        var messageContainer = document.createElement('div');
        messageContainer.className = 'op-status';
        messageContainer.innerHTML = '<span></span>';
        messageContainer.tabIndex = -1;
        messageContainer.setAttribute('aria-hidden', 'true');

        if (isAudio(classPrivateFieldGet_default()(this, controls_player).getElement())) {
          classPrivateFieldGet_default()(this, _controls).appendChild(messageContainer);
        }
      }
    }
  }, {
    key: "_startControlTimer",
    value: function _startControlTimer(time) {
      var _this3 = this;

      var el = classPrivateFieldGet_default()(this, controls_player).activeElement();

      this._stopControlTimer();

      if (typeof window !== 'undefined') {
        classPrivateFieldSet_default()(this, _timer, window.setTimeout(function () {
          if ((!el.paused || !el.ended) && isVideo(classPrivateFieldGet_default()(_this3, controls_player).getElement())) {
            classPrivateFieldGet_default()(_this3, controls_player).getContainer().classList.add('op-controls--hidden');

            classPrivateFieldGet_default()(_this3, controls_player).playBtn.setAttribute('aria-hidden', 'true');

            _this3._stopControlTimer();

            var event = addEvent('controlshidden');

            classPrivateFieldGet_default()(_this3, controls_player).getElement().dispatchEvent(event);
          }
        }, time));
      }
    }
  }, {
    key: "_stopControlTimer",
    value: function _stopControlTimer() {
      if (classPrivateFieldGet_default()(this, _timer) !== 0) {
        clearTimeout(classPrivateFieldGet_default()(this, _timer));

        classPrivateFieldSet_default()(this, _timer, 0);
      }
    }
  }, {
    key: "_setElements",
    value: function _setElements() {
      var _classPrivateFieldGet2,
          _this4 = this;

      var controls = ((_classPrivateFieldGet2 = classPrivateFieldGet_default()(this, controls_player).getOptions().controls) === null || _classPrivateFieldGet2 === void 0 ? void 0 : _classPrivateFieldGet2.layers) || {};

      classPrivateFieldSet_default()(this, _items, {
        'bottom-left': [],
        'bottom-middle': [],
        'bottom-right': [],
        left: [],
        main: [],
        middle: [],
        right: [],
        'top-left': [],
        'top-middle': [],
        'top-right': []
      });

      var isVideoEl = isVideo(classPrivateFieldGet_default()(this, controls_player).getElement());
      var isAudioEl = isAudio(classPrivateFieldGet_default()(this, controls_player).getElement());
      var controlPositions = Object.keys(controls);
      var layersExist = controlPositions.find(function (item) {
        return /^(top|bottom)/.test(item);
      });

      this._createControlsLayer();

      controlPositions.forEach(function (position) {
        var _position$split = position.split('-'),
            _position$split2 = slicedToArray_default()(_position$split, 2),
            layer = _position$split2[0],
            pos = _position$split2[1];

        if (pos) {
          if (!classPrivateFieldGet_default()(_this4, _controls).classList.contains('op-controls__stacked')) {
            classPrivateFieldGet_default()(_this4, _controls).classList.add('op-controls__stacked');
          }

          var className = "op-controls-layer__".concat(layer);

          if (!classPrivateFieldGet_default()(_this4, _controls).querySelector(".".concat(className))) {
            var controlLayer = document.createElement('div');
            controlLayer.className = className;

            classPrivateFieldGet_default()(_this4, _controls).appendChild(controlLayer);
          }
        } else if (layersExist) {
          var _className = 'op-controls-layer__center';

          if (!classPrivateFieldGet_default()(_this4, _controls).querySelector(".".concat(_className))) {
            var _controlLayer = document.createElement('div');

            _controlLayer.className = _className;

            classPrivateFieldGet_default()(_this4, _controls).appendChild(_controlLayer);
          }
        }

        var layers = controls ? controls[position] : null;

        if (layers) {
          layers.filter(function (v, i, a) {
            return a.indexOf(v) === i;
          }).forEach(function (el) {
            var currentLayer = layersExist && !pos ? 'center' : layer;
            var className = "".concat(el.charAt(0).toUpperCase()).concat(el.slice(1));
            var item = new (classPrivateFieldGet_default()(_this4, _controlEls)[className])(classPrivateFieldGet_default()(_this4, controls_player), pos || layer, currentLayer);

            if (el === 'settings') {
              classPrivateFieldSet_default()(_this4, _settings, item);
            }

            if (isVideoEl || el !== 'fullscreen' && isAudioEl) {
              classPrivateFieldGet_default()(_this4, _items)[position].push(item);
            }
          });
        }
      });

      classPrivateFieldGet_default()(this, controls_player).getCustomControls().forEach(function (item) {
        var _item$position$split = item.position.split('-'),
            _item$position$split2 = slicedToArray_default()(_item$position$split, 2),
            layer = _item$position$split2[0],
            pos = _item$position$split2[1];

        var currentLayer = layersExist && !pos ? 'center' : layer;
        item.layer = currentLayer;
        item.position = pos || layer;

        if (item.position === 'right') {
          classPrivateFieldGet_default()(_this4, _items)[item.position].unshift(item);
        } else {
          classPrivateFieldGet_default()(_this4, _items)[item.position].push(item);
        }
      });
    }
  }, {
    key: "_buildElements",
    value: function _buildElements() {
      var _this5 = this;

      Object.keys(classPrivateFieldGet_default()(this, _items)).forEach(function (position) {
        classPrivateFieldGet_default()(_this5, _items)[position].forEach(function (item) {
          if (item.custom) {
            _this5._createCustomElement(item);
          } else {
            item.create();
          }
        });
      });
      Object.keys(classPrivateFieldGet_default()(this, _items)).forEach(function (position) {
        classPrivateFieldGet_default()(_this5, _items)[position].forEach(function (item) {
          var allowDefault = !classPrivateFieldGet_default()(_this5, controls_player).getOptions().detachMenus || item instanceof settings;
          var current = item;

          if (allowDefault && !current.custom && typeof current.addSettings === 'function') {
            var menuItem = current.addSettings();

            if (classPrivateFieldGet_default()(_this5, _settings) && Object.keys(menuItem).length) {
              classPrivateFieldGet_default()(_this5, _settings).addItem(menuItem.name, menuItem.key, menuItem.default, menuItem.subitems, menuItem.className);
            }
          }
        });
      });
      var e = addEvent('controlschanged');

      classPrivateFieldGet_default()(this, _controls).dispatchEvent(e);
    }
  }, {
    key: "_hideCustomMenu",
    value: function _hideCustomMenu(menu) {
      var timeout;

      if (timeout && typeof window !== 'undefined') {
        window.cancelAnimationFrame(timeout);
      }

      if (typeof window !== 'undefined') {
        timeout = window.requestAnimationFrame(function () {
          menu.setAttribute('aria-hidden', 'true');
        });
      }
    }
  }, {
    key: "_toggleCustomMenu",
    value: function _toggleCustomMenu(event, menu, item) {
      var menus = classPrivateFieldGet_default()(this, controls_player).getContainer().querySelectorAll('.op-settings');

      menus.forEach(function (m) {
        if (m.getAttribute('aria-hidden') === 'false' && m.id !== menu.id) {
          m.setAttribute('aria-hidden', 'true');
        }
      });
      menu.setAttribute('aria-hidden', menu.getAttribute('aria-hidden') === 'true' ? 'false' : 'true');

      if (typeof item.click === 'function') {
        item.click(event);
      }
    }
  }, {
    key: "_createCustomElement",
    value: function _createCustomElement(item) {
      var _this6 = this;

      var element = document.createElement(item.type);
      element.tabIndex = 0;
      element.id = item.id;
      element.className = "op-controls__".concat(item.id, " op-control__").concat(item.position, " ").concat(item.showInAds ? '' : 'op-control__hide-in-ad');

      if (item.styles) {
        Object.assign(element.style, item.styles);
      }

      if (item.type === 'button' && item.icon) {
        element.innerHTML = /\.(jpg|png|svg|gif)$/.test(item.icon) ? "<img src=\"".concat(sanitize(item.icon), "\">") : sanitize(item.icon);
      } else if (item.content) {
        element.innerHTML = sanitize(item.content, false);
      }

      if (item.type === 'button' && item.title) {
        element.title = item.title;
      }

      if (item.type !== 'button' && item.click && typeof item.click === 'function') {
        element.setAttribute('aria-role', 'button');
      }

      if (item.type === 'button' && item.subitems && Array.isArray(item.subitems) && item.subitems.length > 0) {
        var menu = document.createElement('div');
        menu.className = 'op-settings op-settings__custom';
        menu.id = "".concat(item.id, "-menu");
        menu.setAttribute('aria-hidden', 'true');
        var items = item.subitems.map(function (s) {
          var itemIcon = '';

          if (s.icon) {
            itemIcon = /\.(jpg|png|svg|gif)$/.test(s.icon) ? "<img src=\"".concat(sanitize(s.icon), "\">") : sanitize(s.icon, false);
          }

          return "<div class=\"op-settings__menu-item\" tabindex=\"0\" ".concat(s.title ? "title=\"".concat(s.title, "\"") : '', " role=\"menuitemradio\">\n                    <div class=\"op-settings__menu-label\" id=\"").concat(s.id, "\" data-value=\"").concat(item.id, "-").concat(s.id, "\">").concat(itemIcon, " ").concat(s.label, "</div>\n                </div>");
        });
        menu.innerHTML = "<div class=\"op-settings__menu\" role=\"menu\">".concat(items.join(''), "</div>");

        classPrivateFieldGet_default()(this, controls_player).getContainer().appendChild(menu);

        item.subitems.forEach(function (subitem) {
          var menuItem = menu.querySelector("#".concat(subitem.id));

          if (menuItem && subitem.click && typeof subitem.click === 'function') {
            menuItem.addEventListener('click', subitem.click, EVENT_OPTIONS);
          }
        });
        element.addEventListener('click', function (e) {
          return _this6._toggleCustomMenu(e, menu, item);
        }, EVENT_OPTIONS);

        classPrivateFieldGet_default()(this, controls_player).getElement().addEventListener('controlshidden', function () {
          return _this6._hideCustomMenu(menu);
        }, EVENT_OPTIONS);
      } else if (item.click && typeof item.click === 'function') {
        element.addEventListener('click', item.click, EVENT_OPTIONS);
      }

      if (item.mouseenter && typeof item.mouseenter === 'function') {
        element.addEventListener('mouseenter', item.mouseenter, EVENT_OPTIONS);
      }

      if (item.mouseleave && typeof item.mouseleave === 'function') {
        element.addEventListener('mouseleave', item.mouseleave, EVENT_OPTIONS);
      }

      if (item.keydown && typeof item.keydown === 'function') {
        element.addEventListener('keydown', item.keydown, EVENT_OPTIONS);
      }

      if (item.blur && typeof item.blur === 'function') {
        element.addEventListener('blur', item.blur, EVENT_OPTIONS);
      }

      if (item.focus && typeof item.focus === 'function') {
        element.addEventListener('focus', item.focus, EVENT_OPTIONS);
      }

      if (item.layer) {
        if (item.layer === 'main') {
          classPrivateFieldGet_default()(this, controls_player).getContainer().appendChild(element);
        } else {
          this.getLayer(item.layer).appendChild(element);
        }
      }

      if (item.init && typeof item.init === 'function') {
        item.init(classPrivateFieldGet_default()(this, controls_player));
      }
    }
  }, {
    key: "_destroyCustomElement",
    value: function _destroyCustomElement(item) {
      var _this7 = this;

      var control = this.getContainer().querySelector(".op-controls__".concat(item.id));

      if (control) {
        if (item.subitems && Array.isArray(item.subitems) && item.subitems.length > 0) {
          var menu = classPrivateFieldGet_default()(this, controls_player).getContainer().querySelector("#".concat(item.id, "-menu"));

          if (menu) {
            item.subitems.forEach(function (subitem) {
              var menuItem = menu.querySelector("#".concat(subitem.id));

              if (menuItem && subitem.click && typeof subitem.click === 'function') {
                menuItem.removeEventListener('click', subitem.click);
              }
            });
            control.removeEventListener('click', function (e) {
              return _this7._toggleCustomMenu(e, menu, item);
            });

            classPrivateFieldGet_default()(this, controls_player).getElement().removeEventListener('controlshidden', function () {
              return _this7._hideCustomMenu(menu);
            });

            menu.remove();
          }
        }

        if (item.click && typeof item.click === 'function') {
          control.removeEventListener('click', item.click);
        }

        if (item.mouseenter && typeof item.mouseenter === 'function') {
          control.removeEventListener('mouseenter', item.mouseenter);
        }

        if (item.mouseleave && typeof item.mouseleave === 'function') {
          control.removeEventListener('mouseleave', item.mouseleave);
        }

        if (item.keydown && typeof item.keydown === 'function') {
          control.removeEventListener('keydown', item.keydown);
        }

        if (item.blur && typeof item.blur === 'function') {
          control.removeEventListener('blur', item.blur);
        }

        if (item.focus && typeof item.focus === 'function') {
          control.removeEventListener('focus', item.focus);
        }

        control.remove();

        if (item.destroy && typeof item.destroy === 'function') {
          item.destroy(classPrivateFieldGet_default()(this, controls_player));
        }
      }
    }
  }]);

  return Controls;
}();

/* harmony default export */ const controls = (Controls);
// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/assertThisInitialized.js
var assertThisInitialized = __webpack_require__(506);
var assertThisInitialized_default = /*#__PURE__*/__webpack_require__.n(assertThisInitialized);
// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/inherits.js
var inherits = __webpack_require__(205);
var inherits_default = /*#__PURE__*/__webpack_require__.n(inherits);
// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/possibleConstructorReturn.js
var possibleConstructorReturn = __webpack_require__(585);
var possibleConstructorReturn_default = /*#__PURE__*/__webpack_require__.n(possibleConstructorReturn);
// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/getPrototypeOf.js
var getPrototypeOf = __webpack_require__(754);
var getPrototypeOf_default = /*#__PURE__*/__webpack_require__.n(getPrototypeOf);
;// CONCATENATED MODULE: ./src/media/native.ts






function native_classPrivateFieldInitSpec(obj, privateMap, value) { native_checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function native_checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

var _customPlayer = new WeakMap();

var Native = function () {
  function Native(element, media) {
    classCallCheck_default()(this, Native);

    defineProperty_default()(this, "element", void 0);

    defineProperty_default()(this, "media", void 0);

    defineProperty_default()(this, "promise", void 0);

    native_classPrivateFieldInitSpec(this, _customPlayer, {
      writable: true,
      value: void 0
    });

    this.element = element;
    this.media = media;
    this.promise = new Promise(function (resolve) {
      resolve();
    });
  }

  createClass_default()(Native, [{
    key: "instance",
    get: function get() {
      return classPrivateFieldGet_default()(this, _customPlayer);
    },
    set: function set(customPlayer) {
      classPrivateFieldSet_default()(this, _customPlayer, customPlayer);
    }
  }, {
    key: "play",
    value: function play() {
      return this.element.play();
    }
  }, {
    key: "pause",
    value: function pause() {
      this.element.pause();
    }
  }, {
    key: "volume",
    get: function get() {
      return this.element.volume;
    },
    set: function set(value) {
      this.element.volume = value;
    }
  }, {
    key: "muted",
    get: function get() {
      return this.element.muted;
    },
    set: function set(value) {
      this.element.muted = value;
    }
  }, {
    key: "playbackRate",
    get: function get() {
      return this.element.playbackRate;
    },
    set: function set(value) {
      this.element.playbackRate = value;
    }
  }, {
    key: "defaultPlaybackRate",
    get: function get() {
      return this.element.defaultPlaybackRate;
    },
    set: function set(value) {
      this.element.defaultPlaybackRate = value;
    }
  }, {
    key: "currentTime",
    get: function get() {
      return this.element.currentTime;
    },
    set: function set(value) {
      this.element.currentTime = value;
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

/* harmony default export */ const media_native = (Native);
;// CONCATENATED MODULE: ./src/media/dash.ts










function dash_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function dash_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? dash_ownKeys(Object(source), !0).forEach(function (key) { defineProperty_default()(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : dash_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = getPrototypeOf_default()(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = getPrototypeOf_default()(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return possibleConstructorReturn_default()(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function dash_classPrivateFieldInitSpec(obj, privateMap, value) { dash_checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function dash_checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }






var dash_player = new WeakMap();

var dash_events = new WeakMap();

var _options = new WeakMap();

var DashMedia = function (_Native) {
  inherits_default()(DashMedia, _Native);

  var _super = _createSuper(DashMedia);

  function DashMedia(element, mediaSource, options) {
    var _this;

    classCallCheck_default()(this, DashMedia);

    _this = _super.call(this, element, mediaSource);

    dash_classPrivateFieldInitSpec(assertThisInitialized_default()(_this), dash_player, {
      writable: true,
      value: void 0
    });

    dash_classPrivateFieldInitSpec(assertThisInitialized_default()(_this), dash_events, {
      writable: true,
      value: {}
    });

    dash_classPrivateFieldInitSpec(assertThisInitialized_default()(_this), _options, {
      writable: true,
      value: {}
    });

    classPrivateFieldSet_default()(assertThisInitialized_default()(_this), _options, options);

    _this._assign = _this._assign.bind(assertThisInitialized_default()(_this));
    _this._preparePlayer = _this._preparePlayer.bind(assertThisInitialized_default()(_this));
    _this.promise = typeof dashjs === 'undefined' ? loadScript('https://cdn.dashjs.org/latest/dash.all.min.js') : new Promise(function (resolve) {
      resolve({});
    });

    _this.promise.then(function () {
      classPrivateFieldSet_default()(assertThisInitialized_default()(_this), dash_player, dashjs.MediaPlayer().create());

      _this.instance = classPrivateFieldGet_default()(assertThisInitialized_default()(_this), dash_player);
    });

    return _this;
  }

  createClass_default()(DashMedia, [{
    key: "canPlayType",
    value: function canPlayType(mimeType) {
      return HAS_MSE && mimeType === 'application/dash+xml';
    }
  }, {
    key: "load",
    value: function load() {
      var _this2 = this;

      this._preparePlayer();

      classPrivateFieldGet_default()(this, dash_player).attachSource(this.media.src);

      var e = addEvent('loadedmetadata');
      this.element.dispatchEvent(e);

      if (!classPrivateFieldGet_default()(this, dash_events)) {
        classPrivateFieldSet_default()(this, dash_events, dashjs.MediaPlayer.events);

        Object.keys(classPrivateFieldGet_default()(this, dash_events)).forEach(function (event) {
          classPrivateFieldGet_default()(_this2, dash_player).on(classPrivateFieldGet_default()(_this2, dash_events)[event], _this2._assign);
        });
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this3 = this;

      if (classPrivateFieldGet_default()(this, dash_events)) {
        Object.keys(classPrivateFieldGet_default()(this, dash_events)).forEach(function (event) {
          classPrivateFieldGet_default()(_this3, dash_player).off(classPrivateFieldGet_default()(_this3, dash_events)[event], _this3._assign);
        });

        classPrivateFieldSet_default()(this, dash_events, []);
      }

      classPrivateFieldGet_default()(this, dash_player).reset();
    }
  }, {
    key: "src",
    set: function set(media) {
      var _this4 = this;

      if (isDashSource(media)) {
        this.destroy();

        classPrivateFieldSet_default()(this, dash_player, dashjs.MediaPlayer().create());

        this._preparePlayer();

        classPrivateFieldGet_default()(this, dash_player).attachSource(media.src);

        classPrivateFieldSet_default()(this, dash_events, dashjs.MediaPlayer.events);

        Object.keys(classPrivateFieldGet_default()(this, dash_events)).forEach(function (event) {
          classPrivateFieldGet_default()(_this4, dash_player).on(classPrivateFieldGet_default()(_this4, dash_events)[event], _this4._assign);
        });
      }
    }
  }, {
    key: "levels",
    get: function get() {
      var levels = [];

      if (classPrivateFieldGet_default()(this, dash_player)) {
        var bitrates = classPrivateFieldGet_default()(this, dash_player).getBitrateInfoListFor('video');

        if (bitrates.length) {
          bitrates.forEach(function (item) {
            if (bitrates[item]) {
              var _bitrates$item = bitrates[item],
                  height = _bitrates$item.height,
                  name = _bitrates$item.name;
              var level = {
                height: height,
                id: "".concat(item),
                label: name || null
              };
              levels.push(level);
            }
          });
        }
      }

      return levels;
    }
  }, {
    key: "level",
    get: function get() {
      return classPrivateFieldGet_default()(this, dash_player) ? classPrivateFieldGet_default()(this, dash_player).getQualityFor('video') : '-1';
    },
    set: function set(level) {
      if (level === '0') {
        classPrivateFieldGet_default()(this, dash_player).setAutoSwitchQuality(true);
      } else {
        classPrivateFieldGet_default()(this, dash_player).setAutoSwitchQuality(false);

        classPrivateFieldGet_default()(this, dash_player).setQualityFor('video', level);
      }
    }
  }, {
    key: "_assign",
    value: function _assign(event) {
      if (event.type === 'error') {
        var details = {
          detail: {
            message: event,
            type: 'M(PEG)-DASH'
          }
        };
        var errorEvent = addEvent('playererror', details);
        this.element.dispatchEvent(errorEvent);
      } else {
        var e = addEvent(event.type, {
          detail: event
        });
        this.element.dispatchEvent(e);
      }
    }
  }, {
    key: "_preparePlayer",
    value: function _preparePlayer() {
      classPrivateFieldGet_default()(this, dash_player).updateSettings(dash_objectSpread({
        debug: {
          logLevel: dashjs.Debug.LOG_LEVEL_NONE
        },
        streaming: {
          fastSwitchEnabled: true,
          scheduleWhilePaused: false
        }
      }, classPrivateFieldGet_default()(this, _options) || {}));

      classPrivateFieldGet_default()(this, dash_player).initialize();

      classPrivateFieldGet_default()(this, dash_player).attachView(this.element);

      classPrivateFieldGet_default()(this, dash_player).setAutoPlay(false);
    }
  }]);

  return DashMedia;
}(media_native);

/* harmony default export */ const dash = (DashMedia);
// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/objectWithoutProperties.js
var objectWithoutProperties = __webpack_require__(479);
var objectWithoutProperties_default = /*#__PURE__*/__webpack_require__.n(objectWithoutProperties);
;// CONCATENATED MODULE: ./src/media/flv.ts










var _excluded = ["configs"];

function flv_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function flv_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? flv_ownKeys(Object(source), !0).forEach(function (key) { defineProperty_default()(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : flv_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function flv_createSuper(Derived) { var hasNativeReflectConstruct = flv_isNativeReflectConstruct(); return function _createSuperInternal() { var Super = getPrototypeOf_default()(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = getPrototypeOf_default()(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return possibleConstructorReturn_default()(this, result); }; }

function flv_isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function flv_classPrivateFieldInitSpec(obj, privateMap, value) { flv_checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function flv_checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }






var flv_player = new WeakMap();

var flv_events = new WeakMap();

var flv_options = new WeakMap();

var FlvMedia = function (_Native) {
  inherits_default()(FlvMedia, _Native);

  var _super = flv_createSuper(FlvMedia);

  function FlvMedia(element, mediaSource, options) {
    var _this;

    classCallCheck_default()(this, FlvMedia);

    _this = _super.call(this, element, mediaSource);

    flv_classPrivateFieldInitSpec(assertThisInitialized_default()(_this), flv_player, {
      writable: true,
      value: void 0
    });

    flv_classPrivateFieldInitSpec(assertThisInitialized_default()(_this), flv_events, {
      writable: true,
      value: {}
    });

    flv_classPrivateFieldInitSpec(assertThisInitialized_default()(_this), flv_options, {
      writable: true,
      value: {}
    });

    classPrivateFieldSet_default()(assertThisInitialized_default()(_this), flv_options, options);

    _this.element = element;
    _this.media = mediaSource;
    _this._create = _this._create.bind(assertThisInitialized_default()(_this));
    _this._assign = _this._assign.bind(assertThisInitialized_default()(_this));
    _this.promise = typeof flvjs === 'undefined' ? loadScript('https://cdn.jsdelivr.net/npm/flv.js@latest/dist/flv.min.js') : new Promise(function (resolve) {
      resolve({});
    });

    _this.promise.then(_this._create);

    return _this;
  }

  createClass_default()(FlvMedia, [{
    key: "canPlayType",
    value: function canPlayType(mimeType) {
      return HAS_MSE && (mimeType === 'video/x-flv' || mimeType === 'video/flv');
    }
  }, {
    key: "load",
    value: function load() {
      var _this2 = this;

      classPrivateFieldGet_default()(this, flv_player).unload();

      classPrivateFieldGet_default()(this, flv_player).detachMediaElement();

      classPrivateFieldGet_default()(this, flv_player).attachMediaElement(this.element);

      classPrivateFieldGet_default()(this, flv_player).load();

      var e = addEvent('loadedmetadata');
      this.element.dispatchEvent(e);

      if (!classPrivateFieldGet_default()(this, flv_events)) {
        classPrivateFieldSet_default()(this, flv_events, flvjs.Events);

        Object.keys(classPrivateFieldGet_default()(this, flv_events)).forEach(function (event) {
          classPrivateFieldGet_default()(_this2, flv_player).on(classPrivateFieldGet_default()(_this2, flv_events)[event], function () {
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            return _this2._assign(classPrivateFieldGet_default()(_this2, flv_events)[event], args);
          });
        });
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      classPrivateFieldGet_default()(this, flv_player).destroy();

      classPrivateFieldSet_default()(this, flv_player, null);
    }
  }, {
    key: "src",
    set: function set(media) {
      if (isFlvSource(media)) {
        this.destroy();

        this._create();
      }
    }
  }, {
    key: "levels",
    get: function get() {
      var _this3 = this;

      var levels = [];

      if (classPrivateFieldGet_default()(this, flv_player) && classPrivateFieldGet_default()(this, flv_player).levels && classPrivateFieldGet_default()(this, flv_player).levels.length) {
        Object.keys(classPrivateFieldGet_default()(this, flv_player).levels).forEach(function (item) {
          var _classPrivateFieldGet2 = classPrivateFieldGet_default()(_this3, flv_player).levels[item],
              height = _classPrivateFieldGet2.height,
              name = _classPrivateFieldGet2.name;

          var level = {
            height: height,
            id: item,
            label: name || null
          };
          levels.push(level);
        });
      }

      return levels;
    }
  }, {
    key: "level",
    get: function get() {
      return classPrivateFieldGet_default()(this, flv_player) ? classPrivateFieldGet_default()(this, flv_player).currentLevel : '-1';
    },
    set: function set(level) {
      classPrivateFieldGet_default()(this, flv_player).currentLevel = level;
    }
  }, {
    key: "_create",
    value: function _create() {
      var _this4 = this;

      var _ref = classPrivateFieldGet_default()(this, flv_options) || {},
          configs = _ref.configs,
          rest = objectWithoutProperties_default()(_ref, _excluded);

      flvjs.LoggingControl.enableDebug = (rest === null || rest === void 0 ? void 0 : rest.debug) || false;
      flvjs.LoggingControl.enableVerbose = (rest === null || rest === void 0 ? void 0 : rest.debug) || false;

      var options = flv_objectSpread(flv_objectSpread({}, rest), {}, {
        type: 'flv',
        url: this.media.src
      });

      classPrivateFieldSet_default()(this, flv_player, flvjs.createPlayer(options, configs || {}));

      this.instance = classPrivateFieldGet_default()(this, flv_player);

      if (!classPrivateFieldGet_default()(this, flv_events)) {
        classPrivateFieldSet_default()(this, flv_events, flvjs.Events);

        Object.keys(classPrivateFieldGet_default()(this, flv_events)).forEach(function (event) {
          classPrivateFieldGet_default()(_this4, flv_player).on(classPrivateFieldGet_default()(_this4, flv_events)[event], function () {
            for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
              args[_key2] = arguments[_key2];
            }

            return _this4._assign(classPrivateFieldGet_default()(_this4, flv_events)[event], args);
          });
        });
      }
    }
  }, {
    key: "_assign",
    value: function _assign(event, data) {
      if (event === 'error') {
        var errorDetails = {
          detail: {
            data: data,
            message: "".concat(data[0], ": ").concat(data[1], " ").concat(data[2].msg),
            type: 'FLV'
          }
        };
        var errorEvent = addEvent('playererror', errorDetails);
        this.element.dispatchEvent(errorEvent);
      } else {
        var e = addEvent(event, {
          detail: {
            data: data
          }
        });
        this.element.dispatchEvent(e);
      }
    }
  }]);

  return FlvMedia;
}(media_native);

/* harmony default export */ const flv = (FlvMedia);
;// CONCATENATED MODULE: ./src/media/hls.ts









function hls_createSuper(Derived) { var hasNativeReflectConstruct = hls_isNativeReflectConstruct(); return function _createSuperInternal() { var Super = getPrototypeOf_default()(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = getPrototypeOf_default()(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return possibleConstructorReturn_default()(this, result); }; }

function hls_isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function hls_classPrivateFieldInitSpec(obj, privateMap, value) { hls_checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function hls_checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }






var hls_player = new WeakMap();

var hls_events = new WeakMap();

var _recoverDecodingErrorDate = new WeakMap();

var _recoverSwapAudioCodecDate = new WeakMap();

var hls_options = new WeakMap();

var _autoplay = new WeakMap();

var HlsMedia = function (_Native) {
  inherits_default()(HlsMedia, _Native);

  var _super = hls_createSuper(HlsMedia);

  function HlsMedia(element, mediaSource, autoplay, options) {
    var _this;

    classCallCheck_default()(this, HlsMedia);

    _this = _super.call(this, element, mediaSource);

    hls_classPrivateFieldInitSpec(assertThisInitialized_default()(_this), hls_player, {
      writable: true,
      value: void 0
    });

    hls_classPrivateFieldInitSpec(assertThisInitialized_default()(_this), hls_events, {
      writable: true,
      value: {}
    });

    hls_classPrivateFieldInitSpec(assertThisInitialized_default()(_this), _recoverDecodingErrorDate, {
      writable: true,
      value: 0
    });

    hls_classPrivateFieldInitSpec(assertThisInitialized_default()(_this), _recoverSwapAudioCodecDate, {
      writable: true,
      value: 0
    });

    hls_classPrivateFieldInitSpec(assertThisInitialized_default()(_this), hls_options, {
      writable: true,
      value: void 0
    });

    hls_classPrivateFieldInitSpec(assertThisInitialized_default()(_this), _autoplay, {
      writable: true,
      value: void 0
    });

    classPrivateFieldSet_default()(assertThisInitialized_default()(_this), hls_options, options || {});

    _this.element = element;
    _this.media = mediaSource;

    classPrivateFieldSet_default()(assertThisInitialized_default()(_this), _autoplay, autoplay);

    _this._create = _this._create.bind(assertThisInitialized_default()(_this));
    _this._play = _this._play.bind(assertThisInitialized_default()(_this));
    _this._pause = _this._pause.bind(assertThisInitialized_default()(_this));
    _this._assign = _this._assign.bind(assertThisInitialized_default()(_this));
    _this.promise = typeof Hls === 'undefined' ? loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js') : new Promise(function (resolve) {
      resolve({});
    });

    _this.promise.then(_this._create);

    return _this;
  }

  createClass_default()(HlsMedia, [{
    key: "canPlayType",
    value: function canPlayType(mimeType) {
      return SUPPORTS_HLS() && mimeType === 'application/x-mpegURL';
    }
  }, {
    key: "load",
    value: function load() {
      var _this2 = this;

      if (classPrivateFieldGet_default()(this, hls_player)) {
        classPrivateFieldGet_default()(this, hls_player).detachMedia();

        classPrivateFieldGet_default()(this, hls_player).loadSource(this.media.src);

        classPrivateFieldGet_default()(this, hls_player).attachMedia(this.element);
      }

      var e = addEvent('loadedmetadata');
      this.element.dispatchEvent(e);

      if (!classPrivateFieldGet_default()(this, hls_events)) {
        classPrivateFieldSet_default()(this, hls_events, Hls.Events);

        Object.keys(classPrivateFieldGet_default()(this, hls_events)).forEach(function (event) {
          classPrivateFieldGet_default()(_this2, hls_player).on(classPrivateFieldGet_default()(_this2, hls_events)[event], function () {
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            return _this2._assign(classPrivateFieldGet_default()(_this2, hls_events)[event], args);
          });
        });
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this3 = this;

      if (classPrivateFieldGet_default()(this, hls_player)) {
        classPrivateFieldGet_default()(this, hls_player).stopLoad();
      }

      if (classPrivateFieldGet_default()(this, hls_events)) {
        Object.keys(classPrivateFieldGet_default()(this, hls_events)).forEach(function (event) {
          classPrivateFieldGet_default()(_this3, hls_player).off(classPrivateFieldGet_default()(_this3, hls_events)[event], function () {
            for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
              args[_key2] = arguments[_key2];
            }

            return _this3._assign(classPrivateFieldGet_default()(_this3, hls_events)[event], args);
          });
        });
      }

      this.element.removeEventListener('play', this._play);
      this.element.removeEventListener('pause', this._pause);

      if (classPrivateFieldGet_default()(this, hls_player)) {
        classPrivateFieldGet_default()(this, hls_player).destroy();

        classPrivateFieldSet_default()(this, hls_player, null);
      }
    }
  }, {
    key: "src",
    set: function set(media) {
      var _this4 = this;

      if (isHlsSource(media)) {
        this.destroy();

        classPrivateFieldSet_default()(this, hls_player, new Hls(classPrivateFieldGet_default()(this, hls_options)));

        classPrivateFieldGet_default()(this, hls_player).loadSource(media.src);

        classPrivateFieldGet_default()(this, hls_player).attachMedia(this.element);

        classPrivateFieldSet_default()(this, hls_events, Hls.Events);

        Object.keys(classPrivateFieldGet_default()(this, hls_events)).forEach(function (event) {
          classPrivateFieldGet_default()(_this4, hls_player).on(classPrivateFieldGet_default()(_this4, hls_events)[event], function () {
            for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
              args[_key3] = arguments[_key3];
            }

            return _this4._assign(classPrivateFieldGet_default()(_this4, hls_events)[event], args);
          });
        });
      }
    }
  }, {
    key: "levels",
    get: function get() {
      var _this5 = this;

      var levels = [];

      if (classPrivateFieldGet_default()(this, hls_player) && classPrivateFieldGet_default()(this, hls_player).levels && classPrivateFieldGet_default()(this, hls_player).levels.length) {
        Object.keys(classPrivateFieldGet_default()(this, hls_player).levels).forEach(function (item) {
          var _classPrivateFieldGet2 = classPrivateFieldGet_default()(_this5, hls_player).levels[item],
              height = _classPrivateFieldGet2.height,
              name = _classPrivateFieldGet2.name;

          var level = {
            height: height,
            id: item,
            label: name || null
          };
          levels.push(level);
        });
      }

      return levels;
    }
  }, {
    key: "level",
    get: function get() {
      return classPrivateFieldGet_default()(this, hls_player) ? classPrivateFieldGet_default()(this, hls_player).currentLevel : '-1';
    },
    set: function set(level) {
      classPrivateFieldGet_default()(this, hls_player).currentLevel = level;
    }
  }, {
    key: "_create",
    value: function _create() {
      var _this6 = this;

      var autoplay = !!(this.element.preload === 'auto' || classPrivateFieldGet_default()(this, _autoplay));
      classPrivateFieldGet_default()(this, hls_options).autoStartLoad = autoplay;

      classPrivateFieldSet_default()(this, hls_player, new Hls(classPrivateFieldGet_default()(this, hls_options)));

      this.instance = classPrivateFieldGet_default()(this, hls_player);

      classPrivateFieldSet_default()(this, hls_events, Hls.Events);

      Object.keys(classPrivateFieldGet_default()(this, hls_events)).forEach(function (event) {
        classPrivateFieldGet_default()(_this6, hls_player).on(classPrivateFieldGet_default()(_this6, hls_events)[event], function () {
          for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
          }

          return _this6._assign(classPrivateFieldGet_default()(_this6, hls_events)[event], args);
        });
      });

      if (!autoplay) {
        this.element.addEventListener('play', this._play, EVENT_OPTIONS);
        this.element.addEventListener('pause', this._pause, EVENT_OPTIONS);
      }
    }
  }, {
    key: "_assign",
    value: function _assign(event, data) {
      if (event === 'hlsError') {
        var errorDetails = {
          detail: {
            data: data,
            message: data[1].details,
            type: 'HLS'
          }
        };
        var errorEvent = addEvent('playererror', errorDetails);
        this.element.dispatchEvent(errorEvent);
        var type = data[1].type;
        var fatal = data[1].fatal;
        var details = data[1];

        if (fatal) {
          switch (type) {
            case 'mediaError':
              var now = new Date().getTime();

              if (!classPrivateFieldGet_default()(this, _recoverDecodingErrorDate) || now - classPrivateFieldGet_default()(this, _recoverDecodingErrorDate) > 3000) {
                classPrivateFieldSet_default()(this, _recoverDecodingErrorDate, new Date().getTime());

                classPrivateFieldGet_default()(this, hls_player).recoverMediaError();
              } else if (!classPrivateFieldGet_default()(this, _recoverSwapAudioCodecDate) || now - classPrivateFieldGet_default()(this, _recoverSwapAudioCodecDate) > 3000) {
                classPrivateFieldSet_default()(this, _recoverSwapAudioCodecDate, new Date().getTime());

                console.warn('Attempting to swap Audio Codec and recover from media error');

                classPrivateFieldGet_default()(this, hls_player).swapAudioCodec();

                classPrivateFieldGet_default()(this, hls_player).recoverMediaError();
              } else {
                var msg = 'Cannot recover, last media error recovery failed';
                console.error(msg);
                var mediaEvent = addEvent(type, {
                  detail: {
                    data: details
                  }
                });
                this.element.dispatchEvent(mediaEvent);
              }

              break;

            case 'networkError':
              var message = 'Network error';
              console.error(message);
              var networkEvent = addEvent(type, {
                detail: {
                  data: details
                }
              });
              this.element.dispatchEvent(networkEvent);
              break;

            default:
              classPrivateFieldGet_default()(this, hls_player).destroy();

              var fatalEvent = addEvent(type, {
                detail: {
                  data: details
                }
              });
              this.element.dispatchEvent(fatalEvent);
              break;
          }
        } else {
          var err = addEvent(type, {
            detail: {
              data: details
            }
          });
          this.element.dispatchEvent(err);
        }
      } else {
        var _details = data[1];

        if (event === 'hlsLevelLoaded' && _details.live === true) {
          this.element.setAttribute('op-live__enabled', 'true');
          var timeEvent = addEvent('timeupdate');
          this.element.dispatchEvent(timeEvent);
        } else if (event === 'hlsLevelUpdated' && _details.live === true && _details.totalduration > DVR_THRESHOLD) {
          this.element.setAttribute('op-dvr__enabled', 'true');

          var _timeEvent = addEvent('timeupdate');

          this.element.dispatchEvent(_timeEvent);
        } else if (event === 'hlsFragParsingMetadata') {
          var metaEvent = addEvent('metadataready', {
            detail: {
              data: data[1]
            }
          });
          this.element.dispatchEvent(metaEvent);
        }

        var e = addEvent(event, {
          detail: {
            data: data[1]
          }
        });
        this.element.dispatchEvent(e);
      }
    }
  }, {
    key: "_play",
    value: function _play() {
      if (classPrivateFieldGet_default()(this, hls_player)) {
        classPrivateFieldGet_default()(this, hls_player).startLoad();
      }
    }
  }, {
    key: "_pause",
    value: function _pause() {
      if (classPrivateFieldGet_default()(this, hls_player)) {
        classPrivateFieldGet_default()(this, hls_player).stopLoad();
      }
    }
  }]);

  return HlsMedia;
}(media_native);

/* harmony default export */ const hls = (HlsMedia);
;// CONCATENATED MODULE: ./src/media/html5.ts










function html5_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function html5_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? html5_ownKeys(Object(source), !0).forEach(function (key) { defineProperty_default()(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : html5_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function html5_createSuper(Derived) { var hasNativeReflectConstruct = html5_isNativeReflectConstruct(); return function _createSuperInternal() { var Super = getPrototypeOf_default()(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = getPrototypeOf_default()(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return possibleConstructorReturn_default()(this, result); }; }

function html5_isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function html5_classPrivateFieldInitSpec(obj, privateMap, value) { html5_checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function html5_checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }






var _currentLevel = new WeakMap();

var _levelList = new WeakMap();

var _isStreaming = new WeakMap();

var _retryCount = new WeakMap();

var _started = new WeakMap();

var html5_timer = new WeakMap();

var HTML5Media = function (_Native) {
  inherits_default()(HTML5Media, _Native);

  var _super = html5_createSuper(HTML5Media);

  function HTML5Media(element, mediaFile) {
    var _this;

    classCallCheck_default()(this, HTML5Media);

    _this = _super.call(this, element, mediaFile);

    html5_classPrivateFieldInitSpec(assertThisInitialized_default()(_this), _currentLevel, {
      writable: true,
      value: void 0
    });

    html5_classPrivateFieldInitSpec(assertThisInitialized_default()(_this), _levelList, {
      writable: true,
      value: []
    });

    html5_classPrivateFieldInitSpec(assertThisInitialized_default()(_this), _isStreaming, {
      writable: true,
      value: false
    });

    html5_classPrivateFieldInitSpec(assertThisInitialized_default()(_this), _retryCount, {
      writable: true,
      value: 0
    });

    html5_classPrivateFieldInitSpec(assertThisInitialized_default()(_this), _started, {
      writable: true,
      value: false
    });

    html5_classPrivateFieldInitSpec(assertThisInitialized_default()(_this), html5_timer, {
      writable: true,
      value: void 0
    });

    if (!isAudio(element) && !isVideo(element)) {
      throw new TypeError('Native method only supports video/audio tags');
    }

    _this._clearTimeout = _this._clearTimeout.bind(assertThisInitialized_default()(_this));
    _this._setTimeout = _this._setTimeout.bind(assertThisInitialized_default()(_this));
    _this._dispatchError = _this._dispatchError.bind(assertThisInitialized_default()(_this));
    _this._isDvrEnabled = _this._isDvrEnabled.bind(assertThisInitialized_default()(_this));
    _this._readMediadataInfo = _this._readMediadataInfo.bind(assertThisInitialized_default()(_this));

    classPrivateFieldSet_default()(assertThisInitialized_default()(_this), _isStreaming, isHlsSource(mediaFile));

    _this.element.addEventListener('playing', _this._clearTimeout, EVENT_OPTIONS);

    _this.element.addEventListener('stalled', _this._setTimeout, EVENT_OPTIONS);

    _this.element.addEventListener('error', _this._dispatchError, EVENT_OPTIONS);

    _this.element.addEventListener('loadeddata', _this._isDvrEnabled, EVENT_OPTIONS);

    _this.element.textTracks.addEventListener('addtrack', _this._readMediadataInfo, EVENT_OPTIONS);

    return _this;
  }

  createClass_default()(HTML5Media, [{
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
      this.element.removeEventListener('playing', this._clearTimeout);
      this.element.removeEventListener('stalled', this._setTimeout);
      this.element.removeEventListener('error', this._dispatchError);
      this.element.removeEventListener('loadeddata', this._isDvrEnabled);
      this.element.textTracks.removeEventListener('addtrack', this._readMediadataInfo);
    }
  }, {
    key: "levels",
    get: function get() {
      if (!classPrivateFieldGet_default()(this, _levelList).length) {
        var levels = this.element.querySelectorAll('source[title]');

        for (var i = 0, total = levels.length; i < total; ++i) {
          var level = {
            height: 0,
            id: "".concat(i),
            label: levels[i].getAttribute('title') || ''
          };

          classPrivateFieldGet_default()(this, _levelList).push(level);
        }
      }

      return classPrivateFieldGet_default()(this, _levelList);
    }
  }, {
    key: "level",
    get: function get() {
      var _classPrivateFieldGet2;

      return ((_classPrivateFieldGet2 = classPrivateFieldGet_default()(this, _currentLevel)) === null || _classPrivateFieldGet2 === void 0 ? void 0 : _classPrivateFieldGet2.id) || '-1';
    },
    set: function set(level) {
      var idx = classPrivateFieldGet_default()(this, _levelList).findIndex(function (item) {
        return item.id === level;
      });

      if (idx > -1) {
        classPrivateFieldSet_default()(this, _currentLevel, this.levels[idx]);

        var levels = this.element.querySelectorAll('source[title]');

        for (var i = 0, total = levels.length; i < total; ++i) {
          var source = levels[i].getAttribute('src');

          if (source && parseInt(classPrivateFieldGet_default()(this, _currentLevel).id, 10) === i) {
            this.element.src = source;
          }
        }
      }
    }
  }, {
    key: "src",
    set: function set(media) {
      this.element.src = media.src;
    }
  }, {
    key: "_isDvrEnabled",
    value: function _isDvrEnabled() {
      var time = this.element.seekable.end(this.element.seekable.length - 1) - this.element.seekable.start(0);

      if (classPrivateFieldGet_default()(this, _isStreaming) && time > DVR_THRESHOLD && !this.element.getAttribute('op-dvr__enabled')) {
        this.element.setAttribute('op-dvr__enabled', 'true');
        var timeEvent = addEvent('timeupdate');
        this.element.dispatchEvent(timeEvent);
      }
    }
  }, {
    key: "_readMediadataInfo",
    value: function _readMediadataInfo(e) {
      var _target$track,
          _this2 = this;

      var target = e;

      if ((target === null || target === void 0 ? void 0 : (_target$track = target.track) === null || _target$track === void 0 ? void 0 : _target$track.kind) === 'metadata') {
        target.track.mode = 'hidden';
        target.track.addEventListener('cuechange', function (event) {
          var track = event.target;
          var cue = track.activeCues ? track.activeCues[0] : null;

          if (cue) {
            var metaDataEvent = addEvent('metadataready', {
              detail: cue
            });

            _this2.element.dispatchEvent(metaDataEvent);
          }
        }, EVENT_OPTIONS);
      }
    }
  }, {
    key: "_setTimeout",
    value: function _setTimeout() {
      var _this3 = this;

      if (!classPrivateFieldGet_default()(this, _started) && window !== undefined) {
        classPrivateFieldSet_default()(this, _started, true);

        classPrivateFieldSet_default()(this, html5_timer, window.setInterval(function () {
          if (classPrivateFieldGet_default()(_this3, _retryCount) >= 30) {
            clearInterval(classPrivateFieldGet_default()(_this3, html5_timer));
            var message = 'Media download failed part-way due to a network error';
            var details = {
              detail: {
                data: {
                  message: message,
                  error: 2
                },
                message: message,
                type: 'HTML5'
              }
            };
            var errorEvent = addEvent('playererror', details);

            _this3.element.dispatchEvent(errorEvent);

            classPrivateFieldSet_default()(_this3, _retryCount, 0);

            classPrivateFieldSet_default()(_this3, _started, false);
          } else {
            var _this$retryCount, _this$retryCount2;

            classPrivateFieldSet_default()(_this3, _retryCount, (_this$retryCount = classPrivateFieldGet_default()(_this3, _retryCount), _this$retryCount2 = _this$retryCount++, _this$retryCount)), _this$retryCount2;
          }
        }, 1000));
      }
    }
  }, {
    key: "_clearTimeout",
    value: function _clearTimeout() {
      if (classPrivateFieldGet_default()(this, html5_timer)) {
        clearInterval(classPrivateFieldGet_default()(this, html5_timer));

        classPrivateFieldSet_default()(this, _retryCount, 0);

        classPrivateFieldSet_default()(this, _started, false);
      }
    }
  }, {
    key: "_dispatchError",
    value: function _dispatchError(e) {
      var defaultMessage;
      var target = e.target;
      var error = target === null || target === void 0 ? void 0 : target.error;

      switch (error === null || error === void 0 ? void 0 : error.code) {
        case error === null || error === void 0 ? void 0 : error.MEDIA_ERR_ABORTED:
          defaultMessage = 'Media playback aborted';
          break;

        case error === null || error === void 0 ? void 0 : error.MEDIA_ERR_NETWORK:
          defaultMessage = 'Media download failed part-way due to a network error';
          break;

        case error === null || error === void 0 ? void 0 : error.MEDIA_ERR_DECODE:
          defaultMessage = "Media playback aborted due to a corruption problem or because the\n                    media used features your browser did not support.";
          break;

        case error === null || error === void 0 ? void 0 : error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          defaultMessage = "Media could not be loaded, either because the server or network failed\n                    or because the format is not supported.";
          break;

        default:
          defaultMessage = 'Unknown error occurred.';
          break;
      }

      var details = {
        detail: {
          data: html5_objectSpread(html5_objectSpread({}, e), {}, {
            message: defaultMessage,
            error: error === null || error === void 0 ? void 0 : error.code
          }),
          message: defaultMessage,
          type: 'HTML5'
        }
      };
      var errorEvent = addEvent('playererror', details);
      this.element.dispatchEvent(errorEvent);
    }
  }]);

  return HTML5Media;
}(media_native);

/* harmony default export */ const html5 = (HTML5Media);
;// CONCATENATED MODULE: ./src/media.ts









function media_classPrivateFieldInitSpec(obj, privateMap, value) { media_checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function media_checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }







var _element = new WeakMap();

var _media = new WeakMap();

var _files = new WeakMap();

var _promisePlay = new WeakMap();

var media_options = new WeakMap();

var media_autoplay = new WeakMap();

var _mediaLoaded = new WeakMap();

var _customMedia = new WeakMap();

var _currentSrc = new WeakMap();

var Media = function () {
  function Media(element, options, autoplay, customMedia) {
    classCallCheck_default()(this, Media);

    media_classPrivateFieldInitSpec(this, _element, {
      writable: true,
      value: void 0
    });

    media_classPrivateFieldInitSpec(this, _media, {
      writable: true,
      value: void 0
    });

    media_classPrivateFieldInitSpec(this, _files, {
      writable: true,
      value: void 0
    });

    media_classPrivateFieldInitSpec(this, _promisePlay, {
      writable: true,
      value: void 0
    });

    media_classPrivateFieldInitSpec(this, media_options, {
      writable: true,
      value: void 0
    });

    media_classPrivateFieldInitSpec(this, media_autoplay, {
      writable: true,
      value: void 0
    });

    media_classPrivateFieldInitSpec(this, _mediaLoaded, {
      writable: true,
      value: false
    });

    media_classPrivateFieldInitSpec(this, _customMedia, {
      writable: true,
      value: {
        media: {},
        optionsKey: {},
        rules: []
      }
    });

    media_classPrivateFieldInitSpec(this, _currentSrc, {
      writable: true,
      value: void 0
    });

    classPrivateFieldSet_default()(this, _element, element);

    classPrivateFieldSet_default()(this, media_options, options);

    classPrivateFieldSet_default()(this, _files, this._getMediaFiles());

    classPrivateFieldSet_default()(this, _customMedia, customMedia);

    classPrivateFieldSet_default()(this, media_autoplay, autoplay);
  }

  createClass_default()(Media, [{
    key: "canPlayType",
    value: function canPlayType(mimeType) {
      return classPrivateFieldGet_default()(this, _media).canPlayType(mimeType);
    }
  }, {
    key: "load",
    value: function () {
      var _load = asyncToGenerator_default()(regenerator_default().mark(function _callee() {
        var _this = this;

        var sameMedia;
        return regenerator_default().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!classPrivateFieldGet_default()(this, _mediaLoaded)) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return");

              case 2:
                classPrivateFieldSet_default()(this, _mediaLoaded, true);

                if (classPrivateFieldGet_default()(this, _files).length) {
                  _context.next = 5;
                  break;
                }

                throw new TypeError('Media not set');

              case 5:
                if (classPrivateFieldGet_default()(this, _media) && typeof classPrivateFieldGet_default()(this, _media).destroy === 'function') {
                  sameMedia = classPrivateFieldGet_default()(this, _files).length === 1 && classPrivateFieldGet_default()(this, _files)[0].src === classPrivateFieldGet_default()(this, _media).media.src;

                  if (!sameMedia) {
                    classPrivateFieldGet_default()(this, _media).destroy();
                  }
                }

                classPrivateFieldGet_default()(this, _files).some(function (media) {
                  try {
                    classPrivateFieldSet_default()(_this, _media, _this._invoke(media));
                  } catch (e) {
                    classPrivateFieldSet_default()(_this, _media, new html5(classPrivateFieldGet_default()(_this, _element), media));
                  }

                  return classPrivateFieldGet_default()(_this, _media).canPlayType(media.type);
                });

                _context.prev = 7;

                if (!(classPrivateFieldGet_default()(this, _media) === null)) {
                  _context.next = 10;
                  break;
                }

                throw new TypeError('Media cannot be played with any valid media type');

              case 10:
                _context.next = 12;
                return classPrivateFieldGet_default()(this, _media).promise;

              case 12:
                classPrivateFieldGet_default()(this, _media).load();

                _context.next = 19;
                break;

              case 15:
                _context.prev = 15;
                _context.t0 = _context["catch"](7);

                if (classPrivateFieldGet_default()(this, _media)) {
                  classPrivateFieldGet_default()(this, _media).destroy();
                }

                throw _context.t0;

              case 19:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[7, 15]]);
      }));

      function load() {
        return _load.apply(this, arguments);
      }

      return load;
    }()
  }, {
    key: "play",
    value: function () {
      var _play = asyncToGenerator_default()(regenerator_default().mark(function _callee2() {
        return regenerator_default().wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (classPrivateFieldGet_default()(this, _mediaLoaded)) {
                  _context2.next = 7;
                  break;
                }

                classPrivateFieldSet_default()(this, _mediaLoaded, true);

                _context2.next = 4;
                return this.load();

              case 4:
                classPrivateFieldSet_default()(this, _mediaLoaded, false);

                _context2.next = 9;
                break;

              case 7:
                _context2.next = 9;
                return classPrivateFieldGet_default()(this, _media).promise;

              case 9:
                classPrivateFieldSet_default()(this, _promisePlay, classPrivateFieldGet_default()(this, _media).play());

                return _context2.abrupt("return", classPrivateFieldGet_default()(this, _promisePlay));

              case 11:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function play() {
        return _play.apply(this, arguments);
      }

      return play;
    }()
  }, {
    key: "pause",
    value: function () {
      var _pause = asyncToGenerator_default()(regenerator_default().mark(function _callee3() {
        return regenerator_default().wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!(classPrivateFieldGet_default()(this, _promisePlay) !== undefined)) {
                  _context3.next = 3;
                  break;
                }

                _context3.next = 3;
                return classPrivateFieldGet_default()(this, _promisePlay);

              case 3:
                classPrivateFieldGet_default()(this, _media).pause();

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function pause() {
        return _pause.apply(this, arguments);
      }

      return pause;
    }()
  }, {
    key: "destroy",
    value: function destroy() {
      if (classPrivateFieldGet_default()(this, _media)) {
        classPrivateFieldGet_default()(this, _media).destroy();
      }
    }
  }, {
    key: "src",
    get: function get() {
      return classPrivateFieldGet_default()(this, _files);
    },
    set: function set(media) {
      if (typeof media === 'string') {
        classPrivateFieldGet_default()(this, _files).push({
          src: media,
          type: predictMimeType(media, classPrivateFieldGet_default()(this, _element))
        });
      } else if (Array.isArray(media)) {
        classPrivateFieldSet_default()(this, _files, media);
      } else if (typeof_default()(media) === 'object') {
        classPrivateFieldGet_default()(this, _files).push(media);
      }

      classPrivateFieldSet_default()(this, _files, classPrivateFieldGet_default()(this, _files).filter(function (file) {
        return file.src;
      }));

      if (classPrivateFieldGet_default()(this, _files).length > 0) {
        var _classPrivateFieldGet2 = classPrivateFieldGet_default()(this, _files),
            _classPrivateFieldGet3 = slicedToArray_default()(_classPrivateFieldGet2, 1),
            file = _classPrivateFieldGet3[0];

        if (classPrivateFieldGet_default()(this, _element).src) {
          classPrivateFieldGet_default()(this, _element).setAttribute('data-op-file', classPrivateFieldGet_default()(this, _files)[0].src);
        }

        classPrivateFieldGet_default()(this, _element).src = file.src;

        classPrivateFieldSet_default()(this, _currentSrc, file);

        if (classPrivateFieldGet_default()(this, _media)) {
          classPrivateFieldGet_default()(this, _media).src = file;
        }
      } else {
        classPrivateFieldGet_default()(this, _element).src = '';
      }
    }
  }, {
    key: "current",
    get: function get() {
      return classPrivateFieldGet_default()(this, _currentSrc);
    }
  }, {
    key: "mediaFiles",
    get: function get() {
      return classPrivateFieldGet_default()(this, _files);
    },
    set: function set(sources) {
      classPrivateFieldSet_default()(this, _files, sources);
    }
  }, {
    key: "volume",
    get: function get() {
      return classPrivateFieldGet_default()(this, _media) ? classPrivateFieldGet_default()(this, _media).volume : classPrivateFieldGet_default()(this, _element).volume;
    },
    set: function set(value) {
      if (classPrivateFieldGet_default()(this, _media)) {
        classPrivateFieldGet_default()(this, _media).volume = value;
      }
    }
  }, {
    key: "muted",
    get: function get() {
      return classPrivateFieldGet_default()(this, _media) ? classPrivateFieldGet_default()(this, _media).muted : classPrivateFieldGet_default()(this, _element).muted;
    },
    set: function set(value) {
      if (classPrivateFieldGet_default()(this, _media)) {
        classPrivateFieldGet_default()(this, _media).muted = value;
      }
    }
  }, {
    key: "playbackRate",
    get: function get() {
      return classPrivateFieldGet_default()(this, _media) ? classPrivateFieldGet_default()(this, _media).playbackRate : classPrivateFieldGet_default()(this, _element).playbackRate;
    },
    set: function set(value) {
      if (classPrivateFieldGet_default()(this, _media)) {
        classPrivateFieldGet_default()(this, _media).playbackRate = value;
      }
    }
  }, {
    key: "defaultPlaybackRate",
    get: function get() {
      return classPrivateFieldGet_default()(this, _media) ? classPrivateFieldGet_default()(this, _media).defaultPlaybackRate : classPrivateFieldGet_default()(this, _element).defaultPlaybackRate;
    },
    set: function set(value) {
      if (classPrivateFieldGet_default()(this, _media)) {
        classPrivateFieldGet_default()(this, _media).defaultPlaybackRate = value;
      }
    }
  }, {
    key: "currentTime",
    get: function get() {
      return classPrivateFieldGet_default()(this, _media) ? classPrivateFieldGet_default()(this, _media).currentTime : classPrivateFieldGet_default()(this, _element).currentTime;
    },
    set: function set(value) {
      if (classPrivateFieldGet_default()(this, _media)) {
        classPrivateFieldGet_default()(this, _media).currentTime = value;
      }
    }
  }, {
    key: "duration",
    get: function get() {
      var duration = classPrivateFieldGet_default()(this, _media) ? classPrivateFieldGet_default()(this, _media).duration : classPrivateFieldGet_default()(this, _element).duration;

      if (duration === Infinity && classPrivateFieldGet_default()(this, _element).seekable && classPrivateFieldGet_default()(this, _element).seekable.length) {
        return classPrivateFieldGet_default()(this, _element).seekable.end(0);
      }

      return duration;
    }
  }, {
    key: "paused",
    get: function get() {
      return classPrivateFieldGet_default()(this, _media) ? classPrivateFieldGet_default()(this, _media).paused : classPrivateFieldGet_default()(this, _element).paused;
    }
  }, {
    key: "ended",
    get: function get() {
      return classPrivateFieldGet_default()(this, _media) ? classPrivateFieldGet_default()(this, _media).ended : classPrivateFieldGet_default()(this, _element).ended;
    }
  }, {
    key: "loaded",
    get: function get() {
      return classPrivateFieldGet_default()(this, _mediaLoaded);
    },
    set: function set(loaded) {
      classPrivateFieldSet_default()(this, _mediaLoaded, loaded);
    }
  }, {
    key: "level",
    get: function get() {
      return classPrivateFieldGet_default()(this, _media) ? classPrivateFieldGet_default()(this, _media).level : -1;
    },
    set: function set(value) {
      if (classPrivateFieldGet_default()(this, _media)) {
        classPrivateFieldGet_default()(this, _media).level = value;
      }
    }
  }, {
    key: "levels",
    get: function get() {
      return classPrivateFieldGet_default()(this, _media) ? classPrivateFieldGet_default()(this, _media).levels : [];
    }
  }, {
    key: "instance",
    get: function get() {
      return classPrivateFieldGet_default()(this, _media) ? classPrivateFieldGet_default()(this, _media).instance : null;
    }
  }, {
    key: "_getMediaFiles",
    value: function _getMediaFiles() {
      var mediaFiles = [];

      var sourceTags = classPrivateFieldGet_default()(this, _element).querySelectorAll('source');

      var nodeSource = classPrivateFieldGet_default()(this, _element).src;

      if (nodeSource) {
        mediaFiles.push({
          src: nodeSource,
          type: classPrivateFieldGet_default()(this, _element).getAttribute('type') || predictMimeType(nodeSource, classPrivateFieldGet_default()(this, _element))
        });
      }

      for (var i = 0, total = sourceTags.length; i < total; i++) {
        var item = sourceTags[i];
        var src = item.src;
        mediaFiles.push({
          src: src,
          type: item.getAttribute('type') || predictMimeType(src, classPrivateFieldGet_default()(this, _element))
        });

        if (i === 0) {
          var file = mediaFiles[0];

          classPrivateFieldSet_default()(this, _currentSrc, file);
        }
      }

      if (!mediaFiles.length) {
        mediaFiles.push({
          src: '',
          type: predictMimeType('', classPrivateFieldGet_default()(this, _element))
        });
      }

      return mediaFiles;
    }
  }, {
    key: "_invoke",
    value: function _invoke(media) {
      var _this2 = this;

      var playHLSNatively = classPrivateFieldGet_default()(this, _element).canPlayType('application/vnd.apple.mpegurl') || classPrivateFieldGet_default()(this, _element).canPlayType('application/x-mpegURL');

      classPrivateFieldSet_default()(this, _currentSrc, media);

      var _ref = classPrivateFieldGet_default()(this, media_options).controls || {},
          layers = _ref.layers;

      var activeLevels = false;

      if (layers) {
        Object.keys(layers).forEach(function (layer) {
          var current = layers ? layers[layer] : null;

          if (current && current.indexOf('levels') > -1) {
            activeLevels = true;
          }
        });
      }

      if (Object.keys(classPrivateFieldGet_default()(this, _customMedia).media).length) {
        var customRef;

        classPrivateFieldGet_default()(this, _customMedia).rules.forEach(function (rule) {
          var type = rule(media.src);

          if (type) {
            var customMedia = classPrivateFieldGet_default()(_this2, _customMedia).media[type];

            var customOptions = classPrivateFieldGet_default()(_this2, media_options)[classPrivateFieldGet_default()(_this2, _customMedia).optionsKey[type]] || undefined;
            customRef = customMedia(classPrivateFieldGet_default()(_this2, _element), media, classPrivateFieldGet_default()(_this2, media_autoplay), customOptions);
          }
        });

        if (customRef) {
          customRef.create();
          return customRef;
        }

        return new html5(classPrivateFieldGet_default()(this, _element), media);
      }

      if (isHlsSource(media)) {
        var _classPrivateFieldGet4;

        if (playHLSNatively && classPrivateFieldGet_default()(this, media_options).forceNative && !activeLevels) {
          return new html5(classPrivateFieldGet_default()(this, _element), media);
        }

        var hlsOptions = ((_classPrivateFieldGet4 = classPrivateFieldGet_default()(this, media_options)) === null || _classPrivateFieldGet4 === void 0 ? void 0 : _classPrivateFieldGet4.hls) || undefined;
        return new hls(classPrivateFieldGet_default()(this, _element), media, classPrivateFieldGet_default()(this, media_autoplay), hlsOptions);
      }

      if (isDashSource(media)) {
        var _classPrivateFieldGet5;

        var dashOptions = ((_classPrivateFieldGet5 = classPrivateFieldGet_default()(this, media_options)) === null || _classPrivateFieldGet5 === void 0 ? void 0 : _classPrivateFieldGet5.dash) || undefined;
        return new dash(classPrivateFieldGet_default()(this, _element), media, dashOptions);
      }

      if (isFlvSource(media)) {
        var _classPrivateFieldGet6;

        var flvOptions = ((_classPrivateFieldGet6 = classPrivateFieldGet_default()(this, media_options)) === null || _classPrivateFieldGet6 === void 0 ? void 0 : _classPrivateFieldGet6.flv) || {
          debug: false,
          type: 'flv',
          url: media.src
        };
        return new flv(classPrivateFieldGet_default()(this, _element), media, flvOptions);
      }

      return new html5(classPrivateFieldGet_default()(this, _element), media);
    }
  }]);

  return Media;
}();

/* harmony default export */ const src_media = (Media);
;// CONCATENATED MODULE: ./src/media/ads.ts








function ads_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function ads_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ads_ownKeys(Object(source), !0).forEach(function (key) { defineProperty_default()(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ads_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function ads_classPrivateFieldInitSpec(obj, privateMap, value) { ads_checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function ads_checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }




var _ended = new WeakMap();

var _done = new WeakMap();

var _active = new WeakMap();

var ads_started = new WeakMap();

var _intervalTimer = new WeakMap();

var ads_volume = new WeakMap();

var _muted = new WeakMap();

var ads_duration = new WeakMap();

var ads_currentTime = new WeakMap();

var _manager = new WeakMap();

var ads_player = new WeakMap();

var ads_media = new WeakMap();

var ads_element = new WeakMap();

var ads_events = new WeakMap();

var _ads = new WeakMap();

var _promise = new WeakMap();

var _loader = new WeakMap();

var ads_container = new WeakMap();

var _customClickContainer = new WeakMap();

var _skipElement = new WeakMap();

var _displayContainer = new WeakMap();

var _request = new WeakMap();

var _autostart = new WeakMap();

var _autostartMuted = new WeakMap();

var _playTriggered = new WeakMap();

var ads_options = new WeakMap();

var _currentIndex = new WeakMap();

var _originalVolume = new WeakMap();

var _preloadContent = new WeakMap();

var _lastTimePaused = new WeakMap();

var _mediaSources = new WeakMap();

var _mediaStarted = new WeakMap();

var _adEvent = new WeakMap();

var Ads = function () {
  function Ads(player, ads, autostart, autostartMuted, options) {
    var _classPrivateFieldGet2,
        _classPrivateFieldGet3,
        _classPrivateFieldGet4,
        _classPrivateFieldGet5,
        _this = this;

    classCallCheck_default()(this, Ads);

    defineProperty_default()(this, "loadPromise", void 0);

    defineProperty_default()(this, "loadedAd", false);

    ads_classPrivateFieldInitSpec(this, _ended, {
      writable: true,
      value: false
    });

    ads_classPrivateFieldInitSpec(this, _done, {
      writable: true,
      value: false
    });

    ads_classPrivateFieldInitSpec(this, _active, {
      writable: true,
      value: false
    });

    ads_classPrivateFieldInitSpec(this, ads_started, {
      writable: true,
      value: false
    });

    ads_classPrivateFieldInitSpec(this, _intervalTimer, {
      writable: true,
      value: 0
    });

    ads_classPrivateFieldInitSpec(this, ads_volume, {
      writable: true,
      value: void 0
    });

    ads_classPrivateFieldInitSpec(this, _muted, {
      writable: true,
      value: false
    });

    ads_classPrivateFieldInitSpec(this, ads_duration, {
      writable: true,
      value: 0
    });

    ads_classPrivateFieldInitSpec(this, ads_currentTime, {
      writable: true,
      value: 0
    });

    ads_classPrivateFieldInitSpec(this, _manager, {
      writable: true,
      value: null
    });

    ads_classPrivateFieldInitSpec(this, ads_player, {
      writable: true,
      value: void 0
    });

    ads_classPrivateFieldInitSpec(this, ads_media, {
      writable: true,
      value: void 0
    });

    ads_classPrivateFieldInitSpec(this, ads_element, {
      writable: true,
      value: void 0
    });

    ads_classPrivateFieldInitSpec(this, ads_events, {
      writable: true,
      value: []
    });

    ads_classPrivateFieldInitSpec(this, _ads, {
      writable: true,
      value: void 0
    });

    ads_classPrivateFieldInitSpec(this, _promise, {
      writable: true,
      value: void 0
    });

    ads_classPrivateFieldInitSpec(this, _loader, {
      writable: true,
      value: void 0
    });

    ads_classPrivateFieldInitSpec(this, ads_container, {
      writable: true,
      value: void 0
    });

    ads_classPrivateFieldInitSpec(this, _customClickContainer, {
      writable: true,
      value: void 0
    });

    ads_classPrivateFieldInitSpec(this, _skipElement, {
      writable: true,
      value: void 0
    });

    ads_classPrivateFieldInitSpec(this, _displayContainer, {
      writable: true,
      value: void 0
    });

    ads_classPrivateFieldInitSpec(this, _request, {
      writable: true,
      value: void 0
    });

    ads_classPrivateFieldInitSpec(this, _autostart, {
      writable: true,
      value: false
    });

    ads_classPrivateFieldInitSpec(this, _autostartMuted, {
      writable: true,
      value: false
    });

    ads_classPrivateFieldInitSpec(this, _playTriggered, {
      writable: true,
      value: false
    });

    ads_classPrivateFieldInitSpec(this, ads_options, {
      writable: true,
      value: void 0
    });

    ads_classPrivateFieldInitSpec(this, _currentIndex, {
      writable: true,
      value: 0
    });

    ads_classPrivateFieldInitSpec(this, _originalVolume, {
      writable: true,
      value: void 0
    });

    ads_classPrivateFieldInitSpec(this, _preloadContent, {
      writable: true,
      value: void 0
    });

    ads_classPrivateFieldInitSpec(this, _lastTimePaused, {
      writable: true,
      value: 0
    });

    ads_classPrivateFieldInitSpec(this, _mediaSources, {
      writable: true,
      value: []
    });

    ads_classPrivateFieldInitSpec(this, _mediaStarted, {
      writable: true,
      value: false
    });

    ads_classPrivateFieldInitSpec(this, _adEvent, {
      writable: true,
      value: null
    });

    var defaultOpts = {
      autoPlayAdBreaks: true,
      customClick: {
        enabled: false,
        label: 'Click here for more info'
      },
      audioSkip: {
        enabled: true,
        label: 'Skip Ad',
        remainingLabel: 'Skip in [[secs]] seconds'
      },
      debug: false,
      enablePreloading: false,
      language: 'en',
      loop: false,
      numRedirects: 4,
      publisherId: undefined,
      sdkPath: 'https://imasdk.googleapis.com/js/sdkloader/ima3.js',
      sessionId: undefined,
      src: [],
      vpaidMode: 'enabled'
    };

    classPrivateFieldSet_default()(this, ads_player, player);

    classPrivateFieldSet_default()(this, _ads, ads);

    classPrivateFieldSet_default()(this, ads_media, player.getMedia());

    classPrivateFieldSet_default()(this, ads_element, player.getElement());

    classPrivateFieldSet_default()(this, _autostart, autostart || false);

    classPrivateFieldSet_default()(this, _muted, player.getElement().muted);

    classPrivateFieldSet_default()(this, _autostartMuted, autostartMuted || false);

    classPrivateFieldSet_default()(this, ads_options, ads_objectSpread(ads_objectSpread({}, defaultOpts), options));

    if (options !== null && options !== void 0 && options.customClick && Object.keys(options.customClick).length) {
      classPrivateFieldGet_default()(this, ads_options).customClick = ads_objectSpread(ads_objectSpread({}, defaultOpts.customClick), options.customClick);
    }

    classPrivateFieldSet_default()(this, _playTriggered, false);

    classPrivateFieldSet_default()(this, _originalVolume, classPrivateFieldGet_default()(this, ads_element).volume);

    classPrivateFieldSet_default()(this, ads_volume, classPrivateFieldGet_default()(this, _originalVolume));

    var path = (_classPrivateFieldGet2 = classPrivateFieldGet_default()(this, ads_options)) !== null && _classPrivateFieldGet2 !== void 0 && _classPrivateFieldGet2.debug ? (_classPrivateFieldGet3 = classPrivateFieldGet_default()(this, ads_options)) === null || _classPrivateFieldGet3 === void 0 ? void 0 : (_classPrivateFieldGet4 = _classPrivateFieldGet3.sdkPath) === null || _classPrivateFieldGet4 === void 0 ? void 0 : _classPrivateFieldGet4.replace(/(\.js$)/, '_debug.js') : (_classPrivateFieldGet5 = classPrivateFieldGet_default()(this, ads_options)) === null || _classPrivateFieldGet5 === void 0 ? void 0 : _classPrivateFieldGet5.sdkPath;
    this.load = this.load.bind(this);
    this.resizeAds = this.resizeAds.bind(this);
    this._handleClickInContainer = this._handleClickInContainer.bind(this);
    this._handleSkipAds = this._handleSkipAds.bind(this);
    this._loaded = this._loaded.bind(this);
    this._error = this._error.bind(this);
    this._assign = this._assign.bind(this);
    this._contentLoadedAction = this._contentLoadedAction.bind(this);
    this._loadedMetadataHandler = this._loadedMetadataHandler.bind(this);
    this._contentEndedListener = this._contentEndedListener.bind(this);
    this._handleResizeAds = this._handleResizeAds.bind(this);
    this._onContentPauseRequested = this._onContentPauseRequested.bind(this);
    this._onContentResumeRequested = this._onContentResumeRequested.bind(this);

    classPrivateFieldSet_default()(this, _promise, path && (typeof google === 'undefined' || typeof google.ima === 'undefined') ? loadScript(path) : new Promise(function (resolve) {
      resolve();
    }));

    classPrivateFieldGet_default()(this, _promise).then(function () {
      _this.load();
    }).catch(function (error) {
      var message = 'Ad script could not be loaded; please check if you have an AdBlock ';
      message += 'turned on, or if you provided a valid URL is correct';
      console.error("Ad error: ".concat(message, "."));
      var details = {
        detail: {
          data: error,
          message: message,
          type: 'Ads'
        }
      };
      var errorEvent = addEvent('playererror', details);

      classPrivateFieldGet_default()(_this, ads_element).dispatchEvent(errorEvent);
    });
  }

  createClass_default()(Ads, [{
    key: "load",
    value: function load() {
      var _classPrivateFieldGet6, _classPrivateFieldGet7;

      var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (typeof google === 'undefined' || !google.ima || !force && this.loadedAd && classPrivateFieldGet_default()(this, ads_options).autoPlayAdBreaks) {
        return;
      }

      if (!classPrivateFieldGet_default()(this, ads_options).autoPlayAdBreaks && !force) {
        return;
      }

      this.loadedAd = true;

      var existingContainer = classPrivateFieldGet_default()(this, ads_player).getContainer().querySelector('.op-ads');

      if (existingContainer && existingContainer.parentNode) {
        existingContainer.parentNode.removeChild(existingContainer);
      }

      classPrivateFieldSet_default()(this, ads_started, true);

      classPrivateFieldSet_default()(this, ads_container, document.createElement('div'));

      classPrivateFieldGet_default()(this, ads_container).className = 'op-ads';
      classPrivateFieldGet_default()(this, ads_container).tabIndex = -1;

      if (classPrivateFieldGet_default()(this, ads_element).parentElement) {
        classPrivateFieldGet_default()(this, ads_element).parentElement.insertBefore(classPrivateFieldGet_default()(this, ads_container), classPrivateFieldGet_default()(this, ads_element).nextSibling);
      }

      classPrivateFieldGet_default()(this, ads_container).addEventListener('click', this._handleClickInContainer);

      if ((_classPrivateFieldGet6 = classPrivateFieldGet_default()(this, ads_options).customClick) !== null && _classPrivateFieldGet6 !== void 0 && _classPrivateFieldGet6.enabled) {
        classPrivateFieldSet_default()(this, _customClickContainer, document.createElement('div'));

        classPrivateFieldGet_default()(this, _customClickContainer).className = 'op-ads__click-container';
        classPrivateFieldGet_default()(this, _customClickContainer).innerHTML = "<div class=\"op-ads__click-label\">".concat(sanitize(classPrivateFieldGet_default()(this, ads_options).customClick.label), "</div>");

        if (classPrivateFieldGet_default()(this, ads_element).parentElement) {
          classPrivateFieldGet_default()(this, ads_element).parentElement.insertBefore(classPrivateFieldGet_default()(this, _customClickContainer), classPrivateFieldGet_default()(this, ads_element).nextSibling);
        }
      }

      if (isAudio(classPrivateFieldGet_default()(this, ads_element)) && (_classPrivateFieldGet7 = classPrivateFieldGet_default()(this, ads_options).audioSkip) !== null && _classPrivateFieldGet7 !== void 0 && _classPrivateFieldGet7.enabled) {
        var _classPrivateFieldGet8;

        if ((_classPrivateFieldGet8 = classPrivateFieldGet_default()(this, ads_options).audioSkip) !== null && _classPrivateFieldGet8 !== void 0 && _classPrivateFieldGet8.element) {
          var _ref = classPrivateFieldGet_default()(this, ads_options).audioSkip || {},
              element = _ref.element;

          if (typeof element === 'string') {
            var target = document.getElementById(element);

            if (target) {
              classPrivateFieldSet_default()(this, _skipElement, target);
            }
          } else if (element instanceof HTMLElement) {
            classPrivateFieldSet_default()(this, _skipElement, element);
          }
        } else {
          classPrivateFieldSet_default()(this, _skipElement, document.createElement('button'));

          classPrivateFieldGet_default()(this, _skipElement).className = 'op-ads__skip hidden';

          classPrivateFieldGet_default()(this, ads_player).getControls().getContainer().appendChild(classPrivateFieldGet_default()(this, _skipElement));
        }

        if (classPrivateFieldGet_default()(this, _skipElement)) {
          classPrivateFieldGet_default()(this, _skipElement).addEventListener('click', this._handleSkipAds, EVENT_OPTIONS);
        }
      }

      classPrivateFieldSet_default()(this, _mediaSources, classPrivateFieldGet_default()(this, ads_media).src);

      var vpaidModeMap = {
        disabled: google.ima.ImaSdkSettings.VpaidMode.DISABLED,
        enabled: google.ima.ImaSdkSettings.VpaidMode.ENABLED,
        insecure: google.ima.ImaSdkSettings.VpaidMode.INSECURE
      };
      google.ima.settings.setVpaidMode(vpaidModeMap[classPrivateFieldGet_default()(this, ads_options).vpaidMode || 'enabled']);
      google.ima.settings.setDisableCustomPlaybackForIOS10Plus(true);
      google.ima.settings.setAutoPlayAdBreaks(classPrivateFieldGet_default()(this, ads_options).autoPlayAdBreaks);
      google.ima.settings.setNumRedirects(classPrivateFieldGet_default()(this, ads_options).numRedirects);
      google.ima.settings.setLocale(classPrivateFieldGet_default()(this, ads_options).language);

      if (classPrivateFieldGet_default()(this, ads_options).sessionId) {
        google.ima.settings.setSessionId(classPrivateFieldGet_default()(this, ads_options).sessionId);
      }

      if (classPrivateFieldGet_default()(this, ads_options).publisherId) {
        google.ima.settings.setPpid(classPrivateFieldGet_default()(this, ads_options).publisherId);
      }

      google.ima.settings.setPlayerType('openplayerjs');
      google.ima.settings.setPlayerVersion('3.0.0');

      classPrivateFieldSet_default()(this, _displayContainer, new google.ima.AdDisplayContainer(classPrivateFieldGet_default()(this, ads_container), classPrivateFieldGet_default()(this, ads_element), classPrivateFieldGet_default()(this, _customClickContainer)));

      classPrivateFieldSet_default()(this, _loader, new google.ima.AdsLoader(classPrivateFieldGet_default()(this, _displayContainer)));

      classPrivateFieldGet_default()(this, _loader).addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, this._loaded, EVENT_OPTIONS);

      classPrivateFieldGet_default()(this, _loader).addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._error, EVENT_OPTIONS);

      if (typeof window !== 'undefined') {
        window.addEventListener('resize', this._handleResizeAds, EVENT_OPTIONS);
      }

      classPrivateFieldGet_default()(this, ads_element).addEventListener('loadedmetadata', this._handleResizeAds, EVENT_OPTIONS);

      if (classPrivateFieldGet_default()(this, _autostart) === true || classPrivateFieldGet_default()(this, _autostartMuted) === true || force === true || classPrivateFieldGet_default()(this, ads_options).enablePreloading === true || classPrivateFieldGet_default()(this, _playTriggered) === true) {
        if (!classPrivateFieldGet_default()(this, _done)) {
          classPrivateFieldSet_default()(this, _done, true);

          classPrivateFieldGet_default()(this, _displayContainer).initialize();
        }

        this._requestAds();
      }
    }
  }, {
    key: "play",
    value: function () {
      var _play = asyncToGenerator_default()(regenerator_default().mark(function _callee() {
        var e;
        return regenerator_default().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (classPrivateFieldGet_default()(this, _done)) {
                  _context.next = 4;
                  break;
                }

                classPrivateFieldSet_default()(this, _playTriggered, true);

                this._initNotDoneAds();

                return _context.abrupt("return");

              case 4:
                if (classPrivateFieldGet_default()(this, _manager)) {
                  try {
                    if (!classPrivateFieldGet_default()(this, _intervalTimer) && classPrivateFieldGet_default()(this, _active) === false) {
                      classPrivateFieldGet_default()(this, _manager).start();
                    } else {
                      classPrivateFieldGet_default()(this, _manager).resume();
                    }

                    classPrivateFieldSet_default()(this, _active, true);

                    e = addEvent('play');

                    classPrivateFieldGet_default()(this, ads_element).dispatchEvent(e);
                  } catch (err) {
                    this._resumeMedia();
                  }
                }

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function play() {
        return _play.apply(this, arguments);
      }

      return play;
    }()
  }, {
    key: "pause",
    value: function pause() {
      if (classPrivateFieldGet_default()(this, _manager)) {
        classPrivateFieldSet_default()(this, _active, false);

        classPrivateFieldGet_default()(this, _manager).pause();

        var e = addEvent('pause');

        classPrivateFieldGet_default()(this, ads_element).dispatchEvent(e);
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this2 = this,
          _classPrivateFieldGet9,
          _classPrivateFieldGet10;

      if (classPrivateFieldGet_default()(this, _manager)) {
        classPrivateFieldGet_default()(this, _manager).removeEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._error);

        if (classPrivateFieldGet_default()(this, ads_events)) {
          classPrivateFieldGet_default()(this, ads_events).forEach(function (event) {
            classPrivateFieldGet_default()(_this2, _manager).removeEventListener(event, _this2._assign);
          });
        }
      }

      classPrivateFieldSet_default()(this, ads_events, []);

      var controls = classPrivateFieldGet_default()(this, ads_player).getControls();

      var mouseEvents = controls ? controls.events.mouse : {};
      Object.keys(mouseEvents).forEach(function (event) {
        if (classPrivateFieldGet_default()(_this2, ads_container)) {
          classPrivateFieldGet_default()(_this2, ads_container).removeEventListener(event, mouseEvents[event]);
        }
      });

      if (classPrivateFieldGet_default()(this, _loader)) {
        classPrivateFieldGet_default()(this, _loader).removeEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._error);

        classPrivateFieldGet_default()(this, _loader).removeEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, this._loaded);
      }

      var destroy = !Array.isArray(classPrivateFieldGet_default()(this, _ads)) || classPrivateFieldGet_default()(this, _currentIndex) > classPrivateFieldGet_default()(this, _ads).length;

      if (classPrivateFieldGet_default()(this, _manager) && destroy) {
        classPrivateFieldGet_default()(this, _manager).destroy();
      }

      if ((_classPrivateFieldGet9 = classPrivateFieldGet_default()(this, ads_options).customClick) !== null && _classPrivateFieldGet9 !== void 0 && _classPrivateFieldGet9.enabled && classPrivateFieldGet_default()(this, _customClickContainer)) {
        classPrivateFieldGet_default()(this, _customClickContainer).remove();
      }

      if ((_classPrivateFieldGet10 = classPrivateFieldGet_default()(this, ads_options).audioSkip) !== null && _classPrivateFieldGet10 !== void 0 && _classPrivateFieldGet10.enabled && classPrivateFieldGet_default()(this, _skipElement)) {
        classPrivateFieldGet_default()(this, _skipElement).removeEventListener('click', this._handleSkipAds);

        classPrivateFieldGet_default()(this, _skipElement).remove();
      }

      if (IS_IOS || IS_ANDROID) {
        classPrivateFieldGet_default()(this, ads_element).removeEventListener('loadedmetadata', this._contentLoadedAction);
      }

      classPrivateFieldGet_default()(this, ads_element).removeEventListener('loadedmetadata', this._handleResizeAds);

      classPrivateFieldGet_default()(this, ads_element).removeEventListener('loadedmetadata', this._loadedMetadataHandler);

      classPrivateFieldGet_default()(this, ads_element).removeEventListener('ended', this._contentEndedListener);

      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', this._handleResizeAds);
      }

      if (classPrivateFieldGet_default()(this, ads_container)) {
        classPrivateFieldGet_default()(this, ads_container).removeEventListener('click', this._handleClickInContainer);

        classPrivateFieldGet_default()(this, ads_container).remove();
      }

      this.loadPromise = null;
      this.loadedAd = false;

      classPrivateFieldSet_default()(this, _done, false);

      classPrivateFieldSet_default()(this, _playTriggered, false);

      classPrivateFieldSet_default()(this, ads_duration, 0);

      classPrivateFieldSet_default()(this, ads_currentTime, 0);

      classPrivateFieldSet_default()(this, _adEvent, null);
    }
  }, {
    key: "resizeAds",
    value: function resizeAds(width, height) {
      var _this3 = this;

      if (classPrivateFieldGet_default()(this, _manager)) {
        var target = classPrivateFieldGet_default()(this, ads_element);

        var mode = target.getAttribute('data-fullscreen') === 'true' ? google.ima.ViewMode.FULLSCREEN : google.ima.ViewMode.NORMAL;
        var formattedWidth = width;
        var percentageWidth = width ? width.toString() : '';

        if (width && percentageWidth.indexOf('%') > -1) {
          if (classPrivateFieldGet_default()(this, ads_element).parentElement) {
            formattedWidth = classPrivateFieldGet_default()(this, ads_element).parentElement.offsetWidth * (parseInt(percentageWidth, 10) / 100);
          }
        }

        var formattedHeight = height;
        var percentageHeight = height ? height.toString() : '';

        if (height && percentageHeight.indexOf('%') > -1) {
          if (classPrivateFieldGet_default()(this, ads_element).parentElement) {
            formattedHeight = classPrivateFieldGet_default()(this, ads_element).parentElement.offsetHeight * (parseInt(percentageHeight, 10) / 100);
          }
        }

        var timeout;

        if (timeout && typeof window !== 'undefined') {
          window.cancelAnimationFrame(timeout);
        }

        if (typeof window !== 'undefined') {
          timeout = window.requestAnimationFrame(function () {
            classPrivateFieldGet_default()(_this3, _manager).resize(formattedWidth || target.offsetWidth, formattedHeight || target.offsetHeight, mode);
          });
        }
      }
    }
  }, {
    key: "getAdsManager",
    value: function getAdsManager() {
      return classPrivateFieldGet_default()(this, _manager);
    }
  }, {
    key: "getAdsLoader",
    value: function getAdsLoader() {
      return classPrivateFieldGet_default()(this, _loader);
    }
  }, {
    key: "started",
    value: function started() {
      return classPrivateFieldGet_default()(this, ads_started);
    }
  }, {
    key: "src",
    set: function set(source) {
      classPrivateFieldSet_default()(this, _ads, source);
    }
  }, {
    key: "isDone",
    set: function set(value) {
      classPrivateFieldSet_default()(this, _done, value);
    }
  }, {
    key: "playRequested",
    set: function set(value) {
      classPrivateFieldSet_default()(this, _playTriggered, value);
    }
  }, {
    key: "volume",
    get: function get() {
      return classPrivateFieldGet_default()(this, _manager) ? classPrivateFieldGet_default()(this, _manager).getVolume() : classPrivateFieldGet_default()(this, _originalVolume);
    },
    set: function set(value) {
      if (classPrivateFieldGet_default()(this, _manager)) {
        classPrivateFieldSet_default()(this, ads_volume, value);

        classPrivateFieldGet_default()(this, _manager).setVolume(value);

        this._setMediaVolume(value);

        classPrivateFieldSet_default()(this, _muted, value === 0);
      }
    }
  }, {
    key: "muted",
    get: function get() {
      return classPrivateFieldGet_default()(this, _muted);
    },
    set: function set(value) {
      if (classPrivateFieldGet_default()(this, _manager)) {
        if (value) {
          classPrivateFieldGet_default()(this, _manager).setVolume(0);

          classPrivateFieldSet_default()(this, _muted, true);

          this._setMediaVolume(0);
        } else {
          classPrivateFieldGet_default()(this, _manager).setVolume(classPrivateFieldGet_default()(this, ads_volume));

          classPrivateFieldSet_default()(this, _muted, false);

          this._setMediaVolume(classPrivateFieldGet_default()(this, ads_volume));
        }
      }
    }
  }, {
    key: "currentTime",
    get: function get() {
      return classPrivateFieldGet_default()(this, ads_currentTime);
    },
    set: function set(value) {
      classPrivateFieldSet_default()(this, ads_currentTime, value);
    }
  }, {
    key: "duration",
    get: function get() {
      return classPrivateFieldGet_default()(this, ads_duration);
    }
  }, {
    key: "paused",
    get: function get() {
      return !classPrivateFieldGet_default()(this, _active);
    }
  }, {
    key: "ended",
    get: function get() {
      return classPrivateFieldGet_default()(this, _ended);
    }
  }, {
    key: "_assign",
    value: function _assign(event) {
      var _this4 = this;

      var ad = event.getAd();

      if (ad) {
        classPrivateFieldSet_default()(this, _adEvent, ad);
      }

      switch (event.type) {
        case google.ima.AdEvent.Type.LOADED:
          if (!ad.isLinear()) {
            this._onContentResumeRequested();
          } else {
            if (IS_IPHONE && isVideo(classPrivateFieldGet_default()(this, ads_element))) {
              classPrivateFieldGet_default()(this, ads_element).controls = false;
            }

            classPrivateFieldSet_default()(this, ads_duration, ad.getDuration());

            classPrivateFieldSet_default()(this, ads_currentTime, ad.getDuration());

            if (!classPrivateFieldGet_default()(this, _mediaStarted) && !IS_IOS && !IS_ANDROID) {
              var waitingEvent = addEvent('waiting');

              classPrivateFieldGet_default()(this, ads_element).dispatchEvent(waitingEvent);

              var loadedEvent = addEvent('loadedmetadata');

              classPrivateFieldGet_default()(this, ads_element).dispatchEvent(loadedEvent);

              this.resizeAds();
            }
          }

          break;

        case google.ima.AdEvent.Type.STARTED:
          if (ad.isLinear()) {
            if (classPrivateFieldGet_default()(this, ads_element).parentElement && !classPrivateFieldGet_default()(this, ads_element).parentElement.classList.contains('op-ads--active')) {
              classPrivateFieldGet_default()(this, ads_element).parentElement.classList.add('op-ads--active');
            }

            if (!classPrivateFieldGet_default()(this, ads_media).paused) {
              classPrivateFieldGet_default()(this, ads_media).pause();
            }

            classPrivateFieldSet_default()(this, _active, true);

            var playEvent = addEvent('play');

            classPrivateFieldGet_default()(this, ads_element).dispatchEvent(playEvent);

            var resized;

            if (!resized) {
              this.resizeAds();
              resized = true;
            }

            if (classPrivateFieldGet_default()(this, ads_media).ended) {
              classPrivateFieldSet_default()(this, _ended, false);

              var endEvent = addEvent('adsmediaended');

              classPrivateFieldGet_default()(this, ads_element).dispatchEvent(endEvent);
            }

            if (typeof window !== 'undefined') {
              classPrivateFieldSet_default()(this, _intervalTimer, window.setInterval(function () {
                if (classPrivateFieldGet_default()(_this4, _active) === true) {
                  classPrivateFieldSet_default()(_this4, ads_currentTime, Math.round(classPrivateFieldGet_default()(_this4, _manager).getRemainingTime()));

                  var timeEvent = addEvent('timeupdate');

                  classPrivateFieldGet_default()(_this4, ads_element).dispatchEvent(timeEvent);
                }
              }, 350));
            }
          }

          break;

        case google.ima.AdEvent.Type.COMPLETE:
        case google.ima.AdEvent.Type.SKIPPED:
          if (ad.isLinear()) {
            if (event.type === google.ima.AdEvent.Type.SKIPPED) {
              var skipEvent = addEvent('adsskipped');

              classPrivateFieldGet_default()(this, ads_element).dispatchEvent(skipEvent);
            }

            if (classPrivateFieldGet_default()(this, ads_element).parentElement) {
              classPrivateFieldGet_default()(this, ads_element).parentElement.classList.remove('op-ads--active');
            }

            classPrivateFieldSet_default()(this, _active, false);

            clearInterval(classPrivateFieldGet_default()(this, _intervalTimer));
          }

          break;

        case google.ima.AdEvent.Type.VOLUME_CHANGED:
          this._setMediaVolume(this.volume);

          break;

        case google.ima.AdEvent.Type.VOLUME_MUTED:
          if (ad.isLinear()) {
            var volumeEvent = addEvent('volumechange');

            classPrivateFieldGet_default()(this, ads_element).dispatchEvent(volumeEvent);
          }

          break;

        case google.ima.AdEvent.Type.ALL_ADS_COMPLETED:
          if (ad.isLinear()) {
            classPrivateFieldSet_default()(this, _active, false);

            classPrivateFieldSet_default()(this, _ended, true);

            classPrivateFieldSet_default()(this, _intervalTimer, 0);

            classPrivateFieldSet_default()(this, _muted, false);

            classPrivateFieldSet_default()(this, ads_started, false);

            classPrivateFieldSet_default()(this, _adEvent, null);

            if (classPrivateFieldGet_default()(this, ads_element).parentElement) {
              classPrivateFieldGet_default()(this, ads_element).parentElement.classList.remove('op-ads--active');
            }

            this.destroy();

            if (classPrivateFieldGet_default()(this, ads_element).currentTime >= classPrivateFieldGet_default()(this, ads_element).duration) {
              var endedEvent = addEvent('ended');

              classPrivateFieldGet_default()(this, ads_element).dispatchEvent(endedEvent);
            }
          }

          break;

        case google.ima.AdEvent.Type.CLICK:
          var pauseEvent = addEvent('pause');

          classPrivateFieldGet_default()(this, ads_element).dispatchEvent(pauseEvent);

          break;

        case google.ima.AdEvent.Type.AD_BREAK_READY:
          if (!classPrivateFieldGet_default()(this, ads_options).autoPlayAdBreaks) {
            this.play();
          }

          break;

        case google.ima.AdEvent.Type.AD_PROGRESS:
          var progressData = event.getAdData();
          var offset = classPrivateFieldGet_default()(this, _adEvent) ? classPrivateFieldGet_default()(this, _adEvent).getSkipTimeOffset() : -1;

          if (classPrivateFieldGet_default()(this, _skipElement)) {
            if (offset !== -1) {
              var canSkip = classPrivateFieldGet_default()(this, _manager).getAdSkippableState();

              var remainingTime = Math.ceil(offset - progressData.currentTime);

              classPrivateFieldGet_default()(this, _skipElement).classList.remove('hidden');

              if (canSkip) {
                var _classPrivateFieldGet11;

                classPrivateFieldGet_default()(this, _skipElement).textContent = ((_classPrivateFieldGet11 = classPrivateFieldGet_default()(this, ads_options).audioSkip) === null || _classPrivateFieldGet11 === void 0 ? void 0 : _classPrivateFieldGet11.label) || '';

                classPrivateFieldGet_default()(this, _skipElement).classList.remove('disabled');
              } else {
                var _classPrivateFieldGet12;

                classPrivateFieldGet_default()(this, _skipElement).textContent = ((_classPrivateFieldGet12 = classPrivateFieldGet_default()(this, ads_options).audioSkip) === null || _classPrivateFieldGet12 === void 0 ? void 0 : _classPrivateFieldGet12.remainingLabel.replace('[[secs]]', remainingTime.toString())) || '';

                classPrivateFieldGet_default()(this, _skipElement).classList.add('disabled');
              }
            } else {
              classPrivateFieldGet_default()(this, _skipElement).classList.add('hidden');
            }
          }

          break;

        default:
          break;
      }

      if (event.type === google.ima.AdEvent.Type.LOG) {
        var adData = event.getAdData();

        if (adData.adError) {
          var message = adData.adError.getMessage();
          console.warn("Ad warning: Non-fatal error occurred: ".concat(message));
          var details = {
            detail: {
              data: adData.adError,
              message: message,
              type: 'Ads'
            }
          };
          var errorEvent = addEvent('playererror', details);

          classPrivateFieldGet_default()(this, ads_element).dispatchEvent(errorEvent);
        }
      } else {
        var e = addEvent("ads".concat(event.type));

        classPrivateFieldGet_default()(this, ads_element).dispatchEvent(e);
      }
    }
  }, {
    key: "_error",
    value: function _error(event) {
      var error = event.getError();
      var details = {
        detail: {
          data: error,
          message: error.toString(),
          type: 'Ads'
        }
      };
      var errorEvent = addEvent('playererror', details);

      classPrivateFieldGet_default()(this, ads_element).dispatchEvent(errorEvent);

      var fatalErrorCodes = [100, 101, 102, 300, 301, 302, 303, 400, 401, 402, 403, 405, 406, 407, 408, 409, 410, 500, 501, 502, 503, 900, 901, 1005];

      if (Array.isArray(classPrivateFieldGet_default()(this, _ads)) && classPrivateFieldGet_default()(this, _ads).length > 1 && classPrivateFieldGet_default()(this, _currentIndex) < classPrivateFieldGet_default()(this, _ads).length - 1) {
        var _this$currentIndex, _this$currentIndex2;

        classPrivateFieldSet_default()(this, _currentIndex, (_this$currentIndex = classPrivateFieldGet_default()(this, _currentIndex), _this$currentIndex2 = _this$currentIndex++, _this$currentIndex)), _this$currentIndex2;
        this.destroy();

        classPrivateFieldSet_default()(this, ads_started, true);

        classPrivateFieldSet_default()(this, _playTriggered, true);

        this.load(true);
        console.warn("Ad warning: ".concat(error.toString()));
      } else {
        if (fatalErrorCodes.indexOf(error.getErrorCode()) > -1) {
          if (classPrivateFieldGet_default()(this, _manager)) {
            classPrivateFieldGet_default()(this, _manager).destroy();
          }

          console.error("Ad error: ".concat(error.toString()));
        } else {
          console.warn("Ad warning: ".concat(error.toString()));
        }

        classPrivateFieldSet_default()(this, _adEvent, null);

        if (classPrivateFieldGet_default()(this, _autostart) === true || classPrivateFieldGet_default()(this, _autostartMuted) === true || classPrivateFieldGet_default()(this, ads_started) === true) {
          classPrivateFieldSet_default()(this, _active, false);

          this._resumeMedia();
        }
      }
    }
  }, {
    key: "_loaded",
    value: function _loaded(managerLoadedEvent) {
      var adsRenderingSettings = new google.ima.AdsRenderingSettings();
      adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = false;
      adsRenderingSettings.enablePreloading = classPrivateFieldGet_default()(this, ads_options).enablePreloading;

      classPrivateFieldSet_default()(this, _manager, managerLoadedEvent.getAdsManager(classPrivateFieldGet_default()(this, ads_element), adsRenderingSettings));

      this._start(classPrivateFieldGet_default()(this, _manager));

      this.loadPromise = new Promise(function (resolve) {
        resolve();
      });
    }
  }, {
    key: "_start",
    value: function _start(manager) {
      var _this5 = this;

      if (classPrivateFieldGet_default()(this, _customClickContainer) && manager.isCustomClickTrackingUsed()) {
        classPrivateFieldGet_default()(this, _customClickContainer).classList.add('op-ads__click-container--visible');
      }

      manager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, this._onContentPauseRequested, EVENT_OPTIONS);
      manager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, this._onContentResumeRequested, EVENT_OPTIONS);

      classPrivateFieldSet_default()(this, ads_events, [google.ima.AdEvent.Type.ALL_ADS_COMPLETED, google.ima.AdEvent.Type.CLICK, google.ima.AdEvent.Type.VIDEO_CLICKED, google.ima.AdEvent.Type.VIDEO_ICON_CLICKED, google.ima.AdEvent.Type.AD_PROGRESS, google.ima.AdEvent.Type.AD_BUFFERING, google.ima.AdEvent.Type.IMPRESSION, google.ima.AdEvent.Type.DURATION_CHANGE, google.ima.AdEvent.Type.USER_CLOSE, google.ima.AdEvent.Type.LINEAR_CHANGED, google.ima.AdEvent.Type.SKIPPABLE_STATE_CHANGED, google.ima.AdEvent.Type.AD_METADATA, google.ima.AdEvent.Type.INTERACTION, google.ima.AdEvent.Type.COMPLETE, google.ima.AdEvent.Type.FIRST_QUARTILE, google.ima.AdEvent.Type.LOADED, google.ima.AdEvent.Type.MIDPOINT, google.ima.AdEvent.Type.PAUSED, google.ima.AdEvent.Type.RESUMED, google.ima.AdEvent.Type.USER_CLOSE, google.ima.AdEvent.Type.STARTED, google.ima.AdEvent.Type.THIRD_QUARTILE, google.ima.AdEvent.Type.SKIPPED, google.ima.AdEvent.Type.VOLUME_CHANGED, google.ima.AdEvent.Type.VOLUME_MUTED, google.ima.AdEvent.Type.LOG]);

      if (!classPrivateFieldGet_default()(this, ads_options).autoPlayAdBreaks) {
        classPrivateFieldGet_default()(this, ads_events).push(google.ima.AdEvent.Type.AD_BREAK_READY);
      }

      var controls = classPrivateFieldGet_default()(this, ads_player).getControls();

      var mouseEvents = controls ? controls.events.mouse : {};
      Object.keys(mouseEvents).forEach(function (event) {
        if (classPrivateFieldGet_default()(_this5, ads_container)) {
          classPrivateFieldGet_default()(_this5, ads_container).addEventListener(event, mouseEvents[event], EVENT_OPTIONS);
        }
      });

      classPrivateFieldGet_default()(this, ads_events).forEach(function (event) {
        manager.addEventListener(event, _this5._assign, EVENT_OPTIONS);
      });

      if (classPrivateFieldGet_default()(this, _autostart) === true || classPrivateFieldGet_default()(this, _autostartMuted) === true || classPrivateFieldGet_default()(this, _playTriggered) === true) {
        classPrivateFieldSet_default()(this, _playTriggered, false);

        if (!classPrivateFieldGet_default()(this, _done)) {
          this._initNotDoneAds();

          return;
        }

        manager.init(classPrivateFieldGet_default()(this, ads_element).offsetWidth, classPrivateFieldGet_default()(this, ads_element).offsetHeight, classPrivateFieldGet_default()(this, ads_element).parentElement && classPrivateFieldGet_default()(this, ads_element).parentElement.getAttribute('data-fullscreen') === 'true' ? google.ima.ViewMode.FULLSCREEN : google.ima.ViewMode.NORMAL);
        manager.start();
        var e = addEvent('play');

        classPrivateFieldGet_default()(this, ads_element).dispatchEvent(e);
      } else if (classPrivateFieldGet_default()(this, ads_options).enablePreloading === true) {
        manager.init(classPrivateFieldGet_default()(this, ads_element).offsetWidth, classPrivateFieldGet_default()(this, ads_element).offsetHeight, classPrivateFieldGet_default()(this, ads_element).parentElement && classPrivateFieldGet_default()(this, ads_element).parentElement.getAttribute('data-fullscreen') === 'true' ? google.ima.ViewMode.FULLSCREEN : google.ima.ViewMode.NORMAL);
      }
    }
  }, {
    key: "_initNotDoneAds",
    value: function _initNotDoneAds() {
      if (classPrivateFieldGet_default()(this, _displayContainer)) {
        classPrivateFieldSet_default()(this, _done, true);

        classPrivateFieldGet_default()(this, _displayContainer).initialize();

        if (IS_IOS || IS_ANDROID) {
          classPrivateFieldSet_default()(this, _preloadContent, this._contentLoadedAction);

          classPrivateFieldGet_default()(this, ads_element).addEventListener('loadedmetadata', this._contentLoadedAction, EVENT_OPTIONS);

          classPrivateFieldGet_default()(this, ads_element).load();
        } else {
          this._contentLoadedAction();
        }
      } else {
        this.load();
        this.loadedAd = false;
      }
    }
  }, {
    key: "_contentEndedListener",
    value: function _contentEndedListener() {
      classPrivateFieldSet_default()(this, _ended, true);

      classPrivateFieldSet_default()(this, _active, false);

      classPrivateFieldSet_default()(this, ads_started, false);

      classPrivateFieldGet_default()(this, _loader).contentComplete();
    }
  }, {
    key: "_onContentPauseRequested",
    value: function _onContentPauseRequested() {
      classPrivateFieldGet_default()(this, ads_element).removeEventListener('ended', this._contentEndedListener);

      classPrivateFieldSet_default()(this, _lastTimePaused, classPrivateFieldGet_default()(this, ads_media).currentTime);

      if (classPrivateFieldGet_default()(this, ads_started)) {
        classPrivateFieldGet_default()(this, ads_media).pause();
      } else {
        classPrivateFieldSet_default()(this, ads_started, true);
      }

      var e = addEvent('play');

      classPrivateFieldGet_default()(this, ads_element).dispatchEvent(e);
    }
  }, {
    key: "_onContentResumeRequested",
    value: function _onContentResumeRequested() {
      classPrivateFieldGet_default()(this, ads_element).addEventListener('ended', this._contentEndedListener, EVENT_OPTIONS);

      classPrivateFieldGet_default()(this, ads_element).addEventListener('loadedmetadata', this._loadedMetadataHandler, EVENT_OPTIONS);

      if (IS_IOS || IS_ANDROID) {
        classPrivateFieldGet_default()(this, ads_media).src = classPrivateFieldGet_default()(this, _mediaSources);

        classPrivateFieldGet_default()(this, ads_media).load();

        this._prepareMedia();

        if (classPrivateFieldGet_default()(this, ads_element).parentElement) {
          classPrivateFieldGet_default()(this, ads_element).parentElement.classList.add('op-ads--active');
        }
      } else {
        var event = addEvent('loadedmetadata');

        classPrivateFieldGet_default()(this, ads_element).dispatchEvent(event);
      }
    }
  }, {
    key: "_loadedMetadataHandler",
    value: function _loadedMetadataHandler() {
      if (Array.isArray(classPrivateFieldGet_default()(this, _ads))) {
        var _this$currentIndex3, _this$currentIndex4;

        classPrivateFieldSet_default()(this, _currentIndex, (_this$currentIndex3 = classPrivateFieldGet_default()(this, _currentIndex), _this$currentIndex4 = _this$currentIndex3++, _this$currentIndex3)), _this$currentIndex4;

        if (classPrivateFieldGet_default()(this, _currentIndex) <= classPrivateFieldGet_default()(this, _ads).length - 1) {
          if (classPrivateFieldGet_default()(this, _manager)) {
            classPrivateFieldGet_default()(this, _manager).destroy();
          }

          classPrivateFieldGet_default()(this, _loader).contentComplete();

          classPrivateFieldSet_default()(this, _playTriggered, true);

          classPrivateFieldSet_default()(this, ads_started, true);

          classPrivateFieldSet_default()(this, _done, false);

          this.load(true);
        } else {
          if (!classPrivateFieldGet_default()(this, ads_options).autoPlayAdBreaks) {
            this._resetAdsAfterManualBreak();
          }

          this._prepareMedia();
        }
      } else if (classPrivateFieldGet_default()(this, ads_element).seekable.length) {
        if (classPrivateFieldGet_default()(this, ads_element).seekable.end(0) > classPrivateFieldGet_default()(this, _lastTimePaused)) {
          if (!classPrivateFieldGet_default()(this, ads_options).autoPlayAdBreaks) {
            this._resetAdsAfterManualBreak();
          }

          this._prepareMedia();
        }
      } else {
        setTimeout(this._loadedMetadataHandler, 100);
      }
    }
  }, {
    key: "_resumeMedia",
    value: function _resumeMedia() {
      var _this6 = this;

      classPrivateFieldSet_default()(this, _intervalTimer, 0);

      classPrivateFieldSet_default()(this, _muted, false);

      classPrivateFieldSet_default()(this, ads_started, false);

      classPrivateFieldSet_default()(this, ads_duration, 0);

      classPrivateFieldSet_default()(this, ads_currentTime, 0);

      if (classPrivateFieldGet_default()(this, ads_element).parentElement) {
        classPrivateFieldGet_default()(this, ads_element).parentElement.classList.remove('op-ads--active');
      }

      if (classPrivateFieldGet_default()(this, ads_media).ended) {
        var e = addEvent('ended');

        classPrivateFieldGet_default()(this, ads_element).dispatchEvent(e);
      } else {
        try {
          classPrivateFieldGet_default()(this, ads_media).play();

          setTimeout(function () {
            var e = addEvent('play');

            classPrivateFieldGet_default()(_this6, ads_element).dispatchEvent(e);
          }, 50);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }, {
    key: "_requestAds",
    value: function _requestAds() {
      classPrivateFieldSet_default()(this, _request, new google.ima.AdsRequest());

      var ads = Array.isArray(classPrivateFieldGet_default()(this, _ads)) ? classPrivateFieldGet_default()(this, _ads)[classPrivateFieldGet_default()(this, _currentIndex)] : classPrivateFieldGet_default()(this, _ads);

      if (isXml(ads)) {
        classPrivateFieldGet_default()(this, _request).adsResponse = ads;
      } else {
        classPrivateFieldGet_default()(this, _request).adTagUrl = ads;
      }

      var width = classPrivateFieldGet_default()(this, ads_element).parentElement ? classPrivateFieldGet_default()(this, ads_element).parentElement.offsetWidth : 0;
      var height = classPrivateFieldGet_default()(this, ads_element).parentElement ? classPrivateFieldGet_default()(this, ads_element).parentElement.offsetHeight : 0;
      classPrivateFieldGet_default()(this, _request).linearAdSlotWidth = width;
      classPrivateFieldGet_default()(this, _request).linearAdSlotHeight = height;
      classPrivateFieldGet_default()(this, _request).nonLinearAdSlotWidth = width;
      classPrivateFieldGet_default()(this, _request).nonLinearAdSlotHeight = height / 3;

      classPrivateFieldGet_default()(this, _request).setAdWillAutoPlay(classPrivateFieldGet_default()(this, _autostart));

      classPrivateFieldGet_default()(this, _request).setAdWillPlayMuted(classPrivateFieldGet_default()(this, _autostartMuted));

      classPrivateFieldGet_default()(this, _loader).requestAds(classPrivateFieldGet_default()(this, _request));
    }
  }, {
    key: "_contentLoadedAction",
    value: function _contentLoadedAction() {
      if (classPrivateFieldGet_default()(this, _preloadContent)) {
        classPrivateFieldGet_default()(this, ads_element).removeEventListener('loadedmetadata', classPrivateFieldGet_default()(this, _preloadContent));

        classPrivateFieldSet_default()(this, _preloadContent, null);
      }

      this._requestAds();
    }
  }, {
    key: "_resetAdsAfterManualBreak",
    value: function _resetAdsAfterManualBreak() {
      if (classPrivateFieldGet_default()(this, _manager)) {
        classPrivateFieldGet_default()(this, _manager).destroy();
      }

      classPrivateFieldGet_default()(this, _loader).contentComplete();

      classPrivateFieldSet_default()(this, _done, false);

      classPrivateFieldSet_default()(this, _playTriggered, true);
    }
  }, {
    key: "_prepareMedia",
    value: function _prepareMedia() {
      classPrivateFieldGet_default()(this, ads_media).currentTime = classPrivateFieldGet_default()(this, _lastTimePaused);

      classPrivateFieldGet_default()(this, ads_element).removeEventListener('loadedmetadata', this._loadedMetadataHandler);

      this._resumeMedia();
    }
  }, {
    key: "_setMediaVolume",
    value: function _setMediaVolume(volume) {
      classPrivateFieldGet_default()(this, ads_media).volume = volume;
      classPrivateFieldGet_default()(this, ads_media).muted = volume === 0;
    }
  }, {
    key: "_handleClickInContainer",
    value: function _handleClickInContainer() {
      if (classPrivateFieldGet_default()(this, ads_media).paused) {
        var e = addEvent('paused');

        classPrivateFieldGet_default()(this, ads_element).dispatchEvent(e);

        this.pause();
      }
    }
  }, {
    key: "_handleResizeAds",
    value: function _handleResizeAds() {
      this.resizeAds();
    }
  }, {
    key: "_handleSkipAds",
    value: function _handleSkipAds() {
      classPrivateFieldGet_default()(this, _manager).skip();
    }
  }]);

  return Ads;
}();

/* harmony default export */ const ads = (Ads);
;// CONCATENATED MODULE: ./src/player.ts








function player_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function player_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? player_ownKeys(Object(source), !0).forEach(function (key) { defineProperty_default()(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : player_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }



function player_classPrivateFieldInitSpec(obj, privateMap, value) { player_checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function player_checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }









var _initialized = new WeakMap();

var player_controls = new WeakMap();

var _adsInstance = new WeakMap();

var _uid = new WeakMap();

var player_element = new WeakMap();

var player_ads = new WeakMap();

var player_media = new WeakMap();

var player_events = new WeakMap();

var player_autoplay = new WeakMap();

var player_volume = new WeakMap();

var _canAutoplay = new WeakMap();

var _canAutoplayMuted = new WeakMap();

var _processedAutoplay = new WeakMap();

var player_options = new WeakMap();

var _customElements = new WeakMap();

var _fullscreen = new WeakMap();

var _defaultOptions = new WeakMap();

var Player = function () {
  function Player(element, options) {
    classCallCheck_default()(this, Player);

    defineProperty_default()(this, "loader", void 0);

    defineProperty_default()(this, "playBtn", void 0);

    player_classPrivateFieldInitSpec(this, _initialized, {
      writable: true,
      value: false
    });

    player_classPrivateFieldInitSpec(this, player_controls, {
      writable: true,
      value: void 0
    });

    player_classPrivateFieldInitSpec(this, _adsInstance, {
      writable: true,
      value: void 0
    });

    player_classPrivateFieldInitSpec(this, _uid, {
      writable: true,
      value: ''
    });

    player_classPrivateFieldInitSpec(this, player_element, {
      writable: true,
      value: void 0
    });

    player_classPrivateFieldInitSpec(this, player_ads, {
      writable: true,
      value: void 0
    });

    player_classPrivateFieldInitSpec(this, player_media, {
      writable: true,
      value: void 0
    });

    player_classPrivateFieldInitSpec(this, player_events, {
      writable: true,
      value: {}
    });

    player_classPrivateFieldInitSpec(this, player_autoplay, {
      writable: true,
      value: false
    });

    player_classPrivateFieldInitSpec(this, player_volume, {
      writable: true,
      value: void 0
    });

    player_classPrivateFieldInitSpec(this, _canAutoplay, {
      writable: true,
      value: false
    });

    player_classPrivateFieldInitSpec(this, _canAutoplayMuted, {
      writable: true,
      value: false
    });

    player_classPrivateFieldInitSpec(this, _processedAutoplay, {
      writable: true,
      value: false
    });

    player_classPrivateFieldInitSpec(this, player_options, {
      writable: true,
      value: void 0
    });

    player_classPrivateFieldInitSpec(this, _customElements, {
      writable: true,
      value: []
    });

    player_classPrivateFieldInitSpec(this, _fullscreen, {
      writable: true,
      value: void 0
    });

    player_classPrivateFieldInitSpec(this, _defaultOptions, {
      writable: true,
      value: {
        controls: {
          alwaysVisible: false,
          layers: {
            left: ['play', 'time', 'volume'],
            middle: ['progress'],
            right: ['captions', 'settings', 'fullscreen']
          }
        },
        defaultLevel: undefined,
        detachMenus: false,
        forceNative: true,
        minimalist: false,
        height: 0,
        hidePlayBtnTimer: 350,
        labels: {
          auto: 'Auto',
          captions: 'CC/Subtitles',
          click: 'Click to unmute',
          fullscreen: 'Fullscreen',
          lang: {
            en: 'English'
          },
          levels: 'Quality Levels',
          live: 'Live Broadcast',
          mediaLevels: 'Change Quality',
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
        live: {
          showLabel: true,
          showProgress: false
        },
        media: {
          pauseOnClick: false
        },
        mode: 'responsive',
        onError: function onError(e) {
          return console.error(e);
        },
        pauseOthers: true,
        progress: {
          allowRewind: true,
          allowSkip: true,
          duration: 0,
          showCurrentTimeOnly: false
        },
        showLoaderOnInit: false,
        startTime: 0,
        startVolume: 1,
        step: 0,
        useDeviceVolume: true,
        width: 0
      }
    });

    classPrivateFieldSet_default()(this, player_element, element instanceof HTMLMediaElement ? element : document.getElementById(element));

    if (classPrivateFieldGet_default()(this, player_element)) {
      var _classPrivateFieldGet2;

      classPrivateFieldSet_default()(this, player_autoplay, classPrivateFieldGet_default()(this, player_element).autoplay || false);

      if (typeof options !== 'string' && !Array.isArray(options)) {
        this._mergeOptions(options);
      }

      classPrivateFieldGet_default()(this, player_element).volume = classPrivateFieldGet_default()(this, player_options).startVolume || 1;

      if (classPrivateFieldGet_default()(this, player_options).ads && classPrivateFieldGet_default()(this, player_options).ads.src) {
        classPrivateFieldSet_default()(this, player_ads, classPrivateFieldGet_default()(this, player_options).ads.src);
      }

      if ((((_classPrivateFieldGet2 = classPrivateFieldGet_default()(this, player_options)) === null || _classPrivateFieldGet2 === void 0 ? void 0 : _classPrivateFieldGet2.startTime) || 0) > 0) {
        classPrivateFieldGet_default()(this, player_element).currentTime = classPrivateFieldGet_default()(this, player_options).startTime || 0;
      }

      classPrivateFieldSet_default()(this, player_volume, classPrivateFieldGet_default()(this, player_element).volume);
    }

    this._autoplay = this._autoplay.bind(this);
    this._setDimensions = this._setDimensions.bind(this);
    this._enableKeyBindings = this._enableKeyBindings.bind(this);
  }

  createClass_default()(Player, [{
    key: "init",
    value: function () {
      var _init = asyncToGenerator_default()(regenerator_default().mark(function _callee() {
        return regenerator_default().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!this._isValid()) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return");

              case 2:
                this._createUID();

                _context.next = 5;
                return this.prepareMedia();

              case 5:
                classPrivateFieldSet_default()(this, _initialized, true);

                Player.instances[this.id] = this;

                if (classPrivateFieldGet_default()(this, player_options).minimalist) {
                  this._wrapInstance();

                  this._createPlayButton();

                  this._createControls();

                  this._setEvents();
                } else {
                  this._setDimensions(classPrivateFieldGet_default()(this, player_element));
                }

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function init() {
        return _init.apply(this, arguments);
      }

      return init;
    }()
  }, {
    key: "load",
    value: function () {
      var _load = asyncToGenerator_default()(regenerator_default().mark(function _callee2() {
        return regenerator_default().wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (classPrivateFieldGet_default()(this, player_media)) {
                  _context2.next = 4;
                  break;
                }

                _context2.next = 3;
                return this.prepareMedia();

              case 3:
                return _context2.abrupt("return", classPrivateFieldGet_default()(this, player_media).load());

              case 4:
                classPrivateFieldGet_default()(this, player_media).loaded = false;
                return _context2.abrupt("return", this.isMedia() ? classPrivateFieldGet_default()(this, player_media).load() : undefined);

              case 6:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function load() {
        return _load.apply(this, arguments);
      }

      return load;
    }()
  }, {
    key: "play",
    value: function () {
      var _play = asyncToGenerator_default()(regenerator_default().mark(function _callee3() {
        return regenerator_default().wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (classPrivateFieldGet_default()(this, player_media).loaded) {
                  _context3.next = 4;
                  break;
                }

                _context3.next = 3;
                return classPrivateFieldGet_default()(this, player_media).load();

              case 3:
                classPrivateFieldGet_default()(this, player_media).loaded = true;

              case 4:
                if (!classPrivateFieldGet_default()(this, _adsInstance)) {
                  _context3.next = 9;
                  break;
                }

                classPrivateFieldGet_default()(this, _adsInstance).playRequested = true;
                _context3.next = 8;
                return classPrivateFieldGet_default()(this, _adsInstance).loadPromise;

              case 8:
                return _context3.abrupt("return", classPrivateFieldGet_default()(this, _adsInstance).play());

              case 9:
                return _context3.abrupt("return", classPrivateFieldGet_default()(this, player_media).play());

              case 10:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function play() {
        return _play.apply(this, arguments);
      }

      return play;
    }()
  }, {
    key: "pause",
    value: function pause() {
      if (classPrivateFieldGet_default()(this, _adsInstance)) {
        classPrivateFieldGet_default()(this, _adsInstance).pause();
      } else {
        classPrivateFieldGet_default()(this, player_media).pause();
      }
    }
  }, {
    key: "stop",
    value: function stop() {
      this.pause();

      if (classPrivateFieldGet_default()(this, player_media)) {
        classPrivateFieldGet_default()(this, player_media).currentTime = 0;
        this.src = [{
          src: '',
          type: 'video/mp4'
        }];
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this = this,
          _classPrivateFieldGet3;

      if (classPrivateFieldGet_default()(this, _adsInstance)) {
        classPrivateFieldGet_default()(this, _adsInstance).pause();

        classPrivateFieldGet_default()(this, _adsInstance).destroy();
      }

      if (classPrivateFieldGet_default()(this, _fullscreen)) {
        classPrivateFieldGet_default()(this, _fullscreen).destroy();
      }

      var el = classPrivateFieldGet_default()(this, player_element);

      if (classPrivateFieldGet_default()(this, player_media)) {
        classPrivateFieldGet_default()(this, player_media).destroy();
      }

      Object.keys(classPrivateFieldGet_default()(this, player_events)).forEach(function (event) {
        el.removeEventListener(event, classPrivateFieldGet_default()(_this, player_events)[event]);
      });
      this.getContainer().removeEventListener('keydown', this._enableKeyBindings);

      if (classPrivateFieldGet_default()(this, player_autoplay) && !classPrivateFieldGet_default()(this, _processedAutoplay) && isVideo(classPrivateFieldGet_default()(this, player_element))) {
        el.removeEventListener('canplay', this._autoplay);
      }

      if (classPrivateFieldGet_default()(this, player_controls)) {
        classPrivateFieldGet_default()(this, player_controls).destroy();
      }

      if (isVideo(classPrivateFieldGet_default()(this, player_element))) {
        if (this.playBtn) {
          this.playBtn.remove();
        }

        if (this.loader) {
          this.loader.remove();
        }
      }

      if ((_classPrivateFieldGet3 = classPrivateFieldGet_default()(this, player_options)) !== null && _classPrivateFieldGet3 !== void 0 && _classPrivateFieldGet3.onError) {
        classPrivateFieldGet_default()(this, player_element).removeEventListener('playererror', classPrivateFieldGet_default()(this, player_options).onError);
      }

      el.controls = true;
      el.setAttribute('id', classPrivateFieldGet_default()(this, _uid));
      el.removeAttribute('op-live__enabled');
      el.removeAttribute('op-dvr__enabled');
      var parent = classPrivateFieldGet_default()(this, player_options).mode === 'fit' && !isAudio(el) ? el.closest('.op-player__fit--wrapper') : el.parentElement;

      if (parent && parent.parentNode) {
        parent.parentNode.replaceChild(el, parent);
      }

      classPrivateFieldSet_default()(this, _initialized, false);

      delete Player.instances[classPrivateFieldGet_default()(this, _uid)];
      var e = addEvent('playerdestroyed');
      el.dispatchEvent(e);
    }
  }, {
    key: "getContainer",
    value: function getContainer() {
      return classPrivateFieldGet_default()(this, player_element).parentElement || classPrivateFieldGet_default()(this, player_element);
    }
  }, {
    key: "getControls",
    value: function getControls() {
      return classPrivateFieldGet_default()(this, player_controls);
    }
  }, {
    key: "getCustomControls",
    value: function getCustomControls() {
      return classPrivateFieldGet_default()(this, _customElements);
    }
  }, {
    key: "getElement",
    value: function getElement() {
      return classPrivateFieldGet_default()(this, player_element);
    }
  }, {
    key: "getEvents",
    value: function getEvents() {
      return classPrivateFieldGet_default()(this, player_events);
    }
  }, {
    key: "getOptions",
    value: function getOptions() {
      return classPrivateFieldGet_default()(this, player_options);
    }
  }, {
    key: "activeElement",
    value: function activeElement() {
      return classPrivateFieldGet_default()(this, _adsInstance) && classPrivateFieldGet_default()(this, _adsInstance).started() ? classPrivateFieldGet_default()(this, _adsInstance) : classPrivateFieldGet_default()(this, player_media);
    }
  }, {
    key: "isMedia",
    value: function isMedia() {
      return this.activeElement() instanceof src_media;
    }
  }, {
    key: "isAd",
    value: function isAd() {
      return this.activeElement() instanceof ads;
    }
  }, {
    key: "getMedia",
    value: function getMedia() {
      return classPrivateFieldGet_default()(this, player_media);
    }
  }, {
    key: "getAd",
    value: function getAd() {
      return classPrivateFieldGet_default()(this, _adsInstance);
    }
  }, {
    key: "addCaptions",
    value: function addCaptions(args) {
      if (args.default) {
        var tracks = classPrivateFieldGet_default()(this, player_element).querySelectorAll('track');

        for (var i = 0, total = tracks.length; i < total; i++) {
          tracks[i].default = false;
        }
      }

      var el = classPrivateFieldGet_default()(this, player_element);

      var track = el.querySelector("track[srclang=\"".concat(args.srclang, "\"][kind=\"").concat(args.kind, "\"]"));

      if (track) {
        track.src = args.src;
        track.label = args.label;
        track.default = args.default || false;
      } else {
        track = document.createElement('track');
        track.srclang = args.srclang;
        track.src = args.src;
        track.kind = args.kind;
        track.label = args.label;
        track.default = args.default || false;
        el.appendChild(track);
      }

      var e = addEvent('controlschanged');
      el.dispatchEvent(e);
    }
  }, {
    key: "addControl",
    value: function addControl(args) {
      args.custom = true;
      args.type = 'button';

      classPrivateFieldGet_default()(this, _customElements).push(args);

      var e = addEvent('controlschanged');

      classPrivateFieldGet_default()(this, player_element).dispatchEvent(e);
    }
  }, {
    key: "addElement",
    value: function addElement(args) {
      args.custom = true;

      classPrivateFieldGet_default()(this, _customElements).push(args);

      var e = addEvent('controlschanged');

      classPrivateFieldGet_default()(this, player_element).dispatchEvent(e);
    }
  }, {
    key: "removeControl",
    value: function removeControl(controlName) {
      var _this2 = this;

      classPrivateFieldGet_default()(this, _customElements).forEach(function (item, idx) {
        if (item.id === controlName) {
          classPrivateFieldGet_default()(_this2, _customElements).splice(idx, 1);
        }
      });

      var e = addEvent('controlschanged');

      classPrivateFieldGet_default()(this, player_element).dispatchEvent(e);
    }
  }, {
    key: "prepareMedia",
    value: function () {
      var _prepareMedia = asyncToGenerator_default()(regenerator_default().mark(function _callee4() {
        var _classPrivateFieldGet4, preload, adsOptions;

        return regenerator_default().wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.prev = 0;

                if ((_classPrivateFieldGet4 = classPrivateFieldGet_default()(this, player_options)) !== null && _classPrivateFieldGet4 !== void 0 && _classPrivateFieldGet4.onError) {
                  classPrivateFieldGet_default()(this, player_element).addEventListener('playererror', classPrivateFieldGet_default()(this, player_options).onError, EVENT_OPTIONS);
                }

                if (classPrivateFieldGet_default()(this, player_autoplay) && isVideo(classPrivateFieldGet_default()(this, player_element))) {
                  classPrivateFieldGet_default()(this, player_element).addEventListener('canplay', this._autoplay, EVENT_OPTIONS);
                }

                classPrivateFieldSet_default()(this, player_media, new src_media(classPrivateFieldGet_default()(this, player_element), classPrivateFieldGet_default()(this, player_options), classPrivateFieldGet_default()(this, player_autoplay), Player.customMedia));

                preload = classPrivateFieldGet_default()(this, player_element).getAttribute('preload');

                if (!(classPrivateFieldGet_default()(this, player_ads) || !preload || preload !== 'none')) {
                  _context4.next = 9;
                  break;
                }

                _context4.next = 8;
                return classPrivateFieldGet_default()(this, player_media).load();

              case 8:
                classPrivateFieldGet_default()(this, player_media).loaded = true;

              case 9:
                if (!classPrivateFieldGet_default()(this, player_autoplay) && classPrivateFieldGet_default()(this, player_ads)) {
                  adsOptions = classPrivateFieldGet_default()(this, player_options) && classPrivateFieldGet_default()(this, player_options).ads ? classPrivateFieldGet_default()(this, player_options).ads : undefined;

                  classPrivateFieldSet_default()(this, _adsInstance, new ads(this, classPrivateFieldGet_default()(this, player_ads), false, false, adsOptions));
                }

                _context4.next = 15;
                break;

              case 12:
                _context4.prev = 12;
                _context4.t0 = _context4["catch"](0);
                console.error(_context4.t0);

              case 15:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[0, 12]]);
      }));

      function prepareMedia() {
        return _prepareMedia.apply(this, arguments);
      }

      return prepareMedia;
    }()
  }, {
    key: "initialized",
    value: function initialized() {
      return classPrivateFieldGet_default()(this, _initialized);
    }
  }, {
    key: "loadAd",
    value: function () {
      var _loadAd = asyncToGenerator_default()(regenerator_default().mark(function _callee5(src) {
        var adsOptions, autoplay;
        return regenerator_default().wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                try {
                  if (this.isAd()) {
                    this.getAd().destroy();
                    this.getAd().src = src;
                    this.getAd().loadedAd = false;
                    this.getAd().load();
                  } else {
                    adsOptions = classPrivateFieldGet_default()(this, player_options) && classPrivateFieldGet_default()(this, player_options).ads ? classPrivateFieldGet_default()(this, player_options).ads : undefined;
                    autoplay = !this.activeElement().paused || classPrivateFieldGet_default()(this, _canAutoplay);

                    classPrivateFieldSet_default()(this, _adsInstance, new ads(this, src, autoplay, classPrivateFieldGet_default()(this, _canAutoplayMuted), adsOptions));
                  }
                } catch (err) {
                  console.error(err);
                }

              case 1:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function loadAd(_x) {
        return _loadAd.apply(this, arguments);
      }

      return loadAd;
    }()
  }, {
    key: "src",
    get: function get() {
      return classPrivateFieldGet_default()(this, player_media).src;
    },
    set: function set(media) {
      var _this3 = this;

      if (classPrivateFieldGet_default()(this, player_media) instanceof src_media) {
        classPrivateFieldGet_default()(this, player_media).mediaFiles = [];
        classPrivateFieldGet_default()(this, player_media).src = media;
      } else if (typeof media === 'string') {
        classPrivateFieldGet_default()(this, player_element).src = media;
      } else if (Array.isArray(media)) {
        media.forEach(function (m) {
          var source = document.createElement('source');
          source.src = m.src;
          source.type = m.type || predictMimeType(m.src, classPrivateFieldGet_default()(_this3, player_element));

          classPrivateFieldGet_default()(_this3, player_element).appendChild(source);
        });
      } else if (typeof_default()(media) === 'object') {
        classPrivateFieldGet_default()(this, player_element).src = media.src;
      }
    }
  }, {
    key: "id",
    get: function get() {
      return classPrivateFieldGet_default()(this, _uid);
    }
  }, {
    key: "_isValid",
    value: function _isValid() {
      var el = classPrivateFieldGet_default()(this, player_element);

      if (el instanceof HTMLElement === false) {
        return false;
      }

      if (!isAudio(el) && !isVideo(el)) {
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
      wrapper.className += isAudio(classPrivateFieldGet_default()(this, player_element)) ? ' op-player__audio' : ' op-player__video';
      wrapper.tabIndex = 0;

      classPrivateFieldGet_default()(this, player_element).classList.remove('op-player');

      if (classPrivateFieldGet_default()(this, player_element).parentElement) {
        classPrivateFieldGet_default()(this, player_element).parentElement.insertBefore(wrapper, classPrivateFieldGet_default()(this, player_element));
      }

      wrapper.appendChild(classPrivateFieldGet_default()(this, player_element));
      var messageContainer = document.createElement('div');
      messageContainer.className = 'op-status';
      messageContainer.innerHTML = '<span></span>';
      messageContainer.tabIndex = -1;
      messageContainer.setAttribute('aria-hidden', 'true');

      if (isVideo(classPrivateFieldGet_default()(this, player_element)) && classPrivateFieldGet_default()(this, player_element).parentElement) {
        classPrivateFieldGet_default()(this, player_element).parentElement.insertBefore(messageContainer, classPrivateFieldGet_default()(this, player_element));
      }

      wrapper.addEventListener('keydown', function () {
        if (wrapper.classList.contains('op-player__keyboard--inactive')) {
          wrapper.classList.remove('op-player__keyboard--inactive');
        }
      }, EVENT_OPTIONS);
      wrapper.addEventListener('click', function () {
        if (!wrapper.classList.contains('op-player__keyboard--inactive')) {
          wrapper.classList.add('op-player__keyboard--inactive');
        }
      }, EVENT_OPTIONS);

      if (classPrivateFieldGet_default()(this, player_options).mode === 'fill' && !isAudio(classPrivateFieldGet_default()(this, player_element)) && !IS_IPHONE) {
        this.getContainer().classList.add('op-player__full');
      } else if (classPrivateFieldGet_default()(this, player_options).mode === 'fit' && !isAudio(classPrivateFieldGet_default()(this, player_element))) {
        var container = this.getContainer();

        if (container.parentElement) {
          var fitWrapper = document.createElement('div');
          fitWrapper.className = 'op-player__fit--wrapper';
          fitWrapper.tabIndex = 0;
          container.parentElement.insertBefore(fitWrapper, container);
          fitWrapper.appendChild(container);
          container.classList.add('op-player__fit');
        }
      } else {
        this._setDimensions(wrapper);
      }
    }
  }, {
    key: "_setDimensions",
    value: function _setDimensions(element) {
      var style = '';

      if (classPrivateFieldGet_default()(this, player_options).width) {
        var width = typeof classPrivateFieldGet_default()(this, player_options).width === 'number' ? "".concat(classPrivateFieldGet_default()(this, player_options).width, "px") : classPrivateFieldGet_default()(this, player_options).width;
        style += "width: ".concat(width, " !important;");
      }

      if (classPrivateFieldGet_default()(this, player_options).height) {
        var height = typeof classPrivateFieldGet_default()(this, player_options).height === 'number' ? "".concat(classPrivateFieldGet_default()(this, player_options).height, "px") : classPrivateFieldGet_default()(this, player_options).height;
        style += "height: ".concat(height, " !important;");
      }

      if (style) {
        element.setAttribute('style', style);
      }
    }
  }, {
    key: "_createControls",
    value: function _createControls() {
      if (IS_IPHONE && isVideo(classPrivateFieldGet_default()(this, player_element))) {
        this.getContainer().classList.add('op-player__ios--iphone');
      }

      classPrivateFieldSet_default()(this, player_controls, new controls(this));

      classPrivateFieldGet_default()(this, player_controls).create();
    }
  }, {
    key: "_createUID",
    value: function _createUID() {
      if (classPrivateFieldGet_default()(this, player_element).id) {
        classPrivateFieldSet_default()(this, _uid, classPrivateFieldGet_default()(this, player_element).id);

        classPrivateFieldGet_default()(this, player_element).removeAttribute('id');
      } else {
        var cryptoLib = crypto;
        var encryption = typeof cryptoLib.getRandomBytes === 'function' ? cryptoLib.getRandomBytes : cryptoLib.getRandomValues;

        classPrivateFieldSet_default()(this, _uid, "op_".concat(encryption(new Uint32Array(1))[0].toString(36).substr(2, 9)));
      }

      if (classPrivateFieldGet_default()(this, player_element).parentElement) {
        classPrivateFieldGet_default()(this, player_element).parentElement.id = classPrivateFieldGet_default()(this, _uid);
      }
    }
  }, {
    key: "_createPlayButton",
    value: function _createPlayButton() {
      var _classPrivateFieldGet5,
          _classPrivateFieldGet6,
          _this4 = this;

      if (isAudio(classPrivateFieldGet_default()(this, player_element))) {
        return;
      }

      this.playBtn = document.createElement('button');
      this.playBtn.className = 'op-player__play';
      this.playBtn.tabIndex = 0;
      this.playBtn.title = ((_classPrivateFieldGet5 = classPrivateFieldGet_default()(this, player_options).labels) === null || _classPrivateFieldGet5 === void 0 ? void 0 : _classPrivateFieldGet5.play) || '';
      this.playBtn.innerHTML = "<span>".concat(((_classPrivateFieldGet6 = classPrivateFieldGet_default()(this, player_options).labels) === null || _classPrivateFieldGet6 === void 0 ? void 0 : _classPrivateFieldGet6.play) || '', "</span>");
      this.playBtn.setAttribute('aria-pressed', 'false');
      this.playBtn.setAttribute('aria-hidden', 'false');
      this.loader = document.createElement('span');
      this.loader.className = 'op-player__loader';
      this.loader.tabIndex = -1;
      this.loader.setAttribute('aria-hidden', 'true');

      if (classPrivateFieldGet_default()(this, player_element).parentElement) {
        classPrivateFieldGet_default()(this, player_element).parentElement.insertBefore(this.loader, classPrivateFieldGet_default()(this, player_element));

        classPrivateFieldGet_default()(this, player_element).parentElement.insertBefore(this.playBtn, classPrivateFieldGet_default()(this, player_element));
      }

      this.playBtn.addEventListener('click', function () {
        if (classPrivateFieldGet_default()(_this4, _adsInstance)) {
          classPrivateFieldGet_default()(_this4, _adsInstance).playRequested = _this4.activeElement().paused;
        }

        if (_this4.activeElement().paused) {
          _this4.activeElement().play();
        } else {
          _this4.activeElement().pause();
        }
      }, EVENT_OPTIONS);
    }
  }, {
    key: "_setEvents",
    value: function _setEvents() {
      var _this5 = this;

      if (isVideo(classPrivateFieldGet_default()(this, player_element))) {
        classPrivateFieldGet_default()(this, player_events).loadedmetadata = function () {
          var el = _this5.activeElement();

          if (classPrivateFieldGet_default()(_this5, player_options).showLoaderOnInit && !IS_IOS && !IS_ANDROID) {
            _this5.loader.setAttribute('aria-hidden', 'false');

            _this5.playBtn.setAttribute('aria-hidden', 'true');
          } else {
            _this5.loader.setAttribute('aria-hidden', 'true');

            _this5.playBtn.setAttribute('aria-hidden', 'false');
          }

          if (el.paused) {
            _this5.playBtn.classList.remove('op-player__play--paused');

            _this5.playBtn.setAttribute('aria-pressed', 'false');
          }
        };

        classPrivateFieldGet_default()(this, player_events).waiting = function () {
          _this5.playBtn.setAttribute('aria-hidden', 'true');

          _this5.loader.setAttribute('aria-hidden', 'false');
        };

        classPrivateFieldGet_default()(this, player_events).seeking = function () {
          var el = _this5.activeElement();

          _this5.playBtn.setAttribute('aria-hidden', 'true');

          _this5.loader.setAttribute('aria-hidden', el instanceof src_media ? 'false' : 'true');
        };

        classPrivateFieldGet_default()(this, player_events).seeked = function () {
          var el = _this5.activeElement();

          if (Math.round(el.currentTime) === 0) {
            _this5.playBtn.setAttribute('aria-hidden', 'true');

            _this5.loader.setAttribute('aria-hidden', 'false');
          } else {
            _this5.playBtn.setAttribute('aria-hidden', el instanceof src_media ? 'false' : 'true');

            _this5.loader.setAttribute('aria-hidden', 'true');
          }
        };

        classPrivateFieldGet_default()(this, player_events).play = function () {
          var _classPrivateFieldGet7;

          _this5.playBtn.classList.add('op-player__play--paused');

          _this5.playBtn.title = ((_classPrivateFieldGet7 = classPrivateFieldGet_default()(_this5, player_options).labels) === null || _classPrivateFieldGet7 === void 0 ? void 0 : _classPrivateFieldGet7.pause) || '';

          _this5.loader.setAttribute('aria-hidden', 'true');

          if (classPrivateFieldGet_default()(_this5, player_options).showLoaderOnInit) {
            _this5.playBtn.setAttribute('aria-hidden', 'true');
          } else {
            setTimeout(function () {
              _this5.playBtn.setAttribute('aria-hidden', 'true');
            }, classPrivateFieldGet_default()(_this5, player_options).hidePlayBtnTimer);
          }
        };

        classPrivateFieldGet_default()(this, player_events).playing = function () {
          _this5.loader.setAttribute('aria-hidden', 'true');

          _this5.playBtn.setAttribute('aria-hidden', 'true');
        };

        classPrivateFieldGet_default()(this, player_events).pause = function () {
          var _classPrivateFieldGet8;

          var el = _this5.activeElement();

          _this5.playBtn.classList.remove('op-player__play--paused');

          _this5.playBtn.title = ((_classPrivateFieldGet8 = classPrivateFieldGet_default()(_this5, player_options).labels) === null || _classPrivateFieldGet8 === void 0 ? void 0 : _classPrivateFieldGet8.play) || '';

          if (classPrivateFieldGet_default()(_this5, player_options).showLoaderOnInit && Math.round(el.currentTime) === 0) {
            _this5.playBtn.setAttribute('aria-hidden', 'true');

            _this5.loader.setAttribute('aria-hidden', 'false');
          } else {
            _this5.playBtn.setAttribute('aria-hidden', 'false');

            _this5.loader.setAttribute('aria-hidden', 'true');
          }
        };

        classPrivateFieldGet_default()(this, player_events).ended = function () {
          _this5.loader.setAttribute('aria-hidden', 'true');

          _this5.playBtn.setAttribute('aria-hidden', 'true');
        };
      }

      Object.keys(classPrivateFieldGet_default()(this, player_events)).forEach(function (event) {
        classPrivateFieldGet_default()(_this5, player_element).addEventListener(event, classPrivateFieldGet_default()(_this5, player_events)[event], EVENT_OPTIONS);
      });
      this.getContainer().addEventListener('keydown', this._enableKeyBindings, EVENT_OPTIONS);
    }
  }, {
    key: "_autoplay",
    value: function _autoplay() {
      var _this6 = this;

      if (!classPrivateFieldGet_default()(this, _processedAutoplay)) {
        classPrivateFieldSet_default()(this, _processedAutoplay, true);

        classPrivateFieldGet_default()(this, player_element).removeEventListener('canplay', this._autoplay);

        isAutoplaySupported(classPrivateFieldGet_default()(this, player_element), classPrivateFieldGet_default()(this, player_volume), function (autoplay) {
          classPrivateFieldSet_default()(_this6, _canAutoplay, autoplay);
        }, function (muted) {
          classPrivateFieldSet_default()(_this6, _canAutoplayMuted, muted);
        }, function () {
          if (classPrivateFieldGet_default()(_this6, _canAutoplayMuted)) {
            var _classPrivateFieldGet9, _classPrivateFieldGet10;

            _this6.activeElement().muted = true;
            _this6.activeElement().volume = 0;
            var e = addEvent('volumechange');

            classPrivateFieldGet_default()(_this6, player_element).dispatchEvent(e);

            var volumeEl = document.createElement('div');
            var action = IS_IOS || IS_ANDROID ? (_classPrivateFieldGet9 = classPrivateFieldGet_default()(_this6, player_options).labels) === null || _classPrivateFieldGet9 === void 0 ? void 0 : _classPrivateFieldGet9.tap : (_classPrivateFieldGet10 = classPrivateFieldGet_default()(_this6, player_options).labels) === null || _classPrivateFieldGet10 === void 0 ? void 0 : _classPrivateFieldGet10.click;
            volumeEl.className = 'op-player__unmute';
            volumeEl.innerHTML = "<span>".concat(action, "</span>");
            volumeEl.tabIndex = 0;
            volumeEl.addEventListener('click', function () {
              _this6.activeElement().muted = false;
              _this6.activeElement().volume = classPrivateFieldGet_default()(_this6, player_volume);
              var event = addEvent('volumechange');

              classPrivateFieldGet_default()(_this6, player_element).dispatchEvent(event);

              volumeEl.remove();
            }, EVENT_OPTIONS);

            var target = _this6.getContainer();

            target.insertBefore(volumeEl, target.firstChild);
          } else {
            _this6.activeElement().muted = classPrivateFieldGet_default()(_this6, player_element).muted;
            _this6.activeElement().volume = classPrivateFieldGet_default()(_this6, player_volume);
          }

          if (classPrivateFieldGet_default()(_this6, player_ads)) {
            var adsOptions = classPrivateFieldGet_default()(_this6, player_options) && classPrivateFieldGet_default()(_this6, player_options).ads ? classPrivateFieldGet_default()(_this6, player_options).ads : undefined;

            classPrivateFieldSet_default()(_this6, _adsInstance, new ads(_this6, classPrivateFieldGet_default()(_this6, player_ads), classPrivateFieldGet_default()(_this6, _canAutoplay), classPrivateFieldGet_default()(_this6, _canAutoplayMuted), adsOptions));
          } else if (classPrivateFieldGet_default()(_this6, _canAutoplay) || classPrivateFieldGet_default()(_this6, _canAutoplayMuted)) {
            _this6.play();
          }
        });
      }
    }
  }, {
    key: "_mergeOptions",
    value: function _mergeOptions(playerOptions) {
      var _this7 = this;

      var opts = player_objectSpread({}, playerOptions || {});

      classPrivateFieldSet_default()(this, player_options, player_objectSpread(player_objectSpread({}, classPrivateFieldGet_default()(this, _defaultOptions)), opts));

      var complexOptions = Object.keys(classPrivateFieldGet_default()(this, _defaultOptions)).filter(function (key) {
        return key !== 'labels' && typeof_default()(classPrivateFieldGet_default()(_this7, _defaultOptions)[key]) === 'object';
      });
      complexOptions.forEach(function (key) {
        var currOption = opts[key] || {};

        if (currOption && Object.keys(currOption).length) {
          classPrivateFieldGet_default()(_this7, player_options)[key] = player_objectSpread(player_objectSpread({}, classPrivateFieldGet_default()(_this7, _defaultOptions)[key]), currOption);
        }
      });

      if (opts.labels) {
        var keys = opts.labels ? Object.keys(opts.labels) : [];
        var sanitizedLabels = {};
        keys.forEach(function (key) {
          var current = opts.labels ? opts.labels[key] : null;

          if (current && typeof_default()(current) === 'object' && key === 'lang') {
            Object.keys(current).forEach(function (k) {
              var lang = current ? current[k] : null;

              if (lang) {
                sanitizedLabels = player_objectSpread(player_objectSpread({}, sanitizedLabels), {}, {
                  lang: player_objectSpread(player_objectSpread({}, sanitizedLabels.lang), {}, defineProperty_default()({}, k, sanitize(lang)))
                });
              }
            });
          } else if (current) {
            sanitizedLabels = player_objectSpread(player_objectSpread({}, sanitizedLabels), {}, defineProperty_default()({}, key, sanitize(current)));
          }
        });
        classPrivateFieldGet_default()(this, player_options).labels = player_objectSpread(player_objectSpread({}, classPrivateFieldGet_default()(this, _defaultOptions).labels), sanitizedLabels);
      }
    }
  }, {
    key: "_enableKeyBindings",
    value: function _enableKeyBindings(e) {
      var _document, _document$activeEleme;

      var key = e.which || e.keyCode || 0;
      var el = this.activeElement();
      var isAd = this.isAd();
      var playerFocused = (_document = document) === null || _document === void 0 ? void 0 : (_document$activeEleme = _document.activeElement) === null || _document$activeEleme === void 0 ? void 0 : _document$activeEleme.classList.contains('op-player');

      switch (key) {
        case 13:
        case 32:
        case 75:
          if (playerFocused && (key === 13 || key === 32)) {
            if (el.paused) {
              el.play();
            } else {
              el.pause();
            }
          } else if (key === 75) {
            if (el.paused) {
              el.play();
            } else {
              el.pause();
            }
          }

          e.preventDefault();
          e.stopPropagation();
          break;

        case 35:
          if (!isAd && el.duration !== Infinity) {
            el.currentTime = el.duration;
            e.preventDefault();
            e.stopPropagation();
          }

          break;

        case 36:
          if (!isAd) {
            el.currentTime = 0;
            e.preventDefault();
            e.stopPropagation();
          }

          break;

        case 37:
        case 39:
        case 74:
        case 76:
          if (!isAd && el.duration !== Infinity) {
            var _this$getOptions$prog;

            var newStep = 5;
            var configStep = this.getOptions().step;

            if (configStep) {
              newStep = key === 74 || key === 76 ? configStep * 2 : configStep;
            } else if (key === 74 || key === 76) {
              newStep = 10;
            }

            var step = el.duration !== Infinity ? newStep : ((_this$getOptions$prog = this.getOptions().progress) === null || _this$getOptions$prog === void 0 ? void 0 : _this$getOptions$prog.duration) || 0;
            el.currentTime += key === 37 || key === 74 ? step * -1 : step;

            if (el.currentTime < 0) {
              el.currentTime = 0;
            } else if (el.currentTime >= el.duration) {
              el.currentTime = el.duration;
            }

            e.preventDefault();
            e.stopPropagation();
          }

          break;

        case 38:
        case 40:
          var newVol = key === 38 ? Math.min(el.volume + 0.1, 1) : Math.max(el.volume - 0.1, 0);
          el.volume = newVol;
          el.muted = !(newVol > 0);
          e.preventDefault();
          e.stopPropagation();
          break;

        case 70:
          if (isVideo(classPrivateFieldGet_default()(this, player_element)) && !e.ctrlKey) {
            classPrivateFieldSet_default()(this, _fullscreen, new fullscreen(this, '', ''));

            if (typeof classPrivateFieldGet_default()(this, _fullscreen).fullScreenEnabled !== 'undefined') {
              classPrivateFieldGet_default()(this, _fullscreen).toggleFullscreen();

              e.preventDefault();
              e.stopPropagation();
            }
          }

          break;

        case 77:
          el.muted = !el.muted;

          if (el.muted) {
            el.volume = 0;
          } else {
            el.volume = classPrivateFieldGet_default()(this, player_volume);
          }

          e.preventDefault();
          e.stopPropagation();
          break;

        case 188:
        case 190:
          if (!isAd && e.shiftKey) {
            var elem = el;
            elem.playbackRate = key === 188 ? Math.max(elem.playbackRate - 0.25, 0.25) : Math.min(elem.playbackRate + 0.25, 2);
            var target = this.getContainer().querySelector('.op-status>span');

            if (target) {
              target.textContent = "".concat(elem.playbackRate, "x");

              if (target.parentElement) {
                target.parentElement.setAttribute('aria-hidden', 'false');
              }

              setTimeout(function () {
                if (target.parentElement) {
                  target.parentElement.setAttribute('aria-hidden', 'true');
                }
              }, 500);
            }

            var ev = addEvent('controlschanged');
            dispatchEvent(ev);
            e.preventDefault();
            e.stopPropagation();
          } else if (!isAd && el.paused) {
            el.currentTime += 1 / 25 * (key === 188 ? -1 : 1);
            e.preventDefault();
            e.stopPropagation();
          }

          break;

        default:
          break;
      }
    }
  }], [{
    key: "init",
    value: function init() {
      Player.instances = {};
      var targets = document.querySelectorAll('video.op-player, audio.op-player');

      for (var i = 0, total = targets.length; i < total; i++) {
        var target = targets[i];
        var settings = target.getAttribute('data-op-settings');
        var options = settings ? JSON.parse(settings) : {};
        var player = new Player(target, options);
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

defineProperty_default()(Player, "instances", {});

defineProperty_default()(Player, "customMedia", {
  media: {},
  optionsKey: {},
  rules: []
});

/* harmony default export */ const player = (Player);

if (typeof window !== 'undefined') {
  window.OpenPlayer = Player;
  window.OpenPlayerJS = Player;
  Player.init();
}
})();

// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
// extracted by mini-css-extract-plugin

})();

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});