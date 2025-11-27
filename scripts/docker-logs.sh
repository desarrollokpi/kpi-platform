#!/bin/bash

#################################################
# Docker Logs Script - KPI Platform v2
# Ver logs de los servicios (todos o uno específico)
#################################################

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Get the project root (parent of scripts directory)
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   KPI Platform v2 - View Logs                ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Error: Docker is not running"
  echo "Please start Docker Desktop"
  exit 1
fi

# Parse arguments
SERVICE=""
FOLLOW=false
TAIL_LINES=100

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --follow|-f) FOLLOW=true ;;
    --tail|-t) TAIL_LINES="$2"; shift ;;
    --help|-h)
      echo "Usage: ./docker-logs.sh [service] [options]"
      echo ""
      echo "Services (optional):"
      echo "  server   - Backend API server"
      echo "  client   - Frontend React app"
      echo "  mysql    - MySQL database"
      echo "  redis    - Redis cache"
      echo "  db-init  - Database initialization"
      echo ""
      echo "Options:"
      echo "  -f, --follow     Follow log output (live tail)"
      echo "  -t, --tail N     Number of lines to show (default: 100)"
      echo "  -h, --help       Show this help message"
      echo ""
      echo "Examples:"
      echo "  ./docker-logs.sh                  # All logs (last 100 lines)"
      echo "  ./docker-logs.sh server           # Server logs only"
      echo "  ./docker-logs.sh server -f        # Follow server logs (live)"
      echo "  ./docker-logs.sh -f               # Follow all logs"
      echo "  ./docker-logs.sh server -t 500    # Last 500 lines of server"
      echo "  ./docker-logs.sh mysql -f -t 50   # Follow MySQL, show last 50 first"
      echo ""
      exit 0
      ;;
    server|client|mysql|redis|db-init)
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
CMD="docker compose -f $PROJECT_ROOT/docker-compose.dev.yml logs"

if [ ! -z "$SERVICE" ]; then
  CMD="$CMD $SERVICE"
  echo "📋 Viewing logs for: $SERVICE"
else
  echo "📋 Viewing logs for: all services"
fi

if [ "$FOLLOW" = true ]; then
  CMD="$CMD -f --tail=$TAIL_LINES"
  echo "➤ Following logs (showing last $TAIL_LINES lines, Ctrl+C to stop)..."
else
  CMD="$CMD --tail=$TAIL_LINES"
  echo "➤ Showing last $TAIL_LINES lines..."
fi

echo ""

# Execute (from project root)
cd "$PROJECT_ROOT" && $CMD
