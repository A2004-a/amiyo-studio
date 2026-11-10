#!/usr/bin/env bash
# Amiyo Studio - Linux / macOS 1-Line Installer & Launcher
# Usage: curl -fsSL https://raw.githubusercontent.com/A2004-a/amiyo-studio/main/install.sh | bash

set -e

echo -e "\033[36m==========================================\033[0m"
echo -e "\033[33m      🎬 Launching Amiyo Studio           \033[0m"
echo -e "\033[36m==========================================\033[0m"

if [ -f "index.html" ] && [ -f "bin/cli.js" ]; then
    echo -e "\033[32mRunning in current directory...\033[0m"
else
    TARGET_DIR="./amiyo-studio"
    if [ -d "$TARGET_DIR" ]; then
        echo "Found existing amiyo-studio directory, updating..."
        cd "$TARGET_DIR"
        if command -v git &> /dev/null; then
            git pull origin main
        fi
    else
        echo "Downloading Amiyo Studio..."
        if command -v git &> /dev/null; then
            git clone --depth 1 https://github.com/A2004-a/amiyo-studio.git "$TARGET_DIR"
            cd "$TARGET_DIR"
        else
            ZIP_URL="https://github.com/A2004-a/amiyo-studio/archive/refs/heads/main.zip"
            curl -fsSL "$ZIP_URL" -o amiyo-studio.zip
            unzip -q amiyo-studio.zip
            rm -f amiyo-studio.zip
            mv amiyo-studio-main "$TARGET_DIR"
            cd "$TARGET_DIR"
        fi
    fi
fi

echo -e "\033[32m✓ Amiyo Studio ready!\033[0m"

if command -v node &> /dev/null && [ -f "bin/cli.js" ]; then
    echo "Starting local high-speed server..."
    node bin/cli.js
else
    echo "Opening Amiyo Studio directly in browser..."
    if command -v xdg-open &> /dev/null; then
        xdg-open index.html
    elif command -v open &> /dev/null; then
        open index.html
    fi
fi
