#!/usr/bin/env bash
# Amiyo Studio - Android Terminal (Termux & ADB) 1-Line Installer
# Usage in Termux: curl -fsSL https://raw.githubusercontent.com/A2004-a/amiyo-studio/main/install-android.sh | bash

set -e

APP_VERSION="1.0.0"
GITHUB_REPO="A2004-a/amiyo-studio"

echo -e "\033[33m       ▲\033[0m"
echo -e "\033[33m      /█\\\033[0m"
echo -e "\033[33m     /███\\        \033[31m▶  AMIYO STUDIO (ANDROID)\033[0m"
echo -e "\033[33m    /██ █ \\          \033[36mProfessional Mobile & Desktop Editor\033[0m"
echo -e "\033[33m   /███████\\         \033[32mv${APP_VERSION}\033[0m"
echo -e "\033[33m  /███   ███\\\033[0m"
echo -e "\033[33m ═════════════\033[0m"
echo -e "\033[36m====================================================\033[0m"
echo -e "\033[33m     Amiyo Studio Android Terminal Installer       \033[0m"
echo -e "\033[36m====================================================\033[0m"

INSTALL_DIR="$HOME/.amiyo-studio"

# 1. Check prerequisites in Termux
if command -v pkg &> /dev/null; then
    echo -e "\033[36m[1/4] Ensuring Termux dependencies (Node.js, Git, Curl)...\033[0m"
    pkg update -y || true
    for tool in nodejs git curl; do
        if ! command -v $tool &> /dev/null; then
            echo -e "\033[33m[INFO] Installing $tool...\033[0m"
            pkg install -y $tool
        fi
    done
fi

# 2. Clone or Update Application
echo -e "\033[36m[2/4] Downloading Amiyo Studio v${APP_VERSION}...\033[0m"
if [ -d "$INSTALL_DIR/.git" ]; then
    cd "$INSTALL_DIR"
    git fetch origin main >/dev/null 2>&1
    git reset --hard origin/main >/dev/null 2>&1
    cd - >/dev/null
    echo -e "\033[32m[OK] Updated existing installation via git.\033[0m"
elif [ -d "$INSTALL_DIR" ]; then
    rm -rf "$INSTALL_DIR"
    git clone --depth 1 "https://github.com/${GITHUB_REPO}.git" "$INSTALL_DIR"
else
    git clone --depth 1 "https://github.com/${GITHUB_REPO}.git" "$INSTALL_DIR"
fi

# 3. Register Global 'amiyo' command
echo -e "\033[36m[3/4] Registering terminal command...\033[0m"
chmod +x "$INSTALL_DIR/bin/cli.js"

if [ -n "$PREFIX" ] && [ -d "$PREFIX/bin" ]; then
    ln -sf "$INSTALL_DIR/bin/cli.js" "$PREFIX/bin/amiyo" 2>/dev/null || cp -f "$INSTALL_DIR/bin/cli.js" "$PREFIX/bin/amiyo"
    chmod +x "$PREFIX/bin/amiyo"
    echo -e "\033[32m[OK] Registered 'amiyo' in $PREFIX/bin\033[0m"
else
    mkdir -p "$HOME/.local/bin"
    ln -sf "$INSTALL_DIR/bin/cli.js" "$HOME/.local/bin/amiyo" 2>/dev/null || true
fi

# 4. Launch Application in Mobile Browser
echo -e "\033[36m[4/4] Starting Amiyo Studio server & opening browser...\033[0m"
cd "$INSTALL_DIR"

if command -v node &> /dev/null; then
    echo -e "\033[32m====================================================\033[0m"
    echo -e "\033[32m  ✓ Amiyo Studio is now running on http://localhost:3000\033[0m"
    echo -e "\033[32m====================================================\033[0m"
    echo -e "You can launch Amiyo Studio anytime in Termux by running:"
    echo -e "  \033[33mamiyo\033[0m"
    echo -e "\033[32m====================================================\033[0m"

    node bin/cli.js --no-open &
    SERVER_PID=$!
    sleep 1

    if command -v termux-open-url &> /dev/null; then
        termux-open-url "http://localhost:3000"
    elif command -v termux-open &> /dev/null; then
        termux-open "http://localhost:3000"
    elif command -v am &> /dev/null; then
        am start -a android.intent.action.VIEW -d "http://localhost:3000" >/dev/null 2>&1 || true
    fi

    wait $SERVER_PID
else
    echo -e "\033[32m[OK] Open $INSTALL_DIR/index.html in your mobile browser.\033[0m"
fi
