// ARBORIS AI - Authentication Service
// F-47 AR HUD Identity Protocol

import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  
  // CRÍTICO: OAuth Client ID - CHAVE 3
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    clientId: '537123553346-m5bv9uj1bf6bfb17p7344b03t291ir1g.apps.googleusercontent.com',
    scopes: [
      'email',
      'profile',
    ],
  );
  
  AuthService._();
  
  static final AuthService instance = AuthService._();
  
  /// Get current user
  User? get currentUser => _auth.currentUser;
  
  /// Auth state changes stream
  Stream<User?> get authStateChanges => _auth.authStateChanges();
  
  /// Sign in with Google
  Future<UserCredential?> signInWithGoogle() async {
    try {
      // Trigger the Google Sign In flow
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      
      if (googleUser == null) {
        // User canceled the sign-in
        return null;
      }
      
      // Obtain the auth details from the request
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      
      // Create a new credential
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );
      
      // Sign in to Firebase with the Google credential
      return await _auth.signInWithCredential(credential);
    } catch (e) {
      print('Error signing in with Google: $e');
      rethrow;
    }
  }
  
  /// Sign out
  Future<void> signOut() async {
    await Future.wait([
      _auth.signOut(),
      _googleSignIn.signOut(),
    ]);
  }
  
  /// Check if user is authenticated
  bool get isAuthenticated => currentUser != null;
  
  /// Get user display name
  String? get userDisplayName => currentUser?.displayName;
  
  /// Get user email
  String? get userEmail => currentUser?.email;
  
  /// Get user photo URL
  String? get userPhotoUrl => currentUser?.photoURL;
}
