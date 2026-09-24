import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  AppEnumerationResult,
  getInstalledApps,
} from "../../modules/package-manager";
import { Badge, CardGroup, ListRow, SegmentedControl } from "../components/ui";
import { colors, fontSizes, fonts, radii, spacing } from "../theme/tokens";

const MOCK_APPS: AppEnumerationResult[] = [
  {
    packageName: "com.instagram.android",
    displayName: "Instagram",
    installSource: "com.android.vending",
    firstInstallTime: Date.now() - 86400000 * 45,
    lastUpdateTime: Date.now() - 86400000 * 2,
    isSystemApp: false,
    icon: null,
    permissions: [
      { name: "android.permission.CAMERA", granted: true },
      { name: "android.permission.RECORD_AUDIO", granted: true },
      { name: "android.permission.ACCESS_FINE_LOCATION", granted: false },
      { name: "android.permission.READ_CONTACTS", granted: true },
    ],
  },
  {
    packageName: "org.thoughtcrime.securesms",
    displayName: "Signal",
    installSource: "com.android.vending",
    firstInstallTime: Date.now() - 86400000 * 120,
    lastUpdateTime: Date.now() - 86400000 * 5,
    isSystemApp: false,
    icon: null,
    permissions: [
      { name: "android.permission.CAMERA", granted: true },
      { name: "android.permission.RECORD_AUDIO", granted: true },
      { name: "android.permission.READ_CONTACTS", granted: true },
    ],
  },
  {
    packageName: "com.android.settings",
    displayName: "Settings",
    installSource: "system",
    firstInstallTime: Date.now() - 86400000 * 300,
    lastUpdateTime: Date.now() - 86400000 * 300,
    isSystemApp: true,
    icon: null,
    permissions: [
      { name: "android.permission.WRITE_SETTINGS", granted: true },
      { name: "android.permission.MANAGE_USERS", granted: true },
    ],
  },
];

