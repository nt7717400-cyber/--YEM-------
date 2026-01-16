#!/bin/bash
# سكريبت بناء التطبيق المحسّن
# Yemen Car Showroom - Optimized Build Script

echo "🚀 بدء بناء التطبيق المحسّن..."

# تنظيف البناء السابق
echo "🧹 تنظيف الملفات السابقة..."
flutter clean

# تحديث المكتبات
echo "📦 تحديث المكتبات..."
flutter pub get

# بناء APK مقسم حسب المعالج (أفضل للتوزيع المباشر)
echo "📱 بناء APK مقسم حسب المعالج..."
flutter build apk --release --split-per-abi --obfuscate --split-debug-info=build/debug-info

# بناء App Bundle (للرفع على Google Play)
echo "🏪 بناء App Bundle لـ Google Play..."
flutter build appbundle --release --obfuscate --split-debug-info=build/debug-info

# عرض أحجام الملفات الناتجة
echo ""
echo "✅ اكتمل البناء!"
echo "📊 أحجام الملفات:"
echo ""

if [ -d "build/app/outputs/flutter-apk" ]; then
    ls -lh build/app/outputs/flutter-apk/*.apk 2>/dev/null
fi

if [ -f "build/app/outputs/bundle/release/app-release.aab" ]; then
    ls -lh build/app/outputs/bundle/release/app-release.aab
fi

echo ""
echo "📍 مواقع الملفات:"
echo "   APKs: build/app/outputs/flutter-apk/"
echo "   AAB:  build/app/outputs/bundle/release/"
