#!/bin/bash

# esunre imp envs are there
if [[ -z "$CLIENT_ID" || -z "$TOKEN" ]]; then
  echo "❌ Please set CLIENT_ID and TOKEN environment variables."
  exit 1
fi

# ensure image directory is passed
if [[ -z "$1" ]]; then
  echo "❌ Usage: $0 <image_directory>"
  exit 1
fi

DIR="$1"


if [[ ! -d "$DIR" ]]; then
  echo "❌ Directory '$DIR' does not exist."
  exit 1
fi

FAILED=()

for IMAGE in "$DIR"/*.{png,jpg,jpeg,gif,webp}; do
  [[ -e "$IMAGE" ]] || continue  


  NAME=$(basename "$IMAGE")
  EMOJI_NAME="${NAME%.*}"
  EMOJI_NAME="${EMOJI_NAME//-/}"  # Remove hyphens as it is not allowed

  
  MIME_TYPE=$(file --mime-type -b "$IMAGE")

 
  BASE64_DATA=$(base64 -w 0 "$IMAGE")


  IMAGE_DATA="data:$MIME_TYPE;base64,$BASE64_DATA"


  JSON=$(printf '{"name": "%s", "image": "%s"}' "$EMOJI_NAME" "$IMAGE_DATA")


  echo "⬆️ Uploading '$EMOJI_NAME'..."
  RESPONSE=$(curl -s -X POST "https://discord.com/api/v10/applications/$CLIENT_ID/emojis" \
    -H "Authorization: Bot $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$JSON")


  if echo "$RESPONSE" | grep -q '"id"'; then
    echo "✅ Uploaded '$EMOJI_NAME'"
  else
    echo "❌ Failed to upload '$EMOJI_NAME'"
    FAILED+=("$NAME")
  fi
done


if [ ${#FAILED[@]} -ne 0 ]; then
  echo -e "\n❌ Failed uploads:"
  printf '  - %s\n' "${FAILED[@]}"
else
  echo -e "\n✅ All images uploaded successfully."
fi
