export const accentColors = ["green", "purple", "cyan", "yellow"] as const;
export type AccentColorTypes = (typeof accentColors)[number];
