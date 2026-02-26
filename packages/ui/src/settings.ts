import type { Player } from '@openplayer/core';

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
  items: SettingsMenuItem[];
};

export type SettingsSubmenuProvider = {
  id: string;
  label: string;
  getSubmenu: (player: Player) => SettingsSubmenu | null;
};

// Use a symbol to avoid collisions with user-land fields.
const SETTINGS_REGISTRY_KEY: unique symbol = Symbol.for('openplayerjs.settings.registry');

export class SettingsRegistry {
  private providers = new Map<string, SettingsSubmenuProvider>();

  register(provider: SettingsSubmenuProvider) {
    this.providers.set(provider.id, provider);
    return () => this.providers.delete(provider.id);
  }

  list(): SettingsSubmenuProvider[] {
    return Array.from(this.providers.values()).sort((a, b) => a.label.localeCompare(b.label));
  }
}

type RegistryHost = Player & { [SETTINGS_REGISTRY_KEY]?: SettingsRegistry };

export function getSettingsRegistry(player: Player): SettingsRegistry {
  const host = player as RegistryHost;
  if (host[SETTINGS_REGISTRY_KEY]) return host[SETTINGS_REGISTRY_KEY];
  const reg = new SettingsRegistry();
  host[SETTINGS_REGISTRY_KEY] = reg;
  return reg;
}
