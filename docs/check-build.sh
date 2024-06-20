#!/bin/bash

COMMIT_MESSAGE=$(git log -1 --pretty=%B)

if [[ $COMMIT_MESSAGE =~ "docs:" ]]; then
  echo "Deploy keyword found in commit message. Proceeding with deployment."
  exit 1  
else
  echo "Deploy keyword not found in commit message. Skipping deployment."
  exit 0  
fi
