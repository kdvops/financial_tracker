# Mobile App

Base Flutter app for `financial_tracker`.

Current state:

- Flutter-style project structure created manually inside the monorepo.
- Riverpod, Dio, GoRouter, and secure storage wired at the Dart layer.
- Android notification bridge modeled from Dart with `MethodChannel` and `EventChannel`.

Pending on this machine:

- Flutter SDK is not available in `PATH`, so `flutter create`, `flutter pub get`, `flutter run`, and Android builds have not been executed yet.
- Native Android host files (`android/`) should be generated with `flutter create .` once Flutter is installed, then the Kotlin notification listener can be added.

Suggested next commands after installing Flutter:

```powershell
cd C:\Repositorio\financial_tracker\apps\mobile
flutter create .
flutter pub get
flutter run
```

