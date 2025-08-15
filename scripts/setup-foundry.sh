#!/bin/bash

# Setup script to move Foundry VTT to a permanent location
# Run this once to organize your Foundry installation

set -e

# Configuration
OLD_FOUNDRY_DIR="/home/andrewgari/Downloads/foundryvtt_server"
NEW_FOUNDRY_DIR="/home/andrewgari/Applications/FoundryVTT"
FOUNDRY_DATA_DIR="/home/andrewgari/.local/share/FoundryVTT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏗️  Setting up Foundry VTT in permanent location${NC}"
echo ""

# Create Applications directory if it doesn't exist
mkdir -p "/home/andrewgari/Applications"

# Check if old Foundry directory exists
if [ ! -d "$OLD_FOUNDRY_DIR" ]; then
    echo -e "${RED}❌ Foundry server not found at: $OLD_FOUNDRY_DIR${NC}"
    echo -e "${YELLOW}Please update the OLD_FOUNDRY_DIR path in this script${NC}"
    exit 1
fi

# Move Foundry server to permanent location
if [ -d "$NEW_FOUNDRY_DIR" ]; then
    echo -e "${YELLOW}⚠️  Foundry already exists at permanent location${NC}"
    echo -e "Existing: $NEW_FOUNDRY_DIR"
    read -p "Do you want to replace it with the version from Downloads? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🗑️  Removing existing installation...${NC}"
        rm -rf "$NEW_FOUNDRY_DIR"
    else
        echo -e "${BLUE}Keeping existing installation${NC}"
        NEW_FOUNDRY_DIR="$NEW_FOUNDRY_DIR"
    fi
fi

if [ ! -d "$NEW_FOUNDRY_DIR" ]; then
    echo -e "${YELLOW}📦 Moving Foundry server to permanent location...${NC}"
    mv "$OLD_FOUNDRY_DIR" "$NEW_FOUNDRY_DIR"
    echo -e "${GREEN}✅ Moved to: $NEW_FOUNDRY_DIR${NC}"
fi

# Create data directory structure
echo -e "${YELLOW}📁 Setting up Foundry data directory...${NC}"
mkdir -p "$FOUNDRY_DATA_DIR/Data"/{modules,systems,worlds}

# Create a desktop shortcut (optional)
DESKTOP_FILE="/home/andrewgari/Desktop/FoundryVTT.desktop"
if command -v desktop-file-install >/dev/null 2>&1; then
    echo -e "${YELLOW}🖥️  Creating desktop shortcut...${NC}"
    cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Foundry VTT
Comment=Virtual Tabletop Gaming
Exec=node "$NEW_FOUNDRY_DIR/main.mjs" --dataPath="$FOUNDRY_DATA_DIR"
Icon=$NEW_FOUNDRY_DIR/public/icons/vtt-512.png
Terminal=true
Categories=Game;
EOF
    chmod +x "$DESKTOP_FILE"
fi

# Create a convenient launch script
LAUNCH_SCRIPT="/home/andrewgari/Applications/launch-foundry.sh"
echo -e "${YELLOW}🚀 Creating launch script...${NC}"
cat > "$LAUNCH_SCRIPT" << EOF
#!/bin/bash
# Foundry VTT Launch Script
cd "$NEW_FOUNDRY_DIR"
node main.mjs --dataPath="$FOUNDRY_DATA_DIR" "\$@"
EOF
chmod +x "$LAUNCH_SCRIPT"

echo ""
echo -e "${GREEN}✅ Foundry VTT setup complete!${NC}"
echo ""
echo -e "${BLUE}📍 Installation Summary:${NC}"
echo -e "   Server: $NEW_FOUNDRY_DIR"
echo -e "   Data: $FOUNDRY_DATA_DIR"
echo -e "   Launch: $LAUNCH_SCRIPT"
echo ""
echo -e "${YELLOW}🎮 To start Foundry VTT:${NC}"
echo -e "   Method 1: $LAUNCH_SCRIPT"
echo -e "   Method 2: cd $NEW_FOUNDRY_DIR && node main.mjs --dataPath=\"$FOUNDRY_DATA_DIR\""
if [ -f "$DESKTOP_FILE" ]; then
    echo -e "   Method 3: Use desktop shortcut"
fi
echo ""
echo -e "${BLUE}💡 Your module deployment will now use:${NC}"
echo -e "   $FOUNDRY_DATA_DIR/Data/modules/"