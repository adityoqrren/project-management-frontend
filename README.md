# TaskFlow – Frontend

A modern task management application built to help teams organize projects, manage tasks, and collaborate more efficiently.

TaskFlow provides a centralized workspace where users can manage projects, track task progress, assign responsibilities, and stay updated through real-time notifications.

## Features

- **Authentication** – Secure login and registration with JWT-based authentication.
- **Project Management** – Create, organize, update, archive, and manage projects.
- **Task Management** – Create tasks, assign members, update statuses, and track progress.
- **Team Collaboration** – Manage project members and monitor team activities.
- **Task Comments & Attachments** – Collaborate through comments and share supporting files.
- **Notifications** – Receive updates about task assignments and project activities.
- **Activity Logs** – Track important changes and activities within projects.
- **Dashboard** – Get an overview of projects, tasks, and progress.

## Tech Stack

- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Data Fetching & State Management:** TanStack Query
- **Real-time Communication:** WebSocket
- **Authentication:** JWT with HTTP-only cookies

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:

   ```bash
   cd <project-directory>
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Configure environment variables by creating a `.env.local` file:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3001](http://localhost:3001) in your browser.

## Project Structure

```text
src/
├── app/            # Application routes and pages
├── components/     # Reusable UI components
├── context/        # React contexts and providers
├── hooks/          # Custom React hooks
├── lib/            # API functions and utilities
└── types/          # TypeScript type definitions
```

## Backend

This frontend application communicates with the TaskFlow backend API, which handles authentication, project and task management, data persistence, and real-time events.

## License

This project is developed as a personal portfolio project.