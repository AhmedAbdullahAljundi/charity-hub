#!/bin/sh

echo "Waiting for database..."
sleep 5

echo "Running migrations..."
npx prisma migrate deploy

echo "Starting server..."
npm start
