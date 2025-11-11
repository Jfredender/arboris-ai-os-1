// ARBORIS AI OS 1 - Genesis Foundation
// F-47 AR HUD Protocol

import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:google_fonts/google_fonts.dart';
import 'firebase_options.dart';
import 'services/auth_service.dart';
import 'views/login_view.dart';
import 'views/home_view.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  
  runApp(const ArborisGenesisApp());
}

class ArborisGenesisApp extends StatelessWidget {
  const ArborisGenesisApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ARBORIS AI OS 1',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        // F-47 AR HUD Color Scheme
        scaffoldBackgroundColor: const Color(0xFF0A0A0A), // Negro-Vácuo
        primaryColor: const Color(0xFF00D9FF), // Azul-Gênese
        colorScheme: ColorScheme.dark(
          primary: const Color(0xFF00D9FF),
          secondary: const Color(0xFF00D9FF),
          surface: const Color(0xFF0A0A0A),
          background: const Color(0xFF0A0A0A),
          onPrimary: const Color(0xFF0A0A0A),
          onSecondary: const Color(0xFF0A0A0A),
          onSurface: const Color(0xFF00D9FF),
          onBackground: const Color(0xFF00D9FF),
        ),
        
        // Space Grotesk Typography
        textTheme: GoogleFonts.spaceGroteskTextTheme(
          ThemeData.dark().textTheme,
        ).apply(
          bodyColor: const Color(0xFF00D9FF),
          displayColor: const Color(0xFF00D9FF),
        ),
        
        // Button Theme
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF00D9FF),
            foregroundColor: const Color(0xFF0A0A0A),
            textStyle: GoogleFonts.spaceGrotesk(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.2,
            ),
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        ),
        
        // Input Decoration Theme
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: const Color(0xFF1A1A1A),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: Color(0xFF00D9FF), width: 1),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: Color(0xFF00D9FF), width: 1),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: Color(0xFF00D9FF), width: 2),
          ),
          labelStyle: GoogleFonts.spaceGrotesk(
            color: const Color(0xFF00D9FF),
          ),
          hintStyle: GoogleFonts.spaceGrotesk(
            color: const Color(0xFF00D9FF).withOpacity(0.5),
          ),
        ),
      ),
      home: const AuthGate(),
    );
  }
}

/// Auth Gate with StreamBuilder
class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder(
      stream: AuthService.instance.authStateChanges,
      builder: (context, snapshot) {
        // Loading state
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(
                color: Color(0xFF00D9FF),
              ),
            ),
          );
        }
        
        // User is signed in
        if (snapshot.hasData) {
          return const HomeView();
        }
        
        // User is not signed in
        return const LoginView();
      },
    );
  }
}
