import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors, fontSizes, fonts, radii, shadows, spacing } from "../../theme/tokens";

export interface ScoreCardProps {
  score: number; // 0 to 100
  title?: string;
  subtitle?: string;
  lastScanText?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  score,
  title = "Privacy Security Score",
  subtitle = "Based on cross-app tracker overlap",
  lastScanText = "Last scanned 5m ago",
  actionLabel,
  onActionPress,
  style,
}) => {
  const normalizedScore = Math.min(100, Math.max(0, score));

  // Radial Gauge Geometry
  const size = 96;
  const strokeWidth = 8;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * normalizedScore) / 100;

  const gaugeColor =
    normalizedScore >= 75
      ? colors.accent
      : normalizedScore >= 45
      ? colors.warning
      : colors.danger;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.topRow}>
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <Text style={styles.lastScan}>{lastScanText}</Text>
        </View>

        <View style={styles.gaugeContainer}>
          <Svg width={size} height={size}>
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={colors.surface2}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={gaugeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              transform={`rotate(-90 ${center} ${center})`}
            />
          </Svg>
          <View style={styles.scoreOverlay}>
            <Text style={[styles.scoreText, { color: gaugeColor }]}>
              {normalizedScore}
            </Text>
          </View>
        </View>
      </View>

      {actionLabel && onActionPress && (
        <TouchableOpacity
          onPress={onActionPress}
          activeOpacity={0.8}
          style={styles.actionButton}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface1,
    borderRadius: radii.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  title: {
    fontFamily: fonts.sansSemiBold,
    fontSize: fontSizes.base,
    color: colors.foreground,
    marginBottom: spacing.xs / 2,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.xs,
    color: colors.foregroundMuted,
    marginBottom: spacing.sm,
  },
  lastScan: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    color: colors.foregroundSubtle,
  },
  gaugeContainer: {
    position: "relative",
    width: 96,
    height: 96,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreOverlay: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  scoreText: {
    fontFamily: fonts.monoBold,
    fontSize: fontSizes.xl,
  },
  actionButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface2,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: radii.control,
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontFamily: fonts.sansMedium,
    fontSize: fontSizes.sm,
    color: colors.foreground,
  },
});
