#!/bin/bash

OUTPUT_DIR="split"

if [[ -z "$1" ]]; then
  echo "❌ Usage: $0 <sorce_directory> [output_directory]"
  exit 1
fi

INPUT_DIR="$1"

if [[ ! -d "$INPUT_DIR" ]]; then
  echo "❌ Directory '$INPUT_DIR' does not exist."
  exit 1
fi

# Ensure ImageMagick is installed
if ! command -v convert &> /dev/null; then
  echo "❌ ImageMagick is not installed. Please install it to use this script."
  exit 1
fi

OUTPUT_DIR="${2:-$OUTPUT_DIR}"
mkdir -p "$OUTPUT_DIR"

# Loop through image files
for img in "$INPUT_DIR"/*.{jpg,jpeg,png,webp}; do
    [ -e "$img" ] || continue  

    filename=$(basename "$img")
    name="${filename%.*}"
    ext="${filename##*.}"

    # Get image dimensions
    read width height <<< $(identify -format "%w %h" "$img")
    half_width=$((width / 2))
    half_height=$((height / 2))

    # Top-left
    convert "$img" -crop "${half_width}x${half_height}+0+0" "$OUTPUT_DIR/${name}_1.${ext}"
    # Top-right
    convert "$img" -crop "${half_width}x${half_height}+${half_width}+0" "$OUTPUT_DIR/${name}_2.${ext}"
    # Bottom-left
    convert "$img" -crop "${half_width}x${half_height}+0+${half_height}" "$OUTPUT_DIR/${name}_3.${ext}"
    # Bottom-right
    convert "$img" -crop "${half_width}x${half_height}+${half_width}+${half_height}" "$OUTPUT_DIR/${name}_4.${ext}"
done

echo "Splitting complete. Output saved in $OUTPUT_DIR"