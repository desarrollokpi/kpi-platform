#!/bin/bash

#################################################
# Docker Down Script - KPI Platform v2
# Detiene servicios del entorno de desarrollo (todos o uno específico)
#################################################

set -e  # Exit on error

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Get the project root (parent of scripts directory)
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   KPI Platform v2 - Stopping Services        ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Error: Docker is not running"
  echo "Please start Docker Desktop"
  exit 1
fi

# Parse arguments
REMOVE_VOLUMES=false
SERVICE=""

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --volumes|-v) REMOVE_VOLUMES=true ;;
    --help|-h)
      echo "Usage: ./docker-down.sh [service] [options]"
      echo ""
      echo "Services (optional):"
      echo "  mysql    - MySQL database only"
      echo "  redis    - Redis cache only"
      echo "  server   - Backend API server only"
      echo "  client   - Frontend React app only"
      echo "  db-init  - Database initialization only"
      echo ""
      echo "Options:"
      echo "  -v, --volumes    Remove volumes (WARNING: deletes all data)"
      echo "  -h, --help       Show this help message"
      echo ""
      echo "Examples:"
      echo "  ./docker-down.sh              # Stop all services"
      echo "  ./docker-down.sh server       # Stop only server"
      echo "  ./docker-down.sh -v           # Stop all and remove volumes"
      echo "  ./docker-down.sh mysql -v     # Stop MySQL and remove its volume"
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

# Build command based on whether we're stopping a single service or all
if [ ! -z "$SERVICE" ]; then
  # For single service, use docker compose stop
  CMD="docker compose -f $PROJECT_ROOT/docker-compose.dev.yml stop $SERVICE"

  echo "🛑 Stopping service: $SERVICE"

  if [ "$REMOVE_VOLUMES" = true ]; then
    echo "⚠  WARNING: This will also remove volumes for $SERVICE"
    echo ""
    read -p "Are you sure? (yes/no): " confirmation

    if [ "$confirmation" != "yes" ]; then
      echo "Operation cancelled"
      exit 0
    fi

    echo ""
    echo "➤ Stopping $SERVICE and removing its containers/volumes..."
    CMD="docker compose -f $PROJECT_ROOT/docker-compose.dev.yml rm -s -v -f $SERVICE"
  else
    echo "➤ Stopping $SERVICE (data preserved)..."
  fi
else
  # For all services, use docker-compose down
  CMD="docker compose -f $PROJECT_ROOT/docker-compose.dev.yml down"

  if [ "$REMOVE_VOLUMES" = true ]; then
    echo "⚠  WARNING: This will delete all data in volumes (MySQL, Redis)"
    echo ""
    read -p "Are you sure? (yes/no): " confirmation

    if [ "$confirmation" != "yes" ]; then
      echo "Operation cancelled"
      exit 0
    fi

    CMD="$CMD -v"
    echo ""
    echo "➤ Stopping all services and removing volumes..."
  else
    echo "➤ Stopping all services..."
  fi
fi

echo "   Command: $CMD"
echo ""

# Execute (from project root)
cd "$PROJECT_ROOT" && $CMD

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║           Services Stopped! ✓                ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

if [ ! -z "$SERVICE" ]; then
  if [ "$REMOVE_VOLUMES" = true ]; then
    echo "✓ Service $SERVICE stopped and removed"
    echo ""
    echo "To start again:"
    echo "  ./scripts/docker-up.sh $SERVICE"
  else
    echo "✓ Service $SERVICE stopped (data preserved)"
    echo ""
    echo "To start again:"
    echo "  ./scripts/docker-up.sh $SERVICE"
  fi
else
  if [ "$REMOVE_VOLUMES" = true ]; then
    echo "✓ All services stopped and volumes removed"
    echo ""
    echo "Next startup will recreate database from scratch:"
    echo "  ./scripts/docker-up.sh"
  else
    echo "✓ All services stopped (data preserved)"
    echo ""
    echo "To start again:"
    echo "  ./scripts/docker-up.sh"
    echo ""
    echo "To stop AND remove all data:"
    echo "  ./scripts/docker-down.sh --volumes"
  fi
fi

echo ""
