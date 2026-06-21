import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../auth/application/auth_controller.dart';
import '../../auth/presentation/login_page.dart';
import '../../dashboard/presentation/dashboard_page.dart';
import '../../onboarding/presentation/onboarding_page.dart';
import '../../splash/presentation/splash_page.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authControllerProvider);

  return GoRouter(
    initialLocation: '/splash',
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashPage(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingPage(),
      ),
      GoRoute(
        path: '/dashboard',
        builder: (context, state) => const DashboardPage(),
      ),
    ],
    redirect: (context, state) {
      final location = state.matchedLocation;
      final isBooting = authState.isLoading;
      final session = authState.asData?.value;

      if (isBooting) {
        return location == '/splash' ? null : '/splash';
      }

      if (session == null) {
        return location == '/login' ? null : '/login';
      }

      if (!session.onboardingCompleted) {
        return location == '/onboarding' ? null : '/onboarding';
      }

      return location == '/dashboard' ? null : '/dashboard';
    },
  );
});
