# 📚 OpenPlayerJS v3 Cookbook (Common Scenarios)

Use this as your “I just want it to work” reference. Each recipe links to the package that owns the feature (Core / UI / HLS / Ads).

> ⚠️ Some legacy samples reference v2-only features (FLV, DASH, core Levels API). Those are clearly marked with ✅/⚠️/❌ and include v3 mitigations.

---

## 🟢 Beginners

- ✅ **No configuration (only DOM classes)** (legacy v2 sample): https://codepen.io/rafa8626/pen/WaNxNB  
  **v3 note:** v3 prefers explicit init (`new Player(media, { plugins })`). See **Core → Quick Start**.

- ✅ **Minimal configuration**: https://codepen.io/rafa8626/pen/BqazxX  
  **v3 mapping:** Core + (optional) UI.

- ✅ **Using `fill` mode** (legacy v2 sample): https://codepen.io/rafa8626/pen/xxZXQoO  
  **v3 mapping:** UI layout / CSS.

- ✅ **Using `fit` mode** (legacy v2 sample): https://codepen.io/rafa8626/pen/abmboKV  
  **v3 mapping:** UI layout / CSS.

- ✅ **Using Ads (linear and non-linear samples)**: https://codepen.io/rafa8626/pen/vVYKav  
  **v3 mapping:** `@openplayer/ads` plugin.

- ✅ **Removing controls and using `preload="none"`**: https://codepen.io/rafa8626/pen/OJyMwxX  
  **v3 mapping:** Core (media attributes) + UI (don’t mount UI / custom controls).

- ⚠️ **Using `Levels` and setting width/height** (legacy v2 sample): https://codepen.io/rafa8626/pen/ExxXvZx  
  **v3 note:** core Levels API was removed. Use **HLS `getAdapter()`** (hls.js) and build your own “Quality” control in UI.

- ❌ **Use FLV source** (v2-only): https://codepen.io/rafa8626/pen/QWEZPaZ  
  **v3 note:** FLV is removed in v3. Mitigation: stay on v2 or implement a custom engine plugin.

- ✅ **OpenPlayerJS with React**: https://codepen.io/rafa8626/pen/GRrVLMB
- ✅ **OpenPlayerJS with Next.js**: https://codesandbox.io/s/vigorous-almeida-71gln
- ✅ **OpenPlayerJS with Vue.js**: https://codepen.io/rafa8626/pen/JjWPLeo

- ⚠️ **YouTube video (using plugin)** (legacy sample): https://codepen.io/rafa8626/pen/wvvOYpg  
  **v3 note:** implement YouTube as a **custom engine plugin** (see Core → Custom engines).

- ✅ **Using hls.js p2p plugin**: https://codepen.io/rafa8626/pen/PoPLMxo  
  **v3 mapping:** HLS adapter access (`getAdapter()`).

---

## 🟡 Intermediate

- ✅ **Add source after initialization**: https://codepen.io/rafa8626/pen/YzzgJrK  
  **v3 mapping:** Core source swap patterns.

- ⚠️ **Playing HLS streaming with DRM (Encryption)**: https://codepen.io/rafa8626/pen/QZWEVy  
  **v3 note:** depends on platform DRM + your app’s EME setup. See HLS → DRM notes.

- ❌ **M(PEG)-DASH with Ads** (v2-only): https://codepen.io/rafa8626/pen/Xxjmra  
  **v3 note:** DASH is removed in v3. Mitigation: stay on v2 or implement a custom engine plugin.

- ✅ **Ads playlist (multiple URLs)**: https://codepen.io/rafa8626/pen/wvvxbMN  
  **v3 mapping:** `@openplayer/ads` breaks + scheduling.

- ✅ **Add a custom element (watermark)**: https://codepen.io/rafa8626/pen/JjLQNjo  
  **v3 mapping:** UI → `addElement()`.

---

## 🔴 Advanced

- ✅ **Updating source and Ads for dynamic content loading**: https://codepen.io/rafa8626/pen/gORJWVz
- ✅ **Updating Ads and clickable Ad element**: https://codepen.io/rafa8626/pen/OJmEzXw
- ✅ **Trigger Ad manually**: https://codepen.io/rafa8626/pen/abZNgoY
- ✅ **Fully customized audio player**: https://codepen.io/rafa8626/pen/ExPLVRE
- ✅ **Basic playlist (video and audio)**: https://codepen.io/rafa8626/pen/GRREQpX
- ✅ **Retrieve data from audio streaming (HLS)**: https://codepen.io/rafa8626/pen/abbjrBW
- ✅ **Seamless transitions between media using custom control**: https://codepen.io/rafa8626/pen/oNXmEza

---

## 🔗 Quick links by package

- **Core**: plugins, engines, events, dynamic sources
- **UI**: custom controls, custom elements, captions
- **HLS**: getAdapter(), Hls.Events via `player.on(...)`, quality control examples
- **Ads**: breaks, manual triggering, ads events, clickable overlays
