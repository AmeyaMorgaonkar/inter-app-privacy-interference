# Design System Specification (`DESIGN.md`)

This document is the authoritative design reference for the **Inter-App Privacy Interference Engine** app. All future UI components and screens (Milestones 8–11) must consume tokens from `src/theme/tokens.ts` and compose using the five core components defined here.

---

## 1. Aesthetic Direction

- **Style**: Vercel/Next.js monochrome, high-contrast, Geist-typeset dark UI.
- **Theme**: Dark background (`#000000`), flat elevation using background contrast (`#0a0a0a` / `#111111`), hairline borders (`rgba(255, 255, 255, 0.08)`), and disciplined mint-green accent (`#00e599`).
- **Accent Budget Rule**: Mint green is strictly reserved for:
  1. Risk/security radial gauge stroke & score overlays
  2. Active bottom navigation item & active selection borders/backgrounds
  3. Primary call-to-action buttons
  4. Safe/low-risk status badges
  **Rule**: Mint green must NEVER exceed ~10% of any screen area.

---

## 2. Token Definitions (`src/theme/tokens.ts`)

### Color System
```ts
colors = {
  background: "#000000",       // Primary app canvas
  surface1: "#0a0a0a",         // Cards & main containers
  surface2: "#111111",         // Inputs & nested cards
  surfaceHover: "#1a1a1a",     // Interactive hover/pressed state
  border: "rgba(255, 255, 255, 0.08)",       // Hairline border
  borderStrong: "rgba(255, 255, 255, 0.14)", // Focused/highlight border
  foreground: "#ffffff",       // Primary headings & text
  foregroundMuted: "#a1a1a1",   // Subtitles & labels
  foregroundSubtle: "#666666",  // Captions & timestamps
  accent: "#00e599",           // Mint green accent
  accentDim: "rgba(0, 229, 153, 0.12)",      // Badge & active item background
  accentBorder: "rgba(0, 229, 153, 0.35)",   // Badge & active item border (~35% opacity)
  accentStrong: "#00ffa3",     // Gauges & active highlights
  danger: "#ff4d4f",           // High risk text
  dangerDim: "rgba(255, 77, 79, 0.12)",      // High risk badge background
  dangerBorder: "rgba(255, 77, 79, 0.35)",   // High risk badge border (~35% opacity)
  warning: "#f5a623",          // Moderate risk text
  warningDim: "rgba(245, 166, 35, 0.12)",    // Moderate risk badge background
  warningBorder: "rgba(245, 166, 35, 0.35)", // Moderate risk badge border (~35% opacity)
}
```

### Typography Scale & Hierarchy
- **Geist Sans**: All UI text, titles, descriptions, and button labels (`Geist_400Regular`, `Geist_500Medium`, `Geist_600SemiBold`, `Geist_700Bold`).
- **Geist Mono**: Scores, percentages, timestamps, package names, permission IDs, counts (`GeistMono_400Regular`, `GeistMono_500Medium`, `GeistMono_600SemiBold`, `GeistMono_700Bold`).
- **Scale**: `xs: 12`, `sm: 13`, `md: 14`, `base: 16`, `lg: 20`, `xl: 28`, `xxl: 36`.
- **Hierarchy Rules**:
  1. **Page Titles**: Must be 28px (`fontSizes.xl`), bold (`Geist_700Bold`), and noticeably larger than card titles.
  2. **Card & Row Titles**: Standardized at 16px (`fontSizes.base`), semibold (`Geist_600SemiBold`).
  3. **Secondary/Caption Text**: Subtitles, timestamps (e.g., "last scanned"), and metadata drop to `--foreground-subtle` (`#666666`).
  4. **Single Accent Focal Point**: Each card has strictly **one** accent-colored focal point (the number/score gauge). Card titles, subtitles, and section header counts must NOT use accent color.

### Radii, Spacing & Shadows
- **Radii**: `card: 18` (iOS-style rounder corners), `control: 8` (buttons/pills/badges), `avatar: 10`, `full: 9999`.
- **Spacing**: `xs: 4`, `sm: 8`, `md: 12`, `lg: 16`, `xl: 24`, `xxl: 32`, `xxxl: 48`.
- **Shadows**: `shadows.card` (subtle low-opacity shadow to lift floating cards off blurred surfaces).

