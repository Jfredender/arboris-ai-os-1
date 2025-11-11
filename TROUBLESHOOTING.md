# 🔧 TROUBLESHOOTING - Soluções para Problemas Comuns

**Projeto**: ARBORIS AI OS 1 - Genesis Foundation  
**Protocol**: F-47 AR HUD  
**Versão**: 1.0.0

---

## 📋 Índice

1. [Erros de Autenticação Google](#1-erros-de-autenticação-google)
2. [Erros de Configuração Firebase](#2-erros-de-configuração-firebase)
3. [Erros de Build e Execução](#3-erros-de-build-e-execução)
4. [Problemas de Rede e CORS](#4-problemas-de-rede-e-cors)
5. [Problemas de Browser](#5-problemas-de-browser)
6. [Erros de Dependências](#6-erros-de-dependências)
7. [Dicas Gerais de Debug](#7-dicas-gerais-de-debug)

---

## 1. Erros de Autenticação Google

### 1.1 - Error 400: redirect_uri_mismatch

**Erro completo:**
```
Error 400: redirect_uri_mismatch
The redirect URI in the request: http://localhost:8080/__/auth/handler 
does not match the ones authorized for the OAuth client.
```

**O que significa:**  
O Google OAuth não reconhece o URI de onde você está tentando autenticar.

**Soluções:**

#### Solução 1: Adicionar URI no Google Cloud Console

1. Acesse: https://console.cloud.google.com/apis/credentials?project=arboris-core

2. Clique no OAuth Client ID: `537123553346-m5bv9uj1bf6bfb17p7344b03t291ir1g`

3. Em "Authorized redirect URIs", adicione **exatamente**:
   ```
   http://localhost:8080/__/auth/handler
   ```

4. Clique em "SAVE"

5. **Aguarde 5-10 minutos** para propagação

6. Limpe o cache do navegador (Ctrl+Shift+Delete)

7. Tente novamente

#### Solução 2: Verificar a porta que você está usando

Se você está usando outra porta (ex: 8081, 3000), adicione também:
```
http://localhost:8081/__/auth/handler
http://localhost:3000/__/auth/handler
```

#### Solução 3: Adicionar também com 127.0.0.1

Algumas configurações usam IP em vez de localhost:
```
http://127.0.0.1:8080/__/auth/handler
```

**Verificação:**

Execute o script de verificação:
```bash
python3 scripts/check_firebase_config.py
```

**Tempo de propagação:**  
⏰ Mudanças no Google Cloud podem levar 5-10 minutos para propagar. Seja paciente!

---

### 1.2 - Access Blocked: Authorization Error

**Erro:**
```
Access blocked: arboris-core.firebaseapp.com has not completed 
the Google verification process
```

**O que significa:**  
O app está em modo de teste do OAuth e você não está na lista de testadores.

**Soluções:**

#### Solução 1: Adicionar-se como testador

1. Acesse: https://console.cloud.google.com/apis/credentials/consent?project=arboris-core

2. Role até "Test users"

3. Clique em "+ ADD USERS"

4. Adicione seu email do Google

5. Clique em "SAVE"

6. Tente autenticar novamente

#### Solução 2: Publicar o app (APENAS PRODUÇÃO)

⚠️ **NÃO faça isso em desenvolvimento!**

Para produção, você pode submeter o app para verificação do Google:
1. Na mesma página OAuth consent screen
2. Clique em "PUBLISH APP"
3. Siga o processo de verificação do Google

**Recomendação:**  
Para desenvolvimento, use a Solução 1 (adicionar testadores).

---

### 1.3 - PlatformException: Sign in failed

**Erro:**
```
PlatformException(sign_in_failed, 
com.google.android.gms.common.api.ApiException: 10: , null, null)
```

**O que significa:**  
No Android, o SHA-1/SHA-256 fingerprint não está registrado no Firebase.

**Solução:**

1. Obter SHA-1 fingerprint:
   ```bash
   cd android
   ./gradlew signingReport
   ```

2. Copie o SHA-1 e SHA-256

3. No Firebase Console → Project Settings → Your apps → Android app

4. Role até "SHA certificate fingerprints"

5. Clique em "Add fingerprint"

6. Cole o SHA-1 e adicione

7. Repita para SHA-256

8. Reconstrua o app:
   ```bash
   flutter clean
   flutter pub get
   flutter run
   ```

---

### 1.4 - Sign in canceled by user

**Erro:**
```
Sign in canceled by user
```

**O que significa:**  
O usuário fechou o popup do Google antes de completar a autenticação.

**Soluções:**

Isso não é realmente um erro, mas um comportamento esperado. No entanto, você pode melhorar a UX:

1. **Verificar se popup foi bloqueado:**
   - Verifique se há ícone de popup bloqueado na barra de endereço
   - Permita popups para localhost

2. **Adicionar mensagem amigável:**
   ```dart
   final userCredential = await AuthService.instance.signInWithGoogle();
   
   if (userCredential == null) {
     // Usuário cancelou - não é erro
     ScaffoldMessenger.of(context).showSnackBar(
       SnackBar(content: Text('Login cancelado')),
     );
   }
   ```

---

### 1.5 - OAuth Client ID incorreto

**Erro:**
```
Invalid OAuth client ID
```

**O que significa:**  
O Client ID configurado no código não é válido.

**Solução:**

1. Verifique o arquivo `lib/services/auth_service.dart`:
   ```dart
   clientId: '537123553346-m5bv9uj1bf6bfb17p7344b03t291ir1g.apps.googleusercontent.com'
   ```

2. Compare com o Client ID no Google Cloud Console

3. Se diferente, corrija o arquivo

4. Execute:
   ```bash
   flutter clean
   flutter pub get
   flutter run -d chrome --web-port=8080
   ```

---

## 2. Erros de Configuração Firebase

### 2.1 - API key not valid

**Erro:**
```
API key not valid. Please pass a valid API key.
```

**O que significa:**  
A API Key do Firebase está incorreta ou expirou.

**Solução:**

1. Acesse Firebase Console → Project Settings

2. Role até "Web API Key"

3. Copie a API Key exibida

4. Abra `lib/firebase_options.dart`

5. Verifique se a `apiKey` corresponde:
   ```dart
   apiKey: 'AIzaSyAG9rWlByvtGu_2oCdjulrOY5NMO-qXTzs'
   ```

6. Se diferente, atualize com a API Key correta

7. Execute:
   ```bash
   flutter clean
   flutter pub get
   ```

---

### 2.2 - Firebase not initialized

**Erro:**
```
[core/no-app] No Firebase App '[DEFAULT]' has been created
```

**O que significa:**  
O Firebase não foi inicializado antes de ser usado.

**Solução:**

1. Verifique o arquivo `lib/main.dart`

2. Certifique-se de que `Firebase.initializeApp()` é chamado antes de `runApp()`:
   ```dart
   void main() async {
     WidgetsFlutterBinding.ensureInitialized();
     
     await Firebase.initializeApp(
       options: DefaultFirebaseOptions.currentPlatform,
     );
     
     runApp(const MyApp());
   }
   ```

3. Se estiver correto, reconstrua:
   ```bash
   flutter clean
   flutter pub get
   flutter run -d chrome --web-port=8080
   ```

---

### 2.3 - Auth domain not authorized

**Erro:**
```
This domain (localhost) is not authorized to run this operation
```

**O que significa:**  
O domínio não está na lista de domínios autorizados do Firebase.

**Solução:**

1. Acesse: https://console.firebase.google.com/project/arboris-core/authentication/settings

2. Role até "Authorized domains"

3. Verifique se `localhost` está na lista

4. Se não estiver:
   - Clique em "Add domain"
   - Digite: `localhost`
   - Clique em "Add"

5. Aguarde alguns minutos e tente novamente

---

### 2.4 - Storage bucket not found

**Erro:**
```
Storage bucket 'arboris-core.appspot.com' does not exist
```

**O que significa:**  
O bucket de storage não foi criado ou o nome está incorreto.

**Solução:**

1. Verifique `lib/firebase_options.dart`:
   ```dart
   storageBucket: 'arboris-core.firebasestorage.app'
   ```

2. Compare com Firebase Console → Project Settings

3. Se o bucket não existe e você precisa dele:
   - Firebase Console → Storage
   - Clique em "Get Started"
   - Siga o wizard de configuração

---

## 3. Erros de Build e Execução

### 3.1 - Port already in use

**Erro:**
```
Port 8080 is already in use
```

**O que significa:**  
Outro processo está usando a porta 8080.

**Soluções:**

#### Solução 1: Use outra porta
```bash
flutter run -d chrome --web-port=8081 --web-hostname=localhost
```

#### Solução 2: Mate o processo que está usando a porta

**Linux/Mac:**
```bash
# Encontrar processo
lsof -i :8080

# Matar processo (substitua PID)
kill -9 [PID]
```

**Windows:**
```cmd
# Encontrar processo
netstat -ano | findstr :8080

# Matar processo (substitua PID)
taskkill /PID [PID] /F
```

#### Solução 3: Deixe Flutter escolher automaticamente
```bash
flutter run -d chrome
```

---

### 3.2 - Build failed: Unable to download dependencies

**Erro:**
```
Unable to download packages
```

**O que significa:**  
Problemas de rede ou cache do pub.

**Soluções:**

#### Solução 1: Limpar cache do pub
```bash
flutter pub cache repair
flutter clean
flutter pub get
```

#### Solução 2: Verificar conectividade
```bash
# Testar conexão com pub.dev
ping pub.dev
```

#### Solução 3: Usar proxy (se necessário)
```bash
export HTTP_PROXY=http://proxy:port
export HTTPS_PROXY=http://proxy:port
flutter pub get
```

#### Solução 4: Verificar arquivo pubspec.yaml
- Verifique se não há erros de sintaxe
- Certifique-se de que as versões das dependências são válidas

---

### 3.3 - Chrome device not found

**Erro:**
```
No supported devices connected
```

**O que significa:**  
Flutter não encontrou o Chrome instalado.

**Soluções:**

#### Solução 1: Verificar se Chrome está instalado
```bash
# Linux
which google-chrome

# Mac
which "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Windows
where chrome
```

#### Solução 2: Configurar CHROME_EXECUTABLE
```bash
# Linux
export CHROME_EXECUTABLE=/usr/bin/google-chrome

# Mac
export CHROME_EXECUTABLE="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

#### Solução 3: Listar dispositivos disponíveis
```bash
flutter devices
```

#### Solução 4: Verificar Flutter web
```bash
flutter config --enable-web
```

---

### 3.4 - Hot reload não funciona

**Sintoma:**  
Mudanças no código não aparecem após apertar 'r'.

**Soluções:**

#### Solução 1: Use hot restart
Pressione `R` (maiúsculo) em vez de `r`

#### Solução 2: Pare e reinicie
```bash
# Ctrl+C para parar
flutter clean
flutter run -d chrome --web-port=8080
```

#### Solução 3: Mudanças que requerem restart completo

Algumas mudanças **sempre** requerem restart:
- Mudanças em `main()`
- Mudanças em constantes globais
- Mudanças em assets
- Mudanças em dependências

---

## 4. Problemas de Rede e CORS

### 4.1 - CORS Error

**Erro:**
```
Access to XMLHttpRequest at '...' from origin 'http://localhost:8080' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header
```

**O que significa:**  
O servidor não permite requisições do seu domínio.

**Soluções:**

#### Para Firebase/Google APIs:

1. Verifique domínios autorizados:
   - Firebase Console → Authentication → Settings → Authorized domains
   - Adicione `localhost` se não estiver lá

2. Verifique JavaScript origins:
   - Google Cloud Console → Credentials
   - Adicione `http://localhost:8080` em "Authorized JavaScript origins"

#### Para APIs externas:

Use um proxy ou configure CORS no servidor de destino.

---

### 4.2 - Network error

**Erro:**
```
A network error (such as timeout, interrupted connection or 
unreachable host) has occurred
```

**Soluções:**

1. **Verificar conexão:**
   ```bash
   ping google.com
   ```

2. **Desativar VPN** (se estiver usando)

3. **Verificar firewall:**
   - Certifique-se de que o firewall não está bloqueando Flutter/Chrome

4. **Tentar rede diferente:**
   - Use dados móveis ou outra rede WiFi

5. **Verificar proxy:**
   - Se sua organização usa proxy, configure corretamente

---

## 5. Problemas de Browser

### 5.1 - Popup bloqueado

**Sintoma:**  
Ao clicar em "Sign In with Google", nada acontece.

**Soluções:**

1. **Verificar ícone de popup bloqueado:**
   - Procure um ícone na barra de endereço do Chrome
   - Clique e selecione "Sempre permitir popups de localhost"

2. **Configurar manualmente:**
   - Chrome Settings → Privacy and security → Site settings
   - Popups and redirects → Allowed
   - Adicione `http://localhost:8080`

3. **Testar em aba anônima:**
   ```bash
   google-chrome --incognito http://localhost:8080
   ```

---

### 5.2 - Cache do navegador causando problemas

**Sintoma:**  
Mudanças não aparecem ou erros persistem mesmo após correção.

**Soluções:**

#### Solução 1: Hard refresh
- **Chrome/Firefox:** Ctrl+Shift+R (Cmd+Shift+R no Mac)
- **Safari:** Cmd+Option+R

#### Solução 2: Limpar cache
1. Pressione Ctrl+Shift+Delete (Cmd+Shift+Delete no Mac)
2. Selecione "All time"
3. Marque "Cached images and files"
4. Clique em "Clear data"

#### Solução 3: Usar aba anônita/private
```bash
# Chrome
google-chrome --incognito http://localhost:8080

# Firefox
firefox --private-window http://localhost:8080
```

#### Solução 4: Desabilitar cache no DevTools
1. Abra DevTools (F12)
2. Clique em Settings (⚙️)
3. Marque "Disable cache (while DevTools is open)"

---

### 5.3 - DevTools mostra erros mas app funciona

**Sintoma:**  
Erros no console mas a aplicação parece funcionar.

**O que fazer:**

1. **Ignore warnings não críticos** como:
   - "GET /favicon.ico 404"
   - Avisos de performance
   - Avisos de deprecation (se não afetam funcionalidade)

2. **Foque em erros reais:**
   - Erros vermelhos
   - Exceptions não tratadas
   - Falhas de autenticação

3. **Use filtros:**
   - No console do DevTools, use os filtros para ver apenas erros

---

## 6. Erros de Dependências

### 6.1 - Version solving failed

**Erro:**
```
Because package_a depends on package_b ^1.0.0 and package_c depends on package_b ^2.0.0,
package_a is incompatible with package_c.
```

**O que significa:**  
Conflito de versões entre dependências.

**Soluções:**

#### Solução 1: Atualizar dependências
```bash
flutter pub upgrade
```

#### Solução 2: Usar dependency overrides

Em `pubspec.yaml`, adicione:
```yaml
dependency_overrides:
  package_b: ^2.0.0
```

#### Solução 3: Verificar versões compatíveis

1. Acesse https://pub.dev
2. Procure cada pacote
3. Verifique versões compatíveis
4. Atualize `pubspec.yaml`

---

### 6.2 - Package not found

**Erro:**
```
Package package_name not found
```

**Soluções:**

#### Solução 1: Verificar nome do pacote
- Certifique-se de que o nome está correto em `pubspec.yaml`

#### Solução 2: Limpar e reobter
```bash
flutter clean
rm pubspec.lock
flutter pub get
```

#### Solução 3: Verificar se pacote existe
- Acesse https://pub.dev
- Procure pelo pacote
- Verifique se está disponível

---

### 6.3 - Import error

**Erro:**
```
Target of URI doesn't exist: 'package:package_name/file.dart'
```

**Soluções:**

1. **Verificar se dependência está em pubspec.yaml:**
   ```yaml
   dependencies:
     package_name: ^1.0.0
   ```

2. **Executar pub get:**
   ```bash
   flutter pub get
   ```

3. **Verificar import:**
   ```dart
   import 'package:package_name/file.dart';
   ```

4. **Restart IDE:**
   - VS Code: Reload Window (Ctrl+Shift+P → "Reload Window")
   - Android Studio: File → Invalidate Caches / Restart

---

## 7. Dicas Gerais de Debug

### 7.1 - Processo de debug sistemático

Quando encontrar um erro, siga esta ordem:

1. **Leia a mensagem de erro completa**
   - Não ignore a stack trace
   - Identifique a linha exata do problema

2. **Verifique configurações básicas:**
   ```bash
   python3 scripts/check_firebase_config.py
   ```

3. **Limpe e reconstrua:**
   ```bash
   flutter clean
   flutter pub get
   flutter run -d chrome --web-port=8080
   ```

4. **Teste em ambiente limpo:**
   - Aba anônita do navegador
   - Cache limpo

5. **Verifique logs:**
   - Console do navegador (F12)
   - Terminal onde Flutter está rodando
   - Firebase Console → Logs

6. **Isole o problema:**
   - Comente código até encontrar a linha problemática
   - Teste em ambiente mínimo

---

### 7.2 - Ferramentas de debug

**Flutter DevTools:**
```bash
flutter pub global activate devtools
flutter pub global run devtools
```

**Logs verbosos:**
```bash
flutter run -d chrome --web-port=8080 -v
```

**Logs do Firebase:**
- Firebase Console → Functions → Logs
- Firebase Console → Authentication → Usage

**Chrome DevTools:**
- F12 para abrir
- Console tab: erros JavaScript
- Network tab: requisições de rede
- Application tab: storage, cookies

---

### 7.3 - Comandos úteis para reset completo

Quando tudo mais falhar, reset completo:

```bash
# 1. Limpar tudo do Flutter
flutter clean
rm -rf build/
rm pubspec.lock

# 2. Reobter dependências
flutter pub get
flutter pub upgrade

# 3. Limpar cache do pub
flutter pub cache repair

# 4. Verificar configuração Flutter
flutter doctor -v

# 5. Executar novamente
flutter run -d chrome --web-port=8080 --web-hostname=localhost
```

---

### 7.4 - Onde buscar ajuda

**Documentação:**
- Flutter: https://docs.flutter.dev
- Firebase: https://firebase.google.com/docs
- Pub.dev: https://pub.dev

**Comunidade:**
- Stack Overflow: https://stackoverflow.com/questions/tagged/flutter
- Flutter Community: https://flutter.dev/community
- Firebase Community: https://firebase.google.com/support

**GitHub Issues:**
- FlutterFire: https://github.com/firebase/flutterfire/issues
- Flutter: https://github.com/flutter/flutter/issues

---

## 📝 Checklist de Debug

Use este checklist antes de pedir ajuda:

- [ ] Li a mensagem de erro completa
- [ ] Executei `python3 scripts/check_firebase_config.py`
- [ ] Executei `flutter clean` e `flutter pub get`
- [ ] Testei em aba anônita do navegador
- [ ] Verifiquei console do navegador (F12)
- [ ] Aguardei 5-10 minutos após mudanças no Google Cloud
- [ ] Verifiquei que Firebase Console está configurado
- [ ] Verifiquei que Google Cloud Console está configurado
- [ ] Tentei executar em porta diferente
- [ ] Li a documentação relevante
- [ ] Procurei o erro no Stack Overflow
- [ ] Verifiquei GitHub Issues do FlutterFire

---

## 🆘 Suporte

Se após seguir todos os passos o problema persistir:

1. **Colete informações:**
   - Mensagem de erro completa (com stack trace)
   - Output de `flutter doctor -v`
   - Output de `python3 scripts/check_firebase_config.py`
   - Passos para reproduzir o erro

2. **Verifique a documentação:**
   - [FIREBASE_GOOGLE_AUTH_SETUP.md](FIREBASE_GOOGLE_AUTH_SETUP.md)
   - [README.md](README.md)

3. **Busque ajuda:**
   - Stack Overflow com tag `[flutter]` e `[firebase]`
   - GitHub Issues do FlutterFire
   - Comunidade Flutter

---

**STATUS**: 🟢 Guia de Troubleshooting Completo  
**PROTOCOL**: F-47 AR HUD Active  
**ARBORIS AI OS 1** - Genesis Foundation

---

*Última revisão: 2025-11-09*
