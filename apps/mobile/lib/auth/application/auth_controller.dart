import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/storage/session_storage.dart';
import '../data/auth_repository.dart';
import '../domain/user_session.dart';

final authControllerProvider =
    AsyncNotifierProvider<AuthController, UserSession?>(AuthController.new);

class AuthController extends AsyncNotifier<UserSession?> {
  late final AuthRepository _repository = ref.read(authRepositoryProvider);
  late final SessionStorage _storage = ref.read(sessionStorageProvider);

  @override
  Future<UserSession?> build() {
    return _storage.read();
  }

  Future<void> login({
    required String email,
    required String password,
  }) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final session = await _repository.login(email: email, password: password);
      await _storage.save(session);
      return session;
    });
  }

  Future<void> register({
    required String email,
    required String password,
  }) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final session = await _repository.register(
        email: email,
        password: password,
      );
      await _storage.save(session);
      return session;
    });
  }

  Future<void> completeOnboarding() async {
    final session = state.asData?.value;
    if (session == null) {
      return;
    }

    final updated = session.copyWith(onboardingCompleted: true);
    await _storage.save(updated);
    state = AsyncData(updated);
  }

  Future<void> logout() async {
    final session = state.asData?.value;
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      if (session != null) {
        await _repository.logout(session.refreshToken);
      }
      await _storage.clear();
      return null;
    });
  }
}
