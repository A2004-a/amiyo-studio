#!/usr/bin/env bash
# Amiyo Studio - Linux / macOS 1-Line Installer & Launcher
# Usage: curl -fsSL https://raw.githubusercontent.com/A2004-a/amiyo-studio/main/install.sh | bash

set -e

APP_VERSION="0.0.1"

echo -e "\033[36m==========================================\033[0m"
echo -e "\033[33m          Amiyo Studio v${APP_VERSION}    \033[0m"
echo -e "\033[36m==========================================\033[0m"

# 1. Version Check Request
if [ "$1" = "--version" ] || [ "$1" = "-v" ] || [ "$1" = "version" ] || [ "$AMIYO_VERSION_ONLY" = "1" ]; then
    echo -e "\033[32mInstalled Version: v${APP_VERSION}\033[0m"
    exit 0
fi

# 2. Check if already installed
TARGET_DIR=""
STANDARD_DIR="$HOME/.amiyo-studio"

if [ -f "index.html" ] && [ -f "bin/cli.js" ]; then
    TARGET_DIR="$(pwd)"
    echo -e "\033[32m[OK] Detected active workspace: ${TARGET_DIR}\033[0m"
elif [ -f "${STANDARD_DIR}/index.html" ]; then
    TARGET_DIR="${STANDARD_DIR}"
    echo -e "\033[32m[OK] Amiyo Studio is already installed at: ${TARGET_DIR}\033[0m"
    echo -e "\033[32m[OK] Skipping download - directly opening installed app.\033[0m"
else
    echo -e "\033[33m[INFO] Amiyo Studio is not installed on this system.\033[0m"
    echo -e "\033[36m[INFO] Downloading and installing Amiyo Studio v${APP_VERSION}...\033[0m"
    mkdir -p "${STANDARD_DIR}"
    if command -v git &> /dev/null; then
        git clone --depth 1 "https://github.com/A2004-a/amiyo-studio.git" "${STANDARD_DIR}"
    else
        ZIP_URL="https://github.com/A2004-a/amiyo-studio/archive/refs/heads/main.zip"
        TEMP_ZIP="/tmp/amiyo-studio-main.zip"
        curl -fsSL "${ZIP_URL}" -o "${TEMP_ZIP}"
        unzip -q "${TEMP_ZIP}" -d /tmp/amiyo_extract
        cp -rf /tmp/amiyo_extract/amiyo-studio-main/* "${STANDARD_DIR}/"
        rm -rf "${TEMP_ZIP}" /tmp/amiyo_extract
    fi
    TARGET_DIR="${STANDARD_DIR}"
    echo -e "\033[32m[OK] Installation completed successfully!\033[0m"
fi

# 3. Register global CLI symlink
mkdir -p "$HOME/.local/bin"
chmod +x "${TARGET_DIR}/bin/cli.js"
ln -sf "${TARGET_DIR}/bin/cli.js" "$HOME/.local/bin/amiyo" 2>/dev/null || true

# 4. Directly open Amiyo Studio
echo -e "\033[36m[->] Directly opening Amiyo Studio...\033[0m"

if command -v node &> /dev/null && [ -f "${TARGET_DIR}/bin/cli.js" ]; then
    echo -e "\033[32m[OK] Starting local engine at http://localhost:3000 ...\033[0m"
    cd "${TARGET_DIR}"
    node bin/cli.js "$@"
else
    echo -e "\033[32m[OK] Opening in default browser...\033[0m"
    if command -v xdg-open &> /dev/null; then
        xdg-open "${TARGET_DIR}/index.html"
    elif command -v open &> /dev/null; then
        open "${TARGET_DIR}/index.html"
    fi
fi
