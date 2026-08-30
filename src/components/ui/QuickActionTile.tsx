import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { colors, fontSizes, fonts, radii, spacing } from "../../theme/tokens";

export interface QuickActionTileProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const QuickActionTile: React.FC<QuickActionTileProps> = ({
  title,
  subtitle,
  icon,
  selected = false,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.tile,
        selected ? styles.tileSelected : styles.tileDefault,
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.title, selected && styles.titleSelected]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, selected && styles.subtitleSelected]}>
          {subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: 1,
    minWidth: 110,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  tileDefault: {
    backgroundColor: colors.surface1,
    borderColor: colors.border,
  },
  tileSelected: {
    backgroundColor: colors.accentDim,
    borderColor: colors.accent,
  },
  iconContainer: {
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.sansSemiBold,
    fontSize: fontSizes.base,
    color: colors.foreground,
  },
  titleSelected: {
    color: colors.foreground,
  },
  subtitle: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    color: colors.foregroundSubtle,
    marginTop: spacing.xs / 2,
  },
  subtitleSelected: {
    color: colors.foregroundSubtle,
  },
});
