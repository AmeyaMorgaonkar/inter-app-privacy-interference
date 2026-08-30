import React, { useRef } from "react";
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { colors, fontSizes, fonts, radii, spacing } from "../../theme/tokens";

export interface ListRowAction {
  label: string;
  backgroundColor?: string;
  textColor?: string;
  onPress: () => void;
}

export interface ListRowProps {
  title: string;
  subtitle?: string;
  useMonoSubtitle?: boolean;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  rightActions?: ListRowAction[];
  onPress?: () => void;
  standaloneCard?: boolean;
  style?: ViewStyle;
}

export const ListRow: React.FC<ListRowProps> = ({
  title,
  subtitle,
  useMonoSubtitle = true,
  leftIcon,
  rightElement,
  rightActions,
  onPress,
  standaloneCard = false,
  style,
}) => {
  const pan = useRef(new Animated.Value(0)).current;
  const actionsWidth = (rightActions?.length || 0) * 72;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Boolean(rightActions?.length) && Math.abs(gestureState.dx) > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          pan.setValue(Math.max(-actionsWidth, gestureState.dx));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -40) {
          Animated.spring(pan, {
            toValue: -actionsWidth,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const resetSwipe = () => {
    Animated.spring(pan, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const ContainerComponent = onPress ? TouchableOpacity : View;

  return (
    <View style={styles.wrapper}>
      {rightActions && rightActions.length > 0 && (
        <View style={styles.actionsContainer}>
          {rightActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              onPress={() => {
                resetSwipe();
                action.onPress();
              }}
              style={[
                styles.actionButton,
                { backgroundColor: action.backgroundColor || colors.danger },
              ]}
            >
              <Text
                style={[
                  styles.actionText,
                  { color: action.textColor || colors.foreground },
                ]}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Animated.View
        {...(rightActions ? panResponder.panHandlers : {})}
        style={[
          { transform: [{ translateX: pan }] },
        ]}
      >
        <ContainerComponent
          onPress={onPress}
          activeOpacity={0.7}
          style={[
            styles.container,
            standaloneCard && styles.standalone,
            style,
          ]}
        >
          {leftIcon && <View style={styles.leftContainer}>{leftIcon}</View>}

          <View style={styles.contentContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[
                  styles.subtitle,
                  useMonoSubtitle ? styles.monoSubtitle : styles.sansSubtitle,
                ]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>

          {rightElement && (
            <View style={styles.rightContainer}>{rightElement}</View>
          )}
        </ContainerComponent>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    overflow: "hidden",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface1,
  },
  standalone: {
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.xs / 2,
  },
  leftContainer: {
    marginRight: spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.sansSemiBold,
    fontSize: fontSizes.base,
    color: colors.foreground,
  },
  subtitle: {
    fontSize: fontSizes.xs,
    color: colors.foregroundSubtle,
    marginTop: spacing.xs / 2,
  },
  sansSubtitle: {
    fontFamily: fonts.sans,
  },
  monoSubtitle: {
    fontFamily: fonts.mono,
  },
  rightContainer: {
    marginLeft: spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  actionsContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "stretch",
  },
  actionButton: {
    width: 72,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xs,
  },
  actionText: {
    fontFamily: fonts.sansMedium,
    fontSize: fontSizes.xs,
  },
});
