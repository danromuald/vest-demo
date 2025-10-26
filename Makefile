.PHONY: help setup start stop restart logs clean seed db-push

help:
	@echo "Vest - Local Development Commands"
	@echo ""
	@echo "Usage: make [command]"
	@echo ""
	@echo "Commands:"
	@echo "  setup      - Initial setup (build containers)"
	@echo "  start      - Start the application with Docker"
	@echo "  stop       - Stop the application"
	@echo "  restart    - Restart the application"
	@echo "  logs       - View application logs"
	@echo "  clean      - Stop and remove all containers and volumes"
	@echo "  seed       - Seed the database with demo data"
	@echo "  db-push    - Run database migrations"
	@echo ""

setup:
	@echo "🔨 Building Docker containers..."
	docker-compose build
	@echo "✅ Setup complete! Run 'make start' to start the application."

start:
	@echo "🚀 Starting Vest application..."
	docker-compose up

stop:
	@echo "🛑 Stopping Vest application..."
	docker-compose down

restart:
	@echo "🔄 Restarting Vest application..."
	docker-compose restart

logs:
	docker-compose logs -f

clean:
	@echo "🧹 Cleaning up all containers and volumes..."
	docker-compose down -v
	@echo "✅ Cleanup complete!"

seed:
	@echo "🌱 Seeding database..."
	docker-compose exec app npx tsx scripts/seed.ts

db-push:
	@echo "📊 Running database migrations..."
	docker-compose exec app npm run db:push --force
