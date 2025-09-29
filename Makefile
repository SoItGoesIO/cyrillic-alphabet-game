.PHONY: start stop status reset db-shell dev help logs ps db-dump mcp-local mcp-remote mcp-both

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

start: ## Start Supabase services
	@./scripts/start.sh

stop: ## Stop Supabase services
	@./scripts/stop.sh

status: ## Show Supabase status
	@./scripts/status.sh

reset: ## Reset database and restart services
	@./scripts/reset.sh

db-shell: ## Connect to PostgreSQL shell
	@echo "Connecting to PostgreSQL..."
	@PGPASSWORD=postgres psql "host=127.0.0.1 port=54322 user=postgres dbname=postgres"

dev: start ## Start development environment
	@echo "Development environment ready!"
	@echo "Studio: http://localhost:54323"

test-queries: ## Run sample test queries
	@./scripts/test-queries.sh

logs: ## Follow all container logs
	@echo "Following all Supabase container logs..."
	@docker logs -f supabase_db_cyril 2>/dev/null || echo "Container supabase_db_cyril not found"

ps: ## Show running Docker containers
	@echo "Docker containers status:"
	@docker ps --filter "name=supabase" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

db-dump: ## Dump local database schema
	@echo "Dumping local database schema..."
	@PGPASSWORD=postgres pg_dump -h 127.0.0.1 -p 54322 -U postgres -d postgres --schema-only --no-owner --no-privileges

mcp-local: ## Switch MCP to local Supabase
	@node scripts/switch-mcp.js local
	@echo "Restart Claude Code to apply changes"

mcp-remote: ## Switch MCP to remote Supabase
	@node scripts/switch-mcp.js remote
	@echo "Restart Claude Code to apply changes"

mcp-both: ## Switch MCP to both local and remote Supabase
	@node scripts/switch-mcp.js both
	@echo "Restart Claude Code to apply changes"