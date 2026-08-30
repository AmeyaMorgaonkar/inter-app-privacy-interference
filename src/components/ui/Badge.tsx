import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, fontSizes, fonts, radii, spacing } from "../../theme/tokens";

export type BadgeVariant = "safe" | "moderate" | "high" | "neutral";

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  useMono?: boolean;
  style?: ViewStyle;
}

const variantStyles: Record<
  BadgeVariant,
  { bg: string; text: string; border: string }
> = {
  safe: {
    bg: colors.accentDim,
    text: colors.accent,
    border: colors.accentBorder,
  },
  moderate: {
    bg: colors.warningDim,
    text: colors.warning,
    border: colors.warningBorder,
  },
  high: {
    bg: colors.dangerDim,
    text: colors.danger,
    border: colors.dangerBorder,
  },
  neutral: {
    bg: colors.surface2,
    text: colors.foregroundMuted,
    border: colors.border,
  },
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "safe",
  useMono = false,
  style,
}) => {
  const currentVariant = variantStyles[variant];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: currentVariant.bg,
          borderColor: currentVariant.border,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: currentVariant.text,
            fontFamily: useMono ? fonts.monoMedium : fonts.sansSemiBold,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radii.control,
    borderWidth: 1,
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: fontSizes.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
