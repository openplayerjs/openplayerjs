import type { Player } from '../core/player';

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
  /** Stable id for this submenu. */
  id: string;
  /** Label as shown in the root menu. */
  label: string;

  /**
   * Return a submenu definition, or null if this submenu is not available right now.
   * Called frequently; keep it cheap.
   */
  getSubmenu: (player: Player) => SettingsSubmenu | null;
};

const SETTINGS_REGISTRY_KEY = '__op::settings::registry';

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

export function getSettingsRegistry(player: any): SettingsRegistry {
  if (player[SETTINGS_REGISTRY_KEY]) return player[SETTINGS_REGISTRY_KEY] as SettingsRegistry;
  const reg = new SettingsRegistry();
  player[SETTINGS_REGISTRY_KEY] = reg;
  return reg;
}
