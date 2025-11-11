# 🔐 FIREBASE & GOOGLE AUTHENTICATION - Guia Completo para Desenvolvimento Local

**Projeto**: ARBORIS AI OS 1 - Genesis Foundation  
**Protocol**: F-47 AR HUD  
**Versão do Guia**: 1.0.0  
**Última Atualização**: 9 de Novembro, 2025

---

## 📋 Índice

1. [Entendendo o Erro redirect_uri_mismatch](#1-entendendo-o-erro-redirect_uri_mismatch)
2. [Pré-requisitos](#2-pré-requisitos)
3. [Configuração do Firebase Console](#3-configuração-do-firebase-console)
4. [Configuração do Google Cloud Console](#4-configuração-do-google-cloud-console)
5. [Configuração para Desenvolvimento Local](#5-configuração-para-desenvolvimento-local)
6. [Testando a Autenticação](#6-testando-a-autenticação)
7. [Troubleshooting - Erros Comuns](#7-troubleshooting---erros-comuns)
8. [Comandos Úteis](#8-comandos-úteis)
9. [Configuração para Produção](#9-configuração-para-produção)

---

## 1. Entendendo o Erro redirect_uri_mismatch

### 🔴 O que é esse erro?

```
Error 400: redirect_uri_mismatch
```

Este erro ocorre quando o Google OAuth **não reconhece** o URI de onde a requisição de autenticação está vindo. É uma medida de segurança do Google para evitar ataques de phishing.

### ❓ Por que acontece?

O fluxo de autenticação Google OAuth funciona assim:

```
1. Usuário clica em "Sign in with Google" → sua aplicação
2. Aplicação redireciona para → Google OAuth
3. Google autentica o usuário
4. Google redireciona DE VOLTA para → sua aplicação (redirect_uri)
```

O erro acontece quando o **redirect_uri** usado no passo 4 **NÃO está autorizado** no Google Cloud Console.

### 🎯 Informações do Projeto ARBORIS

- **Firebase Project ID**: `arboris-core`
- **OAuth Client ID**: `537123553346-m5bv9uj1bf6bfb17p7344b03t291ir1g.apps.googleusercontent.com`
- **Auth Domain**: `arboris-core.firebaseapp.com`
- **Aplicação Local**: `http://localhost:8080` (ou outra porta)

### 🔧 Solução

Precisamos **adicionar explicitamente** todos os URIs de redirecionamento que nossa aplicação vai usar no Google Cloud Console.

---

## 2. Pré-requisitos

Antes de começar, certifique-se de ter:

- ✅ Conta Google (gmail)
- ✅ Acesso ao Firebase Project `arboris-core`
- ✅ Permissões de Owner ou Editor no projeto
- ✅ Navegador web (Chrome, Firefox, Safari, etc.)
- ✅ Flutter instalado na máquina
- ✅ Conexão com internet

### Verificando seu acesso

Para verificar se você tem acesso ao projeto:

1. Acesse: https://console.firebase.google.com/
2. Procure pelo projeto `arboris-core`
3. Se você vê o projeto, você tem acesso ✅
4. Se não vê, peça acesso ao administrador do projeto

---

## 3. Configuração do Firebase Console

### Passo 1: Acessar Firebase Console

1. **Abra seu navegador** e acesse:
   ```
   https://console.firebase.google.com/
   ```

2. **Faça login** com sua conta Google (se não estiver logado)

3. **Selecione o projeto** `arboris-core` na lista de projetos

### Passo 2: Verificar Authentication Provider

1. No menu lateral esquerdo, clique em **"Authentication"**
   
2. Clique na aba **"Sign-in method"** (Método de login)

3. Verifique se **"Google"** está na lista de provedores

4. Clique em **"Google"** para expandir as opções

5. Verifique se está **"Enabled"** (Ativado)
   - Se não estiver, clique no botão de edição (lápis) e ative

### Passo 3: Configurar Domínios Autorizados

Ainda na seção **Authentication**:

1. Clique na aba **"Settings"** (Configurações)

2. Role até a seção **"Authorized domains"** (Domínios autorizados)

3. Você deve ver pelo menos:
   - ✅ `localhost`
   - ✅ `arboris-core.firebaseapp.com`

4. **Se `localhost` NÃO estiver na lista:**
   - Clique em **"Add domain"** (Adicionar domínio)
   - Digite: `localhost`
   - Clique em **"Add"** (Adicionar)

### Passo 4: Obter Configurações Web (Verificação)

1. No menu lateral, clique no **ícone de engrenagem** ⚙️

2. Clique em **"Project settings"** (Configurações do projeto)

3. Role até a seção **"Your apps"** (Seus aplicativos)

4. Clique no ícone **Web** (`</>`), ou se já tiver um app web, selecione-o

5. Você verá as configurações que devem corresponder ao arquivo `firebase_options.dart`:
   ```
   apiKey: "AIzaSyAG9rWlByvtGu_2oCdjulrOY5NMO-qXTzs"
   authDomain: "arboris-core.firebaseapp.com"
   projectId: "arboris-core"
   ```

✅ **Firebase Console configurado!** Agora vamos para o Google Cloud Console.

---

## 4. Configuração do Google Cloud Console

### 📌 Importante

O Google Cloud Console é **diferente** do Firebase Console. É aqui que configuramos os **OAuth redirect URIs**.

### Passo 1: Acessar Google Cloud Console

**Opção A - Link Direto:**

Acesse diretamente a página de credenciais OAuth:
```
https://console.cloud.google.com/apis/credentials?project=arboris-core
```

**Opção B - Navegação Manual:**

1. Acesse: https://console.cloud.google.com/

2. No topo da página, clique no **seletor de projeto** (ao lado de "Google Cloud")

3. Procure e selecione o projeto **`arboris-core`**

4. No menu de navegação lateral (☰), vá para:
   ```
   APIs & Services → Credentials
   ```

### Passo 2: Localizar o OAuth Client

1. Na página **"Credentials"**, você verá uma lista de credenciais

2. Procure por **"OAuth 2.0 Client IDs"**

3. Encontre o client ID que termina em:
   ```
   537123553346-m5bv9uj1bf6bfb17p7344b03t291ir1g.apps.googleusercontent.com
   ```

4. **Clique no nome** do Client ID (ou no ícone de lápis para editar)

### Passo 3: Adicionar URIs de Redirecionamento Autorizados

Esta é a **parte mais importante** para resolver o erro `redirect_uri_mismatch`.

#### 3.1 - Localizar seção "Authorized redirect URIs"

Role a página até encontrar:
```
Authorized redirect URIs
```

#### 3.2 - Adicionar URIs para Localhost

Clique em **"+ ADD URI"** e adicione **CADA UM** destes URIs:

```
http://localhost:8080/__/auth/handler
```

**Importante**: Adicione também para outras portas comuns que você possa usar:

```
http://localhost:8080/__/auth/handler
http://localhost:8081/__/auth/handler
http://localhost:3000/__/auth/handler
http://localhost:5000/__/auth/handler
```

E também sem porta (caso o navegador omita a porta padrão):

```
http://localhost/__/auth/handler
```

#### 3.3 - Adicionar URI do Firebase Auth Domain

Adicione também o domínio oficial do Firebase:

```
https://arboris-core.firebaseapp.com/__/auth/handler
```

#### 3.4 - Adicionar URIs para IP local (opcional mas recomendado)

Para casos onde `localhost` não funciona, adicione também:

```
http://127.0.0.1:8080/__/auth/handler
http://127.0.0.1:8081/__/auth/handler
http://127.0.0.1:3000/__/auth/handler
```

### Passo 4: Adicionar Origens JavaScript Autorizadas

Role até a seção **"Authorized JavaScript origins"**

Clique em **"+ ADD URI"** e adicione:

```
http://localhost:8080
http://localhost:8081
http://localhost:3000
http://localhost
http://127.0.0.1:8080
https://arboris-core.firebaseapp.com
```

### Passo 5: Salvar Configurações

1. Role até o fim da página

2. Clique em **"SAVE"** (Salvar)

3. Aguarde a confirmação de sucesso

### ⏰ Tempo de Propagação

**IMPORTANTE**: As mudanças podem levar de **5 a 10 minutos** para propagar completamente.

- Não se preocupe se não funcionar imediatamente
- Aguarde pelo menos 5 minutos antes de testar
- Limpe o cache do navegador antes de testar novamente

✅ **Google Cloud Console configurado!**

---

## 5. Configuração para Desenvolvimento Local

### Passo 1: Verificar Configuração do Projeto

Certifique-se de que o arquivo `lib/firebase_options.dart` está correto:

```dart
static const FirebaseOptions web = FirebaseOptions(
  apiKey: 'AIzaSyAG9rWlByvtGu_2oCdjulrOY5NMO-qXTzs',
  appId: '1:537123553346:web:35a1080cda3509861b6ddb',
  messagingSenderId: '537123553346',
  projectId: 'arboris-core',
  authDomain: 'arboris-core.firebaseapp.com',
  storageBucket: 'arboris-core.firebasestorage.app',
);
```

### Passo 2: Verificar OAuth Client ID no AuthService

Abra `lib/services/auth_service.dart` e confirme:

```dart
final GoogleSignIn _googleSignIn = GoogleSignIn(
  clientId: '537123553346-m5bv9uj1bf6bfb17p7344b03t291ir1g.apps.googleusercontent.com',
  scopes: [
    'email',
    'profile',
  ],
);
```

### Passo 3: Limpar Build e Cache

Execute estes comandos no terminal:

```bash
# Navegar para o diretório do projeto
cd /home/ubuntu/code_artifacts/arboris_genesis

# Limpar build anterior
flutter clean

# Obter dependências
flutter pub get

# Verificar configuração
flutter doctor -v
```

### Passo 4: Executar na Porta Correta

Para executar na porta 8080 (a mesma que configuramos):

```bash
flutter run -d chrome --web-port=8080 --web-hostname=localhost
```

**Outras portas comuns:**

Porta 8081:
```bash
flutter run -d chrome --web-port=8081 --web-hostname=localhost
```

Porta 3000:
```bash
flutter run -d chrome --web-port=3000 --web-hostname=localhost
```

Deixar Flutter escolher automaticamente:
```bash
flutter run -d chrome
```

### Passo 5: Verificar URL no Navegador

Quando a aplicação abrir, verifique a URL na barra de endereço:

```
http://localhost:8080
```

Se estiver usando outra porta, certifique-se de que ela foi adicionada no Google Cloud Console.

---

## 6. Testando a Autenticação

### Teste Passo a Passo

#### 1. Abrir a Aplicação

Execute o comando:
```bash
flutter run -d chrome --web-port=8080 --web-hostname=localhost
```

#### 2. Abrir DevTools do Navegador

Pressione **F12** ou **Ctrl+Shift+I** (Windows/Linux) / **Cmd+Option+I** (Mac)

#### 3. Ver Console de Logs

Clique na aba **"Console"** no DevTools

#### 4. Clicar em "Sign In with Google"

Na aplicação, clique no botão de login do Google

#### 5. Observar o Fluxo

**Cenário de Sucesso ✅:**
1. Popup do Google abre
2. Você seleciona sua conta
3. Popup fecha automaticamente
4. Você é redirecionado para a tela Home
5. Vê sua foto e nome de perfil

**Cenário de Erro ❌:**
1. Popup do Google abre
2. Você vê erro 400: redirect_uri_mismatch
3. Popup não fecha

#### 6. Verificar Logs no Console

Se houver erro, você verá no console:
```
Error signing in with Google: [detalhes do erro]
```

### Verificar Autenticação no Firebase Console

1. Acesse: https://console.firebase.google.com/project/arboris-core/authentication/users

2. Clique na aba **"Users"** (Usuários)

3. Se a autenticação foi bem-sucedida, você verá seu usuário listado com:
   - Email
   - Provider: Google
   - Data de criação

---

## 7. Troubleshooting - Erros Comuns

### Erro 1: redirect_uri_mismatch

**Mensagem:**
```
Error 400: redirect_uri_mismatch
The redirect URI in the request: http://localhost:8080/__/auth/handler 
does not match the ones authorized for the OAuth client.
```

**Causa:**  
O URI não está autorizado no Google Cloud Console.

**Solução:**

1. Copie o URI **exato** da mensagem de erro
2. Acesse Google Cloud Console → Credentials
3. Edite o OAuth Client ID
4. Adicione o URI **exatamente como aparece no erro**
5. Salve e aguarde 5-10 minutos

**Dica**: Preste atenção em:
- `http://` vs `https://`
- Porta incluída ou não: `:8080`
- Caminho correto: `/__/auth/handler`

### Erro 2: Access Blocked: Authorization Error

**Mensagem:**
```
Access blocked: arboris-core.firebaseapp.com has not completed the Google verification process
```

**Causa:**  
O app está em modo de teste do Google OAuth e você não está na lista de testadores.

**Solução:**

1. Acesse Google Cloud Console → OAuth consent screen
2. Se o app está em "Testing":
   - Adicione seu email em "Test users"
   - Ou publique o app (somente se for produção)

### Erro 3: API Key não válida

**Mensagem:**
```
API key not valid. Please pass a valid API key.
```

**Causa:**  
A API Key do Firebase está incorreta ou expirou.

**Solução:**

1. Acesse Firebase Console → Project Settings
2. Verifique a API Key na seção "Web API Key"
3. Compare com `firebase_options.dart`
4. Se diferente, atualize o arquivo

### Erro 4: Popup Bloqueado pelo Navegador

**Sintoma:**  
Ao clicar em "Sign In with Google", nada acontece.

**Causa:**  
O navegador está bloqueando popups.

**Solução:**

1. Verifique se há um ícone de popup bloqueado na barra de endereço
2. Clique e selecione "Sempre permitir popups de localhost"
3. Tente novamente

### Erro 5: CORS Error

**Mensagem:**
```
Access to XMLHttpRequest at '...' from origin 'http://localhost:8080' 
has been blocked by CORS policy
```

**Causa:**  
Domínio não está autorizado no Firebase.

**Solução:**

1. Firebase Console → Authentication → Settings
2. Verifique "Authorized domains"
3. Adicione `localhost` se não estiver lá

### Erro 6: Network Error

**Mensagem:**
```
A network error (such as timeout, interrupted connection or unreachable host) has occurred.
```

**Causa:**  
Problemas de conexão ou firewall.

**Solução:**

1. Verifique sua conexão com internet
2. Desative VPN (se estiver usando)
3. Verifique se o firewall não está bloqueando
4. Tente em uma rede diferente

### Erro 7: Mudanças não surtem efeito

**Sintoma:**  
Você fez as mudanças no Google Cloud Console mas o erro persiste.

**Causa:**  
Cache do navegador ou propagação de configuração.

**Solução:**

1. Aguarde 5-10 minutos para propagação
2. Limpe cache do navegador:
   - Chrome: Ctrl+Shift+Delete → Limpar dados
   - Ou abra aba anônima (Ctrl+Shift+N)
3. Reinicie o servidor Flutter:
   ```bash
   # Pare o servidor (Ctrl+C)
   flutter clean
   flutter pub get
   flutter run -d chrome --web-port=8080
   ```

---

## 8. Comandos Úteis

### Executar em Diferentes Portas

**Porta 8080:**
```bash
flutter run -d chrome --web-port=8080 --web-hostname=localhost
```

**Porta 8081:**
```bash
flutter run -d chrome --web-port=8081 --web-hostname=localhost
```

**Porta 3000:**
```bash
flutter run -d chrome --web-port=3000 --web-hostname=localhost
```

**Hot Reload (após fazer mudanças):**

Pressione `r` no terminal onde o Flutter está rodando.

**Hot Restart (reiniciar app):**

Pressione `R` (maiúsculo) no terminal.

### Limpar Cache e Reconstruir

**Limpar completamente:**
```bash
flutter clean
flutter pub get
flutter pub upgrade
```

**Rebuild completo:**
```bash
flutter clean
flutter pub get
flutter run -d chrome --web-port=8080
```

**Ver logs detalhados:**
```bash
flutter run -d chrome --web-port=8080 -v
```

### Verificar Configuração Flutter

**Verificar instalação:**
```bash
flutter doctor -v
```

**Listar dispositivos disponíveis:**
```bash
flutter devices
```

**Verificar versão Flutter:**
```bash
flutter --version
```

### Limpar Cache do Navegador (via CLI)

**Chrome no Linux:**
```bash
rm -rf ~/.config/google-chrome/Default/Cache
rm -rf ~/.config/google-chrome/Default/Code\ Cache
```

**Chrome no Mac:**
```bash
rm -rf ~/Library/Caches/Google/Chrome
```

**Alternativa universal - Usar modo incógnito:**
```bash
google-chrome --incognito http://localhost:8080
```

---

## 9. Configuração para Produção

### Quando Hospedar em Domínio Real

Quando você fizer deploy da aplicação em um domínio real (exemplo: `https://arboris.ai`), você precisará:

#### 1. Adicionar Domínio no Firebase Console

1. Firebase Console → Authentication → Settings
2. Authorized domains → Add domain
3. Adicione seu domínio (ex: `arboris.ai`)

#### 2. Adicionar URIs no Google Cloud Console

1. Google Cloud Console → APIs & Services → Credentials
2. Edite o OAuth Client ID
3. Adicione em "Authorized redirect URIs":
   ```
   https://arboris.ai/__/auth/handler
   https://www.arboris.ai/__/auth/handler
   ```
4. Adicione em "Authorized JavaScript origins":
   ```
   https://arboris.ai
   https://www.arboris.ai
   ```

#### 3. Atualizar OAuth Consent Screen

1. Google Cloud Console → OAuth consent screen
2. Verifique "App domain" e "Authorized domains"
3. Adicione seu domínio de produção
4. Se necessário, submeta para verificação do Google

#### 4. Considerar SSL/HTTPS

⚠️ **IMPORTANTE**: Em produção, **sempre** use HTTPS.

- O Google OAuth exige HTTPS (exceto localhost)
- Firebase Hosting já fornece HTTPS automaticamente
- Se usar outro host, configure certificado SSL

### Firebase Hosting (Deploy)

Para fazer deploy no Firebase Hosting:

```bash
# Instalar Firebase CLI (se não tiver)
npm install -g firebase-tools

# Login no Firebase
firebase login

# Build da aplicação
flutter build web

# Inicializar Firebase no projeto (primeira vez)
firebase init hosting

# Deploy
firebase deploy --only hosting
```

Seu app estará disponível em:
```
https://arboris-core.firebaseapp.com
```

---

## 📝 Checklist Completo

Use este checklist para verificar se tudo está configurado:

### Firebase Console
- [ ] Projeto `arboris-core` acessível
- [ ] Authentication ativado
- [ ] Google provider habilitado
- [ ] `localhost` em Authorized domains
- [ ] `arboris-core.firebaseapp.com` em Authorized domains

### Google Cloud Console
- [ ] Projeto `arboris-core` selecionado
- [ ] OAuth Client ID localizado
- [ ] Redirect URIs adicionados:
  - [ ] `http://localhost:8080/__/auth/handler`
  - [ ] `http://localhost/__/auth/handler`
  - [ ] `https://arboris-core.firebaseapp.com/__/auth/handler`
- [ ] JavaScript origins adicionados:
  - [ ] `http://localhost:8080`
  - [ ] `http://localhost`
  - [ ] `https://arboris-core.firebaseapp.com`
- [ ] Configurações salvas
- [ ] Aguardado 5-10 minutos para propagação

### Projeto Flutter
- [ ] `firebase_options.dart` com configurações corretas
- [ ] `auth_service.dart` com OAuth Client ID correto
- [ ] Dependências atualizadas (`flutter pub get`)
- [ ] Build limpo (`flutter clean` executado)

### Testes
- [ ] App roda em `http://localhost:8080`
- [ ] DevTools do navegador aberto (F12)
- [ ] Clique em "Sign In with Google" funciona
- [ ] Popup do Google abre sem erros
- [ ] Autenticação completa com sucesso
- [ ] Usuário aparece no Firebase Console → Authentication → Users

---

## 🎯 Links Rápidos

### Firebase
- **Firebase Console**: https://console.firebase.google.com/project/arboris-core
- **Authentication Users**: https://console.firebase.google.com/project/arboris-core/authentication/users
- **Authentication Settings**: https://console.firebase.google.com/project/arboris-core/authentication/settings
- **Project Settings**: https://console.firebase.google.com/project/arboris-core/settings/general

### Google Cloud
- **Cloud Console**: https://console.cloud.google.com/?project=arboris-core
- **Credentials**: https://console.cloud.google.com/apis/credentials?project=arboris-core
- **OAuth Consent Screen**: https://console.cloud.google.com/apis/credentials/consent?project=arboris-core

### Documentação
- **Firebase Auth Docs**: https://firebase.google.com/docs/auth
- **Google Sign-In Flutter**: https://pub.dev/packages/google_sign_in
- **FlutterFire**: https://firebase.flutter.dev/

---

## 💡 Dicas Finais

1. **Sempre use localhost em desenvolvimento**
   - Não use IP (127.0.0.1) se não precisar
   - Mantenha a mesma porta quando possível

2. **Aguarde a propagação**
   - Mudanças no Google Cloud levam tempo
   - 5-10 minutos é normal
   - Use aba anônima para testar (evita cache)

3. **Logs são seus amigos**
   - Sempre abra DevTools (F12)
   - Verifique a aba Console
   - Erros de OAuth aparecem claramente

4. **Teste em modo anônimo primeiro**
   - Cache do navegador pode esconder erros
   - Aba anônita garante teste limpo

5. **Documente suas configurações**
   - Anote as portas que você usa
   - Mantenha lista de URIs adicionados
   - Facilita debugging futuro

---

## ✅ Conclusão

Seguindo este guia passo a passo, você deve conseguir:

1. ✅ Entender o erro `redirect_uri_mismatch`
2. ✅ Configurar Firebase Console corretamente
3. ✅ Configurar Google Cloud Console com URIs adequados
4. ✅ Executar a aplicação localmente sem erros
5. ✅ Autenticar com Google com sucesso
6. ✅ Resolver problemas comuns de OAuth

Se após seguir todos os passos você ainda encontrar problemas, consulte a seção de [Troubleshooting](#7-troubleshooting---erros-comuns) ou verifique o arquivo `TROUBLESHOOTING.md` para casos específicos.

---

**STATUS**: 🟢 Guia Completo  
**PROTOCOL**: F-47 AR HUD Active  
**ARBORIS AI OS 1** - Genesis Foundation

---

*Última revisão: 2025-11-09*
