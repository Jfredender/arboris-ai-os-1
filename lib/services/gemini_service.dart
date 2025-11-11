// ARBORIS AI - Gemini Service
// F-47 AR HUD Intelligence Layer
// Implementação completa da integração com Google Gemini AI

import 'dart:io';
import 'package:google_generative_ai/google_generative_ai.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/plant_analysis.dart';
import '../models/chat_message.dart';

/// Serviço de integração com Google Gemini AI
/// 
/// Este serviço fornece:
/// - Análise de imagens de plantas/árvores usando Gemini Vision
/// - Chat inteligente com contexto sobre biodiversidade
/// - Streaming de respostas em tempo real
/// - Persistência de dados no Firestore
class GeminiService {
  // Gemini API Key - CHAVE 2
  static const String apiKey = 'AIzaSyD0rwme-kCseLuM6zh62omc5OJA-zAuvok';
  
  // Singleton instance
  GeminiService._();
  static final GeminiService instance = GeminiService._();
  
  // Gemini Model instances
  late final GenerativeModel _textModel;
  late final GenerativeModel _visionModel;
  late final GenerativeModel _chatModel;
  
  // Firestore instance
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  
  // Chat session storage
  ChatSession? _currentChatSession;
  
  /// Inicializa os modelos Gemini
  /// 
  /// Este método deve ser chamado uma vez no início do app
  void initialize() {
    // Modelo para texto (mais rápido)
    _textModel = GenerativeModel(
      model: 'gemini-1.5-flash',
      apiKey: apiKey,
    );
    
    // Modelo para visão/imagens
    _visionModel = GenerativeModel(
      model: 'gemini-1.5-flash',
      apiKey: apiKey,
    );
    
    // Modelo para chat com contexto
    _chatModel = GenerativeModel(
      model: 'gemini-1.5-pro',
      apiKey: apiKey,
      generationConfig: GenerationConfig(
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      ),
      systemInstruction: Content.system(
        'Você é ARBORIS AI, uma inteligência artificial especializada em '
        'biodiversidade, plantas, árvores e ecossistemas. Você tem conhecimento '
        'profundo sobre botânica, identificação de espécies, saúde das plantas, '
        'e práticas de conservação ambiental. Responda de forma educativa, '
        'precisa e amigável. Quando relevante, forneça informações sobre '
        'conservação, benefícios ecológicos e curiosidades sobre as espécies.',
      ),
    );
  }
  
  // ==================== ANÁLISE DE IMAGENS ====================
  
  /// Analisa uma imagem de planta/árvore usando Gemini Vision
  /// 
  /// Retorna um [PlantAnalysis] com informações detalhadas sobre a planta
  /// identificada, incluindo espécie, características, saúde, etc.
  /// 
  /// Exemplo:
  /// ```dart
  /// final analysis = await GeminiService.instance.analyzeImage(
  ///   imageFile,
  ///   userId: 'user123',
  /// );
  /// print('Espécie: ${analysis.species}');
  /// ```
  Future<PlantAnalysis> analyzeImage(
    File imageFile, {
    required String userId,
  }) async {
    try {
      // Ler bytes da imagem
      final imageBytes = await imageFile.readAsBytes();
      
      // Criar prompt detalhado para análise de plantas
      const prompt = '''
Analise esta imagem de planta ou árvore e forneça informações detalhadas no seguinte formato JSON:

{
  "species": "Nome científico e nome comum da espécie",
  "confidence": 0.95,
  "characteristics": [
    "Característica 1 (ex: folhas largas)",
    "Característica 2 (ex: flores amarelas)",
    "Característica 3 (ex: caule lenhoso)"
  ],
  "healthStatus": "Saudável/Doente/Em Recuperação/Crítico",
  "description": "Descrição detalhada da planta incluindo habitat natural, cuidados necessários, e importância ecológica",
  "family": "Família botânica",
  "nativeRegion": "Região nativa",
  "waterNeeds": "Necessidades de água (baixa/média/alta)",
  "lightNeeds": "Necessidades de luz (sombra/meia-sombra/sol pleno)",
  "height": "Altura típica da planta adulta",
  "benefits": ["Benefício 1", "Benefício 2"],
  "funFacts": ["Curiosidade 1", "Curiosidade 2"]
}

Se não conseguir identificar a planta com certeza, seja honesto e sugira possibilidades com diferentes níveis de confiança.
''';
      
      // Criar conteúdo multimodal (texto + imagem)
      final content = [
        Content.multi([
          TextPart(prompt),
          DataPart('image/jpeg', imageBytes),
        ])
      ];
      
      // Gerar resposta do Gemini
      final response = await _visionModel.generateContent(content);
      
      if (response.text == null) {
        throw Exception('Gemini não retornou resposta');
      }
      
      // Parse da resposta JSON
      final responseText = response.text!;
      final jsonMatch = RegExp(r'\{[\s\S]*\}').firstMatch(responseText);
      
      if (jsonMatch == null) {
        throw Exception('Resposta do Gemini não está em formato JSON válido');
      }
      
      final jsonText = jsonMatch.group(0)!;
      final analysisData = _parseGeminiResponse(jsonText);
      
      // Criar objeto PlantAnalysis
      final plantAnalysis = PlantAnalysis(
        id: '', // Será definido ao salvar no Firestore
        userId: userId,
        imagePath: imageFile.path,
        species: analysisData['species'] ?? 'Espécie não identificada',
        confidence: (analysisData['confidence'] ?? 0.0).toDouble(),
        characteristics: List<String>.from(analysisData['characteristics'] ?? []),
        healthStatus: analysisData['healthStatus'] ?? 'Desconhecido',
        description: analysisData['description'] ?? '',
        additionalInfo: {
          'family': analysisData['family'] ?? '',
          'nativeRegion': analysisData['nativeRegion'] ?? '',
          'waterNeeds': analysisData['waterNeeds'] ?? '',
          'lightNeeds': analysisData['lightNeeds'] ?? '',
          'height': analysisData['height'] ?? '',
          'benefits': analysisData['benefits'] ?? [],
          'funFacts': analysisData['funFacts'] ?? [],
        },
        timestamp: DateTime.now(),
      );
      
      // Salvar análise no Firestore
      final savedAnalysis = await _savePlantAnalysisToFirestore(plantAnalysis);
      
      return savedAnalysis;
      
    } catch (e) {
      throw Exception('Erro ao analisar imagem: $e');
    }
  }
  
