import { requireNativeModule } from "expo-modules-core";

export interface PermissionDetail {
  name: string;
  granted: boolean;
}

export interface AppEnumerationResult {
  packageName: string;
  displayName: string;
  installSource: string;
  firstInstallTime: number;
  lastUpdateTime: number;
  isSystemApp: boolean;
  icon: string | null;
  permissions: PermissionDetail[];
}

const PackageManagerModule = requireNativeModule("PackageManager");

export function ping(): string {
  return PackageManagerModule.ping();
}

export async function getInstalledApps(): Promise<AppEnumerationResult[]> {
  return await PackageManagerModule.getInstalledApps();
}
