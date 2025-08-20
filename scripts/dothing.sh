# User Data module target
TARGET="$HOME/.local/share/FoundryVTT/Data/modules/strongholds-and-followers"
mkdir -p "$HOME/.local/share/FoundryVTT/Data/modules"

# Try common repo locations (pick the first that exists and has module.json)
if [ -f "/home/andrewgari/Repos/dnd-modules/strongholds/module.json" ]; then
  REPO="/home/andrewgari/Repos/dnd-modules/strongholds"
elif [ -f "/var/home/andrewgari/Repos/dnd-modules/strongholds/module.json" ]; then
  REPO="/var/home/andrewgari/Repos/dnd-modules/strongholds"
else
  echo "Could not find your repo. Adjust REPO to the correct path (must contain module.json)."
  exit 1
fi

echo "Using repo: $REPO"