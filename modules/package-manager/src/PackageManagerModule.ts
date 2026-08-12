import { requireNativeModule } from "expo-modules-core";

/**
 * PackageManager native module — wraps Android's PackageManager API.
 *
 * Currently a skeleton that only exposes a `ping()` function for
 * build verification. Real functionality will be added in Milestone 3.
 */

// The native module is autolinked via expo-module.config.json.
// The string must match the module name defined in the Kotlin class.
const PackageManagerModule = requireNativeModule("PackageManager");

export function ping(): string {
  return PackageManagerModule.ping();
}
