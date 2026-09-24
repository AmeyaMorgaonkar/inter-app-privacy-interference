package expo.modules.packagemanager

import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.Drawable
import android.os.Build
import android.util.Base64
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.ByteArrayOutputStream

class PackageManagerModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("PackageManager")

        Function("ping") {
            "pong"
        }

        AsyncFunction("getInstalledApps") {
            val context = appContext.reactContext ?: return@AsyncFunction emptyList<Map<String, Any?>>()
            val pm = context.packageManager

            val packages: List<PackageInfo> = try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    pm.getInstalledPackages(PackageManager.PackageInfoFlags.of(PackageManager.GET_PERMISSIONS.toLong()))
                } else {
                    @Suppress("DEPRECATION")
                    pm.getInstalledPackages(PackageManager.GET_PERMISSIONS)
                }
            } catch (e: Exception) {
                emptyList()
            }

            packages.map { pkg ->
                val appInfo = pkg.applicationInfo
                val isSystem = appInfo != null && (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0
                val displayName = appInfo?.let { pm.getApplicationLabel(it).toString() } ?: pkg.packageName
                val installSource = getInstallSource(pm, pkg.packageName)
                val iconBase64 = appInfo?.let { getAppIconBase64(pm, it) }

                val permissionsList = mutableListOf<Map<String, Any>>()
                pkg.requestedPermissions?.forEach { perm ->
                    val isGranted = pm.checkPermission(perm, pkg.packageName) == PackageManager.PERMISSION_GRANTED
                    permissionsList.add(
                        mapOf(
                            "name" to perm,
                            "granted" to isGranted
                        )
                    )
                }

                mapOf(
                    "packageName" to pkg.packageName,
                    "displayName" to displayName,
                    "installSource" to (installSource ?: "unknown"),
                    "firstInstallTime" to pkg.firstInstallTime,
                    "lastUpdateTime" to pkg.lastUpdateTime,
                    "isSystemApp" to isSystem,
                    "icon" to iconBase64,
                    "permissions" to permissionsList
                )
            }
        }
    }

    private fun getInstallSource(pm: PackageManager, packageName: String): String? {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                pm.getInstallSourceInfo(packageName).installingPackageName
            } else {
                @Suppress("DEPRECATION")
                pm.getInstallerPackageName(packageName)
            }
        } catch (e: Exception) {
            null
        }
    }

    private fun getAppIconBase64(pm: PackageManager, appInfo: ApplicationInfo): String? {
        return try {
            val drawable = pm.getApplicationIcon(appInfo)
            val bitmap = drawableToBitmap(drawable)
            val outputStream = ByteArrayOutputStream()
            bitmap.compress(Bitmap.CompressFormat.PNG, 80, outputStream)
            val byteArray = outputStream.toByteArray()
            "data:image/png;base64," + Base64.encodeToString(byteArray, Base64.NO_WRAP)
        } catch (e: Exception) {
            null
        }
    }

    private fun drawableToBitmap(drawable: Drawable): Bitmap {
        val size = 64
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        drawable.setBounds(0, 0, canvas.width, canvas.height)
        drawable.draw(canvas)
        return bitmap
    }
}
