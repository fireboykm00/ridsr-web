#!/bin/bash
# Script to create admin user

echo "Creating admin user..."
bun run scripts/create-admin-user.ts
echo "Admin user creation completed!"