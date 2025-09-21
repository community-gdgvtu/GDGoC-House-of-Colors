# GDGoC VTU Portal

This is a Next.js application bootstrapped with Firebase Studio, serving as the official portal for the Google Developer Group of Creation (GDGoC) VTU community. It's designed to manage house points, user engagement, and events throughout the academic year.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI**: [React](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore, Authentication)
- **Generative AI**: [Genkit](https://firebase.google.com/docs/genkit) (via Google AI)

## Project Structure

- `src/app/`: Contains all the routes for the application, following the Next.js App Router structure.
  - `(app)/`: Routes for authenticated users (e.g., dashboard, profile).
  - `admin/`: Routes for the admin panel.
  - `api/`: API routes.
- `src/components/`: Shared React components.
  - `ui/`: Auto-generated ShadCN UI components.
- `src/lib/`: Core utilities, Firebase configuration, and data type definitions.
- `src/hooks/`: Custom React hooks (e.g., `useAuth`).
- `src/ai/`: Contains Genkit flows and AI-related logic.
- `public/`: Static assets like images and fonts.

## Getting Started

Follow these steps to get the project running locally.

### Prerequisites

- [Node.js](https://nodejs.org/en) (v18 or later)
- `gcloud` CLI (optional, for local admin authentication)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

The application connects to Firebase for authentication and database services.

- **Client-Side Firebase Config**: The client-side Firebase configuration is located in `src/lib/firebase.ts`. You should replace the placeholder configuration with your own Firebase project's web app credentials.

- **Server-Side (Admin) Config**: For server-side operations (like managing users in the admin panel), the app uses the Firebase Admin SDK. For local development, the recommended way to authenticate is to use Application Default Credentials.
  1. Install the `gcloud` CLI.
  2. Run the following command and follow the prompts to log in with your Google account that has access to the Firebase project:
     ```bash
     gcloud auth application-default login
     ```
  The Admin SDK in `src/lib/firebase-admin.ts` will automatically pick up these credentials.

### 3. Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).

## Available Scripts

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Creates a production build of the application.
- `npm run start`: Starts the production server.
- `npm run lint`: Lints the codebase using ESLint.
- `npm run typecheck`: Runs the TypeScript compiler to check for type errors.
