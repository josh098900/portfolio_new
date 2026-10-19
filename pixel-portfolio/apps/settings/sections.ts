// Plain module so routing can validate /settings/<section> on the server.

export const settingsSections = [
  { id: "wallpaper", name: "Wallpaper" },
  { id: "appearance", name: "Appearance" },
  { id: "accessibility", name: "Accessibility" },
  { id: "about", name: "About" },
] as const;

export type SettingsSection = (typeof settingsSections)[number]["id"];

export function findSection(id: string | undefined) {
  return settingsSections.find(s => s.id === id);
}
