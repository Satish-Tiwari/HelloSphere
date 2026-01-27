# HelloSphere - Frontend Directory

This repository contains the frontend architecture for the **HelloSphere** SaaS platform. It is built as a monorepo using [TurboRepo](https://turbo.build/), [Next.js](https://nextjs.org/), and [Vercel Microfrontends](https://vercel.com/docs/microfrontends).

## 🚀 Overview

The project follows a micro-frontend approach to separate concerns between the user interface and the API layer, while maintaining a unified development experience.

### Applications

- **Dashboard** (`apps/dashboard`):
  - Built with **Next.js 15** and **React 19**.
  - Uses **Tailwind CSS** and **Radix UI** for styling and components.
  - Acts as the main entry point and shell for the application.
  
- **API** (`apps/api`):
  - Start with **Express.js**.
  - Handles backend logic and API routes for the frontend.

## 🛠️ Getting Started

### Prerequisites

- **Node.js**: v20 or higher
- **PNPM**: Package manager

### Installation

```bash
pnpm install
```

### Running Locally

To start the development environment for all applications:

```bash
pnpm run dev
```

- **Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Microfrontends Proxy**: [http://localhost:3024](http://localhost:3024)

### Architecture

The distinct applications are routed and stitched together using the `microfrontends.json` configuration.

```mermaid
graph TD
    User-->Proxy[Microfrontend Proxy]
    Proxy-->|/api/*| API[API Service (Port 3001)]
    Proxy-->|/*| Dashboard[Dashboard App (Port 3000)]
```
