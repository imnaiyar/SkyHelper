#!/bin/bash

# Check for changes in the ./docs folder between the previous commit and the current commit
if git diff HEAD^ HEAD --quiet -- .; then
  echo "No changes in the docs folder. Skipping deployment."
  exit 0
else
  echo "Changes found in the docs folder. Proceeding with deployment."
  exit 1
fi
