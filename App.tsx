import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ping } from "./modules/package-manager";
import { supabase } from "./src/lib/supabase";

export default function App() {
  const [nativePing, setNativePing] = useState<string>("…");
  const [supabasePing, setSupabasePing] = useState<string>("…");

  useEffect(() => {
    try {
      const result = ping();
      setNativePing(result);
    } catch (err: any) {
      setNativePing(`Error: ${err.message}`);
    }

    (async () => {
      try {
        const { data, error } = await supabase.rpc("", {});
        if (error) {
          setSupabasePing(
            error.message.includes("function")
              ? "✅ Connected (no RPC defined yet)"
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Privacy Interference</Text>
      <Text style={styles.subtitle}>Milestone 1 — Scaffolding</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Kotlin Module:</Text>
        <Text style={styles.value}>ping() → {nativePing}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Supabase:</Text>
        <Text style={styles.value}>{supabasePing}</Text>
      </View>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "#666666",
    fontSize: 14,
    marginBottom: 32,
  },
  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 12,
  },
  label: {
    color: "#888888",
    fontSize: 12,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  value: {
    color: "#4ADE80",
    fontSize: 16,
    fontWeight: "600",
  },
});
