# 🚀 Instruções de Deploy Automático - ARBORIS AI OS 1

Este documento fornece um guia completo para configurar e usar o sistema de deploy automático do ARBORIS AI OS 1 para Firebase Hosting usando GitHub Actions.

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Pré-requisitos](#-pré-requisitos)
3. [Configuração Inicial](#-configuração-inicial)
4. [Como Funciona o Workflow](#-como-funciona-o-workflow)
5. [Como Verificar os Deploys](#-como-verificar-os-deploys)
6. [Troubleshooting](#-troubleshooting)
7. [Comandos Úteis](#-comandos-úteis)

---

## 🌟 Visão Geral

O projeto está configurado com **CI/CD automático** usando GitHub Actions. Sempre que você fizer um `push` para a branch `main`, o sistema automaticamente:

1. ✅ Configura o ambiente Flutter
2. 📦 Instala as dependências do projeto
3. 🔨 Faz o build da aplicação web em modo release
4. 🚀 Faz deploy automático para Firebase Hosting

**URL de produção:** https://arboris-core.web.app

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter:

- ✅ Conta no [Firebase](https://console.firebase.google.com/)
- ✅ Projeto Firebase criado (ID: `arboris-core`)
- ✅ Firebase CLI instalado localmente
- ✅ Permissões de administrador no repositório GitHub

---

## ⚙️ Configuração Inicial

### Passo 1: Instalar Firebase CLI

Se você ainda não tem o Firebase CLI instalado:

```bash
# Instalar via npm (requer Node.js)
npm install -g firebase-tools

# Verificar instalação
firebase --version
```

### Passo 2: Gerar o Token de Deploy

O token de autenticação permite que o GitHub Actions faça deploy sem login interativo.

```bash
# Fazer login no Firebase
firebase login

# Gerar o token CI
firebase login:ci
```

**Importante:** Guarde o token gerado! Ele terá este formato:
```
1//0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Passo 3: Adicionar o Token como Secret no GitHub

1. Acesse seu repositório no GitHub
2. Vá em **Settings** (Configurações)
3. No menu lateral, clique em **Secrets and variables** → **Actions**
4. Clique no botão **New repository secret**
5. Preencha:
   - **Name:** `FIREBASE_TOKEN`
   - **Secret:** Cole o token gerado no Passo 2
6. Clique em **Add secret**

### Passo 4: Verificar Arquivos de Configuração

Certifique-se de que os seguintes arquivos estão no repositório:

#### `.firebaserc`
```json
{
  "projects": {
    "default": "arboris-core"
  }
}
```

#### `firebase.json`
```json
{
  "hosting": {
    "public": "build/web",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

## 🔄 Como Funciona o Workflow

O workflow está localizado em `.github/workflows/firebase-deploy.yml` e executa as seguintes etapas:

### Gatilhos de Execução

O workflow é acionado quando:
- 🔀 Há um **push para a branch main**
- 🖱️ Você **aciona manualmente** na aba Actions do GitHub

### Etapas do Workflow

1. **📥 Checkout do código**
   - Faz download do código do repositório

2. **🐦 Configuração do Flutter**
   - Instala a versão stable mais recente do Flutter
   - Usa cache para acelerar builds subsequentes

3. **📦 Instalação de dependências**
   ```bash
   flutter pub get
   ```

4. **✅ Verificação da instalação**
   ```bash
   flutter doctor -v
   ```

5. **🔨 Build da aplicação web**
   ```bash
   flutter build web --release --verbose
   ```
   - Gera os arquivos otimizados em `build/web/`

6. **🔧 Configuração do Node.js**
   - Instala Node.js 20 para o Firebase CLI

7. **🔥 Instalação do Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

8. **🚀 Deploy para Firebase Hosting**
   ```bash
   firebase deploy --only hosting --token "$FIREBASE_TOKEN" --non-interactive
   ```

---

## 🔍 Como Verificar os Deploys

### Verificar Status do Workflow

1. Acesse seu repositório no GitHub
2. Clique na aba **Actions**
3. Você verá a lista de execuções do workflow
4. Clique em uma execução para ver os detalhes e logs

### Indicadores de Status

- ✅ **Verde (Success):** Deploy concluído com sucesso
- 🔄 **Amarelo (In Progress):** Deploy em andamento
- ❌ **Vermelho (Failed):** Deploy falhou (veja troubleshooting)

### Verificar Deploy no Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto **arboris-core**
3. Vá em **Hosting** no menu lateral
4. Você verá o histórico de deploys com timestamps

### Testar a Aplicação

Após o deploy bem-sucedido, acesse:
- **URL principal:** https://arboris-core.web.app
- **URL alternativa:** https://arboris-core.firebaseapp.com

---

## 🔧 Troubleshooting

### ❌ Erro: "Permission denied" ou "Authentication failed"

**Causa:** Token do Firebase inválido ou expirado

**Solução:**
1. Gere um novo token: `firebase login:ci`
2. Atualize o secret `FIREBASE_TOKEN` no GitHub

### ❌ Erro: "Project not found"

**Causa:** ID do projeto incorreto no `.firebaserc`

**Solução:**
1. Verifique o ID correto no Firebase Console
2. Atualize o arquivo `.firebaserc`:
   ```json
   {
     "projects": {
       "default": "seu-project-id-correto"
     }
   }
   ```

### ❌ Erro: "Build failed" ou erros de compilação

**Causa:** Problemas no código ou dependências incompatíveis

**Solução:**
1. Teste o build localmente:
   ```bash
   flutter clean
   flutter pub get
   flutter build web --release
   ```
2. Corrija os erros reportados
3. Faça commit das correções

### ❌ Erro: "Secret FIREBASE_TOKEN not found"

**Causa:** Secret não configurado no GitHub

**Solução:**
1. Siga o [Passo 3](#passo-3-adicionar-o-token-como-secret-no-github) da configuração inicial

### ⚠️ Deploy lento ou timeout

**Causa:** Build muito pesado ou conexão lenta

**Solução:**
1. Verifique o tamanho do build:
   ```bash
   du -sh build/web/
   ```
2. Considere otimizar assets grandes
3. Use `flutter build web --release --source-maps` para debug

### 🐛 Problemas com dependências Flutter

**Solução:**
```bash
# Limpar cache do Flutter
flutter clean

# Atualizar dependências
flutter pub upgrade

# Verificar problemas
flutter doctor -v
```

---

## 💡 Comandos Úteis

### Desenvolvimento Local

```bash
# Executar em modo desenvolvimento
flutter run -d chrome

# Build local para web
flutter build web --release

# Servir localmente
firebase serve --only hosting

# Preview do deploy (sem publicar)
firebase hosting:channel:deploy preview
```

### Deploy Manual (Alternativa ao GitHub Actions)

Se necessário, você pode fazer deploy manual:

```bash
# Build da aplicação
flutter build web --release

# Deploy direto
firebase deploy --only hosting
```

### Gerenciamento de Versões

```bash
# Ver histórico de deploys
firebase hosting:channel:list

# Rollback para versão anterior
firebase hosting:rollback
```

### Debug do Workflow

```bash
# Baixar logs do workflow
gh run view <run-id> --log

# Reexecutar workflow falhado
gh run rerun <run-id>
```

---

## 📚 Recursos Adicionais

- [Documentação do Flutter Web](https://docs.flutter.dev/platform-integration/web)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

## 🎯 Boas Práticas

### 1. **Teste antes de fazer push**
```bash
flutter test
flutter build web --release
```

### 2. **Use branches para features**
```bash
git checkout -b feature/nova-funcionalidade
# Desenvolva e teste
git push origin feature/nova-funcionalidade
# Crie Pull Request para main
```

### 3. **Monitore os deploys**
- Configure notificações do GitHub Actions
- Verifique logs regularmente
- Teste a aplicação após cada deploy

### 4. **Mantenha dependências atualizadas**
```bash
flutter pub outdated
flutter pub upgrade
```

### 5. **Use tags para releases importantes**
```bash
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0
```

---

## 📞 Suporte

Se você encontrar problemas não listados aqui:

1. Verifique os logs detalhados no GitHub Actions
2. Consulte a documentação oficial do Firebase
3. Verifique as [Issues do repositório](https://github.com/Jfredender/arboris-ai-os-1/issues)

---

## ✅ Checklist de Deploy

Antes de fazer push para main, certifique-se:

- [ ] Código testado localmente
- [ ] Build web funciona sem erros
- [ ] Dependências atualizadas no `pubspec.yaml`
- [ ] Token do Firebase válido no GitHub Secrets
- [ ] Arquivos `.firebaserc` e `firebase.json` configurados
- [ ] Commit messages descritivos

---

**🎉 Pronto! Seu pipeline de CI/CD está configurado e funcionando!**

Qualquer push para a branch `main` agora resultará em deploy automático para produção.

---

*Última atualização: 11 de Novembro de 2025*
*Versão: 1.0*
