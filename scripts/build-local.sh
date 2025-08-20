#!/bin/bash

# Local development build script for Strongholds & Followers module
# This script copies the module to local Foundry VTT installation for testing

set -e

# Configuration - you can modify these paths as needed
FOUNDRY_SERVER_DIR="/home/andrewgari/Applications/FoundryVTT"
FOUNDRY_DATA_DIR="/home/andrewgari/.local/share/FoundryVTT"
MODULE_ID="strongholds-and-followers"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔨 Building Strongholds & Followers module for local development${NC}"
echo ""

# Create target directories if they don't exist
echo -e "${YELLOW}📁 Setting up directories...${NC}"
mkdir -p "$FOUNDRY_DATA_DIR/Data/modules"
TARGET_DIR="$FOUNDRY_DATA_DIR/Data/modules/$MODULE_ID"

# Remove existing module if it exists
if [ -d "$TARGET_DIR" ]; then
    echo -e "${YELLOW}🗑️  Removing existing module installation...${NC}"
    rm -rf "$TARGET_DIR"
fi

# Create the target directory
mkdir -p "$TARGET_DIR"

# Copy module files (excluding build scripts)
echo -e "${YELLOW}📋 Copying module files...${NC}"
cp module.json "$TARGET_DIR/"
cp -r styles/ "$TARGET_DIR/"
cp -r templates/ "$TARGET_DIR/"
cp -r lang/ "$TARGET_DIR/"

# Copy only the runtime scripts, not build scripts
mkdir -p "$TARGET_DIR/scripts"
cp scripts/main.js "$TARGET_DIR/scripts/"
cp scripts/stronghold-*.js "$TARGET_DIR/scripts/" 2>/dev/null || true

# Make sure we're in the project directory for relative paths
PROJECT_DIR="$(dirname "$(dirname "$(readlink -f "$0")")")"
cd "$PROJECT_DIR"

# Optional: Copy additional files if they exist
if [ -f "README.md" ]; then
    cp "README.md" "$TARGET_DIR/"
fi

if [ -f "CHANGELOG.md" ]; then
    cp "CHANGELOG.md" "$TARGET_DIR/"
fi

# Set proper permissions
echo -e "${YELLOW}🔒 Setting permissions...${NC}"
chmod -R 755 "$TARGET_DIR"


# Touch dev-reload.json so connected clients (with Dev Auto Reload) will refresh
if [ -d "$TARGET_DIR" ]; then
  echo -e "${YELLOW}⚡ Triggering dev reload token...${NC}"
  echo "{ \"token\": \"$(date +%s)\" }" > "$TARGET_DIR/dev-reload.json"
fi

# Verify installation
if [ -f "$TARGET_DIR/module.json" ]; then
    echo -e "${GREEN}✅ Module successfully deployed to: $TARGET_DIR${NC}"
    echo ""
    echo -e "${BLUE}📍 Installation Summary:${NC}"
    echo -e "   Module ID: ${MODULE_ID}"
    echo -e "   Target: $TARGET_DIR"
    echo -e "   Foundry Data: $FOUNDRY_DATA_DIR"
    echo ""
    echo -e "${YELLOW}🎮 Next steps:${NC}"
    echo -e "   1. Start Foundry VTT server"
    echo -e "   2. Go to Setup > Game Worlds > [Your World] > Manage Modules"
    echo -e "   3. Enable 'Strongholds & Followers' module"
    echo -e "   4. Launch your world to test the module"

    # Show a notice about the permanent installation location
    echo ""
    echo -e "${BLUE}💡 Foundry VTT Installation:${NC}"
    if [ -d "$FOUNDRY_SERVER_DIR" ]; then
        echo -e "   Server: $FOUNDRY_SERVER_DIR (✅ found)"
    else
        echo -e "   Server: $FOUNDRY_SERVER_DIR (❌ not found)"
        echo -e "   ${YELLOW}Consider moving your Foundry server to: /home/andrewgari/Applications/FoundryVTT${NC}"
    fi
    echo -e "   Data: $FOUNDRY_DATA_DIR (✅ created)"

else
    echo -e "${RED}❌ Module deployment failed!${NC}"
    exit 1
fi