// ARBORIS AI - Login View
// F-47 AR HUD Authentication Interface

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/auth_service.dart';

class LoginView extends StatefulWidget {
  const LoginView({super.key});

  @override
  State<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> {
  bool _isLoading = false;
  String? _errorMessage;

  Future<void> _handleGoogleSignIn() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await AuthService.instance.signInWithGoogle();
    } catch (e) {
      setState(() {
        _errorMessage = 'Authentication failed. Please try again.';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          color: Color(0xFF0A0A0A), // Negro-Vácuo
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Back button
                  Align(
                    alignment: Alignment.topLeft,
                    child: IconButton(
                      icon: const Icon(
                        Icons.arrow_back,
                        color: Color(0xFF00D9FF),
                      ),
                      onPressed: () {
                        // Navigation placeholder
                      },
                    ),
                  ),
                  
                  const SizedBox(height: 60),
                  
                  // ARBORIS AI Title
                  Text(
                    'ARBORIS AI',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 48,
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFF00D9FF), // Azul-Gênese
                      letterSpacing: 4,
                    ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Subtitle
                  Text(
                    'Join Arboris AI OS 1',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 16,
                      color: const Color(0xFF00D9FF).withOpacity(0.7),
                      letterSpacing: 1.5,
                    ),
                  ),
                  
                  const SizedBox(height: 60),
                  
                  // Error message
                  if (_errorMessage != null)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      margin: const EdgeInsets.only(bottom: 24),
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.1),
                        border: Border.all(color: Colors.red, width: 1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        _errorMessage!,
                        style: GoogleFonts.spaceGrotesk(
                          color: Colors.red,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  
                  // Google Sign In Button
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _handleGoogleSignIn,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00D9FF),
                        foregroundColor: const Color(0xFF0A0A0A),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  Color(0xFF0A0A0A),
                                ),
                              ),
                            )
                          : Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.g_mobiledata, size: 28),
                                const SizedBox(width: 12),
                                Text(
                                  'CONECTAR COM GOOGLE',
                                  style: GoogleFonts.spaceGrotesk(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 1.5,
                                  ),
                                ),
                              ],
                            ),
                    ),
                  ),
                  
                  const SizedBox(height: 24),
                  
                  // Sign In Link
                  TextButton(
                    onPressed: () {
                      // Navigation placeholder
                    },
                    child: Text(
                      'Already have an account? Sign In',
                      style: GoogleFonts.spaceGrotesk(
                        color: const Color(0xFF00D9FF),
                        fontSize: 14,
                        letterSpacing: 1,
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 60),
                  
                  // F-47 AR HUD Badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: const Color(0xFF00D9FF).withOpacity(0.3),
                        width: 1,
                      ),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'F-47 AR HUD Protocol',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 12,
                        color: const Color(0xFF00D9FF).withOpacity(0.5),
                        letterSpacing: 2,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
