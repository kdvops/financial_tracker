import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:financial_tracker_mobile/app/app.dart';

void main() {
  testWidgets('app boots into splash state', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: FinancialTrackerApp()));

    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });
}