---

## 3. iOS Structural & Motion Conventions

1. **Grouped Card Containers (`CardGroup`)**: Related rows are grouped inside a single 18px rounded container with hairline internal dividers (`colors.border`), replacing standalone bordered boxes.
2. **Collapsible Large Titles**: Screens start with a large title (28px `fontSizes.xl`, `Geist_700Bold`) that smoothly shrinks into a small centered title in the top nav bar as the user scrolls.
3. **Translucent Blurred Surfaces**: Top navigation headers and bottom tab bars utilize native `BlurView` (`intensity={90}`, `tint="dark"`) with a lightweight 40% dark tint (`rgba(0, 0, 0, 0.4)`) for clean, authentic backdrop blur as content scrolls underneath.
4. **Subtle Floating Elevation**: Floating cards (`ScoreCard`, `CardGroup`) feature a minimal low-opacity shadow (`shadows.card`).
5. **Swipeable Actions & Pull-to-Refresh**: List rows support swipe-to-reveal action buttons (`ListRow` with `rightActions`), and scroll views integrate native `RefreshControl`.
6. **Segmented Controls**: View toggles (e.g. Graph vs List) use pill-style `SegmentedControl` components instead of tab links.

---

## 4. Core Component Library APIs (`src/components/ui/`)

### 1. `Badge` (`src/components/ui/Badge.tsx`)
Displays filled risk levels and status pills with `--*-dim` background (~12% opacity), solid text color, and matching border at ~35% opacity. Neutral variant uses `surface2` background (`#111111`), muted text (`#a1a1a1`), and plain border (`rgba(255, 255, 255, 0.08)`).
```ts
interface BadgeProps {
  label: string;
  variant?: "safe" | "moderate" | "high" | "neutral";
  useMono?: boolean;
  style?: ViewStyle;
}
```

### 2. `SectionHeader` (`src/components/ui/SectionHeader.tsx`)
Section title in Geist Sans with optional count in Geist Mono and optional action link.
```ts
interface SectionHeaderProps {
  title: string;
  count?: number | string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}
```

### 3. `QuickActionTile` (`src/components/ui/QuickActionTile.tsx`)
Card tile with surface-1 background that highlights with `--accent-dim` when active/selected.
```ts
interface QuickActionTileProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}
```

### 4. `ListRow` (`src/components/ui/ListRow.tsx`)
High-density row component supporting left icon, Geist Sans title, Geist Mono subtext, right accessory, swipe-to-reveal action buttons, and borderless grouped display inside `CardGroup`.
```ts
interface ListRowProps {
  title: string;
  subtitle?: string;
  useMonoSubtitle?: boolean;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  rightActions?: Array<{ label: string; backgroundColor?: string; color?: string; onPress: () => void }>;
  onPress?: () => void;
  standaloneCard?: boolean;
  style?: ViewStyle;
}
```

### 5. `ScoreCard` (`src/components/ui/ScoreCard.tsx`)
Dashboard score card featuring SVG radial gauge (`react-native-svg`), Geist Mono score number, scan timestamp, low-opacity shadow, and CTA button.
```ts
interface ScoreCardProps {
  score: number; // 0 to 100
  title?: string;
  subtitle?: string;
  lastScanText?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}
```

### 6. `CardGroup` (`src/components/ui/CardGroup.tsx`)
Container component that groups children inside a rounded 18px surface container with hairline internal dividers.
```ts
interface CardGroupProps {
  children: React.ReactNode;
  style?: ViewStyle;
}
```

### 7. `SegmentedControl` (`src/components/ui/SegmentedControl.tsx`)
Pill-style view toggle component with active highlight and Geist Sans typography.
```ts
interface SegmentedControlProps {
  options: Array<{ label: string; value: string }>;
  selectedValue: string;
  onValueChange: (value: string) => void;
  style?: ViewStyle;
}
```
