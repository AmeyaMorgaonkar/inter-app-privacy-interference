import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  useFonts,
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from "@expo-google-fonts/geist";
import {
  GeistMono_400Regular,
  GeistMono_500Medium,
  GeistMono_600SemiBold,
  GeistMono_700Bold,
} from "@expo-google-fonts/geist-mono";

import { ping } from "./modules/package-manager";
import { ComponentGallery } from "./src/screens/ComponentGallery";
import { AppEnumerationDebugScreen } from "./src/screens/AppEnumerationDebugScreen";
import { colors, fonts, spacing } from "./src/theme/tokens";
import { supabase } from "./src/lib/supabase";

export default function App() {
  const [activeScreen, setActiveScreen] = useState<"enumeration" | "gallery">(
    "enumeration"
  );
  const [nativePing, setNativePing] = useState<string>("…");
  const [supabasePing, setSupabasePing] = useState<string>("…");

  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    GeistMono_400Regular,
    GeistMono_500Medium,
    GeistMono_600SemiBold,
    GeistMono_700Bold,
  });

  useEffect(() => {
    try {
      const result = ping();
      setNativePing(result);
    } catch (err: any) {
      setNativePing(`Error: ${err.message}`);
    }

    (async () => {
      try {
        const { error } = await supabase.rpc("", {});
        if (error) {
          setSupabasePing(
            error.message.includes("function")
              ? "Connected"
              : `Error: ${error.message}`
          );
        } else {
          setSupabasePing("Connected");
        }
      } catch (err: any) {
        setSupabasePing(`Error: ${err.message}`);
      }
    })();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.statusBarCard}>
        <Text style={styles.statusText}>
          Kotlin: <Text style={styles.monoValue}>{nativePing}</Text> | Supabase:{" "}
          <Text style={styles.monoValue}>{supabasePing}</Text>
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeScreen === "enumeration" && styles.activeTabButton,
          ]}
          onPress={() => setActiveScreen("enumeration")}
        >
          <Text
            style={[
              styles.tabText,
              activeScreen === "enumeration" && styles.activeTabText,
            ]}
          >
            App Enumeration
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeScreen === "gallery" && styles.activeTabButton,
          ]}
          onPress={() => setActiveScreen("gallery")}
        >
          <Text
            style={[
              styles.tabText,
              activeScreen === "gallery" && styles.activeTabText,
            ]}
          >
            Component Gallery
          </Text>
        </TouchableOpacity>
      </View>

      {activeScreen === "enumeration" ? (
        <AppEnumerationDebugScreen />
      ) : (
        <ComponentGallery />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.xxxl,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  statusBarCard: {
    backgroundColor: colors.surface2,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.foregroundMuted,
  },
  monoValue: {
    fontFamily: fonts.mono,
    color: colors.accent,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.surface1,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomColor: colors.accent,
  },
  tabText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.foregroundMuted,
  },
  activeTabText: {
    color: colors.foreground,
    fontFamily: fonts.sansSemiBold,
  },
});
