// ============= Nav order service =============
// Pure logic for the admin sidebar navigation order editor.
// The live value lives in the `sidebar_nav_order` feature flag as a comma-separated key list.

export interface NavItem {
  key: string;
  label: string;
}

// Default sidebar destinations, in the order they ship.
export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  { key: 'explore', label: 'Explore' },
  { key: 'models', label: 'Models' },
  { key: 'scoreboard', label: 'Scoreboard' },
  { key: 'learn', label: 'Learn' },
  { key: 'connect', label: 'Connect your agent' },
  { key: 'about', label: 'About' },
  { key: 'profile', label: 'Profile' },
  { key: 'agent-profiles', label: 'Agent Profiles' },
  { key: 'settings', label: 'Settings' },
  { key: 'admin', label: 'Admin' },
];

/**
 * Turn a saved `sidebar_nav_order` value into the list of items to show in the editor.
 * Every key found in the saved value is kept (unknown keys fall back to the key as
 * label) so saving from the editor can never silently drop a destination.
 * Known keys missing from the saved value are appended at the end.
 */
export const resolveNavOrder = (
  savedOrder: string | null | undefined,
  defaults: NavItem[] = SIDEBAR_NAV_ITEMS,
): NavItem[] => {
  if (!savedOrder) return [...defaults];

  const seen = new Set<string>();
  const ordered: NavItem[] = [];

  for (const rawKey of savedOrder.split(',')) {
    const key = rawKey.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    ordered.push(defaults.find(item => item.key === key) ?? { key, label: key });
  }

  return [...ordered, ...defaults.filter(item => !seen.has(item.key))];
};

/** Serialize the editor list back into the flag value. */
export const serializeNavOrder = (items: NavItem[]): string =>
  items.map(item => item.key).join(',');
