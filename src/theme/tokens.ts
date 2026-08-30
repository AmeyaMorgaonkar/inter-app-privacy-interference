export const colors = {
  background: "#000000",
  surface1: "#0a0a0a",
  surface2: "#111111",
  surfaceHover: "#1a1a1a",
  border: "rgba(255, 255, 255, 0.08)",
  borderStrong: "rgba(255, 255, 255, 0.14)",
  foreground: "#ffffff",
  foregroundMuted: "#a1a1a1",
  foregroundSubtle: "#666666",
  accent: "#00e599",
  accentDim: "rgba(0, 229, 153, 0.12)",
  accentBorder: "rgba(0, 229, 153, 0.35)",
  accentStrong: "#00ffa3",
  danger: "#ff4d4f",
  dangerDim: "rgba(255, 77, 79, 0.12)",
  dangerBorder: "rgba(255, 77, 79, 0.35)",
  warning: "#f5a623",
  warningDim: "rgba(245, 166, 35, 0.12)",
  warningBorder: "rgba(245, 166, 35, 0.35)",
} as const;

export const fonts = {
  sans: "Geist_400Regular",
  sansMedium: "Geist_500Medium",
  sansSemiBold: "Geist_600SemiBold",
  sansBold: "Geist_700Bold",
  mono: "GeistMono_400Regular",
  monoMedium: "GeistMono_500Medium",
  monoSemiBold: "GeistMono_600SemiBold",
  monoBold: "GeistMono_700Bold",
} as const;

export const fontSizes = {
  xs: 12,
  sm: 13,
  md: 14,
  base: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
} as const;

export const fontWeights = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export const radii = {
  card: 18,
  control: 8,
  avatar: 10,
  full: 9999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const shadows = {
  card: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
} as const;

export const theme = {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  radii,
  spacing,
  shadows,
} as const;

export type Theme = typeof theme;
