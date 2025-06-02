#!/bin/bash

# TRT Clinic Database Reset Script
# This script resets the database and reapplies all migrations
# WARNING: This will delete all data!

set -e  # Exit on any error

echo "⚠️  TRT Clinic Database Reset"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "database/migrations" ]; then
    print_error "Please run this script from the project root directory"
    print_error "Expected to find: database/migrations/"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is not installed"
    print_error "Please run ./database/scripts/setup.sh first"
    exit 1
fi

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    print_error "Project not linked to Supabase"
    print_error "Please run ./database/scripts/setup.sh first"
    exit 1
fi

# Show warning
print_warning "⚠️  WARNING: This will DELETE ALL DATA in your database!"
print_warning "This action cannot be undone."
echo ""
print_status "This will:"
echo "  - Drop all tables and data"
echo "  - Remove all functions and triggers"
echo "  - Reset the database to empty state"
echo "  - Reapply all migrations from scratch"
echo ""

# Get confirmation
read -p "Are you absolutely sure you want to reset the database? Type 'RESET' to confirm: " CONFIRM

if [ "$CONFIRM" != "RESET" ]; then
    print_warning "Reset cancelled by user"
    exit 0
fi

echo ""
print_status "Proceeding with database reset..."

# Show current project info
PROJECT_INFO=$(supabase status | grep "API URL" | head -1)
print_status "Resetting database for: $PROJECT_INFO"

# Reset the database
print_status "Resetting database (this may take a moment)..."
if supabase db reset; then
    print_success "Database reset completed"
else
    print_error "Database reset failed"
    exit 1
fi

# Wait a moment for the reset to complete
sleep 2

# Reapply migrations
print_status "Reapplying all migrations..."

# List migration files
MIGRATION_FILES=(database/migrations/*.sql)
MIGRATION_COUNT=${#MIGRATION_FILES[@]}

print_status "Found $MIGRATION_COUNT migration files to reapply:"
for file in "${MIGRATION_FILES[@]}"; do
    echo "  - $(basename "$file")"
done

echo ""

# Apply migrations
print_status "Applying migrations to database..."
if supabase db push --include-all; then
    print_success "All migrations reapplied successfully!"
else
    print_error "Failed to reapply migrations"
    exit 1
fi

# Verify the reset
print_status "Verifying database reset..."
supabase status

echo ""
print_success "🎉 Database reset completed successfully!"
echo ""
print_status "Database is now in a clean state with:"
echo "  ✓ All tables recreated"
echo "  ✓ All indexes and constraints applied"
echo "  ✓ All RLS policies active"
echo "  ✓ All triggers and functions installed"
echo "  ✓ No data (clean slate)"
echo ""
print_status "You can now:"
echo "1. Test your application with a fresh database"
echo "2. Create test data through your application"
echo "3. Verify all functionality works correctly"
echo ""
print_warning "Remember: All previous data has been permanently deleted!" 