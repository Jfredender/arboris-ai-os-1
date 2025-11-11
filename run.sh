#!/bin/bash

# ARBORIS AI OS 1 - Launch Script
# F-47 AR HUD Protocol Initialization

echo "=========================================="
echo "  ARBORIS AI OS 1 - Genesis Foundation"
echo "  F-47 AR HUD Protocol"
echo "=========================================="
echo ""

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    echo -e "${RED}❌ Flutter not found in PATH${NC}"
    echo ""
    echo "Please install Flutter:"
    echo "  1. Download from https://flutter.dev"
    echo "  2. Add to PATH: export PATH=\"\$PATH:/path/to/flutter/bin\""
    echo "  3. Run: flutter doctor"
    exit 1
fi

echo -e "${CYAN}>>> Flutter SDK detected${NC}"
flutter --version
echo ""

# Get dependencies
echo -e "${CYAN}>>> Installing dependencies...${NC}"
flutter pub get

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Check for Chrome
echo -e "${CYAN}>>> Checking for Chrome...${NC}"
flutter devices | grep -i chrome

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Chrome detected${NC}"
    echo ""
    echo -e "${CYAN}>>> Launching ARBORIS AI on Chrome...${NC}"
    flutter run -d chrome
else
    echo -e "${RED}⚠️  Chrome not found${NC}"
    echo ""
    echo "Available devices:"
    flutter devices
    echo ""
    echo "To run on Chrome:"
    echo "  flutter run -d chrome"
    echo ""
    echo "To run on other devices:"
    echo "  flutter run"
fi
