import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { colors, radii, shadows } from "../../theme/tokens";

export interface CardGroupProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardGroup: React.FC<CardGroupProps> = ({ children, style }) => {
  const childArray = React.Children.toArray(children).filter(Boolean);

  return (
    <View style={[styles.container, style]}>
      {childArray.map((child, index) => {
        const isLast = index === childArray.length - 1;
        return (
          <View
            key={index}
            style={[!isLast && styles.divider]}
          >
            {child}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface1,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadows.card,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
