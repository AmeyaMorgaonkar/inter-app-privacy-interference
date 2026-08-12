package expo.modules.packagemanager

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * PackageManager native module skeleton.
 *
 * Wraps Android's PackageManager API to enumerate installed apps,
 * permission grants, install sources, and install dates.
 *
 * Currently only exposes a ping() function for build verification.
 * Real functionality will be added in Milestone 3.
 */
class PackageManagerModule : Module() {
    override fun definition() = ModuleDefinition {
        // The JS-visible module name — must match requireNativeModule("PackageManager")
        Name("PackageManager")

        // Simple build-verification function
        Function("ping") {
            "pong"
        }
    }
}
