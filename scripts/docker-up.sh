#!/bin/bash

#################################################
# Docker Up Script - KPI Platform v2
# Levanta el entorno de desarrollo (todos los servicios o uno específico)
#################################################

set -e  # Exit on error

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Get the project root (parent of scripts directory)
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   KPI Platform v2 - Development Startup      ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Error: Docker is not running"
  echo "Please start Docker Desktop and try again"
  exit 1
fi

echo "✓ Docker is running"
echo ""

# Parse arguments
BUILD=false
DETACHED=false
SERVICE=""

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --build|-b) BUILD=true ;;
    --detached|-d) DETACHED=true ;;
    --help|-h)
      echo "Usage: ./docker-up.sh [service] [options]"
      echo ""
      echo "Services (optional):"
      echo "  mysql    - MySQL database only"
      echo "  redis    - Redis cache only"
      echo "  server   - Backend API server only"
      echo "  client   - Frontend React app only"
      echo "  db-init  - Database initialization only"
      echo ""
      echo "Options:"
      echo "  -b, --build      Rebuild images before starting"
      echo "  -d, --detached   Run in background"
      echo "  -h, --help       Show this help message"
      echo ""
      echo "Examples:"
      echo "  ./docker-up.sh              # Start all services"
      echo "  ./docker-up.sh -d           # Start all in background"
      echo "  ./docker-up.sh mysql -d     # Start only MySQL in background"
      echo "  ./docker-up.sh server -b    # Rebuild and start server"
      echo ""
      exit 0
      ;;
    mysql|redis|server|client|db-init)
      SERVICE="$1"
      ;;
    *)
      echo "❌ Unknown parameter: $1"
      echo "Use --help to see available options"
      exit 1
      ;;
  esac
  shift
done

# Build command
CMD="docker compose -f $PROJECT_ROOT/docker-compose.dev.yml up"

if [ "$BUILD" = true ]; then
  echo "➤ Building images..."
  CMD="$CMD --build"
fi

if [ "$DETACHED" = true ]; then
  CMD="$CMD -d"
fi

if [ ! -z "$SERVICE" ]; then
  CMD="$CMD $SERVICE"
  echo "📦 Starting service: $SERVICE"
else
  echo "📦 Starting: all services"
fi

echo "➤ Executing: $CMD"
echo ""

# Execute (from project root)
cd "$PROJECT_ROOT" && $CMD

if [ "$DETACHED" = true ]; then
  echo ""
  echo "╔══════════════════════════════════════════════╗"
  echo "║           Services Started! ✓                ║"
  echo "╚══════════════════════════════════════════════╝"
  echo ""

  if [ ! -z "$SERVICE" ]; then
    echo "✓ Service running in background: $SERVICE"
    echo ""
    echo "Useful commands:"
    echo "  ./scripts/docker-logs.sh $SERVICE -f    # View logs"
    echo "  ./scripts/docker-down.sh $SERVICE       # Stop service"
  else
    echo "Services running in background:"
    echo "  - MySQL:  localhost:3306"
    echo "  - Redis:  localhost:6379"
    echo "  - Server: http://localhost:5050"
    echo "  - Client: http://localhost:3000"
    echo ""
    echo "Useful commands:"
    echo "  ./scripts/docker-logs.sh              # View all logs"
    echo "  ./scripts/docker-logs.sh server -f    # Follow server logs"
    echo "  ./scripts/docker-down.sh              # Stop all services"
    echo "  ./scripts/docker-down.sh server       # Stop only server"
  fi
  echo ""
fi
