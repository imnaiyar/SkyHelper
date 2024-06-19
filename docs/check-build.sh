#!/bin/bash

git fetch --depth=2

# Check for changes in the ./docs directory
if git diff HEAD^ HEAD --quiet -- ./docs; then
  echo "No changes in ./docs"
  exit 0  # No changes, exit with status 0 to skip the build
else
  echo "Changes detected in ./docs"
  exit 1  # Changes detected, exit with status 1 to proceed with the build
fi
