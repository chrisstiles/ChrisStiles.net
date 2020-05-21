#!/usr/bin/env bash

# Replace existing build folder
rm -rf ./build/
mkdir build

# Build back end
npm install
npx tsc

# Build front end
cd client
gatsby clean
npm install
npm run build
cd ..
cp -R ./client/public ./build/public/
cp ./client/gatsby-routes.json ./build/public