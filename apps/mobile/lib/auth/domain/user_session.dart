class UserSession {
  const UserSession({
    required this.accessToken,
    required this.refreshToken,
    required this.email,
    required this.onboardingCompleted,
  });

  final String accessToken;
  final String refreshToken;
  final String email;
  final bool onboardingCompleted;

  UserSession copyWith({
    String? accessToken,
    String? refreshToken,
    String? email,
    bool? onboardingCompleted,
  }) {
    return UserSession(
      accessToken: accessToken ?? this.accessToken,
      refreshToken: refreshToken ?? this.refreshToken,
      email: email ?? this.email,
      onboardingCompleted: onboardingCompleted ?? this.onboardingCompleted,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'accessToken': accessToken,
      'refreshToken': refreshToken,
      'email': email,
      'onboardingCompleted': onboardingCompleted,
    };
  }

  factory UserSession.fromJson(Map<String, dynamic> json) {
    return UserSession(
      accessToken: json['accessToken'] as String? ?? '',
      refreshToken: json['refreshToken'] as String? ?? '',
      email: json['email'] as String? ?? '',
      onboardingCompleted: json['onboardingCompleted'] as bool? ?? false,
    );
  }
}

