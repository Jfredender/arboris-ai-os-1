
// ARBORIS AI - Chat Message Model
// Modelo de dados para mensagens do chat com IA

import 'package:cloud_firestore/cloud_firestore.dart';

/// Modelo para mensagens de chat com Gemini
class ChatMessage {
  final String id;
  final String userId;
  final String message;
  final String response;
  final bool isUserMessage;
  final DateTime timestamp;
  final Map<String, dynamic> metadata;

  ChatMessage({
    required this.id,
    required this.userId,
    required this.message,
    required this.response,
    required this.isUserMessage,
    required this.timestamp,
    this.metadata = const {},
  });

  /// Criar ChatMessage a partir de JSON
  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      message: json['message'] as String? ?? '',
      response: json['response'] as String? ?? '',
      isUserMessage: json['isUserMessage'] as bool? ?? true,
      timestamp: json['timestamp'] is Timestamp
          ? (json['timestamp'] as Timestamp).toDate()
          : DateTime.now(),
      metadata: json['metadata'] as Map<String, dynamic>? ?? {},
    );
  }

  /// Converter ChatMessage para JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'message': message,
      'response': response,
      'isUserMessage': isUserMessage,
      'timestamp': Timestamp.fromDate(timestamp),
      'metadata': metadata,
    };
  }

  /// Criar ChatMessage a partir de documento Firestore
  factory ChatMessage.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return ChatMessage.fromJson({
      ...data,
      'id': doc.id,
    });
  }

  /// Copiar com modificações
  ChatMessage copyWith({
    String? id,
    String? userId,
    String? message,
    String? response,
    bool? isUserMessage,
    DateTime? timestamp,
    Map<String, dynamic>? metadata,
  }) {
    return ChatMessage(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      message: message ?? this.message,
      response: response ?? this.response,
      isUserMessage: isUserMessage ?? this.isUserMessage,
      timestamp: timestamp ?? this.timestamp,
      metadata: metadata ?? this.metadata,
    );
  }
}
