#!/usr/bin/env bash
# Amiyo Studio - Universal Terminal Installer & Launcher
# Supported: Windows (Git Bash/WSL), Linux, macOS, Android (Termux)
# Usage: curl -fsSL https://raw.githubusercontent.com/A2004-a/amiyo-studio/main/install.sh | bash

set -e

APP_VERSION="1.0.0"
GITHUB_REPO="A2004-a/amiyo-studio"

echo -e "\033[33m       ▲\033[0m"
echo -e "\033[33m      /█\\\033[0m"
echo -e "\033[33m     /███\\        \033[31m▶  AMIYO STUDIO\033[0m"
echo -e "\033[33m    /██ █ \\          \033[36mProfessional Video Editor v${APP_VERSION}\033[0m"
echo -e "\033[33m   /███████\\\033[0m"
echo -e "\033[33m  /███   ███\\\033[0m"
echo -e "\033[33m ═════════════\033[0m"
echo -e "\033[36m==========================================\033[0m"
echo -e "\033[33m          Amiyo Studio v${APP_VERSION}    \033[0m"
echo -e "\033[36m==========================================\033[0m"

# Detect OS environment
IS_ANDROID=0
if [ "$(uname -o 2>/dev/null)" = "Android" ] || [ -n "$TERMUX_VERSION" ] || [ -d "/data/data/com.termux" ]; then
    IS_ANDROID=1
    echo -e "\033[35m[INFO] Detected Android (Termux) environment\033[0m"
fi

# 1. Version Check Request
if [ "$1" = "--version" ] || [ "$1" = "-v" ] || [ "$1" = "version" ] || [ "$AMIYO_VERSION_ONLY" = "1" ]; then
    echo -e "\033[32mInstalled Version: v${APP_VERSION}\033[0m"
    exit 0
fi

# 2. Check if already installed or in active repository
TARGET_DIR=""
STANDARD_DIR="$HOME/.amiyo-studio"

if [ -f "index.html" ] && [ -f "bin/cli.js" ]; then
    TARGET_DIR="$(pwd)"
    echo -e "\033[32m[OK] Detected active workspace: ${TARGET_DIR}\033[0m"
    if [ -d ".git" ]; then
        echo -e "\033[36m[INFO] Syncing latest updates via git...\033[0m"
        git pull --rebase origin main 2>/dev/null || true
    fi
elif [ -f "${STANDARD_DIR}/index.html" ]; then
    TARGET_DIR="${STANDARD_DIR}"
    echo -e "\033[32m[OK] Detected existing installation at: ${TARGET_DIR}\033[0m"
    if [ -d "${STANDARD_DIR}/.git" ]; then
        echo -e "\033[36m[INFO] Pulling latest v${APP_VERSION} updates...\033[0m"
        cd "${STANDARD_DIR}"
        git pull --rebase origin main 2>/dev/null || true
        cd - >/dev/null
    fi
