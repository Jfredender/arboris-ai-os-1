// ARBORIS AI - Home View
// F-47 AR HUD Command Center

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../services/auth_service.dart';
import '../services/gemini_service.dart';
import 'chat_view.dart';

class HomeView extends StatefulWidget {
  const HomeView({super.key});

  @override
  State<HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> {
  final ImagePicker _picker = ImagePicker();
  bool _isAnalyzing = false;
  
  @override
  void initState() {
    super.initState();
    // Inicializar Gemini Service
    GeminiService.instance.initialize();
  }
  
  /// Abre a câmera ou galeria para análise de planta
  Future<void> _analyzePlant() async {
    try {
      // Mostrar opções: Câmera ou Galeria
      final source = await showModalBottomSheet<ImageSource>(
        context: context,
        backgroundColor: const Color(0xFF1A1A1A),
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        builder: (context) => Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'SELECIONAR IMAGEM',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF00D9FF),
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(height: 24),
              ListTile(
                leading: const Icon(Icons.camera_alt, color: Color(0xFF00D9FF)),
                title: Text(
                  'Câmera',
                  style: GoogleFonts.spaceGrotesk(color: const Color(0xFF00D9FF)),
                ),
                onTap: () => Navigator.pop(context, ImageSource.camera),
              ),
              ListTile(
                leading: const Icon(Icons.photo_library, color: Color(0xFF00D9FF)),
                title: Text(
                  'Galeria',
                  style: GoogleFonts.spaceGrotesk(color: const Color(0xFF00D9FF)),
                ),
                onTap: () => Navigator.pop(context, ImageSource.gallery),
              ),
            ],
          ),
        ),
      );
      
      if (source == null) return;
      
      // Capturar imagem
      final XFile? image = await _picker.pickImage(
        source: source,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );
      
      if (image == null) return;
      
      setState(() {
        _isAnalyzing = true;
      });
      
      // Analisar com Gemini
      final userId = AuthService.instance.currentUser?.uid ?? 'guest';
      final analysis = await GeminiService.instance.analyzeImage(
        File(image.path),
        userId: userId,
      );
      
      setState(() {
        _isAnalyzing = false;
      });
      
      // Mostrar resultado
      if (mounted) {
        _showAnalysisResult(analysis);
      }
      
    } catch (e) {
      setState(() {
        _isAnalyzing = false;
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Erro ao analisar imagem: $e',
              style: GoogleFonts.spaceGrotesk(),
            ),
            backgroundColor: Colors.red.shade900,
          ),
        );
      }
    }
  }
  
  /// Mostra o resultado da análise
  void _showAnalysisResult(analysis) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1A1A1A),
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) => SingleChildScrollView(
          controller: scrollController,
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: const Color(0xFF00D9FF).withOpacity(0.3),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              
              Text(
                'ANÁLISE COMPLETA',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF00D9FF),
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(height: 24),
              
              // Espécie
              _buildInfoCard(
                '🌿 Espécie',
                analysis.species,
                'Confiança: ${(analysis.confidence * 100).toStringAsFixed(1)}%',
              ),
              
              // Saúde
              _buildInfoCard(
                '💚 Saúde',
                analysis.healthStatus,
              ),
              
              // Características
              if (analysis.characteristics.isNotEmpty)
                _buildInfoCard(
                  '🔍 Características',
                  analysis.characteristics.join('\n• '),
                ),
              
              // Descrição
              _buildInfoCard(
                '📖 Descrição',
                analysis.description,
              ),
              
              // Informações adicionais
              if (analysis.additionalInfo['benefits'] != null &&
                  (analysis.additionalInfo['benefits'] as List).isNotEmpty)
                _buildInfoCard(
                  '✨ Benefícios',
                  (analysis.additionalInfo['benefits'] as List).join('\n• '),
                ),
              
              const SizedBox(height: 24),
              
              // Botão Fechar
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00D9FF),
                    foregroundColor: const Color(0xFF0A0A0A),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: Text(
                    'FECHAR',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildInfoCard(String title, String content, [String? subtitle]) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0A0A0A),
        border: Border.all(
          color: const Color(0xFF00D9FF).withOpacity(0.3),
          width: 1,
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: GoogleFonts.spaceGrotesk(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF00D9FF),
              letterSpacing: 1.5,
            ),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: GoogleFonts.spaceGrotesk(
                fontSize: 12,
                color: const Color(0xFF00D9FF).withOpacity(0.6),
              ),
            ),
          ],
          const SizedBox(height: 12),
          Text(
            content,
            style: GoogleFonts.spaceGrotesk(
              fontSize: 14,
              color: const Color(0xFF00D9FF).withOpacity(0.9),
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }
  
  /// Abre a tela de chat
  void _openChat() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const ChatView()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authService = AuthService.instance;
    final userName = authService.userDisplayName ?? 'Operator';
    final userEmail = authService.userEmail ?? '';
    final userPhotoUrl = authService.userPhotoUrl;

    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          color: Color(0xFF0A0A0A), // Negro-Vácuo
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'ARBORIS AI',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFF00D9FF),
                        letterSpacing: 2,
                      ),
                    ),
                    
                    // User Avatar
                    if (userPhotoUrl != null)
                      CircleAvatar(
                        radius: 20,
                        backgroundImage: NetworkImage(userPhotoUrl),
                        backgroundColor: const Color(0xFF00D9FF),
                      )
                    else
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: const Color(0xFF00D9FF),
                        child: Text(
                          userName[0].toUpperCase(),
                          style: GoogleFonts.spaceGrotesk(
                            color: const Color(0xFF0A0A0A),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                  ],
                ),
                
                const SizedBox(height: 60),
                
                // Welcome Message
                Center(
                  child: Column(
                    children: [
                      Text(
                        'BEM-VINDO AO',
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 16,
                          color: const Color(0xFF00D9FF).withOpacity(0.7),
                          letterSpacing: 3,
                        ),
                      ),
                      
                      const SizedBox(height: 16),
                      
                      Text(
                        'ARBORIS AI OS 1',
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 48,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF00D9FF),
                          letterSpacing: 4,
                        ),
                      ),
                      
                      const SizedBox(height: 24),
                      
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 12,
                        ),
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: const Color(0xFF00D9FF).withOpacity(0.3),
                            width: 1,
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Column(
                          children: [
                            Text(
                              userName,
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: const Color(0xFF00D9FF),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              userEmail,
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 14,
                                color: const Color(0xFF00D9FF).withOpacity(0.6),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                
                const Spacer(),
                
                // AI Features Buttons
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    children: [
                      // Botão Analisar Planta
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: _isAnalyzing ? null : _analyzePlant,
                          icon: _isAnalyzing
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Color(0xFF0A0A0A),
                                  ),
                                )
                              : const Icon(Icons.photo_camera, size: 24),
                          label: Text(
                            _isAnalyzing ? 'ANALISANDO...' : '📸 ANALISAR PLANTA',
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.5,
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF00D9FF),
                            foregroundColor: const Color(0xFF0A0A0A),
                            padding: const EdgeInsets.symmetric(vertical: 18),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 16),
                      
                      // Botão Chat com IA
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          onPressed: _openChat,
                          icon: const Icon(Icons.chat_bubble_outline, size: 24),
                          label: Text(
                            '💬 CHAT COM IA',
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.5,
                            ),
                          ),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFF00D9FF),
                            side: const BorderSide(
                              color: Color(0xFF00D9FF),
                              width: 2,
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 18),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 40),
                
                // Status Message
                Center(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF00D9FF).withOpacity(0.1),
                      border: Border.all(
                        color: const Color(0xFF00D9FF).withOpacity(0.3),
                        width: 1,
                      ),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '>>> SISTEMA OPERACIONAL INICIALIZADO\n>>> PROTOCOLO F-47 AR HUD ATIVO\n>>> AGUARDANDO COMANDOS...',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 12,
                        color: const Color(0xFF00D9FF),
                        letterSpacing: 1,
                        height: 1.6,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
                
                const SizedBox(height: 40),
                
                // Logout Button
                Center(
                  child: SizedBox(
                    width: 200,
                    child: OutlinedButton(
                      onPressed: () async {
                        await authService.signOut();
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF00D9FF),
                        side: const BorderSide(
                          color: Color(0xFF00D9FF),
                          width: 1,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: Text(
                        'DESCONECTAR',
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 2,
                        ),
                      ),
                    ),
                  ),
                ),
                
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
