(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.openplayerjs = factory());
})(this, function() {
  "use strict";var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateWrapper = (obj, member, setter, getter) => ({
  set _(value) {
    __privateSet(obj, member, value, setter);
  },
  get _() {
    return __privateGet(obj, member, getter);
  }
});

  var _player, _button, _captions, _menu, _events, _mediaTrackList, _hasTracks, _currentTrack, _default, _controlPosition, _controlLayer, _player2, _isFullscreen, _button2, _fullscreenEvents, _fullscreenWidth, _fullscreenHeight, _clickEvent, _controlPosition2, _controlLayer2, _player3, _button3, _menu2, _events2, _levels, _defaultLevel, _controlPosition3, _controlLayer3, _player4, _button4, _events3, _controlPosition4, _controlLayer4, _player5, _progress, _slider, _buffer, _played, _tooltip, _events4, _forcePause, _controlPosition5, _controlLayer5, _player6, _submenu, _button5, _menu3, _events5, _originalOutput, _controlPosition6, _controlLayer6, _player7, _currentTime, _delimiter, _duration, _container, _events6, _controlPosition7, _controlLayer7, _player8, _button6, _container2, _display, _slider2, _events7, _volume, _controlPosition8, _controlLayer8, _settings, _timer, _controls, _player9, _items, _controlEls, _customPlayer, _player10, _events8, _options, _player11, _events9, _options2, _player12, _events10, _recoverDecodingErrorDate, _recoverSwapAudioCodecDate, _options3, _autoplay, _currentLevel, _levelList, _isStreaming, _retryCount, _started, _timer2, _element, _media, _files, _promisePlay, _options4, _autoplay2, _mediaLoaded, _customMedia, _currentSrc, _ended, _done, _active, _started2, _intervalTimer, _volume2, _muted, _duration2, _currentTime2, _manager, _player13, _media2, _element2, _events11, _ads, _promise, _loader, _container3, _customClickContainer, _skipElement, _displayContainer, _request, _autostart, _autostartMuted, _playTriggered, _options5, _currentIndex, _originalVolume, _preloadContent, _lastTimePaused, _mediaSources, _mediaStarted, _adEvent, _controls2, _adsInstance, _uid, _element3, _ads2, _media3, _events12, _autoplay3, _volume3, _canAutoplay, _canAutoplayMuted, _processedAutoplay, _options6, _customElements, _fullscreen, _defaultOptions;
  const NAV = typeof window !== "undefined" ? window.navigator : null;
  const UA = NAV ? NAV.userAgent.toLowerCase() : null;
  const IS_IPHONE = UA ? /iphone/i.test(UA) && !window.MSStream : false;
  const IS_IOS = UA ? /ipad|iphone|ipod/i.test(UA) && !window.MSStream : false;
  const IS_ANDROID = UA ? /android/i.test(UA) : false;
  const IS_CHROME = UA ? /chrome/i.test(UA) : false;
  const IS_SAFARI = UA ? /safari/i.test(UA) && !IS_CHROME : false;
  const HAS_MSE = typeof window !== "undefined" ? "MediaSource" in window : false;
  const SUPPORTS_HLS = () => {
    if (typeof window === "undefined") {
      return false;
    }
    const mediaSource = window.MediaSource || window.WebKitMediaSource;
    const sourceBuffer = window.SourceBuffer || window.WebKitSourceBuffer;
    const isTypeSupported = mediaSource && typeof mediaSource.isTypeSupported === "function" && mediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');
    const sourceBufferValidAPI = !sourceBuffer || sourceBuffer.prototype && typeof sourceBuffer.prototype.appendBuffer === "function" && typeof sourceBuffer.prototype.remove === "function";
    return !!isTypeSupported && !!sourceBufferValidAPI && !IS_SAFARI;
  };
  const DVR_THRESHOLD = 120;
  const EVENT_OPTIONS = { passive: false };
  function isVideo(element) {
    return element.tagName.toLowerCase() === "video";
  }
  function isAudio(element) {
    return element.tagName.toLowerCase() === "audio";
  }
  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.onload = () => {
        script.remove();
        resolve();
      };
      script.onerror = () => {
        script.remove();
        reject(new Error(`${url} could not be loaded`));
      };
      if (document.head) {
        document.head.appendChild(script);
      }
    });
  }
  function offset(el) {
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left + (window.pageXOffset || document.documentElement.scrollLeft),
      top: rect.top + (window.pageYOffset || document.documentElement.scrollTop)
    };
  }
  function sanitize(html, plainText = true) {
    const parser = new DOMParser();
    const content = parser.parseFromString(html, "text/html");
    const formattedContent = content.body || document.createElement("body");
    const scripts = formattedContent.querySelectorAll("script");
    for (let i = 0, total = scripts.length; i < total; i++) {
      scripts[i].remove();
    }
    const clean = (element) => {
      const nodes = element.children;
      for (let i = 0, total = nodes.length; i < total; i++) {
        const node = nodes[i];
        const { attributes } = node;
        for (let j = 0, t = attributes.length; j < t; j++) {
          const { name, value } = attributes[j];
          const val = value.replace(/\s+/g, "").toLowerCase();
          if (["src", "href", "xlink:href"].includes(name)) {
            if (val.includes("javascript:") || val.includes("data:")) {
              node.removeAttribute(name);
            }
          }
          if (name.startsWith("on")) {
            node.removeAttribute(name);
          }
        }
        clean(node);
      }
    };
    clean(formattedContent);
    return plainText ? (formattedContent.textContent || "").replace(/\s{2,}/g, "") : formattedContent.innerHTML;
  }
  function isXml(input) {
    let parsedXml;
    if (typeof DOMParser !== "undefined") {
      parsedXml = (text) => new DOMParser().parseFromString(text, "text/xml");
    } else {
      return false;
    }
    try {
      const response = parsedXml(input);
      if (response.getElementsByTagName("parsererror").length > 0) {
        return false;
      }
    } catch (e) {
      return false;
    }
    return true;
  }
  function addEvent(event, details) {
    let detail = {};
    if (details && details.detail) {
      detail = { detail: details.detail };
    }
    return new CustomEvent(event, detail);
  }
  class Captions {
    constructor(player, position, layer) {
      __privateAdd(this, _player, void 0);
      __privateAdd(this, _button, void 0);
      __privateAdd(this, _captions, void 0);
      __privateAdd(this, _menu, void 0);
      __privateAdd(this, _events, {
        button: {},
        global: {},
        media: {}
      });
      __privateAdd(this, _mediaTrackList, void 0);
      __privateAdd(this, _hasTracks, void 0);
      __privateAdd(this, _currentTrack, void 0);
      __privateAdd(this, _default, "off");
      __privateAdd(this, _controlPosition, void 0);
      __privateAdd(this, _controlLayer, void 0);
      __privateSet(this, _player, player);
      __privateSet(this, _controlPosition, position);
      __privateSet(this, _controlLayer, layer);
      this._formatMenuItems = this._formatMenuItems.bind(this);
      this._setDefaultTrack = this._setDefaultTrack.bind(this);
      this._showCaptions = this._showCaptions.bind(this);
      this._hideCaptions = this._hideCaptions.bind(this);
    }
    create() {
      var _a;
      const { textTracks } = __privateGet(this, _player).getElement();
      const { labels, detachMenus } = __privateGet(this, _player).getOptions();
      __privateSet(this, _mediaTrackList, Object.keys(textTracks).map((k) => textTracks[Number(k)]).filter((el) => ["subtitles", "captions"].includes(el.kind) && el.language));
      __privateSet(this, _hasTracks, !!__privateGet(this, _mediaTrackList).length);
      if (!__privateGet(this, _hasTracks)) {
        return;
      }
      __privateSet(this, _button, document.createElement("button"));
      __privateGet(this, _button).className = `op-controls__captions op-control__${__privateGet(this, _controlPosition)}`;
      __privateGet(this, _button).tabIndex = 0;
      __privateGet(this, _button).title = (labels == null ? void 0 : labels.toggleCaptions) || "";
      __privateGet(this, _button).setAttribute("aria-controls", __privateGet(this, _player).id);
      __privateGet(this, _button).setAttribute("aria-pressed", "false");
      __privateGet(this, _button).setAttribute("aria-label", (labels == null ? void 0 : labels.toggleCaptions) || "");
      __privateGet(this, _button).setAttribute("data-active-captions", "off");
      __privateSet(this, _captions, document.createElement("div"));
      __privateGet(this, _captions).className = "op-captions";
      const target = __privateGet(this, _player).getContainer();
      target.insertBefore(__privateGet(this, _captions), target.firstChild);
      if (detachMenus) {
        __privateGet(this, _button).classList.add("op-control--no-hover");
        __privateSet(this, _menu, document.createElement("div"));
        __privateGet(this, _menu).className = "op-settings op-captions__menu";
        __privateGet(this, _menu).setAttribute("aria-hidden", "true");
        __privateGet(this, _menu).innerHTML = `<div class="op-settings__menu" role="menu" id="menu-item-captions">
                <div class="op-settings__submenu-item" tabindex="0" role="menuitemradio" aria-checked="${__privateGet(this, _default) === "off" ? "true" : "false"}">
                    <div class="op-settings__submenu-label op-subtitles__option" data-value="captions-off">${labels == null ? void 0 : labels.off}</div>
                </div>
            </div>`;
        const itemContainer = document.createElement("div");
        itemContainer.className = `op-controls__container op-control__${__privateGet(this, _controlPosition)}`;
        itemContainer.append(__privateGet(this, _button), __privateGet(this, _menu));
        __privateGet(this, _player).getControls().getLayer(__privateGet(this, _controlLayer)).append(itemContainer);
        for (const track of __privateGet(this, _mediaTrackList)) {
          const item = document.createElement("div");
          const label = ((_a = labels == null ? void 0 : labels.lang) == null ? void 0 : _a[track.language]) || null;
          item.className = "op-settings__submenu-item";
          item.tabIndex = 0;
          item.setAttribute("role", "menuitemradio");
          item.setAttribute("aria-checked", __privateGet(this, _default) === track.language ? "true" : "false");
          item.innerHTML = `<div class="op-settings__submenu-label op-subtitles__option"
                    data-value="captions-${track.language}">
                    ${label || track.label}
                </div>`;
          __privateGet(this, _menu).append(item);
        }
      } else {
        __privateGet(this, _player).getControls().getLayer(__privateGet(this, _controlLayer)).append(__privateGet(this, _button));
      }
      __privateGet(this, _events).button.click = (e) => {
        var _a2;
        const button = e.target;
        if (detachMenus) {
          const menus = __privateGet(this, _player).getContainer().querySelectorAll(".op-settings");
          for (const menuItem of Array.from(menus)) {
            if (menuItem !== __privateGet(this, _menu)) {
              menuItem.setAttribute("aria-hidden", "true");
            }
          }
          if (__privateGet(this, _menu).getAttribute("aria-hidden") === "true") {
            __privateGet(this, _menu).setAttribute("aria-hidden", "false");
          } else {
            __privateGet(this, _menu).setAttribute("aria-hidden", "true");
          }
        } else {
          button.setAttribute("aria-pressed", "true");
          if (button.classList.contains("op-controls__captions--on")) {
            button.classList.remove("op-controls__captions--on");
            button.setAttribute("data-active-captions", "off");
            this._hideCaptions();
          } else {
            button.classList.add("op-controls__captions--on");
            button.setAttribute("data-active-captions", ((_a2 = __privateGet(this, _currentTrack)) == null ? void 0 : _a2.language) || "off");
            this._showCaptions();
          }
          for (const track of __privateGet(this, _mediaTrackList)) {
            track.mode = button.getAttribute("data-active-captions") === track.language ? "showing" : "hidden";
          }
        }
      };
      __privateGet(this, _events).button.mouseover = () => {
        if (!IS_IOS && !IS_ANDROID && detachMenus) {
          const menus = __privateGet(this, _player).getContainer().querySelectorAll(".op-settings");
          for (let i = 0, total = menus.length; i < total; ++i) {
            if (menus[i] !== __privateGet(this, _menu)) {
              menus[i].setAttribute("aria-hidden", "true");
            }
          }
          if (__privateGet(this, _menu).getAttribute("aria-hidden") === "true") {
            __privateGet(this, _menu).setAttribute("aria-hidden", "false");
          }
        }
      };
      __privateGet(this, _events).button.mouseout = () => {
        if (!IS_IOS && !IS_ANDROID && detachMenus) {
          const menus = __privateGet(this, _player).getContainer().querySelectorAll(".op-settings");
          for (let i = 0, total = menus.length; i < total; ++i) {
            menus[i].setAttribute("aria-hidden", "true");
          }
          if (__privateGet(this, _menu).getAttribute("aria-hidden") === "false") {
            __privateGet(this, _menu).setAttribute("aria-hidden", "true");
          }
        }
      };
      __privateGet(this, _button).addEventListener("click", __privateGet(this, _events).button.click, EVENT_OPTIONS);
      __privateGet(this, _events).global.click = (e) => {
        const option = e.target;
        if (option.closest(`#${__privateGet(this, _player).id}`) && option.classList.contains("op-subtitles__option")) {
          const language = option.getAttribute("data-value").replace("captions-", "");
          this._hideCaptions();
          if (language === "off") {
            __privateSet(this, _currentTrack, void 0);
          }
          for (const track of __privateGet(this, _mediaTrackList)) {
            track.mode = track.language === language ? "showing" : "hidden";
            if (track.language === language) {
              __privateSet(this, _currentTrack, track);
              this._showCaptions();
            }
          }
          if (detachMenus) {
            if (__privateGet(this, _button).classList.contains("op-controls__captions--on")) {
              __privateGet(this, _button).classList.remove("op-controls__captions--on");
              __privateGet(this, _button).setAttribute("data-active-captions", "off");
            } else {
              __privateGet(this, _button).classList.add("op-controls__captions--on");
              __privateGet(this, _button).setAttribute("data-active-captions", language);
            }
            const captions = __privateGet(this, _menu).querySelectorAll(".op-settings__submenu-item");
            for (const caption of Array.from(captions)) {
              caption.setAttribute("aria-checked", "false");
            }
            option.parentElement.setAttribute("aria-checked", "true");
            __privateGet(this, _menu).setAttribute("aria-hidden", "false");
          } else {
            __privateGet(this, _button).setAttribute("data-active-captions", language);
          }
          const event = addEvent("captionschanged");
          __privateGet(this, _player).getElement().dispatchEvent(event);
        }
      };
      __privateGet(this, _events).global.cuechange = (e) => {
        var _a2;
        this._hideCaptions();
        const t = e.target;
        if (t.mode !== "showing" || __privateGet(this, _button).getAttribute("data-active-captions") === "off") {
          return;
        }
        if (t.activeCues && ((_a2 = t.activeCues) == null ? void 0 : _a2.length) > 0) {
          this._showCaptions();
        }
      };
      if (detachMenus) {
        __privateGet(this, _button).addEventListener("mouseover", __privateGet(this, _events).button.mouseover, EVENT_OPTIONS);
        __privateGet(this, _menu).addEventListener("mouseover", __privateGet(this, _events).button.mouseover, EVENT_OPTIONS);
        __privateGet(this, _menu).addEventListener("mouseout", __privateGet(this, _events).button.mouseout, EVENT_OPTIONS);
        __privateGet(this, _player).getElement().addEventListener("controlshidden", __privateGet(this, _events).button.mouseout, EVENT_OPTIONS);
      }
      document.addEventListener("click", __privateGet(this, _events).global.click, EVENT_OPTIONS);
      for (const track of __privateGet(this, _mediaTrackList)) {
        track.mode = track.mode !== "showing" ? "hidden" : track.mode;
        track.addEventListener("cuechange", __privateGet(this, _events).global.cuechange, EVENT_OPTIONS);
      }
      const targetTrack = __privateGet(this, _player).getElement().querySelector('track:is([kind="subtitles"],[kind="captions"])[default]');
      if (targetTrack) {
        const matchTrack = __privateGet(this, _mediaTrackList).find((el) => el.language === targetTrack.srclang);
        if (matchTrack) {
          this._setDefaultTrack(matchTrack);
        }
      }
    }
    destroy() {
      const { detachMenus } = __privateGet(this, _player).getOptions();
      if (!__privateGet(this, _hasTracks)) {
        return;
      }
      for (const track of __privateGet(this, _mediaTrackList)) {
        track.removeEventListener("cuechange", __privateGet(this, _events).global.cuechange);
      }
      document.removeEventListener("click", __privateGet(this, _events).global.click);
      __privateGet(this, _button).removeEventListener("click", __privateGet(this, _events).button.click);
      if (detachMenus) {
        __privateGet(this, _button).removeEventListener("mouseover", __privateGet(this, _events).button.mouseover);
        __privateGet(this, _menu).removeEventListener("mouseover", __privateGet(this, _events).button.mouseover);
        __privateGet(this, _menu).removeEventListener("mouseout", __privateGet(this, _events).button.mouseout);
        __privateGet(this, _player).getElement().removeEventListener("controlshidden", __privateGet(this, _events).button.mouseout);
        __privateGet(this, _menu).remove();
      }
      __privateGet(this, _button).remove();
    }
    addSettings() {
      const { detachMenus, labels } = __privateGet(this, _player).getOptions();
      if (detachMenus || __privateGet(this, _mediaTrackList).length <= 1) {
        return {};
      }
      const subitems = this._formatMenuItems();
      return subitems.length > 2 ? {
        className: "op-subtitles__option",
        default: __privateGet(this, _default) || "off",
        key: "captions",
        name: (labels == null ? void 0 : labels.captions) || "",
        subitems
      } : {};
    }
    _formatMenuItems() {
      const { labels, detachMenus } = __privateGet(this, _player).getOptions();
      if (__privateGet(this, _mediaTrackList).length <= 1 && !detachMenus) {
        return [];
      }
      let items = [{ key: "off", label: (labels == null ? void 0 : labels.off) || "" }];
      for (const track of __privateGet(this, _mediaTrackList)) {
        const label = (labels == null ? void 0 : labels.lang) ? labels.lang[track.language] : null;
        items = items.filter((el) => el.key !== track.language);
        items.push({ key: track.language, label: label || track.label });
      }
      return items;
    }
    _setDefaultTrack(track) {
      var _a, _b;
      track.mode = "showing";
      __privateSet(this, _default, track.language);
      __privateGet(this, _button).setAttribute("data-active-captions", __privateGet(this, _default));
      __privateGet(this, _button).classList.add("op-controls__captions--on");
      __privateGet(this, _captions).classList.add("op-captions--on");
      __privateSet(this, _currentTrack, track);
      const options = document.querySelectorAll(".op-settings__submenu-item") || [];
      for (const option of Array.from(options)) {
        option.setAttribute("aria-checked", "false");
      }
      (_b = (_a = document.querySelector(`.op-subtitles__option[data-value="captions-${track.language}"]`)) == null ? void 0 : _a.parentElement) == null ? void 0 : _b.setAttribute("aria-checked", "true");
    }
    _showCaptions() {
      var _a;
      for (const cue of Array.from(((_a = __privateGet(this, _currentTrack)) == null ? void 0 : _a.activeCues) || [])) {
        const content = (cue == null ? void 0 : cue.text) || "";
        if (content && __privateGet(this, _captions)) {
          const caption = document.createElement("span");
          caption.innerHTML = content;
          __privateGet(this, _captions).prepend(caption);
          __privateGet(this, _captions).classList.add("op-captions--on");
        } else {
          this._hideCaptions();
        }
      }
    }
    _hideCaptions() {
      var _a;
      while ((_a = __privateGet(this, _captions)) == null ? void 0 : _a.lastChild) {
        __privateGet(this, _captions).removeChild(__privateGet(this, _captions).lastChild);
      }
    }
  }
  _player = new WeakMap();
  _button = new WeakMap();
  _captions = new WeakMap();
  _menu = new WeakMap();
  _events = new WeakMap();
  _mediaTrackList = new WeakMap();
  _hasTracks = new WeakMap();
  _currentTrack = new WeakMap();
  _default = new WeakMap();
  _controlPosition = new WeakMap();
  _controlLayer = new WeakMap();
  class Fullscreen {
    constructor(player, position, layer) {
      __privateAdd(this, _player2, void 0);
      __privateAdd(this, _isFullscreen, void 0);
      __privateAdd(this, _button2, void 0);
      __privateAdd(this, _fullscreenEvents, []);
      __privateAdd(this, _fullscreenWidth, 0);
      __privateAdd(this, _fullscreenHeight, 0);
      __privateAdd(this, _clickEvent, void 0);
      __privateAdd(this, _controlPosition2, void 0);
      __privateAdd(this, _controlLayer2, void 0);
      __privateSet(this, _player2, player);
      __privateSet(this, _controlPosition2, position);
      __privateSet(this, _controlLayer2, layer);
      __privateSet(this, _isFullscreen, document.body.classList.contains("op-fullscreen__on"));
      const target = document;
      this.fullScreenEnabled = !!(target.fullscreenEnabled || target.mozFullScreenEnabled || target.msFullscreenEnabled || target.webkitSupportsFullscreen || target.webkitFullscreenEnabled || document.createElement("video").webkitRequestFullScreen);
      this._enterSpaceKeyEvent = this._enterSpaceKeyEvent.bind(this);
      this._resize = this._resize.bind(this);
      this._fullscreenChange = this._fullscreenChange.bind(this);
      this._setFullscreen = this._setFullscreen.bind(this);
      this._unsetFullscreen = this._unsetFullscreen.bind(this);
      __privateSet(this, _fullscreenEvents, [
        "fullscreenchange",
        "mozfullscreenchange",
        "webkitfullscreenchange",
        "msfullscreenchange"
      ]);
      __privateGet(this, _fullscreenEvents).forEach((event) => {
        document.addEventListener(event, this._fullscreenChange, EVENT_OPTIONS);
      });
      this._setFullscreenData(false);
      __privateGet(this, _player2).getContainer().addEventListener("keydown", this._enterSpaceKeyEvent, EVENT_OPTIONS);
      if (IS_IPHONE) {
        __privateGet(this, _player2).getElement().addEventListener("webkitbeginfullscreen", this._setFullscreen, EVENT_OPTIONS);
        __privateGet(this, _player2).getElement().addEventListener("webkitendfullscreen", this._unsetFullscreen, EVENT_OPTIONS);
      }
    }
    create() {
      const { labels } = __privateGet(this, _player2).getOptions();
      __privateSet(this, _button2, document.createElement("button"));
      __privateGet(this, _button2).type = "button";
      __privateGet(this, _button2).className = `op-controls__fullscreen op-control__${__privateGet(this, _controlPosition2)}`;
      __privateGet(this, _button2).tabIndex = 0;
      __privateGet(this, _button2).title = (labels == null ? void 0 : labels.fullscreen) || "";
      __privateGet(this, _button2).setAttribute("aria-controls", __privateGet(this, _player2).id);
      __privateGet(this, _button2).setAttribute("aria-pressed", "false");
      __privateGet(this, _button2).setAttribute("aria-label", (labels == null ? void 0 : labels.fullscreen) || "");
      __privateSet(this, _clickEvent, () => {
        __privateGet(this, _button2).setAttribute("aria-pressed", "true");
        this.toggleFullscreen();
      });
      __privateSet(this, _clickEvent, __privateGet(this, _clickEvent).bind(this));
      __privateGet(this, _button2).addEventListener("click", __privateGet(this, _clickEvent), EVENT_OPTIONS);
      __privateGet(this, _player2).getControls().getLayer(__privateGet(this, _controlLayer2)).appendChild(__privateGet(this, _button2));
    }
    destroy() {
      __privateGet(this, _player2).getContainer().removeEventListener("keydown", this._enterSpaceKeyEvent);
      __privateGet(this, _fullscreenEvents).forEach((event) => {
        document.removeEventListener(event, this._fullscreenChange);
      });
      if (IS_IPHONE) {
        __privateGet(this, _player2).getElement().removeEventListener("webkitbeginfullscreen", this._setFullscreen);
        __privateGet(this, _player2).getElement().removeEventListener("webkitendfullscreen", this._unsetFullscreen);
      }
      __privateGet(this, _button2).removeEventListener("click", __privateGet(this, _clickEvent));
      __privateGet(this, _button2).remove();
    }
    toggleFullscreen() {
      if (__privateGet(this, _isFullscreen)) {
        const target = document;
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
        document.body.classList.remove("op-fullscreen__on");
      } else {
        const video = __privateGet(this, _player2).getElement();
        __privateSet(this, _fullscreenWidth, window.screen.width);
        __privateSet(this, _fullscreenHeight, window.screen.height);
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
        document.body.classList.add("op-fullscreen__on");
      }
      if (typeof window !== "undefined" && (IS_ANDROID || IS_IPHONE)) {
        const { screen } = window;
        if (screen.orientation && !__privateGet(this, _isFullscreen)) {
          screen.orientation.lock("landscape");
        }
      }
    }
    _fullscreenChange() {
      const width = __privateGet(this, _isFullscreen) ? void 0 : __privateGet(this, _fullscreenWidth);
      const height = __privateGet(this, _isFullscreen) ? void 0 : __privateGet(this, _fullscreenHeight);
      this._setFullscreenData(!__privateGet(this, _isFullscreen));
      if (__privateGet(this, _player2).isAd()) {
        __privateGet(this, _player2).getAd().resizeAds(width, height);
      }
      __privateSet(this, _isFullscreen, !__privateGet(this, _isFullscreen));
      if (__privateGet(this, _isFullscreen)) {
        document.body.classList.add("op-fullscreen__on");
      } else {
        document.body.classList.remove("op-fullscreen__on");
      }
      this._resize(width, height);
    }
    _setFullscreenData(isFullscreen) {
      __privateGet(this, _player2).getContainer().setAttribute("data-fullscreen", (!!isFullscreen).toString());
      if (__privateGet(this, _button2)) {
        if (isFullscreen) {
          __privateGet(this, _button2).classList.add("op-controls__fullscreen--out");
        } else {
          __privateGet(this, _button2).classList.remove("op-controls__fullscreen--out");
        }
      }
    }
    _resize(width, height) {
      const wrapper = __privateGet(this, _player2).getContainer();
      const video = __privateGet(this, _player2).getElement();
      const options = __privateGet(this, _player2).getOptions();
      let styles = "";
      if (width) {
        wrapper.style.width = "100%";
        video.style.width = "100%";
      } else if (options.width) {
        const defaultWidth = typeof options.width === "number" ? `${options.width}px` : options.width;
        styles += `width: ${defaultWidth} !important;`;
        video.style.removeProperty("width");
      } else {
        video.style.removeProperty("width");
        wrapper.style.removeProperty("width");
      }
      if (height) {
        video.style.height = "100%";
        wrapper.style.height = "100%";
      } else if (options.height) {
        const defaultHeight = typeof options.height === "number" ? `${options.height}px` : options.height;
        styles += `height: ${defaultHeight} !important;`;
        video.style.removeProperty("height");
      } else {
        video.style.removeProperty("height");
        wrapper.style.removeProperty("height");
      }
      if (styles) {
        wrapper.setAttribute("style", styles);
      }
    }
    _enterSpaceKeyEvent(e) {
      var _a;
      const key = e.which || e.keyCode || 0;
      const fullscreenBtnFocused = (_a = document == null ? void 0 : document.activeElement) == null ? void 0 : _a.classList.contains("op-controls__fullscreen");
      if (fullscreenBtnFocused && (key === 13 || key === 32)) {
        this.toggleFullscreen();
        e.preventDefault();
        e.stopPropagation();
      }
    }
    _setFullscreen() {
      __privateSet(this, _isFullscreen, true);
      this._setFullscreenData(true);
      document.body.classList.add("op-fullscreen__on");
    }
    _unsetFullscreen() {
      __privateSet(this, _isFullscreen, false);
      this._setFullscreenData(false);
      document.body.classList.remove("op-fullscreen__on");
    }
  }
  _player2 = new WeakMap();
  _isFullscreen = new WeakMap();
  _button2 = new WeakMap();
  _fullscreenEvents = new WeakMap();
  _fullscreenWidth = new WeakMap();
  _fullscreenHeight = new WeakMap();
  _clickEvent = new WeakMap();
  _controlPosition2 = new WeakMap();
  _controlLayer2 = new WeakMap();
  function getExtension(url) {
    const baseUrl = url.split("?")[0];
    const baseFrags = (baseUrl || "").split("\\");
    const baseUrlFragment = (baseFrags || []).pop();
    const baseNameFrags = (baseUrlFragment || "").split("/");
    const baseName = (baseNameFrags || []).pop() || "";
    return baseName.includes(".") ? baseName.substring(baseName.lastIndexOf(".") + 1) : "";
  }
  function isHlsSource(media) {
    return /\.m3u8$/i.test(media.src) || ["application/x-mpegURL", "application/vnd.apple.mpegurl"].includes(media.type);
  }
  function isDashSource(media) {
    return /\.mpd/i.test(media.src) || media.type === "application/dash+xml";
  }
  function isFlvSource(media) {
    return /(^rtmp:\/\/|\.flv$)/i.test(media.src) || ["video/x-flv", "video/flv"].includes(media.type);
  }
  function predictMimeType(url, element) {
    const extension = getExtension(url);
    if (!extension) {
      return isAudio(element) ? "audio/mp3" : "video/mp4";
    }
    switch (extension) {
      case "m3u8":
      case "m3u":
        return "application/x-mpegURL";
      case "mpd":
        return "application/dash+xml";
      case "mp4":
        return isAudio(element) ? "audio/mp4" : "video/mp4";
      case "mp3":
        return "audio/mp3";
      case "webm":
        return isAudio(element) ? "audio/webm" : "video/webm";
      case "ogg":
        return isAudio(element) ? "audio/ogg" : "video/ogg";
      case "ogv":
        return "video/ogg";
      case "oga":
        return "audio/ogg";
      case "3gp":
        return "audio/3gpp";
      case "wav":
        return "audio/wav";
      case "aac":
        return "audio/aac";
      case "flac":
        return "audio/flac";
      default:
        return isAudio(element) ? "audio/mp3" : "video/mp4";
    }
  }
  function isAutoplaySupported(media, defaultVol, autoplay, muted, callback) {
    const playPromise = media.play();
    if (playPromise !== void 0) {
      playPromise.then(() => {
        media.pause();
        autoplay(true);
        muted(false);
        callback();
      }).catch(() => {
        media.volume = 0;
        media.muted = true;
        media.play().then(() => {
          media.pause();
          autoplay(true);
          muted(true);
          callback();
        }).catch(() => {
          media.volume = defaultVol;
          media.muted = false;
          autoplay(false);
          muted(false);
          callback();
        });
      });
    } else {
      autoplay(!media.paused || "Promise" in window && playPromise instanceof Promise);
      media.pause();
      muted(false);
      callback();
    }
  }
  class Levels {
    constructor(player, position, layer) {
      __privateAdd(this, _player3, void 0);
      __privateAdd(this, _button3, void 0);
      __privateAdd(this, _menu2, void 0);
      __privateAdd(this, _events2, {
        button: {},
        global: {},
        media: {}
      });
      __privateAdd(this, _levels, []);
      __privateAdd(this, _defaultLevel, "");
      __privateAdd(this, _controlPosition3, void 0);
      __privateAdd(this, _controlLayer3, void 0);
      __privateSet(this, _player3, player);
      __privateSet(this, _controlPosition3, position);
      __privateSet(this, _controlLayer3, layer);
    }
    create() {
      const { labels, defaultLevel: startLevel, detachMenus } = __privateGet(this, _player3).getOptions();
      const initialLevel = startLevel !== null ? parseInt(startLevel || "0", 10) : __privateGet(this, _player3).getMedia().level;
      __privateSet(this, _defaultLevel, `${initialLevel}`);
      const menuItems = this._formatMenuItems();
      const defaultLevel = menuItems.length ? menuItems.find((items) => items.key === __privateGet(this, _defaultLevel)) : null;
      const defaultLabel = defaultLevel ? defaultLevel.label : (labels == null ? void 0 : labels.auto) || "";
      let levelSet = false;
      __privateSet(this, _button3, document.createElement("button"));
      __privateGet(this, _button3).className = `op-controls__levels op-control__${__privateGet(this, _controlPosition3)}`;
      __privateGet(this, _button3).tabIndex = 0;
      __privateGet(this, _button3).title = (labels == null ? void 0 : labels.mediaLevels) || "";
      __privateGet(this, _button3).setAttribute("aria-controls", __privateGet(this, _player3).id);
      __privateGet(this, _button3).setAttribute("aria-label", (labels == null ? void 0 : labels.mediaLevels) || "");
      __privateGet(this, _button3).setAttribute("data-active-level", __privateGet(this, _defaultLevel));
      __privateGet(this, _button3).innerHTML = `<span>${defaultLabel}</span>`;
      const loadLevelsEvent = () => {
        if (!__privateGet(this, _levels).length) {
          this._gatherLevels();
          setTimeout(() => {
            __privateGet(this, _player3).getMedia().level = initialLevel;
            const e = addEvent("controlschanged");
            __privateGet(this, _player3).getElement().dispatchEvent(e);
          }, 0);
        } else if (!levelSet) {
          __privateGet(this, _player3).getMedia().level = initialLevel;
          levelSet = true;
        }
      };
      __privateGet(this, _events2).media.loadedmetadata = loadLevelsEvent.bind(this);
      __privateGet(this, _events2).media.manifestLoaded = loadLevelsEvent.bind(this);
      __privateGet(this, _events2).media.hlsManifestParsed = loadLevelsEvent.bind(this);
      if (detachMenus) {
        this._buildMenu();
        __privateGet(this, _events2).button.click = () => {
          if (detachMenus) {
            const menus = __privateGet(this, _player3).getContainer().querySelectorAll(".op-settings");
            for (let i = 0, total = menus.length; i < total; ++i) {
              if (menus[i] !== __privateGet(this, _menu2)) {
                menus[i].setAttribute("aria-hidden", "true");
              }
            }
            if (__privateGet(this, _menu2).getAttribute("aria-hidden") === "true") {
              __privateGet(this, _menu2).setAttribute("aria-hidden", "false");
            } else {
              __privateGet(this, _menu2).setAttribute("aria-hidden", "true");
            }
          }
        };
        __privateGet(this, _events2).button.mouseover = () => {
          if (!IS_IOS && !IS_ANDROID) {
            const menus = __privateGet(this, _player3).getContainer().querySelectorAll(".op-settings");
            for (let i = 0, total = menus.length; i < total; ++i) {
              if (menus[i] !== __privateGet(this, _menu2)) {
                menus[i].setAttribute("aria-hidden", "true");
              }
            }
            if (__privateGet(this, _menu2).getAttribute("aria-hidden") === "true") {
              __privateGet(this, _menu2).setAttribute("aria-hidden", "false");
            }
          }
        };
        __privateGet(this, _events2).button.mouseout = () => {
          if (!IS_IOS && !IS_ANDROID) {
            const menus = __privateGet(this, _player3).getContainer().querySelectorAll(".op-settings");
            for (let i = 0, total = menus.length; i < total; ++i) {
              menus[i].setAttribute("aria-hidden", "true");
            }
            if (__privateGet(this, _menu2).getAttribute("aria-hidden") === "false") {
              __privateGet(this, _menu2).setAttribute("aria-hidden", "true");
            }
          }
        };
        __privateGet(this, _button3).addEventListener("click", __privateGet(this, _events2).button.click, EVENT_OPTIONS);
        __privateGet(this, _button3).addEventListener("mouseover", __privateGet(this, _events2).button.mouseover, EVENT_OPTIONS);
        __privateGet(this, _menu2).addEventListener("mouseover", __privateGet(this, _events2).button.mouseover, EVENT_OPTIONS);
        __privateGet(this, _menu2).addEventListener("mouseout", __privateGet(this, _events2).button.mouseout, EVENT_OPTIONS);
        __privateGet(this, _player3).getElement().addEventListener("controlshidden", __privateGet(this, _events2).button.mouseout, EVENT_OPTIONS);
      }
      __privateGet(this, _events2).global.click = (e) => {
        const option = e.target;
        const { currentTime } = __privateGet(this, _player3).getMedia();
        const isPaused = __privateGet(this, _player3).getMedia().paused;
        if (option.closest(`#${__privateGet(this, _player3).id}`) && option.classList.contains("op-levels__option")) {
          const levelVal = option.getAttribute("data-value");
          const level = levelVal ? levelVal.replace("levels-", "") : "-1";
          __privateSet(this, _defaultLevel, `${level}`);
          if (detachMenus) {
            __privateGet(this, _button3).setAttribute("data-active-level", `${level}`);
            __privateGet(this, _button3).innerHTML = `<span>${sanitize(option.innerText, true)}</span>`;
            const levels = option.parentElement && option.parentElement.parentElement ? option.parentElement.parentElement.querySelectorAll(".op-settings__submenu-item") : [];
            for (let i = 0, total = levels.length; i < total; ++i) {
              levels[i].setAttribute("aria-checked", "false");
            }
            if (option.parentElement) {
              option.parentElement.setAttribute("aria-checked", "true");
            }
            __privateGet(this, _menu2).setAttribute("aria-hidden", "false");
          }
          __privateGet(this, _player3).getMedia().level = level;
          __privateGet(this, _player3).getMedia().currentTime = currentTime;
          if (!isPaused) {
            __privateGet(this, _player3).play();
          }
          const event = addEvent("levelchanged", {
            detail: {
              label: option.innerText.trim(),
              level
            }
          });
          __privateGet(this, _player3).getElement().dispatchEvent(event);
          e.preventDefault();
          e.stopPropagation();
        }
      };
      const connection = (NAV == null ? void 0 : NAV.connection) || (NAV == null ? void 0 : NAV.mozConnection) || (NAV == null ? void 0 : NAV.webkitConnection);
      __privateGet(this, _events2).global.connection = () => {
        const media = __privateGet(this, _player3).getMedia().current;
        if (!isDashSource(media) && !isHlsSource(media)) {
          const type = (connection == null ? void 0 : connection.effectiveType) || "";
          const levels = __privateGet(this, _levels).map((item) => ({
            ...item,
            resolution: parseInt(item.label.replace("p", ""), 10)
          }));
          let level = levels.find((item) => item.resolution < 360);
          if (type === "4g") {
            level = levels.find((item) => item.resolution >= 720);
          } else if (type === "3g") {
            level = levels.find((item) => item.resolution >= 360 && item.resolution < 720);
          }
          if (level) {
            __privateGet(this, _player3).pause();
            __privateGet(this, _player3).getMedia().level = level.id;
            __privateGet(this, _player3).play();
          }
        }
      };
      Object.keys(__privateGet(this, _events2).media).forEach((event) => {
        __privateGet(this, _player3).getElement().addEventListener(event, __privateGet(this, _events2).media[event], EVENT_OPTIONS);
      });
      document.addEventListener("click", __privateGet(this, _events2).global.click, EVENT_OPTIONS);
      if (connection) {
        connection.addEventListener("change", __privateGet(this, _events2).global.connection, EVENT_OPTIONS);
      }
    }
    destroy() {
      const { detachMenus } = __privateGet(this, _player3).getOptions();
      const connection = (NAV == null ? void 0 : NAV.connection) || (NAV == null ? void 0 : NAV.mozConnection) || (NAV == null ? void 0 : NAV.webkitConnection);
      Object.keys(__privateGet(this, _events2).media).forEach((event) => {
        __privateGet(this, _player3).getElement().removeEventListener(event, __privateGet(this, _events2).media[event]);
      });
      document.removeEventListener("click", __privateGet(this, _events2).global.click);
      if (connection) {
        connection.removeEventListener("change", __privateGet(this, _events2).global.connection);
      }
      if (detachMenus) {
        __privateGet(this, _button3).removeEventListener("click", __privateGet(this, _events2).button.click);
        __privateGet(this, _button3).remove();
        __privateGet(this, _button3).removeEventListener("mouseover", __privateGet(this, _events2).button.mouseover);
        __privateGet(this, _menu2).removeEventListener("mouseover", __privateGet(this, _events2).button.mouseover);
        __privateGet(this, _menu2).removeEventListener("mouseout", __privateGet(this, _events2).button.mouseout);
        __privateGet(this, _player3).getElement().removeEventListener("controlshidden", __privateGet(this, _events2).button.mouseout);
        __privateGet(this, _menu2).remove();
      }
    }
    addSettings() {
      const { labels, detachMenus } = __privateGet(this, _player3).getOptions();
      if (detachMenus) {
        return {};
      }
      const subitems = this._formatMenuItems();
      return subitems.length > 2 ? {
        className: "op-levels__option",
        default: __privateGet(this, _defaultLevel) || "-1",
        key: "levels",
        name: labels == null ? void 0 : labels.levels,
        subitems
      } : {};
    }
    _formatMenuItems() {
      const { labels } = __privateGet(this, _player3).getOptions();
      const levels = this._gatherLevels();
      const total = levels.length;
      let items = total ? [{ key: "-1", label: labels == null ? void 0 : labels.auto }] : [];
      for (let i = 0; i < total; i++) {
        const level = levels[i];
        items = items.filter((el) => el.key !== level.id);
        items.push({ key: level.id, label: level.label });
      }
      return items.reduce((acc, current) => {
        const duplicate = acc.find((item) => item.label === current.label);
        if (!duplicate) {
          return acc.concat([current]);
        }
        return acc;
      }, []).sort((a, b) => parseInt((a == null ? void 0 : a.label) || "", 10) > parseInt((b == null ? void 0 : b.label) || "", 10) ? 1 : -1);
    }
    // @see https://en.wikipedia.org/wiki/Computer_display_standard#Standards
    _getResolutionsLabel(height) {
      const { labels } = __privateGet(this, _player3).getOptions();
      if (height >= 4320) {
        return "8K";
      }
      if (height >= 2160) {
        return "4K";
      }
      if (height >= 1440) {
        return "1440p";
      }
      if (height >= 1080) {
        return "1080p";
      }
      if (height >= 720) {
        return "720p";
      }
      if (height >= 480) {
        return "480p";
      }
      if (height >= 360) {
        return "360p";
      }
      if (height >= 240) {
        return "240p";
      }
      if (height >= 144) {
        return "144p";
      }
      return (labels == null ? void 0 : labels.auto) || "";
    }
    _gatherLevels() {
      if (!__privateGet(this, _levels).length) {
        __privateGet(this, _player3).getMedia().levels.forEach((level) => {
          __privateGet(this, _levels).push({ ...level, label: level.label || this._getResolutionsLabel(level.height) });
        });
      }
      return __privateGet(this, _levels);
    }
    _buildMenu() {
      const { detachMenus } = __privateGet(this, _player3).getOptions();
      if (detachMenus) {
        __privateGet(this, _button3).classList.add("op-control--no-hover");
        __privateSet(this, _menu2, document.createElement("div"));
        __privateGet(this, _menu2).className = "op-settings op-levels__menu";
        __privateGet(this, _menu2).setAttribute("aria-hidden", "true");
        const className = "op-levels__option";
        const options = this._formatMenuItems();
        const menu = `<div class="op-settings__menu" role="menu" id="menu-item-levels">
                ${options.map(
          (item) => `
                <div class="op-settings__submenu-item" tabindex="0" role="menuitemradio"
                    aria-checked="${__privateGet(this, _defaultLevel) === item.key ? "true" : "false"}">
                    <div class="op-settings__submenu-label ${className}" data-value="levels-${item.key}">${item.label}</div>
                </div>`
        ).join("")}
            </div>`;
        __privateGet(this, _menu2).innerHTML = menu;
        const itemContainer = document.createElement("div");
        itemContainer.className = `op-controls__container op-control__${__privateGet(this, _controlPosition3)}`;
        itemContainer.appendChild(__privateGet(this, _button3));
        itemContainer.appendChild(__privateGet(this, _menu2));
        __privateGet(this, _player3).getControls().getLayer(__privateGet(this, _controlLayer3)).appendChild(itemContainer);
      }
    }
  }
  _player3 = new WeakMap();
  _button3 = new WeakMap();
  _menu2 = new WeakMap();
  _events2 = new WeakMap();
  _levels = new WeakMap();
  _defaultLevel = new WeakMap();
  _controlPosition3 = new WeakMap();
  _controlLayer3 = new WeakMap();
  class Play {
    constructor(player, position, layer) {
      __privateAdd(this, _player4, void 0);
      __privateAdd(this, _button4, void 0);
      __privateAdd(this, _events3, {
        controls: {},
        media: {}
      });
      __privateAdd(this, _controlPosition4, void 0);
      __privateAdd(this, _controlLayer4, void 0);
      __privateSet(this, _player4, player);
      __privateSet(this, _controlPosition4, position);
      __privateSet(this, _controlLayer4, layer);
      this._enterSpaceKeyEvent = this._enterSpaceKeyEvent.bind(this);
    }
    create() {
      var _a;
      const { labels } = __privateGet(this, _player4).getOptions();
      __privateSet(this, _button4, document.createElement("button"));
      __privateGet(this, _button4).type = "button";
      __privateGet(this, _button4).className = `op-controls__playpause op-control__${__privateGet(this, _controlPosition4)}`;
      __privateGet(this, _button4).tabIndex = 0;
      __privateGet(this, _button4).title = (labels == null ? void 0 : labels.play) || "";
      __privateGet(this, _button4).setAttribute("aria-controls", __privateGet(this, _player4).id);
      __privateGet(this, _button4).setAttribute("aria-pressed", "false");
      __privateGet(this, _button4).setAttribute("aria-label", (labels == null ? void 0 : labels.play) || "");
      __privateGet(this, _player4).getControls().getLayer(__privateGet(this, _controlLayer4)).appendChild(__privateGet(this, _button4));
      __privateGet(this, _events3).button = (e) => {
        __privateGet(this, _button4).setAttribute("aria-pressed", "true");
        const el = __privateGet(this, _player4).activeElement();
        if (el.paused || el.ended) {
          if (__privateGet(this, _player4).getAd()) {
            __privateGet(this, _player4).getAd().playRequested = true;
          }
          el.play();
          __privateGet(this, _events3).media.play();
        } else {
          el.pause();
          __privateGet(this, _events3).media.pause();
        }
        e.preventDefault();
        e.stopPropagation();
      };
      const isAudioEl = isAudio(__privateGet(this, _player4).getElement());
      __privateGet(this, _events3).media.play = () => {
        var _a2;
        if (__privateGet(this, _player4).activeElement().ended) {
          if (__privateGet(this, _player4).isMedia()) {
            __privateGet(this, _button4).classList.add("op-controls__playpause--replay");
          } else {
            __privateGet(this, _button4).classList.add("op-controls__playpause--pause");
          }
          __privateGet(this, _button4).title = (labels == null ? void 0 : labels.play) || "";
          __privateGet(this, _button4).setAttribute("aria-label", (labels == null ? void 0 : labels.play) || "");
        } else {
          __privateGet(this, _button4).classList.remove("op-controls__playpause--replay");
          __privateGet(this, _button4).classList.add("op-controls__playpause--pause");
          __privateGet(this, _button4).title = (labels == null ? void 0 : labels.pause) || "";
          __privateGet(this, _button4).setAttribute("aria-label", (labels == null ? void 0 : labels.pause) || "");
          if ((_a2 = __privateGet(this, _player4).getOptions()) == null ? void 0 : _a2.pauseOthers) {
            Object.keys(Player$1.instances).forEach((key) => {
              if (key !== __privateGet(this, _player4).id) {
                const target = Player$1.instances[key].activeElement();
                target.pause();
              }
            });
          }
        }
      };
      __privateGet(this, _events3).media.loadedmetadata = () => {
        if (__privateGet(this, _button4).classList.contains("op-controls__playpause--pause")) {
          __privateGet(this, _button4).classList.remove("op-controls__playpause--replay");
          __privateGet(this, _button4).classList.remove("op-controls__playpause--pause");
          __privateGet(this, _button4).title = (labels == null ? void 0 : labels.play) || "";
          __privateGet(this, _button4).setAttribute("aria-label", (labels == null ? void 0 : labels.play) || "");
        }
      };
      __privateGet(this, _events3).media.playing = () => {
        if (!__privateGet(this, _button4).classList.contains("op-controls__playpause--pause")) {
          __privateGet(this, _button4).classList.remove("op-controls__playpause--replay");
          __privateGet(this, _button4).classList.add("op-controls__playpause--pause");
          __privateGet(this, _button4).title = (labels == null ? void 0 : labels.pause) || "";
          __privateGet(this, _button4).setAttribute("aria-label", (labels == null ? void 0 : labels.pause) || "");
        }
      };
      __privateGet(this, _events3).media.pause = () => {
        __privateGet(this, _button4).classList.remove("op-controls__playpause--pause");
        __privateGet(this, _button4).title = (labels == null ? void 0 : labels.play) || "";
        __privateGet(this, _button4).setAttribute("aria-label", (labels == null ? void 0 : labels.play) || "");
      };
      __privateGet(this, _events3).media.ended = () => {
        if (__privateGet(this, _player4).activeElement().ended && __privateGet(this, _player4).isMedia()) {
          __privateGet(this, _button4).classList.add("op-controls__playpause--replay");
          __privateGet(this, _button4).classList.remove("op-controls__playpause--pause");
        } else if (__privateGet(this, _player4).getElement().currentTime >= __privateGet(this, _player4).getElement().duration || __privateGet(this, _player4).getElement().currentTime <= 0) {
          __privateGet(this, _button4).classList.add("op-controls__playpause--replay");
          __privateGet(this, _button4).classList.remove("op-controls__playpause--pause");
        } else {
          __privateGet(this, _button4).classList.remove("op-controls__playpause--replay");
          __privateGet(this, _button4).classList.add("op-controls__playpause--pause");
        }
        __privateGet(this, _button4).title = (labels == null ? void 0 : labels.play) || "";
        __privateGet(this, _button4).setAttribute("aria-label", (labels == null ? void 0 : labels.play) || "");
      };
      __privateGet(this, _events3).media.adsmediaended = () => {
        __privateGet(this, _button4).classList.remove("op-controls__playpause--replay");
        __privateGet(this, _button4).classList.add("op-controls__playpause--pause");
        __privateGet(this, _button4).title = (labels == null ? void 0 : labels.pause) || "";
        __privateGet(this, _button4).setAttribute("aria-label", (labels == null ? void 0 : labels.pause) || "");
      };
      __privateGet(this, _events3).media.playererror = () => {
        if (isAudioEl) {
          const el = __privateGet(this, _player4).activeElement();
          el.pause();
        }
      };
      const element = __privateGet(this, _player4).getElement();
      __privateGet(this, _events3).controls.controlschanged = () => {
        if (!__privateGet(this, _player4).activeElement().paused) {
          const event = addEvent("playing");
          element.dispatchEvent(event);
        }
      };
      Object.keys(__privateGet(this, _events3).media).forEach((event) => {
        element.addEventListener(event, __privateGet(this, _events3).media[event], EVENT_OPTIONS);
      });
      if ((_a = __privateGet(this, _player4).getOptions().media) == null ? void 0 : _a.pauseOnClick) {
        element.addEventListener("click", __privateGet(this, _events3).button, EVENT_OPTIONS);
      }
      __privateGet(this, _player4).getControls().getContainer().addEventListener("controlschanged", __privateGet(this, _events3).controls.controlschanged, EVENT_OPTIONS);
      __privateGet(this, _player4).getContainer().addEventListener("keydown", this._enterSpaceKeyEvent, EVENT_OPTIONS);
      __privateGet(this, _button4).addEventListener("click", __privateGet(this, _events3).button, EVENT_OPTIONS);
    }
    destroy() {
      var _a;
      Object.keys(__privateGet(this, _events3).media).forEach((event) => {
        __privateGet(this, _player4).getElement().removeEventListener(event, __privateGet(this, _events3).media[event]);
      });
      if ((_a = __privateGet(this, _player4).getOptions().media) == null ? void 0 : _a.pauseOnClick) {
        __privateGet(this, _player4).getElement().removeEventListener("click", __privateGet(this, _events3).button);
      }
      __privateGet(this, _player4).getControls().getContainer().removeEventListener("controlschanged", __privateGet(this, _events3).controls.controlschanged);
      __privateGet(this, _player4).getContainer().removeEventListener("keydown", this._enterSpaceKeyEvent);
      __privateGet(this, _button4).removeEventListener("click", __privateGet(this, _events3).button);
      __privateGet(this, _button4).remove();
    }
    _enterSpaceKeyEvent(e) {
      var _a;
      const key = e.which || e.keyCode || 0;
      const playBtnFocused = (_a = document == null ? void 0 : document.activeElement) == null ? void 0 : _a.classList.contains("op-controls__playpause");
      if (playBtnFocused && (key === 13 || key === 32)) {
        __privateGet(this, _events3).button(e);
      }
    }
  }
  _player4 = new WeakMap();
  _button4 = new WeakMap();
  _events3 = new WeakMap();
  _controlPosition4 = new WeakMap();
  _controlLayer4 = new WeakMap();
  function formatTime(seconds, frameRate) {
    const f = Math.floor(seconds % 1 * 0);
    let s = Math.floor(seconds);
    let m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const wrap = (value) => {
      const formattedVal = value.toString();
      if (value < 10) {
        if (value <= 0) {
          return "00";
        }
        return `0${formattedVal}`;
      }
      return formattedVal;
    };
    m %= 60;
    s %= 60;
    return `${h > 0 ? `${wrap(h)}:` : ""}${wrap(m)}:${wrap(s)}${f ? `:${wrap(f)}` : ""}`;
  }
  class Progress {
    constructor(player, position, layer) {
      __privateAdd(this, _player5, void 0);
      __privateAdd(this, _progress, void 0);
      __privateAdd(this, _slider, void 0);
      __privateAdd(this, _buffer, void 0);
      __privateAdd(this, _played, void 0);
      __privateAdd(this, _tooltip, void 0);
      __privateAdd(this, _events4, {
        container: {},
        controls: {},
        global: {},
        media: {},
        slider: {}
      });
      __privateAdd(this, _forcePause, false);
      __privateAdd(this, _controlPosition5, void 0);
      __privateAdd(this, _controlLayer5, void 0);
      __privateSet(this, _player5, player);
      __privateSet(this, _controlPosition5, position);
      __privateSet(this, _controlLayer5, layer);
      this._enterSpaceKeyEvent = this._enterSpaceKeyEvent.bind(this);
    }
    create() {
      var _a;
      const { labels, progress } = __privateGet(this, _player5).getOptions();
      __privateSet(this, _progress, document.createElement("div"));
      __privateGet(this, _progress).className = `op-controls__progress op-control__${__privateGet(this, _controlPosition5)}`;
      __privateGet(this, _progress).tabIndex = 0;
      __privateGet(this, _progress).setAttribute("aria-label", (labels == null ? void 0 : labels.progressSlider) || "");
      __privateGet(this, _progress).setAttribute("aria-valuemin", "0");
      __privateGet(this, _progress).setAttribute("aria-valuenow", "0");
      __privateGet(this, _progress).setAttribute("role", "slider");
      __privateSet(this, _slider, document.createElement("input"));
      __privateGet(this, _slider).type = "range";
      __privateGet(this, _slider).className = "op-controls__progress--seek";
      __privateGet(this, _slider).tabIndex = -1;
      __privateGet(this, _slider).setAttribute("min", "0");
      __privateGet(this, _slider).setAttribute("step", "0.1");
      __privateGet(this, _slider).value = "0";
      __privateGet(this, _slider).setAttribute("aria-label", (labels == null ? void 0 : labels.progressRail) || "");
      __privateGet(this, _slider).setAttribute("role", "slider");
      __privateSet(this, _buffer, document.createElement("progress"));
      __privateGet(this, _buffer).className = "op-controls__progress--buffer";
      __privateGet(this, _buffer).setAttribute("max", "100");
      __privateGet(this, _buffer).value = 0;
      __privateSet(this, _played, document.createElement("progress"));
      __privateGet(this, _played).className = "op-controls__progress--played";
      __privateGet(this, _played).setAttribute("max", "100");
      __privateGet(this, _played).value = 0;
      __privateGet(this, _progress).appendChild(__privateGet(this, _slider));
      __privateGet(this, _progress).appendChild(__privateGet(this, _played));
      __privateGet(this, _progress).appendChild(__privateGet(this, _buffer));
      if (!IS_IOS && !IS_ANDROID) {
        __privateSet(this, _tooltip, document.createElement("span"));
        __privateGet(this, _tooltip).className = "op-controls__tooltip";
        __privateGet(this, _tooltip).tabIndex = -1;
        __privateGet(this, _tooltip).innerHTML = "00:00";
        __privateGet(this, _progress).appendChild(__privateGet(this, _tooltip));
      }
      const setInitialProgress = () => {
        var _a2;
        if (__privateGet(this, _slider).classList.contains("error")) {
          __privateGet(this, _slider).classList.remove("error");
        }
        const el = __privateGet(this, _player5).activeElement();
        if (el.duration !== Infinity && !__privateGet(this, _player5).getElement().getAttribute("op-live__enabled") && !__privateGet(this, _player5).getElement().getAttribute("op-dvr__enabled")) {
          const current = __privateGet(this, _player5).isMedia() ? el.currentTime : el.duration - el.currentTime;
          __privateGet(this, _slider).value = current.toString();
          if (!Number.isNaN(el.duration)) {
            __privateGet(this, _slider).setAttribute("max", `${el.duration}`);
            __privateGet(this, _progress).setAttribute("aria-valuemax", el.duration.toString());
          }
        } else if (__privateGet(this, _player5).getElement().getAttribute("op-dvr__enabled")) {
          __privateGet(this, _slider).setAttribute("max", "1");
          __privateGet(this, _slider).value = "1";
          __privateGet(this, _slider).style.backgroundSize = "100% 100%";
          __privateGet(this, _played).value = 1;
          __privateGet(this, _progress).setAttribute("aria-valuemax", "1");
          __privateGet(this, _progress).setAttribute("aria-hidden", "false");
        } else if (!((_a2 = __privateGet(this, _player5).getOptions().live) == null ? void 0 : _a2.showProgress)) {
          __privateGet(this, _progress).setAttribute("aria-hidden", "true");
        }
      };
      let lastCurrentTime = 0;
      const defaultDuration = ((_a = __privateGet(this, _player5).getOptions().progress) == null ? void 0 : _a.duration) || 0;
      const isAudioEl = isAudio(__privateGet(this, _player5).getElement());
      __privateGet(this, _events4).media.loadedmetadata = setInitialProgress.bind(this);
      __privateGet(this, _events4).controls.controlschanged = setInitialProgress.bind(this);
      __privateGet(this, _events4).media.progress = (e) => {
        var _a2;
        const el = e.target;
        if (el.duration !== Infinity && !__privateGet(this, _player5).getElement().getAttribute("op-live__enabled")) {
          if (el.duration > 0) {
            for (let i = 0, total = el.buffered.length; i < total; i++) {
              if (el.buffered.start(el.buffered.length - 1 - i) < el.currentTime) {
                __privateGet(this, _buffer).value = el.buffered.end(el.buffered.length - 1 - i) / el.duration * 100;
                break;
              }
            }
          }
        } else if (!__privateGet(this, _player5).getElement().getAttribute("op-dvr__enabled") && __privateGet(this, _progress).getAttribute("aria-hidden") === "false" && !((_a2 = __privateGet(this, _player5).getOptions().live) == null ? void 0 : _a2.showProgress)) {
          __privateGet(this, _progress).setAttribute("aria-hidden", "true");
        }
      };
      __privateGet(this, _events4).media.waiting = () => {
        if (isAudioEl && !__privateGet(this, _slider).classList.contains("loading")) {
          __privateGet(this, _slider).classList.add("loading");
        }
        if (isAudioEl && __privateGet(this, _slider).classList.contains("error")) {
          __privateGet(this, _slider).classList.remove("error");
        }
      };
      __privateGet(this, _events4).media.playererror = () => {
        if (isAudioEl && !__privateGet(this, _slider).classList.contains("error")) {
          __privateGet(this, _slider).classList.add("error");
        }
        if (isAudioEl && __privateGet(this, _slider).classList.contains("loading")) {
          __privateGet(this, _slider).classList.remove("loading");
        }
      };
      __privateGet(this, _events4).media.pause = () => {
        const el = __privateGet(this, _player5).activeElement();
        if (el.duration !== Infinity && !__privateGet(this, _player5).getElement().getAttribute("op-live__enabled")) {
          const current = el.currentTime;
          __privateGet(this, _progress).setAttribute("aria-valuenow", current.toString());
          __privateGet(this, _progress).setAttribute("aria-valuetext", formatTime(current));
        }
      };
      __privateGet(this, _events4).media.play = () => {
        if (isAudioEl && __privateGet(this, _slider).classList.contains("loading")) {
          __privateGet(this, _slider).classList.remove("loading");
        }
        if (isAudioEl && __privateGet(this, _slider).classList.contains("error")) {
          __privateGet(this, _slider).classList.remove("error");
        }
        if (__privateGet(this, _player5).activeElement().duration !== Infinity && !__privateGet(this, _player5).getElement().getAttribute("op-live__enabled")) {
          __privateGet(this, _progress).removeAttribute("aria-valuenow");
          __privateGet(this, _progress).removeAttribute("aria-valuetext");
        }
      };
      __privateGet(this, _events4).media.playing = () => {
        if (isAudioEl && __privateGet(this, _slider).classList.contains("loading")) {
          __privateGet(this, _slider).classList.remove("loading");
        }
        if (isAudioEl && __privateGet(this, _slider).classList.contains("error")) {
          __privateGet(this, _slider).classList.remove("error");
        }
      };
      __privateGet(this, _events4).media.timeupdate = () => {
        var _a2;
        const el = __privateGet(this, _player5).activeElement();
        if (el.duration !== Infinity && (!__privateGet(this, _player5).getElement().getAttribute("op-live__enabled") || __privateGet(this, _player5).getElement().getAttribute("op-dvr__enabled"))) {
          if (!__privateGet(this, _slider).getAttribute("max") || __privateGet(this, _slider).getAttribute("max") === "0" || parseFloat(__privateGet(this, _slider).getAttribute("max") || "-1") !== el.duration) {
            if (!Number.isNaN(el.duration)) {
              __privateGet(this, _slider).setAttribute("max", `${el.duration}`);
            }
            __privateGet(this, _progress).setAttribute("aria-hidden", "false");
          }
          const duration = el.duration - el.currentTime + 1 >= 100 ? 100 : el.duration - el.currentTime + 1;
          const current = __privateGet(this, _player5).isMedia() ? el.currentTime : duration;
          const min = parseFloat(__privateGet(this, _slider).min);
          const max = parseFloat(__privateGet(this, _slider).max);
          __privateGet(this, _slider).value = current.toString();
          __privateGet(this, _slider).style.backgroundSize = `${(current - min) * 100 / (max - min)}% 100%`;
          __privateGet(this, _played).value = el.duration <= 0 || Number.isNaN(el.duration) || !Number.isFinite(el.duration) ? defaultDuration : current / el.duration * 100;
          if (__privateGet(this, _player5).getElement().getAttribute("op-dvr__enabled") && Math.floor(__privateGet(this, _played).value) >= 99) {
            lastCurrentTime = el.currentTime;
            __privateGet(this, _progress).setAttribute("aria-hidden", "false");
          }
        } else if (!__privateGet(this, _player5).getElement().getAttribute("op-dvr__enabled") && __privateGet(this, _progress).getAttribute("aria-hidden") === "false" && !((_a2 = __privateGet(this, _player5).getOptions().live) == null ? void 0 : _a2.showProgress)) {
          __privateGet(this, _progress).setAttribute("aria-hidden", "true");
        }
      };
      __privateGet(this, _events4).media.durationchange = () => {
        const el = __privateGet(this, _player5).activeElement();
        const current = __privateGet(this, _player5).isMedia() ? el.currentTime : el.duration - el.currentTime;
        if (!Number.isNaN(el.duration)) {
          __privateGet(this, _slider).setAttribute("max", `${el.duration}`);
          __privateGet(this, _progress).setAttribute("aria-valuemax", el.duration.toString());
        }
        __privateGet(this, _played).value = el.duration <= 0 || Number.isNaN(el.duration) || !Number.isFinite(el.duration) ? defaultDuration : current / el.duration * 100;
      };
      __privateGet(this, _events4).media.ended = () => {
        __privateGet(this, _slider).style.backgroundSize = "0% 100%";
        if (__privateGet(this, _slider).getAttribute("max")) {
          __privateGet(this, _slider).setAttribute("max", "0");
        }
        __privateGet(this, _buffer).value = 0;
        __privateGet(this, _played).value = 0;
      };
      const updateSlider = (e) => {
        const el = __privateGet(this, _player5).activeElement();
        const target = e.target;
        const value = parseFloat(target.value);
        if (__privateGet(this, _slider).classList.contains("op-progress--pressed") || value < el.currentTime && !(progress == null ? void 0 : progress.allowRewind) || value > el.currentTime && !(progress == null ? void 0 : progress.allowSkip)) {
          __privateGet(this, _slider).value = el.currentTime.toString();
          return;
        }
        __privateGet(this, _slider).classList.add(".op-progress--pressed");
        const min = parseFloat(target.min);
        const max = parseFloat(target.max);
        const val = parseFloat(target.value);
        __privateGet(this, _slider).style.backgroundSize = `${(val - min) * 100 / (max - min)}% 100%`;
        __privateGet(this, _played).value = el.duration <= 0 || Number.isNaN(el.duration) || !Number.isFinite(el.duration) ? defaultDuration : val / el.duration * 100;
        if (__privateGet(this, _player5).getElement().getAttribute("op-dvr__enabled")) {
          el.currentTime = Math.round(__privateGet(this, _played).value) >= 99 ? lastCurrentTime : val;
        } else {
          el.currentTime = val;
        }
        __privateGet(this, _slider).classList.remove(".op-progress--pressed");
      };
      const forcePause = (e) => {
        const el = __privateGet(this, _player5).activeElement();
        const key = e.which || e.keyCode || 0;
        const target = __privateGet(this, _slider);
        const value = Math.round(Number(target.value));
        const current = Math.round(el.currentTime);
        const isProgressManipulationAllowed = value < current && (progress == null ? void 0 : progress.allowRewind) || value >= current && (progress == null ? void 0 : progress.allowSkip);
        if (isProgressManipulationAllowed && (key === 1 || key === 0) && __privateGet(this, _player5).isMedia() && !el.paused) {
          el.pause();
          __privateSet(this, _forcePause, true);
        }
      };
      const releasePause = () => {
        const el = __privateGet(this, _player5).activeElement();
        if (__privateGet(this, _forcePause) === true && __privateGet(this, _player5).isMedia()) {
          if (el.paused) {
            el.play();
            __privateSet(this, _forcePause, false);
          }
        }
      };
      const mobileForcePause = (e) => {
        var _a2;
        const el = __privateGet(this, _player5).activeElement();
        if (el.duration !== Infinity) {
          const { changedTouches } = e;
          const x = ((_a2 = changedTouches[0]) == null ? void 0 : _a2.pageX) || 0;
          const pos = x - offset(__privateGet(this, _progress)).left;
          const percentage = pos / __privateGet(this, _progress).offsetWidth;
          const time = percentage * el.duration;
          if (time < el.currentTime && (progress == null ? void 0 : progress.allowRewind) || time > el.currentTime && (progress == null ? void 0 : progress.allowSkip)) {
            __privateGet(this, _slider).value = time.toString();
            updateSlider(e);
            if (!el.paused) {
              el.pause();
              __privateSet(this, _forcePause, true);
            }
          }
        }
      };
      __privateGet(this, _events4).slider.input = updateSlider.bind(this);
      __privateGet(this, _events4).slider.change = updateSlider.bind(this);
      __privateGet(this, _events4).slider.mousedown = forcePause.bind(this);
      __privateGet(this, _events4).slider.mouseup = releasePause.bind(this);
      __privateGet(this, _events4).slider.touchstart = mobileForcePause.bind(this);
      __privateGet(this, _events4).slider.touchend = releasePause.bind(this);
      if (!IS_IOS && !IS_ANDROID) {
        __privateGet(this, _events4).container.mousemove = (e) => {
          const el = __privateGet(this, _player5).activeElement();
          if (el.duration !== Infinity && !__privateGet(this, _player5).isAd()) {
            const x = e.pageX;
            let pos = x - offset(__privateGet(this, _progress)).left;
            const half = __privateGet(this, _tooltip).offsetWidth / 2;
            const percentage = pos / __privateGet(this, _progress).offsetWidth;
            const time = percentage * el.duration;
            const mediaContainer = __privateGet(this, _player5).getContainer();
            const limit = mediaContainer.offsetWidth - __privateGet(this, _tooltip).offsetWidth;
            if (pos <= 0 || x - offset(mediaContainer).left <= half) {
              pos = 0;
            } else if (x - offset(mediaContainer).left >= limit) {
              pos = limit - offset(__privateGet(this, _slider)).left - 10;
            } else {
              pos -= half;
            }
            if (percentage >= 0 && percentage <= 1) {
              __privateGet(this, _tooltip).classList.add("op-controls__tooltip--visible");
            } else {
              __privateGet(this, _tooltip).classList.remove("op-controls__tooltip--visible");
            }
            __privateGet(this, _tooltip).style.left = `${pos}px`;
            __privateGet(this, _tooltip).innerHTML = Number.isNaN(time) ? "00:00" : formatTime(time);
          }
        };
        __privateGet(this, _events4).global.mousemove = (e) => {
          if (!e.target.closest(".op-controls__progress") || __privateGet(this, _player5).isAd()) {
            __privateGet(this, _tooltip).classList.remove("op-controls__tooltip--visible");
          }
        };
      }
      Object.keys(__privateGet(this, _events4).media).forEach((event) => {
        __privateGet(this, _player5).getElement().addEventListener(event, __privateGet(this, _events4).media[event], EVENT_OPTIONS);
      });
      Object.keys(__privateGet(this, _events4).slider).forEach((event) => {
        __privateGet(this, _slider).addEventListener(event, __privateGet(this, _events4).slider[event], EVENT_OPTIONS);
      });
      __privateGet(this, _progress).addEventListener("keydown", __privateGet(this, _player5).getEvents().keydown, EVENT_OPTIONS);
      __privateGet(this, _progress).addEventListener("mousemove", __privateGet(this, _events4).container.mousemove, EVENT_OPTIONS);
      document.addEventListener("mousemove", __privateGet(this, _events4).global.mousemove, EVENT_OPTIONS);
      __privateGet(this, _player5).getContainer().addEventListener("keydown", this._enterSpaceKeyEvent, EVENT_OPTIONS);
      __privateGet(this, _player5).getControls().getContainer().addEventListener("controlschanged", __privateGet(this, _events4).controls.controlschanged, EVENT_OPTIONS);
      __privateGet(this, _player5).getControls().getLayer(__privateGet(this, _controlLayer5)).appendChild(__privateGet(this, _progress));
    }
    destroy() {
      Object.keys(__privateGet(this, _events4)).forEach((event) => {
        __privateGet(this, _player5).getElement().removeEventListener(event, __privateGet(this, _events4)[event]);
      });
      Object.keys(__privateGet(this, _events4).slider).forEach((event) => {
        __privateGet(this, _slider).removeEventListener(event, __privateGet(this, _events4).slider[event]);
      });
      __privateGet(this, _progress).removeEventListener("keydown", __privateGet(this, _player5).getEvents().keydown);
      __privateGet(this, _progress).removeEventListener("mousemove", __privateGet(this, _events4).container.mousemove);
      document.removeEventListener("mousemove", __privateGet(this, _events4).global.mousemove);
      __privateGet(this, _player5).getContainer().removeEventListener("keydown", this._enterSpaceKeyEvent);
      __privateGet(this, _player5).getControls().getContainer().removeEventListener("controlschanged", __privateGet(this, _events4).controls.controlschanged);
      __privateGet(this, _buffer).remove();
      __privateGet(this, _played).remove();
      __privateGet(this, _slider).remove();
      if (!IS_IOS && !IS_ANDROID) {
        __privateGet(this, _tooltip).remove();
      }
      __privateGet(this, _progress).remove();
    }
    _enterSpaceKeyEvent(e) {
      const el = __privateGet(this, _player5).activeElement();
      const isAd = __privateGet(this, _player5).isAd();
      const key = e.which || e.keyCode || 0;
      if (!isAd && key >= 48 && key <= 57 && el.duration !== Infinity) {
        let step = 0;
        for (let i = 48, limit = 57; i <= limit; i++) {
          if (i < key) {
            step++;
          }
        }
        el.currentTime = el.duration * (0.1 * step);
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }
  _player5 = new WeakMap();
  _progress = new WeakMap();
  _slider = new WeakMap();
  _buffer = new WeakMap();
  _played = new WeakMap();
  _tooltip = new WeakMap();
  _events4 = new WeakMap();
  _forcePause = new WeakMap();
  _controlPosition5 = new WeakMap();
  _controlLayer5 = new WeakMap();
  class Settings {
    constructor(player, position, layer) {
      __privateAdd(this, _player6, void 0);
      __privateAdd(this, _submenu, {});
      __privateAdd(this, _button5, void 0);
      __privateAdd(this, _menu3, void 0);
      __privateAdd(this, _events5, {
        global: {},
        media: {}
      });
      __privateAdd(this, _originalOutput, "");
      __privateAdd(this, _controlPosition6, void 0);
      __privateAdd(this, _controlLayer6, void 0);
      __privateSet(this, _player6, player);
      __privateSet(this, _controlPosition6, position);
      __privateSet(this, _controlLayer6, layer);
      this._enterSpaceKeyEvent = this._enterSpaceKeyEvent.bind(this);
    }
    create() {
      const { labels } = __privateGet(this, _player6).getOptions();
      __privateSet(this, _button5, document.createElement("button"));
      __privateGet(this, _button5).className = `op-controls__settings op-control__${__privateGet(this, _controlPosition6)}`;
      __privateGet(this, _button5).tabIndex = 0;
      __privateGet(this, _button5).title = (labels == null ? void 0 : labels.settings) || "";
      __privateGet(this, _button5).setAttribute("aria-controls", __privateGet(this, _player6).id);
      __privateGet(this, _button5).setAttribute("aria-pressed", "false");
      __privateGet(this, _button5).setAttribute("aria-label", (labels == null ? void 0 : labels.settings) || "");
      __privateSet(this, _menu3, document.createElement("div"));
      __privateGet(this, _menu3).className = "op-settings";
      __privateGet(this, _menu3).setAttribute("aria-hidden", "true");
      __privateGet(this, _menu3).innerHTML = '<div class="op-settings__menu" role="menu"></div>';
      this.clickEvent = () => {
        __privateGet(this, _button5).setAttribute("aria-pressed", "true");
        const menus = __privateGet(this, _player6).getContainer().querySelectorAll(".op-settings");
        for (let i = 0, total = menus.length; i < total; ++i) {
          if (menus[i] !== __privateGet(this, _menu3)) {
            menus[i].setAttribute("aria-hidden", "true");
          }
        }
        __privateGet(this, _menu3).setAttribute(
          "aria-hidden",
          __privateGet(this, _menu3).getAttribute("aria-hidden") === "false" ? "true" : "false"
        );
      };
      this.hideEvent = () => {
        let timeout;
        if (timeout && typeof window !== "undefined") {
          window.cancelAnimationFrame(timeout);
        }
        if (typeof window !== "undefined") {
          timeout = window.requestAnimationFrame(() => {
            __privateGet(this, _menu3).innerHTML = __privateGet(this, _originalOutput);
            __privateGet(this, _menu3).setAttribute("aria-hidden", "true");
          });
        }
      };
      this.removeEvent = (e) => {
        const { id, type } = e.detail;
        this.removeItem(id, type);
      };
      this.clickEvent = this.clickEvent.bind(this);
      this.hideEvent = this.hideEvent.bind(this);
      this.removeEvent = this.removeEvent.bind(this);
      __privateGet(this, _events5).media.controlshidden = this.hideEvent.bind(this);
      __privateGet(this, _events5).media.settingremoved = this.removeEvent.bind(this);
      __privateGet(this, _events5).media.play = this.hideEvent.bind(this);
      __privateGet(this, _events5).media.pause = this.hideEvent.bind(this);
      __privateGet(this, _player6).getContainer().addEventListener("keydown", this._enterSpaceKeyEvent, EVENT_OPTIONS);
      __privateGet(this, _events5).global.click = (e) => {
        const { target } = e;
        const current = target;
        if ((current == null ? void 0 : current.closest(`#${__privateGet(this, _player6).id}`)) && (current == null ? void 0 : current.classList.contains("op-speed__option"))) {
          const level = (current == null ? void 0 : current.getAttribute("data-value")) || "";
          __privateGet(this, _player6).getMedia().playbackRate = parseFloat(level.replace("speed-", ""));
        }
      };
      __privateGet(this, _events5).global.resize = this.hideEvent.bind(this);
      __privateGet(this, _button5).addEventListener("click", this.clickEvent, EVENT_OPTIONS);
      Object.keys(__privateGet(this, _events5)).forEach((event) => {
        __privateGet(this, _player6).getElement().addEventListener(event, __privateGet(this, _events5).media[event], EVENT_OPTIONS);
      });
      document.addEventListener("click", __privateGet(this, _events5).global.click, EVENT_OPTIONS);
      document.addEventListener("keydown", __privateGet(this, _events5).global.click, EVENT_OPTIONS);
      if (typeof window !== "undefined") {
        window.addEventListener("resize", __privateGet(this, _events5).global.resize, EVENT_OPTIONS);
      }
      __privateGet(this, _player6).getControls().getLayer(__privateGet(this, _controlLayer6)).appendChild(__privateGet(this, _button5));
      __privateGet(this, _player6).getContainer().appendChild(__privateGet(this, _menu3));
    }
    destroy() {
      __privateGet(this, _button5).removeEventListener("click", this.clickEvent);
      Object.keys(__privateGet(this, _events5)).forEach((event) => {
        __privateGet(this, _player6).getElement().removeEventListener(event, __privateGet(this, _events5).media[event]);
      });
      document.removeEventListener("click", __privateGet(this, _events5).global.click);
      document.removeEventListener("keydown", __privateGet(this, _events5).global.click);
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", __privateGet(this, _events5).global.resize);
      }
      if (__privateGet(this, _events5).global["settings.submenu"] !== void 0) {
        document.removeEventListener("click", __privateGet(this, _events5).global["settings.submenu"]);
        __privateGet(this, _player6).getElement().removeEventListener("controlshidden", this.hideEvent);
      }
      __privateGet(this, _player6).getContainer().removeEventListener("keydown", this._enterSpaceKeyEvent);
      __privateGet(this, _menu3).remove();
      __privateGet(this, _button5).remove();
    }
    addSettings() {
      const media = __privateGet(this, _player6).getMedia();
      const { labels } = __privateGet(this, _player6).getOptions();
      let rate = 1;
      if (__privateGet(this, _player6) && media) {
        rate = media.defaultPlaybackRate !== media.playbackRate ? media.playbackRate : media.defaultPlaybackRate;
      }
      return {
        className: "op-speed__option",
        default: rate.toString(),
        key: "speed",
        name: (labels == null ? void 0 : labels.speed) || "",
        subitems: [
          { key: "0.25", label: "0.25" },
          { key: "0.5", label: "0.5" },
          { key: "0.75", label: "0.75" },
          { key: "1", label: (labels == null ? void 0 : labels.speedNormal) || "" },
          { key: "1.25", label: "1.25" },
          { key: "1.5", label: "1.5" },
          { key: "2", label: "2" }
        ]
      };
    }
    addItem(name, key, defaultValue, submenu, className) {
      const dataValue = `${key}-${sanitize(defaultValue, true)}`;
      const menuItem = document.createElement("div");
      menuItem.className = "op-settings__menu-item";
      menuItem.tabIndex = 0;
      menuItem.setAttribute("role", "menuitemradio");
      menuItem.innerHTML = `<div class="op-settings__menu-label" data-value="${dataValue}">${name}</div>`;
      const submenuMatch = submenu ? submenu.find((x) => x.key === defaultValue) : null;
      if (submenuMatch) {
        menuItem.innerHTML += `<div class="op-settings__menu-content" tabindex="0">${submenuMatch.label}</div>`;
      }
      const mainMenu = __privateGet(this, _menu3).querySelector(".op-settings__menu");
      if (mainMenu) {
        mainMenu.appendChild(menuItem);
      }
      __privateSet(this, _originalOutput, __privateGet(this, _menu3).innerHTML);
      if (submenu) {
        const subItems = `
                <div class="op-settings__header">
                    <button type="button" class="op-settings__back" tabindex="0">${name}</button>
                </div>
                <div class="op-settings__menu" role="menu" id="menu-item-${key}">
                    ${submenu.map(
          (item) => `
                    <div class="op-settings__submenu-item" role="menuitemradio" aria-checked="${defaultValue === item.key ? "true" : "false"}">
                        <div class="op-settings__submenu-label ${className || ""}" tabindex="0" data-value="${key}-${item.key}">
                            ${item.label}
                        </div>
                    </div>`
        ).join("")}
                </div>`;
        __privateGet(this, _submenu)[key] = subItems;
      }
      __privateGet(this, _events5).global["settings.submenu"] = (e) => {
        const target = e.target;
        if (target.closest(`#${__privateGet(this, _player6).id}`)) {
          if (target.classList.contains("op-settings__back")) {
            __privateGet(this, _menu3).classList.add("op-settings--sliding");
            setTimeout(() => {
              __privateGet(this, _menu3).innerHTML = __privateGet(this, _originalOutput);
              __privateGet(this, _menu3).classList.remove("op-settings--sliding");
            }, 100);
          } else if (target.classList.contains("op-settings__menu-content")) {
            const labelEl = target.parentElement ? target.parentElement.querySelector(".op-settings__menu-label") : null;
            const label = labelEl ? labelEl.getAttribute("data-value") : null;
            const fragments = label ? label.split("-") : [];
            if (fragments.length > 0) {
              fragments.pop();
              const current = fragments.join("-").replace(/^\-|\-$/, "");
              if (typeof __privateGet(this, _submenu)[current] !== "undefined") {
                __privateGet(this, _menu3).classList.add("op-settings--sliding");
                setTimeout(() => {
                  __privateGet(this, _menu3).innerHTML = __privateGet(this, _submenu)[current];
                  __privateGet(this, _menu3).classList.remove("op-settings--sliding");
                }, 100);
              }
            }
          } else if (target.classList.contains("op-settings__submenu-label")) {
            const current = target.getAttribute("data-value");
            const value = current ? current.replace(`${key}-`, "") : "";
            const label = target.innerText;
            const menuTarget = __privateGet(this, _menu3).querySelector(
              `#menu-item-${key} .op-settings__submenu-item[aria-checked=true]`
            );
            if (menuTarget) {
              menuTarget.setAttribute("aria-checked", "false");
              if (target.parentElement) {
                target.parentElement.setAttribute("aria-checked", "true");
              }
              __privateGet(this, _submenu)[key] = __privateGet(this, _menu3).innerHTML;
              __privateGet(this, _menu3).classList.add("op-settings--sliding");
              setTimeout(() => {
                __privateGet(this, _menu3).innerHTML = __privateGet(this, _originalOutput);
                const prev = __privateGet(this, _menu3).querySelector(
                  `.op-settings__menu-label[data-value="${key}-${defaultValue}"]`
                );
                if (prev) {
                  prev.setAttribute("data-value", `${current}`);
                  if (prev.nextElementSibling) {
                    prev.nextElementSibling.textContent = label;
                  }
                }
                defaultValue = value;
                __privateSet(this, _originalOutput, __privateGet(this, _menu3).innerHTML);
                __privateGet(this, _menu3).classList.remove("op-settings--sliding");
              }, 100);
            }
          }
        } else {
          this.hideEvent();
        }
      };
      document.addEventListener("click", __privateGet(this, _events5).global["settings.submenu"], EVENT_OPTIONS);
      __privateGet(this, _player6).getElement().addEventListener("controlshidden", this.hideEvent, EVENT_OPTIONS);
    }
    removeItem(id, type, minItems = 2) {
      const target = __privateGet(this, _player6).getElement().querySelector(`.op-settings__submenu-label[data-value=${type}-${id}]`);
      if (target) {
        target.remove();
      }
      if (__privateGet(this, _player6).getElement().querySelectorAll(`.op-settings__submenu-label[data-value^=${type}]`).length < minItems) {
        delete __privateGet(this, _submenu)[type];
        const label = __privateGet(this, _player6).getElement().querySelector(`.op-settings__menu-label[data-value^=${type}]`);
        const menuItem = label ? label.closest(".op-settings__menu-item") : null;
        if (menuItem) {
          menuItem.remove();
        }
      }
    }
    _enterSpaceKeyEvent(e) {
      var _a, _b, _c, _d;
      const key = e.which || e.keyCode || 0;
      const isAd = __privateGet(this, _player6).isAd();
      const settingsBtnFocused = (_a = document == null ? void 0 : document.activeElement) == null ? void 0 : _a.classList.contains("op-controls__settings");
      const menuFocused = ((_b = document == null ? void 0 : document.activeElement) == null ? void 0 : _b.classList.contains("op-settings__menu-content")) || ((_c = document == null ? void 0 : document.activeElement) == null ? void 0 : _c.classList.contains("op-settings__back")) || ((_d = document == null ? void 0 : document.activeElement) == null ? void 0 : _d.classList.contains("op-settings__submenu-label"));
      if (!isAd) {
        if (settingsBtnFocused && (key === 13 || key === 32)) {
          this.clickEvent();
          e.preventDefault();
          e.stopPropagation();
        } else if (menuFocused && (key === 13 || key === 32)) {
          __privateGet(this, _events5).global["settings.submenu"](e);
          e.preventDefault();
          e.stopPropagation();
        }
      }
    }
  }
  _player6 = new WeakMap();
  _submenu = new WeakMap();
  _button5 = new WeakMap();
  _menu3 = new WeakMap();
  _events5 = new WeakMap();
  _originalOutput = new WeakMap();
  _controlPosition6 = new WeakMap();
  _controlLayer6 = new WeakMap();
  class Time {
    constructor(player, position, layer) {
      __privateAdd(this, _player7, void 0);
      __privateAdd(this, _currentTime, void 0);
      __privateAdd(this, _delimiter, void 0);
      __privateAdd(this, _duration, void 0);
      __privateAdd(this, _container, void 0);
      __privateAdd(this, _events6, {
        controls: {},
        media: {}
      });
      __privateAdd(this, _controlPosition7, void 0);
      __privateAdd(this, _controlLayer7, void 0);
      __privateSet(this, _player7, player);
      __privateSet(this, _controlPosition7, position);
      __privateSet(this, _controlLayer7, layer);
    }
    create() {
      const { labels, progress } = __privateGet(this, _player7).getOptions();
      __privateSet(this, _currentTime, document.createElement("time"));
      __privateGet(this, _currentTime).className = "op-controls__current";
      __privateGet(this, _currentTime).setAttribute("role", "timer");
      __privateGet(this, _currentTime).setAttribute("aria-live", "off");
      __privateGet(this, _currentTime).setAttribute("aria-hidden", "false");
      __privateGet(this, _currentTime).innerText = "0:00";
      const showOnlyCurrent = (progress == null ? void 0 : progress.showCurrentTimeOnly) || false;
      if (!showOnlyCurrent) {
        __privateSet(this, _delimiter, document.createElement("span"));
        __privateGet(this, _delimiter).className = "op-controls__time-delimiter";
        __privateGet(this, _delimiter).setAttribute("aria-hidden", "false");
        __privateGet(this, _delimiter).innerText = "/";
        __privateSet(this, _duration, document.createElement("time"));
        __privateGet(this, _duration).className = "op-controls__duration";
        __privateGet(this, _duration).setAttribute("aria-hidden", "false");
        __privateGet(this, _duration).innerText = formatTime((progress == null ? void 0 : progress.duration) || 0);
      }
      const controls = __privateGet(this, _player7).getControls().getLayer(__privateGet(this, _controlLayer7));
      __privateSet(this, _container, document.createElement("span"));
      __privateGet(this, _container).className = `op-controls-time op-control__${__privateGet(this, _controlPosition7)}`;
      __privateGet(this, _container).appendChild(__privateGet(this, _currentTime));
      if (!showOnlyCurrent) {
        __privateGet(this, _container).appendChild(__privateGet(this, _delimiter));
        __privateGet(this, _container).appendChild(__privateGet(this, _duration));
      }
      controls.appendChild(__privateGet(this, _container));
      const setInitialTime = () => {
        var _a;
        const el = __privateGet(this, _player7).activeElement();
        if (el.duration !== Infinity && !__privateGet(this, _player7).getElement().getAttribute("op-live__enabled")) {
          if (!showOnlyCurrent) {
            const duration = !Number.isNaN(el.duration) ? el.duration : ((_a = __privateGet(this, _player7).getOptions().progress) == null ? void 0 : _a.duration) || 0;
            __privateGet(this, _duration).innerText = formatTime(duration);
          }
          __privateGet(this, _currentTime).innerText = formatTime(el.currentTime);
        } else if (!showOnlyCurrent) {
          __privateGet(this, _duration).setAttribute("aria-hidden", "true");
          __privateGet(this, _delimiter).setAttribute("aria-hidden", "true");
        }
      };
      __privateGet(this, _events6).media.loadedmetadata = setInitialTime.bind(this);
      __privateGet(this, _events6).controls.controlschanged = setInitialTime.bind(this);
      const { showLabel: showLiveLabel } = __privateGet(this, _player7).getOptions().live || {};
      __privateGet(this, _events6).media.timeupdate = () => {
        const el = __privateGet(this, _player7).activeElement();
        if (el.duration !== Infinity && !__privateGet(this, _player7).getElement().getAttribute("op-live__enabled") && !__privateGet(this, _player7).getElement().getAttribute("op-dvr__enabled")) {
          const duration = formatTime(el.duration);
          if (!showOnlyCurrent && !Number.isNaN(el.duration) && duration !== __privateGet(this, _duration).innerText) {
            __privateGet(this, _duration).innerText = duration;
            __privateGet(this, _duration).setAttribute("aria-hidden", "false");
            __privateGet(this, _delimiter).setAttribute("aria-hidden", "false");
          } else if (showOnlyCurrent || duration !== __privateGet(this, _duration).innerText) {
            __privateGet(this, _currentTime).innerText = showLiveLabel ? (labels == null ? void 0 : labels.live) || "" : formatTime(el.currentTime);
          }
          __privateGet(this, _currentTime).innerText = formatTime(el.currentTime);
        } else if (__privateGet(this, _player7).getElement().getAttribute("op-dvr__enabled")) {
          if (!showOnlyCurrent) {
            __privateGet(this, _duration).setAttribute("aria-hidden", "true");
            __privateGet(this, _delimiter).setAttribute("aria-hidden", "true");
          }
          __privateGet(this, _currentTime).innerText = formatTime(el.currentTime);
        } else if (showOnlyCurrent || !__privateGet(this, _player7).getElement().getAttribute("op-dvr__enabled") && __privateGet(this, _duration).getAttribute("aria-hidden") === "false") {
          if (!showOnlyCurrent) {
            __privateGet(this, _duration).setAttribute("aria-hidden", "true");
            __privateGet(this, _delimiter).setAttribute("aria-hidden", "true");
          }
          __privateGet(this, _currentTime).innerText = showLiveLabel ? (labels == null ? void 0 : labels.live) || "" : formatTime(el.currentTime);
        } else {
          __privateGet(this, _currentTime).innerText = showLiveLabel ? (labels == null ? void 0 : labels.live) || "" : formatTime(el.currentTime);
        }
      };
      __privateGet(this, _events6).media.ended = () => {
        var _a;
        const el = __privateGet(this, _player7).activeElement();
        const duration = !Number.isNaN(el.duration) ? el.duration : ((_a = __privateGet(this, _player7).getOptions().progress) == null ? void 0 : _a.duration) || 0;
        if (!showOnlyCurrent && __privateGet(this, _player7).isMedia()) {
          __privateGet(this, _duration).innerText = formatTime(duration);
        }
      };
      Object.keys(__privateGet(this, _events6).media).forEach((event) => {
        __privateGet(this, _player7).getElement().addEventListener(event, __privateGet(this, _events6).media[event], EVENT_OPTIONS);
      });
      __privateGet(this, _player7).getControls().getContainer().addEventListener("controlschanged", __privateGet(this, _events6).controls.controlschanged, EVENT_OPTIONS);
    }
    destroy() {
      Object.keys(__privateGet(this, _events6).media).forEach((event) => {
        __privateGet(this, _player7).getElement().removeEventListener(event, __privateGet(this, _events6).media[event]);
      });
      __privateGet(this, _player7).getControls().getContainer().removeEventListener("controlschanged", __privateGet(this, _events6).controls.controlschanged);
      __privateGet(this, _currentTime).remove();
      const { showCurrentTimeOnly } = __privateGet(this, _player7).getOptions().progress || {};
      if (!showCurrentTimeOnly) {
        __privateGet(this, _delimiter).remove();
        __privateGet(this, _duration).remove();
      }
      __privateGet(this, _container).remove();
    }
  }
  _player7 = new WeakMap();
  _currentTime = new WeakMap();
  _delimiter = new WeakMap();
  _duration = new WeakMap();
  _container = new WeakMap();
  _events6 = new WeakMap();
  _controlPosition7 = new WeakMap();
  _controlLayer7 = new WeakMap();
  class Volume {
    constructor(player, position, layer) {
      __privateAdd(this, _player8, void 0);
      __privateAdd(this, _button6, void 0);
      __privateAdd(this, _container2, void 0);
      __privateAdd(this, _display, void 0);
      __privateAdd(this, _slider2, void 0);
      __privateAdd(this, _events7, {
        button: {},
        media: {},
        slider: {}
      });
      __privateAdd(this, _volume, void 0);
      __privateAdd(this, _controlPosition8, void 0);
      __privateAdd(this, _controlLayer8, void 0);
      __privateSet(this, _player8, player);
      __privateSet(this, _volume, __privateGet(this, _player8).getMedia().volume);
      __privateSet(this, _controlPosition8, position);
      __privateSet(this, _controlLayer8, layer);
      this._enterSpaceKeyEvent = this._enterSpaceKeyEvent.bind(this);
    }
    create() {
      const { labels } = __privateGet(this, _player8).getOptions();
      __privateSet(this, _container2, document.createElement("div"));
      __privateGet(this, _container2).className = `op-controls__volume op-control__${__privateGet(this, _controlPosition8)}`;
      __privateGet(this, _container2).tabIndex = 0;
      __privateGet(this, _container2).setAttribute("aria-valuemin", "0");
      __privateGet(this, _container2).setAttribute("aria-valuemax", "100");
      __privateGet(this, _container2).setAttribute("aria-valuenow", `${__privateGet(this, _volume)}`);
      __privateGet(this, _container2).setAttribute("aria-valuetext", `${(labels == null ? void 0 : labels.volume) || ""}: ${__privateGet(this, _volume)}`);
      __privateGet(this, _container2).setAttribute("aria-orientation", "vertical");
      __privateGet(this, _container2).setAttribute("aria-label", (labels == null ? void 0 : labels.volumeSlider) || "");
      __privateGet(this, _container2).setAttribute("role", "slider");
      __privateSet(this, _slider2, document.createElement("input"));
      __privateGet(this, _slider2).type = "range";
      __privateGet(this, _slider2).className = "op-controls__volume--input";
      __privateGet(this, _slider2).tabIndex = -1;
      __privateGet(this, _slider2).value = __privateGet(this, _player8).getMedia().volume.toString();
      __privateGet(this, _slider2).setAttribute("min", "0");
      __privateGet(this, _slider2).setAttribute("max", "1");
      __privateGet(this, _slider2).setAttribute("step", "0.1");
      __privateGet(this, _slider2).setAttribute("aria-label", (labels == null ? void 0 : labels.volumeControl) || "");
      __privateSet(this, _display, document.createElement("progress"));
      __privateGet(this, _display).className = "op-controls__volume--display";
      __privateGet(this, _display).setAttribute("max", "10");
      __privateGet(this, _display).value = __privateGet(this, _player8).getMedia().volume * 10;
      __privateGet(this, _container2).appendChild(__privateGet(this, _slider2));
      __privateGet(this, _container2).appendChild(__privateGet(this, _display));
      __privateSet(this, _button6, document.createElement("button"));
      __privateGet(this, _button6).type = "button";
      __privateGet(this, _button6).className = `op-controls__mute op-control__${__privateGet(this, _controlPosition8)}`;
      __privateGet(this, _button6).tabIndex = 0;
      __privateGet(this, _button6).title = (labels == null ? void 0 : labels.mute) || "";
      __privateGet(this, _button6).setAttribute("aria-controls", __privateGet(this, _player8).id);
      __privateGet(this, _button6).setAttribute("aria-pressed", "false");
      __privateGet(this, _button6).setAttribute("aria-label", (labels == null ? void 0 : labels.mute) || "");
      const updateSlider = (element) => {
        const mediaVolume = element.volume * 1;
        const vol = Math.floor(mediaVolume * 100);
        __privateGet(this, _slider2).value = `${element.volume}`;
        __privateGet(this, _display).value = mediaVolume * 10;
        __privateGet(this, _container2).setAttribute("aria-valuenow", `${vol}`);
        __privateGet(this, _container2).setAttribute("aria-valuetext", `${labels == null ? void 0 : labels.volume}: ${vol}`);
      };
      const updateButton = (element) => {
        const vol = element.volume;
        if (vol <= 0.5 && vol > 0) {
          __privateGet(this, _button6).classList.remove("op-controls__mute--muted");
          __privateGet(this, _button6).classList.add("op-controls__mute--half");
        } else if (vol === 0) {
          __privateGet(this, _button6).classList.add("op-controls__mute--muted");
          __privateGet(this, _button6).classList.remove("op-controls__mute--half");
        } else {
          __privateGet(this, _button6).classList.remove("op-controls__mute--muted");
          __privateGet(this, _button6).classList.remove("op-controls__mute--half");
        }
      };
      const updateVolume = (event) => {
        const el = __privateGet(this, _player8).activeElement();
        const value = parseFloat(event.target.value);
        el.volume = value;
        el.muted = el.volume === 0;
        __privateSet(this, _volume, value);
        const unmuteEl = __privateGet(this, _player8).getContainer().querySelector(".op-player__unmute");
        if (!el.muted && unmuteEl) {
          unmuteEl.remove();
        }
        const e = addEvent("volumechange");
        __privateGet(this, _player8).getElement().dispatchEvent(e);
      };
      __privateGet(this, _events7).media.volumechange = () => {
        const el = __privateGet(this, _player8).activeElement();
        updateSlider(el);
        updateButton(el);
      };
      __privateGet(this, _events7).media.loadedmetadata = () => {
        const el = __privateGet(this, _player8).activeElement();
        if (el.muted) {
          el.volume = 0;
        }
        const e = addEvent("volumechange");
        __privateGet(this, _player8).getElement().dispatchEvent(e);
      };
      __privateGet(this, _events7).slider.input = updateVolume.bind(this);
      __privateGet(this, _events7).slider.change = updateVolume.bind(this);
      __privateGet(this, _events7).button.click = () => {
        __privateGet(this, _button6).setAttribute("aria-pressed", "true");
        const el = __privateGet(this, _player8).activeElement();
        el.muted = !el.muted;
        if (el.muted) {
          el.volume = 0;
          __privateGet(this, _button6).title = (labels == null ? void 0 : labels.unmute) || "";
          __privateGet(this, _button6).setAttribute("aria-label", (labels == null ? void 0 : labels.unmute) || "");
        } else {
          el.volume = __privateGet(this, _volume);
          __privateGet(this, _button6).title = (labels == null ? void 0 : labels.mute) || "";
          __privateGet(this, _button6).setAttribute("aria-label", (labels == null ? void 0 : labels.mute) || "");
        }
        const event = addEvent("volumechange");
        __privateGet(this, _player8).getElement().dispatchEvent(event);
      };
      __privateGet(this, _button6).addEventListener("click", __privateGet(this, _events7).button.click, EVENT_OPTIONS);
      Object.keys(__privateGet(this, _events7).media).forEach((event) => {
        __privateGet(this, _player8).getElement().addEventListener(event, __privateGet(this, _events7).media[event], EVENT_OPTIONS);
      });
      Object.keys(__privateGet(this, _events7).slider).forEach((event) => {
        __privateGet(this, _slider2).addEventListener(event, __privateGet(this, _events7).slider[event], EVENT_OPTIONS);
      });
      __privateGet(this, _player8).getContainer().addEventListener("keydown", this._enterSpaceKeyEvent, EVENT_OPTIONS);
      if (!IS_ANDROID && !IS_IOS || !__privateGet(this, _player8).getOptions().useDeviceVolume) {
        const controls = __privateGet(this, _player8).getControls().getLayer(__privateGet(this, _controlLayer8));
        controls.appendChild(__privateGet(this, _button6));
        controls.appendChild(__privateGet(this, _container2));
      }
    }
    destroy() {
      __privateGet(this, _button6).removeEventListener("click", __privateGet(this, _events7).button.click);
      Object.keys(__privateGet(this, _events7).media).forEach((event) => {
        __privateGet(this, _player8).getElement().removeEventListener(event, __privateGet(this, _events7).media[event]);
      });
      Object.keys(__privateGet(this, _events7).slider).forEach((event) => {
        __privateGet(this, _slider2).removeEventListener(event, __privateGet(this, _events7).slider[event]);
      });
      __privateGet(this, _player8).getContainer().removeEventListener("keydown", this._enterSpaceKeyEvent);
      __privateGet(this, _slider2).remove();
      __privateGet(this, _display).remove();
      __privateGet(this, _container2).remove();
    }
    _enterSpaceKeyEvent(e) {
      var _a;
      const key = e.which || e.keyCode || 0;
      const el = __privateGet(this, _player8).activeElement();
      const playBtnFocused = (_a = document == null ? void 0 : document.activeElement) == null ? void 0 : _a.classList.contains("op-controls__mute");
      if (playBtnFocused && (key === 13 || key === 32)) {
        el.muted = !el.muted;
        el.volume = el.muted ? 0 : __privateGet(this, _volume);
        __privateGet(this, _events7).button.click();
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }
  _player8 = new WeakMap();
  _button6 = new WeakMap();
  _container2 = new WeakMap();
  _display = new WeakMap();
  _slider2 = new WeakMap();
  _events7 = new WeakMap();
  _volume = new WeakMap();
  _controlPosition8 = new WeakMap();
  _controlLayer8 = new WeakMap();
  class Controls {
    constructor(player) {
      __privateAdd(this, _settings, void 0);
      __privateAdd(this, _timer, void 0);
      __privateAdd(this, _controls, void 0);
      __privateAdd(this, _player9, void 0);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      __privateAdd(this, _items, void 0);
      __privateAdd(this, _controlEls, void 0);
      this.events = {
        media: {},
        mouse: {}
      };
      __privateSet(this, _timer, 0);
      __privateSet(this, _controlEls, {
        Captions,
        Fullscreen,
        Levels,
        Play,
        Progress,
        Settings,
        Time,
        Volume
      });
      __privateSet(this, _player9, player);
      this._setElements();
    }
    create() {
      __privateGet(this, _player9).getElement().controls = false;
      const isMediaVideo = isVideo(__privateGet(this, _player9).getElement());
      this._createControlsLayer();
      this._buildElements();
      this.events.controlschanged = () => {
        this.destroy();
        this._setElements();
        this.create();
      };
      this.events.ended = () => {
        __privateGet(this, _player9).getContainer().classList.remove("op-controls--hidden");
      };
      __privateGet(this, _player9).getElement().addEventListener("controlschanged", this.events.controlschanged, EVENT_OPTIONS);
      __privateGet(this, _player9).getElement().addEventListener("ended", this.events.ended, EVENT_OPTIONS);
      const { alwaysVisible } = __privateGet(this, _player9).getOptions().controls || {};
      if (!alwaysVisible) {
        const showControls = () => {
          if (isMediaVideo) {
            __privateGet(this, _player9).getContainer().classList.remove("op-controls--hidden");
            this._stopControlTimer();
          }
        };
        this.events.mouse.mouseenter = () => {
          if (isMediaVideo && !__privateGet(this, _player9).activeElement().paused) {
            this._stopControlTimer();
            if (__privateGet(this, _player9).activeElement().currentTime) {
              __privateGet(this, _player9).playBtn.setAttribute("aria-hidden", __privateGet(this, _player9).isMedia() ? "false" : "true");
              __privateGet(this, _player9).loader.setAttribute("aria-hidden", "true");
            } else if (__privateGet(this, _player9).getOptions().showLoaderOnInit) {
              __privateGet(this, _player9).playBtn.setAttribute("aria-hidden", "true");
              __privateGet(this, _player9).loader.setAttribute("aria-hidden", "false");
            }
            __privateGet(this, _player9).getContainer().classList.remove("op-controls--hidden");
            this._startControlTimer(2500);
          }
        };
        this.events.mouse.mousemove = () => {
          if (isMediaVideo && !__privateGet(this, _player9).activeElement().paused) {
            if (__privateGet(this, _player9).activeElement().currentTime) {
              __privateGet(this, _player9).loader.setAttribute("aria-hidden", "true");
              __privateGet(this, _player9).playBtn.setAttribute("aria-hidden", __privateGet(this, _player9).isMedia() ? "false" : "true");
            } else {
              __privateGet(this, _player9).playBtn.setAttribute(
                "aria-hidden",
                __privateGet(this, _player9).getOptions().showLoaderOnInit ? "true" : "false"
              );
              __privateGet(this, _player9).loader.setAttribute(
                "aria-hidden",
                __privateGet(this, _player9).getOptions().showLoaderOnInit ? "false" : "true"
              );
            }
            __privateGet(this, _player9).getContainer().classList.remove("op-controls--hidden");
            this._startControlTimer(2500);
          }
        };
        this.events.mouse.mouseleave = () => {
          if (isMediaVideo && !__privateGet(this, _player9).activeElement().paused) {
            this._startControlTimer(1e3);
          }
        };
        this.events.media.play = () => {
          if (isMediaVideo) {
            this._startControlTimer(__privateGet(this, _player9).getOptions().hidePlayBtnTimer || 350);
          }
        };
        this.events.media.loadedmetadata = showControls.bind(this);
        this.events.media.pause = showControls.bind(this);
        this.events.media.waiting = showControls.bind(this);
        this.events.media.stalled = showControls.bind(this);
        this.events.media.playererror = showControls.bind(this);
        Object.keys(this.events.media).forEach((event) => {
          __privateGet(this, _player9).getElement().addEventListener(event, this.events.media[event], EVENT_OPTIONS);
        });
        if (IS_ANDROID || IS_IOS) {
          __privateGet(this, _player9).getContainer().addEventListener("click", this.events.mouse.mouseenter, EVENT_OPTIONS);
        } else {
          Object.keys(this.events.mouse).forEach((event) => {
            __privateGet(this, _player9).getContainer().addEventListener(event, this.events.mouse[event], EVENT_OPTIONS);
          });
        }
        if (isMediaVideo && !__privateGet(this, _player9).activeElement().paused) {
          this._startControlTimer(3e3);
        }
      }
    }
    destroy() {
      if (!IS_ANDROID && !IS_IOS) {
        Object.keys(this.events.mouse).forEach((event) => {
          __privateGet(this, _player9).getContainer().removeEventListener(event, this.events.mouse[event]);
        });
        Object.keys(this.events.media).forEach((event) => {
          __privateGet(this, _player9).getElement().removeEventListener(event, this.events.media[event]);
        });
        this._stopControlTimer();
      }
      __privateGet(this, _player9).getElement().removeEventListener("controlschanged", this.events.controlschanged);
      __privateGet(this, _player9).getElement().removeEventListener("ended", this.events.ended);
      Object.keys(__privateGet(this, _items)).forEach((position) => {
        __privateGet(this, _items)[position].forEach((item) => {
          if (item.custom) {
            this._destroyCustomElement(item);
          } else if (typeof item.destroy === "function") {
            item.destroy();
          }
        });
      });
      __privateGet(this, _controls).remove();
    }
    getContainer() {
      return __privateGet(this, _controls);
    }
    getLayer(layer) {
      return __privateGet(this, _controls).querySelector(`.op-controls-layer__${layer}`) || __privateGet(this, _controls);
    }
    _createControlsLayer() {
      if (!__privateGet(this, _controls) || !__privateGet(this, _player9).getContainer().querySelector(".op-controls")) {
        __privateSet(this, _controls, document.createElement("div"));
        __privateGet(this, _controls).className = "op-controls";
        __privateGet(this, _player9).getContainer().appendChild(__privateGet(this, _controls));
        const messageContainer = document.createElement("div");
        messageContainer.className = "op-status";
        messageContainer.innerHTML = "<span></span>";
        messageContainer.tabIndex = -1;
        messageContainer.setAttribute("aria-hidden", "true");
        if (isAudio(__privateGet(this, _player9).getElement())) {
          __privateGet(this, _controls).appendChild(messageContainer);
        }
      }
    }
    _startControlTimer(time) {
      const el = __privateGet(this, _player9).activeElement();
      this._stopControlTimer();
      if (typeof window !== "undefined") {
        __privateSet(this, _timer, window.setTimeout(() => {
          if ((!el.paused || !el.ended) && isVideo(__privateGet(this, _player9).getElement())) {
            __privateGet(this, _player9).getContainer().classList.add("op-controls--hidden");
            __privateGet(this, _player9).playBtn.setAttribute("aria-hidden", "true");
            this._stopControlTimer();
            const event = addEvent("controlshidden");
            __privateGet(this, _player9).getElement().dispatchEvent(event);
          }
        }, time));
      }
    }
    _stopControlTimer() {
      if (__privateGet(this, _timer) !== 0) {
        clearTimeout(__privateGet(this, _timer));
        __privateSet(this, _timer, 0);
      }
    }
    _setElements() {
      var _a;
      const controls = ((_a = __privateGet(this, _player9).getOptions().controls) == null ? void 0 : _a.layers) || {};
      __privateSet(this, _items, {
        "bottom-left": [],
        "bottom-middle": [],
        "bottom-right": [],
        left: [],
        main: [],
        middle: [],
        right: [],
        "top-left": [],
        "top-middle": [],
        "top-right": []
      });
      const isVideoEl = isVideo(__privateGet(this, _player9).getElement());
      const isAudioEl = isAudio(__privateGet(this, _player9).getElement());
      const controlPositions = Object.keys(controls);
      const layersExist = controlPositions.find((item) => /^(top|bottom)/.test(item));
      this._createControlsLayer();
      controlPositions.forEach((position) => {
        const [layer, pos] = position.split("-");
        if (pos) {
          if (!__privateGet(this, _controls).classList.contains("op-controls__stacked")) {
            __privateGet(this, _controls).classList.add("op-controls__stacked");
          }
          const className = `op-controls-layer__${layer}`;
          if (!__privateGet(this, _controls).querySelector(`.${className}`)) {
            const controlLayer = document.createElement("div");
            controlLayer.className = className;
            __privateGet(this, _controls).appendChild(controlLayer);
          }
        } else if (layersExist) {
          const className = "op-controls-layer__center";
          if (!__privateGet(this, _controls).querySelector(`.${className}`)) {
            const controlLayer = document.createElement("div");
            controlLayer.className = className;
            __privateGet(this, _controls).appendChild(controlLayer);
          }
        }
        const layers = controls ? controls[position] : null;
        if (layers) {
          layers.filter((v, i, a) => a.indexOf(v) === i).forEach((el) => {
            const currentLayer = layersExist && !pos ? "center" : layer;
            const className = `${el.charAt(0).toUpperCase()}${el.slice(1)}`;
            const item = new (__privateGet(this, _controlEls))[className](__privateGet(this, _player9), pos || layer, currentLayer);
            if (el === "settings") {
              __privateSet(this, _settings, item);
            }
            if (isVideoEl || el !== "fullscreen" && isAudioEl) {
              __privateGet(this, _items)[position].push(item);
            }
          });
        }
      });
      __privateGet(this, _player9).getCustomControls().forEach((item) => {
        const [layer, pos] = item.position.split("-");
        const currentLayer = layersExist && !pos ? "center" : layer;
        item.layer = currentLayer;
        item.position = pos || layer;
        if (typeof item.index === "number") {
          __privateGet(this, _items)[item.position].splice(item.index, 0, item);
        } else if (item.position === "right") {
          __privateGet(this, _items)[item.position].unshift(item);
        } else {
          __privateGet(this, _items)[item.position].push(item);
        }
      });
    }
    _buildElements() {
      Object.keys(__privateGet(this, _items)).forEach((position) => {
        __privateGet(this, _items)[position].forEach((item) => {
          if (item.custom) {
            this._createCustomElement(item);
          } else {
            item.create();
          }
        });
      });
      Object.keys(__privateGet(this, _items)).forEach((position) => {
        __privateGet(this, _items)[position].forEach((item) => {
          const allowDefault = !__privateGet(this, _player9).getOptions().detachMenus || item instanceof Settings;
          const current = item;
          if (allowDefault && !current.custom && typeof current.addSettings === "function") {
            const menuItem = current.addSettings();
            if (__privateGet(this, _settings) && Object.keys(menuItem).length) {
              __privateGet(this, _settings).addItem(
                menuItem.name,
                menuItem.key,
                menuItem.default,
                menuItem.subitems,
                menuItem.className
              );
            }
          }
        });
      });
      const e = addEvent("controlschanged");
      __privateGet(this, _controls).dispatchEvent(e);
    }
    _hideCustomMenu(menu) {
      let timeout;
      if (timeout && typeof window !== "undefined") {
        window.cancelAnimationFrame(timeout);
      }
      if (typeof window !== "undefined") {
        timeout = window.requestAnimationFrame(() => {
          menu.setAttribute("aria-hidden", "true");
        });
      }
    }
    _toggleCustomMenu(event, menu, item) {
      const menus = __privateGet(this, _player9).getContainer().querySelectorAll(".op-settings");
      menus.forEach((m) => {
        if (m.getAttribute("aria-hidden") === "false" && m.id !== menu.id) {
          m.setAttribute("aria-hidden", "true");
        }
      });
      menu.setAttribute("aria-hidden", menu.getAttribute("aria-hidden") === "true" ? "false" : "true");
      if (typeof item.click === "function") {
        item.click(event);
      }
    }
    _createCustomElement(item) {
      const element = document.createElement(item.type);
      element.tabIndex = 0;
      element.id = item.id;
      element.className = `op-controls__${item.id} op-control__${item.position} ${item.showInAds ? "" : "op-control__hide-in-ad"}`;
      if (item.styles) {
        Object.assign(element.style, item.styles);
      }
      if (item.type === "button" && item.icon) {
        element.innerHTML = /\.(jpg|png|svg|gif)$/.test(item.icon) ? `<img src="${sanitize(item.icon)}"${item.alt ? `alt="${sanitize(item.alt)}"` : ""}>` : sanitize(item.icon);
      } else if (item.content) {
        element.innerHTML = sanitize(item.content, false);
      }
      if (item.type === "button" && item.title) {
        element.title = sanitize(item.title);
      }
      if (item.type === "img" && item.alt) {
        element.alt = sanitize(item.alt);
      }
      if (item.type !== "button" && item.click && typeof item.click === "function") {
        element.setAttribute("aria-role", "button");
      }
      if (item.type === "button" && item.subitems && Array.isArray(item.subitems) && item.subitems.length > 0) {
        const menu = document.createElement("div");
        menu.className = "op-settings op-settings__custom";
        menu.id = `${item.id}-menu`;
        menu.setAttribute("aria-hidden", "true");
        const items = item.subitems.map((s) => {
          let itemIcon = "";
          if (s.icon) {
            itemIcon = /\.(jpg|png|svg|gif)$/.test(s.icon) ? `<img src="${sanitize(s.icon)}"${s.alt ? `alt="${sanitize(s.alt)}"` : ""}>` : sanitize(s.icon, false);
          }
          return `<div class="op-settings__menu-item" tabindex="0" ${s.title ? `title="${s.title}"` : ""} role="menuitemradio">
                    <div class="op-settings__menu-label" id="${s.id}" data-value="${item.id}-${s.id}">${itemIcon} ${s.label}</div>
                </div>`;
        });
        menu.innerHTML = `<div class="op-settings__menu" role="menu">${items.join("")}</div>`;
        __privateGet(this, _player9).getContainer().appendChild(menu);
        item.subitems.forEach((subitem) => {
          const menuItem = menu.querySelector(`#${subitem.id}`);
          if (menuItem && subitem.click && typeof subitem.click === "function") {
            menuItem.addEventListener("click", subitem.click, EVENT_OPTIONS);
          }
        });
        element.addEventListener("click", (e) => this._toggleCustomMenu(e, menu, item), EVENT_OPTIONS);
        __privateGet(this, _player9).getElement().addEventListener("controlshidden", () => this._hideCustomMenu(menu), EVENT_OPTIONS);
      } else if (item.click && typeof item.click === "function") {
        element.addEventListener("click", item.click, EVENT_OPTIONS);
      }
      if (item.mouseenter && typeof item.mouseenter === "function") {
        element.addEventListener("mouseenter", item.mouseenter, EVENT_OPTIONS);
      }
      if (item.mouseleave && typeof item.mouseleave === "function") {
        element.addEventListener("mouseleave", item.mouseleave, EVENT_OPTIONS);
      }
      if (item.keydown && typeof item.keydown === "function") {
        element.addEventListener("keydown", item.keydown, EVENT_OPTIONS);
      }
      if (item.blur && typeof item.blur === "function") {
        element.addEventListener("blur", item.blur, EVENT_OPTIONS);
      }
      if (item.focus && typeof item.focus === "function") {
        element.addEventListener("focus", item.focus, EVENT_OPTIONS);
      }
      if (item.layer) {
        if (item.layer === "main") {
          __privateGet(this, _player9).getContainer().appendChild(element);
        } else {
          this.getLayer(item.layer).appendChild(element);
        }
      }
      if (item.init && typeof item.init === "function") {
        item.init(__privateGet(this, _player9));
      }
    }
    _destroyCustomElement(item) {
      const control = this.getContainer().querySelector(`.op-controls__${item.id}`);
      if (control) {
        if (item.subitems && Array.isArray(item.subitems) && item.subitems.length > 0) {
          const menu = __privateGet(this, _player9).getContainer().querySelector(`#${item.id}-menu`);
          if (menu) {
            item.subitems.forEach((subitem) => {
              const menuItem = menu.querySelector(`#${subitem.id}`);
              if (menuItem && subitem.click && typeof subitem.click === "function") {
                menuItem.removeEventListener("click", subitem.click);
              }
            });
            control.removeEventListener("click", (e) => this._toggleCustomMenu(e, menu, item));
            __privateGet(this, _player9).getElement().removeEventListener("controlshidden", () => this._hideCustomMenu(menu));
            menu.remove();
          }
        }
        if (item.click && typeof item.click === "function") {
          control.removeEventListener("click", item.click);
        }
        if (item.mouseenter && typeof item.mouseenter === "function") {
          control.removeEventListener("mouseenter", item.mouseenter);
        }
        if (item.mouseleave && typeof item.mouseleave === "function") {
          control.removeEventListener("mouseleave", item.mouseleave);
        }
        if (item.keydown && typeof item.keydown === "function") {
          control.removeEventListener("keydown", item.keydown);
        }
        if (item.blur && typeof item.blur === "function") {
          control.removeEventListener("blur", item.blur);
        }
        if (item.focus && typeof item.focus === "function") {
          control.removeEventListener("focus", item.focus);
        }
        control.remove();
        if (item.destroy && typeof item.destroy === "function") {
          item.destroy(__privateGet(this, _player9));
        }
      }
    }
  }
  _settings = new WeakMap();
  _timer = new WeakMap();
  _controls = new WeakMap();
  _player9 = new WeakMap();
  _items = new WeakMap();
  _controlEls = new WeakMap();
  class Native {
    constructor(element, media) {
      __privateAdd(this, _customPlayer, void 0);
      this.element = element;
      this.media = media;
      this.promise = new Promise((resolve) => {
        resolve();
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set instance(customPlayer) {
      __privateSet(this, _customPlayer, customPlayer);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get instance() {
      return __privateGet(this, _customPlayer);
    }
    play() {
      return this.element.play();
    }
    pause() {
      this.element.pause();
    }
    set volume(value) {
      this.element.volume = value;
    }
    get volume() {
      return this.element.volume;
    }
    set muted(value) {
      this.element.muted = value;
    }
    get muted() {
      return this.element.muted;
    }
    set playbackRate(value) {
      this.element.playbackRate = value;
    }
    get playbackRate() {
      return this.element.playbackRate;
    }
    set defaultPlaybackRate(value) {
      this.element.defaultPlaybackRate = value;
    }
    get defaultPlaybackRate() {
      return this.element.defaultPlaybackRate;
    }
    set currentTime(value) {
      this.element.currentTime = value;
    }
    get currentTime() {
      return this.element.currentTime;
    }
    get duration() {
      return this.element.duration;
    }
    get paused() {
      return this.element.paused;
    }
    get ended() {
      return this.element.ended;
    }
  }
  _customPlayer = new WeakMap();
  class DashMedia extends Native {
    constructor(element, mediaSource, options) {
      super(element, mediaSource);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      __privateAdd(this, _player10, void 0);
      // @see http://cdn.dashjs.org/latest/jsdoc/MediaPlayerEvents.html
      __privateAdd(this, _events8, {});
      __privateAdd(this, _options, {});
      __privateSet(this, _options, options);
      this._assign = this._assign.bind(this);
      this._preparePlayer = this._preparePlayer.bind(this);
      this.promise = typeof dashjs === "undefined" ? (
        // Ever-green script
        loadScript("https://cdn.dashjs.org/latest/dash.all.min.js")
      ) : new Promise((resolve) => {
        resolve({});
      });
      this.promise.then(() => {
        __privateSet(this, _player10, dashjs.MediaPlayer().create());
        this.instance = __privateGet(this, _player10);
      });
    }
    canPlayType(mimeType) {
      return HAS_MSE && mimeType === "application/dash+xml";
    }
    load() {
      this._preparePlayer();
      __privateGet(this, _player10).attachSource(this.media.src);
      const e = addEvent("loadedmetadata");
      this.element.dispatchEvent(e);
      if (!__privateGet(this, _events8)) {
        __privateSet(this, _events8, dashjs.MediaPlayer.events);
        Object.keys(__privateGet(this, _events8)).forEach((event) => {
          __privateGet(this, _player10).on(__privateGet(this, _events8)[event], this._assign);
        });
      }
    }
    destroy() {
      if (__privateGet(this, _events8)) {
        Object.keys(__privateGet(this, _events8)).forEach((event) => {
          __privateGet(this, _player10).off(__privateGet(this, _events8)[event], this._assign);
        });
        __privateSet(this, _events8, []);
      }
      __privateGet(this, _player10).reset();
    }
    set src(media) {
      if (isDashSource(media)) {
        this.destroy();
        __privateSet(this, _player10, dashjs.MediaPlayer().create());
        this._preparePlayer();
        __privateGet(this, _player10).attachSource(media.src);
        __privateSet(this, _events8, dashjs.MediaPlayer.events);
        Object.keys(__privateGet(this, _events8)).forEach((event) => {
          __privateGet(this, _player10).on(__privateGet(this, _events8)[event], this._assign);
        });
      }
    }
    get levels() {
      const levels = [];
      if (__privateGet(this, _player10)) {
        const bitrates = __privateGet(this, _player10).getBitrateInfoListFor("video");
        if (bitrates.length) {
          bitrates.forEach((item) => {
            if (bitrates[item]) {
              const { height, name } = bitrates[item];
              const level = {
                height,
                id: `${item}`,
                label: name || null
              };
              levels.push(level);
            }
          });
        }
      }
      return levels;
    }
    set level(level) {
      if (level === "0") {
        __privateGet(this, _player10).setAutoSwitchQuality(true);
      } else {
        __privateGet(this, _player10).setAutoSwitchQuality(false);
        __privateGet(this, _player10).setQualityFor("video", level);
      }
    }
    get level() {
      return __privateGet(this, _player10) ? __privateGet(this, _player10).getQualityFor("video") : "-1";
    }
    // @see http://cdn.dashjs.org/latest/jsdoc/MediaPlayerEvents.html
    _assign(event) {
      if (event.type === "error") {
        const details = {
          detail: {
            message: event,
            type: "M(PEG)-DASH"
          }
        };
        const errorEvent = addEvent("playererror", details);
        this.element.dispatchEvent(errorEvent);
      } else {
        const e = addEvent(event.type, { detail: event });
        this.element.dispatchEvent(e);
      }
    }
    _preparePlayer() {
      __privateGet(this, _player10).updateSettings({
        debug: {
          logLevel: dashjs.Debug.LOG_LEVEL_NONE
        },
        streaming: {
          fastSwitchEnabled: true,
          scheduleWhilePaused: false
        },
        ...__privateGet(this, _options) || {}
      });
      __privateGet(this, _player10).initialize();
      __privateGet(this, _player10).attachView(this.element);
      __privateGet(this, _player10).setAutoPlay(false);
    }
  }
  _player10 = new WeakMap();
  _events8 = new WeakMap();
  _options = new WeakMap();
  class FlvMedia extends Native {
    constructor(element, mediaSource, options) {
      super(element, mediaSource);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      __privateAdd(this, _player11, void 0);
      // @see https://github.com/video-dev/hls.js/blob/master/src/events.js
      __privateAdd(this, _events9, {});
      // @see https://github.com/bilibili/flv.js/blob/master/docs/api.md
      __privateAdd(this, _options2, {});
      __privateSet(this, _options2, options);
      this.element = element;
      this.media = mediaSource;
      this._create = this._create.bind(this);
      this._assign = this._assign.bind(this);
      this.promise = typeof flvjs === "undefined" ? (
        // Ever-green script
        loadScript("https://cdn.jsdelivr.net/npm/flv.js@latest/dist/flv.min.js")
      ) : new Promise((resolve) => {
        resolve({});
      });
      this.promise.then(this._create);
    }
    canPlayType(mimeType) {
      return HAS_MSE && (mimeType === "video/x-flv" || mimeType === "video/flv");
    }
    load() {
      __privateGet(this, _player11).unload();
      __privateGet(this, _player11).detachMediaElement();
      __privateGet(this, _player11).attachMediaElement(this.element);
      __privateGet(this, _player11).load();
      const e = addEvent("loadedmetadata");
      this.element.dispatchEvent(e);
      if (!__privateGet(this, _events9)) {
        __privateSet(this, _events9, flvjs.Events);
        Object.keys(__privateGet(this, _events9)).forEach((event) => {
          __privateGet(this, _player11).on(
            __privateGet(this, _events9)[event],
            (...args) => this._assign(__privateGet(this, _events9)[event], args)
          );
        });
      }
    }
    destroy() {
      __privateGet(this, _player11).destroy();
      __privateSet(this, _player11, null);
    }
    set src(media) {
      if (isFlvSource(media)) {
        this.destroy();
        this._create();
      }
    }
    get levels() {
      const levels = [];
      if (__privateGet(this, _player11) && __privateGet(this, _player11).levels && __privateGet(this, _player11).levels.length) {
        Object.keys(__privateGet(this, _player11).levels).forEach((item) => {
          const { height, name } = __privateGet(this, _player11).levels[item];
          const level = {
            height,
            id: item,
            label: name || null
          };
          levels.push(level);
        });
      }
      return levels;
    }
    set level(level) {
      __privateGet(this, _player11).currentLevel = level;
    }
    get level() {
      return __privateGet(this, _player11) ? __privateGet(this, _player11).currentLevel : "-1";
    }
    _create() {
      const { configs, ...rest } = __privateGet(this, _options2) || {};
      flvjs.LoggingControl.enableDebug = (rest == null ? void 0 : rest.debug) || false;
      flvjs.LoggingControl.enableVerbose = (rest == null ? void 0 : rest.debug) || false;
      const options = { ...rest, type: "flv", url: this.media.src };
      __privateSet(this, _player11, flvjs.createPlayer(options, configs || {}));
      this.instance = __privateGet(this, _player11);
      if (!__privateGet(this, _events9)) {
        __privateSet(this, _events9, flvjs.Events);
        Object.keys(__privateGet(this, _events9)).forEach((event) => {
          __privateGet(this, _player11).on(
            __privateGet(this, _events9)[event],
            (...args) => this._assign(__privateGet(this, _events9)[event], args)
          );
        });
      }
    }
    // @see https://github.com/bilibili/flv.js/blob/master/docs/api.md#flvjsevents
    // @see https://github.com/bilibili/flv.js/blob/master/docs/api.md#flvjserrortypes
    // @see https://github.com/bilibili/flv.js/blob/master/docs/api.md#flvjserrordetails
    _assign(event, data) {
      if (event === "error") {
        const errorDetails = {
          detail: {
            data,
            message: `${data[0]}: ${data[1]} ${data[2].msg}`,
            type: "FLV"
          }
        };
        const errorEvent = addEvent("playererror", errorDetails);
        this.element.dispatchEvent(errorEvent);
      } else {
        const e = addEvent(event, { detail: { data } });
        this.element.dispatchEvent(e);
      }
    }
  }
  _player11 = new WeakMap();
  _events9 = new WeakMap();
  _options2 = new WeakMap();
  class HlsMedia extends Native {
    constructor(element, mediaSource, autoplay, options) {
      super(element, mediaSource);
      __privateAdd(this, _player12, void 0);
      // @see https://github.com/video-dev/hls.js/blob/master/src/events.js
      __privateAdd(this, _events10, {});
      __privateAdd(this, _recoverDecodingErrorDate, 0);
      __privateAdd(this, _recoverSwapAudioCodecDate, 0);
      // @see https://github.com/video-dev/hls.js/blob/master/docs/API.md#fine-tuning
      __privateAdd(this, _options3, void 0);
      __privateAdd(this, _autoplay, void 0);
      __privateSet(this, _options3, options || {});
      this.element = element;
      this.media = mediaSource;
      __privateSet(this, _autoplay, autoplay);
      this._create = this._create.bind(this);
      this._play = this._play.bind(this);
      this._pause = this._pause.bind(this);
      this._assign = this._assign.bind(this);
      this.promise = typeof Hls === "undefined" ? (
        // Ever-green script
        loadScript("https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js")
      ) : new Promise((resolve) => {
        resolve({});
      });
      this.promise.then(this._create);
    }
    canPlayType(mimeType) {
      return SUPPORTS_HLS() && mimeType === "application/x-mpegURL";
    }
    load() {
      if (__privateGet(this, _player12)) {
        __privateGet(this, _player12).detachMedia();
        __privateGet(this, _player12).loadSource(this.media.src);
        __privateGet(this, _player12).attachMedia(this.element);
      }
      const e = addEvent("loadedmetadata");
      this.element.dispatchEvent(e);
      if (!__privateGet(this, _events10)) {
        __privateSet(this, _events10, Hls.Events);
        Object.keys(__privateGet(this, _events10)).forEach((event) => {
          __privateGet(this, _player12).on(
            __privateGet(this, _events10)[event],
            (...args) => this._assign(__privateGet(this, _events10)[event], args)
          );
        });
      }
    }
    destroy() {
      if (__privateGet(this, _player12)) {
        __privateGet(this, _player12).stopLoad();
      }
      if (__privateGet(this, _events10)) {
        Object.keys(__privateGet(this, _events10)).forEach((event) => {
          __privateGet(this, _player12).off(
            __privateGet(this, _events10)[event],
            (...args) => this._assign(__privateGet(this, _events10)[event], args)
          );
        });
      }
      this.element.removeEventListener("play", this._play);
      this.element.removeEventListener("pause", this._pause);
      if (__privateGet(this, _player12)) {
        __privateGet(this, _player12).destroy();
        __privateSet(this, _player12, null);
      }
    }
    set src(media) {
      if (isHlsSource(media)) {
        this.destroy();
        __privateSet(this, _player12, new Hls(__privateGet(this, _options3)));
        __privateGet(this, _player12).loadSource(media.src);
        __privateGet(this, _player12).attachMedia(this.element);
        __privateSet(this, _events10, Hls.Events);
        Object.keys(__privateGet(this, _events10)).forEach((event) => {
          __privateGet(this, _player12).on(
            __privateGet(this, _events10)[event],
            (...args) => this._assign(__privateGet(this, _events10)[event], args)
          );
        });
      }
    }
    get levels() {
      const levels = [];
      if (__privateGet(this, _player12) && __privateGet(this, _player12).levels && __privateGet(this, _player12).levels.length) {
        Object.keys(__privateGet(this, _player12).levels).forEach((item) => {
          const { height, name } = __privateGet(this, _player12).levels[item];
          const level = {
            height,
            id: item,
            label: name || null
          };
          levels.push(level);
        });
      }
      return levels;
    }
    set level(level) {
      const formattedLevel = Number(level);
      if (formattedLevel && formattedLevel > -1) {
        __privateGet(this, _player12).loadLevel = formattedLevel;
      } else {
        __privateGet(this, _player12).currentLevel = formattedLevel;
      }
    }
    get level() {
      return __privateGet(this, _player12) ? __privateGet(this, _player12).currentLevel : "-1";
    }
    _create() {
      const autoplay = !!(this.element.preload === "auto" || __privateGet(this, _autoplay));
      __privateGet(this, _options3).autoStartLoad = autoplay;
      __privateSet(this, _player12, new Hls(__privateGet(this, _options3)));
      this.instance = __privateGet(this, _player12);
      __privateSet(this, _events10, Hls.Events);
      Object.keys(__privateGet(this, _events10)).forEach((event) => {
        __privateGet(this, _player12).on(
          __privateGet(this, _events10)[event],
          (...args) => this._assign(__privateGet(this, _events10)[event], args)
        );
      });
      if (!autoplay) {
        this.element.addEventListener("play", this._play, EVENT_OPTIONS);
        this.element.addEventListener("pause", this._pause, EVENT_OPTIONS);
      }
    }
    // @see https://github.com/video-dev/hls.js/blob/master/src/events.js
    // @see https://github.com/video-dev/hls.js/blob/master/src/errors.js
    // @see https://github.com/video-dev/hls.js/blob/master/docs/API.md#runtime-events
    // @see https://github.com/video-dev/hls.js/blob/master/docs/API.md#errors
    _assign(event, data) {
      if (event === "hlsError") {
        const errorDetails = {
          detail: {
            data,
            message: data[1].details,
            type: "HLS"
          }
        };
        const errorEvent = addEvent("playererror", errorDetails);
        this.element.dispatchEvent(errorEvent);
        const type = data[1].type;
        const { fatal } = data[1];
        const details = data[1];
        if (fatal) {
          switch (type) {
            case "mediaError":
              const now = (/* @__PURE__ */ new Date()).getTime();
              if (!__privateGet(this, _recoverDecodingErrorDate) || now - __privateGet(this, _recoverDecodingErrorDate) > 3e3) {
                __privateSet(this, _recoverDecodingErrorDate, (/* @__PURE__ */ new Date()).getTime());
                __privateGet(this, _player12).recoverMediaError();
              } else if (!__privateGet(this, _recoverSwapAudioCodecDate) || now - __privateGet(this, _recoverSwapAudioCodecDate) > 3e3) {
                __privateSet(this, _recoverSwapAudioCodecDate, (/* @__PURE__ */ new Date()).getTime());
                console.warn("Attempting to swap Audio Codec and recover from media error");
                __privateGet(this, _player12).swapAudioCodec();
                __privateGet(this, _player12).recoverMediaError();
              } else {
                const msg = "Cannot recover, last media error recovery failed";
                console.error(msg);
                const mediaEvent = addEvent(type, { detail: { data: details } });
                this.element.dispatchEvent(mediaEvent);
              }
              break;
            case "networkError":
              const message = "Network error";
              console.error(message);
              const networkEvent = addEvent(type, { detail: { data: details } });
              this.element.dispatchEvent(networkEvent);
              break;
            default:
              __privateGet(this, _player12).destroy();
              const fatalEvent = addEvent(type, { detail: { data: details } });
              this.element.dispatchEvent(fatalEvent);
              break;
          }
        } else {
          const err = addEvent(type, { detail: { data: details } });
          this.element.dispatchEvent(err);
        }
      } else {
        const details = data[1];
        if (event === "hlsLevelLoaded" && details.live === true) {
          this.element.setAttribute("op-live__enabled", "true");
          const timeEvent = addEvent("timeupdate");
          this.element.dispatchEvent(timeEvent);
        } else if (event === "hlsLevelUpdated" && details.live === true && details.totalduration > DVR_THRESHOLD) {
          this.element.setAttribute("op-dvr__enabled", "true");
          const timeEvent = addEvent("timeupdate");
          this.element.dispatchEvent(timeEvent);
        } else if (event === "hlsFragParsingMetadata") {
          const metaEvent = addEvent("metadataready", { detail: { data: data[1] } });
          this.element.dispatchEvent(metaEvent);
        }
        const e = addEvent(event, { detail: { data: data[1] } });
        this.element.dispatchEvent(e);
      }
    }
    _play() {
      if (__privateGet(this, _player12)) {
        __privateGet(this, _player12).startLoad();
      }
    }
    _pause() {
      if (__privateGet(this, _player12)) {
        __privateGet(this, _player12).stopLoad();
      }
    }
  }
  _player12 = new WeakMap();
  _events10 = new WeakMap();
  _recoverDecodingErrorDate = new WeakMap();
  _recoverSwapAudioCodecDate = new WeakMap();
  _options3 = new WeakMap();
  _autoplay = new WeakMap();
  class HTML5Media extends Native {
    constructor(element, mediaFile) {
      super(element, mediaFile);
      __privateAdd(this, _currentLevel, void 0);
      __privateAdd(this, _levelList, []);
      __privateAdd(this, _isStreaming, false);
      __privateAdd(this, _retryCount, 0);
      __privateAdd(this, _started, false);
      __privateAdd(this, _timer2, void 0);
      if (!isAudio(element) && !isVideo(element)) {
        throw new TypeError("Native method only supports video/audio tags");
      }
      this._clearTimeout = this._clearTimeout.bind(this);
      this._setTimeout = this._setTimeout.bind(this);
      this._dispatchError = this._dispatchError.bind(this);
      this._isDvrEnabled = this._isDvrEnabled.bind(this);
      this._readMediadataInfo = this._readMediadataInfo.bind(this);
      __privateSet(this, _isStreaming, isHlsSource(mediaFile));
      this.element.addEventListener("playing", this._clearTimeout, EVENT_OPTIONS);
      this.element.addEventListener("stalled", this._setTimeout, EVENT_OPTIONS);
      this.element.addEventListener("error", this._dispatchError, EVENT_OPTIONS);
      this.element.addEventListener("loadeddata", this._isDvrEnabled, EVENT_OPTIONS);
      this.element.textTracks.addEventListener("addtrack", this._readMediadataInfo, EVENT_OPTIONS);
    }
    canPlayType(mimeType) {
      return !!this.element.canPlayType(mimeType).replace("no", "");
    }
    load() {
      this.element.load();
    }
    destroy() {
      this.element.removeEventListener("playing", this._clearTimeout);
      this.element.removeEventListener("stalled", this._setTimeout);
      this.element.removeEventListener("error", this._dispatchError);
      this.element.removeEventListener("loadeddata", this._isDvrEnabled);
      this.element.textTracks.removeEventListener("addtrack", this._readMediadataInfo);
    }
    get levels() {
      if (!__privateGet(this, _levelList).length) {
        const levels = this.element.querySelectorAll("source[title]");
        for (let i = 0, total = levels.length; i < total; ++i) {
          const level = {
            height: 0,
            id: `${i}`,
            label: levels[i].getAttribute("title") || ""
          };
          __privateGet(this, _levelList).push(level);
        }
      }
      return __privateGet(this, _levelList);
    }
    set level(level) {
      const idx = __privateGet(this, _levelList).findIndex((item) => item.id === level);
      if (idx > -1) {
        __privateSet(this, _currentLevel, this.levels[idx]);
        const levels = this.element.querySelectorAll("source[title]");
        for (let i = 0, total = levels.length; i < total; ++i) {
          const source = levels[i].getAttribute("src");
          if (source && parseInt(__privateGet(this, _currentLevel).id, 10) === i) {
            this.element.src = source;
          }
        }
      }
    }
    get level() {
      var _a;
      return ((_a = __privateGet(this, _currentLevel)) == null ? void 0 : _a.id) || "-1";
    }
    set src(media) {
      this.element.src = media.src;
    }
    _isDvrEnabled() {
      const time = this.element.seekable.end(this.element.seekable.length - 1) - this.element.seekable.start(0);
      if (__privateGet(this, _isStreaming) && time > DVR_THRESHOLD && !this.element.getAttribute("op-dvr__enabled")) {
        this.element.setAttribute("op-dvr__enabled", "true");
        const timeEvent = addEvent("timeupdate");
        this.element.dispatchEvent(timeEvent);
      }
    }
    _readMediadataInfo(e) {
      var _a;
      const target = e;
      if (((_a = target == null ? void 0 : target.track) == null ? void 0 : _a.kind) === "metadata") {
        target.track.mode = "hidden";
        target.track.addEventListener(
          "cuechange",
          (event) => {
            const track = event.target;
            const cue = track.activeCues ? track.activeCues[0] : null;
            if (cue) {
              const metaDataEvent = addEvent("metadataready", { detail: cue });
              this.element.dispatchEvent(metaDataEvent);
            }
          },
          EVENT_OPTIONS
        );
      }
    }
    _setTimeout() {
      if (!__privateGet(this, _started) && window !== void 0) {
        __privateSet(this, _started, true);
        __privateSet(this, _timer2, window.setInterval(() => {
          if (__privateGet(this, _retryCount) >= 30) {
            clearInterval(__privateGet(this, _timer2));
            const message = "Media download failed part-way due to a network error";
            const details = {
              detail: {
                data: { message, error: 2 },
                message,
                type: "HTML5"
              }
            };
            const errorEvent = addEvent("playererror", details);
            this.element.dispatchEvent(errorEvent);
            __privateSet(this, _retryCount, 0);
            __privateSet(this, _started, false);
          } else {
            __privateWrapper(this, _retryCount)._++;
          }
        }, 1e3));
      }
    }
    _clearTimeout() {
      if (__privateGet(this, _timer2)) {
        clearInterval(__privateGet(this, _timer2));
        __privateSet(this, _retryCount, 0);
        __privateSet(this, _started, false);
      }
    }
    _dispatchError(e) {
      let defaultMessage;
      const target = e.target;
      const error = target == null ? void 0 : target.error;
      switch (error == null ? void 0 : error.code) {
        case (error == null ? void 0 : error.MEDIA_ERR_ABORTED):
          defaultMessage = "Media playback aborted";
          break;
        case (error == null ? void 0 : error.MEDIA_ERR_NETWORK):
          defaultMessage = "Media download failed part-way due to a network error";
          break;
        case (error == null ? void 0 : error.MEDIA_ERR_DECODE):
          defaultMessage = `Media playback aborted due to a corruption problem or because the
                    media used features your browser did not support.`;
          break;
        case (error == null ? void 0 : error.MEDIA_ERR_SRC_NOT_SUPPORTED):
          defaultMessage = `Media could not be loaded, either because the server or network failed
                    or because the format is not supported.`;
          break;
        default:
          defaultMessage = "Unknown error occurred.";
          break;
      }
      const details = {
        detail: {
          data: { ...e, message: defaultMessage, error: error == null ? void 0 : error.code },
          message: defaultMessage,
          type: "HTML5"
        }
      };
      const errorEvent = addEvent("playererror", details);
      this.element.dispatchEvent(errorEvent);
    }
  }
  _currentLevel = new WeakMap();
  _levelList = new WeakMap();
  _isStreaming = new WeakMap();
  _retryCount = new WeakMap();
  _started = new WeakMap();
  _timer2 = new WeakMap();
  class Media {
    constructor(element, options, autoplay, customMedia) {
      __privateAdd(this, _element, void 0);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      __privateAdd(this, _media, void 0);
      __privateAdd(this, _files, void 0);
      __privateAdd(this, _promisePlay, void 0);
      __privateAdd(this, _options4, void 0);
      __privateAdd(this, _autoplay2, void 0);
      __privateAdd(this, _mediaLoaded, false);
      __privateAdd(this, _customMedia, {
        media: {},
        optionsKey: {},
        rules: []
      });
      __privateAdd(this, _currentSrc, void 0);
      __privateSet(this, _element, element);
      __privateSet(this, _options4, options);
      __privateSet(this, _files, this._getMediaFiles());
      __privateSet(this, _customMedia, customMedia);
      __privateSet(this, _autoplay2, autoplay);
    }
    canPlayType(mimeType) {
      return __privateGet(this, _media).canPlayType(mimeType);
    }
    async load() {
      if (__privateGet(this, _mediaLoaded)) {
        return;
      }
      __privateSet(this, _mediaLoaded, true);
      if (!__privateGet(this, _files).length) {
        throw new TypeError("Media not set");
      }
      if (__privateGet(this, _media) && typeof __privateGet(this, _media).destroy === "function") {
        const sameMedia = __privateGet(this, _files).length === 1 && __privateGet(this, _files)[0].src === __privateGet(this, _media).media.src;
        if (!sameMedia) {
          __privateGet(this, _media).destroy();
        }
      }
      __privateGet(this, _files).some((media) => {
        try {
          __privateSet(this, _media, this._invoke(media));
        } catch (e) {
          __privateSet(this, _media, new HTML5Media(__privateGet(this, _element), media));
        }
        return __privateGet(this, _media).canPlayType(media.type);
      });
      try {
        if (__privateGet(this, _media) === null) {
          throw new TypeError("Media cannot be played with any valid media type");
        }
        await __privateGet(this, _media).promise;
        __privateGet(this, _media).load();
      } catch (e) {
        if (__privateGet(this, _media)) {
          __privateGet(this, _media).destroy();
        }
        throw e;
      }
    }
    // @see https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
    async play() {
      if (!__privateGet(this, _mediaLoaded)) {
        await this.load();
        __privateSet(this, _mediaLoaded, false);
      } else {
        await __privateGet(this, _media).promise;
      }
      __privateSet(this, _promisePlay, __privateGet(this, _media).play());
      return __privateGet(this, _promisePlay);
    }
    // @see https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
    async pause() {
      if (__privateGet(this, _promisePlay) !== void 0) {
        await __privateGet(this, _promisePlay);
      }
      __privateGet(this, _media).pause();
    }
    destroy() {
      if (__privateGet(this, _media)) {
        __privateGet(this, _media).destroy();
      }
    }
    set src(media) {
      if (typeof media === "string") {
        __privateGet(this, _files).push({
          src: media,
          type: predictMimeType(media, __privateGet(this, _element))
        });
      } else if (Array.isArray(media)) {
        __privateSet(this, _files, media);
      } else if (typeof media === "object") {
        __privateGet(this, _files).push(media);
      }
      __privateSet(this, _files, __privateGet(this, _files).filter((file) => file.src));
      if (__privateGet(this, _files).length > 0) {
        const [file] = __privateGet(this, _files);
        if (__privateGet(this, _element).src) {
          __privateGet(this, _element).setAttribute("data-op-file", __privateGet(this, _files)[0].src);
        }
        __privateGet(this, _element).src = file.src;
        __privateSet(this, _currentSrc, file);
        if (__privateGet(this, _media)) {
          __privateGet(this, _media).src = file;
        }
      } else {
        __privateGet(this, _element).src = "";
      }
    }
    get src() {
      return __privateGet(this, _files);
    }
    get current() {
      return __privateGet(this, _currentSrc);
    }
    set mediaFiles(sources) {
      __privateSet(this, _files, sources);
    }
    get mediaFiles() {
      return __privateGet(this, _files);
    }
    set volume(value) {
      if (__privateGet(this, _media)) {
        __privateGet(this, _media).volume = value;
      }
    }
    get volume() {
      return __privateGet(this, _media) ? __privateGet(this, _media).volume : __privateGet(this, _element).volume;
    }
    set muted(value) {
      if (__privateGet(this, _media)) {
        __privateGet(this, _media).muted = value;
      }
    }
    get muted() {
      return __privateGet(this, _media) ? __privateGet(this, _media).muted : __privateGet(this, _element).muted;
    }
    set playbackRate(value) {
      if (__privateGet(this, _media)) {
        __privateGet(this, _media).playbackRate = value;
      }
    }
    get playbackRate() {
      return __privateGet(this, _media) ? __privateGet(this, _media).playbackRate : __privateGet(this, _element).playbackRate;
    }
    set defaultPlaybackRate(value) {
      if (__privateGet(this, _media)) {
        __privateGet(this, _media).defaultPlaybackRate = value;
      }
    }
    get defaultPlaybackRate() {
      return __privateGet(this, _media) ? __privateGet(this, _media).defaultPlaybackRate : __privateGet(this, _element).defaultPlaybackRate;
    }
    set currentTime(value) {
      if (__privateGet(this, _media)) {
        __privateGet(this, _media).currentTime = value;
      }
    }
    get currentTime() {
      return __privateGet(this, _media) ? __privateGet(this, _media).currentTime : __privateGet(this, _element).currentTime;
    }
    get duration() {
      const duration = __privateGet(this, _media) ? __privateGet(this, _media).duration : __privateGet(this, _element).duration;
      if (duration === Infinity && __privateGet(this, _element).seekable && __privateGet(this, _element).seekable.length) {
        return __privateGet(this, _element).seekable.end(0);
      }
      return duration;
    }
    get paused() {
      return __privateGet(this, _media) ? __privateGet(this, _media).paused : __privateGet(this, _element).paused;
    }
    get ended() {
      return __privateGet(this, _media) ? __privateGet(this, _media).ended : __privateGet(this, _element).ended;
    }
    set loaded(loaded) {
      __privateSet(this, _mediaLoaded, loaded);
    }
    get loaded() {
      return __privateGet(this, _mediaLoaded);
    }
    set level(value) {
      if (__privateGet(this, _media)) {
        __privateGet(this, _media).level = value;
      }
    }
    get level() {
      return __privateGet(this, _media) ? __privateGet(this, _media).level : -1;
    }
    get levels() {
      return __privateGet(this, _media) ? __privateGet(this, _media).levels : [];
    }
    get instance() {
      return __privateGet(this, _media) ? __privateGet(this, _media).instance : null;
    }
    _getMediaFiles() {
      const mediaFiles = [];
      const sourceTags = __privateGet(this, _element).querySelectorAll("source");
      const nodeSource = __privateGet(this, _element).src;
      if (nodeSource) {
        mediaFiles.push({
          src: nodeSource,
          type: __privateGet(this, _element).getAttribute("type") || predictMimeType(nodeSource, __privateGet(this, _element))
        });
      }
      for (let i = 0, total = sourceTags.length; i < total; i++) {
        const item = sourceTags[i];
        const { src } = item;
        mediaFiles.push({
          src,
          type: item.getAttribute("type") || predictMimeType(src, __privateGet(this, _element))
        });
        if (i === 0) {
          const [file] = mediaFiles;
          __privateSet(this, _currentSrc, file);
        }
      }
      if (!mediaFiles.length) {
        mediaFiles.push({
          src: "",
          type: predictMimeType("", __privateGet(this, _element))
        });
      }
      return mediaFiles;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _invoke(media) {
      var _a, _b, _c;
      const playHLSNatively = __privateGet(this, _element).canPlayType("application/vnd.apple.mpegurl") || __privateGet(this, _element).canPlayType("application/x-mpegURL");
      __privateSet(this, _currentSrc, media);
      const { layers } = __privateGet(this, _options4).controls || {};
      let activeLevels = false;
      if (layers) {
        Object.keys(layers).forEach((layer) => {
          const current = layers ? layers[layer] : null;
          if (current && current.indexOf("levels") > -1) {
            activeLevels = true;
          }
        });
      }
      if (Object.keys(__privateGet(this, _customMedia).media).length) {
        let customRef;
        __privateGet(this, _customMedia).rules.forEach((rule) => {
          const type = rule(media.src);
          if (type) {
            const customMedia = __privateGet(this, _customMedia).media[type];
            const customOptions = __privateGet(this, _options4)[__privateGet(this, _customMedia).optionsKey[type]] || void 0;
            customRef = customMedia(__privateGet(this, _element), media, __privateGet(this, _autoplay2), customOptions);
          }
        });
        if (customRef) {
          customRef.create();
          return customRef;
        }
        return new HTML5Media(__privateGet(this, _element), media);
      }
      if (isHlsSource(media)) {
        if (playHLSNatively && __privateGet(this, _options4).forceNative && !activeLevels) {
          return new HTML5Media(__privateGet(this, _element), media);
        }
        const hlsOptions = ((_a = __privateGet(this, _options4)) == null ? void 0 : _a.hls) || void 0;
        return new HlsMedia(__privateGet(this, _element), media, __privateGet(this, _autoplay2), hlsOptions);
      }
      if (isDashSource(media)) {
        const dashOptions = ((_b = __privateGet(this, _options4)) == null ? void 0 : _b.dash) || void 0;
        return new DashMedia(__privateGet(this, _element), media, dashOptions);
      }
      if (isFlvSource(media)) {
        const flvOptions = ((_c = __privateGet(this, _options4)) == null ? void 0 : _c.flv) || {
          debug: false,
          type: "flv",
          url: media.src
        };
        return new FlvMedia(__privateGet(this, _element), media, flvOptions);
      }
      return new HTML5Media(__privateGet(this, _element), media);
    }
  }
  _element = new WeakMap();
  _media = new WeakMap();
  _files = new WeakMap();
  _promisePlay = new WeakMap();
  _options4 = new WeakMap();
  _autoplay2 = new WeakMap();
  _mediaLoaded = new WeakMap();
  _customMedia = new WeakMap();
  _currentSrc = new WeakMap();
  class Ads {
    constructor(player, ads, autostart, autostartMuted, options) {
      __privateAdd(this, _ended, void 0);
      __privateAdd(this, _done, void 0);
      __privateAdd(this, _active, void 0);
      __privateAdd(this, _started2, void 0);
      __privateAdd(this, _intervalTimer, void 0);
      __privateAdd(this, _volume2, void 0);
      __privateAdd(this, _muted, void 0);
      __privateAdd(this, _duration2, void 0);
      __privateAdd(this, _currentTime2, void 0);
      __privateAdd(this, _manager, void 0);
      __privateAdd(this, _player13, void 0);
      __privateAdd(this, _media2, void 0);
      __privateAdd(this, _element2, void 0);
      __privateAdd(this, _events11, void 0);
      __privateAdd(this, _ads, void 0);
      __privateAdd(this, _promise, void 0);
      // @see https://tinyurl.com/ycwp4ufd
      __privateAdd(this, _loader, void 0);
      __privateAdd(this, _container3, void 0);
      __privateAdd(this, _customClickContainer, void 0);
      __privateAdd(this, _skipElement, void 0);
      // @see https://tinyurl.com/ya3zksso
      __privateAdd(this, _displayContainer, void 0);
      // @see https://tinyurl.com/ya8bxjf4
      __privateAdd(this, _request, void 0);
      __privateAdd(this, _autostart, void 0);
      __privateAdd(this, _autostartMuted, void 0);
      __privateAdd(this, _playTriggered, void 0);
      __privateAdd(this, _options5, void 0);
      __privateAdd(this, _currentIndex, void 0);
      __privateAdd(this, _originalVolume, void 0);
      __privateAdd(this, _preloadContent, void 0);
      __privateAdd(this, _lastTimePaused, void 0);
      __privateAdd(this, _mediaSources, void 0);
      __privateAdd(this, _mediaStarted, void 0);
      __privateAdd(this, _adEvent, void 0);
      var _a, _b, _c, _d;
      this.loadedAd = false;
      __privateSet(this, _ended, false);
      __privateSet(this, _done, false);
      __privateSet(this, _active, false);
      __privateSet(this, _started2, false);
      __privateSet(this, _intervalTimer, 0);
      __privateSet(this, _muted, false);
      __privateSet(this, _duration2, 0);
      __privateSet(this, _currentTime2, 0);
      __privateSet(this, _manager, null);
      __privateSet(this, _events11, []);
      __privateSet(this, _autostart, false);
      __privateSet(this, _autostartMuted, false);
      __privateSet(this, _playTriggered, false);
      __privateSet(this, _currentIndex, 0);
      __privateSet(this, _lastTimePaused, 0);
      __privateSet(this, _mediaSources, []);
      __privateSet(this, _mediaStarted, false);
      __privateSet(this, _adEvent, null);
      const defaultOpts = {
        autoPlayAdBreaks: true,
        customClick: {
          enabled: false,
          label: "Click here for more info"
        },
        audioSkip: {
          enabled: true,
          label: "Skip Ad",
          remainingLabel: "Skip in [[secs]] seconds"
        },
        debug: false,
        enablePreloading: false,
        language: "en",
        loop: false,
        numRedirects: 4,
        publisherId: void 0,
        sdkPath: "https://imasdk.googleapis.com/js/sdkloader/ima3.js",
        sessionId: void 0,
        src: [],
        vpaidMode: "enabled"
      };
      __privateSet(this, _player13, player);
      __privateSet(this, _ads, ads);
      __privateSet(this, _media2, player.getMedia());
      __privateSet(this, _element2, player.getElement());
      __privateSet(this, _autostart, autostart || false);
      __privateSet(this, _muted, player.getElement().muted);
      __privateSet(this, _autostartMuted, autostartMuted || false);
      __privateSet(this, _options5, { ...defaultOpts, ...options });
      if ((options == null ? void 0 : options.customClick) && Object.keys(options.customClick).length) {
        __privateGet(this, _options5).customClick = { ...defaultOpts.customClick, ...options.customClick };
      }
      __privateSet(this, _playTriggered, false);
      __privateSet(this, _originalVolume, __privateGet(this, _element2).volume);
      __privateSet(this, _volume2, __privateGet(this, _originalVolume));
      const path = ((_a = __privateGet(this, _options5)) == null ? void 0 : _a.debug) ? (_c = (_b = __privateGet(this, _options5)) == null ? void 0 : _b.sdkPath) == null ? void 0 : _c.replace(/(\.js$)/, "_debug.js") : (_d = __privateGet(this, _options5)) == null ? void 0 : _d.sdkPath;
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
      __privateSet(this, _promise, path && (typeof google === "undefined" || typeof google.ima === "undefined") ? loadScript(path) : new Promise((resolve) => {
        resolve();
      }));
      __privateGet(this, _promise).then(() => {
        this.load();
      }).catch((error) => {
        let message = "Ad script could not be loaded; please check if you have an AdBlock ";
        message += "turned on, or if you provided a valid URL is correct";
        console.error(`Ad error: ${message}.`);
        const details = {
          detail: {
            data: error,
            message,
            type: "Ads"
          }
        };
        const errorEvent = addEvent("playererror", details);
        __privateGet(this, _element2).dispatchEvent(errorEvent);
      });
    }
    load(force = false) {
      var _a, _b, _c;
      if (typeof google === "undefined" || !google.ima || !force && this.loadedAd && __privateGet(this, _options5).autoPlayAdBreaks) {
        return;
      }
      if (!__privateGet(this, _options5).autoPlayAdBreaks && !force) {
        return;
      }
      this.loadedAd = true;
      const existingContainer = __privateGet(this, _player13).getContainer().querySelector(".op-ads");
      if (existingContainer && existingContainer.parentNode) {
        existingContainer.parentNode.removeChild(existingContainer);
      }
      __privateSet(this, _started2, true);
      __privateSet(this, _container3, document.createElement("div"));
      __privateGet(this, _container3).className = "op-ads";
      __privateGet(this, _container3).tabIndex = -1;
      if (__privateGet(this, _element2).parentElement) {
        __privateGet(this, _element2).parentElement.insertBefore(__privateGet(this, _container3), __privateGet(this, _element2).nextSibling);
      }
      __privateGet(this, _container3).addEventListener("click", this._handleClickInContainer);
      if ((_a = __privateGet(this, _options5).customClick) == null ? void 0 : _a.enabled) {
        __privateSet(this, _customClickContainer, document.createElement("div"));
        __privateGet(this, _customClickContainer).className = "op-ads__click-container";
        __privateGet(this, _customClickContainer).innerHTML = `<div class="op-ads__click-label">${__privateGet(this, _options5).customClick.label}</div>`;
        if (__privateGet(this, _element2).parentElement) {
          __privateGet(this, _element2).parentElement.insertBefore(__privateGet(this, _customClickContainer), __privateGet(this, _element2).nextSibling);
        }
      }
      if (isAudio(__privateGet(this, _element2)) && ((_b = __privateGet(this, _options5).audioSkip) == null ? void 0 : _b.enabled)) {
        if ((_c = __privateGet(this, _options5).audioSkip) == null ? void 0 : _c.element) {
          const { element } = __privateGet(this, _options5).audioSkip || {};
          if (typeof element === "string") {
            const target = document.getElementById(element);
            if (target) {
              __privateSet(this, _skipElement, target);
            }
          } else if (element instanceof HTMLElement) {
            __privateSet(this, _skipElement, element);
          }
        } else {
          __privateSet(this, _skipElement, document.createElement("button"));
          __privateGet(this, _skipElement).className = "op-ads__skip hidden";
          __privateGet(this, _player13).getControls().getContainer().appendChild(__privateGet(this, _skipElement));
        }
        if (__privateGet(this, _skipElement)) {
          __privateGet(this, _skipElement).addEventListener("click", this._handleSkipAds, EVENT_OPTIONS);
        }
      }
      __privateSet(this, _mediaSources, __privateGet(this, _media2).src);
      const vpaidModeMap = {
        disabled: google.ima.ImaSdkSettings.VpaidMode.DISABLED,
        enabled: google.ima.ImaSdkSettings.VpaidMode.ENABLED,
        insecure: google.ima.ImaSdkSettings.VpaidMode.INSECURE
      };
      google.ima.settings.setVpaidMode(vpaidModeMap[__privateGet(this, _options5).vpaidMode || "enabled"]);
      google.ima.settings.setDisableCustomPlaybackForIOS10Plus(true);
      google.ima.settings.setAutoPlayAdBreaks(__privateGet(this, _options5).autoPlayAdBreaks);
      google.ima.settings.setNumRedirects(__privateGet(this, _options5).numRedirects);
      google.ima.settings.setLocale(__privateGet(this, _options5).language);
      if (__privateGet(this, _options5).sessionId) {
        google.ima.settings.setSessionId(__privateGet(this, _options5).sessionId);
      }
      if (__privateGet(this, _options5).publisherId) {
        google.ima.settings.setPpid(__privateGet(this, _options5).publisherId);
      }
      google.ima.settings.setPlayerType("openplayerjs");
      google.ima.settings.setPlayerVersion("3.0.0");
      __privateSet(this, _displayContainer, new google.ima.AdDisplayContainer(
        __privateGet(this, _container3),
        __privateGet(this, _element2),
        __privateGet(this, _customClickContainer)
      ));
      __privateSet(this, _loader, new google.ima.AdsLoader(__privateGet(this, _displayContainer)));
      __privateGet(this, _loader).addEventListener(
        google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        this._loaded,
        EVENT_OPTIONS
      );
      __privateGet(this, _loader).addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._error, EVENT_OPTIONS);
      if (typeof window !== "undefined") {
        window.addEventListener("resize", this._handleResizeAds, EVENT_OPTIONS);
      }
      __privateGet(this, _element2).addEventListener("loadedmetadata", this._handleResizeAds, EVENT_OPTIONS);
      if (__privateGet(this, _autostart) === true || __privateGet(this, _autostartMuted) === true || force === true || __privateGet(this, _options5).enablePreloading === true || __privateGet(this, _playTriggered) === true) {
        if (!__privateGet(this, _done)) {
          __privateSet(this, _done, true);
          __privateGet(this, _displayContainer).initialize();
        }
        this._requestAds();
      }
    }
    async play() {
      if (!__privateGet(this, _done)) {
        __privateSet(this, _playTriggered, true);
        this._initNotDoneAds();
        return;
      }
      if (__privateGet(this, _manager)) {
        try {
          if (!__privateGet(this, _intervalTimer) && __privateGet(this, _active) === false) {
            __privateGet(this, _manager).start();
          } else {
            __privateGet(this, _manager).resume();
          }
          __privateSet(this, _active, true);
          const e = addEvent("play");
          __privateGet(this, _element2).dispatchEvent(e);
        } catch (err) {
          this._resumeMedia();
        }
      }
    }
    pause() {
      if (__privateGet(this, _manager)) {
        __privateSet(this, _active, false);
        __privateGet(this, _manager).pause();
        const e = addEvent("pause");
        __privateGet(this, _element2).dispatchEvent(e);
      }
    }
    destroy() {
      var _a, _b;
      if (__privateGet(this, _manager)) {
        __privateGet(this, _manager).removeEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._error);
        if (__privateGet(this, _events11)) {
          __privateGet(this, _events11).forEach((event) => {
            __privateGet(this, _manager).removeEventListener(event, this._assign);
          });
        }
      }
      __privateSet(this, _events11, []);
      const controls = __privateGet(this, _player13).getControls();
      const mouseEvents = controls ? controls.events.mouse : {};
      Object.keys(mouseEvents).forEach((event) => {
        if (__privateGet(this, _container3)) {
          __privateGet(this, _container3).removeEventListener(event, mouseEvents[event]);
        }
      });
      if (__privateGet(this, _loader)) {
        __privateGet(this, _loader).removeEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._error);
        __privateGet(this, _loader).removeEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, this._loaded);
      }
      const destroy = !Array.isArray(__privateGet(this, _ads)) || __privateGet(this, _currentIndex) > __privateGet(this, _ads).length;
      if (__privateGet(this, _manager) && destroy) {
        __privateGet(this, _manager).destroy();
      }
      if (((_a = __privateGet(this, _options5).customClick) == null ? void 0 : _a.enabled) && __privateGet(this, _customClickContainer)) {
        __privateGet(this, _customClickContainer).remove();
      }
      if (((_b = __privateGet(this, _options5).audioSkip) == null ? void 0 : _b.enabled) && __privateGet(this, _skipElement)) {
        __privateGet(this, _skipElement).removeEventListener("click", this._handleSkipAds);
        __privateGet(this, _skipElement).remove();
      }
      if (IS_IOS || IS_ANDROID) {
        __privateGet(this, _element2).removeEventListener("loadedmetadata", this._contentLoadedAction);
      }
      __privateGet(this, _element2).removeEventListener("loadedmetadata", this._handleResizeAds);
      __privateGet(this, _element2).removeEventListener("loadedmetadata", this._loadedMetadataHandler);
      __privateGet(this, _element2).removeEventListener("ended", this._contentEndedListener);
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", this._handleResizeAds);
      }
      if (__privateGet(this, _container3)) {
        __privateGet(this, _container3).removeEventListener("click", this._handleClickInContainer);
        __privateGet(this, _container3).remove();
      }
      this.loadPromise = null;
      this.loadedAd = false;
      __privateSet(this, _done, false);
      __privateSet(this, _playTriggered, false);
      __privateSet(this, _duration2, 0);
      __privateSet(this, _currentTime2, 0);
      __privateSet(this, _adEvent, null);
    }
    resizeAds(width, height) {
      if (__privateGet(this, _manager)) {
        const target = __privateGet(this, _element2);
        const mode = target.getAttribute("data-fullscreen") === "true" ? google.ima.ViewMode.FULLSCREEN : google.ima.ViewMode.NORMAL;
        let formattedWidth = width;
        const percentageWidth = width ? width.toString() : "";
        if (width && percentageWidth.indexOf("%") > -1) {
          if (__privateGet(this, _element2).parentElement) {
            formattedWidth = __privateGet(this, _element2).parentElement.offsetWidth * (parseInt(percentageWidth, 10) / 100);
          }
        }
        let formattedHeight = height;
        const percentageHeight = height ? height.toString() : "";
        if (height && percentageHeight.indexOf("%") > -1) {
          if (__privateGet(this, _element2).parentElement) {
            formattedHeight = __privateGet(this, _element2).parentElement.offsetHeight * (parseInt(percentageHeight, 10) / 100);
          }
        }
        let timeout;
        if (timeout && typeof window !== "undefined") {
          window.cancelAnimationFrame(timeout);
        }
        if (typeof window !== "undefined") {
          timeout = window.requestAnimationFrame(() => {
            __privateGet(this, _manager).resize(
              formattedWidth || target.offsetWidth,
              formattedHeight || target.offsetHeight,
              mode
            );
          });
        }
      }
    }
    getAdsManager() {
      return __privateGet(this, _manager);
    }
    getAdsLoader() {
      return __privateGet(this, _loader);
    }
    started() {
      return __privateGet(this, _started2);
    }
    set src(source) {
      __privateSet(this, _ads, source);
    }
    set isDone(value) {
      __privateSet(this, _done, value);
    }
    set playRequested(value) {
      __privateSet(this, _playTriggered, value);
    }
    set volume(value) {
      if (__privateGet(this, _manager)) {
        __privateSet(this, _volume2, value);
        __privateGet(this, _manager).setVolume(value);
        this._setMediaVolume(value);
        __privateSet(this, _muted, value === 0);
      }
    }
    get volume() {
      return __privateGet(this, _manager) ? __privateGet(this, _manager).getVolume() : __privateGet(this, _originalVolume);
    }
    set muted(value) {
      if (__privateGet(this, _manager)) {
        if (value) {
          __privateGet(this, _manager).setVolume(0);
          __privateSet(this, _muted, true);
          this._setMediaVolume(0);
        } else {
          __privateGet(this, _manager).setVolume(__privateGet(this, _volume2));
          __privateSet(this, _muted, false);
          this._setMediaVolume(__privateGet(this, _volume2));
        }
      }
    }
    get muted() {
      return __privateGet(this, _muted);
    }
    set currentTime(value) {
      __privateSet(this, _currentTime2, value);
    }
    get currentTime() {
      return __privateGet(this, _currentTime2);
    }
    get duration() {
      return __privateGet(this, _duration2);
    }
    get paused() {
      return !__privateGet(this, _active);
    }
    get ended() {
      return __privateGet(this, _ended);
    }
    _assign(event) {
      var _a, _b;
      const ad = event.getAd();
      if (ad) {
        __privateSet(this, _adEvent, ad);
      }
      switch (event.type) {
        case google.ima.AdEvent.Type.LOADED:
          if (!ad.isLinear()) {
            this._onContentResumeRequested();
          } else {
            if (IS_IPHONE && isVideo(__privateGet(this, _element2))) {
              __privateGet(this, _element2).controls = false;
            }
            __privateSet(this, _duration2, ad.getDuration());
            __privateSet(this, _currentTime2, ad.getDuration());
            if (!__privateGet(this, _mediaStarted) && !IS_IOS && !IS_ANDROID) {
              const waitingEvent = addEvent("waiting");
              __privateGet(this, _element2).dispatchEvent(waitingEvent);
              const loadedEvent = addEvent("loadedmetadata");
              __privateGet(this, _element2).dispatchEvent(loadedEvent);
              this.resizeAds();
            }
          }
          break;
        case google.ima.AdEvent.Type.STARTED:
          if (ad.isLinear()) {
            if (__privateGet(this, _element2).parentElement && !__privateGet(this, _element2).parentElement.classList.contains("op-ads--active")) {
              __privateGet(this, _element2).parentElement.classList.add("op-ads--active");
            }
            if (!__privateGet(this, _media2).paused) {
              __privateGet(this, _media2).pause();
            }
            __privateSet(this, _active, true);
            const playEvent = addEvent("play");
            __privateGet(this, _element2).dispatchEvent(playEvent);
            let resized;
            if (!resized) {
              this.resizeAds();
              resized = true;
            }
            if (__privateGet(this, _media2).ended) {
              __privateSet(this, _ended, false);
              const endEvent = addEvent("adsmediaended");
              __privateGet(this, _element2).dispatchEvent(endEvent);
            }
            if (typeof window !== "undefined") {
              __privateSet(this, _intervalTimer, window.setInterval(() => {
                if (__privateGet(this, _active) === true) {
                  __privateSet(this, _currentTime2, Math.round(__privateGet(this, _manager).getRemainingTime()));
                  const timeEvent = addEvent("timeupdate");
                  __privateGet(this, _element2).dispatchEvent(timeEvent);
                }
              }, 350));
            }
          }
          break;
        case google.ima.AdEvent.Type.COMPLETE:
        case google.ima.AdEvent.Type.SKIPPED:
          if (ad.isLinear()) {
            if (event.type === google.ima.AdEvent.Type.SKIPPED) {
              const skipEvent = addEvent("adsskipped");
              __privateGet(this, _element2).dispatchEvent(skipEvent);
            }
            if (__privateGet(this, _element2).parentElement) {
              __privateGet(this, _element2).parentElement.classList.remove("op-ads--active");
            }
            __privateSet(this, _active, false);
            clearInterval(__privateGet(this, _intervalTimer));
          }
          break;
        case google.ima.AdEvent.Type.VOLUME_CHANGED:
          this._setMediaVolume(this.volume);
          break;
        case google.ima.AdEvent.Type.VOLUME_MUTED:
          if (ad.isLinear()) {
            const volumeEvent = addEvent("volumechange");
            __privateGet(this, _element2).dispatchEvent(volumeEvent);
          }
          break;
        case google.ima.AdEvent.Type.ALL_ADS_COMPLETED:
          if (ad.isLinear()) {
            __privateSet(this, _active, false);
            __privateSet(this, _ended, true);
            __privateSet(this, _intervalTimer, 0);
            __privateSet(this, _muted, false);
            __privateSet(this, _started2, false);
            __privateSet(this, _adEvent, null);
            if (__privateGet(this, _element2).parentElement) {
              __privateGet(this, _element2).parentElement.classList.remove("op-ads--active");
            }
            this.destroy();
            if (__privateGet(this, _element2).currentTime >= __privateGet(this, _element2).duration) {
              const endedEvent = addEvent("ended");
              __privateGet(this, _element2).dispatchEvent(endedEvent);
            }
          }
          break;
        case google.ima.AdEvent.Type.CLICK:
          const pauseEvent = addEvent("pause");
          __privateGet(this, _element2).dispatchEvent(pauseEvent);
          break;
        case google.ima.AdEvent.Type.AD_BREAK_READY:
          if (!__privateGet(this, _options5).autoPlayAdBreaks) {
            this.play();
          }
          break;
        case google.ima.AdEvent.Type.AD_PROGRESS:
          const progressData = event.getAdData();
          const offset2 = __privateGet(this, _adEvent) ? __privateGet(this, _adEvent).getSkipTimeOffset() : -1;
          if (__privateGet(this, _skipElement)) {
            if (offset2 !== -1) {
              const canSkip = __privateGet(this, _manager).getAdSkippableState();
              const remainingTime = Math.ceil(offset2 - progressData.currentTime);
              __privateGet(this, _skipElement).classList.remove("hidden");
              if (canSkip) {
                __privateGet(this, _skipElement).textContent = ((_a = __privateGet(this, _options5).audioSkip) == null ? void 0 : _a.label) || "";
                __privateGet(this, _skipElement).classList.remove("disabled");
              } else {
                __privateGet(this, _skipElement).textContent = ((_b = __privateGet(this, _options5).audioSkip) == null ? void 0 : _b.remainingLabel.replace("[[secs]]", remainingTime.toString())) || "";
                __privateGet(this, _skipElement).classList.add("disabled");
              }
            } else {
              __privateGet(this, _skipElement).classList.add("hidden");
            }
          }
          break;
      }
      if (event.type === google.ima.AdEvent.Type.LOG) {
        const adData = event.getAdData();
        if (adData.adError) {
          const message = adData.adError.getMessage();
          console.warn(`Ad warning: Non-fatal error occurred: ${message}`);
          const details = {
            detail: {
              data: adData.adError,
              message,
              type: "Ads"
            }
          };
          const errorEvent = addEvent("playererror", details);
          __privateGet(this, _element2).dispatchEvent(errorEvent);
        }
      } else {
        const e = addEvent(`ads${event.type}`);
        __privateGet(this, _element2).dispatchEvent(e);
      }
    }
    // @see https://developers.google.com/interactive-media-ads/docs/sdks/html5/v3/apis#ima.AdError.ErrorCode
    _error(event) {
      const error = event.getError();
      const details = {
        detail: {
          data: error,
          message: error.toString(),
          type: "Ads"
        }
      };
      const errorEvent = addEvent("playererror", details);
      __privateGet(this, _element2).dispatchEvent(errorEvent);
      const fatalErrorCodes = [
        100,
        101,
        102,
        300,
        301,
        302,
        303,
        400,
        401,
        402,
        403,
        405,
        406,
        407,
        408,
        409,
        410,
        500,
        501,
        502,
        503,
        900,
        901,
        1005
      ];
      if (Array.isArray(__privateGet(this, _ads)) && __privateGet(this, _ads).length > 1 && __privateGet(this, _currentIndex) < __privateGet(this, _ads).length - 1) {
        __privateWrapper(this, _currentIndex)._++;
        this.destroy();
        __privateSet(this, _started2, true);
        __privateSet(this, _playTriggered, true);
        this.load(true);
        console.warn(`Ad warning: ${error.toString()}`);
      } else {
        if (fatalErrorCodes.indexOf(error.getErrorCode()) > -1) {
          if (__privateGet(this, _manager)) {
            __privateGet(this, _manager).destroy();
          }
          console.error(`Ad error: ${error.toString()}`);
        } else {
          console.warn(`Ad warning: ${error.toString()}`);
        }
        __privateSet(this, _adEvent, null);
        if (__privateGet(this, _autostart) === true || __privateGet(this, _autostartMuted) === true || __privateGet(this, _started2) === true) {
          __privateSet(this, _active, false);
          this._resumeMedia();
        }
      }
    }
    _loaded(managerLoadedEvent) {
      const adsRenderingSettings = new google.ima.AdsRenderingSettings();
      adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = false;
      adsRenderingSettings.enablePreloading = __privateGet(this, _options5).enablePreloading;
      __privateSet(this, _manager, managerLoadedEvent.getAdsManager(__privateGet(this, _element2), adsRenderingSettings));
      this._start(__privateGet(this, _manager));
      this.loadPromise = new Promise((resolve) => {
        resolve();
      });
    }
    _start(manager) {
      if (__privateGet(this, _customClickContainer) && manager.isCustomClickTrackingUsed()) {
        __privateGet(this, _customClickContainer).classList.add("op-ads__click-container--visible");
      }
      manager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
        this._onContentPauseRequested,
        EVENT_OPTIONS
      );
      manager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
        this._onContentResumeRequested,
        EVENT_OPTIONS
      );
      __privateSet(this, _events11, [
        google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
        google.ima.AdEvent.Type.CLICK,
        google.ima.AdEvent.Type.VIDEO_CLICKED,
        google.ima.AdEvent.Type.VIDEO_ICON_CLICKED,
        google.ima.AdEvent.Type.AD_PROGRESS,
        google.ima.AdEvent.Type.AD_BUFFERING,
        google.ima.AdEvent.Type.IMPRESSION,
        google.ima.AdEvent.Type.DURATION_CHANGE,
        google.ima.AdEvent.Type.USER_CLOSE,
        google.ima.AdEvent.Type.LINEAR_CHANGED,
        google.ima.AdEvent.Type.SKIPPABLE_STATE_CHANGED,
        google.ima.AdEvent.Type.AD_METADATA,
        google.ima.AdEvent.Type.INTERACTION,
        google.ima.AdEvent.Type.COMPLETE,
        google.ima.AdEvent.Type.FIRST_QUARTILE,
        google.ima.AdEvent.Type.LOADED,
        google.ima.AdEvent.Type.MIDPOINT,
        google.ima.AdEvent.Type.PAUSED,
        google.ima.AdEvent.Type.RESUMED,
        google.ima.AdEvent.Type.USER_CLOSE,
        google.ima.AdEvent.Type.STARTED,
        google.ima.AdEvent.Type.THIRD_QUARTILE,
        google.ima.AdEvent.Type.SKIPPED,
        google.ima.AdEvent.Type.VOLUME_CHANGED,
        google.ima.AdEvent.Type.VOLUME_MUTED,
        google.ima.AdEvent.Type.LOG
      ]);
      if (!__privateGet(this, _options5).autoPlayAdBreaks) {
        __privateGet(this, _events11).push(google.ima.AdEvent.Type.AD_BREAK_READY);
      }
      const controls = __privateGet(this, _player13).getControls();
      const mouseEvents = controls ? controls.events.mouse : {};
      Object.keys(mouseEvents).forEach((event) => {
        if (__privateGet(this, _container3)) {
          __privateGet(this, _container3).addEventListener(event, mouseEvents[event], EVENT_OPTIONS);
        }
      });
      __privateGet(this, _events11).forEach((event) => {
        manager.addEventListener(event, this._assign, EVENT_OPTIONS);
      });
      if (__privateGet(this, _autostart) === true || __privateGet(this, _autostartMuted) === true || __privateGet(this, _playTriggered) === true) {
        __privateSet(this, _playTriggered, false);
        if (!__privateGet(this, _done)) {
          this._initNotDoneAds();
          return;
        }
        manager.init(
          __privateGet(this, _element2).offsetWidth,
          __privateGet(this, _element2).offsetHeight,
          __privateGet(this, _element2).parentElement && __privateGet(this, _element2).parentElement.getAttribute("data-fullscreen") === "true" ? google.ima.ViewMode.FULLSCREEN : google.ima.ViewMode.NORMAL
        );
        manager.start();
        const e = addEvent("play");
        __privateGet(this, _element2).dispatchEvent(e);
      } else if (__privateGet(this, _options5).enablePreloading === true) {
        manager.init(
          __privateGet(this, _element2).offsetWidth,
          __privateGet(this, _element2).offsetHeight,
          __privateGet(this, _element2).parentElement && __privateGet(this, _element2).parentElement.getAttribute("data-fullscreen") === "true" ? google.ima.ViewMode.FULLSCREEN : google.ima.ViewMode.NORMAL
        );
      }
    }
    _initNotDoneAds() {
      if (__privateGet(this, _displayContainer)) {
        __privateSet(this, _done, true);
        __privateGet(this, _displayContainer).initialize();
        if (IS_IOS || IS_ANDROID) {
          __privateSet(this, _preloadContent, this._contentLoadedAction);
          __privateGet(this, _element2).addEventListener("loadedmetadata", this._contentLoadedAction, EVENT_OPTIONS);
          __privateGet(this, _element2).load();
        } else {
          this._contentLoadedAction();
        }
      } else {
        this.load();
        this.loadedAd = false;
      }
    }
    _contentEndedListener() {
      __privateSet(this, _ended, true);
      __privateSet(this, _active, false);
      __privateSet(this, _started2, false);
      __privateGet(this, _loader).contentComplete();
    }
    _onContentPauseRequested() {
      __privateGet(this, _element2).removeEventListener("ended", this._contentEndedListener);
      __privateSet(this, _lastTimePaused, __privateGet(this, _media2).currentTime);
      if (__privateGet(this, _started2)) {
        __privateGet(this, _media2).pause();
      } else {
        __privateSet(this, _started2, true);
      }
      const e = addEvent("play");
      __privateGet(this, _element2).dispatchEvent(e);
    }
    _onContentResumeRequested() {
      __privateGet(this, _element2).addEventListener("ended", this._contentEndedListener, EVENT_OPTIONS);
      __privateGet(this, _element2).addEventListener("loadedmetadata", this._loadedMetadataHandler, EVENT_OPTIONS);
      if (IS_IOS || IS_ANDROID) {
        __privateGet(this, _media2).src = __privateGet(this, _mediaSources);
        __privateGet(this, _media2).load();
        this._prepareMedia();
        if (__privateGet(this, _element2).parentElement) {
          __privateGet(this, _element2).parentElement.classList.add("op-ads--active");
        }
      } else {
        const event = addEvent("loadedmetadata");
        __privateGet(this, _element2).dispatchEvent(event);
      }
    }
    _loadedMetadataHandler() {
      if (Array.isArray(__privateGet(this, _ads))) {
        __privateWrapper(this, _currentIndex)._++;
        if (__privateGet(this, _currentIndex) <= __privateGet(this, _ads).length - 1) {
          if (__privateGet(this, _manager)) {
            __privateGet(this, _manager).destroy();
          }
          __privateGet(this, _loader).contentComplete();
          __privateSet(this, _playTriggered, true);
          __privateSet(this, _started2, true);
          __privateSet(this, _done, false);
          this.load(true);
        } else {
          if (!__privateGet(this, _options5).autoPlayAdBreaks) {
            this._resetAdsAfterManualBreak();
          }
          this._prepareMedia();
        }
      } else if (__privateGet(this, _element2).seekable.length) {
        if (__privateGet(this, _element2).seekable.end(0) > __privateGet(this, _lastTimePaused)) {
          if (!__privateGet(this, _options5).autoPlayAdBreaks) {
            this._resetAdsAfterManualBreak();
          }
          this._prepareMedia();
        }
      } else {
        setTimeout(this._loadedMetadataHandler, 100);
      }
    }
    _resumeMedia() {
      __privateSet(this, _intervalTimer, 0);
      __privateSet(this, _muted, false);
      __privateSet(this, _started2, false);
      __privateSet(this, _duration2, 0);
      __privateSet(this, _currentTime2, 0);
      if (__privateGet(this, _element2).parentElement) {
        __privateGet(this, _element2).parentElement.classList.remove("op-ads--active");
      }
      if (__privateGet(this, _media2).ended) {
        const e = addEvent("ended");
        __privateGet(this, _element2).dispatchEvent(e);
      } else {
        try {
          __privateGet(this, _media2).play();
          setTimeout(() => {
            const e = addEvent("play");
            __privateGet(this, _element2).dispatchEvent(e);
          }, 50);
        } catch (err) {
          console.error(err);
        }
      }
    }
    _requestAds() {
      __privateSet(this, _request, new google.ima.AdsRequest());
      const ads = Array.isArray(__privateGet(this, _ads)) ? __privateGet(this, _ads)[__privateGet(this, _currentIndex)] : __privateGet(this, _ads);
      if (isXml(ads)) {
        __privateGet(this, _request).adsResponse = ads;
      } else {
        __privateGet(this, _request).adTagUrl = ads;
      }
      const width = __privateGet(this, _element2).parentElement ? __privateGet(this, _element2).parentElement.offsetWidth : 0;
      const height = __privateGet(this, _element2).parentElement ? __privateGet(this, _element2).parentElement.offsetHeight : 0;
      __privateGet(this, _request).linearAdSlotWidth = width;
      __privateGet(this, _request).linearAdSlotHeight = height;
      __privateGet(this, _request).nonLinearAdSlotWidth = width;
      __privateGet(this, _request).nonLinearAdSlotHeight = height / 3;
      __privateGet(this, _request).setAdWillAutoPlay(__privateGet(this, _autostart));
      __privateGet(this, _request).setAdWillPlayMuted(__privateGet(this, _autostartMuted));
      __privateGet(this, _loader).requestAds(__privateGet(this, _request));
    }
    /**
     * Internal callback to request Ads.
     *
     * @memberof Ads
     */
    _contentLoadedAction() {
      if (__privateGet(this, _preloadContent)) {
        __privateGet(this, _element2).removeEventListener("loadedmetadata", __privateGet(this, _preloadContent));
        __privateSet(this, _preloadContent, null);
      }
      this._requestAds();
    }
    // @see https://developers.google.com/interactive-media-ads/docs/sdks/html5/faq#8
    _resetAdsAfterManualBreak() {
      if (__privateGet(this, _manager)) {
        __privateGet(this, _manager).destroy();
      }
      __privateGet(this, _loader).contentComplete();
      __privateSet(this, _done, false);
      __privateSet(this, _playTriggered, true);
    }
    _prepareMedia() {
      __privateGet(this, _media2).currentTime = __privateGet(this, _lastTimePaused);
      __privateGet(this, _element2).removeEventListener("loadedmetadata", this._loadedMetadataHandler);
      this._resumeMedia();
    }
    _setMediaVolume(volume) {
      __privateGet(this, _media2).volume = volume;
      __privateGet(this, _media2).muted = volume === 0;
    }
    _handleClickInContainer() {
      if (__privateGet(this, _media2).paused) {
        const e = addEvent("paused");
        __privateGet(this, _element2).dispatchEvent(e);
        this.pause();
      }
    }
    _handleResizeAds() {
      this.resizeAds();
    }
    _handleSkipAds() {
      __privateGet(this, _manager).skip();
    }
  }
  _ended = new WeakMap();
  _done = new WeakMap();
  _active = new WeakMap();
  _started2 = new WeakMap();
  _intervalTimer = new WeakMap();
  _volume2 = new WeakMap();
  _muted = new WeakMap();
  _duration2 = new WeakMap();
  _currentTime2 = new WeakMap();
  _manager = new WeakMap();
  _player13 = new WeakMap();
  _media2 = new WeakMap();
  _element2 = new WeakMap();
  _events11 = new WeakMap();
  _ads = new WeakMap();
  _promise = new WeakMap();
  _loader = new WeakMap();
  _container3 = new WeakMap();
  _customClickContainer = new WeakMap();
  _skipElement = new WeakMap();
  _displayContainer = new WeakMap();
  _request = new WeakMap();
  _autostart = new WeakMap();
  _autostartMuted = new WeakMap();
  _playTriggered = new WeakMap();
  _options5 = new WeakMap();
  _currentIndex = new WeakMap();
  _originalVolume = new WeakMap();
  _preloadContent = new WeakMap();
  _lastTimePaused = new WeakMap();
  _mediaSources = new WeakMap();
  _mediaStarted = new WeakMap();
  _adEvent = new WeakMap();
  const _Player = class _Player {
    constructor(element, options) {
      __privateAdd(this, _controls2, void 0);
      __privateAdd(this, _adsInstance, void 0);
      __privateAdd(this, _uid, void 0);
      __privateAdd(this, _element3, void 0);
      __privateAdd(this, _ads2, void 0);
      __privateAdd(this, _media3, void 0);
      __privateAdd(this, _events12, void 0);
      __privateAdd(this, _autoplay3, void 0);
      __privateAdd(this, _volume3, void 0);
      __privateAdd(this, _canAutoplay, void 0);
      __privateAdd(this, _canAutoplayMuted, void 0);
      __privateAdd(this, _processedAutoplay, void 0);
      __privateAdd(this, _options6, void 0);
      __privateAdd(this, _customElements, void 0);
      __privateAdd(this, _fullscreen, void 0);
      __privateAdd(this, _defaultOptions, void 0);
      var _a;
      this.proxy = null;
      __privateSet(this, _uid, "");
      __privateSet(this, _events12, {});
      __privateSet(this, _autoplay3, false);
      __privateSet(this, _canAutoplay, false);
      __privateSet(this, _canAutoplayMuted, false);
      __privateSet(this, _processedAutoplay, false);
      __privateSet(this, _customElements, []);
      __privateSet(this, _defaultOptions, {
        controls: {
          alwaysVisible: false,
          layers: {
            left: ["play", "time", "volume"],
            middle: ["progress"],
            right: ["captions", "settings", "fullscreen"]
          }
        },
        defaultLevel: void 0,
        detachMenus: false,
        forceNative: false,
        height: 0,
        hidePlayBtnTimer: 350,
        labels: {
          auto: "Auto",
          captions: "CC/Subtitles",
          click: "Click to unmute",
          fullscreen: "Fullscreen",
          lang: {
            en: "English"
          },
          levels: "Quality Levels",
          live: "Live Broadcast",
          mediaLevels: "Change Quality",
          mute: "Mute",
          off: "Off",
          pause: "Pause",
          play: "Play",
          progressRail: "Time Rail",
          progressSlider: "Time Slider",
          settings: "Player Settings",
          speed: "Speed",
          speedNormal: "Normal",
          tap: "Tap to unmute",
          toggleCaptions: "Toggle Captions",
          unmute: "Unmute",
          volume: "Volume",
          volumeControl: "Volume Control",
          volumeSlider: "Volume Slider"
        },
        live: {
          showLabel: true,
          showProgress: false
        },
        media: {
          pauseOnClick: false
        },
        mode: "responsive",
        // or `fill` or `fit`
        onError: (e) => console.error(e),
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
      });
      __privateSet(this, _element3, element instanceof HTMLMediaElement ? element : document.getElementById(element));
      if (__privateGet(this, _element3)) {
        __privateSet(this, _autoplay3, __privateGet(this, _element3).autoplay || false);
        if (typeof options !== "string" && !Array.isArray(options)) {
          this._mergeOptions(options);
        }
        __privateGet(this, _element3).volume = __privateGet(this, _options6).startVolume || 1;
        if (__privateGet(this, _options6).ads && __privateGet(this, _options6).ads.src) {
          __privateSet(this, _ads2, __privateGet(this, _options6).ads.src);
        }
        if ((((_a = __privateGet(this, _options6)) == null ? void 0 : _a.startTime) || 0) > 0) {
          __privateGet(this, _element3).currentTime = __privateGet(this, _options6).startTime || 0;
        }
        __privateSet(this, _volume3, __privateGet(this, _element3).volume);
      }
      this._autoplay = this._autoplay.bind(this);
      this._enableKeyBindings = this._enableKeyBindings.bind(this);
    }
    static init() {
      _Player.instances = {};
      const targets = document.querySelectorAll("video.op-player, audio.op-player");
      for (let i = 0, total = targets.length; i < total; i++) {
        const target = targets[i];
        const settings = target.getAttribute("data-op-settings");
        const options = settings ? JSON.parse(settings) : {};
        const player = new _Player(target, options);
        player.init();
      }
    }
    static addMedia(name, mimeType, valid, media) {
      _Player.customMedia.media[mimeType] = media;
      _Player.customMedia.optionsKey[mimeType] = name;
      _Player.customMedia.rules.push(valid);
    }
    async init() {
      if (this._isValid()) {
        this._wrapInstance();
        await this._prepareMedia();
        this._createPlayButton();
        this._createUID();
        this._createControls();
        this._setEvents();
        _Player.instances[this.id] = this;
      }
    }
    async load() {
      if (!__privateGet(this, _media3)) {
        await this._prepareMedia();
        return __privateGet(this, _media3).load();
      }
      __privateGet(this, _media3).loaded = false;
      return this.isMedia() ? __privateGet(this, _media3).load() : void 0;
    }
    async play() {
      if (!__privateGet(this, _media3).loaded) {
        await __privateGet(this, _media3).load();
        __privateGet(this, _media3).loaded = true;
      }
      if (__privateGet(this, _adsInstance)) {
        __privateGet(this, _adsInstance).playRequested = true;
        await __privateGet(this, _adsInstance).loadPromise;
        return __privateGet(this, _adsInstance).play();
      }
      return __privateGet(this, _media3).play();
    }
    pause() {
      if (__privateGet(this, _adsInstance)) {
        __privateGet(this, _adsInstance).pause();
      } else {
        __privateGet(this, _media3).pause();
      }
    }
    stop() {
      this.pause();
      if (__privateGet(this, _media3)) {
        __privateGet(this, _media3).currentTime = 0;
        this.src = [{ src: "", type: "video/mp4" }];
      }
    }
    destroy() {
      var _a;
      if (__privateGet(this, _adsInstance)) {
        __privateGet(this, _adsInstance).pause();
        __privateGet(this, _adsInstance).destroy();
      }
      if (__privateGet(this, _fullscreen)) {
        __privateGet(this, _fullscreen).destroy();
      }
      const el = __privateGet(this, _element3);
      if (__privateGet(this, _media3)) {
        __privateGet(this, _media3).destroy();
      }
      Object.keys(__privateGet(this, _events12)).forEach((event) => {
        el.removeEventListener(event, __privateGet(this, _events12)[event]);
      });
      this.getContainer().removeEventListener("keydown", this._enableKeyBindings);
      if (__privateGet(this, _autoplay3) && !__privateGet(this, _processedAutoplay) && isVideo(__privateGet(this, _element3))) {
        el.removeEventListener("canplay", this._autoplay);
      }
      if (__privateGet(this, _controls2)) {
        __privateGet(this, _controls2).destroy();
      }
      if (isVideo(__privateGet(this, _element3))) {
        if (this.playBtn) {
          this.playBtn.remove();
        }
        if (this.loader) {
          this.loader.remove();
        }
      }
      if ((_a = __privateGet(this, _options6)) == null ? void 0 : _a.onError) {
        __privateGet(this, _element3).removeEventListener("playererror", __privateGet(this, _options6).onError);
      }
      el.controls = true;
      el.setAttribute("id", __privateGet(this, _uid));
      el.removeAttribute("op-live__enabled");
      el.removeAttribute("op-dvr__enabled");
      const parent = __privateGet(this, _options6).mode === "fit" && !isAudio(el) ? el.closest(".op-player__fit--wrapper") : el.parentElement;
      if (parent && parent.parentNode) {
        parent.parentNode.replaceChild(el, parent);
      }
      delete _Player.instances[__privateGet(this, _uid)];
      const e = addEvent("playerdestroyed");
      el.dispatchEvent(e);
    }
    getContainer() {
      return __privateGet(this, _element3).parentElement || __privateGet(this, _element3);
    }
    getControls() {
      return __privateGet(this, _controls2);
    }
    getCustomControls() {
      return __privateGet(this, _customElements);
    }
    getElement() {
      return __privateGet(this, _element3);
    }
    getEvents() {
      return __privateGet(this, _events12);
    }
    getOptions() {
      return __privateGet(this, _options6);
    }
    activeElement() {
      return __privateGet(this, _adsInstance) && __privateGet(this, _adsInstance).started() ? __privateGet(this, _adsInstance) : __privateGet(this, _media3);
    }
    isMedia() {
      return this.activeElement() instanceof Media;
    }
    isAd() {
      return this.activeElement() instanceof Ads;
    }
    getMedia() {
      return __privateGet(this, _media3);
    }
    getAd() {
      return __privateGet(this, _adsInstance);
    }
    addCaptions(args) {
      if (args.default) {
        const tracks = __privateGet(this, _element3).querySelectorAll("track");
        for (let i = 0, total = tracks.length; i < total; i++) {
          tracks[i].default = false;
        }
      }
      const el = __privateGet(this, _element3);
      let track = el.querySelector(`track[srclang="${args.srclang}"][kind="${args.kind}"]`);
      if (track) {
        track.src = args.src;
        track.label = args.label;
        track.default = args.default || false;
      } else {
        track = document.createElement("track");
        track.srclang = args.srclang;
        track.src = args.src;
        track.kind = args.kind;
        track.label = args.label;
        track.default = args.default || false;
        el.appendChild(track);
      }
      const e = addEvent("controlschanged");
      el.dispatchEvent(e);
    }
    addControl(args) {
      args.custom = true;
      args.type = "button";
      __privateGet(this, _customElements).push(args);
      const e = addEvent("controlschanged");
      __privateGet(this, _element3).dispatchEvent(e);
    }
    addElement(args) {
      args.custom = true;
      __privateGet(this, _customElements).push(args);
      const e = addEvent("controlschanged");
      __privateGet(this, _element3).dispatchEvent(e);
    }
    removeControl(controlName) {
      __privateGet(this, _customElements).forEach((item, idx) => {
        if (item.id === controlName) {
          __privateGet(this, _customElements).splice(idx, 1);
        }
      });
      const e = addEvent("controlschanged");
      __privateGet(this, _element3).dispatchEvent(e);
    }
    async _prepareMedia() {
      var _a;
      try {
        if ((_a = __privateGet(this, _options6)) == null ? void 0 : _a.onError) {
          __privateGet(this, _element3).addEventListener("playererror", __privateGet(this, _options6).onError, EVENT_OPTIONS);
        }
        if (__privateGet(this, _autoplay3) && isVideo(__privateGet(this, _element3))) {
          __privateGet(this, _element3).addEventListener("canplay", this._autoplay, EVENT_OPTIONS);
        }
        __privateSet(this, _media3, new Media(__privateGet(this, _element3), __privateGet(this, _options6), __privateGet(this, _autoplay3), _Player.customMedia));
        const preload = __privateGet(this, _element3).getAttribute("preload");
        if (__privateGet(this, _ads2) || !preload || preload !== "none") {
          await __privateGet(this, _media3).load();
          __privateGet(this, _media3).loaded = true;
        }
        if (!__privateGet(this, _autoplay3) && __privateGet(this, _ads2)) {
          const adsOptions = __privateGet(this, _options6) && __privateGet(this, _options6).ads ? __privateGet(this, _options6).ads : void 0;
          __privateSet(this, _adsInstance, new Ads(this, __privateGet(this, _ads2), false, false, adsOptions));
        }
      } catch (e) {
        console.error(e);
      }
    }
    enableDefaultPlayer() {
      let paused = true;
      let currentTime = 0;
      if (this.proxy && !this.proxy.paused) {
        paused = false;
        currentTime = this.proxy.currentTime;
        this.proxy.pause();
      }
      this.proxy = this;
      this.getElement().addEventListener("loadedmetadata", () => {
        this.getMedia().currentTime = currentTime;
        if (!paused) {
          this.play();
        }
      });
    }
    async loadAd(src) {
      try {
        if (this.isAd()) {
          this.getAd().destroy();
          this.getAd().src = src;
          this.getAd().loadedAd = false;
          this.getAd().load();
        } else {
          const adsOptions = __privateGet(this, _options6) && __privateGet(this, _options6).ads ? __privateGet(this, _options6).ads : void 0;
          const autoplay = !this.activeElement().paused || __privateGet(this, _canAutoplay);
          __privateSet(this, _adsInstance, new Ads(this, src, autoplay, __privateGet(this, _canAutoplayMuted), adsOptions));
        }
      } catch (err) {
        console.error(err);
      }
    }
    set src(media) {
      if (__privateGet(this, _media3) instanceof Media) {
        __privateGet(this, _media3).mediaFiles = [];
        __privateGet(this, _media3).src = media;
      } else if (typeof media === "string") {
        __privateGet(this, _element3).src = media;
      } else if (Array.isArray(media)) {
        media.forEach((m) => {
          const source = document.createElement("source");
          source.src = m.src;
          source.type = m.type || predictMimeType(m.src, __privateGet(this, _element3));
          __privateGet(this, _element3).appendChild(source);
        });
      } else if (typeof media === "object") {
        __privateGet(this, _element3).src = media.src;
      }
    }
    get src() {
      return __privateGet(this, _media3).src;
    }
    get id() {
      return __privateGet(this, _uid);
    }
    _isValid() {
      const el = __privateGet(this, _element3);
      if (el instanceof HTMLElement === false) {
        return false;
      }
      if (!isAudio(el) && !isVideo(el)) {
        return false;
      }
      if (!el.classList.contains("op-player__media")) {
        return false;
      }
      return true;
    }
    _wrapInstance() {
      const wrapper = document.createElement("div");
      wrapper.className = "op-player op-player__keyboard--inactive";
      wrapper.className += isAudio(__privateGet(this, _element3)) ? " op-player__audio" : " op-player__video";
      wrapper.tabIndex = 0;
      __privateGet(this, _element3).classList.remove("op-player");
      if (__privateGet(this, _element3).parentElement) {
        __privateGet(this, _element3).parentElement.insertBefore(wrapper, __privateGet(this, _element3));
      }
      wrapper.appendChild(__privateGet(this, _element3));
      const messageContainer = document.createElement("div");
      messageContainer.className = "op-status";
      messageContainer.innerHTML = "<span></span>";
      messageContainer.tabIndex = -1;
      messageContainer.setAttribute("aria-hidden", "true");
      if (isVideo(__privateGet(this, _element3)) && __privateGet(this, _element3).parentElement) {
        __privateGet(this, _element3).parentElement.insertBefore(messageContainer, __privateGet(this, _element3));
      }
      wrapper.addEventListener(
        "keydown",
        () => {
          if (wrapper.classList.contains("op-player__keyboard--inactive")) {
            wrapper.classList.remove("op-player__keyboard--inactive");
          }
        },
        EVENT_OPTIONS
      );
      wrapper.addEventListener(
        "click",
        () => {
          if (!wrapper.classList.contains("op-player__keyboard--inactive")) {
            wrapper.classList.add("op-player__keyboard--inactive");
          }
        },
        EVENT_OPTIONS
      );
      if (__privateGet(this, _options6).mode === "fill" && !isAudio(__privateGet(this, _element3)) && !IS_IPHONE) {
        this.getContainer().classList.add("op-player__full");
      } else if (__privateGet(this, _options6).mode === "fit" && !isAudio(__privateGet(this, _element3))) {
        const container = this.getContainer();
        if (container.parentElement) {
          const fitWrapper = document.createElement("div");
          fitWrapper.className = "op-player__fit--wrapper";
          fitWrapper.tabIndex = 0;
          container.parentElement.insertBefore(fitWrapper, container);
          fitWrapper.appendChild(container);
          container.classList.add("op-player__fit");
        }
      } else {
        let style = "";
        if (__privateGet(this, _options6).width) {
          const width = typeof __privateGet(this, _options6).width === "number" ? `${__privateGet(this, _options6).width}px` : __privateGet(this, _options6).width;
          style += `width: ${width} !important;`;
        }
        if (__privateGet(this, _options6).height) {
          const height = typeof __privateGet(this, _options6).height === "number" ? `${__privateGet(this, _options6).height}px` : __privateGet(this, _options6).height;
          style += `height: ${height} !important;`;
        }
        if (style) {
          wrapper.setAttribute("style", style);
        }
      }
    }
    _createControls() {
      if (IS_IPHONE && isVideo(__privateGet(this, _element3))) {
        this.getContainer().classList.add("op-player__ios--iphone");
      }
      __privateSet(this, _controls2, new Controls(this));
      __privateGet(this, _controls2).create();
    }
    _createUID() {
      if (__privateGet(this, _element3).id) {
        __privateSet(this, _uid, __privateGet(this, _element3).id);
        __privateGet(this, _element3).removeAttribute("id");
      } else {
        const cryptoLib = crypto;
        const encryption = typeof cryptoLib.getRandomBytes === "function" ? cryptoLib.getRandomBytes : cryptoLib.getRandomValues;
        __privateSet(this, _uid, `op_${encryption(new Uint32Array(1))[0].toString(36).substr(2, 9)}`);
      }
      if (__privateGet(this, _element3).parentElement) {
        __privateGet(this, _element3).parentElement.id = __privateGet(this, _uid);
      }
    }
    _createPlayButton() {
      var _a, _b;
      if (isAudio(__privateGet(this, _element3))) {
        return;
      }
      this.playBtn = document.createElement("button");
      this.playBtn.className = "op-player__play";
      this.playBtn.tabIndex = 0;
      this.playBtn.title = ((_a = __privateGet(this, _options6).labels) == null ? void 0 : _a.play) || "";
      this.playBtn.innerHTML = `<span>${((_b = __privateGet(this, _options6).labels) == null ? void 0 : _b.play) || ""}</span>`;
      this.playBtn.setAttribute("aria-pressed", "false");
      this.playBtn.setAttribute("aria-hidden", "false");
      this.loader = document.createElement("span");
      this.loader.className = "op-player__loader";
      this.loader.tabIndex = -1;
      this.loader.setAttribute("aria-hidden", "true");
      if (__privateGet(this, _element3).parentElement) {
        __privateGet(this, _element3).parentElement.insertBefore(this.loader, __privateGet(this, _element3));
        __privateGet(this, _element3).parentElement.insertBefore(this.playBtn, __privateGet(this, _element3));
      }
      this.playBtn.addEventListener(
        "click",
        () => {
          if (__privateGet(this, _adsInstance)) {
            __privateGet(this, _adsInstance).playRequested = this.activeElement().paused;
          }
          if (this.activeElement().paused) {
            this.activeElement().play();
          } else {
            this.activeElement().pause();
          }
        },
        EVENT_OPTIONS
      );
    }
    _setEvents() {
      if (isVideo(__privateGet(this, _element3))) {
        __privateGet(this, _events12).loadedmetadata = () => {
          const el = this.activeElement();
          if (__privateGet(this, _options6).showLoaderOnInit && !IS_IOS && !IS_ANDROID) {
            this.loader.setAttribute("aria-hidden", "false");
            this.playBtn.setAttribute("aria-hidden", "true");
          } else {
            this.loader.setAttribute("aria-hidden", "true");
            this.playBtn.setAttribute("aria-hidden", "false");
          }
          if (el.paused) {
            this.playBtn.classList.remove("op-player__play--paused");
            this.playBtn.setAttribute("aria-pressed", "false");
          }
        };
        __privateGet(this, _events12).waiting = () => {
          this.playBtn.setAttribute("aria-hidden", "true");
          this.loader.setAttribute("aria-hidden", "false");
        };
        __privateGet(this, _events12).seeking = () => {
          const el = this.activeElement();
          this.playBtn.setAttribute("aria-hidden", "true");
          this.loader.setAttribute("aria-hidden", el instanceof Media ? "false" : "true");
        };
        __privateGet(this, _events12).seeked = () => {
          const el = this.activeElement();
          if (Math.round(el.currentTime) === 0) {
            this.playBtn.setAttribute("aria-hidden", "true");
            this.loader.setAttribute("aria-hidden", "false");
          } else {
            this.playBtn.setAttribute("aria-hidden", el instanceof Media ? "false" : "true");
            this.loader.setAttribute("aria-hidden", "true");
          }
        };
        __privateGet(this, _events12).play = () => {
          var _a;
          this.playBtn.classList.add("op-player__play--paused");
          this.playBtn.title = ((_a = __privateGet(this, _options6).labels) == null ? void 0 : _a.pause) || "";
          this.loader.setAttribute("aria-hidden", "true");
          if (__privateGet(this, _options6).showLoaderOnInit) {
            this.playBtn.setAttribute("aria-hidden", "true");
          } else {
            setTimeout(() => {
              this.playBtn.setAttribute("aria-hidden", "true");
            }, __privateGet(this, _options6).hidePlayBtnTimer);
          }
        };
        __privateGet(this, _events12).playing = () => {
          this.loader.setAttribute("aria-hidden", "true");
          this.playBtn.setAttribute("aria-hidden", "true");
        };
        __privateGet(this, _events12).pause = () => {
          var _a;
          const el = this.activeElement();
          this.playBtn.classList.remove("op-player__play--paused");
          this.playBtn.title = ((_a = __privateGet(this, _options6).labels) == null ? void 0 : _a.play) || "";
          if (__privateGet(this, _options6).showLoaderOnInit && Math.round(el.currentTime) === 0) {
            this.playBtn.setAttribute("aria-hidden", "true");
            this.loader.setAttribute("aria-hidden", "false");
          } else {
            this.playBtn.setAttribute("aria-hidden", "false");
            this.loader.setAttribute("aria-hidden", "true");
          }
        };
        __privateGet(this, _events12).ended = () => {
          this.loader.setAttribute("aria-hidden", "true");
          this.playBtn.setAttribute("aria-hidden", "true");
        };
        let postRollCalled = false;
        __privateGet(this, _events12).timeupdate = () => {
          if (__privateGet(this, _element3).loop && this.isMedia() && __privateGet(this, _adsInstance)) {
            const el = this.getMedia();
            const remainingTime = el.duration - el.currentTime;
            if (remainingTime > 0 && remainingTime <= 0.25 && !postRollCalled) {
              postRollCalled = true;
              const e = addEvent("ended");
              __privateGet(this, _element3).dispatchEvent(e);
            } else if (remainingTime === 0) {
              postRollCalled = false;
            }
          }
        };
      }
      Object.keys(__privateGet(this, _events12)).forEach((event) => {
        __privateGet(this, _element3).addEventListener(event, __privateGet(this, _events12)[event], EVENT_OPTIONS);
      });
      this.getContainer().addEventListener("keydown", this._enableKeyBindings, EVENT_OPTIONS);
    }
    _autoplay() {
      if (!__privateGet(this, _processedAutoplay)) {
        __privateSet(this, _processedAutoplay, true);
        __privateGet(this, _element3).removeEventListener("canplay", this._autoplay);
        isAutoplaySupported(
          __privateGet(this, _element3),
          __privateGet(this, _volume3),
          (autoplay) => {
            __privateSet(this, _canAutoplay, autoplay);
          },
          (muted) => {
            __privateSet(this, _canAutoplayMuted, muted);
          },
          () => {
            var _a, _b;
            if (__privateGet(this, _canAutoplayMuted)) {
              this.activeElement().muted = true;
              this.activeElement().volume = 0;
              const e = addEvent("volumechange");
              __privateGet(this, _element3).dispatchEvent(e);
              const volumeEl = document.createElement("div");
              const action = IS_IOS || IS_ANDROID ? (_a = __privateGet(this, _options6).labels) == null ? void 0 : _a.tap : (_b = __privateGet(this, _options6).labels) == null ? void 0 : _b.click;
              volumeEl.className = "op-player__unmute";
              volumeEl.innerHTML = `<span>${action}</span>`;
              volumeEl.tabIndex = 0;
              volumeEl.addEventListener(
                "click",
                () => {
                  this.activeElement().muted = false;
                  this.activeElement().volume = __privateGet(this, _volume3);
                  const event = addEvent("volumechange");
                  __privateGet(this, _element3).dispatchEvent(event);
                  volumeEl.remove();
                },
                EVENT_OPTIONS
              );
              const target = this.getContainer();
              target.insertBefore(volumeEl, target.firstChild);
            } else {
              this.activeElement().muted = __privateGet(this, _element3).muted;
              this.activeElement().volume = __privateGet(this, _volume3);
            }
            if (__privateGet(this, _ads2)) {
              const adsOptions = __privateGet(this, _options6) && __privateGet(this, _options6).ads ? __privateGet(this, _options6).ads : void 0;
              __privateSet(this, _adsInstance, new Ads(
                this,
                __privateGet(this, _ads2),
                __privateGet(this, _canAutoplay),
                __privateGet(this, _canAutoplayMuted),
                adsOptions
              ));
            } else if (__privateGet(this, _canAutoplay) || __privateGet(this, _canAutoplayMuted)) {
              this.play();
            }
          }
        );
      }
    }
    _mergeOptions(playerOptions) {
      const opts = { ...playerOptions || {} };
      __privateSet(this, _options6, { ...__privateGet(this, _defaultOptions), ...opts });
      const complexOptions = Object.keys(__privateGet(this, _defaultOptions)).filter(
        (key) => key !== "labels" && typeof __privateGet(this, _defaultOptions)[key] === "object"
      );
      complexOptions.forEach((key) => {
        const currOption = opts[key] || {};
        if (currOption && Object.keys(currOption).length) {
          __privateGet(this, _options6)[key] = { ...__privateGet(this, _defaultOptions)[key], ...currOption };
        }
      });
      if (opts.labels) {
        const keys = opts.labels ? Object.keys(opts.labels) : [];
        let sanitizedLabels = {};
        keys.forEach((key) => {
          const current = opts.labels ? opts.labels[key] : null;
          if (current && typeof current === "object" && key === "lang") {
            Object.keys(current).forEach((k) => {
              const lang = current ? current[k] : null;
              if (lang) {
                sanitizedLabels = {
                  ...sanitizedLabels,
                  lang: { ...sanitizedLabels.lang, [k]: sanitize(lang) }
                };
              }
            });
          } else if (current) {
            sanitizedLabels = { ...sanitizedLabels, [key]: sanitize(current) };
          }
        });
        __privateGet(this, _options6).labels = { ...__privateGet(this, _defaultOptions).labels, ...sanitizedLabels };
      }
    }
    _enableKeyBindings(e) {
      var _a, _b;
      const key = e.which || e.keyCode || 0;
      const el = this.activeElement();
      const isAd = this.isAd();
      const playerFocused = (_a = document == null ? void 0 : document.activeElement) == null ? void 0 : _a.classList.contains("op-player");
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
            let newStep = 5;
            const configStep = this.getOptions().step;
            if (configStep) {
              newStep = key === 74 || key === 76 ? configStep * 2 : configStep;
            } else if (key === 74 || key === 76) {
              newStep = 10;
            }
            const step = el.duration !== Infinity ? newStep : ((_b = this.getOptions().progress) == null ? void 0 : _b.duration) || 0;
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
          const newVol = key === 38 ? Math.min(el.volume + 0.1, 1) : Math.max(el.volume - 0.1, 0);
          el.volume = newVol;
          el.muted = !(newVol > 0);
          e.preventDefault();
          e.stopPropagation();
          break;
        case 70:
          if (isVideo(__privateGet(this, _element3)) && !e.ctrlKey) {
            __privateSet(this, _fullscreen, new Fullscreen(this, "", ""));
            if (typeof __privateGet(this, _fullscreen).fullScreenEnabled !== "undefined") {
              __privateGet(this, _fullscreen).toggleFullscreen();
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
            el.volume = __privateGet(this, _volume3);
          }
          e.preventDefault();
          e.stopPropagation();
          break;
        case 188:
        case 190:
          if (!isAd && e.shiftKey) {
            const elem = el;
            elem.playbackRate = key === 188 ? Math.max(elem.playbackRate - 0.25, 0.25) : Math.min(elem.playbackRate + 0.25, 2);
            const target = this.getContainer().querySelector(".op-status>span");
            if (target) {
              target.textContent = `${elem.playbackRate}x`;
              if (target.parentElement) {
                target.parentElement.setAttribute("aria-hidden", "false");
              }
              setTimeout(() => {
                if (target.parentElement) {
                  target.parentElement.setAttribute("aria-hidden", "true");
                }
              }, 500);
            }
            const ev = addEvent("controlschanged");
            dispatchEvent(ev);
            e.preventDefault();
            e.stopPropagation();
          } else if (!isAd && el.paused) {
            el.currentTime += 1 / 25 * (key === 188 ? -1 : 1);
            e.preventDefault();
            e.stopPropagation();
          }
          break;
      }
    }
  };
  _controls2 = new WeakMap();
  _adsInstance = new WeakMap();
  _uid = new WeakMap();
  _element3 = new WeakMap();
  _ads2 = new WeakMap();
  _media3 = new WeakMap();
  _events12 = new WeakMap();
  _autoplay3 = new WeakMap();
  _volume3 = new WeakMap();
  _canAutoplay = new WeakMap();
  _canAutoplayMuted = new WeakMap();
  _processedAutoplay = new WeakMap();
  _options6 = new WeakMap();
  _customElements = new WeakMap();
  _fullscreen = new WeakMap();
  _defaultOptions = new WeakMap();
  _Player.instances = {};
  _Player.customMedia = {
    media: {},
    optionsKey: {},
    rules: []
  };
  let Player = _Player;
  const Player$1 = Player;
  if (typeof window !== "undefined") {
    window.OpenPlayer = Player;
    window.OpenPlayerJS = Player;
    Player.init();
  }
  return Player$1;
});
//# sourceMappingURL=openplayer.js.map
