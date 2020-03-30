#!/usr/bin/env bash

# Replace existing build folder
rm -rf ./build/
mkdir build

# Build back end
npm install
npx tsc

# Build front end
npm install --prefix client
npm run build --prefix client
cp -R ./client/public ./build/public/
cp ./client/gatsby-routes.json ./build/public