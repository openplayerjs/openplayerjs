import type { Core } from '@openplayerjs/core';

export type SettingsMenuItem = {
  id: string;
  label: string;
  checked?: boolean;
  disabled?: boolean;
  onSelect: () => void;
};

export type SettingsSubmenu = {
  id: string;
  label: string;
  /** Current-value text shown next to the label in the root settings menu (e.g. "1.5×"). */
  currentLabel?: string;
  /** When true the checkmark is shown on the root menu row (indicates a non-default selection). */
  currentChecked?: boolean;
  items: SettingsMenuItem[];
};

export type SettingsSubmenuProvider = {
  id: string;
  label: string;
  getSubmenu: (core: Core) => SettingsSubmenu | null;
};

// Use a symbol to avoid collisions with user-land fields.
const SETTINGS_REGISTRY_KEY: unique symbol = Symbol.for('openplayerjs.settings.registry');

// Keyed by registry instance rather than a class field so adding this cache doesn't add
// a new `private` member to SettingsRegistry (TypeScript emits private member names into
// .d.ts, which would otherwise change the package's declared public API surface).
// Invalidated on register/unregister; list() re-sorts only then instead of on every call.
// render() calls list() on every closed-menu overlay:changed tick (i.e. every ad-video
// timeupdate), so an unconditional localeCompare sort there is wasted work.
const sortedProvidersCache = new WeakMap<SettingsRegistry, SettingsSubmenuProvider[]>();

export class SettingsRegistry {
  private providers = new Map<string, SettingsSubmenuProvider>();

  register(provider: SettingsSubmenuProvider) {
    this.providers.set(provider.id, provider);
    sortedProvidersCache.delete(this);
    return () => {
      sortedProvidersCache.delete(this);
      return this.providers.delete(provider.id);
    };
  }

  list(): SettingsSubmenuProvider[] {
    let sorted = sortedProvidersCache.get(this);
    if (!sorted) {
      sorted = Array.from(this.providers.values()).sort((a, b) => a.label.localeCompare(b.label));
      sortedProvidersCache.set(this, sorted);
    }
    // Return a copy so a caller mutating the result can't corrupt the cache.
    return sorted.slice();
  }
}

type RegistryHost = Core & { [SETTINGS_REGISTRY_KEY]?: SettingsRegistry };

export function getSettingsRegistry(core: Core): SettingsRegistry {
  const host = core as RegistryHost;
  if (host[SETTINGS_REGISTRY_KEY]) return host[SETTINGS_REGISTRY_KEY];
  const reg = new SettingsRegistry();
  host[SETTINGS_REGISTRY_KEY] = reg;
  return reg;
}
