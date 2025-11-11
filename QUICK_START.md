# 🚀 QUICK START - ARBORIS AI OS 1

**Para resolver o erro `redirect_uri_mismatch` rapidamente!**

---

## ⚡ Início Rápido - 3 Passos

### 1️⃣ Verificar Configuração

```bash
cd /home/ubuntu/code_artifacts/arboris_genesis
python3 scripts/check_firebase_config.py
```

### 2️⃣ Configurar Google Cloud Console

1. Acesse: https://console.cloud.google.com/apis/credentials?project=arboris-core

2. Clique no OAuth Client ID que termina em: `...1b6ddb`

3. Em **"Authorized redirect URIs"**, adicione:
   ```
   http://localhost:8080/__/auth/handler
   http://localhost:8081/__/auth/handler
   http://localhost:3000/__/auth/handler
   https://arboris-core.firebaseapp.com/__/auth/handler
   ```

4. Em **"Authorized JavaScript origins"**, adicione:
   ```
   http://localhost:8080
   http://localhost:8081
   http://localhost:3000
   https://arboris-core.firebaseapp.com
   ```

5. Clique em **SAVE**

6. ⏰ **Aguarde 5-10 minutos** para propagação

### 3️⃣ Executar o App

```bash
# Opção 1: Menu interativo
./scripts/run_with_auth.sh

# Opção 2: Comando direto
./scripts/quick_commands.sh run

# Opção 3: Comando Flutter manual
flutter run -d chrome --web-port=8080 --web-hostname=localhost
```

---

## 📚 Documentação Completa

Se você nunca usou Firebase antes ou quer entender todos os detalhes:

**📖 [FIREBASE_GOOGLE_AUTH_SETUP.md](FIREBASE_GOOGLE_AUTH_SETUP.md)**  
*Guia passo a passo completo e detalhado com screenshots e explicações*

**🔧 [TROUBLESHOOTING.md](TROUBLESHOOTING.md)**  
*Soluções para todos os erros comuns*

**📝 [README.md](README.md)**  
*Documentação geral do projeto*

---

## 🛠️ Scripts Disponíveis

### Verificar Configuração
```bash
python3 scripts/check_firebase_config.py
```
Verifica se todas as configurações estão corretas

### Menu Interativo
```bash
./scripts/run_with_auth.sh
```
Menu com opções para executar, limpar, testar, etc.

### Comandos Rápidos
```bash
./scripts/quick_commands.sh [comando]

# Comandos disponíveis:
# run      - Executar app
# clean    - Limpar build
# check    - Verificar config
# doctor   - Flutter doctor
# test     - Executar testes
# build    - Build produção
```

---

## 🎯 Problemas Comuns

### ❌ redirect_uri_mismatch
**Solução**: Siga o passo 2 acima e aguarde 5-10 minutos

### ❌ Popup bloqueado
**Solução**: Permita popups para localhost no seu navegador

### ❌ Mudanças não surtem efeito
**Solução**: Limpe o cache do navegador (Ctrl+Shift+Delete) ou use aba anônima

### ❌ Porta 8080 em uso
**Solução**: Use `./scripts/run_with_auth.sh` e escolha outra porta

---

## 🔗 Links Úteis

- **Google Cloud Credentials**: https://console.cloud.google.com/apis/credentials?project=arboris-core
- **Firebase Console**: https://console.firebase.google.com/project/arboris-core
- **Firebase Auth Settings**: https://console.firebase.google.com/project/arboris-core/authentication/settings

---

## ✅ Checklist

Antes de executar, certifique-se:

- [ ] URIs de redirecionamento adicionados no Google Cloud Console
- [ ] JavaScript origins adicionados no Google Cloud Console
- [ ] Configurações salvas no Google Cloud
- [ ] Aguardado 5-10 minutos após salvar
- [ ] `localhost` autorizado no Firebase Console
- [ ] Executou `python3 scripts/check_firebase_config.py`
- [ ] Limpou cache do navegador

---

## 🆘 Precisa de Ajuda?

1. **Erro específico?** → Consulte [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. **Primeira vez com Firebase?** → Leia [FIREBASE_GOOGLE_AUTH_SETUP.md](FIREBASE_GOOGLE_AUTH_SETUP.md)
3. **Dúvida geral?** → Veja [README.md](README.md)

---

**STATUS**: ✅ Pronto para usar  
**PROTOCOL**: F-47 AR HUD Active  
**ARBORIS AI OS 1** - Genesis Foundation
