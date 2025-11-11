// ARBORIS AI - Chat View
// Interface de chat com Gemini AI

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/gemini_service.dart';
import '../services/auth_service.dart';

class ChatView extends StatefulWidget {
  const ChatView({super.key});

  @override
  State<ChatView> createState() => _ChatViewState();
}

class _ChatViewState extends State<ChatView> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<ChatBubble> _messages = [];
  bool _isLoading = false;
  
  @override
  void initState() {
    super.initState();
    _loadWelcomeMessage();
  }
  
  void _loadWelcomeMessage() {
    setState(() {
      _messages.add(ChatBubble(
        message: 'Olá! Sou a ARBORIS AI, sua assistente especializada em '
            'biodiversidade e plantas. Como posso ajudá-lo hoje? 🌿',
        isUser: false,
        timestamp: DateTime.now(),
      ));
    });
  }
  
  Future<void> _sendMessage() async {
    final message = _messageController.text.trim();
    if (message.isEmpty) return;
    
    // Adicionar mensagem do usuário
    setState(() {
      _messages.add(ChatBubble(
        message: message,
        isUser: true,
        timestamp: DateTime.now(),
      ));
      _messageController.clear();
      _isLoading = true;
    });
    
    // Scroll para o final
    _scrollToBottom();
    
    try {
      final userId = AuthService.instance.currentUser?.uid ?? 'guest';
      
      // Adicionar bolha vazia para streaming
      setState(() {
        _messages.add(ChatBubble(
          message: '',
          isUser: false,
          timestamp: DateTime.now(),
          isStreaming: true,
        ));
      });
      
      // Stream de resposta do Gemini
      final responseBuffer = StringBuffer();
      
      await for (final chunk in GeminiService.instance.streamResponse(
        message,
        userId: userId,
      )) {
        responseBuffer.write(chunk);
        
        // Atualizar a última mensagem
        setState(() {
          _messages[_messages.length - 1] = ChatBubble(
            message: responseBuffer.toString(),
            isUser: false,
            timestamp: DateTime.now(),
            isStreaming: true,
          );
        });
        
        _scrollToBottom();
      }
      
      // Finalizar streaming
      setState(() {
        _messages[_messages.length - 1] = ChatBubble(
          message: responseBuffer.toString(),
          isUser: false,
          timestamp: DateTime.now(),
          isStreaming: false,
        );
      });
      
    } catch (e) {
      // Mostrar erro
      setState(() {
        _messages.add(ChatBubble(
          message: 'Desculpe, ocorreu um erro ao processar sua mensagem. '
              'Por favor, tente novamente.',
          isUser: false,
          timestamp: DateTime.now(),
          isError: true,
        ));
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
      _scrollToBottom();
    }
  }
  
  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }
  
  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0A0A),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF00D9FF)),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFF00D9FF).withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.eco,
                color: Color(0xFF00D9FF),
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'ARBORIS AI',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF00D9FF),
                    letterSpacing: 1.5,
                  ),
                ),
                Text(
                  'Assistente de Biodiversidade',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 10,
                    color: const Color(0xFF00D9FF).withOpacity(0.6),
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFF00D9FF)),
            onPressed: () {
              setState(() {
                _messages.clear();
                GeminiService.instance.clearChatSession();
                _loadWelcomeMessage();
              });
            },
            tooltip: 'Nova conversa',
          ),
        ],
      ),
      body: Column(
        children: [
          // Lista de mensagens
          Expanded(
            child: _messages.isEmpty
                ? Center(
                    child: Text(
                      'Nenhuma mensagem ainda...',
                      style: GoogleFonts.spaceGrotesk(
                        color: const Color(0xFF00D9FF).withOpacity(0.5),
                      ),
                    ),
                  )
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: _messages.length,
                    itemBuilder: (context, index) {
                      return _messages[index];
                    },
                  ),
          ),
          
          // Input de mensagem
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF0A0A0A),
              border: Border(
                top: BorderSide(
                  color: const Color(0xFF00D9FF).withOpacity(0.2),
                  width: 1,
                ),
              ),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      style: GoogleFonts.spaceGrotesk(
                        color: const Color(0xFF00D9FF),
                        fontSize: 14,
                      ),
                      decoration: InputDecoration(
                        hintText: 'Digite sua mensagem...',
                        hintStyle: GoogleFonts.spaceGrotesk(
                          color: const Color(0xFF00D9FF).withOpacity(0.4),
                        ),
                        filled: true,
                        fillColor: const Color(0xFF1A1A1A),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(
                            color: const Color(0xFF00D9FF).withOpacity(0.3),
                          ),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(
                            color: const Color(0xFF00D9FF).withOpacity(0.3),
                          ),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(
                            color: Color(0xFF00D9FF),
                            width: 2,
                          ),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                      ),
                      maxLines: null,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _sendMessage(),
                      enabled: !_isLoading,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF00D9FF),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: IconButton(
                      icon: _isLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Color(0xFF0A0A0A),
                              ),
                            )
                          : const Icon(Icons.send),
                      color: const Color(0xFF0A0A0A),
                      onPressed: _isLoading ? null : _sendMessage,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Widget para bolha de mensagem
class ChatBubble extends StatelessWidget {
  final String message;
  final bool isUser;
  final DateTime timestamp;
  final bool isStreaming;
  final bool isError;
  
  const ChatBubble({
    super.key,
    required this.message,
    required this.isUser,
    required this.timestamp,
    this.isStreaming = false,
    this.isError = false,
  });
  
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment:
            isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isUser) ...[
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFF00D9FF).withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.eco,
                color: Color(0xFF00D9FF),
                size: 20,
              ),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 12,
              ),
              decoration: BoxDecoration(
                color: isUser
                    ? const Color(0xFF00D9FF).withOpacity(0.2)
                    : const Color(0xFF1A1A1A),
                border: Border.all(
                  color: isError
                      ? Colors.red.withOpacity(0.5)
                      : const Color(0xFF00D9FF).withOpacity(0.3),
                  width: 1,
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    message.isEmpty && isStreaming ? '...' : message,
                    style: GoogleFonts.spaceGrotesk(
                      color: isError
                          ? Colors.red.shade300
                          : const Color(0xFF00D9FF),
                      fontSize: 14,
                      height: 1.5,
                    ),
                  ),
                  if (isStreaming && message.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          SizedBox(
                            width: 12,
                            height: 12,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: const Color(0xFF00D9FF).withOpacity(0.5),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Digitando...',
                            style: GoogleFonts.spaceGrotesk(
                              color: const Color(0xFF00D9FF).withOpacity(0.5),
                              fontSize: 10,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),
          if (isUser) ...[
            const SizedBox(width: 8),
            CircleAvatar(
              radius: 16,
              backgroundColor: const Color(0xFF00D9FF),
              child: Text(
                AuthService.instance.userDisplayName?[0].toUpperCase() ?? 'U',
                style: GoogleFonts.spaceGrotesk(
                  color: const Color(0xFF0A0A0A),
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