  /// Helper para fazer parse da resposta JSON do Gemini
  Map<String, dynamic> _parseGeminiResponse(String jsonText) {
    try {
      // Remove markdown code blocks se presentes
      String cleanJson = jsonText
          .replaceAll('```json', '')
          .replaceAll('```', '')
          .trim();
      
      // Parse manual básico (pode usar dart:convert em produção)
      final Map<String, dynamic> result = {};
      
      // Extrai campos principais usando regex
      final speciesMatch = RegExp(r'"species"\s*:\s*"([^"]*)"').firstMatch(cleanJson);
      if (speciesMatch != null) result['species'] = speciesMatch.group(1);
      
      final confidenceMatch = RegExp(r'"confidence"\s*:\s*([0-9.]+)').firstMatch(cleanJson);
      if (confidenceMatch != null) result['confidence'] = double.parse(confidenceMatch.group(1)!);
      
      final healthMatch = RegExp(r'"healthStatus"\s*:\s*"([^"]*)"').firstMatch(cleanJson);
      if (healthMatch != null) result['healthStatus'] = healthMatch.group(1);
      
      final descMatch = RegExp(r'"description"\s*:\s*"([^"]*)"').firstMatch(cleanJson);
      if (descMatch != null) result['description'] = descMatch.group(1);
      
      // Extrai arrays
      result['characteristics'] = _extractJsonArray(cleanJson, 'characteristics');
      result['benefits'] = _extractJsonArray(cleanJson, 'benefits');
      result['funFacts'] = _extractJsonArray(cleanJson, 'funFacts');
      
      return result;
    } catch (e) {
      // Fallback em caso de erro de parsing
      return {
        'species': 'Erro ao processar análise',
        'confidence': 0.0,
        'characteristics': [],
        'healthStatus': 'Desconhecido',
        'description': 'Não foi possível processar a resposta do Gemini',
      };
    }
  }
  
  /// Helper para extrair arrays do JSON
  List<String> _extractJsonArray(String json, String fieldName) {
    final match = RegExp('"\$fieldName"\\s*:\\s*\\[([^\\]]*)\\]').firstMatch(json);
    if (match == null) return [];
    
    final arrayContent = match.group(1)!;
    final items = arrayContent.split(',');
    
    return items
        .map((item) => item.trim().replaceAll('"', '').replaceAll("'", ''))
        .where((item) => item.isNotEmpty)
        .toList();
  }
  
  /// Salva análise de planta no Firestore
  Future<PlantAnalysis> _savePlantAnalysisToFirestore(PlantAnalysis analysis) async {
    try {
      final docRef = await _firestore
          .collection('plant_analyses')
          .add(analysis.toJson());
      
      return analysis.copyWith(id: docRef.id);
    } catch (e) {
      throw Exception('Erro ao salvar análise no Firestore: $e');
    }
  }
  
  /// Obtém histórico de análises de plantas de um usuário
  Future<List<PlantAnalysis>> getPlantAnalysisHistory(String userId) async {
    try {
      final querySnapshot = await _firestore
          .collection('plant_analyses')
          .where('userId', isEqualTo: userId)
          .orderBy('timestamp', descending: true)
          .limit(50)
          .get();
      
      return querySnapshot.docs
          .map((doc) => PlantAnalysis.fromFirestore(doc))
          .toList();
    } catch (e) {
      throw Exception('Erro ao buscar histórico: $e');
    }
  }
  
  // ==================== CHAT INTELIGENTE ====================
  
