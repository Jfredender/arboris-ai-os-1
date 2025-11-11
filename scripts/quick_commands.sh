#!/bin/bash

# ARBORIS AI - Quick Commands
# F-47 AR HUD Protocol

# Comandos rápidos para desenvolvimento

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

case "$1" in
    "run")
        # Run default (porta 8080)
        echo -e "${CYAN}Executando na porta 8080...${NC}"
        flutter run -d chrome --web-port=8080 --web-hostname=localhost
        ;;
    
    "clean")
        # Clean e pub get
        echo -e "${CYAN}Limpando build...${NC}"
        flutter clean
        echo -e "${CYAN}Obtendo dependências...${NC}"
        flutter pub get
        echo -e "${GREEN}✓ Pronto!${NC}"
        ;;
    
    "check")
        # Verificar configuração
        echo -e "${CYAN}Verificando configuração...${NC}"
        python3 scripts/check_firebase_config.py
        ;;
    
    "doctor")
        # Flutter doctor
        echo -e "${CYAN}Verificando Flutter...${NC}"
        flutter doctor -v
        ;;
    
    "test")
        # Run tests
        echo -e "${CYAN}Executando testes...${NC}"
        flutter test
        ;;
    
    "build")
        # Build para produção
        echo -e "${CYAN}Build de produção...${NC}"
        flutter build web --release
        ;;
    
    "devices")
        # Listar dispositivos
        echo -e "${CYAN}Dispositivos disponíveis:${NC}"
        flutter devices
        ;;
    
    "help"|*)
        # Help
        echo -e "${CYAN}ARBORIS AI - Comandos Rápidos${NC}"
        echo ""
        echo "Uso: ./scripts/quick_commands.sh [comando]"
        echo ""
        echo "Comandos:"
        echo "  run      - Executar app na porta 8080"
        echo "  clean    - Limpar build e obter dependências"
        echo "  check    - Verificar configuração Firebase/Auth"
        echo "  doctor   - Verificar instalação Flutter"
        echo "  test     - Executar testes"
        echo "  build    - Build de produção"
        echo "  devices  - Listar dispositivos"
        echo "  help     - Mostrar esta ajuda"
        echo ""
        ;;
esac
