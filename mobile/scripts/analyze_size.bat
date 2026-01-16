@echo off
REM تحليل حجم التطبيق
echo 📊 تحليل حجم التطبيق...
call flutter build apk --analyze-size --target-platform android-arm64
echo.
echo 💡 افتح الرابط أعلاه في المتصفح لرؤية تفاصيل الحجم
pause