  /// Gera resposta de chat usando Gemini
  /// 
  /// Exemplo:
  /// ```dart
  /// final response = await GeminiService.instance.generateResponse(
  ///   'Quais são os benefícios de plantar árvores nativas?',
  ///   userId: 'user123',
  /// );
  /// ```
  Future<String> generateResponse(
    String prompt, {
    required String userId,
    bool saveToFirestore = true,
  }) async {
    try {
      // Gerar resposta do Gemini
      final content = [Content.text(prompt)];
      final response = await _textModel.generateContent(content);
      
      if (response.text == null) {
        throw Exception('Gemini não retornou resposta');
      }
      
      final responseText = response.text!;
      
      // Salvar no Firestore se solicitado
      if (saveToFirestore) {
        await _saveChatMessageToFirestore(
          userId: userId,
          message: prompt,
          response: responseText,
        );
      }
      
      return responseText;
      
    } catch (e) {
      throw Exception('Erro ao gerar resposta: $e');
    }
  }
  
  /// Stream de respostas em tempo real (para UX mais fluida)
  /// 
  /// Exemplo:
  /// ```dart
  /// await for (final chunk in GeminiService.instance.streamResponse('Olá!')) {
  ///   print(chunk); // Imprime cada pedaço da resposta conforme chega
  /// }
  /// ```
  Stream<String> streamResponse(
    String prompt, {
    required String userId,
  }) async* {
    try {
      final content = [Content.text(prompt)];
      final responseStream = _textModel.generateContentStream(content);
      
      final fullResponse = StringBuffer();
      
      await for (final chunk in responseStream) {
        final text = chunk.text;
        if (text != null) {
          fullResponse.write(text);
          yield text;
        }
      }
      
      // Salvar conversa completa no Firestore
      await _saveChatMessageToFirestore(
        userId: userId,
        message: prompt,
        response: fullResponse.toString(),
      );
      
    } catch (e) {
      yield 'Erro ao gerar resposta: $e';
    }
  }
  
  /// Inicia uma sessão de chat com contexto persistente
  /// 
  /// Permite conversar com continuidade, onde o Gemini "lembra"
  /// das mensagens anteriores na conversa.
  ChatSession startChatSession({List<Content>? history}) {
    _currentChatSession = _chatModel.startChat(history: history ?? []);
    return _currentChatSession!;
  }
  
  /// Envia mensagem na sessão de chat atual
  Future<String> sendChatMessage(
    String message, {
    required String userId,
  }) async {
    try {
      if (_currentChatSession == null) {
        startChatSession();
      }
      
      final response = await _currentChatSession!.sendMessage(
        Content.text(message),
      );
      
      if (response.text == null) {
        throw Exception('Gemini não retornou resposta');
      }
      
      final responseText = response.text!;
      
      // Salvar no Firestore
      await _saveChatMessageToFirestore(
        userId: userId,
        message: message,
        response: responseText,
      );
      
      return responseText;
      
    } catch (e) {
      throw Exception('Erro ao enviar mensagem: $e');
    }
  }
  
  /// Stream de mensagens na sessão de chat
  Stream<String> sendChatMessageStream(
    String message, {
    required String userId,
  }) async* {
    try {
      if (_currentChatSession == null) {
        startChatSession();
      }
      
      final responseStream = _currentChatSession!.sendMessageStream(
        Content.text(message),
      );
      
      final fullResponse = StringBuffer();
      
      await for (final chunk in responseStream) {
        final text = chunk.text;
        if (text != null) {
          fullResponse.write(text);
          yield text;
        }
      }
      
      // Salvar conversa no Firestore
      await _saveChatMessageToFirestore(
        userId: userId,
        message: message,
        response: fullResponse.toString(),
      );
      
    } catch (e) {
      yield 'Erro ao enviar mensagem: $e';
    }
  }
  
  /// Salva mensagem de chat no Firestore
  Future<void> _saveChatMessageToFirestore({
    required String userId,
    required String message,
    required String response,
  }) async {
    try {
      final chatMessage = ChatMessage(
        id: '',
        userId: userId,
        message: message,
        response: response,
        isUserMessage: false,
        timestamp: DateTime.now(),
      );
      
      await _firestore
          .collection('chat_history')
          .add(chatMessage.toJson());
      
    } catch (e) {
      // Log error but don't throw - saving to Firestore is not critical
      print('Erro ao salvar chat no Firestore: $e');
    }
  }
  
  /// Obtém histórico de chat de um usuário
  Future<List<ChatMessage>> getChatHistory(String userId) async {
    try {
      final querySnapshot = await _firestore
          .collection('chat_history')
          .where('userId', isEqualTo: userId)
          .orderBy('timestamp', descending: true)
          .limit(100)
          .get();
      
      return querySnapshot.docs
          .map((doc) => ChatMessage.fromFirestore(doc))
          .toList();
    } catch (e) {
      throw Exception('Erro ao buscar histórico de chat: $e');
    }
  }
  
  // ==================== UTILIDADES ====================
  
  /// Limpa a sessão de chat atual
  void clearChatSession() {
    _currentChatSession = null;
  }
  
  /// Testa a conexão com a API do Gemini
  Future<bool> testConnection() async {
    try {
      final response = await _textModel.generateContent([
        Content.text('Olá, teste de conexão.')
      ]);
      return response.text != null;
    } catch (e) {
      return false;
    }
  }
}
