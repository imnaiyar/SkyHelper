#!/bin/bash

echo "🚀 Setting up SkyHelper development environment..."

if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    corepack enable
    corepack prepare pnpm@10.15.1 --activate
fi

echo "✅ pnpm version: $(pnpm --version)"

echo "🔧 Configuring git..."
git config --global init.defaultBranch main
git config --global pull.rebase false
git config --global safe.directory /workspace

# Create .env file for development if it doesn't exist
if [ ! -f "/workspace/packages/skyhelper/.env" ]; then
    echo "📝 Creating development .env file..."
    cp /workspace/packages/skyhelper/.env.example /workspace/packages/skyhelper/.env
    
    # Set development MongoDB connection
    sed -i 's/MONGO_CONNECTION=/MONGO_CONNECTION=mongodb:\/\/devuser:devpassword@mongodb:27017\/skyhelper?authSource=skyhelper/' /workspace/packages/skyhelper/.env
    
    echo "⚠️  Please update the .env file with your Discord bot tokens and other required values!"
fi

echo "📦 Installing dependencies..."
cd /workspace
pnpm install --frozen-lockfile

echo "🔨 Building project..."
pnpm build

echo "✨ Development environment setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Update packages/skyhelper/.env with your Discord bot tokens"
echo "   2. Run 'pnpm dev' to start development servers"
echo "   3. Run 'pnpm test' to run tests"
echo "   4. Run 'pnpm lint' to check code quality"
echo ""
echo "📚 Useful commands:"
echo "   - pnpm bot:dev    # Start bot in development mode"
echo "   - pnpm jobs:dev   # Start jobs service in development mode" 
echo "   - pnpm build      # Build all packages"
echo "   - pnpm test       # Run test suite"
echo "   - pnpm lint       # Run linting"