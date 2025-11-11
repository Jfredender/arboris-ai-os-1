# ARBORIS AI OS 1 - Genesis

Sistema operacional de IA conversacional desenvolvido em Flutter com integração Firebase e Google Gemini AI.

## 📱 Sobre o Projeto

ARBORIS AI OS 1 é um aplicativo Flutter que oferece uma experiência de chat inteligente com IA, incluindo:

- 🔐 Autenticação segura com Firebase Auth
- 💬 Interface de chat moderna e responsiva
- 🤖 Integração com Google Gemini AI para conversas inteligentes
- ☁️ Armazenamento de dados com Cloud Firestore
- 🎨 Design limpo e intuitivo

## 🚀 Como Executar

### Pré-requisitos

- Flutter SDK (versão 3.0 ou superior)
- Dart SDK
- Android Studio / Xcode (para emuladores)
- Conta Firebase configurada
- API Key do Google Gemini AI

### Passos para Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Jfredender/arboris-ai-os-1.git
   cd arboris-ai-os-1
   ```

2. **Instale as dependências:**
   ```bash
   flutter pub get
   ```

3. **Configure o Firebase:**
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Adicione seu app Android/iOS ao projeto
   - Baixe e adicione os arquivos de configuração:
     - `google-services.json` (Android) → `android/app/`
     - `GoogleService-Info.plist` (iOS) → `ios/Runner/`
   - Execute: `flutterfire configure` (se tiver FlutterFire CLI)

4. **Configure a API Key do Gemini:**
   - Obtenha sua chave em [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Adicione a chave no arquivo `lib/services/gemini_service.dart`

5. **Execute o aplicativo:**
   ```bash
   flutter run
   ```

## 📦 Dependências Principais

- `firebase_core` - Core do Firebase
- `firebase_auth` - Autenticação
- `cloud_firestore` - Banco de dados
- `google_generative_ai` - Integração Gemini AI
- `provider` - Gerenciamento de estado

## 🏗️ Estrutura do Projeto

```
lib/
├── main.dart                 # Ponto de entrada
├── models/                   # Modelos de dados
│   ├── message.dart
│   └── user_model.dart
├── services/                 # Serviços
│   ├── auth_service.dart
│   └── gemini_service.dart
└── views/                    # Telas
    ├── login_view.dart
    ├── home_view.dart
    └── chat_view.dart
```

## 🔒 Segurança

⚠️ **IMPORTANTE:** Nunca commite suas chaves de API ou arquivos de configuração do Firebase no repositório público. Use variáveis de ambiente ou arquivos de configuração locais.

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 👨‍💻 Autor

Desenvolvido por Jfredender

---

**ARBORIS AI OS 1** - Transformando conversas em experiências inteligentes 🌳✨
