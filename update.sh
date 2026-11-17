#!/usr/bin/env bash
# Amiyo Studio - Linux / macOS 1-Line Updater
# Usage: curl -fsSL https://raw.githubusercontent.com/A2004-a/amiyo-studio/main/update.sh | bash

set -e

APP_VERSION="0.0.1"

echo -e "\033[33m       ▲\033[0m"
echo -e "\033[33m      /█\\\033[0m"
echo -e "\033[33m     /███\\        \033[31m▶  AMIYO STUDIO UPDATER\033[0m"
echo -e "\033[33m    /██ █ \\          \033[36mUpdating old version to latest release...\033[0m"
echo -e "\033[33m   /███████\\\033[0m"
echo -e "\033[33m  /███   ███\\\033[0m"
echo -e "\033[33m ═════════════\033[0m"
echo -e "\033[36m==========================================\033[0m"
echo -e "\033[33m       Amiyo Studio Auto-Updater          \033[0m"
echo -e "\033[36m==========================================\033[0m"

TARGET_DIR=""
STANDARD_DIR="$HOME/.amiyo-studio"

if [ -f "index.html" ] && [ -f "bin/cli.js" ]; then
    TARGET_DIR="$(pwd)"
elif [ -f "${STANDARD_DIR}/index.html" ]; then
    TARGET_DIR="${STANDARD_DIR}"
else
    TARGET_DIR="${STANDARD_DIR}"
    mkdir -p "${STANDARD_DIR}"
fi

echo -e "\033[32m[INFO] Updating installation at: ${TARGET_DIR}\033[0m"

if [ -d "${TARGET_DIR}/.git" ]; then
    echo -e "\033[36m[INFO] Pulling latest updates via git...\033[0m"
    cd "${TARGET_DIR}"
    git fetch origin main > /dev/null 2>&1 || true
    git reset --hard origin/main > /dev/null 2>&1 || true
else
    echo -e "\033[36m[INFO] Downloading latest release archive...\033[0m"
    ZIP_URL="https://github.com/A2004-a/amiyo-studio/archive/refs/heads/main.zip"
    TEMP_ZIP="/tmp/amiyo_update.zip"
    curl -fsSL "${ZIP_URL}" -o "${TEMP_ZIP}"
    unzip -q -o "${TEMP_ZIP}" -d /tmp/amiyo_update_ext
    cp -rf /tmp/amiyo_update_ext/amiyo-studio-main/* "${TARGET_DIR}/"
    rm -rf "${TEMP_ZIP}" /tmp/amiyo_update_ext
fi

# Update CLI symlink
mkdir -p "$HOME/.local/bin"
chmod +x "${TARGET_DIR}/bin/cli.js"
ln -sf "${TARGET_DIR}/bin/cli.js" "$HOME/.local/bin/amiyo"
ln -sf "${TARGET_DIR}/bin/cli.js" "$HOME/.local/bin/amiyo-studio"

echo -e "\n\033[32m==========================================\033[0m"
echo -e "\033[32m  [OK] Amiyo Studio Updated Successfully! \033[0m"
echo -e "\033[32m==========================================\033[0m"
echo -e "To open Amiyo Studio now, run:"
echo -e "  \033[33mamiyo\033[0m"
