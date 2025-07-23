# GitHub Dashboard Application (GitConnections)

Welcome to the **GitHub Dashboard Application (GitConnections)**!  
This project provides a web-based interface for managing your GitHub followers, non-followers, and unfollow actions, with secure authentication via GitHub OAuth. Built with a modern tech stack, it offers a user-friendly dashboard to track and manage your GitHub activity efficiently.

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Demo](#demo)

---

## Features

- **GitHub OAuth Authentication:** Secure login using GitHub credentials.
- **Interactive Dashboard:** View followers, non-followers, and whitelisted users.
- **Batch Unfollow:** Unfollow multiple users with progress tracking.
- **Virtual Scrolling:** Efficient rendering of large user lists.
- **Theme Toggle:** Switch between light and dark modes.
- **Rate Limit Monitoring:** Track GitHub API usage to avoid rate limits.
- **Persistent Data Storage:** Save whitelist and user data for seamless usage.

---

## Prerequisites

- **Node.js:** Version 18.x or later
- **npm:** Version 8.x or later
- **Git:** For cloning the repository
- **GitHub Account:** With OAuth app credentials

---

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/samuelldmj/gitconnections.git
   cd gitconnections
   ```

2. **Install Frontend Dependencies:**

   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies:**

   ```bash
   cd ../backend
   npm install
   ```

4. **Set Up Environment Variables:**  
   See the [Configuration](#configuration) section.

---

## Usage

1. **Start the Backend Server:**

   ```bash
   cd backend
   npm start
   ```

   The server runs on [http://localhost:3000](http://localhost:3000) by default.

2. **Start the Frontend Development Server:**

   ```bash
   cd frontend
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser to access the app.

3. **Log In:**  
   Use your GitHub account via the OAuth flow to log in.

---

## Configuration

Create a `.env.local` file in the `backend` directory with the following variables:

```env
VITE_API_URL=http://localhost:3000
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
SESSION_SECRET=your-secure-session-secret
PORT=3000
```

- **GITHUB_CLIENT_ID** and **GITHUB_CLIENT_SECRET**: Obtain these by creating an OAuth app in your GitHub settings.
- **SESSION_SECRET**: Use a random, secure string for session security.

## API Endpoints

| Method   | Endpoint                        | Description                                      |
| -------- | ------------------------------- | ------------------------------------------------ |
| `POST`   | `/api/auth/github`              | Authenticate using a GitHub OAuth code           |
| `GET`    | `/api/auth/user`                | Fetch the authenticated user's profile           |
| `GET`    | `/api/auth/followers`           | Retrieve the list of followers                   |
| `GET`    | `/api/auth/non-followers`       | Get users you follow who don't follow you back   |
| `DELETE` | `/api/auth/following/:username` | Unfollow a single user                           |
| `POST`   | `/api/auth/unfollow-batch`      | Unfollow multiple users in a batch               |
| `GET`    | `/api/auth/rate-limit`          | Check the GitHub API rate limit status           |
| `GET`    | `/api/auth/user-stars`          | Fetch the total stars on the user's repositories |

## Development

### Run in Development Mode

#### Frontend with hot reloading:

```bash
cd frontend
npm run dev
```

#### Backend with hot reloading:

```bash
cd backend
npm run dev
```

Lint and Format Code:

```bash
npm run lint
npm run format
```

### Test Locally

Verify changes before committing.

## Deployment

Deploy the application to Vercel for free:

Install Vercel CLI:

```bash
npm install -g vercel
```

Log In and Deploy:

```bash
vercel
```

### Configure Routing

Add a `vercel.json` file in the repository root (see repository for details).

### Set Environment Variables

Configure variables in the Vercel dashboard.

## Contributing

We welcome contributions! Follow these steps:

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Demo

Watch a demo of the GitHub Dashboard Application: [Demo Link](/frontend/public/video/gitConnectionVid.mp4)
