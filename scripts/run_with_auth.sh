#!/bin/bash

# ARBORIS AI - Run with Authentication Helper
# F-47 AR HUD Protocol

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Banner
echo -e "${CYAN}${BOLD}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     ARBORIS AI - Authentication Runner                   ║"
echo "║     F-47 AR HUD Protocol                                 ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Função para print com cor
print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BOLD}$1${NC}"
    echo "════════════════════════════════════════════════════════════"
}

# Verificar se estamos no diretório correto
if [ ! -f "pubspec.yaml" ]; then
    print_error "pubspec.yaml não encontrado!"
    print_info "Execute este script do diretório raiz do projeto Flutter"
    exit 1
fi

print_success "Projeto Flutter encontrado"

# Menu de opções
print_header "OPÇÕES DE EXECUÇÃO"
echo ""
echo "1) Executar na porta 8080 (padrão)"
echo "2) Executar na porta 8081"
echo "3) Executar na porta 3000"
echo "4) Limpar build e executar na porta 8080"
echo "5) Verificar configuração antes de executar"
echo "6) Executar em modo verbose (debug)"
echo "7) Executar testes"
echo "8) Build para produção"
echo "9) Sair"
echo ""

read -p "Escolha uma opção (1-9): " option

case $option in
    1)
        print_header "EXECUTANDO NA PORTA 8080"
        print_info "URL: http://localhost:8080"
        print_info "Pressione Ctrl+C para parar"
        echo ""
        flutter run -d chrome --web-port=8080 --web-hostname=localhost
        ;;
    
    2)
        print_header "EXECUTANDO NA PORTA 8081"
        print_info "URL: http://localhost:8081"
        print_warning "Certifique-se de que esta porta está configurada no Google Cloud Console"
        print_info "Pressione Ctrl+C para parar"
        echo ""
        flutter run -d chrome --web-port=8081 --web-hostname=localhost
        ;;
    
    3)
        print_header "EXECUTANDO NA PORTA 3000"
        print_info "URL: http://localhost:3000"
        print_warning "Certifique-se de que esta porta está configurada no Google Cloud Console"
        print_info "Pressione Ctrl+C para parar"
        echo ""
        flutter run -d chrome --web-port=3000 --web-hostname=localhost
        ;;
    
    4)
        print_header "LIMPANDO BUILD E EXECUTANDO"
        
        print_info "Limpando build anterior..."
        flutter clean
        
        print_info "Obtendo dependências..."
        flutter pub get
        
        print_success "Build limpo concluído"
        
        print_info "Executando na porta 8080..."
        flutter run -d chrome --web-port=8080 --web-hostname=localhost
        ;;
    
    5)
        print_header "VERIFICANDO CONFIGURAÇÃO"
        
        if [ -f "scripts/check_firebase_config.py" ]; then
            python3 scripts/check_firebase_config.py
        else
            print_error "Script de verificação não encontrado"
            print_info "Execute: python3 scripts/check_firebase_config.py"
        fi
        
        echo ""
        read -p "Deseja executar o app agora? (y/n): " run_app
        
        if [ "$run_app" = "y" ] || [ "$run_app" = "Y" ]; then
            print_info "Executando na porta 8080..."
            flutter run -d chrome --web-port=8080 --web-hostname=localhost
        fi
        ;;
    
    6)
        print_header "EXECUTANDO EM MODO VERBOSE"
        print_info "Modo debug com logs detalhados"
        print_info "Pressione Ctrl+C para parar"
        echo ""
        flutter run -d chrome --web-port=8080 --web-hostname=localhost -v
        ;;
    
    7)
        print_header "EXECUTANDO TESTES"
        
        if [ -d "test" ]; then
            print_info "Executando testes unitários..."
            flutter test
        else
            print_warning "Diretório de testes não encontrado"
        fi
        ;;
    
    8)
        print_header "BUILD PARA PRODUÇÃO"
        
        print_info "Limpando build anterior..."
        flutter clean
        
        print_info "Obtendo dependências..."
        flutter pub get
        
        print_info "Criando build de produção..."
        flutter build web --release
        
        if [ $? -eq 0 ]; then
            print_success "Build de produção concluído!"
            print_info "Arquivos em: build/web/"
            
            echo ""
            print_info "Para fazer deploy no Firebase Hosting:"
            echo "  1. firebase login"
            echo "  2. firebase init hosting (primeira vez)"
            echo "  3. firebase deploy --only hosting"
        else
            print_error "Build falhou"
        fi
        ;;
    
    9)
        print_info "Saindo..."
        exit 0
        ;;
    
    *)
        print_error "Opção inválida"
        exit 1
        ;;
esac

echo ""
print_success "Comando concluído"
