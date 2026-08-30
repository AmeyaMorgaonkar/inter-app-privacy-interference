import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { colors, fontSizes, fonts, radii, spacing } from "../../theme/tokens";

export interface SegmentedControlOption {
  label: string;
  value: string;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  style?: ViewStyle;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  selectedValue,
  onValueChange,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {options.map((option) => {
        const isSelected = option.value === selectedValue;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onValueChange(option.value)}
            activeOpacity={0.75}
            style={[styles.segment, isSelected && styles.segmentSelected]}
          >
            <Text
              style={[
                styles.label,
                isSelected ? styles.labelSelected : styles.labelUnselected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.surface2,
    borderRadius: radii.control,
    padding: spacing.xs / 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.control - 2,
  },
  segmentSelected: {
    backgroundColor: colors.surfaceHover,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: fontSizes.xs,
  },
  labelSelected: {
    color: colors.foreground,
    fontFamily: fonts.sansSemiBold,
  },
  labelUnselected: {
    color: colors.foregroundMuted,
  },
});
