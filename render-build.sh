#!/usr/bin/env bash

# Exit on any error
set -e

echo "Starting build process..."

# Clean any existing node_modules to avoid conflicts
echo "Cleaning existing dependencies..."
rm -rf backend/node_modules
rm -rf frontend/node_modules
rm -rf node_modules

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies including devDependencies
echo "Installing frontend dependencies..."
cd frontend
npm install --include=dev
echo "Building frontend..."
npx vite build
cd ..

echo "Build completed successfully!"