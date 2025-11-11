#!/usr/bin/env python3
"""
ARBORIS AI - Firebase & Google Auth Configuration Checker
F-47 AR HUD Protocol

Este script verifica se todas as configurações necessárias para
Google Authentication estão corretas no projeto.
"""

import os
import re
import json
import sys
from pathlib import Path
from typing import Dict, List, Tuple

# ANSI colors para output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(text: str):
    """Print header estilizado"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(60)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")

def print_success(text: str):
    """Print mensagem de sucesso"""
    print(f"{Colors.OKGREEN}✓ {text}{Colors.ENDC}")

def print_error(text: str):
    """Print mensagem de erro"""
    print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")

def print_warning(text: str):
    """Print mensagem de aviso"""
    print(f"{Colors.WARNING}⚠ {text}{Colors.ENDC}")

def print_info(text: str):
    """Print mensagem informativa"""
    print(f"{Colors.OKCYAN}ℹ {text}{Colors.ENDC}")

def find_project_root() -> Path:
    """Encontra a raiz do projeto Flutter"""
    current = Path.cwd()
    
    # Procura por pubspec.yaml subindo na hierarquia
    for parent in [current] + list(current.parents):
        pubspec = parent / "pubspec.yaml"
        if pubspec.exists():
            return parent
    
    raise FileNotFoundError("Não foi possível encontrar pubspec.yaml. Execute este script do diretório do projeto.")

def check_file_exists(filepath: Path, description: str) -> bool:
    """Verifica se um arquivo existe"""
    if filepath.exists():
        print_success(f"{description} encontrado: {filepath}")
        return True
    else:
        print_error(f"{description} NÃO encontrado: {filepath}")
        return False

def extract_config_from_dart(filepath: Path) -> Dict[str, str]:
    """Extrai configurações do arquivo firebase_options.dart"""
    config = {}
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Extrai configurações usando regex
    patterns = {
        'apiKey': r"apiKey:\s*'([^']+)'",
        'appId': r"appId:\s*'([^']+)'",
        'projectId': r"projectId:\s*'([^']+)'",
        'authDomain': r"authDomain:\s*'([^']+)'",
        'storageBucket': r"storageBucket:\s*'([^']+)'",
    }
    
    for key, pattern in patterns.items():
        match = re.search(pattern, content)
        if match:
            config[key] = match.group(1)
    
    return config

def extract_oauth_from_auth_service(filepath: Path) -> str:
    """Extrai OAuth Client ID do auth_service.dart"""
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Procura por clientId
    match = re.search(r"clientId:\s*'([^']+)'", content)
    if match:
        return match.group(1)
    
    return ""

def check_firebase_options(project_root: Path) -> Tuple[bool, Dict]:
    """Verifica configurações do firebase_options.dart"""
    print_header("VERIFICANDO FIREBASE OPTIONS")
    
    firebase_options_path = project_root / "lib" / "firebase_options.dart"
    
    if not check_file_exists(firebase_options_path, "firebase_options.dart"):
        return False, {}
    
    config = extract_config_from_dart(firebase_options_path)
    
    # Configurações esperadas
    expected = {
        'projectId': 'arboris-core',
        'authDomain': 'arboris-core.firebaseapp.com',
        'apiKey': 'AIzaSyAG9rWlByvtGu_2oCdjulrOY5NMO-qXTzs',
    }
    
    all_correct = True
    
    for key, expected_value in expected.items():
        if key in config:
            if config[key] == expected_value:
                print_success(f"{key}: {config[key]}")
            else:
                print_error(f"{key}: {config[key]} (esperado: {expected_value})")
                all_correct = False
        else:
            print_error(f"{key}: NÃO ENCONTRADO")
            all_correct = False
    
    return all_correct, config

def check_auth_service(project_root: Path) -> Tuple[bool, str]:
    """Verifica configurações do auth_service.dart"""
    print_header("VERIFICANDO AUTH SERVICE")
    
    auth_service_path = project_root / "lib" / "services" / "auth_service.dart"
    
    if not check_file_exists(auth_service_path, "auth_service.dart"):
        return False, ""
    
    oauth_client_id = extract_oauth_from_auth_service(auth_service_path)
    
    expected_oauth = "537123553346-m5bv9uj1bf6bfb17p7344b03t291ir1g.apps.googleusercontent.com"
    
    if oauth_client_id == expected_oauth:
        print_success(f"OAuth Client ID: {oauth_client_id}")
        return True, oauth_client_id
    else:
        print_error(f"OAuth Client ID: {oauth_client_id}")
        print_error(f"Esperado: {expected_oauth}")
        return False, oauth_client_id

def check_pubspec_dependencies(project_root: Path) -> bool:
    """Verifica dependências no pubspec.yaml"""
    print_header("VERIFICANDO DEPENDÊNCIAS")
    
    pubspec_path = project_root / "pubspec.yaml"
    
    if not check_file_exists(pubspec_path, "pubspec.yaml"):
        return False
    
    with open(pubspec_path, 'r') as f:
        content = f.read()
    
    required_deps = [
        'firebase_core',
        'firebase_auth',
        'google_sign_in',
    ]
    
    all_found = True
    
    for dep in required_deps:
        if dep in content:
            print_success(f"{dep} encontrado")
        else:
            print_error(f"{dep} NÃO encontrado")
            all_found = False
    
    return all_found

def check_web_index_html(project_root: Path) -> bool:
    """Verifica se web/index.html tem os scripts necessários"""
    print_header("VERIFICANDO WEB/INDEX.HTML")
    
    index_path = project_root / "web" / "index.html"
    
    if not check_file_exists(index_path, "web/index.html"):
        return False
    
    with open(index_path, 'r') as f:
        content = f.read()
    
    # Verificar scripts Firebase
    checks = [
        ('Firebase SDK', 'firebase-app.js'),
        ('Firebase Auth', 'firebase-auth.js'),
    ]
    
    all_found = True
    
    for name, script in checks:
        if script in content:
            print_success(f"{name} script encontrado")
        else:
            print_warning(f"{name} script NÃO encontrado (pode estar usando CDN)")
    
    return all_found

def generate_redirect_uris(ports: List[int]) -> List[str]:
    """Gera lista de redirect URIs que devem estar configurados"""
    uris = []
    
    # Firebase auth domain
    uris.append("https://arboris-core.firebaseapp.com/__/auth/handler")
    
    # Localhost com portas
    for port in ports:
        uris.append(f"http://localhost:{port}/__/auth/handler")
        uris.append(f"http://127.0.0.1:{port}/__/auth/handler")
    
    # Localhost sem porta
    uris.append("http://localhost/__/auth/handler")
    
    return uris

def generate_javascript_origins(ports: List[int]) -> List[str]:
    """Gera lista de JavaScript origins que devem estar configurados"""
    origins = []
    
    # Firebase auth domain
    origins.append("https://arboris-core.firebaseapp.com")
    
    # Localhost com portas
    for port in ports:
        origins.append(f"http://localhost:{port}")
        origins.append(f"http://127.0.0.1:{port}")
    
    # Localhost sem porta
    origins.append("http://localhost")
    
    return origins

def print_required_google_cloud_config():
    """Imprime configurações necessárias para Google Cloud Console"""
    print_header("CONFIGURAÇÕES NECESSÁRIAS NO GOOGLE CLOUD CONSOLE")
    
    print_info("Acesse: https://console.cloud.google.com/apis/credentials?project=arboris-core")
    print_info("Edite o OAuth Client ID e adicione os seguintes URIs:\n")
    
    common_ports = [8080, 8081, 3000, 5000]
    
    print(f"\n{Colors.BOLD}Authorized redirect URIs:{Colors.ENDC}")
    for uri in generate_redirect_uris(common_ports):
        print(f"  {Colors.OKCYAN}{uri}{Colors.ENDC}")
    
    print(f"\n{Colors.BOLD}Authorized JavaScript origins:{Colors.ENDC}")
    for origin in generate_javascript_origins(common_ports):
        print(f"  {Colors.OKCYAN}{origin}{Colors.ENDC}")

def print_firebase_console_config():
    """Imprime configurações necessárias para Firebase Console"""
    print_header("CONFIGURAÇÕES NECESSÁRIAS NO FIREBASE CONSOLE")
    
    print_info("Acesse: https://console.firebase.google.com/project/arboris-core/authentication/settings")
    print_info("Verifique se os seguintes domínios estão autorizados:\n")
    
    domains = [
        "localhost",
        "arboris-core.firebaseapp.com",
    ]
    
    print(f"\n{Colors.BOLD}Authorized domains:{Colors.ENDC}")
    for domain in domains:
        print(f"  {Colors.OKCYAN}{domain}{Colors.ENDC}")

def print_summary(results: Dict[str, bool]):
    """Imprime resumo dos resultados"""
    print_header("RESUMO DA VERIFICAÇÃO")
    
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    
    print(f"\nTotal de verificações: {total}")
    print(f"Passou: {Colors.OKGREEN}{passed}{Colors.ENDC}")
    print(f"Falhou: {Colors.FAIL}{total - passed}{Colors.ENDC}")
    
    if passed == total:
        print(f"\n{Colors.OKGREEN}{Colors.BOLD}✓ Todas as verificações passaram!{Colors.ENDC}")
        print(f"\n{Colors.OKCYAN}Próximos passos:{Colors.ENDC}")
        print("1. Verifique as configurações do Google Cloud Console (acima)")
        print("2. Verifique as configurações do Firebase Console (acima)")
        print("3. Execute: flutter run -d chrome --web-port=8080")
        print("4. Teste a autenticação Google")
    else:
        print(f"\n{Colors.FAIL}{Colors.BOLD}✗ Algumas verificações falharam{Colors.ENDC}")
        print(f"\n{Colors.WARNING}Corrija os problemas acima antes de prosseguir{Colors.ENDC}")
    
    print()

def main():
    """Função principal"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}")
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║     ARBORIS AI - Firebase Config Checker                 ║")
    print("║     F-47 AR HUD Protocol                                 ║")
    print("╚═══════════════════════════════════════════════════════════╝")
    print(f"{Colors.ENDC}\n")
    
    try:
        # Encontra raiz do projeto
        project_root = find_project_root()
        print_info(f"Projeto encontrado em: {project_root}\n")
        
        # Executa verificações
        results = {}
        
        results['firebase_options'], _ = check_firebase_options(project_root)
        results['auth_service'], _ = check_auth_service(project_root)
        results['dependencies'] = check_pubspec_dependencies(project_root)
        results['web_index'] = check_web_index_html(project_root)
        
        # Imprime configurações necessárias
        print_required_google_cloud_config()
        print_firebase_console_config()
        
        # Imprime resumo
        print_summary(results)
        
        # Exit code baseado nos resultados
        sys.exit(0 if all(results.values()) else 1)
        
    except FileNotFoundError as e:
        print_error(f"Erro: {e}")
        sys.exit(1)
    except Exception as e:
        print_error(f"Erro inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
