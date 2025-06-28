#!/usr/bin/env bash

# install backend deps
npm install --prefix backend

# install frontend deps, including devDependencies (e.g., vite)
npm install --prefix frontend --include=dev

# build frontend
cd frontend
npx vite build
