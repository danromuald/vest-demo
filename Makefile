.PHONY: help run-all setup start start-detached stop restart logs clean seed db-push db-reset shell

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
	@echo ""
	@echo "Example workflow:"
	@echo "  make run-all      # First time setup"
	@echo "  make stop         # When you're done"
	@echo "  make start        # Start again later"
	@echo "  make clean        # Complete cleanup"
	@echo ""

run-all:
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
	@docker compose exec -T app npx tsx scripts/seed.ts
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════╗"
	@echo "║              ✅ Vest is Ready!                            ║"
	@echo "╚══════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "🌐 Open your browser: http://localhost:5000"
	@echo "👤 Auto-login as: Dan Mbanga (dan@example.io)"
	@echo ""
	@echo "📋 View logs: make logs"
	@echo "⏹️  Stop app:  make stop"
	@echo "🧹 Cleanup:   make clean"
	@echo ""

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
	@docker compose exec app npx tsx scripts/seed.ts
	@echo "✅ Database seeded!"

db-push:
	@echo "📊 Running database migrations..."
	@docker compose exec app npm run db:push -- --force
	@echo "✅ Migrations complete!"

shell:
	@echo "🐚 Opening shell in app container..."
	@docker compose exec app sh
