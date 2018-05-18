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
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
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
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
function getAbsoluteUrl(url) {
    var a = void 0;
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
    var type = void 0;
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
    var accept = type !== 'application/x-www-form-urlencoded' ? type + ", */*; q=0.01" : '*/'.concat('*');
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
                    var data = void 0;
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
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
function addEvent(event, details) {
    if (typeof event !== 'string') {
        throw new Error('Event name must be a string');
    }
    return new CustomEvent(event, details);
}
exports.addEvent = addEvent;
exports.events = ['loadstart', 'durationchange', 'loadedmetadata', 'loadeddata', 'progress', 'canplay', 'canplaythrough', 'suspend', 'abort', 'error', 'emptied', 'stalled', 'play', 'playing', 'pause', 'waiting', 'seeking', 'seeked', 'timeupdate', 'ended', 'ratechange', 'volumechange'];

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
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
    return (/\.m3u8/i.test(url)
    );
}
exports.isHlsSource = isHlsSource;
function isDashSource(url) {
    return (/\.mpd/i.test(url)
    );
}
exports.isDashSource = isDashSource;
function predictType(url) {
    var extension = getExtension(url);
    var type = void 0;
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
    videoContent.src = 'http://techslides.com/demos/sample-videos/small.mp4';
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
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
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
exports.SUPPORTS_NATIVE_HLS = exports.IS_SAFARI || exports.IS_ANDROID && (exports.IS_CHROME || exports.IS_STOCK_ANDROID) || exports.IS_IE && /edge/i.test(exports.UA);

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });

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
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
function formatTime(seconds, frameRate) {
    var f = Math.floor(seconds % 1 * (frameRate || 0));
    var s = Math.floor(seconds);
    var m = Math.floor(s / 60);
    var h = Math.floor(m / 60);
    var wrap = function wrap(value) {
        return value < 10 ? "0" + value : value;
    };
    m = m % 60;
    s = s % 60;
    return "" + (h > 0 ? wrap(h) + ":" : '') + wrap(m) + ":" + wrap(s) + (f ? ":" + wrap(f) : '');
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
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var controls_1 = __webpack_require__(20);
var media_1 = __webpack_require__(12);
var ads_1 = __webpack_require__(8);
var constants_1 = __webpack_require__(3);
var events_1 = __webpack_require__(1);
var general_1 = __webpack_require__(0);
var media_2 = __webpack_require__(2);
var polyfill_1 = __webpack_require__(7);

var Player = function () {
    function Player(element, adsUrl, fill) {
        _classCallCheck(this, Player);

        this.events = {};
        this.element = element instanceof HTMLMediaElement ? element : document.getElementById(element);
        if (this.element) {
            this.adsUrl = adsUrl;
            this.fill = fill;
            this.autoplay = this.element.autoplay;
            this.volume = this.element.volume;
            this.width = this.element.offsetWidth;
            this.height = this.element.offsetHeight;
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
            if (this.ads) {
                this.ads.play();
            } else {
                this.media.play();
            }
        }
    }, {
        key: "pause",
        value: function pause() {
            if (this.ads) {
                this.ads.pause();
            } else {
                this.media.pause();
            }
        }
    }, {
        key: "destroy",
        value: function destroy() {
            var _this = this;

            if (this.ads) {
                this.ads.pause();
                this.ads.destroy();
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
            var parent = el.parentElement;
            parent.parentNode.replaceChild(el, parent);
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
        key: "activeElement",
        value: function activeElement() {
            return this.ads && this.ads.adsStarted ? this.ads : this.media;
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
            return this.ads;
        }
    }, {
        key: "addCaptions",
        value: function addCaptions(args) {
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
            if (!el.classList.contains('om-player__media')) {
                return false;
            }
            return true;
        }
    }, {
        key: "_wrapInstance",
        value: function _wrapInstance() {
            var wrapper = document.createElement('div');
            wrapper.className = 'om-player om-player__keyboard--inactive';
            wrapper.className += general_1.isAudio(this.element) ? ' om-player__audio' : ' om-player__video';
            wrapper.tabIndex = 0;
            this.element.classList.remove('om-player');
            this.element.parentElement.insertBefore(wrapper, this.element);
            wrapper.appendChild(this.element);
            wrapper.addEventListener('keydown', function () {
                if (wrapper.classList.contains('om-player__keyboard--inactive')) {
                    wrapper.classList.remove('om-player__keyboard--inactive');
                }
            });
            wrapper.addEventListener('click', function () {
                if (!wrapper.classList.contains('om-player__keyboard--inactive')) {
                    wrapper.classList.add('om-player__keyboard--inactive');
                }
            });
            if (this.fill) {
                this._fill();
                window.addEventListener('resize', this._fill.bind(this));
            }
        }
    }, {
        key: "_createControls",
        value: function _createControls() {
            this.controls = new controls_1.default(this);
            this.controls.create();
        }
    }, {
        key: "_prepareMedia",
        value: function _prepareMedia() {
            try {
                this.media = new media_1.default(this.element);
                this.media.load();
                if (this.adsUrl) {
                    this.ads = new ads_1.default(this.media, this.adsUrl);
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
                var uid = void 0;
                do {
                    uid = "om_" + Math.random().toString(36).substr(2, 9);
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
            this.playBtn.className = 'om-player__play';
            this.playBtn.tabIndex = 0;
            this.playBtn.setAttribute('aria-pressed', 'false');
            this.playBtn.setAttribute('aria-hidden', 'false');
            this.loader = document.createElement('span');
            this.loader.className = 'om-player__loader';
            this.loader.tabIndex = -1;
            this.loader.setAttribute('aria-hidden', 'true');
            this.element.parentElement.insertBefore(this.loader, this.element);
            this.element.parentElement.insertBefore(this.playBtn, this.element);
            this.playBtn.addEventListener('click', function () {
                _this2.media.play();
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
                        _this3.playBtn.classList.remove('om-player__play--paused');
                        _this3.playBtn.setAttribute('aria-pressed', 'false');
                        _this3.playBtn.setAttribute('aria-hidden', el instanceof media_1.default ? 'false' : 'true');
                    }
                };
                this.events.waiting = function () {
                    var el = _this3.activeElement();
                    _this3.playBtn.setAttribute('aria-hidden', 'true');
                    _this3.loader.setAttribute('aria-hidden', el instanceof media_1.default ? 'false' : 'true');
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
                    _this3.playBtn.classList.add('om-player__play--paused');
                    setTimeout(function () {
                        _this3.playBtn.setAttribute('aria-hidden', 'true');
                        _this3.loader.setAttribute('aria-hidden', 'true');
                    }, 350);
                };
                this.events.pause = function () {
                    _this3.playBtn.classList.remove('om-player__play--paused');
                    _this3.loader.setAttribute('aria-hidden', 'true');
                    var el = _this3.activeElement();
                    _this3.playBtn.setAttribute('aria-hidden', el instanceof media_1.default ? 'false' : 'true');
                };
            }
            this.events.keydown = function (e) {
                var el = _this3.activeElement();
                var isAd = el instanceof ads_1.default;
                if (el instanceof media_1.default) {
                    _this3.playBtn.setAttribute('aria-hidden', 'false');
                }
                var key = e.which || e.keyCode || 0;
                var step = el.duration * 0.05;
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
            };
            Object.keys(this.events).forEach(function (event) {
                _this3.element.addEventListener(event, _this3.events[event]);
            });
        }
    }, {
        key: "_autoplay",
        value: function _autoplay() {
            var _this4 = this;

            if (this.autoplay || this.ads) {
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
                        var action = constants_1.IS_IOS || constants_1.IS_ANDROID ? 'Tap' : 'Click';
                        volumeEl.className = 'om-player__unmute';
                        volumeEl.innerHTML = "<span>" + action + " to unmute</span>";
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
                    if (!_this4.ads && (_this4.canAutoplay || _this4.canAutoplayMuted)) {
                        _this4.play();
                    }
                });
            }
        }
    }, {
        key: "_fill",
        value: function _fill() {
            var _this5 = this;

            if (general_1.isAudio(this.element)) {
                return;
            }
            var isVisible = function isVisible(element) {
                if (element.getClientRects !== undefined && typeof element.getClientRects === 'function') {
                    return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
                }
                return !!(element.offsetWidth || element.offsetHeight);
            };
            var parent = function () {
                var parentEl = void 0;
                var el = _this5.getContainer();
                while (el) {
                    try {
                        if (constants_1.IS_FIREFOX && el.tagName.toLowerCase() === 'html' && window.self !== window.top && window.frameElement !== null) {
                            return window.frameElement;
                        } else {
                            parentEl = el.parentElement;
                        }
                    } catch (e) {
                        parentEl = el.parentElement;
                    }
                    if (parentEl && isVisible(parentEl)) {
                        return parentEl;
                    }
                    el = parentEl;
                }
                return null;
            }();
            var height = parent.offsetHeight;
            var width = parent.offsetWidth;
            var viewportRatio = width / height;
            var videoRatio = this.width / this.height;
            var scale = 1;
            if (videoRatio < viewportRatio) {
                scale = viewportRatio / videoRatio;
            } else if (viewportRatio < videoRatio) {
                scale = videoRatio / viewportRatio;
            }
            var transform = "translate(0, 0) scale(" + scale + ")";
            this.element.style.transform = transform;
            this.element.style.webkitTransform = transform;
            if (this.isAd()) {
                this.getAd().resizeAds(width, height, transform);
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
            var targets = document.querySelectorAll('video.om-player, audio.om-player');
            for (var i = 0, total = targets.length; i < total; i++) {
                var target = targets[i];
                var player = new Player(target, target.getAttribute('data-om-ads'), !!target.getAttribute('data-om-fill'));
                player.init();
            }
        }
    }]);

    return Player;
}();

Player.instances = {};
exports.default = Player;
window.OpenPlayer = Player;
polyfill_1.default.check(function () {
    return Player.init();
});

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });

