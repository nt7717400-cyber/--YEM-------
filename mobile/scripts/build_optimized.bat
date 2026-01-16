@echo off
REM سكريبت بناء التطبيق المحسّن - Windows
REM Yemen Car Showroom - Optimized Build Script

echo 🚀 بدء بناء التطبيق المحسّن...

REM تنظيف البناء السابق
echo 🧹 تنظيف الملفات السابقة...
call flutter clean

REM تحديث المكتبات
echo 📦 تحديث المكتبات...
call flutter pub get

REM بناء APK مقسم حسب المعالج
echo 📱 بناء APK مقسم حسب المعالج...
call flutter build apk --release --split-per-abi --obfuscate --split-debug-info=build/debug-info

REM بناء App Bundle
echo 🏪 بناء App Bundle لـ Google Play...
call flutter build appbundle --release --obfuscate --split-debug-info=build/debug-info

echo.
echo ✅ اكتمل البناء!
echo 📊 أحجام الملفات:
echo.

dir /s build\app\outputs\flutter-apk\*.apk 2>nul
dir build\app\outputs\bundle\release\*.aab 2>nul

echo.
echo 📍 مواقع الملفات:
echo    APKs: build\app\outputs\flutter-apk\
echo    AAB:  build\app\outputs\bundle\release\
pause