else
    echo -e "\033[33m[INFO] Installing Amiyo Studio v${APP_VERSION} to ${STANDARD_DIR}...\033[0m"
    mkdir -p "${STANDARD_DIR}"
    if command -v git &> /dev/null; then
        git clone --depth 1 "https://github.com/${GITHUB_REPO}.git" "${STANDARD_DIR}"
    else
        ZIP_URL="https://github.com/${GITHUB_REPO}/archive/refs/heads/main.zip"
        TEMP_ZIP="/tmp/amiyo-studio-main.zip"
        curl -fsSL "${ZIP_URL}" -o "${TEMP_ZIP}"
        unzip -q "${TEMP_ZIP}" -d /tmp/amiyo_extract
        cp -rf /tmp/amiyo_extract/amiyo-studio-main/* "${STANDARD_DIR}/"
        rm -rf "${TEMP_ZIP}" /tmp/amiyo_extract
    fi
    TARGET_DIR="${STANDARD_DIR}"
    echo -e "\033[32m[OK] Installation completed successfully!\033[0m"
fi

# 3. Register global CLI command across platforms
chmod +x "${TARGET_DIR}/bin/cli.js"

if [ "$IS_ANDROID" = "1" ] && [ -n "$PREFIX" ] && [ -d "$PREFIX/bin" ]; then
    # Termux Android global bin
    ln -sf "${TARGET_DIR}/bin/cli.js" "$PREFIX/bin/amiyo" 2>/dev/null || cp -f "${TARGET_DIR}/bin/cli.js" "$PREFIX/bin/amiyo"
    chmod +x "$PREFIX/bin/amiyo" 2>/dev/null || true
    echo -e "\033[32m[OK] Registered 'amiyo' command in Termux ($PREFIX/bin/amiyo)\033[0m"
else
    # Linux & macOS & WSL
    mkdir -p "$HOME/.local/bin"
    ln -sf "${TARGET_DIR}/bin/cli.js" "$HOME/.local/bin/amiyo" 2>/dev/null || true
    ln -sf "${TARGET_DIR}/bin/cli.js" "/usr/local/bin/amiyo" 2>/dev/null || true
    
    # Ensure ~/.local/bin is in PATH
    for rc in "$HOME/.bashrc" "$HOME/.zshrc" "$HOME/.profile"; do
        if [ -f "$rc" ] && ! grep -q '\.local/bin' "$rc"; then
            echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$rc"
        fi
    done
    export PATH="$HOME/.local/bin:$PATH"
fi

# 4. Directly open Amiyo Studio
echo -e "\033[36m[->] Directly opening Amiyo Studio v${APP_VERSION}...\033[0m"

if ! command -v node &> /dev/null; then
    if [ "$IS_ANDROID" = "1" ] && command -v pkg &> /dev/null; then
        echo -e "\033[33m[INFO] Installing Node.js for Android...\033[0m"
        pkg install -y nodejs
    fi
fi

if command -v node &> /dev/null && [ -f "${TARGET_DIR}/bin/cli.js" ]; then
    echo -e "\033[32m[OK] Starting local engine at http://localhost:3000 ...\033[0m"
    cd "${TARGET_DIR}"
    
    if [ "$IS_ANDROID" = "1" ]; then
        node bin/cli.js --no-open &
        CLI_PID=$!
        sleep 1
        if command -v termux-open-url &> /dev/null; then
            termux-open-url "http://localhost:3000"
        elif command -v termux-open &> /dev/null; then
            termux-open "http://localhost:3000"
        elif command -v am &> /dev/null; then
            am start -a android.intent.action.VIEW -d "http://localhost:3000" >/dev/null 2>&1 || true
        fi
        wait $CLI_PID
    else
        node bin/cli.js "$@"
    fi
else
    echo -e "\033[32m[OK] Opening in default browser...\033[0m"
    if [ "$IS_ANDROID" = "1" ]; then
        if command -v termux-open &> /dev/null; then
            termux-open "${TARGET_DIR}/index.html"
        elif command -v am &> /dev/null; then
            am start -a android.intent.action.VIEW -d "file://${TARGET_DIR}/index.html" >/dev/null 2>&1 || true
        fi
    elif command -v xdg-open &> /dev/null; then
        xdg-open "${TARGET_DIR}/index.html"
    elif command -v open &> /dev/null; then
        open "${TARGET_DIR}/index.html"
    fi
fi

echo ""
echo -e "\033[32m==========================================\033[0m"
echo -e "\033[33m   Amiyo Studio is now ACTIVE and READY!  \033[0m"
echo -e "\033[32m==========================================\033[0m"
echo -e "Terminal commands are now working! Try typing:"
echo -e "  \033[36mamiyo --version\033[0m   (Check installed version: v${APP_VERSION})"
echo -e "  \033[36mamiyo\033[0m             (Open Amiyo Studio)"
echo -e "\033[32m==========================================\033[0m"
