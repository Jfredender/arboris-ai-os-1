
// ARBORIS AI - Plant Analysis Model
// Modelo de dados para análise de plantas/árvores

import 'package:cloud_firestore/cloud_firestore.dart';

/// Modelo para análise de plantas usando Gemini Vision
class PlantAnalysis {
  final String id;
  final String userId;
  final String imagePath;
  final String species;
  final double confidence;
  final List<String> characteristics;
  final String healthStatus;
  final String description;
  final Map<String, dynamic> additionalInfo;
  final DateTime timestamp;

  PlantAnalysis({
    required this.id,
    required this.userId,
    required this.imagePath,
    required this.species,
    required this.confidence,
    required this.characteristics,
    required this.healthStatus,
    required this.description,
    required this.additionalInfo,
    required this.timestamp,
  });

  /// Criar PlantAnalysis a partir de JSON
  factory PlantAnalysis.fromJson(Map<String, dynamic> json) {
    return PlantAnalysis(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      imagePath: json['imagePath'] as String? ?? '',
      species: json['species'] as String? ?? 'Desconhecida',
      confidence: (json['confidence'] as num?)?.toDouble() ?? 0.0,
      characteristics: (json['characteristics'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      healthStatus: json['healthStatus'] as String? ?? 'Desconhecido',
      description: json['description'] as String? ?? '',
      additionalInfo: json['additionalInfo'] as Map<String, dynamic>? ?? {},
      timestamp: json['timestamp'] is Timestamp
          ? (json['timestamp'] as Timestamp).toDate()
          : DateTime.now(),
    );
  }

  /// Converter PlantAnalysis para JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'imagePath': imagePath,
      'species': species,
      'confidence': confidence,
      'characteristics': characteristics,
      'healthStatus': healthStatus,
      'description': description,
      'additionalInfo': additionalInfo,
      'timestamp': Timestamp.fromDate(timestamp),
    };
  }

  /// Criar PlantAnalysis a partir de documento Firestore
  factory PlantAnalysis.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return PlantAnalysis.fromJson({
      ...data,
      'id': doc.id,
    });
  }

  /// Copiar com modificações
  PlantAnalysis copyWith({
    String? id,
    String? userId,
    String? imagePath,
    String? species,
    double? confidence,
    List<String>? characteristics,
    String? healthStatus,
    String? description,
    Map<String, dynamic>? additionalInfo,
    DateTime? timestamp,
  }) {
    return PlantAnalysis(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      imagePath: imagePath ?? this.imagePath,
      species: species ?? this.species,
      confidence: confidence ?? this.confidence,
      characteristics: characteristics ?? this.characteristics,
      healthStatus: healthStatus ?? this.healthStatus,
      description: description ?? this.description,
      additionalInfo: additionalInfo ?? this.additionalInfo,
      timestamp: timestamp ?? this.timestamp,
    );
  }
}