var Polyfill = function () {
    function Polyfill() {
        _classCallCheck(this, Polyfill);
    }

    _createClass(Polyfill, null, [{
        key: "check",
        value: function check(callback) {
            var features = [];
            var map = {
                CustomEvent: {
                    conditional: window.CustomEvent !== 'function',
                    key: 'window'
                },
                Promise: {
                    conditional: !window.Promise,
                    key: 'window'
                },
                closest: {
                    conditional: !Element.prototype.closest,
                    key: 'Element.prototype'
                },
                find: {
                    conditional: !Array.prototype.find,
                    key: 'Array.prototype'
                },
                from: {
                    conditional: !Array.from,
                    key: 'Array'
                },
                remove: {
                    conditional: !Element.prototype.remove,
                    key: 'Element.prototype'
                }
            };
            Object.keys(map).forEach(function (method) {
                if (map[method].conditional) {
                    features.push("" + (map[method].key !== 'window' ? map[method].key + "." : '') + method);
                }
            });
            if (features.length) {
                var f = features.join(',');
                var s = document.createElement('script');
                s.src = "https://cdn.polyfill.io/v2/polyfill.min.js?features=" + f + "&flags=gated,always&callback=main";
                s.addEventListener('load', callback);
                document.head.appendChild(s);
            } else {
                callback();
            }
        }
    }]);

    return Polyfill;
}();

exports.default = Polyfill;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = __webpack_require__(3);
var events_1 = __webpack_require__(1);
var general_1 = __webpack_require__(0);
var media_1 = __webpack_require__(2);

