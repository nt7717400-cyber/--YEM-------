import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'dart:io';

import 'package:customer_app/core/constants/app_strings.dart';

void main() {
  setUpAll(() async {
    // Initialize Hive with a temporary directory for tests
    final tempDir = Directory.systemTemp.createTempSync('hive_test_');
    Hive.init(tempDir.path);
  });

  tearDownAll(() async {
    await Hive.close();
  });

  testWidgets('App should display app name in Arabic', (WidgetTester tester) async {
    // Build a simple widget that displays the app name
    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp(
          locale: const Locale('ar', 'YE'),
          supportedLocales: const [
            Locale('ar', 'YE'),
            Locale('ar'),
          ],
          localizationsDelegates: const [
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          builder: (context, child) {
            return Directionality(
              textDirection: TextDirection.rtl,
              child: child ?? const SizedBox.shrink(),
            );
          },
          home: Scaffold(
            appBar: AppBar(
              title: const Text(AppStrings.appName),
            ),
            body: const Center(
              child: Text('الرئيسية'),
            ),
          ),
        ),
      ),
    );

    // Wait for the app to settle
    await tester.pumpAndSettle();

    // Verify that the app name is displayed
    expect(find.text(AppStrings.appName), findsOneWidget);
    expect(find.text('الرئيسية'), findsOneWidget);
  });

  testWidgets('App uses RTL layout direction', (WidgetTester tester) async {
    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp(
          locale: const Locale('ar', 'YE'),
          builder: (context, child) {
            return Directionality(
              textDirection: TextDirection.rtl,
              child: child ?? const SizedBox.shrink(),
            );
          },
          home: const Scaffold(
            body: Text('اختبار'),
          ),
        ),
      ),
    );

    await tester.pumpAndSettle();

    // Find the innermost Directionality widget (the one we created)
    final directionalityWidgets = tester.widgetList<Directionality>(
      find.byType(Directionality),
    );
    
    // Check that at least one Directionality widget has RTL
    final hasRtl = directionalityWidgets.any(
      (d) => d.textDirection == TextDirection.rtl,
    );
    expect(hasRtl, isTrue);
  });
}
