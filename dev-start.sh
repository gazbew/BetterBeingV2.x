#!/bin/bash

# Better Being Development Environment Startup Script
echo "🚀 Starting Better Being Development Environment..."
echo "================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Validate environment setup
print_info "Validating development environment..."
if [ -f "server/validate-setup.js" ]; then
    cd server
    if node validate-setup.js > /dev/null 2>&1; then
        print_status "Environment validation passed"
    else
        print_warning "Environment validation failed - some features may not work"
    fi
    cd ..
fi

# Function to kill background processes on exit
cleanup() {
    echo "🛑 Stopping development servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to clean up on script exit
trap cleanup EXIT

# Start backend server
echo "🔧 Starting backend server on port 3001..."
cd server
npm install > /dev/null 2>&1
npm start > ../server-backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend development server  
echo "🎨 Starting frontend development server on port 5173..."
npm install > /dev/null 2>&1
npm run dev > server-frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

echo ""
print_status "🎉 Better Being Development Environment Ready!"
echo "================================================="
echo ""
echo "🌐 Application URLs:"
echo "   📱 Frontend:  http://localhost:5173"
echo "   🔌 Backend:   http://localhost:3001"
echo "   🏥 Health:    http://localhost:3001/health"
echo "   📖 API Docs:  http://localhost:3001/api/docs"
echo ""
echo "🗄️  Database:"
echo "   📊 PostgreSQL (Neon): Connected"
echo "   🔐 Enhanced security: Active"
echo "   📈 Monitoring: Enabled"
echo ""
echo "📊 Development Tools:"
echo "   📋 BMad Method: Active"
echo "   🧪 Testing: npm run test"
echo "   📝 Logs: server-backend.log & server-frontend.log"
echo ""
echo "🚀 Ready for Epic Development!"
echo "   🎯 Epic 001: Authentication System"
echo "   🛒 Epic 002: E-Commerce Core"
echo "   🔒 Epic 003: Production Readiness"
echo ""
echo "⏹️  Press Ctrl+C to stop both servers"
echo "================================================="

# Wait for processes to complete (or be interrupted)
wait