var Ads = function () {
    function Ads(media, adsUrl) {
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
        this.adsUrl = adsUrl;
        this.media = media;
        this.element = media.element;
        var originalVolume = this.element.volume;
        this.adsVolume = constants_1.IS_IOS ? 0 : originalVolume;
        this.adsMuted = constants_1.IS_IOS ? true : this.adsMuted;
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
                var action = constants_1.IS_IOS || constants_1.IS_ANDROID ? 'Tap' : 'Click';
                volumeEl.className = 'om-player__unmute';
                volumeEl.innerHTML = "<span>" + action + " to unmute</span>";
                volumeEl.addEventListener('click', function () {
                    _this.adsMuted = false;
                    _this.media.muted = false;
                    _this.adsVolume = originalVolume;
                    _this.media.volume = originalVolume;
                    var event = events_1.addEvent('volumechange');
                    _this.element.dispatchEvent(event);
                    volumeEl.remove();
                });
                var target = _this.element.parentElement;
                target.insertBefore(volumeEl, target.firstChild);
            }
            _this.promise = typeof google === 'undefined' || typeof google.ima === 'undefined' ? general_1.loadScript('https://imasdk.googleapis.com/js/sdkloader/ima3.js') : new Promise(function (resolve) {
                resolve();
            });
            _this.promise.then(_this.load.bind(_this));
        });
        return this;
    }

    _createClass(Ads, [{
        key: "load",
        value: function load() {
            this.adsContainer = document.createElement('div');
            this.adsContainer.id = 'om-ads';
            this.adsContainer.tabIndex = -1;
            this.element.parentElement.insertBefore(this.adsContainer, this.element.nextSibling);
            window.addEventListener('resize', this.resizeAds.bind(this));
            this._setup();
            this._requestAds();
        }
    }, {
        key: "play",
        value: function play() {
            if (!this.adsDone) {
                this.adsDone = true;
                this.adDisplayContainer.initialize();
                this._playAds();
            } else if (this.adsManager) {
                this.adsActive = true;
                this.adsManager.resume();
                var e = events_1.addEvent('play');
                this.element.dispatchEvent(e);
                var event = events_1.addEvent('playing');
                this.element.dispatchEvent(event);
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

            this.events.forEach(function (event) {
                _this2.adsManager.removeEventListener(event, _this2._assign.bind(_this2));
            });
            this.events = [];
            this.adsLoader.removeEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._error.bind(this));
            this.adsLoader.removeEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, this._loaded.bind(this));
            if (this.adsManager) {
                this.adsManager.destroy();
            }
            this.element.removeEventListener('ended', this._contentEndedListener.bind(this));
            window.removeEventListener('resize', this.resizeAds.bind(this));
            this.adsContainer.remove();
        }
    }, {
        key: "resizeAds",
        value: function resizeAds(width, height, transform) {
            if (this.adsManager) {
                var target = this.element;
                if (width && height) {
                    var mode = target.getAttribute('data-fullscreen') === 'true' ? google.ima.ViewMode.FULLSCREEN : google.ima.ViewMode.NORMAL;
                    this.adsManager.resize(width, height, mode);
                } else {
                    this.adsManager.resize(target.offsetWidth, target.offsetHeight, google.ima.ViewMode.NORMAL);
                }
                if (transform) {
                    this.adsContainer.style.transform = transform;
                    this.adsContainer.style.webkitTransform = transform;
                }
            }
        }
    }, {
        key: "_assign",
        value: function _assign(event) {
            var _this3 = this;

            var ad = event.getAd();
            switch (event.type) {
                case google.ima.AdEvent.Type.LOADED:
                    if (!ad.isLinear()) {
                        this._onContentResumeRequested();
                    } else {
                        if (!this.media.paused) {
                            this.media.pause();
                        }
                        this.element.parentElement.classList.add('om-ads--active');
                        this.adsDuration = ad.getDuration();
                        this.adsCurrentTime = ad.getDuration();
                        var loadedEvent = events_1.addEvent('loadedmetadata');
                        this.element.dispatchEvent(loadedEvent);
                        var resizeEvent = events_1.addEvent('resize');
                        window.dispatchEvent(resizeEvent);
                    }
                    break;
                case google.ima.AdEvent.Type.STARTED:
                    if (ad.isLinear()) {
                        this.adsActive = true;
                        var playEvent = events_1.addEvent('play');
                        this.element.dispatchEvent(playEvent);
                        if (this.media.ended) {
                            this.adsEnded = false;
                            var endEvent = events_1.addEvent('adsended');
                            this.element.dispatchEvent(endEvent);
                        }
                        this.intervalTimer = window.setInterval(function () {
                            if (_this3.adsActive === true) {
                                _this3.adsCurrentTime = Math.round(_this3.adsManager.getRemainingTime());
                                var timeEvent = events_1.addEvent('timeupdate');
                                _this3.element.dispatchEvent(timeEvent);
                            }
                        }, 250);
                    }
                    break;
                case google.ima.AdEvent.Type.COMPLETE:
                case google.ima.AdEvent.Type.SKIPPED:
                    if (ad.isLinear()) {
                        this.element.parentElement.classList.remove('om-ads--active');
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
                        this.element.parentElement.classList.remove('om-ads--active');
                    }
                    break;
            }
        }
    }, {
        key: "_error",
        value: function _error(event) {
            console.error("Ad error: " + event.getError().toString());
            if (this.adsManager) {
                this.adsManager.destroy();
            }
            this._resumeMedia();
        }
    }, {
        key: "_loaded",
        value: function _loaded(adsManagerLoadedEvent) {
            var adsRenderingSettings = new google.ima.AdsRenderingSettings();
            adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
            this.adsManager = adsManagerLoadedEvent.getAdsManager(this.element, adsRenderingSettings);
            this._start(this.adsManager);
        }
    }, {
        key: "_start",
        value: function _start(manager) {
            var _this4 = this;

            manager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._error.bind(this));
            manager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, this._onContentPauseRequested.bind(this));
            manager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, this._onContentResumeRequested.bind(this));
            this.events = [google.ima.AdEvent.Type.ALL_ADS_COMPLETED, google.ima.AdEvent.Type.CLICK, google.ima.AdEvent.Type.COMPLETE, google.ima.AdEvent.Type.FIRST_QUARTILE, google.ima.AdEvent.Type.LOADED, google.ima.AdEvent.Type.MIDPOINT, google.ima.AdEvent.Type.PAUSED, google.ima.AdEvent.Type.STARTED, google.ima.AdEvent.Type.THIRD_QUARTILE, google.ima.AdEvent.Type.SKIPPED, google.ima.AdEvent.Type.VOLUME_CHANGED, google.ima.AdEvent.Type.VOLUME_MUTED];
            this.events.forEach(function (event) {
                manager.addEventListener(event, _this4._assign.bind(_this4));
            });
            this._playAds();
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
            this._resumeMedia();
        }
    }, {
        key: "_resumeMedia",
        value: function _resumeMedia() {
            var _this5 = this;

            this.intervalTimer = 0;
            this.adsMuted = false;
            this.adsStarted = false;
            this.adsDuration = 0;
            this.adsCurrentTime = 0;
            this.element.parentElement.classList.remove('om-ads--active');
            if (!this.media.ended) {
                setTimeout(function () {
                    _this5.media.play();
                    var playEvent = events_1.addEvent('play');
                    _this5.element.dispatchEvent(playEvent);
                }, 500);
            } else {
                var event = events_1.addEvent('ended');
                this.element.dispatchEvent(event);
            }
        }
    }, {
        key: "_requestAds",
        value: function _requestAds() {
            if (this.adsLoader) {
                this.adsLoader.contentComplete();
            }
            this.adsRequest = new google.ima.AdsRequest();
            this.adsRequest.adTagUrl = this.adsUrl;
            var width = this.element.parentElement.offsetWidth;
            var height = this.element.parentElement.offsetWidth;
            this.adsRequest.linearAdSlotWidth = width;
            this.adsRequest.linearAdSlotHeight = height;
            this.adsRequest.nonLinearAdSlotWidth = width;
            this.adsRequest.nonLinearAdSlotHeight = 150;
            this.adsRequest.setAdWillAutoPlay(this.autoplayAllowed);
            this.adsRequest.setAdWillPlayMuted(this.autoplayRequiresMuted);
            this.adsLoader.requestAds(this.adsRequest);
        }
    }, {
        key: "_setup",
        value: function _setup() {
            google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED);
            this.adDisplayContainer = new google.ima.AdDisplayContainer(this.adsContainer, this.element);
            this.adsLoader = new google.ima.AdsLoader(this.adDisplayContainer);
            this.adsLoader.getSettings().setDisableCustomPlaybackForIOS10Plus(true);
            this.adsLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, this._loaded.bind(this));
            this.adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._error.bind(this));
            this.element.addEventListener('ended', this._contentEndedListener.bind(this));
        }
    }, {
        key: "_playAds",
        value: function _playAds() {
            try {
                if (!this.adsDone) {
                    this.adsDone = true;
                    this.adDisplayContainer.initialize();
                }
                this.adsManager.init(this.element.offsetWidth, this.element.offsetHeight, google.ima.ViewMode.NORMAL);
                this.adsManager.start();
                var e = events_1.addEvent('play');
                this.element.dispatchEvent(e);
                var event = events_1.addEvent('playing');
                this.element.dispatchEvent(event);
                this.adsActive = true;
                this.adsStarted = true;
            } catch (adError) {
                this._resumeMedia();
            }
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

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

Object.defineProperty(exports, "__esModule", { value: true });
var general_1 = __webpack_require__(0);
var native_1 = __webpack_require__(4);

var HTML5Media = function (_native_1$default) {
    _inherits(HTML5Media, _native_1$default);

    function HTML5Media(element, mediaFile) {
        var _ret;

        _classCallCheck(this, HTML5Media);

        if (!general_1.isAudio(element) && !general_1.isVideo(element)) {
            throw new TypeError('Native method only supports video/audio tags');
        }

        var _this = _possibleConstructorReturn(this, (HTML5Media.__proto__ || Object.getPrototypeOf(HTML5Media)).call(this, element, mediaFile));

        return _ret = _this, _possibleConstructorReturn(_this, _ret);
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
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = __webpack_require__(3);
var events_1 = __webpack_require__(1);
var general_1 = __webpack_require__(0);
var media_1 = __webpack_require__(2);
var native_1 = __webpack_require__(4);

var HlsMedia = function (_native_1$default) {
    _inherits(HlsMedia, _native_1$default);

    function HlsMedia(element, mediaSource) {
        var _ret;

        _classCallCheck(this, HlsMedia);

        var _this = _possibleConstructorReturn(this, (HlsMedia.__proto__ || Object.getPrototypeOf(HlsMedia)).call(this, element, mediaSource));

        _this.events = {};
        function createInstance() {
            this.player = new Hls();
        }
        _this.element = element;
        _this.media = mediaSource;
        _this.promise = typeof Hls === 'undefined' ? general_1.loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest') : new Promise(function (resolve) {
            resolve();
        });
        _this.promise.then(createInstance.bind(_this));
        return _ret = _this, _possibleConstructorReturn(_this, _ret);
    }

    _createClass(HlsMedia, [{
        key: "canPlayType",
        value: function canPlayType(mimeType) {
            return !constants_1.SUPPORTS_NATIVE_HLS && constants_1.HAS_MSE && mimeType === 'application/x-mpegURL';
        }
    }, {
        key: "load",
        value: function load() {
            var _this2 = this;

            this.player.detachMedia();
            this.player.loadSource(this.media.src);
            this.player.attachMedia(this.element);
            if (!this.events) {
                this.events = Hls.Events;
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
        value: function _assign(event, data) {
            if (name === 'hlsError') {
                console.warn(data);
                data = data[1];
                if (data.fatal) {
                    switch (data.type) {
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
                            }
                            break;
                        case 'networkError':
                            var message = 'Network error';
                            console.error(message);
                            break;
                        default:
                            this.player.destroy();
                            break;
                    }
                }
            } else {
                var e = events_1.addEvent(event, data);
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
            this.player.destroy();
        }
    }, {
        key: "src",
        set: function set(media) {
            var _this4 = this;

            if (media_1.isHlsSource(media.src)) {
                this._revoke();
                this.player = new Hls();
                this.player.loadSource(this.media.src);
                this.player.attachMedia(this.element);
                this.events = Hls.Events;
                Object.keys(this.events).forEach(function (event) {
                    _this4.player.on(_this4.events[event], _this4._assign.bind(_this4));
                });
            }
        }
    }]);

    return HlsMedia;
}(native_1.default);

exports.default = HlsMedia;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = __webpack_require__(3);
var events_1 = __webpack_require__(1);
var general_1 = __webpack_require__(0);
var media_1 = __webpack_require__(2);
var native_1 = __webpack_require__(4);

var DashMedia = function (_native_1$default) {
    _inherits(DashMedia, _native_1$default);

    function DashMedia(element, mediaSource) {
        var _ret;

        _classCallCheck(this, DashMedia);

        var _this = _possibleConstructorReturn(this, (DashMedia.__proto__ || Object.getPrototypeOf(DashMedia)).call(this, element, mediaSource));

        _this.events = {};
        function createInstance() {
            this.player = dashjs.MediaPlayer().create();
        }
        _this.promise = typeof dashjs === 'undefined' ? general_1.loadScript('https://cdn.dashjs.org/latest/dash.all.min.js') : new Promise(function (resolve) {
            resolve();
        });
        _this.promise.then(createInstance.bind(_this));
        return _ret = _this, _possibleConstructorReturn(_this, _ret);
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

            this.player.getDebug().setLogToBrowserConsole(false);
            this.player.initialize();
            this.player.setScheduleWhilePaused(false);
            this.player.setFastSwitchEnabled(true);
            this.player.attachView(this.element);
            this.player.setAutoPlay(false);
            if (_typeof(this.media.drm) === 'object' && Object.keys(this.media.drm).length) {
                this.player.setProtectionData(this.media.drm);
            }
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
        key: "src",
        set: function set(media) {
            var _this4 = this;

            if (media_1.isDashSource(media.src)) {
                this._revoke();
                this.player = dashjs.MediaPlayer().create();
                if (_typeof(media.drm) === 'object' && Object.keys(this.media.drm).length) {
                    this.player.setProtectionData(media.drm);
                }
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
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var dash_1 = __webpack_require__(11);
var hls_1 = __webpack_require__(10);
var html5_1 = __webpack_require__(9);
var source = __webpack_require__(2);

var Media = function () {
    function Media(element) {
        _classCallCheck(this, Media);

        this.element = element;
        this.mediaFiles = this._getMediaFiles();
        this.promisePlay = null;
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
            sources.some(function (media) {
                try {
                    _this3.media = _this3._invoke(media);
                } catch (e) {
                    _this3.media = new html5_1.default(_this3.element, media);
                }
                return _this3.canPlayType(media.type);
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
            if (source.isHlsSource(media.src)) {
                return new hls_1.default(this.element, media);
            } else if (source.isDashSource(media.src)) {
                return new dash_1.default(this.element, media);
            }
            return new html5_1.default(this.element, media);
        }
    }, {
        key: "src",
        set: function set(media) {
            var _this4 = this;

            if (typeof media === 'string') {
                this.mediaFiles.push({
                    src: media,
                    type: source.predictType(media)
                });
            } else if (Array.isArray(media)) {
                this.mediaFiles = media;
            } else if ((typeof media === "undefined" ? "undefined" : _typeof(media)) === 'object') {
                this.mediaFiles.push(media);
            }
            this.mediaFiles.some(function (file) {
                return _this4.canPlayType(file.type);
            });
            if (this.element.src) {
                this.element.setAttribute('data-om-file', this.mediaFiles[0].src);
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
            return this.media.duration;
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
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = __webpack_require__(1);

var Volume = function () {
    function Volume(player) {
        _classCallCheck(this, Volume);

        this.events = {
            button: {},
            media: {},
            slider: {}
        };
        this.player = player;
        this.volume = this.player.getMedia().volume;
        return this;
    }

    _createClass(Volume, [{
        key: "create",
        value: function create() {
            var _this = this;

            this.container = document.createElement('div');
            this.container.className = 'om-controls__volume';
            this.container.tabIndex = 0;
            this.container.setAttribute('aria-valuemin', '0');
            this.container.setAttribute('aria-valuemax', '100');
            this.container.setAttribute('aria-valuenow', "" + this.volume);
            this.container.setAttribute('aria-valuetext', "" + this.volume);
            this.container.setAttribute('aria-orientation', 'vertical');
            this.container.setAttribute('aria-label', 'Volume Slider');
            this.slider = document.createElement('input');
            this.slider.type = 'range';
            this.slider.className = 'om-controls__volume--input';
            this.slider.tabIndex = -1;
            this.slider.value = this.player.getMedia().volume.toString();
            this.slider.setAttribute('min', '0');
            this.slider.setAttribute('max', '1');
            this.slider.setAttribute('step', '0.1');
            this.display = document.createElement('progress');
            this.display.className = 'om-controls__volume--display';
            this.display.setAttribute('max', '10');
            this.display.setAttribute('role', 'presentation');
            this.display.value = this.player.getMedia().volume * 10;
            this.container.appendChild(this.slider);
            this.container.appendChild(this.display);
            this.button = document.createElement('button');
            this.button.type = 'button';
            this.button.className = 'om-controls__mute';
            this.button.tabIndex = 0;
            this.button.title = 'Mute';
            this.button.setAttribute('aria-controls', this.player.id);
            this.button.setAttribute('aria-pressed', 'false');
            this.button.setAttribute('aria-label', 'Mute');
            this.button.innerHTML = '<span class="om-sr">Mute</span>';
            var updateSlider = function updateSlider(element) {
                var mediaVolume = element.volume * 1;
                var vol = Math.floor(mediaVolume * 100);
                _this.slider.value = "" + element.volume;
                _this.display.value = mediaVolume * 10;
                _this.container.setAttribute('aria-valuenow', "" + vol);
                _this.container.setAttribute('aria-valuetext', "" + vol);
            };
            var updateButton = function updateButton(element) {
                var vol = element.volume;
                if (vol <= 0.5 && vol > 0) {
                    _this.button.classList.remove('om-controls__mute--muted');
                    _this.button.classList.add('om-controls__mute--half');
                } else if (vol === 0) {
                    _this.button.classList.add('om-controls__mute--muted');
                    _this.button.classList.remove('om-controls__mute--half');
                } else {
                    _this.button.classList.remove('om-controls__mute--muted');
                    _this.button.classList.remove('om-controls__mute--half');
                }
            };
            var updateVolume = function updateVolume(event) {
                var el = _this.player.activeElement();
                var value = parseFloat(event.target.value);
                el.volume = value;
                el.muted = el.volume === 0;
                _this.volume = value;
                if (!el.muted && _this.player.getContainer().querySelector('.om-player__unmute')) {
                    _this.player.getContainer().querySelector('.om-player__unmute').remove();
                }
                var e = events_1.addEvent('volumechange');
                _this.player.getElement().dispatchEvent(e);
            };
            this.events.media.volumechange = function () {
                var el = _this.player.activeElement();
                updateSlider(el);
                updateButton(el);
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
                    _this.button.setAttribute('aria-label', 'Unmute');
                } else {
                    el.volume = _this.volume;
                    _this.button.setAttribute('aria-label', 'Mute');
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
            var controls = this.player.getControls().getContainer();
            controls.appendChild(this.button);
            controls.appendChild(this.container);
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
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var time_1 = __webpack_require__(5);

var Time = function () {
    function Time(player) {
        _classCallCheck(this, Time);

        this.events = {
            controls: {},
            media: {}
        };
        this.player = player;
        return this;
    }

    _createClass(Time, [{
        key: "create",
        value: function create() {
            var _this = this;

            this.current = document.createElement('time');
            this.current.className = 'om-controls__current';
            this.current.setAttribute('role', 'timer');
            this.current.setAttribute('aria-live', 'off');
            this.current.setAttribute('aria-hidden', 'false');
            this.current.innerText = '0:00';
            this.delimiter = document.createElement('span');
            this.delimiter.className = 'om-controls__time-delimiter';
            this.delimiter.setAttribute('aria-hidden', 'false');
            this.delimiter.innerText = '/';
            this.duration = document.createElement('time');
            this.duration.className = 'om-controls__duration';
            this.duration.setAttribute('aria-hidden', 'false');
            this.duration.innerText = '0:00';
            var setInitialTime = function setInitialTime() {
                var el = _this.player.activeElement();
                if (el.duration !== Infinity) {
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
                if (el.duration !== Infinity) {
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
                    _this.current.innerText = 'Live Broadcast';
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
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var general_1 = __webpack_require__(0);

var Settings = function () {
    function Settings(player) {
        _classCallCheck(this, Settings);

        this.submenu = {};
        this.events = {
            global: {},
            media: {}
        };
        this.player = player;
        return this;
    }

    _createClass(Settings, [{
        key: "create",
        value: function create() {
            var _this = this;

            this.button = document.createElement('button');
            this.button.className = 'om-controls__settings om-control__right';
            this.button.tabIndex = 0;
            this.button.title = 'Player Settings';
            this.button.setAttribute('aria-controls', this.player.id);
            this.button.setAttribute('aria-pressed', 'false');
            this.button.setAttribute('aria-label', 'Player Settings');
            this.button.innerHTML = '<span class="om-sr">Player Settings</span>';
            this.menu = document.createElement('div');
            this.menu.className = 'om-settings';
            this.menu.setAttribute('aria-hidden', 'true');
            this.menu.innerHTML = '<div class="om-settings__menu" role="menu"></div>';
            this.clickEvent = function () {
                _this.button.setAttribute('aria-pressed', 'true');
                _this.menu.setAttribute('aria-hidden', _this.menu.getAttribute('aria-hidden') === 'false' ? 'true' : 'false');
            };
            this.hideEvent = function () {
                _this.menu.innerHTML = _this.originalOutput;
                _this.menu.setAttribute('aria-hidden', 'true');
            };
            this.events.media['controlshidden'] = this.hideEvent.bind(this);
            this.events.media.play = this.hideEvent.bind(this);
            this.events.media.pause = this.hideEvent.bind(this);
            this.events.global.click = function (e) {
                if (e.target.closest("#" + _this.player.id) && general_1.hasClass(e.target, 'om-speed__option')) {
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
                className: 'om-speed__option',
                default: '1',
                key: 'speed',
                name: 'Speed',
                subitems: [{ key: '0.25', label: '0.25' }, { key: '0.5', label: '0.5' }, { key: '0.75', label: '0.75' }, { key: '1', label: 'Normal' }, { key: '1.25', label: '1.25' }, { key: '1.5', label: '1.5' }, { key: '2', label: '2' }]
            };
        }
    }, {
        key: "addItem",
        value: function addItem(name, key, defaultValue, submenu, className) {
            var _this3 = this;

            var menuItem = document.createElement('div');
            menuItem.className = 'om-settings__menu-item';
            menuItem.tabIndex = 0;
            menuItem.setAttribute('role', 'menuitemradio');
            menuItem.innerHTML = "<div class=\"om-settings__menu-label\" data-value=\"" + key + "-" + defaultValue + "\">" + name + "</div>\n            <div class=\"om-settings__menu-content\">" + submenu.find(function (x) {
                return x.key === defaultValue;
            }).label + "</div>";
            this.menu.querySelector('.om-settings__menu').appendChild(menuItem);
            this.originalOutput = this.menu.innerHTML;
            if (submenu) {
                var subItems = "\n                <div class=\"om-settings__header\">\n                    <button type=\"button\" class=\"om-settings__back\">" + name + "</button>\n                </div>\n                <div class=\"om-settings__menu\" role=\"menu\" id=\"menu-item-" + key + "\">\n                    " + submenu.map(function (item) {
                    return "\n                    <div class=\"om-settings__submenu-item\" tabindex=\"0\" role=\"menuitemradio\"\n                        aria-checked=\"" + (defaultValue === item.key ? 'true' : 'false') + "\">\n                        <div class=\"om-settings__submenu-label " + (className || '') + "\" data-value=\"" + key + "-" + item.key + "\">" + item.label + "</div>\n                    </div>";
                }).join('') + "\n                </div>";
                this.submenu[key] = subItems;
            }
            this.events.global['settings.submenu'] = function (e) {
                var target = e.target;
                if (target.closest("#" + _this3.player.id)) {
                    if (general_1.hasClass(target, 'om-settings__back')) {
                        _this3.menu.classList.add('om-settings--sliding');
                        setTimeout(function () {
                            _this3.menu.innerHTML = _this3.originalOutput;
                            _this3.menu.classList.remove('om-settings--sliding');
                        }, 100);
                    } else if (general_1.hasClass(target, 'om-settings__menu-content')) {
                        var current = target.parentElement.querySelector('.om-settings__menu-label').getAttribute('data-value').replace(/(.*?)\-\w+$/, '$1');
                        if (_typeof(_this3.submenu[current]) !== undefined) {
                            _this3.menu.classList.add('om-settings--sliding');
                            setTimeout(function () {
                                _this3.menu.innerHTML = _this3.submenu[current];
                                _this3.menu.classList.remove('om-settings--sliding');
                            }, 100);
                        }
                    } else if (general_1.hasClass(target, 'om-settings__submenu-label')) {
                        var _current = target.getAttribute('data-value');
                        var value = _current.replace(key + "-", '');
                        var label = target.innerText;
                        var menuTarget = _this3.menu.querySelector("#menu-item-" + key + " .om-settings__submenu-item[aria-checked=true]");
                        if (menuTarget) {
                            menuTarget.setAttribute('aria-checked', 'false');
                            target.parentElement.setAttribute('aria-checked', 'true');
                            _this3.submenu[key] = _this3.menu.innerHTML;
                            _this3.menu.classList.add('om-settings--sliding');
                            setTimeout(function () {
                                _this3.menu.innerHTML = _this3.originalOutput;
                                var prev = _this3.menu.querySelector(".om-settings__menu-label[data-value=\"" + key + "-" + defaultValue + "\"]");
                                prev.setAttribute('data-value', "" + _current);
                                prev.nextElementSibling.innerHTML = label;
                                defaultValue = value;
                                _this3.originalOutput = _this3.menu.innerHTML;
                                _this3.menu.classList.remove('om-settings--sliding');
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
    }]);

    return Settings;
}();

exports.default = Settings;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var general_1 = __webpack_require__(0);
var time_1 = __webpack_require__(5);

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
        this.forcePause = false;
        return this;
    }

    _createClass(Progress, [{
        key: "create",
        value: function create() {
            var _this = this;

            this.progress = document.createElement('div');
            this.progress.className = 'om-controls__progress';
            this.progress.tabIndex = 0;
            this.progress.setAttribute('aria-label', 'Time Slider');
            this.progress.setAttribute('aria-valuemin', '0');
            this.slider = document.createElement('input');
            this.slider.type = 'range';
            this.slider.className = 'om-controls__progress--seek';
            this.slider.tabIndex = -1;
            this.slider.setAttribute('min', '0');
            this.slider.setAttribute('max', '0');
            this.slider.setAttribute('step', '0.1');
            this.slider.value = '0';
            this.buffer = document.createElement('progress');
            this.buffer.className = 'om-controls__progress--buffer';
            this.buffer.setAttribute('max', '100');
            this.buffer.value = 0;
            this.played = document.createElement('progress');
            this.played.className = 'om-controls__progress--played';
            this.played.setAttribute('max', '100');
            this.played.setAttribute('role', 'presentation');
            this.played.value = 0;
            this.tooltip = document.createElement('span');
            this.tooltip.className = 'om-controls__tooltip';
            this.tooltip.tabIndex = -1;
            this.tooltip.innerHTML = '00:00';
            this.progress.appendChild(this.slider);
            this.progress.appendChild(this.played);
            this.progress.appendChild(this.buffer);
            this.progress.appendChild(this.tooltip);
            this.events.media.loadedmetadata = function () {
                var el = _this.player.activeElement();
                if (el.duration !== Infinity) {
                    _this.slider.setAttribute('max', "" + el.duration);
                    var current = _this.player.isMedia() ? el.currentTime : el.duration - el.currentTime;
                    _this.slider.value = current.toString();
                    _this.progress.setAttribute('aria-valuemax', el.duration.toString());
                }
            };
            this.events.media.progress = function (e) {
                var el = e.target;
                if (el.duration > 0) {
                    for (var i = 0, total = el.buffered.length; i < total; i++) {
                        if (el.buffered.start(el.buffered.length - 1 - i) < el.currentTime) {
                            _this.buffer.value = el.buffered.end(el.buffered.length - 1 - i) / el.duration * 100;
                            break;
                        }
                    }
                }
            };
            this.events.media.pause = function () {
                var el = _this.player.activeElement();
                var current = el.currentTime;
                _this.progress.setAttribute('aria-valuenow', current.toString());
                _this.progress.setAttribute('aria-valuetext', time_1.formatTime(current));
            };
            this.events.media.play = function () {
                _this.progress.removeAttribute('aria-valuenow');
                _this.progress.removeAttribute('aria-valuetext');
            };
            this.events.media.timeupdate = function () {
                var el = _this.player.activeElement();
                if (el.duration !== Infinity) {
                    if (!_this.slider.getAttribute('max') || _this.slider.getAttribute('max') === '0' || parseFloat(_this.slider.getAttribute('max')) !== el.duration) {
                        _this.slider.setAttribute('max', "" + el.duration);
                    }
                    var current = _this.player.isMedia() ? el.currentTime : el.duration - el.currentTime + 1 >= 100 ? 100 : el.duration - el.currentTime + 1;
                    var min = parseFloat(_this.slider.min);
                    var max = parseFloat(_this.slider.max);
                    _this.slider.value = current.toString();
                    _this.slider.style.backgroundSize = (current - min) * 100 / (max - min) + "% 100%";
                    _this.played.value = el.duration <= 0 || isNaN(el.duration) || !isFinite(el.duration) ? 0 : current / el.duration * 100;
                }
            };
            this.events.media.ended = function () {
                _this.slider.style.backgroundSize = '0% 100%';
                _this.slider.setAttribute('max', '0');
                _this.buffer.value = 0;
                _this.played.value = 0;
            };
            var updateSlider = function updateSlider(e) {
                if (general_1.hasClass(_this.slider, 'om-progress--pressed')) {
                    return;
                }
                var target = e.target;
                _this.slider.classList.add('.om-progress--pressed');
                var min = parseFloat(target.min);
                var max = parseFloat(target.max);
                var val = parseFloat(target.value);
                _this.slider.style.backgroundSize = (val - min) * 100 / (max - min) + "% 100%";
                _this.slider.classList.remove('.om-progress--pressed');
                var el = _this.player.activeElement();
                el.currentTime = val;
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
                    el.play();
                }
                _this.forcePause = false;
            };
            this.events.slider.input = updateSlider.bind(this);
            this.events.slider.change = updateSlider.bind(this);
            this.events.slider.mousedown = forcePause.bind(this);
            this.events.slider.touchstart = forcePause.bind(this);
            this.events.slider.mouseup = releasePause.bind(this);
            this.events.slider.touchend = releasePause.bind(this);
            this.events.container.mousemove = function (e) {
                var el = _this.player.activeElement();
                if (el.duration === Infinity) {
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
                    _this.tooltip.classList.add('om-controls__tooltip--visible');
                } else {
                    _this.tooltip.classList.remove('om-controls__tooltip--visible');
                }
                _this.tooltip.style.left = pos + "px";
                _this.tooltip.innerHTML = isNaN(time) ? '00:00' : time_1.formatTime(time);
            };
            this.events.global.mousemove = function (e) {
                if (!e.target.closest('.om-controls__progress')) {
                    _this.tooltip.classList.remove('om-controls__tooltip--visible');
                }
            };
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
            this.tooltip.remove();
            this.progress.remove();
        }
    }]);

    return Progress;
}();

exports.default = Progress;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var player_1 = __webpack_require__(6);
var events_1 = __webpack_require__(1);
var general_1 = __webpack_require__(0);

var Play = function () {
    function Play(player) {
        _classCallCheck(this, Play);

        this.events = {
            controls: {},
            media: {}
        };
        this.player = player;
        return this;
    }

    _createClass(Play, [{
        key: "create",
        value: function create() {
            var _this = this;

            this.button = document.createElement('button');
            this.button.type = 'button';
            this.button.className = 'om-controls__playpause';
            this.button.tabIndex = 0;
            this.button.title = 'Play';
            this.button.setAttribute('aria-controls', this.player.id);
            this.button.setAttribute('aria-pressed', 'false');
            this.button.setAttribute('aria-label', 'Play');
            this.button.innerHTML = '<span class="om-sr">Play/Pause</span>';
            this.player.getControls().getContainer().appendChild(this.button);
            this.events.media.click = function () {
                _this.button.setAttribute('aria-pressed', 'true');
                var el = _this.player.activeElement();
                if (el.paused || el.ended) {
                    el.play();
                } else {
                    el.pause();
                }
            };
            this.events.media.play = function () {
                if (_this.player.activeElement().ended) {
                    if (_this.player.isMedia()) {
                        _this.button.classList.add('om-controls__playpause--replay');
                    } else {
                        _this.button.classList.add('om-controls__playpause--pause');
                    }
                    _this.button.title = 'Play';
                    _this.button.setAttribute('aria-label', 'Play');
                } else {
                    _this.button.classList.remove('om-controls__playpause--replay');
                    _this.button.classList.add('om-controls__playpause--pause');
                    _this.button.title = 'Pause';
                    _this.button.setAttribute('aria-label', 'Pause');
                    Object.keys(player_1.default.instances).forEach(function (key) {
                        if (key !== _this.player.id) {
                            var target = player_1.default.instances[key].activeElement();
                            target.pause();
                        }
                    });
                }
            };
            this.events.media.loadedmetadata = function () {
                if (general_1.hasClass(_this.button, 'om-controls__playpause--pause')) {
                    _this.button.classList.remove('om-controls__playpause--replay');
                    _this.button.classList.remove('om-controls__playpause--pause');
                    _this.button.title = 'Play';
                    _this.button.setAttribute('aria-label', 'Play');
                }
            };
            this.events.media.playing = function () {
                if (!general_1.hasClass(_this.button, 'om-controls__playpause--pause')) {
                    _this.button.classList.remove('om-controls__playpause--replay');
                    _this.button.classList.add('om-controls__playpause--pause');
                    _this.button.title = 'Pause';
                    _this.button.setAttribute('aria-label', 'Pause');
                }
            };
            this.events.media.pause = function () {
                _this.button.classList.remove('om-controls__playpause--pause');
                _this.button.title = 'Play';
                _this.button.setAttribute('aria-label', 'Play');
            };
            this.events.media.ended = function () {
                if (_this.player.activeElement().ended && _this.player.isMedia()) {
                    _this.button.classList.add('om-controls__playpause--replay');
                    _this.button.classList.remove('om-controls__playpause--pause');
                } else {
                    _this.button.classList.remove('om-controls__playpause--replay');
                    _this.button.classList.add('om-controls__playpause--pause');
                }
                _this.button.title = 'Play';
                _this.button.setAttribute('aria-label', 'Play');
            };
            this.events.media['adsended'] = function () {
                _this.button.classList.remove('om-controls__playpause--replay');
                _this.button.classList.add('om-controls__playpause--pause');
                _this.button.title = 'Pause Ads';
                _this.button.setAttribute('aria-label', 'Pause Ads');
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
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });

var Fullscreen = function () {
    function Fullscreen(player) {
        _classCallCheck(this, Fullscreen);

        this.player = player;
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
            this.button.className = 'om-controls__fullscreen om-control__right';
            this.button.tabIndex = 0;
            this.button.title = 'Fullscreen';
            this.button.setAttribute('aria-controls', this.player.id);
            this.button.setAttribute('aria-pressed', 'false');
            this.button.setAttribute('aria-label', 'Fullscreen');
            this.button.innerHTML = '<span class="om-sr">Fullscreen</span>';
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
                this.button.classList.add('om-controls__fullscreen--out');
            } else {
                this.button.classList.remove('om-controls__fullscreen--out');
            }
        }
    }, {
        key: "_resize",
        value: function _resize(width, height) {
            var wrapper = this.player.getContainer();
            var video = this.player.getElement();
            wrapper.style.width = width ? width + "px" : null;
            wrapper.style.height = height ? height + "px" : null;
            video.style.width = width ? width + "px" : null;
            video.style.height = height ? height + "px" : null;
        }
    }]);

    return Fullscreen;
}();

exports.default = Fullscreen;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = __webpack_require__(1);
var general_1 = __webpack_require__(0);
var time_1 = __webpack_require__(5);

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
            this.button.className = 'om-controls__captions om-control__right';
            this.button.tabIndex = 0;
            this.button.title = 'Toggle Captions';
            this.button.setAttribute('aria-controls', this.player.id);
            this.button.setAttribute('aria-pressed', 'false');
            this.button.setAttribute('aria-label', 'Toggle Captions');
            this.button.innerHTML = '<span class="om-sr">Toggle Captions</span>';
            this.player.getContainer().classList.add('om-captions--detected');
            for (var i = 0, tracks = this.player.getElement().querySelectorAll('track'), total = tracks.length; i < total; i++) {
                var element = tracks[i];
                if (element.kind === 'subtitles') {
                    this.trackUrlList[element.srclang] = general_1.getAbsoluteUrl(element.src);
                    if (element.default) {
                        this.default = element.srclang;
                        this.button.classList.add('om-controls__captions--on');
                    }
                }
            }
            for (var _i = 0, _total = this.trackList.length; _i < _total; _i++) {
                this.trackList[_i].mode = 'hidden';
            }
            this.captions = document.createElement('div');
            this.captions.className = 'om-captions';
            this.captions.innerHTML = '<span></span>';
            this.current = this.default ? Array.from(this.trackList).filter(function (item) {
                return item.language === _this.default;
            }).pop() : this.trackList[0];
            var container = this.captions.querySelector('span');
            this.events.media.timeupdate = function () {
                if (_this.player.isMedia()) {
                    var currentCues = _this.tracks[_this.current.language];
                    if (currentCues !== undefined) {
                        var index = _this._search(currentCues, _this.player.getMedia().currentTime);
                        container.innerHTML = '';
                        if (index > -1 && general_1.hasClass(_this.button, 'om-controls__captions--on')) {
                            _this.captions.classList.add('om-captions--on');
                            container.innerHTML = _this._sanitize(currentCues[index].text);
                        } else {
                            _this._hide();
                        }
                    }
                }
            };
            if (this.default) {
                this._show();
            }
            this.events.button.click = function (e) {
                var button = e.target;
                button.setAttribute('aria-pressed', 'true');
                if (general_1.hasClass(button, 'om-controls__captions--on')) {
                    _this._hide();
                    button.classList.remove('om-controls__captions--on');
                } else {
                    _this._show();
                    button.classList.add('om-controls__captions--on');
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
                if (option.closest("#" + _this.player.id) && general_1.hasClass(option, 'om-subtitles__option')) {
                    var language = option.getAttribute('data-value').replace('captions-', '');
                    _this.current = Array.from(_this.trackList).filter(function (item) {
                        return item.language === language;
                    }).pop();
                    _this._show();
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
            var subitems = [{ key: 'off', label: 'Off' }];

            var _loop = function _loop(i, total) {
                var track = _this2.trackList[i];
                subitems = subitems.filter(function (el) {
                    return el.key !== track.language;
                });
                subitems.push({ key: track.language, label: _this2.trackList[i].label });
            };

            for (var i = 0, total = this.trackList.length; i < total; i++) {
                _loop(i, total);
            }
            return {
                className: 'om-subtitles__option',
                default: this.default || 'off',
                key: 'captions',
                name: 'Subtitles/CC',
                subitems: subitems
            };
        }
    }, {
        key: "_getCues",
        value: function _getCues(webvttText) {
            var lines = webvttText.split(/\r?\n/);
            var entries = [];
            var urlRegexp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
            var timePattern = '^((?:[0-9]{1,2}:)?[0-9]{2}:[0-9]{2}([,.][0-9]{1,3})?) --> ';
            timePattern += '((?:[0-9]{1,2}:)?[0-9]{2}:[0-9]{2}([,.][0-9]{3})?)(.*?)$';
            var regexp = new RegExp(timePattern);
            var identifier = void 0;
            function isJson(item) {
                item = typeof item !== 'string' ? JSON.stringify(item) : item;
                try {
                    item = JSON.parse(item);
                } catch (e) {
                    return false;
                }
                if ((typeof item === "undefined" ? "undefined" : _typeof(item)) === 'object' && item !== null) {
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
                        cue = cue + "\n" + lines[i];
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
        key: "_show",
        value: function _show() {
            var _this3 = this;

            if (typeof this.current.cues === 'undefined') {
                return;
            }
            var container = this.captions.querySelector('span');
            container.innerHTML = '';
            if (!this.current.cues.length) {
                general_1.request(general_1.getAbsoluteUrl(this.trackUrlList[this.current.language]), 'text', function (d) {
                    _this3.tracks[_this3.current.language] = _this3._getCues(d);
                    _this3.player.getElement().addEventListener('timeupdate', _this3.events.media.timeupdate);
                });
            } else {
                var cues = [];
                Object.keys(this.current.cues).forEach(function (index) {
                    var i = parseInt(index, 10);
                    var current = _this3.current.cues[i];
                    cues.push({
                        endTime: current.endTime,
                        identifier: current.id,
                        settings: {},
                        startTime: current.startTime,
                        text: current.text
                    });
                });
                this.tracks[this.current.language] = cues;
                this.player.getElement().addEventListener('timeupdate', this.events.media.timeupdate);
            }
        }
    }, {
        key: "_hide",
        value: function _hide() {
            this.captions.classList.remove('om-captions--on');
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
    }]);

    return Captions;
}();

exports.default = Captions;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var captions_1 = __webpack_require__(19);
var fullscreen_1 = __webpack_require__(18);
var play_1 = __webpack_require__(17);
var progress_1 = __webpack_require__(16);
var settings_1 = __webpack_require__(15);
var time_1 = __webpack_require__(14);
var volume_1 = __webpack_require__(13);
var constants_1 = __webpack_require__(3);
var events_1 = __webpack_require__(1);
var general_1 = __webpack_require__(0);

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
            this.controls.className = 'om-controls';
            this.player.getContainer().appendChild(this.controls);
            if (!constants_1.IS_ANDROID && !constants_1.IS_IOS) {
                this.events.mouse.mouseenter = function () {
                    if (isMediaVideo) {
                        _this._stopControlTimer();
                        _this.player.getContainer().classList.remove('om-controls--hidden');
                        _this._startControlTimer(2500);
                    }
                };
                this.events.mouse.mousemove = function () {
                    if (isMediaVideo) {
                        _this.player.getContainer().classList.remove('om-controls--hidden');
                        _this._startControlTimer(2500);
                    }
                };
                this.events.mouse.mouseleave = function () {
                    if (isMediaVideo) {
                        _this._startControlTimer(1000);
                    }
                };
                this.events.media.pause = function () {
                    _this.player.getContainer().classList.remove('om-controls--hidden');
                    _this._stopControlTimer();
                };
                this.events.media.controlschanged = function () {
                    _this.destroy();
                    _this._setElements();
                    _this.create();
                };
                Object.keys(this.events.media).forEach(function (event) {
                    _this.player.getElement().addEventListener(event, _this.events.media[event]);
                });
                Object.keys(this.events.mouse).forEach(function (event) {
                    _this.player.getContainer().addEventListener(event, _this.events.mouse[event]);
                });
                this._startControlTimer(3000);
            }
            this._buildElements();
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
                    _this3.player.getContainer().classList.add('om-controls--hidden');
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

/***/ })
/******/ ])["default"];
});