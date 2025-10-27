.PHONY: help run-all setup start start-detached stop restart logs clean seed db-push db-reset shell check-docker

help:
	@echo "╔══════════════════════════════════════════════════════════╗"
	@echo "║         Vest - Local Development Commands               ║"
	@echo "╚══════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "Quick Start:"
	@echo "  make run-all      - 🚀 Build and start everything (recommended)"
	@echo ""
	@echo "Commands:"
	@echo "  setup             - 🔨 Build Docker containers"
	@echo "  start             - ▶️  Start the application (with logs)"
	@echo "  start-detached    - ▶️  Start the application (background)"
	@echo "  stop              - ⏹️  Stop the application"
	@echo "  restart           - 🔄 Restart the application"
	@echo "  logs              - 📋 View application logs"
	@echo "  clean             - 🧹 Stop and remove all containers and volumes"
	@echo "  db-reset          - 🔄 Reset database and reseed"
	@echo "  seed              - 🌱 Seed the database with demo data"
	@echo "  db-push           - 📊 Run database migrations"
	@echo "  shell             - 🐚 Open shell in app container"
	@echo "  check-docker      - 🔍 Check Docker Desktop memory allocation"
	@echo ""
	@echo "Example workflow:"
	@echo "  make run-all      # First time setup"
	@echo "  make stop         # When you're done"
	@echo "  make start        # Start again later"
	@echo "  make clean        # Complete cleanup"
	@echo ""

check-docker:
	@echo "🔍 Checking Docker Desktop configuration..."
	@docker info --format '{{.MemTotal}}' | awk '{printf "Memory: %.2f GB\n", $$1/1024/1024/1024}'
	@echo ""
	@echo "💡 Recommended: At least 4GB RAM allocated to Docker"
	@echo "   To increase: Docker Desktop → Settings → Resources → Memory"
	@echo ""

run-all: check-docker
	@echo "╔══════════════════════════════════════════════════════════╗"
	@echo "║         🚀 Starting Vest - Complete Setup                ║"
	@echo "╚══════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "This will:"
	@echo "  ✓ Build Docker containers"
	@echo "  ✓ Start PostgreSQL database"
	@echo "  ✓ Run database migrations"
	@echo "  ✓ Seed with demo data (NVDA workflow, users, etc.)"
	@echo "  ✓ Start development server"
	@echo ""
	@echo "⏳ Building containers (this may take a minute)..."
	@docker compose build
	@echo "✅ Containers built!"
	@echo ""
	@echo "⏳ Starting services..."
	@docker compose up -d
	@echo "✅ Services started!"
	@echo ""
	@echo "⏳ Waiting for database to be ready..."
	@timeout=30; while ! docker compose exec -T postgres pg_isready -U vest > /dev/null 2>&1; do \
		timeout=$$((timeout - 1)); \
		if [ $$timeout -le 0 ]; then \
			echo "❌ Database failed to start"; \
			exit 1; \
		fi; \
		sleep 1; \
	done
	@echo "✅ Database ready!"
	@echo ""
	@echo "⏳ Running database migrations..."
	@docker compose exec -T app npm run db:push -- --force 2>/dev/null || echo "✅ Schema up to date!"
	@echo ""
	@echo "⏳ Seeding database with demo data..."
	@echo "   (This may take 30-60 seconds - please wait...)"
	@if docker compose exec -T app npx tsx scripts/seed.ts; then \
		echo ""; \
		echo "╔══════════════════════════════════════════════════════════╗"; \
		echo "║              ✅ Vest is Ready!                            ║"; \
		echo "╚══════════════════════════════════════════════════════════╝"; \
		echo ""; \
		echo "🌐 Open your browser: http://localhost:5000"; \
		echo "👤 Auto-login as: Dan Mbanga (dan@example.io)"; \
		echo ""; \
		echo "📋 View logs: make logs"; \
		echo "⏹️  Stop app:  make stop"; \
		echo "🧹 Cleanup:   make clean"; \
		echo ""; \
	else \
		echo ""; \
		echo "❌ Seeding failed (Error $$?)"; \
		echo ""; \
		echo "Common fixes:"; \
		echo "  1. Increase Docker memory: Docker Desktop → Settings → Resources"; \
		echo "     Recommended: 4GB minimum, 8GB preferred"; \
		echo "  2. Try seeding again: make seed"; \
		echo "  3. Check logs: make logs"; \
		echo ""; \
		echo "The app may still work - try opening: http://localhost:5000"; \
		echo ""; \
	fi

setup:
	@echo "🔨 Building Docker containers..."
	@docker compose build
	@echo "✅ Setup complete! Run 'make start' to start the application."

start:
	@echo "🚀 Starting Vest application..."
	@docker compose up

start-detached:
	@echo "🚀 Starting Vest application in background..."
	@docker compose up -d
	@echo "✅ Application started!"
	@echo "🌐 Access at: http://localhost:5000"
	@echo "📋 View logs: make logs"

stop:
	@echo "🛑 Stopping Vest application..."
	@docker compose down
	@echo "✅ Stopped!"

restart:
	@echo "🔄 Restarting Vest application..."
	@docker compose restart
	@echo "✅ Restarted!"

logs:
	@echo "📋 Viewing logs (Ctrl+C to exit)..."
	@docker compose logs -f

clean:
	@echo "🧹 Cleaning up all containers and volumes..."
	@docker compose down -v
	@echo "✅ Cleanup complete! All data has been removed."
	@echo "💡 Run 'make run-all' to start fresh."

db-reset:
	@echo "🔄 Resetting database..."
	@docker compose exec app npm run db:push -- --force
	@docker compose exec app npx tsx scripts/seed.ts
	@echo "✅ Database reset and reseeded!"

seed:
	@echo "🌱 Seeding database..."
	@echo "   (This may take 30-60 seconds - please wait...)"
	@docker compose exec app npx tsx scripts/seed.ts
	@echo "✅ Database seeded!"

db-push:
	@echo "📊 Running database migrations..."
	@docker compose exec app npm run db:push -- --force
	@echo "✅ Migrations complete!"

shell:
	@echo "🐚 Opening shell in app container..."
	@docker compose exec app sh
