#!/bin/bash

# Vest Local Setup Script
# This script helps you quickly set up and run Vest locally

set -e

echo "🏗️  Vest - Local Development Setup"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed."
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running."
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is installed and running"
echo ""

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed."
    echo "Please install docker-compose or use Docker Desktop which includes it."
    exit 1
fi

echo "✅ docker-compose is available"
echo ""

# Build and start containers
echo "🐳 Building Docker containers..."
docker-compose build

echo ""
echo "🚀 Starting Vest application..."
docker-compose up -d

echo ""
echo "⏳ Waiting for database to be ready..."
sleep 5

echo ""
echo "✅ Vest is now running!"
echo ""
echo "📍 Access the application at: http://localhost:5000"
echo ""
echo "💡 Useful commands:"
echo "   View logs:     docker-compose logs -f"
echo "   Stop app:      docker-compose down"
echo "   Restart:       docker-compose restart"
echo "   Clean all:     docker-compose down -v"
echo ""
echo "📚 For more details, see LOCAL_SETUP.md"
echo ""