export const AppEnumerationDebugScreen: React.FC = () => {
  const [apps, setApps] = useState<AppEnumerationResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterTab, setFilterTab] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<AppEnumerationResult | null>(
    null
  );

  const fetchApps = useCallback(async () => {
    try {
      setErrorMsg(null);
      const data = await getInstalledApps();
      if (data && data.length > 0) {
        setApps(data);
      } else {
        setApps(MOCK_APPS);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to enumerate native apps");
      setApps(MOCK_APPS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchApps();
  };

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchesSearch =
        app.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.packageName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterTab === "user") return !app.isSystemApp;
      if (filterTab === "system") return app.isSystemApp;
      return true;
    });
  }, [apps, searchQuery, filterTab]);

  const stats = useMemo(() => {
    const total = apps.length;
    const userApps = apps.filter((a) => !a.isSystemApp).length;
    const systemApps = apps.filter((a) => a.isSystemApp).length;
    const totalPermissions = apps.reduce(
      (acc, app) => acc + app.permissions.length,
      0
    );
    return { total, userApps, systemApps, totalPermissions };
  }, [apps]);

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Installed App Enumeration</Text>
        <Text style={styles.subtitle}>On-Device Package & Permission Audit</Text>
      </View>

      {errorMsg && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>
            Native module notice: {errorMsg} (showing fallback data)
          </Text>
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Apps</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.userApps}</Text>
          <Text style={styles.statLabel}>User Apps</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.systemApps}</Text>
          <Text style={styles.statLabel}>System Apps</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.accent }]}>
            {stats.totalPermissions}
          </Text>
          <Text style={styles.statLabel}>Permissions</Text>
        </View>
      </View>

      <View style={styles.controlsSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Filter by app or package name..."
          placeholderTextColor={colors.foregroundSubtle}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />

        <SegmentedControl
          options={[
            { label: "All Apps", value: "all" },
            { label: "User Apps", value: "user" },
            { label: "System Apps", value: "system" },
          ]}
          selectedValue={filterTab}
          onValueChange={setFilterTab}
        />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Enumerating packages...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredApps}
          keyExtractor={(item) => item.packageName}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No packages match filter criteria.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const grantedCount = item.permissions.filter((p) => p.granted).length;
            const sourceLabel = item.installSource.includes("vending")
              ? "Google Play"
              : item.installSource === "system"
              ? "System Preinstall"
              : item.installSource;

            return (
              <CardGroup style={styles.appCardGroup}>
                <ListRow
                  title={item.displayName}
                  subtitle={item.packageName}
                  useMonoSubtitle
                  leftIcon={
                    item.icon ? (
                      <Image source={{ uri: item.icon }} style={styles.appIcon} />
                    ) : (
                      <View style={styles.appIconPlaceholder}>
                        <Text style={styles.appIconText}>
                          {item.displayName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )
                  }
                  rightElement={
                    <Badge
                      label={item.isSystemApp ? "SYSTEM" : "USER"}
                      variant={item.isSystemApp ? "neutral" : "safe"}
                    />
                  }
                  onPress={() => setSelectedApp(item)}
                />

                <View style={styles.appCardDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Install Source:</Text>
                    <Text style={styles.detailValue}>{sourceLabel}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Updated:</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(item.lastUpdateTime)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Permissions:</Text>
                    <TouchableOpacity
                      onPress={() => setSelectedApp(item)}
                      style={styles.permissionBadgeTouch}
                    >
                      <Text style={styles.permissionBadgeText}>
                        {grantedCount} granted / {item.permissions.length} total ›
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </CardGroup>
            );
          }}
        />
      )}

      {selectedApp && (
        <Modal
          animationType="slide"
          transparent
          visible={!!selectedApp}
          onRequestClose={() => setSelectedApp(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderTitleRow}>
                  {selectedApp.icon ? (
                    <Image source={{ uri: selectedApp.icon }} style={styles.appIconModal} />
                  ) : (
                    <View style={styles.appIconPlaceholder}>
                      <Text style={styles.appIconText}>
                        {selectedApp.displayName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.modalHeaderMeta}>
                    <Text style={styles.modalTitle}>{selectedApp.displayName}</Text>
                    <Text style={styles.modalSubtitle}>{selectedApp.packageName}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => setSelectedApp(null)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSectionTitle}>
                Declared Permissions ({selectedApp.permissions.length})
              </Text>

              <ScrollView style={styles.modalScrollView}>
                {selectedApp.permissions.length === 0 ? (
                  <Text style={styles.noPermsText}>No requested permissions declared.</Text>
                ) : (
                  selectedApp.permissions.map((perm, index) => {
                    const shortName = perm.name.replace("android.permission.", "");
                    return (
                      <View key={index} style={styles.permRow}>
                        <View style={styles.permInfo}>
                          <Text style={styles.permName}>{shortName}</Text>
                          <Text style={styles.permFullName}>{perm.name}</Text>
                        </View>
                        <Badge
                          label={perm.granted ? "GRANTED" : "DENIED"}
                          variant={perm.granted ? "safe" : "high"}
                          useMono
                        />
                      </View>
                    );
                  })
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontFamily: fonts.sansBold,
    fontSize: fontSizes.lg,
    color: colors.foreground,
  },
  subtitle: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    color: colors.foregroundSubtle,
    marginTop: spacing.xs,
  },
  errorBanner: {
    backgroundColor: colors.warningDim,
    borderColor: colors.warningBorder,
    borderWidth: 1,
    padding: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: radii.control,
  },
  errorText: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.xs,
    color: colors.warning,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.control,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  statNumber: {
    fontFamily: fonts.monoBold,
    fontSize: fontSizes.base,
    color: colors.foreground,
  },
  statLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: colors.foregroundSubtle,
    marginTop: 2,
  },
  controlsSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    backgroundColor: colors.surface1,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.control,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.foreground,
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.sm,
    color: colors.foregroundMuted,
    marginTop: spacing.md,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    color: colors.foregroundMuted,
  },
  appCardGroup: {
    marginBottom: spacing.xs,
  },
  appIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.avatar,
  },
  appIconModal: {
    width: 44,
    height: 44,
    borderRadius: radii.avatar,
  },
  appIconPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: radii.avatar,
    backgroundColor: colors.surface2,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  appIconText: {
    fontFamily: fonts.monoBold,
    fontSize: fontSizes.md,
    color: colors.accent,
  },
  appCardDetails: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface1,
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.xs,
    color: colors.foregroundSubtle,
  },
  detailValue: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    color: colors.foregroundMuted,
  },
  permissionBadgeTouch: {
    paddingVertical: 2,
  },
  permissionBadgeText: {
    fontFamily: fonts.monoMedium,
    fontSize: fontSizes.xs,
    color: colors.accent,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.surface1,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    maxHeight: "80%",
    padding: spacing.lg,
    borderColor: colors.borderStrong,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  modalHeaderMeta: {
    flex: 1,
  },
  modalTitle: {
    fontFamily: fonts.sansBold,
    fontSize: fontSizes.base,
    color: colors.foreground,
  },
  modalSubtitle: {
    fontFamily: fonts.mono,
    fontSize: fontSizes.xs,
    color: colors.foregroundSubtle,
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeButtonText: {
    fontFamily: fonts.sansBold,
    fontSize: fontSizes.lg,
    color: colors.foregroundMuted,
  },
  modalSectionTitle: {
    fontFamily: fonts.sansSemiBold,
    fontSize: fontSizes.sm,
    color: colors.foregroundMuted,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  modalScrollView: {
    maxHeight: 360,
  },
  noPermsText: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.sm,
    color: colors.foregroundSubtle,
    paddingVertical: spacing.md,
  },
  permRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  permInfo: {
    flex: 1,
    paddingRight: spacing.md,
  },
  permName: {
    fontFamily: fonts.sansMedium,
    fontSize: fontSizes.sm,
    color: colors.foreground,
  },
  permFullName: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.foregroundSubtle,
    marginTop: 2,
  },
});
