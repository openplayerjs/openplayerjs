# @openplayerjs/player — AI context

## Role
UI layer: DOM structure, controls, CSS, keyboard/pointer bindings, accessibility. No direct media API calls — everything goes through `@openplayerjs/core`'s `Core` instance.

## Key files
- `src/ui.ts` — `createUI()`: builds wrapper DOM, wires pointer/keyboard/focus events, controls hide/show
- `src/events.ts` — `bindCenterOverlay()`: keyboard shortcuts, center overlay bindings
- `src/controls/` — individual control classes (all extend `BaseControl`)
- `src/controls/base.ts` — `BaseControl`: `DisposableStore`, overlay subscription, `create()` / `destroy()`
- `src/a11y.ts` — `setA11yLabel()`, `getSharedAnnouncer()` (ref-counted live regions)
- `src/configuration.ts` — `resolveUIConfig()`, default labels, `PlayerUIConfig`
- `src/umd.ts` — UMD `Player` class (wraps `Core` + `createUI` for CDN usage)

## Critical rules
- Controls must register all listeners through `this.dispose.addEventListener(...)` or `this.listen(...)`, never bare `addEventListener`. This ensures automatic cleanup on `destroy()`.
- `ui:menu:open` / `ui:menu:close` events pause/resume the controls auto-hide timer. Always emit both as a pair (settings panel does this).
- **Keyboard `'f'` key** requests fullscreen on `keyTarget` (the player wrapper), not `e.target`. `e.target` may be any focused child element.
- `onControlsFocusOut` and `onWrapperFocusOut` use `queueMicrotask` (not `setTimeout(fn, 0)`) to check focus after it has settled.
- The `scheduleHide` function is a no-op when `alwaysVisible` is true or a menu is open.
- `getActiveMedia(core)` returns the ad video element when a linear overlay is active, falling back to `core.surface`.

## Adding a new control
1. Create a class extending `BaseControl` in `src/controls/`.
2. Implement `id`, `placement`, and `build(): HTMLElement`.
3. Use `this.onPlayer(event, cb)` for player events and `this.listen(target, type, handler)` for DOM events.
4. Export a factory function `createXxxControl(placement?)`.
5. Register the factory in `getControlFactory()` inside `src/umd.ts`.

## UMD interop
`Player.init()` reads `window.OpenPlayerPlugins` before constructing `Core`. Plugin UMD bundles register via `window.OpenPlayerPlugins[name] = { factory, ... }`. All `@openplayerjs/core` exports are attached as static properties on the `Player` constructor for UMD consumers.

## Labels / i18n
All user-visible strings come from `defaultLabels` in `configuration.ts`. Callers may override any key via `config.labels`. The `resolveUIConfig` function merges and normalises these. No hard-coded English strings in control source files.
