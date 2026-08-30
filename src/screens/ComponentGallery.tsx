import React, { useRef, useState } from "react";
import {
  Animated,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import {
  Badge,
  CardGroup,
  ListRow,
  QuickActionTile,
  ScoreCard,
  SectionHeader,
  SegmentedControl,
} from "../components/ui";
import { colors, fontSizes, fonts, radii, spacing } from "../theme/tokens";

export const ComponentGallery: React.FC = () => {
  const [selectedTile, setSelectedTile] = useState<string>("scans");
  const [selectedView, setSelectedView] = useState<string>("overview");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerBgOpacity = scrollY.interpolate({
    inputRange: [30, 70],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const navTitleOpacity = scrollY.interpolate({
    inputRange: [50, 75],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.topNavContainer, { opacity: headerBgOpacity }]}
        pointerEvents="none"
      >
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.topNavTintOverlay} />
        <View style={styles.topNavBorder} />
      </Animated.View>

      <View style={styles.topNavTitleOverlay} pointerEvents="none">
        <Animated.Text
          style={[styles.topNavTitle, { opacity: navTitleOpacity }]}
        >
          Design System Gallery
        </Animated.Text>
      </View>

      <Animated.ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.largeTitle}>Design System Gallery</Text>
          <Text style={styles.subtitle}>Milestone 2 Component Showcase</Text>
        </View>

        {/* View Switcher: Segmented Control */}
        <View style={styles.section}>
          <SegmentedControl
            options={[
              { label: "Overview", value: "overview" },
              { label: "Trackers", value: "trackers" },
              { label: "Graph View", value: "graph" },
            ]}
            selectedValue={selectedView}
            onValueChange={setSelectedView}
          />
        </View>

        {/* 1. ScoreCard Component */}
        <SectionHeader title="1. ScoreCard Component" count={2} />
        <View style={styles.section}>
          <ScoreCard
            score={88}
            title="Privacy Security Score"
            subtitle="Low cross-app data sharing detected"
            lastScanText="Last scanned 2m ago"
            actionLabel="Run Deep Scan"
            onActionPress={() => {}}
            style={styles.componentSpacing}
          />

          <ScoreCard
            score={42}
            title="High Risk Exposure"
            subtitle="14 shared SDK trackers across 8 apps"
            lastScanText="Last scanned 1h ago"
            actionLabel="View Risk Breakdown"
            onActionPress={() => {}}
          />
        </View>

        {/* 2. Grouped ListRow Component */}
        <SectionHeader
          title="2. Grouped List (Swipe Left)"
          count={3}
          actionLabel="View All"
          onActionPress={() => {}}
        />
        <View style={styles.section}>
          <CardGroup>
            <ListRow
              title="Instagram"
              subtitle="com.instagram.android • 8 Trackers"
              useMonoSubtitle
              rightElement={<Badge label="HIGH" variant="high" />}
              rightActions={[
                {
                  label: "Mute",
                  backgroundColor: colors.surfaceHover,
                  onPress: () => {},
                },
                {
                  label: "Block",
                  backgroundColor: colors.danger,
                  onPress: () => {},
                },
              ]}
            />
            <ListRow
              title="Signal Private Messenger"
              subtitle="org.thoughtcrime.securesms • 0 Trackers"
              useMonoSubtitle
              rightElement={<Badge label="SAFE" variant="safe" />}
              rightActions={[
                {
                  label: "Details",
                  backgroundColor: colors.surfaceHover,
                  onPress: () => {},
                },
              ]}
            />
            <ListRow
              title="Meta Audience Network"
              subtitle="SDK Provider • Embedded in 12 apps"
              useMonoSubtitle
              rightElement={<Badge label="MODERATE" variant="moderate" />}
              rightActions={[
                {
                  label: "Report",
                  backgroundColor: colors.warning,
                  onPress: () => {},
                },
              ]}
            />
          </CardGroup>
        </View>

        {/* 3. Badge Component */}
        <SectionHeader title="3. Badge Component" count={5} />
        <View style={[styles.section, styles.rowWrap]}>
          <Badge label="SAFE" variant="safe" style={styles.badgeItem} />
          <Badge label="MODERATE" variant="moderate" style={styles.badgeItem} />
          <Badge label="HIGH RISK" variant="high" style={styles.badgeItem} />
          <Badge label="NEUTRAL" variant="neutral" style={styles.badgeItem} />
          <Badge label="MONO: 99.4%" variant="safe" useMono style={styles.badgeItem} />
        </View>

        {/* 4. QuickActionTile Component */}
        <SectionHeader title="4. QuickActionTile Component" count={3} />
        <View style={[styles.section, styles.tileRow]}>
          <QuickActionTile
            title="Security Scan"
            subtitle="FULL SCAN"
            selected={selectedTile === "scans"}
            onPress={() => setSelectedTile("scans")}
            style={styles.tileItem}
          />
          <QuickActionTile
            title="Tracker Graph"
            subtitle="32 NODES"
            selected={selectedTile === "graph"}
            onPress={() => setSelectedTile("graph")}
            style={styles.tileItem}
          />
          <QuickActionTile
            title="Simulate App"
            subtitle="SEARCH"
            selected={selectedTile === "search"}
            onPress={() => setSelectedTile("search")}
            style={styles.tileItem}
          />
        </View>

        {/* 5. SectionHeader Demo */}
        <SectionHeader title="5. Structure & Motion Spec" count={7} />
        <View style={styles.demoBox}>
          <Text style={styles.demoText}>
            Layered iOS structural & motion conventions: 18px rounded card groups, internal dividers, translucent nav bar, collapsible large titles, subtle floating card shadows, swipeable list actions, pull-to-refresh, and segmented controls.
          </Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topNavContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    zIndex: 100,
    overflow: "hidden",
  },
  topNavTintOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  topNavBorder: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: colors.border,
  },
  topNavTitleOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    zIndex: 101,
    justifyContent: "center",
    alignItems: "center",
  },
  topNavTitle: {
    fontFamily: fonts.sansSemiBold,
    fontSize: fontSizes.base,
    color: colors.foreground,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  largeTitle: {
    fontFamily: fonts.sansBold,
    fontSize: fontSizes.xl,
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    color: colors.foregroundSubtle,
  },
  section: {
    marginBottom: spacing.xl,
  },
  componentSpacing: {
    marginBottom: spacing.md,
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  badgeItem: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  tileRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  tileItem: {
    flex: 1,
  },
  demoBox: {
    backgroundColor: colors.surface1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.card,
    padding: spacing.md,
  },
  demoText: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    color: colors.foregroundMuted,
    lineHeight: 20,
  },
});
