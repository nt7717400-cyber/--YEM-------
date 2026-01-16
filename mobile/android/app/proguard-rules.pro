# Flutter ProGuard Rules
# تحسين حجم التطبيق مع الحفاظ على الوظائف

# Keep Flutter classes
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }
-keep class io.flutter.embedding.** { *; }

# Keep Google Play Core (required for Flutter)
-dontwarn com.google.android.play.core.**
-keep class com.google.android.play.core.** { *; }

# Keep Riverpod
-keep class * extends riverpod.** { *; }

# Keep Hive
-keep class * extends hive.** { *; }
-keepclassmembers class * extends hive.HiveObject {
    <fields>;
}

# Keep JSON serialization
-keepattributes *Annotation*
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Remove logging in release
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# Optimize
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-dontpreverify
-verbose

# Keep R classes
-keepclassmembers class **.R$* {
    public static <fields>;
}
