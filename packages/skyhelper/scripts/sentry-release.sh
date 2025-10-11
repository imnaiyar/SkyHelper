#!/bin/bash
set -e

VERSION=$(sentry-cli releases propose-version)
echo "Creating release: $VERSION"

sentry-cli releases new "$VERSION"

echo "Setting commits..."
sentry-cli releases set-commits "$VERSION" --auto

echo "Injecting debug Ids"
sentry-cli sourcemaps inject \
  ./dist


echo "Uploading source maps..."
sentry-cli sourcemaps upload \
  ./dist \
  --release "$VERSION"

echo "Finalizing release..."
sentry-cli releases finalize "$VERSION"

echo "Creating deploy..."
sentry-cli deploys new --release "$VERSION" -e production

echo "Release $VERSION completed!"