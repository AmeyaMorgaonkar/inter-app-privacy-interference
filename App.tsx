import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
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
import { colors, fonts, spacing } from "./src/theme/tokens";
import { supabase } from "./src/lib/supabase";

export default function App() {
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
              ? "✅ Connected"
              : `Error: ${error.message}`
          );
        } else {
          setSupabasePing("✅ Connected");
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

      <ComponentGallery />
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
});

