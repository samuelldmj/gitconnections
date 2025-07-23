GitHub Dashboard Application
Welcome to the GitHub Dashboard Application! This project provides a web-based interface to manage your GitHub followers, non-followers, and unfollow actions, with authentication via GitHub OAuth. Built with a modern stack, it offers a user-friendly dashboard to track your GitHub activity.
Table of Contents

Features
Prerequisites
Installation
Usage
Configuration
API Endpoints
Development
Deployment
Contributing
License

Features

GitHub OAuth authentication for secure login.
Dashboard to view followers, non-followers, and whitelisted users.
Batch unfollow functionality with progress tracking.
Virtual scrolling for efficient list rendering.
Theme toggle between light and dark modes.
Rate limit monitoring for GitHub API usage.
Persistent whitelist and user data storage.

Prerequisites

Node.js (v18.x or later)
npm (v8.x or later)
Git
A GitHub account with OAuth app credentials
MongoDB (optional, for local testing; Atlas recommended for production)

Installation

Clone the repository:git clone https://github.com/your-username/your-repo.git
cd your-repo

Install dependencies:
For the frontend:cd frontend
npm install

For the backend:cd backend
npm install

Set up environment variables (see Configuration).

Usage

Start the backend server:cd backend
npm start

The server will run on http://localhost:3000 by default.
Start the frontend development server:cd frontend
npm run dev

Open http://localhost:5173 in your browser to access the app.
Log in using your GitHub account via the OAuth flow.

Configuration
Create a .env.local file in the backend directory with the following variables:
VITE_API_URL=http://localhost:3000
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
SESSION_SECRET=your-secure-session-secret
PORT=3000

Obtain GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET by creating an OAuth app in your GitHub settings.
SESSION_SECRET should be a random string for session security.

API Endpoints

POST /api/auth/github - Authenticate with GitHub OAuth code.
GET /api/auth/user - Fetch authenticated user profile.
GET /api/auth/followers - Retrieve followers list.
GET /api/auth/non-followers - Get users you follow who don’t follow back.
DELETE /api/auth/following/:username - Unfollow a single user.
POST /api/auth/unfollow-batch - Unfollow multiple users.
GET /api/auth/rate-limit - Check GitHub API rate limit.
GET /api/auth/user-stars - Fetch total stars on user repositories.

Development

Run the app in development mode with hot reloading:cd frontend
npm run dev
cd ../backend
npm run dev

Lint and format code:npm run lint
npm run format

Test changes locally before committing.

Deployment
This project can be deployed to Vercel for free:

Install the Vercel CLI:npm install -g vercel

Log in and deploy:vercel

Configure vercel.json for routing (see repository root).
Set environment variables in the Vercel dashboard.

Contributing

Fork the repository.
Create a feature branch (git checkout -b feature-name).
Commit your changes (git commit -m "Add feature").
Push to the branch (git push origin feature-name).
Open a pull request.

License
This project is licensed under the MIT License. See the LICENSE file for details.

<video controls width="500">
  <source src="../GitConnections/frontend/public/video/gitConnectionVid.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
