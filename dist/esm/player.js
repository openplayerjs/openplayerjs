const S = typeof window < "u" ? window.navigator : null, T = S ? S.userAgent.toLowerCase() : null, P = T ? /iphone/i.test(T) && !window.MSStream : !1, A = T ? /ipad|iphone|ipod/i.test(T) && !window.MSStream : !1, _ = T ? /android/i.test(T) : !1, G = T ? /chrome/i.test(T) : !1, Q = T ? /safari/i.test(T) && !G : !1, V = typeof window < "u" ? "MediaSource" in window : !1, X = () => {
  if (typeof window > "u")
    return !1;
  const c = window.MediaSource || window.WebKitMediaSource, t = window.SourceBuffer || window.WebKitSourceBuffer, e = c && typeof c.isTypeSupported == "function" && c.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"'), s = !t || t.prototype && typeof t.prototype.appendBuffer == "function" && typeof t.prototype.remove == "function";
  return !!e && !!s && !Q;
}, K = 120, h = { passive: !1 };
function k(c) {
  return c.tagName.toLowerCase() === "video";
}
function y(c) {
  return c.tagName.toLowerCase() === "audio";
}
function D(c) {
  return new Promise((t, e) => {
    const s = document.createElement("script");
    s.src = c, s.async = !0, s.onload = () => {
      s.remove(), t();
    }, s.onerror = () => {
      s.remove(), e(new Error(`${c} could not be loaded`));
    }, document.head && document.head.appendChild(s);
  });
}
function I(c) {
  const t = c.getBoundingClientRect();
  return {
    left: t.left + (window.pageXOffset || document.documentElement.scrollLeft),
    top: t.top + (window.pageYOffset || document.documentElement.scrollTop)
  };
}
function L(c, t = !0) {
  const i = new DOMParser().parseFromString(c, "text/html").body || document.createElement("body"), n = i.querySelectorAll("script");
  for (let o = 0, l = n.length; o < l; o++)
    n[o].remove();
  const a = (o) => {
    const l = o.children;
    for (let p = 0, f = l.length; p < f; p++) {
      const r = l[p], { attributes: d } = r;
      for (let m = 0, v = d.length; m < v; m++) {
        const { name: g, value: b } = d[m], E = b.replace(/\s+/g, "").toLowerCase();
        ["src", "href", "xlink:href"].includes(g) && (E.includes("javascript:") || E.includes("data:")) && r.removeAttribute(g), g.startsWith("on") && r.removeAttribute(g);
      }
      a(r);
    }
  };
  return a(i), t ? (i.textContent || "").replace(/\s{2,}/g, "") : i.innerHTML;
}
function Y(c) {
  let t;
  if (typeof DOMParser < "u")
    t = (e) => new DOMParser().parseFromString(e, "text/xml");
  else
    return !1;
  try {
    if (t(c).getElementsByTagName("parsererror").length > 0)
      return !1;
  } catch {
    return !1;
  }
  return !0;
}
function u(c, t) {
  let e = {};
  return t && t.detail && (e = { detail: t.detail }), new CustomEvent(c, e);
}
class J {
  #t;
  #e;
  #i;
  #s;
  #n = {
    button: {},
    global: {},
    media: {}
  };
  #o;
  #r;
  #h;
  #d = "off";
  #l;
  #f;
  constructor(t, e, s) {
    this.#t = t, this.#l = e, this.#f = s, this._formatMenuItems = this._formatMenuItems.bind(this), this._setDefaultTrack = this._setDefaultTrack.bind(this);
  }
  create() {
    const { textTracks: t } = this.#t.getElement(), { labels: e, detachMenus: s } = this.#t.getOptions();
    if (this.#o = Object.keys(t).map((a) => t[Number(a)]).filter((a) => ["subtitles", "captions"].includes(a.kind)), this.#r = !!this.#o.length, !this.#r && s)
      return;
    this.#e = document.createElement("button"), this.#e.className = `op-controls__captions op-control__${this.#l}`, this.#e.tabIndex = 0, this.#e.title = e?.toggleCaptions || "", this.#e.setAttribute("aria-controls", this.#t.id), this.#e.setAttribute("aria-pressed", "false"), this.#e.setAttribute("aria-label", e?.toggleCaptions || ""), this.#e.setAttribute("data-active-captions", "off"), this.#i = document.createElement("div"), this.#i.className = "op-captions";
    const i = this.#t.getContainer();
    if (i.insertBefore(this.#i, i.firstChild), s) {
      this.#e.classList.add("op-control--no-hover"), this.#s = document.createElement("div"), this.#s.className = "op-settings op-captions__menu", this.#s.setAttribute("aria-hidden", "true"), this.#s.innerHTML = `<div class="op-settings__menu" role="menu" id="menu-item-captions">
                <div class="op-settings__submenu-item" tabindex="0" role="menuitemradio" aria-checked="${this.#d === "off" ? "true" : "false"}">
                    <div class="op-settings__submenu-label op-subtitles__option" data-value="captions-off">${e?.off}</div>
                </div>
            </div>`;
      const a = document.createElement("div");
      a.className = `op-controls__container op-control__${this.#l}`, a.append(this.#e, this.#s), this.#t.getControls().getLayer(this.#f).append(a);
      for (const o of this.#o) {
        const l = document.createElement("div"), p = e?.lang?.[o.language] || null;
        l.className = "op-settings__submenu-item", l.tabIndex = 0, l.setAttribute("role", "menuitemradio"), l.setAttribute("aria-checked", this.#d === o.language ? "true" : "false"), l.innerHTML = `<div class="op-settings__submenu-label op-subtitles__option"
                    data-value="captions-${o.language}">
                    ${p || o.label}
                </div>`, this.#s.append(l);
      }
    } else
      this.#t.getControls().getLayer(this.#f).append(this.#e);
    this.#n.button.click = (a) => {
      const o = a.target;
      if (s) {
        const l = this.#t.getContainer().querySelectorAll(".op-settings");
        for (const p of Array.from(l))
          p !== this.#s && p.setAttribute("aria-hidden", "true");
        this.#s.getAttribute("aria-hidden") === "true" ? this.#s.setAttribute("aria-hidden", "false") : this.#s.setAttribute("aria-hidden", "true");
      } else {
        o.setAttribute("aria-pressed", "true"), o.classList.contains("op-controls__captions--on") ? (o.classList.remove("op-controls__captions--on"), o.setAttribute("data-active-captions", "off")) : (o.classList.add("op-controls__captions--on"), o.setAttribute("data-active-captions", this.#h?.language || ""));
        for (const l of this.#o)
          l.mode = o.getAttribute("data-active-captions") === l.language ? "showing" : "hidden";
      }
    }, this.#n.button.mouseover = () => {
      if (!A && !_ && s) {
        const a = this.#t.getContainer().querySelectorAll(".op-settings");
        for (let o = 0, l = a.length; o < l; ++o)
          a[o] !== this.#s && a[o].setAttribute("aria-hidden", "true");
        this.#s.getAttribute("aria-hidden") === "true" && this.#s.setAttribute("aria-hidden", "false");
      }
    }, this.#n.button.mouseout = () => {
      if (!A && !_ && s) {
        const a = this.#t.getContainer().querySelectorAll(".op-settings");
        for (let o = 0, l = a.length; o < l; ++o)
          a[o].setAttribute("aria-hidden", "true");
        this.#s.getAttribute("aria-hidden") === "false" && this.#s.setAttribute("aria-hidden", "true");
      }
    }, this.#e.addEventListener("click", this.#n.button.click, h), this.#n.global.click = (a) => {
      const o = a.target;
      if (o.closest(`#${this.#t.id}`) && o.classList.contains("op-subtitles__option")) {
        const l = o.getAttribute("data-value").replace("captions-", "");
        for (const f of this.#o)
          f.mode = f.language === l ? "showing" : "hidden", f.language === l && (this.#h = f);
        if (s) {
          this.#e.classList.contains("op-controls__captions--on") ? (this.#e.classList.remove("op-controls__captions--on"), this.#e.setAttribute("data-active-captions", "off")) : (this.#e.classList.add("op-controls__captions--on"), this.#e.setAttribute("data-active-captions", l));
          const f = this.#s.querySelectorAll(".op-settings__submenu-item");
          for (const r of Array.from(f))
            r.setAttribute("aria-checked", "false");
          o.parentElement.setAttribute("aria-checked", "true"), this.#s.setAttribute("aria-hidden", "false");
        } else
          this.#e.setAttribute("data-active-captions", l);
        const p = u("captionschanged");
        this.#t.getElement().dispatchEvent(p);
      }
    }, this.#n.global.cuechange = (a) => {
      for (; this.#i.lastChild; )
        this.#i.removeChild(this.#i.lastChild);
      const o = a.target;
      if (o.mode === "showing")
        if (o.activeCues && o.activeCues?.length > 0)
          for (const l of Array.from(o.activeCues)) {
            const p = l?.text || "";
            if (p) {
              this.#i.classList.add("op-captions--on");
              const f = document.createElement("span");
              f.innerHTML = p, this.#i.prepend(f);
            } else
              for (; this.#i.lastChild; )
                this.#i.removeChild(this.#i.lastChild);
          }
        else
          for (; this.#i.lastChild; )
            this.#i.removeChild(this.#i.lastChild);
    }, s && (this.#e.addEventListener("mouseover", this.#n.button.mouseover, h), this.#s.addEventListener("mouseover", this.#n.button.mouseover, h), this.#s.addEventListener("mouseout", this.#n.button.mouseout, h), this.#t.getElement().addEventListener("controlshidden", this.#n.button.mouseout, h)), document.addEventListener("click", this.#n.global.click, h);
    for (const a of this.#o)
      a.mode = a.mode !== "showing" ? "hidden" : a.mode, a.addEventListener("cuechange", this.#n.global.cuechange, h);
    const n = this.#t.getElement().querySelector('track:is([kind="subtitles"],[kind="captions"])[default]');
    if (n) {
      const a = this.#o.find((o) => o.language === n.srclang);
      a && this._setDefaultTrack(a);
    }
  }
  destroy() {
    const { detachMenus: t } = this.#t.getOptions();
    if (!(!this.#r && t)) {
      for (const e of this.#o)
        e.removeEventListener("cuechange", this.#n.global.cuechange);
      document.removeEventListener("click", this.#n.global.click), this.#e.removeEventListener("click", this.#n.button.click), t && (this.#e.removeEventListener("mouseover", this.#n.button.mouseover), this.#s.removeEventListener("mouseover", this.#n.button.mouseover), this.#s.removeEventListener("mouseout", this.#n.button.mouseout), this.#t.getElement().removeEventListener("controlshidden", this.#n.button.mouseout), this.#s.remove()), this.#e.remove();
    }
  }
  addSettings() {
    const { detachMenus: t, labels: e } = this.#t.getOptions();
    if (t || this.#o.length <= 1)
      return {};
    const s = this._formatMenuItems();
    return s.length > 2 ? {
      className: "op-subtitles__option",
      default: this.#d || "off",
      key: "captions",
      name: e?.captions || "",
      subitems: s
    } : {};
  }
  _formatMenuItems() {
    const { labels: t, detachMenus: e } = this.#t.getOptions();
    if (this.#o.length <= 1 && !e)
      return [];
    let s = [{ key: "off", label: t?.off || "" }];
    for (const i of this.#o) {
      const n = t?.lang ? t.lang[i.language] : null;
      s = s.filter((a) => a.key !== i.language), s.push({ key: i.language, label: n || i.label });
    }
    return s;
  }
  _setDefaultTrack(t) {
    t.mode = "showing", this.#d = t.language, this.#e.setAttribute("data-active-captions", this.#d), this.#e.classList.add("op-controls__captions--on"), this.#h = t;
    const e = document.querySelectorAll(".op-settings__submenu-item") || [];
    for (const s of Array.from(e))
      s.setAttribute("aria-checked", "false");
    document.querySelector(`.op-subtitles__option[data-value="captions-${t.language}"]`)?.parentElement?.setAttribute("aria-checked", "true");
  }
}
class z {
  #t;
  #e;
  #i;
  #s = [];
  #n = 0;
  #o = 0;
  #r;
  #h;
  #d;
  constructor(t, e, s) {
    this.#t = t, this.#h = e, this.#d = s, this.#e = document.body.classList.contains("op-fullscreen__on");
    const i = document;
    this.fullScreenEnabled = !!(i.fullscreenEnabled || i.mozFullScreenEnabled || i.msFullscreenEnabled || i.webkitSupportsFullscreen || i.webkitFullscreenEnabled || document.createElement("video").webkitRequestFullScreen), this._enterSpaceKeyEvent = this._enterSpaceKeyEvent.bind(this), this._resize = this._resize.bind(this), this._fullscreenChange = this._fullscreenChange.bind(this), this._setFullscreen = this._setFullscreen.bind(this), this._unsetFullscreen = this._unsetFullscreen.bind(this), this.#s = [
      "fullscreenchange",
      "mozfullscreenchange",
      "webkitfullscreenchange",
      "msfullscreenchange"
    ], this.#s.forEach((n) => {
      document.addEventListener(n, this._fullscreenChange, h);
    }), this._setFullscreenData(!1), this.#t.getContainer().addEventListener("keydown", this._enterSpaceKeyEvent, h), P && (this.#t.getElement().addEventListener("webkitbeginfullscreen", this._setFullscreen, h), this.#t.getElement().addEventListener("webkitendfullscreen", this._unsetFullscreen, h));
  }
  create() {
    const { labels: t } = this.#t.getOptions();
    this.#i = document.createElement("button"), this.#i.type = "button", this.#i.className = `op-controls__fullscreen op-control__${this.#h}`, this.#i.tabIndex = 0, this.#i.title = t?.fullscreen || "", this.#i.setAttribute("aria-controls", this.#t.id), this.#i.setAttribute("aria-pressed", "false"), this.#i.setAttribute("aria-label", t?.fullscreen || ""), this.#r = () => {
      this.#i.setAttribute("aria-pressed", "true"), this.toggleFullscreen();
    }, this.#r = this.#r.bind(this), this.#i.addEventListener("click", this.#r, h), this.#t.getControls().getLayer(this.#d).appendChild(this.#i);
  }
  destroy() {
    this.#t.getContainer().removeEventListener("keydown", this._enterSpaceKeyEvent), this.#s.forEach((t) => {
      document.removeEventListener(t, this._fullscreenChange);
    }), P && (this.#t.getElement().removeEventListener("webkitbeginfullscreen", this._setFullscreen), this.#t.getElement().removeEventListener("webkitendfullscreen", this._unsetFullscreen)), this.#i.removeEventListener("click", this.#r), this.#i.remove();
  }
  toggleFullscreen() {
    if (this.#e) {
      const t = document;
      t.exitFullscreen ? t.exitFullscreen() : t.mozCancelFullScreen ? t.mozCancelFullScreen() : t.webkitCancelFullScreen ? t.webkitCancelFullScreen() : t.msExitFullscreen ? t.msExitFullscreen() : this._fullscreenChange(), document.body.classList.remove("op-fullscreen__on");
    } else {
      const t = this.#t.getElement();
      this.#n = window.screen.width, this.#o = window.screen.height, t.requestFullscreen ? t.parentElement.requestFullscreen() : t.mozRequestFullScreen ? t.parentElement.mozRequestFullScreen() : t.webkitRequestFullScreen ? t.parentElement.webkitRequestFullScreen() : t.msRequestFullscreen ? t.parentElement.msRequestFullscreen() : t.webkitEnterFullscreen ? t.webkitEnterFullscreen() : this._fullscreenChange(), document.body.classList.add("op-fullscreen__on");
    }
    if (typeof window < "u" && (_ || P)) {
      const { screen: t } = window;
      t.orientation && !this.#e && t.orientation.lock("landscape");
    }
  }
  _fullscreenChange() {
    const t = this.#e ? void 0 : this.#n, e = this.#e ? void 0 : this.#o;
    this._setFullscreenData(!this.#e), this.#t.isAd() && this.#t.getAd().resizeAds(t, e), this.#e = !this.#e, this.#e ? document.body.classList.add("op-fullscreen__on") : document.body.classList.remove("op-fullscreen__on"), this._resize(t, e);
  }
  _setFullscreenData(t) {
    this.#t.getContainer().setAttribute("data-fullscreen", (!!t).toString()), this.#i && (t ? this.#i.classList.add("op-controls__fullscreen--out") : this.#i.classList.remove("op-controls__fullscreen--out"));
  }
  _resize(t, e) {
    const s = this.#t.getContainer(), i = this.#t.getElement(), n = this.#t.getOptions();
    let a = "";
    if (t)
      s.style.width = "100%", i.style.width = "100%";
    else if (n.width) {
      const o = typeof n.width == "number" ? `${n.width}px` : n.width;
      a += `width: ${o} !important;`, i.style.removeProperty("width");
    } else
      i.style.removeProperty("width"), s.style.removeProperty("width");
    if (e)
      i.style.height = "100%", s.style.height = "100%";
    else if (n.height) {
      const o = typeof n.height == "number" ? `${n.height}px` : n.height;
      a += `height: ${o} !important;`, i.style.removeProperty("height");
    } else
      i.style.removeProperty("height"), s.style.removeProperty("height");
    a && s.setAttribute("style", a);
  }
  _enterSpaceKeyEvent(t) {
    const e = t.which || t.keyCode || 0;
    document?.activeElement?.classList.contains("op-controls__fullscreen") && (e === 13 || e === 32) && (this.toggleFullscreen(), t.preventDefault(), t.stopPropagation());
  }
  _setFullscreen() {
    this.#e = !0, this._setFullscreenData(!0), document.body.classList.add("op-fullscreen__on");
  }
  _unsetFullscreen() {
    this.#e = !1, this._setFullscreenData(!1), document.body.classList.remove("op-fullscreen__on");
  }
}
function Z(c) {
  const n = ((((c.split("?")[0] || "").split("\\") || []).pop() || "").split("/") || []).pop() || "";
  return n.includes(".") ? n.substring(n.lastIndexOf(".") + 1) : "";
}
function F(c) {
  return /\.m3u8$/i.test(c.src) || ["application/x-mpegURL", "application/vnd.apple.mpegurl"].includes(c.type);
}
function j(c) {
  return /\.mpd/i.test(c.src) || c.type === "application/dash+xml";
}
function U(c) {
  return /(^rtmp:\/\/|\.flv$)/i.test(c.src) || ["video/x-flv", "video/flv"].includes(c.type);
}
function N(c, t) {
  const e = Z(c);
  if (!e)
    return y(t) ? "audio/mp3" : "video/mp4";
  switch (e) {
    case "m3u8":
    case "m3u":
      return "application/x-mpegURL";
    case "mpd":
      return "application/dash+xml";
    case "mp4":
      return y(t) ? "audio/mp4" : "video/mp4";
    case "mp3":
      return "audio/mp3";
    case "webm":
      return y(t) ? "audio/webm" : "video/webm";
    case "ogg":
      return y(t) ? "audio/ogg" : "video/ogg";
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
      return y(t) ? "audio/mp3" : "video/mp4";
  }
}
function tt(c, t, e, s, i) {
  const n = c.play();
  n !== void 0 ? n.then(() => {
    c.pause(), e(!0), s(!1), i();
  }).catch(() => {
    c.volume = 0, c.muted = !0, c.play().then(() => {
      c.pause(), e(!0), s(!0), i();
    }).catch(() => {
      c.volume = t, c.muted = !1, e(!1), s(!1), i();
    });
  }) : (e(!c.paused || "Promise" in window && n instanceof Promise), c.pause(), s(!1), i());
}
class et {
  #t;
  #e;
  #i;
  #s = {
    button: {},
    global: {},
    media: {}
  };
  #n = [];
  #o = "";
  #r;
  #h;
  constructor(t, e, s) {
    this.#t = t, this.#r = e, this.#h = s;
  }
  create() {
    const { labels: t, defaultLevel: e, detachMenus: s } = this.#t.getOptions(), i = e !== null ? parseInt(e || "0", 10) : this.#t.getMedia().level;
    this.#o = `${i}`;
    const n = this._formatMenuItems(), a = n.length ? n.find((r) => r.key === this.#o) : null, o = a ? a.label : t?.auto || "";
    let l = !1;
    this.#e = document.createElement("button"), this.#e.className = `op-controls__levels op-control__${this.#r}`, this.#e.tabIndex = 0, this.#e.title = t?.mediaLevels || "", this.#e.setAttribute("aria-controls", this.#t.id), this.#e.setAttribute("aria-label", t?.mediaLevels || ""), this.#e.setAttribute("data-active-level", this.#o), this.#e.innerHTML = `<span>${o}</span>`;
    const p = () => {
      this.#n.length ? l || (this.#t.getMedia().level = i, l = !0) : (this._gatherLevels(), setTimeout(() => {
        this.#t.getMedia().level = i;
        const r = u("controlschanged");
        this.#t.getElement().dispatchEvent(r);
      }, 0));
    };
    this.#s.media.loadedmetadata = p.bind(this), this.#s.media.manifestLoaded = p.bind(this), this.#s.media.hlsManifestParsed = p.bind(this), s && (this._buildMenu(), this.#s.button.click = () => {
      if (s) {
        const r = this.#t.getContainer().querySelectorAll(".op-settings");
        for (let d = 0, m = r.length; d < m; ++d)
          r[d] !== this.#i && r[d].setAttribute("aria-hidden", "true");
        this.#i.getAttribute("aria-hidden") === "true" ? this.#i.setAttribute("aria-hidden", "false") : this.#i.setAttribute("aria-hidden", "true");
      }
    }, this.#s.button.mouseover = () => {
      if (!A && !_) {
        const r = this.#t.getContainer().querySelectorAll(".op-settings");
        for (let d = 0, m = r.length; d < m; ++d)
          r[d] !== this.#i && r[d].setAttribute("aria-hidden", "true");
        this.#i.getAttribute("aria-hidden") === "true" && this.#i.setAttribute("aria-hidden", "false");
      }
    }, this.#s.button.mouseout = () => {
      if (!A && !_) {
        const r = this.#t.getContainer().querySelectorAll(".op-settings");
        for (let d = 0, m = r.length; d < m; ++d)
          r[d].setAttribute("aria-hidden", "true");
        this.#i.getAttribute("aria-hidden") === "false" && this.#i.setAttribute("aria-hidden", "true");
      }
    }, this.#e.addEventListener("click", this.#s.button.click, h), this.#e.addEventListener("mouseover", this.#s.button.mouseover, h), this.#i.addEventListener("mouseover", this.#s.button.mouseover, h), this.#i.addEventListener("mouseout", this.#s.button.mouseout, h), this.#t.getElement().addEventListener("controlshidden", this.#s.button.mouseout, h)), this.#s.global.click = (r) => {
      const d = r.target, { currentTime: m } = this.#t.getMedia(), v = this.#t.getMedia().paused;
      if (d.closest(`#${this.#t.id}`) && d.classList.contains("op-levels__option")) {
        const g = d.getAttribute("data-value"), b = g ? g.replace("levels-", "") : "-1";
        if (this.#o = `${b}`, s) {
          this.#e.setAttribute("data-active-level", `${b}`), this.#e.innerHTML = `<span>${L(d.innerText, !0)}</span>`;
          const M = d.parentElement && d.parentElement.parentElement ? d.parentElement.parentElement.querySelectorAll(".op-settings__submenu-item") : [];
          for (let O = 0, W = M.length; O < W; ++O)
            M[O].setAttribute("aria-checked", "false");
          d.parentElement && d.parentElement.setAttribute("aria-checked", "true"), this.#i.setAttribute("aria-hidden", "false");
        }
        this.#t.getMedia().level = b, this.#t.getMedia().currentTime = m, v || this.#t.play();
        const E = u("levelchanged", {
          detail: {
            label: d.innerText.trim(),
            level: b
          }
        });
        this.#t.getElement().dispatchEvent(E), r.preventDefault(), r.stopPropagation();
      }
    };
    const f = S?.connection || S?.mozConnection || S?.webkitConnection;
    this.#s.global.connection = () => {
      const r = this.#t.getMedia().current;
      if (!j(r) && !F(r)) {
        const d = f?.effectiveType || "", m = this.#n.map((g) => ({
          ...g,
          resolution: parseInt(g.label.replace("p", ""), 10)
        }));
        let v = m.find((g) => g.resolution < 360);
        d === "4g" ? v = m.find((g) => g.resolution >= 720) : d === "3g" && (v = m.find((g) => g.resolution >= 360 && g.resolution < 720)), v && (this.#t.pause(), this.#t.getMedia().level = v.id, this.#t.play());
      }
    }, Object.keys(this.#s.media).forEach((r) => {
      this.#t.getElement().addEventListener(r, this.#s.media[r], h);
    }), document.addEventListener("click", this.#s.global.click, h), f && f.addEventListener("change", this.#s.global.connection, h);
  }
  destroy() {
    const { detachMenus: t } = this.#t.getOptions(), e = S?.connection || S?.mozConnection || S?.webkitConnection;
    Object.keys(this.#s.media).forEach((s) => {
      this.#t.getElement().removeEventListener(s, this.#s.media[s]);
    }), document.removeEventListener("click", this.#s.global.click), e && e.removeEventListener("change", this.#s.global.connection), t && (this.#e.removeEventListener("click", this.#s.button.click), this.#e.remove(), this.#e.removeEventListener("mouseover", this.#s.button.mouseover), this.#i.removeEventListener("mouseover", this.#s.button.mouseover), this.#i.removeEventListener("mouseout", this.#s.button.mouseout), this.#t.getElement().removeEventListener("controlshidden", this.#s.button.mouseout), this.#i.remove());
  }
  addSettings() {
    const { labels: t, detachMenus: e } = this.#t.getOptions();
    if (e)
      return {};
    const s = this._formatMenuItems();
    return s.length > 2 ? {
      className: "op-levels__option",
      default: this.#o || "-1",
      key: "levels",
      name: t?.levels,
      subitems: s
    } : {};
  }
  _formatMenuItems() {
    const { labels: t } = this.#t.getOptions(), e = this._gatherLevels(), s = e.length;
    let i = s ? [{ key: "-1", label: t?.auto }] : [];
    for (let n = 0; n < s; n++) {
      const a = e[n];
      i = i.filter((o) => o.key !== a.id), i.push({ key: a.id, label: a.label });
    }
    return i.reduce((n, a) => n.find((l) => l.label === a.label) ? n : n.concat([a]), []).sort((n, a) => parseInt(n?.label || "", 10) > parseInt(a?.label || "", 10) ? 1 : -1);
  }
  // @see https://en.wikipedia.org/wiki/Computer_display_standard#Standards
  _getResolutionsLabel(t) {
    const { labels: e } = this.#t.getOptions();
    return t >= 4320 ? "8K" : t >= 2160 ? "4K" : t >= 1440 ? "1440p" : t >= 1080 ? "1080p" : t >= 720 ? "720p" : t >= 480 ? "480p" : t >= 360 ? "360p" : t >= 240 ? "240p" : t >= 144 ? "144p" : e?.auto || "";
  }
  _gatherLevels() {
    return this.#n.length || this.#t.getMedia().levels.forEach((t) => {
      this.#n.push({ ...t, label: t.label || this._getResolutionsLabel(t.height) });
    }), this.#n;
  }
  _buildMenu() {
    const { detachMenus: t } = this.#t.getOptions();
    if (t) {
      this.#e.classList.add("op-control--no-hover"), this.#i = document.createElement("div"), this.#i.className = "op-settings op-levels__menu", this.#i.setAttribute("aria-hidden", "true");
      const e = "op-levels__option", i = `<div class="op-settings__menu" role="menu" id="menu-item-levels">
                ${this._formatMenuItems().map(
        (a) => `
                <div class="op-settings__submenu-item" tabindex="0" role="menuitemradio"
                    aria-checked="${this.#o === a.key ? "true" : "false"}">
                    <div class="op-settings__submenu-label ${e}" data-value="levels-${a.key}">${a.label}</div>
                </div>`
      ).join("")}
            </div>`;
      this.#i.innerHTML = i;
      const n = document.createElement("div");
      n.className = `op-controls__container op-control__${this.#r}`, n.appendChild(this.#e), n.appendChild(this.#i), this.#t.getControls().getLayer(this.#h).appendChild(n);
    }
  }
}
class st {
  #t;
  #e;
  #i = {
    controls: {},
    media: {}
  };
  #s;
  #n;
  constructor(t, e, s) {
    this.#t = t, this.#s = e, this.#n = s, this._enterSpaceKeyEvent = this._enterSpaceKeyEvent.bind(this);
  }
  create() {
    const { labels: t } = this.#t.getOptions();
    this.#e = document.createElement("button"), this.#e.type = "button", this.#e.className = `op-controls__playpause op-control__${this.#s}`, this.#e.tabIndex = 0, this.#e.title = t?.play || "", this.#e.setAttribute("aria-controls", this.#t.id), this.#e.setAttribute("aria-pressed", "false"), this.#e.setAttribute("aria-label", t?.play || ""), this.#t.getControls().getLayer(this.#n).appendChild(this.#e), this.#i.button = (i) => {
      this.#e.setAttribute("aria-pressed", "true");
      const n = this.#t.activeElement();
      n.paused || n.ended ? (this.#t.getAd() && (this.#t.getAd().playRequested = !0), n.play(), this.#i.media.play()) : (n.pause(), this.#i.media.pause()), i.preventDefault(), i.stopPropagation();
    };
    const e = y(this.#t.getElement());
    this.#i.media.play = () => {
      this.#t.activeElement().ended ? (this.#t.isMedia() ? this.#e.classList.add("op-controls__playpause--replay") : this.#e.classList.add("op-controls__playpause--pause"), this.#e.title = t?.play || "", this.#e.setAttribute("aria-label", t?.play || "")) : (this.#e.classList.remove("op-controls__playpause--replay"), this.#e.classList.add("op-controls__playpause--pause"), this.#e.title = t?.pause || "", this.#e.setAttribute("aria-label", t?.pause || ""), this.#t.getOptions()?.pauseOthers && Object.keys(q.instances).forEach((i) => {
        i !== this.#t.id && q.instances[i].activeElement().pause();
      }));
    }, this.#i.media.loadedmetadata = () => {
      this.#e.classList.contains("op-controls__playpause--pause") && (this.#e.classList.remove("op-controls__playpause--replay"), this.#e.classList.remove("op-controls__playpause--pause"), this.#e.title = t?.play || "", this.#e.setAttribute("aria-label", t?.play || ""));
    }, this.#i.media.playing = () => {
      this.#e.classList.contains("op-controls__playpause--pause") || (this.#e.classList.remove("op-controls__playpause--replay"), this.#e.classList.add("op-controls__playpause--pause"), this.#e.title = t?.pause || "", this.#e.setAttribute("aria-label", t?.pause || ""));
    }, this.#i.media.pause = () => {
      this.#e.classList.remove("op-controls__playpause--pause"), this.#e.title = t?.play || "", this.#e.setAttribute("aria-label", t?.play || "");
    }, this.#i.media.ended = () => {
      this.#t.activeElement().ended && this.#t.isMedia() ? (this.#e.classList.add("op-controls__playpause--replay"), this.#e.classList.remove("op-controls__playpause--pause")) : this.#t.getElement().currentTime >= this.#t.getElement().duration || this.#t.getElement().currentTime <= 0 ? (this.#e.classList.add("op-controls__playpause--replay"), this.#e.classList.remove("op-controls__playpause--pause")) : (this.#e.classList.remove("op-controls__playpause--replay"), this.#e.classList.add("op-controls__playpause--pause")), this.#e.title = t?.play || "", this.#e.setAttribute("aria-label", t?.play || "");
    }, this.#i.media.adsmediaended = () => {
      this.#e.classList.remove("op-controls__playpause--replay"), this.#e.classList.add("op-controls__playpause--pause"), this.#e.title = t?.pause || "", this.#e.setAttribute("aria-label", t?.pause || "");
    }, this.#i.media.playererror = () => {
      e && this.#t.activeElement().pause();
    };
    const s = this.#t.getElement();
    this.#i.controls.controlschanged = () => {
      if (!this.#t.activeElement().paused) {
        const i = u("playing");
        s.dispatchEvent(i);
      }
    }, Object.keys(this.#i.media).forEach((i) => {
      s.addEventListener(i, this.#i.media[i], h);
    }), this.#t.getOptions().media?.pauseOnClick && s.addEventListener("click", this.#i.button, h), this.#t.getControls().getContainer().addEventListener("controlschanged", this.#i.controls.controlschanged, h), this.#t.getContainer().addEventListener("keydown", this._enterSpaceKeyEvent, h), this.#e.addEventListener("click", this.#i.button, h);
  }
  destroy() {
    Object.keys(this.#i.media).forEach((t) => {
      this.#t.getElement().removeEventListener(t, this.#i.media[t]);
    }), this.#t.getOptions().media?.pauseOnClick && this.#t.getElement().removeEventListener("click", this.#i.button), this.#t.getControls().getContainer().removeEventListener("controlschanged", this.#i.controls.controlschanged), this.#t.getContainer().removeEventListener("keydown", this._enterSpaceKeyEvent), this.#e.removeEventListener("click", this.#i.button), this.#e.remove();
  }
  _enterSpaceKeyEvent(t) {
    const e = t.which || t.keyCode || 0;
    document?.activeElement?.classList.contains("op-controls__playpause") && (e === 13 || e === 32) && this.#i.button(t);
  }
}
function C(c, t) {
  const e = Math.floor(c % 1 * (t || 0));
  let s = Math.floor(c), i = Math.floor(s / 60);
  const n = Math.floor(i / 60), a = (o) => {
    const l = o.toString();
    return o < 10 ? o <= 0 ? "00" : `0${l}` : l;
  };
  return i %= 60, s %= 60, `${n > 0 ? `${a(n)}:` : ""}${a(i)}:${a(s)}${e ? `:${a(e)}` : ""}`;
}
class it {
  #t;
  #e;
  #i;
  #s;
  #n;
  #o;
  #r = {
    container: {},
    controls: {},
    global: {},
    media: {},
    slider: {}
  };
  #h = !1;
  #d;
  #l;
  constructor(t, e, s) {
    this.#t = t, this.#d = e, this.#l = s, this._enterSpaceKeyEvent = this._enterSpaceKeyEvent.bind(this);
  }
  create() {
    const { labels: t, progress: e } = this.#t.getOptions();
    this.#e = document.createElement("div"), this.#e.className = `op-controls__progress op-control__${this.#d}`, this.#e.tabIndex = 0, this.#e.setAttribute("aria-label", t?.progressSlider || ""), this.#e.setAttribute("aria-valuemin", "0"), this.#e.setAttribute("aria-valuenow", "0"), this.#e.setAttribute("role", "slider"), this.#i = document.createElement("input"), this.#i.type = "range", this.#i.className = "op-controls__progress--seek", this.#i.tabIndex = -1, this.#i.setAttribute("min", "0"), this.#i.setAttribute("step", "0.1"), this.#i.value = "0", this.#i.setAttribute("aria-label", t?.progressRail || ""), this.#i.setAttribute("role", "slider"), this.#s = document.createElement("progress"), this.#s.className = "op-controls__progress--buffer", this.#s.setAttribute("max", "100"), this.#s.value = 0, this.#n = document.createElement("progress"), this.#n.className = "op-controls__progress--played", this.#n.setAttribute("max", "100"), this.#n.value = 0, this.#e.appendChild(this.#i), this.#e.appendChild(this.#n), this.#e.appendChild(this.#s), !A && !_ && (this.#o = document.createElement("span"), this.#o.className = "op-controls__tooltip", this.#o.tabIndex = -1, this.#o.innerHTML = "00:00", this.#e.appendChild(this.#o));
    const s = () => {
      this.#i.classList.contains("error") && this.#i.classList.remove("error");
      const r = this.#t.activeElement();
      if (r.duration !== 1 / 0 && !this.#t.getElement().getAttribute("op-live__enabled") && !this.#t.getElement().getAttribute("op-dvr__enabled")) {
        const d = this.#t.isMedia() ? r.currentTime : r.duration - r.currentTime;
        this.#i.value = d.toString(), Number.isNaN(r.duration) || (this.#i.setAttribute("max", `${r.duration}`), this.#e.setAttribute("aria-valuemax", r.duration.toString()));
      } else
        this.#t.getElement().getAttribute("op-dvr__enabled") ? (this.#i.setAttribute("max", "1"), this.#i.value = "1", this.#i.style.backgroundSize = "100% 100%", this.#n.value = 1, this.#e.setAttribute("aria-valuemax", "1"), this.#e.setAttribute("aria-hidden", "false")) : this.#t.getOptions().live?.showProgress || this.#e.setAttribute("aria-hidden", "true");
    };
    let i = 0;
    const n = this.#t.getOptions().progress?.duration || 0, a = y(this.#t.getElement());
    this.#r.media.loadedmetadata = s.bind(this), this.#r.controls.controlschanged = s.bind(this), this.#r.media.progress = (r) => {
      const d = r.target;
      if (d.duration !== 1 / 0 && !this.#t.getElement().getAttribute("op-live__enabled")) {
        if (d.duration > 0) {
          for (let m = 0, v = d.buffered.length; m < v; m++)
            if (d.buffered.start(d.buffered.length - 1 - m) < d.currentTime) {
              this.#s.value = d.buffered.end(d.buffered.length - 1 - m) / d.duration * 100;
              break;
            }
        }
      } else
        !this.#t.getElement().getAttribute("op-dvr__enabled") && this.#e.getAttribute("aria-hidden") === "false" && !this.#t.getOptions().live?.showProgress && this.#e.setAttribute("aria-hidden", "true");
    }, this.#r.media.waiting = () => {
      a && !this.#i.classList.contains("loading") && this.#i.classList.add("loading"), a && this.#i.classList.contains("error") && this.#i.classList.remove("error");
    }, this.#r.media.playererror = () => {
      a && !this.#i.classList.contains("error") && this.#i.classList.add("error"), a && this.#i.classList.contains("loading") && this.#i.classList.remove("loading");
    }, this.#r.media.pause = () => {
      const r = this.#t.activeElement();
      if (r.duration !== 1 / 0 && !this.#t.getElement().getAttribute("op-live__enabled")) {
        const d = r.currentTime;
        this.#e.setAttribute("aria-valuenow", d.toString()), this.#e.setAttribute("aria-valuetext", C(d));
      }
    }, this.#r.media.play = () => {
      a && this.#i.classList.contains("loading") && this.#i.classList.remove("loading"), a && this.#i.classList.contains("error") && this.#i.classList.remove("error"), this.#t.activeElement().duration !== 1 / 0 && !this.#t.getElement().getAttribute("op-live__enabled") && (this.#e.removeAttribute("aria-valuenow"), this.#e.removeAttribute("aria-valuetext"));
    }, this.#r.media.playing = () => {
      a && this.#i.classList.contains("loading") && this.#i.classList.remove("loading"), a && this.#i.classList.contains("error") && this.#i.classList.remove("error");
    }, this.#r.media.timeupdate = () => {
      const r = this.#t.activeElement();
      if (r.duration !== 1 / 0 && (!this.#t.getElement().getAttribute("op-live__enabled") || this.#t.getElement().getAttribute("op-dvr__enabled"))) {
        (!this.#i.getAttribute("max") || this.#i.getAttribute("max") === "0" || parseFloat(this.#i.getAttribute("max") || "-1") !== r.duration) && (Number.isNaN(r.duration) || this.#i.setAttribute("max", `${r.duration}`), this.#e.setAttribute("aria-hidden", "false"));
        const d = r.duration - r.currentTime + 1 >= 100 ? 100 : r.duration - r.currentTime + 1, m = this.#t.isMedia() ? r.currentTime : d, v = parseFloat(this.#i.min), g = parseFloat(this.#i.max);
        this.#i.value = m.toString(), this.#i.style.backgroundSize = `${(m - v) * 100 / (g - v)}% 100%`, this.#n.value = r.duration <= 0 || Number.isNaN(r.duration) || !Number.isFinite(r.duration) ? n : m / r.duration * 100, this.#t.getElement().getAttribute("op-dvr__enabled") && Math.floor(this.#n.value) >= 99 && (i = r.currentTime, this.#e.setAttribute("aria-hidden", "false"));
      } else
        !this.#t.getElement().getAttribute("op-dvr__enabled") && this.#e.getAttribute("aria-hidden") === "false" && !this.#t.getOptions().live?.showProgress && this.#e.setAttribute("aria-hidden", "true");
    }, this.#r.media.durationchange = () => {
      const r = this.#t.activeElement(), d = this.#t.isMedia() ? r.currentTime : r.duration - r.currentTime;
      Number.isNaN(r.duration) || (this.#i.setAttribute("max", `${r.duration}`), this.#e.setAttribute("aria-valuemax", r.duration.toString())), this.#n.value = r.duration <= 0 || Number.isNaN(r.duration) || !Number.isFinite(r.duration) ? n : d / r.duration * 100;
    }, this.#r.media.ended = () => {
      this.#i.style.backgroundSize = "0% 100%", this.#i.getAttribute("max") && this.#i.setAttribute("max", "0"), this.#s.value = 0, this.#n.value = 0;
    };
    const o = (r) => {
      const d = this.#t.activeElement(), m = r.target, v = parseFloat(m.value);
      if (this.#i.classList.contains("op-progress--pressed") || v < d.currentTime && !e?.allowRewind || v > d.currentTime && !e?.allowSkip) {
        this.#i.value = d.currentTime.toString();
        return;
      }
      this.#i.classList.add(".op-progress--pressed");
      const g = parseFloat(m.min), b = parseFloat(m.max), E = parseFloat(m.value);
      this.#i.style.backgroundSize = `${(E - g) * 100 / (b - g)}% 100%`, this.#n.value = d.duration <= 0 || Number.isNaN(d.duration) || !Number.isFinite(d.duration) ? n : E / d.duration * 100, this.#t.getElement().getAttribute("op-dvr__enabled") ? d.currentTime = Math.round(this.#n.value) >= 99 ? i : E : d.currentTime = E, this.#i.classList.remove(".op-progress--pressed");
    }, l = (r) => {
      const d = this.#t.activeElement(), m = r.which || r.keyCode || 0, v = this.#i, g = Math.round(Number(v.value)), b = Math.round(d.currentTime);
      (g < b && e?.allowRewind || g >= b && e?.allowSkip) && (m === 1 || m === 0) && this.#t.isMedia() && !d.paused && (d.pause(), this.#h = !0);
    }, p = () => {
      const r = this.#t.activeElement();
      this.#h === !0 && this.#t.isMedia() && r.paused && (r.play(), this.#h = !1);
    }, f = (r) => {
      const d = this.#t.activeElement();
      if (d.duration !== 1 / 0) {
        const { changedTouches: m } = r, E = ((m[0]?.pageX || 0) - I(this.#e).left) / this.#e.offsetWidth * d.duration;
        (E < d.currentTime && e?.allowRewind || E > d.currentTime && e?.allowSkip) && (this.#i.value = E.toString(), o(r), d.paused || (d.pause(), this.#h = !0));
      }
    };
    this.#r.slider.input = o.bind(this), this.#r.slider.change = o.bind(this), this.#r.slider.mousedown = l.bind(this), this.#r.slider.mouseup = p.bind(this), this.#r.slider.touchstart = f.bind(this), this.#r.slider.touchend = p.bind(this), !A && !_ && (this.#r.container.mousemove = (r) => {
      const d = this.#t.activeElement();
      if (d.duration !== 1 / 0 && !this.#t.isAd()) {
        const m = r.pageX;
        let v = m - I(this.#e).left;
        const g = this.#o.offsetWidth / 2, b = v / this.#e.offsetWidth, E = b * d.duration, M = this.#t.getContainer(), O = M.offsetWidth - this.#o.offsetWidth;
        v <= 0 || m - I(M).left <= g ? v = 0 : m - I(M).left >= O ? v = O - I(this.#i).left - 10 : v -= g, b >= 0 && b <= 1 ? this.#o.classList.add("op-controls__tooltip--visible") : this.#o.classList.remove("op-controls__tooltip--visible"), this.#o.style.left = `${v}px`, this.#o.innerHTML = Number.isNaN(E) ? "00:00" : C(E);
      }
    }, this.#r.global.mousemove = (r) => {
      (!r.target.closest(".op-controls__progress") || this.#t.isAd()) && this.#o.classList.remove("op-controls__tooltip--visible");
    }), Object.keys(this.#r.media).forEach((r) => {
      this.#t.getElement().addEventListener(r, this.#r.media[r], h);
    }), Object.keys(this.#r.slider).forEach((r) => {
      this.#i.addEventListener(r, this.#r.slider[r], h);
    }), this.#e.addEventListener("keydown", this.#t.getEvents().keydown, h), this.#e.addEventListener("mousemove", this.#r.container.mousemove, h), document.addEventListener("mousemove", this.#r.global.mousemove, h), this.#t.getContainer().addEventListener("keydown", this._enterSpaceKeyEvent, h), this.#t.getControls().getContainer().addEventListener("controlschanged", this.#r.controls.controlschanged, h), this.#t.getControls().getLayer(this.#l).appendChild(this.#e);
  }
  destroy() {
    Object.keys(this.#r).forEach((t) => {
      this.#t.getElement().removeEventListener(t, this.#r[t]);
    }), Object.keys(this.#r.slider).forEach((t) => {
      this.#i.removeEventListener(t, this.#r.slider[t]);
    }), this.#e.removeEventListener("keydown", this.#t.getEvents().keydown), this.#e.removeEventListener("mousemove", this.#r.container.mousemove), document.removeEventListener("mousemove", this.#r.global.mousemove), this.#t.getContainer().removeEventListener("keydown", this._enterSpaceKeyEvent), this.#t.getControls().getContainer().removeEventListener("controlschanged", this.#r.controls.controlschanged), this.#s.remove(), this.#n.remove(), this.#i.remove(), !A && !_ && this.#o.remove(), this.#e.remove();
  }
  _enterSpaceKeyEvent(t) {
    const e = this.#t.activeElement(), s = this.#t.isAd(), i = t.which || t.keyCode || 0;
    if (!s && i >= 48 && i <= 57 && e.duration !== 1 / 0) {
      let n = 0;
      for (let a = 48, o = 57; a <= o; a++)
        a < i && n++;
      e.currentTime = e.duration * (0.1 * n), t.preventDefault(), t.stopPropagation();
    }
  }
}
class H {
  #t;
  #e = {};
  #i;
  #s;
  #n = {
    global: {},
    media: {}
  };
  #o = "";
  #r;
  #h;
  constructor(t, e, s) {
    this.#t = t, this.#r = e, this.#h = s, this._enterSpaceKeyEvent = this._enterSpaceKeyEvent.bind(this);
  }
  create() {
    const { labels: t } = this.#t.getOptions();
    this.#i = document.createElement("button"), this.#i.className = `op-controls__settings op-control__${this.#r}`, this.#i.tabIndex = 0, this.#i.title = t?.settings || "", this.#i.setAttribute("aria-controls", this.#t.id), this.#i.setAttribute("aria-pressed", "false"), this.#i.setAttribute("aria-label", t?.settings || ""), this.#s = document.createElement("div"), this.#s.className = "op-settings", this.#s.setAttribute("aria-hidden", "true"), this.#s.innerHTML = '<div class="op-settings__menu" role="menu"></div>', this.clickEvent = () => {
      this.#i.setAttribute("aria-pressed", "true");
      const e = this.#t.getContainer().querySelectorAll(".op-settings");
      for (let s = 0, i = e.length; s < i; ++s)
        e[s] !== this.#s && e[s].setAttribute("aria-hidden", "true");
      this.#s.setAttribute(
        "aria-hidden",
        this.#s.getAttribute("aria-hidden") === "false" ? "true" : "false"
      );
    }, this.hideEvent = () => {
      let e;
      e && typeof window < "u" && window.cancelAnimationFrame(e), typeof window < "u" && (e = window.requestAnimationFrame(() => {
        this.#s.innerHTML = this.#o, this.#s.setAttribute("aria-hidden", "true");
      }));
    }, this.removeEvent = (e) => {
      const { id: s, type: i } = e.detail;
      this.removeItem(s, i);
    }, this.clickEvent = this.clickEvent.bind(this), this.hideEvent = this.hideEvent.bind(this), this.removeEvent = this.removeEvent.bind(this), this.#n.media.controlshidden = this.hideEvent.bind(this), this.#n.media.settingremoved = this.removeEvent.bind(this), this.#n.media.play = this.hideEvent.bind(this), this.#n.media.pause = this.hideEvent.bind(this), this.#t.getContainer().addEventListener("keydown", this._enterSpaceKeyEvent, h), this.#n.global.click = (e) => {
      const { target: s } = e, i = s;
      if (i?.closest(`#${this.#t.id}`) && i?.classList.contains("op-speed__option")) {
        const n = i?.getAttribute("data-value") || "";
        this.#t.getMedia().playbackRate = parseFloat(n.replace("speed-", ""));
      }
    }, this.#n.global.resize = this.hideEvent.bind(this), this.#i.addEventListener("click", this.clickEvent, h), Object.keys(this.#n).forEach((e) => {
      this.#t.getElement().addEventListener(e, this.#n.media[e], h);
    }), document.addEventListener("click", this.#n.global.click, h), document.addEventListener("keydown", this.#n.global.click, h), typeof window < "u" && window.addEventListener("resize", this.#n.global.resize, h), this.#t.getControls().getLayer(this.#h).appendChild(this.#i), this.#t.getContainer().appendChild(this.#s);
  }
  destroy() {
    this.#i.removeEventListener("click", this.clickEvent), Object.keys(this.#n).forEach((t) => {
      this.#t.getElement().removeEventListener(t, this.#n.media[t]);
    }), document.removeEventListener("click", this.#n.global.click), document.removeEventListener("keydown", this.#n.global.click), typeof window < "u" && window.removeEventListener("resize", this.#n.global.resize), this.#n.global["settings.submenu"] !== void 0 && (document.removeEventListener("click", this.#n.global["settings.submenu"]), this.#t.getElement().removeEventListener("controlshidden", this.hideEvent)), this.#t.getContainer().removeEventListener("keydown", this._enterSpaceKeyEvent), this.#s.remove(), this.#i.remove();
  }
  addSettings() {
    const t = this.#t.getMedia(), { labels: e } = this.#t.getOptions();
    let s = 1;
    return this.#t && t && (s = t.defaultPlaybackRate !== t.playbackRate ? t.playbackRate : t.defaultPlaybackRate), {
      className: "op-speed__option",
      default: s.toString(),
      key: "speed",
      name: e?.speed || "",
      subitems: [
        { key: "0.25", label: "0.25" },
        { key: "0.5", label: "0.5" },
        { key: "0.75", label: "0.75" },
        { key: "1", label: e?.speedNormal || "" },
        { key: "1.25", label: "1.25" },
        { key: "1.5", label: "1.5" },
        { key: "2", label: "2" }
      ]
    };
  }
  addItem(t, e, s, i, n) {
    const a = `${e}-${L(s, !0)}`, o = document.createElement("div");
    o.className = "op-settings__menu-item", o.tabIndex = 0, o.setAttribute("role", "menuitemradio"), o.innerHTML = `<div class="op-settings__menu-label" data-value="${a}">${t}</div>`;
    const l = i ? i.find((f) => f.key === s) : null;
    l && (o.innerHTML += `<div class="op-settings__menu-content" tabindex="0">${l.label}</div>`);
    const p = this.#s.querySelector(".op-settings__menu");
    if (p && p.appendChild(o), this.#o = this.#s.innerHTML, i) {
      const f = `
                <div class="op-settings__header">
                    <button type="button" class="op-settings__back" tabindex="0">${t}</button>
                </div>
                <div class="op-settings__menu" role="menu" id="menu-item-${e}">
                    ${i.map(
        (r) => `
                    <div class="op-settings__submenu-item" role="menuitemradio" aria-checked="${s === r.key ? "true" : "false"}">
                        <div class="op-settings__submenu-label ${n || ""}" tabindex="0" data-value="${e}-${r.key}">
                            ${r.label}
                        </div>
                    </div>`
      ).join("")}
                </div>`;
      this.#e[e] = f;
    }
    this.#n.global["settings.submenu"] = (f) => {
      const r = f.target;
      if (r.closest(`#${this.#t.id}`)) {
        if (r.classList.contains("op-settings__back"))
          this.#s.classList.add("op-settings--sliding"), setTimeout(() => {
            this.#s.innerHTML = this.#o, this.#s.classList.remove("op-settings--sliding");
          }, 100);
        else if (r.classList.contains("op-settings__menu-content")) {
          const d = r.parentElement ? r.parentElement.querySelector(".op-settings__menu-label") : null, m = d ? d.getAttribute("data-value") : null, v = m ? m.split("-") : [];
          if (v.length > 0) {
            v.pop();
            const g = v.join("-").replace(/^\-|\-$/, "");
            typeof this.#e[g] < "u" && (this.#s.classList.add("op-settings--sliding"), setTimeout(() => {
              this.#s.innerHTML = this.#e[g], this.#s.classList.remove("op-settings--sliding");
            }, 100));
          }
        } else if (r.classList.contains("op-settings__submenu-label")) {
          const d = r.getAttribute("data-value"), m = d ? d.replace(`${e}-`, "") : "", v = r.innerText, g = this.#s.querySelector(
            `#menu-item-${e} .op-settings__submenu-item[aria-checked=true]`
          );
          g && (g.setAttribute("aria-checked", "false"), r.parentElement && r.parentElement.setAttribute("aria-checked", "true"), this.#e[e] = this.#s.innerHTML, this.#s.classList.add("op-settings--sliding"), setTimeout(() => {
            this.#s.innerHTML = this.#o;
            const b = this.#s.querySelector(
              `.op-settings__menu-label[data-value="${e}-${s}"]`
            );
            b && (b.setAttribute("data-value", `${d}`), b.nextElementSibling && (b.nextElementSibling.textContent = v)), s = m, this.#o = this.#s.innerHTML, this.#s.classList.remove("op-settings--sliding");
          }, 100));
        }
      } else
        this.hideEvent();
    }, document.addEventListener("click", this.#n.global["settings.submenu"], h), this.#t.getElement().addEventListener("controlshidden", this.hideEvent, h);
  }
  removeItem(t, e, s = 2) {
    const i = this.#t.getElement().querySelector(`.op-settings__submenu-label[data-value=${e}-${t}]`);
    if (i && i.remove(), this.#t.getElement().querySelectorAll(`.op-settings__submenu-label[data-value^=${e}]`).length < s) {
      delete this.#e[e];
      const n = this.#t.getElement().querySelector(`.op-settings__menu-label[data-value^=${e}]`), a = n ? n.closest(".op-settings__menu-item") : null;
      a && a.remove();
    }
  }
  _enterSpaceKeyEvent(t) {
    const e = t.which || t.keyCode || 0, s = this.#t.isAd(), i = document?.activeElement?.classList.contains("op-controls__settings"), n = document?.activeElement?.classList.contains("op-settings__menu-content") || document?.activeElement?.classList.contains("op-settings__back") || document?.activeElement?.classList.contains("op-settings__submenu-label");
    s || (i && (e === 13 || e === 32) ? (this.clickEvent(), t.preventDefault(), t.stopPropagation()) : n && (e === 13 || e === 32) && (this.#n.global["settings.submenu"](t), t.preventDefault(), t.stopPropagation()));
  }
}
class nt {
  #t;
  #e;
  #i;
  #s;
  #n;
  #o = {
    controls: {},
    media: {}
  };
  #r;
  #h;
  constructor(t, e, s) {
    this.#t = t, this.#r = e, this.#h = s;
  }
  create() {
    const { labels: t, progress: e } = this.#t.getOptions();
    this.#e = document.createElement("time"), this.#e.className = "op-controls__current", this.#e.setAttribute("role", "timer"), this.#e.setAttribute("aria-live", "off"), this.#e.setAttribute("aria-hidden", "false"), this.#e.innerText = "0:00";
    const s = e?.showCurrentTimeOnly || !1;
    s || (this.#i = document.createElement("span"), this.#i.className = "op-controls__time-delimiter", this.#i.setAttribute("aria-hidden", "false"), this.#i.innerText = "/", this.#s = document.createElement("time"), this.#s.className = "op-controls__duration", this.#s.setAttribute("aria-hidden", "false"), this.#s.innerText = C(e?.duration || 0));
    const i = this.#t.getControls().getLayer(this.#h);
    this.#n = document.createElement("span"), this.#n.className = `op-controls-time op-control__${this.#r}`, this.#n.appendChild(this.#e), s || (this.#n.appendChild(this.#i), this.#n.appendChild(this.#s)), i.appendChild(this.#n);
    const n = () => {
      const o = this.#t.activeElement();
      if (o.duration !== 1 / 0 && !this.#t.getElement().getAttribute("op-live__enabled")) {
        if (!s) {
          const l = Number.isNaN(o.duration) ? this.#t.getOptions().progress?.duration || 0 : o.duration;
          this.#s.innerText = C(l);
        }
        this.#e.innerText = C(o.currentTime);
      } else
        s || (this.#s.setAttribute("aria-hidden", "true"), this.#i.setAttribute("aria-hidden", "true"));
    };
    this.#o.media.loadedmetadata = n.bind(this), this.#o.controls.controlschanged = n.bind(this);
    const { showLabel: a } = this.#t.getOptions().live || {};
    this.#o.media.timeupdate = () => {
      const o = this.#t.activeElement();
      if (o.duration !== 1 / 0 && !this.#t.getElement().getAttribute("op-live__enabled") && !this.#t.getElement().getAttribute("op-dvr__enabled")) {
        const l = C(o.duration);
        !s && !Number.isNaN(o.duration) && l !== this.#s.innerText ? (this.#s.innerText = l, this.#s.setAttribute("aria-hidden", "false"), this.#i.setAttribute("aria-hidden", "false")) : (s || l !== this.#s.innerText) && (this.#e.innerText = a ? t?.live || "" : C(o.currentTime)), this.#e.innerText = C(o.currentTime);
      } else
        this.#t.getElement().getAttribute("op-dvr__enabled") ? (s || (this.#s.setAttribute("aria-hidden", "true"), this.#i.setAttribute("aria-hidden", "true")), this.#e.innerText = C(o.currentTime)) : s || !this.#t.getElement().getAttribute("op-dvr__enabled") && this.#s.getAttribute("aria-hidden") === "false" ? (s || (this.#s.setAttribute("aria-hidden", "true"), this.#i.setAttribute("aria-hidden", "true")), this.#e.innerText = a ? t?.live || "" : C(o.currentTime)) : this.#e.innerText = a ? t?.live || "" : C(o.currentTime);
    }, this.#o.media.ended = () => {
      const o = this.#t.activeElement(), l = Number.isNaN(o.duration) ? this.#t.getOptions().progress?.duration || 0 : o.duration;
      !s && this.#t.isMedia() && (this.#s.innerText = C(l));
    }, Object.keys(this.#o.media).forEach((o) => {
      this.#t.getElement().addEventListener(o, this.#o.media[o], h);
    }), this.#t.getControls().getContainer().addEventListener("controlschanged", this.#o.controls.controlschanged, h);
  }
  destroy() {
    Object.keys(this.#o.media).forEach((e) => {
      this.#t.getElement().removeEventListener(e, this.#o.media[e]);
    }), this.#t.getControls().getContainer().removeEventListener("controlschanged", this.#o.controls.controlschanged), this.#e.remove();
    const { showCurrentTimeOnly: t } = this.#t.getOptions().progress || {};
    t || (this.#i.remove(), this.#s.remove()), this.#n.remove();
  }
}
class at {
  #t;
  #e;
  #i;
  #s;
  #n;
  #o = {
    button: {},
    media: {},
    slider: {}
  };
  #r;
  #h;
  #d;
  constructor(t, e, s) {
    this.#t = t, this.#r = this.#t.getMedia().volume, this.#h = e, this.#d = s, this._enterSpaceKeyEvent = this._enterSpaceKeyEvent.bind(this);
  }
  create() {
    const { labels: t } = this.#t.getOptions();
    this.#i = document.createElement("div"), this.#i.className = `op-controls__volume op-control__${this.#h}`, this.#i.tabIndex = 0, this.#i.setAttribute("aria-valuemin", "0"), this.#i.setAttribute("aria-valuemax", "100"), this.#i.setAttribute("aria-valuenow", `${this.#r}`), this.#i.setAttribute("aria-valuetext", `${t?.volume || ""}: ${this.#r}`), this.#i.setAttribute("aria-orientation", "vertical"), this.#i.setAttribute("aria-label", t?.volumeSlider || ""), this.#i.setAttribute("role", "slider"), this.#n = document.createElement("input"), this.#n.type = "range", this.#n.className = "op-controls__volume--input", this.#n.tabIndex = -1, this.#n.value = this.#t.getMedia().volume.toString(), this.#n.setAttribute("min", "0"), this.#n.setAttribute("max", "1"), this.#n.setAttribute("step", "0.1"), this.#n.setAttribute("aria-label", t?.volumeControl || ""), this.#s = document.createElement("progress"), this.#s.className = "op-controls__volume--display", this.#s.setAttribute("max", "10"), this.#s.value = this.#t.getMedia().volume * 10, this.#i.appendChild(this.#n), this.#i.appendChild(this.#s), this.#e = document.createElement("button"), this.#e.type = "button", this.#e.className = `op-controls__mute op-control__${this.#h}`, this.#e.tabIndex = 0, this.#e.title = t?.mute || "", this.#e.setAttribute("aria-controls", this.#t.id), this.#e.setAttribute("aria-pressed", "false"), this.#e.setAttribute("aria-label", t?.mute || "");
    const e = (n) => {
      const a = n.volume * 1, o = Math.floor(a * 100);
      this.#n.value = `${n.volume}`, this.#s.value = a * 10, this.#i.setAttribute("aria-valuenow", `${o}`), this.#i.setAttribute("aria-valuetext", `${t?.volume}: ${o}`);
    }, s = (n) => {
      const a = n.volume;
      a <= 0.5 && a > 0 ? (this.#e.classList.remove("op-controls__mute--muted"), this.#e.classList.add("op-controls__mute--half")) : a === 0 ? (this.#e.classList.add("op-controls__mute--muted"), this.#e.classList.remove("op-controls__mute--half")) : (this.#e.classList.remove("op-controls__mute--muted"), this.#e.classList.remove("op-controls__mute--half"));
    }, i = (n) => {
      const a = this.#t.activeElement(), o = parseFloat(n.target.value);
      a.volume = o, a.muted = a.volume === 0, this.#r = o;
      const l = this.#t.getContainer().querySelector(".op-player__unmute");
      !a.muted && l && l.remove();
      const p = u("volumechange");
      this.#t.getElement().dispatchEvent(p);
    };
    if (this.#o.media.volumechange = () => {
      const n = this.#t.activeElement();
      e(n), s(n);
    }, this.#o.media.loadedmetadata = () => {
      const n = this.#t.activeElement();
      n.muted && (n.volume = 0);
      const a = u("volumechange");
      this.#t.getElement().dispatchEvent(a);
    }, this.#o.slider.input = i.bind(this), this.#o.slider.change = i.bind(this), this.#o.button.click = () => {
      this.#e.setAttribute("aria-pressed", "true");
      const n = this.#t.activeElement();
      n.muted = !n.muted, n.muted ? (n.volume = 0, this.#e.title = t?.unmute || "", this.#e.setAttribute("aria-label", t?.unmute || "")) : (n.volume = this.#r, this.#e.title = t?.mute || "", this.#e.setAttribute("aria-label", t?.mute || ""));
      const a = u("volumechange");
      this.#t.getElement().dispatchEvent(a);
    }, this.#e.addEventListener("click", this.#o.button.click, h), Object.keys(this.#o.media).forEach((n) => {
      this.#t.getElement().addEventListener(n, this.#o.media[n], h);
    }), Object.keys(this.#o.slider).forEach((n) => {
      this.#n.addEventListener(n, this.#o.slider[n], h);
    }), this.#t.getContainer().addEventListener("keydown", this._enterSpaceKeyEvent, h), !_ && !A || !this.#t.getOptions().useDeviceVolume) {
      const n = this.#t.getControls().getLayer(this.#d);
      n.appendChild(this.#e), n.appendChild(this.#i);
    }
  }
  destroy() {
    this.#e.removeEventListener("click", this.#o.button.click), Object.keys(this.#o.media).forEach((t) => {
      this.#t.getElement().removeEventListener(t, this.#o.media[t]);
    }), Object.keys(this.#o.slider).forEach((t) => {
      this.#n.removeEventListener(t, this.#o.slider[t]);
    }), this.#t.getContainer().removeEventListener("keydown", this._enterSpaceKeyEvent), this.#n.remove(), this.#s.remove(), this.#i.remove();
  }
  _enterSpaceKeyEvent(t) {
    const e = t.which || t.keyCode || 0, s = this.#t.activeElement();
    document?.activeElement?.classList.contains("op-controls__mute") && (e === 13 || e === 32) && (s.muted = !s.muted, s.volume = s.muted ? 0 : this.#r, this.#o.button.click(), t.preventDefault(), t.stopPropagation());
  }
}
class ot {
  constructor(t) {
    this.events = {
      media: {},
      mouse: {}
    }, this.#e = 0, this.#o = {
      Captions: J,
      Fullscreen: z,
      Levels: et,
      Play: st,
      Progress: it,
      Settings: H,
      Time: nt,
      Volume: at
    }, this.#s = t, this._setElements();
  }
  #t;
  #e;
  #i;
  #s;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #n;
  #o;
  create() {
    this.#s.getElement().controls = !1;
    const t = k(this.#s.getElement());
    this._createControlsLayer(), this._buildElements(), this.events.controlschanged = () => {
      this.destroy(), this._setElements(), this.create();
    }, this.events.ended = () => {
      this.#s.getContainer().classList.remove("op-controls--hidden");
    }, this.#s.getElement().addEventListener("controlschanged", this.events.controlschanged, h), this.#s.getElement().addEventListener("ended", this.events.ended, h);
    const { alwaysVisible: e } = this.#s.getOptions().controls || {};
    if (!e) {
      const s = () => {
        t && (this.#s.getContainer().classList.remove("op-controls--hidden"), this._stopControlTimer());
      };
      this.events.mouse.mouseenter = () => {
        t && !this.#s.activeElement().paused && (this._stopControlTimer(), this.#s.activeElement().currentTime ? (this.#s.playBtn.setAttribute("aria-hidden", this.#s.isMedia() ? "false" : "true"), this.#s.loader.setAttribute("aria-hidden", "true")) : this.#s.getOptions().showLoaderOnInit && (this.#s.playBtn.setAttribute("aria-hidden", "true"), this.#s.loader.setAttribute("aria-hidden", "false")), this.#s.getContainer().classList.remove("op-controls--hidden"), this._startControlTimer(2500));
      }, this.events.mouse.mousemove = () => {
        t && !this.#s.activeElement().paused && (this.#s.activeElement().currentTime ? (this.#s.loader.setAttribute("aria-hidden", "true"), this.#s.playBtn.setAttribute("aria-hidden", this.#s.isMedia() ? "false" : "true")) : (this.#s.playBtn.setAttribute(
          "aria-hidden",
          this.#s.getOptions().showLoaderOnInit ? "true" : "false"
        ), this.#s.loader.setAttribute(
          "aria-hidden",
          this.#s.getOptions().showLoaderOnInit ? "false" : "true"
        )), this.#s.getContainer().classList.remove("op-controls--hidden"), this._startControlTimer(2500));
      }, this.events.mouse.mouseleave = () => {
        t && !this.#s.activeElement().paused && this._startControlTimer(1e3);
      }, this.events.media.play = () => {
        t && this._startControlTimer(this.#s.getOptions().hidePlayBtnTimer || 350);
      }, this.events.media.loadedmetadata = s.bind(this), this.events.media.pause = s.bind(this), this.events.media.waiting = s.bind(this), this.events.media.stalled = s.bind(this), this.events.media.playererror = s.bind(this), Object.keys(this.events.media).forEach((i) => {
        this.#s.getElement().addEventListener(i, this.events.media[i], h);
      }), _ || A ? this.#s.getContainer().addEventListener("click", this.events.mouse.mouseenter, h) : Object.keys(this.events.mouse).forEach((i) => {
        this.#s.getContainer().addEventListener(i, this.events.mouse[i], h);
      }), t && !this.#s.activeElement().paused && this._startControlTimer(3e3);
    }
  }
  destroy() {
    !_ && !A && (Object.keys(this.events.mouse).forEach((t) => {
      this.#s.getContainer().removeEventListener(t, this.events.mouse[t]);
    }), Object.keys(this.events.media).forEach((t) => {
      this.#s.getElement().removeEventListener(t, this.events.media[t]);
    }), this._stopControlTimer()), this.#s.getElement().removeEventListener("controlschanged", this.events.controlschanged), this.#s.getElement().removeEventListener("ended", this.events.ended), Object.keys(this.#n).forEach((t) => {
      this.#n[t].forEach((e) => {
        e.custom ? this._destroyCustomElement(e) : typeof e.destroy == "function" && e.destroy();
      });
    }), this.#i.remove();
  }
  getContainer() {
    return this.#i;
  }
  getLayer(t) {
    return this.#i.querySelector(`.op-controls-layer__${t}`) || this.#i;
  }
  _createControlsLayer() {
    if (!this.#i || !this.#s.getContainer().querySelector(".op-controls")) {
      this.#i = document.createElement("div"), this.#i.className = "op-controls", this.#s.getContainer().appendChild(this.#i);
      const t = document.createElement("div");
      t.className = "op-status", t.innerHTML = "<span></span>", t.tabIndex = -1, t.setAttribute("aria-hidden", "true"), y(this.#s.getElement()) && this.#i.appendChild(t);
    }
  }
  _startControlTimer(t) {
    const e = this.#s.activeElement();
    this._stopControlTimer(), typeof window < "u" && (this.#e = window.setTimeout(() => {
      if ((!e.paused || !e.ended) && k(this.#s.getElement())) {
        this.#s.getContainer().classList.add("op-controls--hidden"), this.#s.playBtn.setAttribute("aria-hidden", "true"), this._stopControlTimer();
        const s = u("controlshidden");
        this.#s.getElement().dispatchEvent(s);
      }
    }, t));
  }
  _stopControlTimer() {
    this.#e !== 0 && (clearTimeout(this.#e), this.#e = 0);
  }
  _setElements() {
    const t = this.#s.getOptions().controls?.layers || {};
    this.#n = {
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
    };
    const e = k(this.#s.getElement()), s = y(this.#s.getElement()), i = Object.keys(t), n = i.find((a) => /^(top|bottom)/.test(a));
    this._createControlsLayer(), i.forEach((a) => {
      const [o, l] = a.split("-");
      if (l) {
        this.#i.classList.contains("op-controls__stacked") || this.#i.classList.add("op-controls__stacked");
        const f = `op-controls-layer__${o}`;
        if (!this.#i.querySelector(`.${f}`)) {
          const r = document.createElement("div");
          r.className = f, this.#i.appendChild(r);
        }
      } else if (n) {
        const f = "op-controls-layer__center";
        if (!this.#i.querySelector(`.${f}`)) {
          const r = document.createElement("div");
          r.className = f, this.#i.appendChild(r);
        }
      }
      const p = t ? t[a] : null;
      p && p.filter((f, r, d) => d.indexOf(f) === r).forEach((f) => {
        const r = n && !l ? "center" : o, d = `${f.charAt(0).toUpperCase()}${f.slice(1)}`, m = new this.#o[d](this.#s, l || o, r);
        f === "settings" && (this.#t = m), (e || f !== "fullscreen" && s) && this.#n[a].push(m);
      });
    }), this.#s.getCustomControls().forEach((a) => {
      const [o, l] = a.position.split("-"), p = n && !l ? "center" : o;
      a.layer = p, a.position = l || o, typeof a.index == "number" ? this.#n[a.position].splice(a.index, 0, a) : a.position === "right" ? this.#n[a.position].unshift(a) : this.#n[a.position].push(a);
    });
  }
  _buildElements() {
    Object.keys(this.#n).forEach((e) => {
      this.#n[e].forEach((s) => {
        s.custom ? this._createCustomElement(s) : s.create();
      });
    }), Object.keys(this.#n).forEach((e) => {
      this.#n[e].forEach((s) => {
        const i = !this.#s.getOptions().detachMenus || s instanceof H, n = s;
        if (i && !n.custom && typeof n.addSettings == "function") {
          const a = n.addSettings();
          this.#t && Object.keys(a).length && this.#t.addItem(
            a.name,
            a.key,
            a.default,
            a.subitems,
            a.className
          );
        }
      });
    });
    const t = u("controlschanged");
    this.#i.dispatchEvent(t);
  }
  _hideCustomMenu(t) {
    let e;
    e && typeof window < "u" && window.cancelAnimationFrame(e), typeof window < "u" && (e = window.requestAnimationFrame(() => {
      t.setAttribute("aria-hidden", "true");
    }));
  }
  _toggleCustomMenu(t, e, s) {
    this.#s.getContainer().querySelectorAll(".op-settings").forEach((n) => {
      n.getAttribute("aria-hidden") === "false" && n.id !== e.id && n.setAttribute("aria-hidden", "true");
    }), e.setAttribute("aria-hidden", e.getAttribute("aria-hidden") === "true" ? "false" : "true"), typeof s.click == "function" && s.click(t);
  }
  _createCustomElement(t) {
    const e = document.createElement(t.type);
    if (e.tabIndex = 0, e.id = t.id, e.className = `op-controls__${t.id} op-control__${t.position} ${t.showInAds ? "" : "op-control__hide-in-ad"}`, t.styles && Object.assign(e.style, t.styles), t.type === "button" && t.icon ? e.innerHTML = /\.(jpg|png|svg|gif)$/.test(t.icon) ? `<img src="${L(t.icon)}"${t.alt ? `alt="${L(t.alt)}"` : ""}>` : L(t.icon) : t.content && (e.innerHTML = L(t.content, !1)), t.type === "button" && t.title && (e.title = L(t.title)), t.type === "img" && t.alt && (e.alt = L(t.alt)), t.type !== "button" && t.click && typeof t.click == "function" && e.setAttribute("aria-role", "button"), t.type === "button" && t.subitems && Array.isArray(t.subitems) && t.subitems.length > 0) {
      const s = document.createElement("div");
      s.className = "op-settings op-settings__custom", s.id = `${t.id}-menu`, s.setAttribute("aria-hidden", "true");
      const i = t.subitems.map((n) => {
        let a = "";
        return n.icon && (a = /\.(jpg|png|svg|gif)$/.test(n.icon) ? `<img src="${L(n.icon)}"${n.alt ? `alt="${L(n.alt)}"` : ""}>` : L(n.icon, !1)), `<div class="op-settings__menu-item" tabindex="0" ${n.title ? `title="${n.title}"` : ""} role="menuitemradio">
                    <div class="op-settings__menu-label" id="${n.id}" data-value="${t.id}-${n.id}">${a} ${n.label}</div>
                </div>`;
      });
      s.innerHTML = `<div class="op-settings__menu" role="menu">${i.join("")}</div>`, this.#s.getContainer().appendChild(s), t.subitems.forEach((n) => {
        const a = s.querySelector(`#${n.id}`);
        a && n.click && typeof n.click == "function" && a.addEventListener("click", n.click, h);
      }), e.addEventListener("click", (n) => this._toggleCustomMenu(n, s, t), h), this.#s.getElement().addEventListener("controlshidden", () => this._hideCustomMenu(s), h);
    } else
      t.click && typeof t.click == "function" && e.addEventListener("click", t.click, h);
    t.mouseenter && typeof t.mouseenter == "function" && e.addEventListener("mouseenter", t.mouseenter, h), t.mouseleave && typeof t.mouseleave == "function" && e.addEventListener("mouseleave", t.mouseleave, h), t.keydown && typeof t.keydown == "function" && e.addEventListener("keydown", t.keydown, h), t.blur && typeof t.blur == "function" && e.addEventListener("blur", t.blur, h), t.focus && typeof t.focus == "function" && e.addEventListener("focus", t.focus, h), t.layer && (t.layer === "main" ? this.#s.getContainer().appendChild(e) : this.getLayer(t.layer).appendChild(e)), t.init && typeof t.init == "function" && t.init(this.#s);
  }
  _destroyCustomElement(t) {
    const e = this.getContainer().querySelector(`.op-controls__${t.id}`);
    if (e) {
      if (t.subitems && Array.isArray(t.subitems) && t.subitems.length > 0) {
        const s = this.#s.getContainer().querySelector(`#${t.id}-menu`);
        s && (t.subitems.forEach((i) => {
          const n = s.querySelector(`#${i.id}`);
          n && i.click && typeof i.click == "function" && n.removeEventListener("click", i.click);
        }), e.removeEventListener("click", (i) => this._toggleCustomMenu(i, s, t)), this.#s.getElement().removeEventListener("controlshidden", () => this._hideCustomMenu(s)), s.remove());
      }
      t.click && typeof t.click == "function" && e.removeEventListener("click", t.click), t.mouseenter && typeof t.mouseenter == "function" && e.removeEventListener("mouseenter", t.mouseenter), t.mouseleave && typeof t.mouseleave == "function" && e.removeEventListener("mouseleave", t.mouseleave), t.keydown && typeof t.keydown == "function" && e.removeEventListener("keydown", t.keydown), t.blur && typeof t.blur == "function" && e.removeEventListener("blur", t.blur), t.focus && typeof t.focus == "function" && e.removeEventListener("focus", t.focus), e.remove(), t.destroy && typeof t.destroy == "function" && t.destroy(this.#s);
    }
  }
}
class B {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #t;
  constructor(t, e) {
    this.element = t, this.media = e, this.promise = new Promise((s) => {
      s();
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set instance(t) {
    this.#t = t;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get instance() {
    return this.#t;
  }
  play() {
    return this.element.play();
  }
  pause() {
    this.element.pause();
  }
  set volume(t) {
    this.element.volume = t;
  }
  get volume() {
    return this.element.volume;
  }
  set muted(t) {
    this.element.muted = t;
  }
  get muted() {
    return this.element.muted;
  }
  set playbackRate(t) {
    this.element.playbackRate = t;
  }
  get playbackRate() {
    return this.element.playbackRate;
  }
  set defaultPlaybackRate(t) {
    this.element.defaultPlaybackRate = t;
  }
  get defaultPlaybackRate() {
    return this.element.defaultPlaybackRate;
  }
  set currentTime(t) {
    this.element.currentTime = t;
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
class rt extends B {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #t;
  // @see http://cdn.dashjs.org/latest/jsdoc/MediaPlayerEvents.html
  #e = {};
  #i = {};
  constructor(t, e, s) {
    super(t, e), this.#i = s, this._assign = this._assign.bind(this), this._preparePlayer = this._preparePlayer.bind(this), this.promise = typeof dashjs > "u" ? (
      // Ever-green script
      D("https://cdn.dashjs.org/latest/dash.all.min.js")
    ) : new Promise((i) => {
      i({});
    }), this.promise.then(() => {
      this.#t = dashjs.MediaPlayer().create(), this.instance = this.#t;
    });
  }
  canPlayType(t) {
    return V && t === "application/dash+xml";
  }
  load() {
    this._preparePlayer(), this.#t.attachSource(this.media.src);
    const t = u("loadedmetadata");
    this.element.dispatchEvent(t), this.#e || (this.#e = dashjs.MediaPlayer.events, Object.keys(this.#e).forEach((e) => {
      this.#t.on(this.#e[e], this._assign);
    }));
  }
  destroy() {
    this.#e && (Object.keys(this.#e).forEach((t) => {
      this.#t.off(this.#e[t], this._assign);
    }), this.#e = []), this.#t.reset();
  }
  set src(t) {
    j(t) && (this.destroy(), this.#t = dashjs.MediaPlayer().create(), this._preparePlayer(), this.#t.attachSource(t.src), this.#e = dashjs.MediaPlayer.events, Object.keys(this.#e).forEach((e) => {
      this.#t.on(this.#e[e], this._assign);
    }));
  }
  get levels() {
    const t = [];
    if (this.#t) {
      const e = this.#t.getBitrateInfoListFor("video");
      e.length && e.forEach((s) => {
        if (e[s]) {
          const { height: i, name: n } = e[s], a = {
            height: i,
            id: `${s}`,
            label: n || null
          };
          t.push(a);
        }
      });
    }
    return t;
  }
  set level(t) {
    t === "0" ? this.#t.setAutoSwitchQuality(!0) : (this.#t.setAutoSwitchQuality(!1), this.#t.setQualityFor("video", t));
  }
  get level() {
    return this.#t ? this.#t.getQualityFor("video") : "-1";
  }
  // @see http://cdn.dashjs.org/latest/jsdoc/MediaPlayerEvents.html
  _assign(t) {
    if (t.type === "error") {
      const s = u("playererror", {
        detail: {
          message: t,
          type: "M(PEG)-DASH"
        }
      });
      this.element.dispatchEvent(s);
    } else {
      const e = u(t.type, { detail: t });
      this.element.dispatchEvent(e);
    }
  }
  _preparePlayer() {
    this.#t.updateSettings({
      debug: {
        logLevel: dashjs.Debug.LOG_LEVEL_NONE
      },
      streaming: {
        fastSwitchEnabled: !0,
        scheduleWhilePaused: !1
      },
      ...this.#i || {}
    }), this.#t.initialize(), this.#t.attachView(this.element), this.#t.setAutoPlay(!1);
  }
}
class lt extends B {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #t;
  // @see https://github.com/video-dev/hls.js/blob/master/src/events.js
  #e = {};
  // @see https://github.com/bilibili/flv.js/blob/master/docs/api.md
  #i = {};
  constructor(t, e, s) {
    super(t, e), this.#i = s, this.element = t, this.media = e, this._create = this._create.bind(this), this._assign = this._assign.bind(this), this.promise = typeof flvjs > "u" ? (
      // Ever-green script
      D("https://cdn.jsdelivr.net/npm/flv.js@latest/dist/flv.min.js")
    ) : new Promise((i) => {
      i({});
    }), this.promise.then(this._create);
  }
  canPlayType(t) {
    return V && (t === "video/x-flv" || t === "video/flv");
  }
  load() {
    this.#t.unload(), this.#t.detachMediaElement(), this.#t.attachMediaElement(this.element), this.#t.load();
    const t = u("loadedmetadata");
    this.element.dispatchEvent(t), this.#e || (this.#e = flvjs.Events, Object.keys(this.#e).forEach((e) => {
      this.#t.on(
        this.#e[e],
        (...s) => this._assign(this.#e[e], s)
      );
    }));
  }
  destroy() {
    this.#t.destroy(), this.#t = null;
  }
  set src(t) {
    U(t) && (this.destroy(), this._create());
  }
  get levels() {
    const t = [];
    return this.#t && this.#t.levels && this.#t.levels.length && Object.keys(this.#t.levels).forEach((e) => {
      const { height: s, name: i } = this.#t.levels[e], n = {
        height: s,
        id: e,
        label: i || null
      };
      t.push(n);
    }), t;
  }
  set level(t) {
    this.#t.currentLevel = t;
  }
  get level() {
    return this.#t ? this.#t.currentLevel : "-1";
  }
  _create() {
    const { configs: t, ...e } = this.#i || {};
    flvjs.LoggingControl.enableDebug = e?.debug || !1, flvjs.LoggingControl.enableVerbose = e?.debug || !1;
    const s = { ...e, type: "flv", url: this.media.src };
    this.#t = flvjs.createPlayer(s, t || {}), this.instance = this.#t, this.#e || (this.#e = flvjs.Events, Object.keys(this.#e).forEach((i) => {
      this.#t.on(
        this.#e[i],
        (...n) => this._assign(this.#e[i], n)
      );
    }));
  }
  // @see https://github.com/bilibili/flv.js/blob/master/docs/api.md#flvjsevents
  // @see https://github.com/bilibili/flv.js/blob/master/docs/api.md#flvjserrortypes
  // @see https://github.com/bilibili/flv.js/blob/master/docs/api.md#flvjserrordetails
  _assign(t, e) {
    if (t === "error") {
      const s = {
        detail: {
          data: e,
          message: `${e[0]}: ${e[1]} ${e[2].msg}`,
          type: "FLV"
        }
      }, i = u("playererror", s);
      this.element.dispatchEvent(i);
    } else {
      const s = u(t, { detail: { data: e } });
      this.element.dispatchEvent(s);
    }
  }
}
class ht extends B {
  #t;
  // @see https://github.com/video-dev/hls.js/blob/master/src/events.js
  #e = {};
  #i = 0;
  #s = 0;
  // @see https://github.com/video-dev/hls.js/blob/master/docs/API.md#fine-tuning
  #n;
  #o;
  constructor(t, e, s, i) {
    super(t, e), this.#n = i || {}, this.element = t, this.media = e, this.#o = s, this._create = this._create.bind(this), this._play = this._play.bind(this), this._pause = this._pause.bind(this), this._assign = this._assign.bind(this), this.promise = typeof Hls > "u" ? (
      // Ever-green script
      D("https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js")
    ) : new Promise((n) => {
      n({});
    }), this.promise.then(this._create);
  }
  canPlayType(t) {
    return X() && t === "application/x-mpegURL";
  }
  load() {
    this.#t && (this.#t.detachMedia(), this.#t.loadSource(this.media.src), this.#t.attachMedia(this.element));
    const t = u("loadedmetadata");
    this.element.dispatchEvent(t), this.#e || (this.#e = Hls.Events, Object.keys(this.#e).forEach((e) => {
      this.#t.on(
        this.#e[e],
        (...s) => this._assign(this.#e[e], s)
      );
    }));
  }
  destroy() {
    this.#t && this.#t.stopLoad(), this.#e && Object.keys(this.#e).forEach((t) => {
      this.#t.off(
        this.#e[t],
        (...e) => this._assign(this.#e[t], e)
      );
    }), this.element.removeEventListener("play", this._play), this.element.removeEventListener("pause", this._pause), this.#t && (this.#t.destroy(), this.#t = null);
  }
  set src(t) {
    F(t) && (this.destroy(), this.#t = new Hls(this.#n), this.#t.loadSource(t.src), this.#t.attachMedia(this.element), this.#e = Hls.Events, Object.keys(this.#e).forEach((e) => {
      this.#t.on(
        this.#e[e],
        (...s) => this._assign(this.#e[e], s)
      );
    }));
  }
  get levels() {
    const t = [];
    return this.#t && this.#t.levels && this.#t.levels.length && Object.keys(this.#t.levels).forEach((e) => {
      const { height: s, name: i } = this.#t.levels[e], n = {
        height: s,
        id: e,
        label: i || null
      };
      t.push(n);
    }), t;
  }
  set level(t) {
    this.#t.currentLevel = t;
  }
  get level() {
    return this.#t ? this.#t.currentLevel : "-1";
  }
  _create() {
    const t = !!(this.element.preload === "auto" || this.#o);
    this.#n.autoStartLoad = t, this.#t = new Hls(this.#n), this.instance = this.#t, this.#e = Hls.Events, Object.keys(this.#e).forEach((e) => {
      this.#t.on(
        this.#e[e],
        (...s) => this._assign(this.#e[e], s)
      );
    }), t || (this.element.addEventListener("play", this._play, h), this.element.addEventListener("pause", this._pause, h));
  }
  // @see https://github.com/video-dev/hls.js/blob/master/src/events.js
  // @see https://github.com/video-dev/hls.js/blob/master/src/errors.js
  // @see https://github.com/video-dev/hls.js/blob/master/docs/API.md#runtime-events
  // @see https://github.com/video-dev/hls.js/blob/master/docs/API.md#errors
  _assign(t, e) {
    if (t === "hlsError") {
      const s = {
        detail: {
          data: e,
          message: e[1].details,
          type: "HLS"
        }
      }, i = u("playererror", s);
      this.element.dispatchEvent(i);
      const n = e[1].type, { fatal: a } = e[1], o = e[1];
      if (a)
        switch (n) {
          case "mediaError":
            const l = (/* @__PURE__ */ new Date()).getTime();
            if (!this.#i || l - this.#i > 3e3)
              this.#i = (/* @__PURE__ */ new Date()).getTime(), this.#t.recoverMediaError();
            else if (!this.#s || l - this.#s > 3e3)
              this.#s = (/* @__PURE__ */ new Date()).getTime(), console.warn("Attempting to swap Audio Codec and recover from media error"), this.#t.swapAudioCodec(), this.#t.recoverMediaError();
            else {
              console.error("Cannot recover, last media error recovery failed");
              const m = u(n, { detail: { data: o } });
              this.element.dispatchEvent(m);
            }
            break;
          case "networkError":
            console.error("Network error");
            const f = u(n, { detail: { data: o } });
            this.element.dispatchEvent(f);
            break;
          default:
            this.#t.destroy();
            const r = u(n, { detail: { data: o } });
            this.element.dispatchEvent(r);
            break;
        }
      else {
        const l = u(n, { detail: { data: o } });
        this.element.dispatchEvent(l);
      }
    } else {
      const s = e[1];
      if (t === "hlsLevelLoaded" && s.live === !0) {
        this.element.setAttribute("op-live__enabled", "true");
        const n = u("timeupdate");
        this.element.dispatchEvent(n);
      } else if (t === "hlsLevelUpdated" && s.live === !0 && s.totalduration > K) {
        this.element.setAttribute("op-dvr__enabled", "true");
        const n = u("timeupdate");
        this.element.dispatchEvent(n);
      } else if (t === "hlsFragParsingMetadata") {
        const n = u("metadataready", { detail: { data: e[1] } });
        this.element.dispatchEvent(n);
      }
      const i = u(t, { detail: { data: e[1] } });
      this.element.dispatchEvent(i);
    }
  }
  _play() {
    this.#t && this.#t.startLoad();
  }
  _pause() {
    this.#t && this.#t.stopLoad();
  }
}
class x extends B {
  #t;
  #e = [];
  #i = !1;
  #s = 0;
  #n = !1;
  #o;
  constructor(t, e) {
    if (super(t, e), !y(t) && !k(t))
      throw new TypeError("Native method only supports video/audio tags");
    this._clearTimeout = this._clearTimeout.bind(this), this._setTimeout = this._setTimeout.bind(this), this._dispatchError = this._dispatchError.bind(this), this._isDvrEnabled = this._isDvrEnabled.bind(this), this._readMediadataInfo = this._readMediadataInfo.bind(this), this.#i = F(e), this.element.addEventListener("playing", this._clearTimeout, h), this.element.addEventListener("stalled", this._setTimeout, h), this.element.addEventListener("error", this._dispatchError, h), this.element.addEventListener("loadeddata", this._isDvrEnabled, h), this.element.textTracks.addEventListener("addtrack", this._readMediadataInfo, h);
  }
  canPlayType(t) {
    return !!this.element.canPlayType(t).replace("no", "");
  }
  load() {
    this.element.load();
  }
  destroy() {
    this.element.removeEventListener("playing", this._clearTimeout), this.element.removeEventListener("stalled", this._setTimeout), this.element.removeEventListener("error", this._dispatchError), this.element.removeEventListener("loadeddata", this._isDvrEnabled), this.element.textTracks.removeEventListener("addtrack", this._readMediadataInfo);
  }
  get levels() {
    if (!this.#e.length) {
      const t = this.element.querySelectorAll("source[title]");
      for (let e = 0, s = t.length; e < s; ++e) {
        const i = {
          height: 0,
          id: `${e}`,
          label: t[e].getAttribute("title") || ""
        };
        this.#e.push(i);
      }
    }
    return this.#e;
  }
  set level(t) {
    const e = this.#e.findIndex((s) => s.id === t);
    if (e > -1) {
      this.#t = this.levels[e];
      const s = this.element.querySelectorAll("source[title]");
      for (let i = 0, n = s.length; i < n; ++i) {
        const a = s[i].getAttribute("src");
        a && parseInt(this.#t.id, 10) === i && (this.element.src = a);
      }
    }
  }
  get level() {
    return this.#t?.id || "-1";
  }
  set src(t) {
    this.element.src = t.src;
  }
  _isDvrEnabled() {
    const t = this.element.seekable.end(this.element.seekable.length - 1) - this.element.seekable.start(0);
    if (this.#i && t > K && !this.element.getAttribute("op-dvr__enabled")) {
      this.element.setAttribute("op-dvr__enabled", "true");
      const e = u("timeupdate");
      this.element.dispatchEvent(e);
    }
  }
  _readMediadataInfo(t) {
    const e = t;
    e?.track?.kind === "metadata" && (e.track.mode = "hidden", e.track.addEventListener(
      "cuechange",
      (s) => {
        const i = s.target, n = i.activeCues ? i.activeCues[0] : null;
        if (n) {
          const a = u("metadataready", { detail: n });
          this.element.dispatchEvent(a);
        }
      },
      h
    ));
  }
  _setTimeout() {
    !this.#n && window !== void 0 && (this.#n = !0, this.#o = window.setInterval(() => {
      if (this.#s >= 30) {
        clearInterval(this.#o);
        const t = "Media download failed part-way due to a network error", s = u("playererror", {
          detail: {
            data: { message: t, error: 2 },
            message: t,
            type: "HTML5"
          }
        });
        this.element.dispatchEvent(s), this.#s = 0, this.#n = !1;
      } else
        this.#s++;
    }, 1e3));
  }
  _clearTimeout() {
    this.#o && (clearInterval(this.#o), this.#s = 0, this.#n = !1);
  }
  _dispatchError(t) {
    let e;
    const i = t.target?.error;
    switch (i?.code) {
      case i?.MEDIA_ERR_ABORTED:
        e = "Media playback aborted";
        break;
      case i?.MEDIA_ERR_NETWORK:
        e = "Media download failed part-way due to a network error";
        break;
      case i?.MEDIA_ERR_DECODE:
        e = `Media playback aborted due to a corruption problem or because the
                    media used features your browser did not support.`;
        break;
      case i?.MEDIA_ERR_SRC_NOT_SUPPORTED:
        e = `Media could not be loaded, either because the server or network failed
                    or because the format is not supported.`;
        break;
      default:
        e = "Unknown error occurred.";
        break;
    }
    const n = {
      detail: {
        data: { ...t, message: e, error: i?.code },
        message: e,
        type: "HTML5"
      }
    }, a = u("playererror", n);
    this.element.dispatchEvent(a);
  }
}
class R {
  #t;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #e;
  #i;
  #s;
  #n;
  #o;
  #r = !1;
  #h = {
    media: {},
    optionsKey: {},
    rules: []
  };
  #d;
  constructor(t, e, s, i) {
    this.#t = t, this.#n = e, this.#i = this._getMediaFiles(), this.#h = i, this.#o = s;
  }
  canPlayType(t) {
    return this.#e.canPlayType(t);
  }
  async load() {
    if (!this.#r) {
      if (this.#r = !0, !this.#i.length)
        throw new TypeError("Media not set");
      this.#e && typeof this.#e.destroy == "function" && (this.#i.length === 1 && this.#i[0].src === this.#e.media.src || this.#e.destroy()), this.#i.some((t) => {
        try {
          this.#e = this._invoke(t);
        } catch {
          this.#e = new x(this.#t, t);
        }
        return this.#e.canPlayType(t.type);
      });
      try {
        if (this.#e === null)
          throw new TypeError("Media cannot be played with any valid media type");
        await this.#e.promise, this.#e.load();
      } catch (t) {
        throw this.#e && this.#e.destroy(), t;
      }
    }
  }
  // @see https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
  async play() {
    return this.#r ? await this.#e.promise : (await this.load(), this.#r = !1), this.#s = this.#e.play(), this.#s;
  }
  // @see https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
  async pause() {
    this.#s !== void 0 && await this.#s, this.#e.pause();
  }
  destroy() {
    this.#e && this.#e.destroy();
  }
  set src(t) {
    if (typeof t == "string" ? this.#i.push({
      src: t,
      type: N(t, this.#t)
    }) : Array.isArray(t) ? this.#i = t : typeof t == "object" && this.#i.push(t), this.#i = this.#i.filter((e) => e.src), this.#i.length > 0) {
      const [e] = this.#i;
      this.#t.src && this.#t.setAttribute("data-op-file", this.#i[0].src), this.#t.src = e.src, this.#d = e, this.#e && (this.#e.src = e);
    } else
      this.#t.src = "";
  }
  get src() {
    return this.#i;
  }
  get current() {
    return this.#d;
  }
  set mediaFiles(t) {
    this.#i = t;
  }
  get mediaFiles() {
    return this.#i;
  }
  set volume(t) {
    this.#e && (this.#e.volume = t);
  }
  get volume() {
    return this.#e ? this.#e.volume : this.#t.volume;
  }
  set muted(t) {
    this.#e && (this.#e.muted = t);
  }
  get muted() {
    return this.#e ? this.#e.muted : this.#t.muted;
  }
  set playbackRate(t) {
    this.#e && (this.#e.playbackRate = t);
  }
  get playbackRate() {
    return this.#e ? this.#e.playbackRate : this.#t.playbackRate;
  }
  set defaultPlaybackRate(t) {
    this.#e && (this.#e.defaultPlaybackRate = t);
  }
  get defaultPlaybackRate() {
    return this.#e ? this.#e.defaultPlaybackRate : this.#t.defaultPlaybackRate;
  }
  set currentTime(t) {
    this.#e && (this.#e.currentTime = t);
  }
  get currentTime() {
    return this.#e ? this.#e.currentTime : this.#t.currentTime;
  }
  get duration() {
    const t = this.#e ? this.#e.duration : this.#t.duration;
    return t === 1 / 0 && this.#t.seekable && this.#t.seekable.length ? this.#t.seekable.end(0) : t;
  }
  get paused() {
    return this.#e ? this.#e.paused : this.#t.paused;
  }
  get ended() {
    return this.#e ? this.#e.ended : this.#t.ended;
  }
  set loaded(t) {
    this.#r = t;
  }
  get loaded() {
    return this.#r;
  }
  set level(t) {
    this.#e && (this.#e.level = t);
  }
  get level() {
    return this.#e ? this.#e.level : -1;
  }
  get levels() {
    return this.#e ? this.#e.levels : [];
  }
  get instance() {
    return this.#e ? this.#e.instance : null;
  }
  _getMediaFiles() {
    const t = [], e = this.#t.querySelectorAll("source"), s = this.#t.src;
    s && t.push({
      src: s,
      type: this.#t.getAttribute("type") || N(s, this.#t)
    });
    for (let i = 0, n = e.length; i < n; i++) {
      const a = e[i], { src: o } = a;
      if (t.push({
        src: o,
        type: a.getAttribute("type") || N(o, this.#t)
      }), i === 0) {
        const [l] = t;
        this.#d = l;
      }
    }
    return t.length || t.push({
      src: "",
      type: N("", this.#t)
    }), t;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _invoke(t) {
    const e = this.#t.canPlayType("application/vnd.apple.mpegurl") || this.#t.canPlayType("application/x-mpegURL");
    this.#d = t;
    const { layers: s } = this.#n.controls || {};
    let i = !1;
    if (s && Object.keys(s).forEach((n) => {
      const a = s ? s[n] : null;
      a && a.indexOf("levels") > -1 && (i = !0);
    }), Object.keys(this.#h.media).length) {
      let n;
      return this.#h.rules.forEach((a) => {
        const o = a(t.src);
        if (o) {
          const l = this.#h.media[o], p = this.#n[this.#h.optionsKey[o]] || void 0;
          n = l(this.#t, t, this.#o, p);
        }
      }), n ? (n.create(), n) : new x(this.#t, t);
    }
    if (F(t)) {
      if (e && this.#n.forceNative && !i)
        return new x(this.#t, t);
      const n = this.#n?.hls || void 0;
      return new ht(this.#t, t, this.#o, n);
    }
    if (j(t)) {
      const n = this.#n?.dash || void 0;
      return new rt(this.#t, t, n);
    }
    if (U(t)) {
      const n = this.#n?.flv || {
        debug: !1,
        type: "flv",
        url: t.src
      };
      return new lt(this.#t, t, n);
    }
    return new x(this.#t, t);
  }
}
class $ {
  constructor(t, e, s, i, n) {
    this.loadedAd = !1, this.#t = !1, this.#e = !1, this.#i = !1, this.#s = !1, this.#n = 0, this.#r = !1, this.#h = 0, this.#d = 0, this.#l = null, this.#g = [], this.#w = !1, this.#C = !1, this.#E = !1, this.#L = 0, this.#M = 0, this.#P = [], this.#I = !1, this.#k = null;
    const a = {
      autoPlayAdBreaks: !0,
      customClick: {
        enabled: !1,
        label: "Click here for more info"
      },
      audioSkip: {
        enabled: !0,
        label: "Skip Ad",
        remainingLabel: "Skip in [[secs]] seconds"
      },
      debug: !1,
      enablePreloading: !1,
      language: "en",
      loop: !1,
      numRedirects: 4,
      publisherId: void 0,
      sdkPath: "https://imasdk.googleapis.com/js/sdkloader/ima3.js",
      sessionId: void 0,
      src: [],
      vpaidMode: "enabled"
    };
    this.#f = t, this.#p = e, this.#u = t.getMedia(), this.#a = t.getElement(), this.#w = s || !1, this.#r = t.getElement().muted, this.#C = i || !1, this.#c = { ...a, ...n }, n?.customClick && Object.keys(n.customClick).length && (this.#c.customClick = { ...a.customClick, ...n.customClick }), this.#E = !1, this.#O = this.#a.volume, this.#o = this.#O;
    const o = this.#c?.debug ? this.#c?.sdkPath?.replace(/(\.js$)/, "_debug.js") : this.#c?.sdkPath;
    this.load = this.load.bind(this), this.resizeAds = this.resizeAds.bind(this), this._handleClickInContainer = this._handleClickInContainer.bind(this), this._handleSkipAds = this._handleSkipAds.bind(this), this._loaded = this._loaded.bind(this), this._error = this._error.bind(this), this._assign = this._assign.bind(this), this._contentLoadedAction = this._contentLoadedAction.bind(this), this._loadedMetadataHandler = this._loadedMetadataHandler.bind(this), this._contentEndedListener = this._contentEndedListener.bind(this), this._handleResizeAds = this._handleResizeAds.bind(this), this._onContentPauseRequested = this._onContentPauseRequested.bind(this), this._onContentResumeRequested = this._onContentResumeRequested.bind(this), this.#_ = o && (typeof google > "u" || typeof google.ima > "u") ? D(o) : new Promise((l) => {
      l();
    }), this.#_.then(() => {
      this.load();
    }).catch((l) => {
      let p = "Ad script could not be loaded; please check if you have an AdBlock ";
      p += "turned on, or if you provided a valid URL is correct", console.error(`Ad error: ${p}.`);
      const r = u("playererror", {
        detail: {
          data: l,
          message: p,
          type: "Ads"
        }
      });
      this.#a.dispatchEvent(r);
    });
  }
  #t;
  #e;
  #i;
  #s;
  #n;
  #o;
  #r;
  #h;
  #d;
  #l;
  #f;
  #u;
  #a;
  #g;
  #p;
  #_;
  // @see https://tinyurl.com/ycwp4ufd
  #b;
  #v;
  #A;
  #m;
  // @see https://tinyurl.com/ya3zksso
  #T;
  // @see https://tinyurl.com/ya8bxjf4
  #y;
  #w;
  #C;
  #E;
  #c;
  #L;
  #O;
  #S;
  #M;
  #P;
  #I;
  #k;
  load(t = !1) {
    if (typeof google > "u" || !google.ima || !t && this.loadedAd && this.#c.autoPlayAdBreaks || !this.#c.autoPlayAdBreaks && !t)
      return;
    this.loadedAd = !0;
    const e = this.#f.getContainer().querySelector(".op-ads");
    if (e && e.parentNode && e.parentNode.removeChild(e), this.#s = !0, this.#v = document.createElement("div"), this.#v.className = "op-ads", this.#v.tabIndex = -1, this.#a.parentElement && this.#a.parentElement.insertBefore(this.#v, this.#a.nextSibling), this.#v.addEventListener("click", this._handleClickInContainer), this.#c.customClick?.enabled && (this.#A = document.createElement("div"), this.#A.className = "op-ads__click-container", this.#A.innerHTML = `<div class="op-ads__click-label">${this.#c.customClick.label}</div>`, this.#a.parentElement && this.#a.parentElement.insertBefore(this.#A, this.#a.nextSibling)), y(this.#a) && this.#c.audioSkip?.enabled) {
      if (this.#c.audioSkip?.element) {
        const { element: i } = this.#c.audioSkip || {};
        if (typeof i == "string") {
          const n = document.getElementById(i);
          n && (this.#m = n);
        } else
          i instanceof HTMLElement && (this.#m = i);
      } else
        this.#m = document.createElement("button"), this.#m.className = "op-ads__skip hidden", this.#f.getControls().getContainer().appendChild(this.#m);
      this.#m && this.#m.addEventListener("click", this._handleSkipAds, h);
    }
    this.#P = this.#u.src;
    const s = {
      disabled: google.ima.ImaSdkSettings.VpaidMode.DISABLED,
      enabled: google.ima.ImaSdkSettings.VpaidMode.ENABLED,
      insecure: google.ima.ImaSdkSettings.VpaidMode.INSECURE
    };
    google.ima.settings.setVpaidMode(s[this.#c.vpaidMode || "enabled"]), google.ima.settings.setDisableCustomPlaybackForIOS10Plus(!0), google.ima.settings.setAutoPlayAdBreaks(this.#c.autoPlayAdBreaks), google.ima.settings.setNumRedirects(this.#c.numRedirects), google.ima.settings.setLocale(this.#c.language), this.#c.sessionId && google.ima.settings.setSessionId(this.#c.sessionId), this.#c.publisherId && google.ima.settings.setPpid(this.#c.publisherId), google.ima.settings.setPlayerType("openplayerjs"), google.ima.settings.setPlayerVersion("3.0.0"), this.#T = new google.ima.AdDisplayContainer(
      this.#v,
      this.#a,
      this.#A
    ), this.#b = new google.ima.AdsLoader(this.#T), this.#b.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      this._loaded,
      h
    ), this.#b.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._error, h), typeof window < "u" && window.addEventListener("resize", this._handleResizeAds, h), this.#a.addEventListener("loadedmetadata", this._handleResizeAds, h), (this.#w === !0 || this.#C === !0 || t === !0 || this.#c.enablePreloading === !0 || this.#E === !0) && (this.#e || (this.#e = !0, this.#T.initialize()), this._requestAds());
  }
  async play() {
    if (!this.#e) {
      this.#E = !0, this._initNotDoneAds();
      return;
    }
    if (this.#l)
      try {
        !this.#n && this.#i === !1 ? this.#l.start() : this.#l.resume(), this.#i = !0;
        const t = u("play");
        this.#a.dispatchEvent(t);
      } catch {
        this._resumeMedia();
      }
  }
  pause() {
    if (this.#l) {
      this.#i = !1, this.#l.pause();
      const t = u("pause");
      this.#a.dispatchEvent(t);
    }
  }
  destroy() {
    this.#l && (this.#l.removeEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._error), this.#g && this.#g.forEach((i) => {
      this.#l.removeEventListener(i, this._assign);
    })), this.#g = [];
    const t = this.#f.getControls(), e = t ? t.events.mouse : {};
    Object.keys(e).forEach((i) => {
      this.#v && this.#v.removeEventListener(i, e[i]);
    }), this.#b && (this.#b.removeEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, this._error), this.#b.removeEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, this._loaded));
    const s = !Array.isArray(this.#p) || this.#L > this.#p.length;
    this.#l && s && this.#l.destroy(), this.#c.customClick?.enabled && this.#A && this.#A.remove(), this.#c.audioSkip?.enabled && this.#m && (this.#m.removeEventListener("click", this._handleSkipAds), this.#m.remove()), (A || _) && this.#a.removeEventListener("loadedmetadata", this._contentLoadedAction), this.#a.removeEventListener("loadedmetadata", this._handleResizeAds), this.#a.removeEventListener("loadedmetadata", this._loadedMetadataHandler), this.#a.removeEventListener("ended", this._contentEndedListener), typeof window < "u" && window.removeEventListener("resize", this._handleResizeAds), this.#v && (this.#v.removeEventListener("click", this._handleClickInContainer), this.#v.remove()), this.loadPromise = null, this.loadedAd = !1, this.#e = !1, this.#E = !1, this.#h = 0, this.#d = 0, this.#k = null;
  }
  resizeAds(t, e) {
    if (this.#l) {
      const s = this.#a, i = s.getAttribute("data-fullscreen") === "true" ? google.ima.ViewMode.FULLSCREEN : google.ima.ViewMode.NORMAL;
      let n = t;
      const a = t ? t.toString() : "";
      t && a.indexOf("%") > -1 && this.#a.parentElement && (n = this.#a.parentElement.offsetWidth * (parseInt(a, 10) / 100));
      let o = e;
      const l = e ? e.toString() : "";
      e && l.indexOf("%") > -1 && this.#a.parentElement && (o = this.#a.parentElement.offsetHeight * (parseInt(l, 10) / 100));
      let p;
      p && typeof window < "u" && window.cancelAnimationFrame(p), typeof window < "u" && (p = window.requestAnimationFrame(() => {
        this.#l.resize(
          n || s.offsetWidth,
          o || s.offsetHeight,
          i
        );
      }));
    }
  }
  getAdsManager() {
    return this.#l;
  }
  getAdsLoader() {
    return this.#b;
  }
  started() {
    return this.#s;
  }
  set src(t) {
    this.#p = t;
  }
  set isDone(t) {
    this.#e = t;
  }
  set playRequested(t) {
    this.#E = t;
  }
  set volume(t) {
    this.#l && (this.#o = t, this.#l.setVolume(t), this._setMediaVolume(t), this.#r = t === 0);
  }
  get volume() {
    return this.#l ? this.#l.getVolume() : this.#O;
  }
  set muted(t) {
    this.#l && (t ? (this.#l.setVolume(0), this.#r = !0, this._setMediaVolume(0)) : (this.#l.setVolume(this.#o), this.#r = !1, this._setMediaVolume(this.#o)));
  }
  get muted() {
    return this.#r;
  }
  set currentTime(t) {
    this.#d = t;
  }
  get currentTime() {
    return this.#d;
  }
  get duration() {
    return this.#h;
  }
  get paused() {
    return !this.#i;
  }
  get ended() {
    return this.#t;
  }
  _assign(t) {
    const e = t.getAd();
    switch (e && (this.#k = e), t.type) {
      case google.ima.AdEvent.Type.LOADED:
        if (!e.isLinear())
          this._onContentResumeRequested();
        else if (P && k(this.#a) && (this.#a.controls = !1), this.#h = e.getDuration(), this.#d = e.getDuration(), !this.#I && !A && !_) {
          const a = u("waiting");
          this.#a.dispatchEvent(a);
          const o = u("loadedmetadata");
          this.#a.dispatchEvent(o), this.resizeAds();
        }
        break;
      case google.ima.AdEvent.Type.STARTED:
        if (e.isLinear()) {
          this.#a.parentElement && !this.#a.parentElement.classList.contains("op-ads--active") && this.#a.parentElement.classList.add("op-ads--active"), this.#u.paused || this.#u.pause(), this.#i = !0;
          const a = u("play");
          this.#a.dispatchEvent(a);
          let o;
          if (o || (this.resizeAds(), o = !0), this.#u.ended) {
            this.#t = !1;
            const l = u("adsmediaended");
            this.#a.dispatchEvent(l);
          }
          typeof window < "u" && (this.#n = window.setInterval(() => {
            if (this.#i === !0) {
              this.#d = Math.round(this.#l.getRemainingTime());
              const l = u("timeupdate");
              this.#a.dispatchEvent(l);
            }
          }, 350));
        }
        break;
      case google.ima.AdEvent.Type.COMPLETE:
      case google.ima.AdEvent.Type.SKIPPED:
        if (e.isLinear()) {
          if (t.type === google.ima.AdEvent.Type.SKIPPED) {
            const a = u("adsskipped");
            this.#a.dispatchEvent(a);
          }
          this.#a.parentElement && this.#a.parentElement.classList.remove("op-ads--active"), this.#i = !1, clearInterval(this.#n);
        }
        break;
      case google.ima.AdEvent.Type.VOLUME_CHANGED:
        this._setMediaVolume(this.volume);
        break;
      case google.ima.AdEvent.Type.VOLUME_MUTED:
        if (e.isLinear()) {
          const a = u("volumechange");
          this.#a.dispatchEvent(a);
        }
        break;
      case google.ima.AdEvent.Type.ALL_ADS_COMPLETED:
        if (e.isLinear() && (this.#i = !1, this.#t = !0, this.#n = 0, this.#r = !1, this.#s = !1, this.#k = null, this.#a.parentElement && this.#a.parentElement.classList.remove("op-ads--active"), this.destroy(), this.#a.currentTime >= this.#a.duration)) {
          const a = u("ended");
          this.#a.dispatchEvent(a);
        }
        break;
      case google.ima.AdEvent.Type.CLICK:
        const s = u("pause");
        this.#a.dispatchEvent(s);
        break;
      case google.ima.AdEvent.Type.AD_BREAK_READY:
        this.#c.autoPlayAdBreaks || this.play();
        break;
      case google.ima.AdEvent.Type.AD_PROGRESS:
        const i = t.getAdData(), n = this.#k ? this.#k.getSkipTimeOffset() : -1;
        if (this.#m)
          if (n !== -1) {
            const a = this.#l.getAdSkippableState(), o = Math.ceil(n - i.currentTime);
            this.#m.classList.remove("hidden"), a ? (this.#m.textContent = this.#c.audioSkip?.label || "", this.#m.classList.remove("disabled")) : (this.#m.textContent = this.#c.audioSkip?.remainingLabel.replace("[[secs]]", o.toString()) || "", this.#m.classList.add("disabled"));
          } else
            this.#m.classList.add("hidden");
        break;
    }
    if (t.type === google.ima.AdEvent.Type.LOG) {
      const s = t.getAdData();
      if (s.adError) {
        const i = s.adError.getMessage();
        console.warn(`Ad warning: Non-fatal error occurred: ${i}`);
        const n = {
          detail: {
            data: s.adError,
            message: i,
            type: "Ads"
          }
        }, a = u("playererror", n);
        this.#a.dispatchEvent(a);
      }
    } else {
      const s = u(`ads${t.type}`);
      this.#a.dispatchEvent(s);
    }
  }
  // @see https://developers.google.com/interactive-media-ads/docs/sdks/html5/v3/apis#ima.AdError.ErrorCode
  _error(t) {
    const e = t.getError(), s = {
      detail: {
        data: e,
        message: e.toString(),
        type: "Ads"
      }
    }, i = u("playererror", s);
    this.#a.dispatchEvent(i);
    const n = [
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
    Array.isArray(this.#p) && this.#p.length > 1 && this.#L < this.#p.length - 1 ? (this.#L++, this.destroy(), this.#s = !0, this.#E = !0, this.load(!0), console.warn(`Ad warning: ${e.toString()}`)) : (n.indexOf(e.getErrorCode()) > -1 ? (this.#l && this.#l.destroy(), console.error(`Ad error: ${e.toString()}`)) : console.warn(`Ad warning: ${e.toString()}`), this.#k = null, (this.#w === !0 || this.#C === !0 || this.#s === !0) && (this.#i = !1, this._resumeMedia()));
  }
  _loaded(t) {
    const e = new google.ima.AdsRenderingSettings();
    e.restoreCustomPlaybackStateOnAdBreakComplete = !1, e.enablePreloading = this.#c.enablePreloading, this.#l = t.getAdsManager(this.#a, e), this._start(this.#l), this.loadPromise = new Promise((s) => {
      s();
    });
  }
  _start(t) {
    this.#A && t.isCustomClickTrackingUsed() && this.#A.classList.add("op-ads__click-container--visible"), t.addEventListener(
      google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
      this._onContentPauseRequested,
      h
    ), t.addEventListener(
      google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      this._onContentResumeRequested,
      h
    ), this.#g = [
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
    ], this.#c.autoPlayAdBreaks || this.#g.push(google.ima.AdEvent.Type.AD_BREAK_READY);
    const e = this.#f.getControls(), s = e ? e.events.mouse : {};
    if (Object.keys(s).forEach((i) => {
      this.#v && this.#v.addEventListener(i, s[i], h);
    }), this.#g.forEach((i) => {
      t.addEventListener(i, this._assign, h);
    }), this.#w === !0 || this.#C === !0 || this.#E === !0) {
      if (this.#E = !1, !this.#e) {
        this._initNotDoneAds();
        return;
      }
      t.init(
        this.#a.offsetWidth,
        this.#a.offsetHeight,
        this.#a.parentElement && this.#a.parentElement.getAttribute("data-fullscreen") === "true" ? google.ima.ViewMode.FULLSCREEN : google.ima.ViewMode.NORMAL
      ), t.start();
      const i = u("play");
      this.#a.dispatchEvent(i);
    } else
      this.#c.enablePreloading === !0 && t.init(
        this.#a.offsetWidth,
        this.#a.offsetHeight,
        this.#a.parentElement && this.#a.parentElement.getAttribute("data-fullscreen") === "true" ? google.ima.ViewMode.FULLSCREEN : google.ima.ViewMode.NORMAL
      );
  }
  _initNotDoneAds() {
    this.#T ? (this.#e = !0, this.#T.initialize(), A || _ ? (this.#S = this._contentLoadedAction, this.#a.addEventListener("loadedmetadata", this._contentLoadedAction, h), this.#a.load()) : this._contentLoadedAction()) : (this.load(), this.loadedAd = !1);
  }
  _contentEndedListener() {
    this.#t = !0, this.#i = !1, this.#s = !1, this.#b.contentComplete();
  }
  _onContentPauseRequested() {
    this.#a.removeEventListener("ended", this._contentEndedListener), this.#M = this.#u.currentTime, this.#s ? this.#u.pause() : this.#s = !0;
    const t = u("play");
    this.#a.dispatchEvent(t);
  }
  _onContentResumeRequested() {
    if (this.#a.addEventListener("ended", this._contentEndedListener, h), this.#a.addEventListener("loadedmetadata", this._loadedMetadataHandler, h), A || _)
      this.#u.src = this.#P, this.#u.load(), this._prepareMedia(), this.#a.parentElement && this.#a.parentElement.classList.add("op-ads--active");
    else {
      const t = u("loadedmetadata");
      this.#a.dispatchEvent(t);
    }
  }
  _loadedMetadataHandler() {
    Array.isArray(this.#p) ? (this.#L++, this.#L <= this.#p.length - 1 ? (this.#l && this.#l.destroy(), this.#b.contentComplete(), this.#E = !0, this.#s = !0, this.#e = !1, this.load(!0)) : (this.#c.autoPlayAdBreaks || this._resetAdsAfterManualBreak(), this._prepareMedia())) : this.#a.seekable.length ? this.#a.seekable.end(0) > this.#M && (this.#c.autoPlayAdBreaks || this._resetAdsAfterManualBreak(), this._prepareMedia()) : setTimeout(this._loadedMetadataHandler, 100);
  }
  _resumeMedia() {
    if (this.#n = 0, this.#r = !1, this.#s = !1, this.#h = 0, this.#d = 0, this.#a.parentElement && this.#a.parentElement.classList.remove("op-ads--active"), this.#u.ended) {
      const t = u("ended");
      this.#a.dispatchEvent(t);
    } else
      try {
        this.#u.play(), setTimeout(() => {
          const t = u("play");
          this.#a.dispatchEvent(t);
        }, 50);
      } catch (t) {
        console.error(t);
      }
  }
  _requestAds() {
    this.#y = new google.ima.AdsRequest();
    const t = Array.isArray(this.#p) ? this.#p[this.#L] : this.#p;
    Y(t) ? this.#y.adsResponse = t : this.#y.adTagUrl = t;
    const e = this.#a.parentElement ? this.#a.parentElement.offsetWidth : 0, s = this.#a.parentElement ? this.#a.parentElement.offsetHeight : 0;
    this.#y.linearAdSlotWidth = e, this.#y.linearAdSlotHeight = s, this.#y.nonLinearAdSlotWidth = e, this.#y.nonLinearAdSlotHeight = s / 3, this.#y.setAdWillAutoPlay(this.#w), this.#y.setAdWillPlayMuted(this.#C), this.#b.requestAds(this.#y);
  }
  /**
   * Internal callback to request Ads.
   *
   * @memberof Ads
   */
  _contentLoadedAction() {
    this.#S && (this.#a.removeEventListener("loadedmetadata", this.#S), this.#S = null), this._requestAds();
  }
  // @see https://developers.google.com/interactive-media-ads/docs/sdks/html5/faq#8
  _resetAdsAfterManualBreak() {
    this.#l && this.#l.destroy(), this.#b.contentComplete(), this.#e = !1, this.#E = !0;
  }
  _prepareMedia() {
    this.#u.currentTime = this.#M, this.#a.removeEventListener("loadedmetadata", this._loadedMetadataHandler), this._resumeMedia();
  }
  _setMediaVolume(t) {
    this.#u.volume = t, this.#u.muted = t === 0;
  }
  _handleClickInContainer() {
    if (this.#u.paused) {
      const t = u("paused");
      this.#a.dispatchEvent(t), this.pause();
    }
  }
  _handleResizeAds() {
    this.resizeAds();
  }
  _handleSkipAds() {
    this.#l.skip();
  }
}
class w {
  constructor(t, e) {
    this.proxy = null, this.#i = "", this.#r = {}, this.#h = !1, this.#l = !1, this.#f = !1, this.#u = !1, this.#g = [], this.#_ = {
      controls: {
        alwaysVisible: !1,
        layers: {
          left: ["play", "time", "volume"],
          middle: ["progress"],
          right: ["captions", "settings", "fullscreen"]
        }
      },
      defaultLevel: void 0,
      detachMenus: !1,
      forceNative: !0,
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
        showLabel: !0,
        showProgress: !1
      },
      media: {
        pauseOnClick: !1
      },
      mode: "responsive",
      // or `fill` or `fit`
      onError: (s) => console.error(s),
      pauseOthers: !0,
      progress: {
        allowRewind: !0,
        allowSkip: !0,
        duration: 0,
        showCurrentTimeOnly: !1
      },
      showLoaderOnInit: !1,
      startTime: 0,
      startVolume: 1,
      step: 0,
      useDeviceVolume: !0,
      width: 0
    }, this.#s = t instanceof HTMLMediaElement ? t : document.getElementById(t), this.#s && (this.#h = this.#s.autoplay || !1, typeof e != "string" && !Array.isArray(e) && this._mergeOptions(e), this.#s.volume = this.#a.startVolume || 1, this.#a.ads && this.#a.ads.src && (this.#n = this.#a.ads.src), (this.#a?.startTime || 0) > 0 && (this.#s.currentTime = this.#a.startTime || 0), this.#d = this.#s.volume), this._autoplay = this._autoplay.bind(this), this._enableKeyBindings = this._enableKeyBindings.bind(this);
  }
  static {
    this.instances = {};
  }
  static {
    this.customMedia = {
      media: {},
      optionsKey: {},
      rules: []
    };
  }
  static init() {
    w.instances = {};
    const t = document.querySelectorAll("video.op-player, audio.op-player");
    for (let e = 0, s = t.length; e < s; e++) {
      const i = t[e], n = i.getAttribute("data-op-settings"), a = n ? JSON.parse(n) : {};
      new w(i, a).init();
    }
  }
  static addMedia(t, e, s, i) {
    w.customMedia.media[e] = i, w.customMedia.optionsKey[e] = t, w.customMedia.rules.push(s);
  }
  #t;
  #e;
  #i;
  #s;
  #n;
  #o;
  #r;
  #h;
  #d;
  #l;
  #f;
  #u;
  #a;
  #g;
  #p;
  #_;
  async init() {
    this._isValid() && (this._wrapInstance(), await this._prepareMedia(), this._createPlayButton(), this._createUID(), this._createControls(), this._setEvents(), w.instances[this.id] = this);
  }
  async load() {
    return this.#o ? (this.#o.loaded = !1, this.isMedia() ? this.#o.load() : void 0) : (await this._prepareMedia(), this.#o.load());
  }
  async play() {
    return this.#o.loaded || (await this.#o.load(), this.#o.loaded = !0), this.#e ? (this.#e.playRequested = !0, await this.#e.loadPromise, this.#e.play()) : this.#o.play();
  }
  pause() {
    this.#e ? this.#e.pause() : this.#o.pause();
  }
  stop() {
    this.pause(), this.#o && (this.#o.currentTime = 0, this.src = [{ src: "", type: "video/mp4" }]);
  }
  destroy() {
    this.#e && (this.#e.pause(), this.#e.destroy()), this.#p && this.#p.destroy();
    const t = this.#s;
    this.#o && this.#o.destroy(), Object.keys(this.#r).forEach((i) => {
      t.removeEventListener(i, this.#r[i]);
    }), this.getContainer().removeEventListener("keydown", this._enableKeyBindings), this.#h && !this.#u && k(this.#s) && t.removeEventListener("canplay", this._autoplay), this.#t && this.#t.destroy(), k(this.#s) && (this.playBtn && this.playBtn.remove(), this.loader && this.loader.remove()), this.#a?.onError && this.#s.removeEventListener("playererror", this.#a.onError), t.controls = !0, t.setAttribute("id", this.#i), t.removeAttribute("op-live__enabled"), t.removeAttribute("op-dvr__enabled");
    const e = this.#a.mode === "fit" && !y(t) ? t.closest(".op-player__fit--wrapper") : t.parentElement;
    e && e.parentNode && e.parentNode.replaceChild(t, e), delete w.instances[this.#i];
    const s = u("playerdestroyed");
    t.dispatchEvent(s);
  }
  getContainer() {
    return this.#s.parentElement || this.#s;
  }
  getControls() {
    return this.#t;
  }
  getCustomControls() {
    return this.#g;
  }
  getElement() {
    return this.#s;
  }
  getEvents() {
    return this.#r;
  }
  getOptions() {
    return this.#a;
  }
  activeElement() {
    return this.#e && this.#e.started() ? this.#e : this.#o;
  }
  isMedia() {
    return this.activeElement() instanceof R;
  }
  isAd() {
    return this.activeElement() instanceof $;
  }
  getMedia() {
    return this.#o;
  }
  getAd() {
    return this.#e;
  }
  addCaptions(t) {
    if (t.default) {
      const n = this.#s.querySelectorAll("track");
      for (let a = 0, o = n.length; a < o; a++)
        n[a].default = !1;
    }
    const e = this.#s;
    let s = e.querySelector(`track[srclang="${t.srclang}"][kind="${t.kind}"]`);
    s ? (s.src = t.src, s.label = t.label, s.default = t.default || !1) : (s = document.createElement("track"), s.srclang = t.srclang, s.src = t.src, s.kind = t.kind, s.label = t.label, s.default = t.default || !1, e.appendChild(s));
    const i = u("controlschanged");
    e.dispatchEvent(i);
  }
  addControl(t) {
    t.custom = !0, t.type = "button", this.#g.push(t);
    const e = u("controlschanged");
    this.#s.dispatchEvent(e);
  }
  addElement(t) {
    t.custom = !0, this.#g.push(t);
    const e = u("controlschanged");
    this.#s.dispatchEvent(e);
  }
  removeControl(t) {
    this.#g.forEach((s, i) => {
      s.id === t && this.#g.splice(i, 1);
    });
    const e = u("controlschanged");
    this.#s.dispatchEvent(e);
  }
  async _prepareMedia() {
    try {
      this.#a?.onError && this.#s.addEventListener("playererror", this.#a.onError, h), this.#h && k(this.#s) && this.#s.addEventListener("canplay", this._autoplay, h), this.#o = new R(this.#s, this.#a, this.#h, w.customMedia);
      const t = this.#s.getAttribute("preload");
      if ((this.#n || !t || t !== "none") && (await this.#o.load(), this.#o.loaded = !0), !this.#h && this.#n) {
        const e = this.#a && this.#a.ads ? this.#a.ads : void 0;
        this.#e = new $(this, this.#n, !1, !1, e);
      }
    } catch (t) {
      console.error(t);
    }
  }
  enableDefaultPlayer() {
    let t = !0, e = 0;
    this.proxy && !this.proxy.paused && (t = !1, e = this.proxy.currentTime, this.proxy.pause()), this.proxy = this, this.getElement().addEventListener("loadedmetadata", () => {
      this.getMedia().currentTime = e, t || this.play();
    });
  }
  async loadAd(t) {
    try {
      if (this.isAd())
        this.getAd().destroy(), this.getAd().src = t, this.getAd().loadedAd = !1, this.getAd().load();
      else {
        const e = this.#a && this.#a.ads ? this.#a.ads : void 0, s = !this.activeElement().paused || this.#l;
        this.#e = new $(this, t, s, this.#f, e);
      }
    } catch (e) {
      console.error(e);
    }
  }
  set src(t) {
    this.#o instanceof R ? (this.#o.mediaFiles = [], this.#o.src = t) : typeof t == "string" ? this.#s.src = t : Array.isArray(t) ? t.forEach((e) => {
      const s = document.createElement("source");
      s.src = e.src, s.type = e.type || N(e.src, this.#s), this.#s.appendChild(s);
    }) : typeof t == "object" && (this.#s.src = t.src);
  }
  get src() {
    return this.#o.src;
  }
  get id() {
    return this.#i;
  }
  _isValid() {
    const t = this.#s;
    return !(!(t instanceof HTMLElement) || !y(t) && !k(t) || !t.classList.contains("op-player__media"));
  }
  _wrapInstance() {
    const t = document.createElement("div");
    t.className = "op-player op-player__keyboard--inactive", t.className += y(this.#s) ? " op-player__audio" : " op-player__video", t.tabIndex = 0, this.#s.classList.remove("op-player"), this.#s.parentElement && this.#s.parentElement.insertBefore(t, this.#s), t.appendChild(this.#s);
    const e = document.createElement("div");
    if (e.className = "op-status", e.innerHTML = "<span></span>", e.tabIndex = -1, e.setAttribute("aria-hidden", "true"), k(this.#s) && this.#s.parentElement && this.#s.parentElement.insertBefore(e, this.#s), t.addEventListener(
      "keydown",
      () => {
        t.classList.contains("op-player__keyboard--inactive") && t.classList.remove("op-player__keyboard--inactive");
      },
      h
    ), t.addEventListener(
      "click",
      () => {
        t.classList.contains("op-player__keyboard--inactive") || t.classList.add("op-player__keyboard--inactive");
      },
      h
    ), this.#a.mode === "fill" && !y(this.#s) && !P)
      this.getContainer().classList.add("op-player__full");
    else if (this.#a.mode === "fit" && !y(this.#s)) {
      const s = this.getContainer();
      if (s.parentElement) {
        const i = document.createElement("div");
        i.className = "op-player__fit--wrapper", i.tabIndex = 0, s.parentElement.insertBefore(i, s), i.appendChild(s), s.classList.add("op-player__fit");
      }
    } else {
      let s = "";
      if (this.#a.width) {
        const i = typeof this.#a.width == "number" ? `${this.#a.width}px` : this.#a.width;
        s += `width: ${i} !important;`;
      }
      if (this.#a.height) {
        const i = typeof this.#a.height == "number" ? `${this.#a.height}px` : this.#a.height;
        s += `height: ${i} !important;`;
      }
      s && t.setAttribute("style", s);
    }
  }
  _createControls() {
    P && k(this.#s) && this.getContainer().classList.add("op-player__ios--iphone"), this.#t = new ot(this), this.#t.create();
  }
  _createUID() {
    if (this.#s.id)
      this.#i = this.#s.id, this.#s.removeAttribute("id");
    else {
      const t = crypto, e = typeof t.getRandomBytes == "function" ? t.getRandomBytes : t.getRandomValues;
      this.#i = `op_${e(new Uint32Array(1))[0].toString(36).substr(2, 9)}`;
    }
    this.#s.parentElement && (this.#s.parentElement.id = this.#i);
  }
  _createPlayButton() {
    y(this.#s) || (this.playBtn = document.createElement("button"), this.playBtn.className = "op-player__play", this.playBtn.tabIndex = 0, this.playBtn.title = this.#a.labels?.play || "", this.playBtn.innerHTML = `<span>${this.#a.labels?.play || ""}</span>`, this.playBtn.setAttribute("aria-pressed", "false"), this.playBtn.setAttribute("aria-hidden", "false"), this.loader = document.createElement("span"), this.loader.className = "op-player__loader", this.loader.tabIndex = -1, this.loader.setAttribute("aria-hidden", "true"), this.#s.parentElement && (this.#s.parentElement.insertBefore(this.loader, this.#s), this.#s.parentElement.insertBefore(this.playBtn, this.#s)), this.playBtn.addEventListener(
      "click",
      () => {
        this.#e && (this.#e.playRequested = this.activeElement().paused), this.activeElement().paused ? this.activeElement().play() : this.activeElement().pause();
      },
      h
    ));
  }
  _setEvents() {
    if (k(this.#s)) {
      this.#r.loadedmetadata = () => {
        const e = this.activeElement();
        this.#a.showLoaderOnInit && !A && !_ ? (this.loader.setAttribute("aria-hidden", "false"), this.playBtn.setAttribute("aria-hidden", "true")) : (this.loader.setAttribute("aria-hidden", "true"), this.playBtn.setAttribute("aria-hidden", "false")), e.paused && (this.playBtn.classList.remove("op-player__play--paused"), this.playBtn.setAttribute("aria-pressed", "false"));
      }, this.#r.waiting = () => {
        this.playBtn.setAttribute("aria-hidden", "true"), this.loader.setAttribute("aria-hidden", "false");
      }, this.#r.seeking = () => {
        const e = this.activeElement();
        this.playBtn.setAttribute("aria-hidden", "true"), this.loader.setAttribute("aria-hidden", e instanceof R ? "false" : "true");
      }, this.#r.seeked = () => {
        const e = this.activeElement();
        Math.round(e.currentTime) === 0 ? (this.playBtn.setAttribute("aria-hidden", "true"), this.loader.setAttribute("aria-hidden", "false")) : (this.playBtn.setAttribute("aria-hidden", e instanceof R ? "false" : "true"), this.loader.setAttribute("aria-hidden", "true"));
      }, this.#r.play = () => {
        this.playBtn.classList.add("op-player__play--paused"), this.playBtn.title = this.#a.labels?.pause || "", this.loader.setAttribute("aria-hidden", "true"), this.#a.showLoaderOnInit ? this.playBtn.setAttribute("aria-hidden", "true") : setTimeout(() => {
          this.playBtn.setAttribute("aria-hidden", "true");
        }, this.#a.hidePlayBtnTimer);
      }, this.#r.playing = () => {
        this.loader.setAttribute("aria-hidden", "true"), this.playBtn.setAttribute("aria-hidden", "true");
      }, this.#r.pause = () => {
        const e = this.activeElement();
        this.playBtn.classList.remove("op-player__play--paused"), this.playBtn.title = this.#a.labels?.play || "", this.#a.showLoaderOnInit && Math.round(e.currentTime) === 0 ? (this.playBtn.setAttribute("aria-hidden", "true"), this.loader.setAttribute("aria-hidden", "false")) : (this.playBtn.setAttribute("aria-hidden", "false"), this.loader.setAttribute("aria-hidden", "true"));
      }, this.#r.ended = () => {
        this.loader.setAttribute("aria-hidden", "true"), this.playBtn.setAttribute("aria-hidden", "true");
      };
      let t = !1;
      this.#r.timeupdate = () => {
        if (this.#s.loop && this.isMedia() && this.#e) {
          const e = this.getMedia(), s = e.duration - e.currentTime;
          if (s > 0 && s <= 0.25 && !t) {
            t = !0;
            const i = u("ended");
            this.#s.dispatchEvent(i);
          } else
            s === 0 && (t = !1);
        }
      };
    }
    Object.keys(this.#r).forEach((t) => {
      this.#s.addEventListener(t, this.#r[t], h);
    }), this.getContainer().addEventListener("keydown", this._enableKeyBindings, h);
  }
  _autoplay() {
    this.#u || (this.#u = !0, this.#s.removeEventListener("canplay", this._autoplay), tt(
      this.#s,
      this.#d,
      (t) => {
        this.#l = t;
      },
      (t) => {
        this.#f = t;
      },
      () => {
        if (this.#f) {
          this.activeElement().muted = !0, this.activeElement().volume = 0;
          const t = u("volumechange");
          this.#s.dispatchEvent(t);
          const e = document.createElement("div"), s = A || _ ? this.#a.labels?.tap : this.#a.labels?.click;
          e.className = "op-player__unmute", e.innerHTML = `<span>${s}</span>`, e.tabIndex = 0, e.addEventListener(
            "click",
            () => {
              this.activeElement().muted = !1, this.activeElement().volume = this.#d;
              const n = u("volumechange");
              this.#s.dispatchEvent(n), e.remove();
            },
            h
          );
          const i = this.getContainer();
          i.insertBefore(e, i.firstChild);
        } else
          this.activeElement().muted = this.#s.muted, this.activeElement().volume = this.#d;
        if (this.#n) {
          const t = this.#a && this.#a.ads ? this.#a.ads : void 0;
          this.#e = new $(
            this,
            this.#n,
            this.#l,
            this.#f,
            t
          );
        } else
          (this.#l || this.#f) && this.play();
      }
    ));
  }
  _mergeOptions(t) {
    const e = { ...t || {} };
    if (this.#a = { ...this.#_, ...e }, Object.keys(this.#_).filter(
      (i) => i !== "labels" && typeof this.#_[i] == "object"
    ).forEach((i) => {
      const n = e[i] || {};
      n && Object.keys(n).length && (this.#a[i] = { ...this.#_[i], ...n });
    }), e.labels) {
      const i = e.labels ? Object.keys(e.labels) : [];
      let n = {};
      i.forEach((a) => {
        const o = e.labels ? e.labels[a] : null;
        o && typeof o == "object" && a === "lang" ? Object.keys(o).forEach((l) => {
          const p = o ? o[l] : null;
          p && (n = {
            ...n,
            lang: { ...n.lang, [l]: L(p) }
          });
        }) : o && (n = { ...n, [a]: L(o) });
      }), this.#a.labels = { ...this.#_.labels, ...n };
    }
  }
  _enableKeyBindings(t) {
    const e = t.which || t.keyCode || 0, s = this.activeElement(), i = this.isAd(), n = document?.activeElement?.classList.contains("op-player");
    switch (e) {
      case 13:
      case 32:
      case 75:
        (n && (e === 13 || e === 32) || e === 75) && (s.paused ? s.play() : s.pause()), t.preventDefault(), t.stopPropagation();
        break;
      case 35:
        !i && s.duration !== 1 / 0 && (s.currentTime = s.duration, t.preventDefault(), t.stopPropagation());
        break;
      case 36:
        i || (s.currentTime = 0, t.preventDefault(), t.stopPropagation());
        break;
      case 37:
      case 39:
      case 74:
      case 76:
        if (!i && s.duration !== 1 / 0) {
          let o = 5;
          const l = this.getOptions().step;
          l ? o = e === 74 || e === 76 ? l * 2 : l : (e === 74 || e === 76) && (o = 10);
          const p = s.duration !== 1 / 0 ? o : this.getOptions().progress?.duration || 0;
          s.currentTime += e === 37 || e === 74 ? p * -1 : p, s.currentTime < 0 ? s.currentTime = 0 : s.currentTime >= s.duration && (s.currentTime = s.duration), t.preventDefault(), t.stopPropagation();
        }
        break;
      case 38:
      case 40:
        const a = e === 38 ? Math.min(s.volume + 0.1, 1) : Math.max(s.volume - 0.1, 0);
        s.volume = a, s.muted = !(a > 0), t.preventDefault(), t.stopPropagation();
        break;
      case 70:
        k(this.#s) && !t.ctrlKey && (this.#p = new z(this, "", ""), typeof this.#p.fullScreenEnabled < "u" && (this.#p.toggleFullscreen(), t.preventDefault(), t.stopPropagation()));
        break;
      case 77:
        s.muted = !s.muted, s.muted ? s.volume = 0 : s.volume = this.#d, t.preventDefault(), t.stopPropagation();
        break;
      case 188:
      case 190:
        if (!i && t.shiftKey) {
          const o = s;
          o.playbackRate = e === 188 ? Math.max(o.playbackRate - 0.25, 0.25) : Math.min(o.playbackRate + 0.25, 2);
          const l = this.getContainer().querySelector(".op-status>span");
          l && (l.textContent = `${o.playbackRate}x`, l.parentElement && l.parentElement.setAttribute("aria-hidden", "false"), setTimeout(() => {
            l.parentElement && l.parentElement.setAttribute("aria-hidden", "true");
          }, 500));
          const p = u("controlschanged");
          dispatchEvent(p), t.preventDefault(), t.stopPropagation();
        } else
          !i && s.paused && (s.currentTime += 1 / 25 * (e === 188 ? -1 : 1), t.preventDefault(), t.stopPropagation());
        break;
    }
  }
}
const q = w;
typeof window < "u" && (window.OpenPlayer = w, window.OpenPlayerJS = w, w.init());
export {
  q as default
};
//# sourceMappingURL=player.js.map
