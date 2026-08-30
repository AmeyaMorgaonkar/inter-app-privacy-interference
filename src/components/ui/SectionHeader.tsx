import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { colors, fontSizes, fonts, spacing } from "../../theme/tokens";

export interface SectionHeaderProps {
  title: string;
  count?: number | string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  count,
  actionLabel,
  onActionPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {count !== undefined && (
          <Text style={styles.count}>({count})</Text>
        )}
      </View>
      {actionLabel && onActionPress && (
        <TouchableOpacity
          onPress={onActionPress}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  title: {
    fontFamily: fonts.sansSemiBold,
    fontSize: fontSizes.sm,
    color: colors.foregroundMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  count: {
    fontFamily: fonts.monoMedium,
    fontSize: fontSizes.sm,
    color: colors.foregroundMuted,
  },
  actionText: {
    fontFamily: fonts.sansMedium,
    fontSize: fontSizes.xs,
    color: colors.foregroundMuted,
  },
});
