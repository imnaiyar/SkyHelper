#!/bin/bash

COMMIT_MESSAGE=$(git log -1 --pretty=%B)

if [[ $COMMIT_MESSAGE =~ "docs:" ]]; then
  echo "Deploy keyword found in commit message. Proceeding with deployment."
  exit 0  # Exit with success status to allow deployment
else
  echo "Deploy keyword not found in commit message. Skipping deployment."
  exit 1  # Exit with non-zero status to skip deployment
fi
