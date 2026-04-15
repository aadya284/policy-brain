#!/bin/bash

echo "Starting DevOps Automation..."

# Create project folder
mkdir devops-project
cd devops-project

# Initialize Node project
echo "Initializing project..."
npm init -y

# Install dependency
echo "Installing express..."
npm install express

# Create app file
cat <<EOL > app.js
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send("Automated DevOps App 🚀");
});

app.listen(3000, () => console.log("Server running"));
EOL

# Run application
echo "Starting server..."
node app.js &

# Save logs
echo "Server started successfully" > log.txt

echo "Automation Completed!"