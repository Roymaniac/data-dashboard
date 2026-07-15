# Data Dashboard

Data Dashboard is a modern, interactive analytics web app built with React, TypeScript, and Vite. It brings together live data from multiple public APIs into a single dashboard experience for weather, cryptocurrency, and sports information.

## Features

- Weather insights with current conditions and a 7-day forecast
- Live cryptocurrency pricing and market movement trends
- Sports highlights, upcoming events, and team standings
- Responsive layout with a collapsible sidebar and light/dark theme toggle
- Fast client-side experience powered by Vite and React

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Lucide React

## Prerequisites

Before you begin, make sure you have the following installed:

- Node.js 18 or later
- pnpm

## Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

## Environment Configuration

The app uses Vite environment variables for API base URLs. Create a local environment file by copying the example file:

```bash
cp .env.example .env
```

Then update the values in .env if you want to override the default public API endpoints:

```env
VITE_APP_CRYPTO_URL=https://api.coingecko.com/api/v3
VITE_APP_SPORT_URL=https://site.web.api.espn.com/apis/v2/sports
VITE_APP_WEATHER_URL=https://api.open-meteo.com/v1/forecast
```

## Running the App

Start the development server:

```bash
pnpm dev
```

Open the local URL shown in the terminal to view the dashboard.

## Building for Production

Create a production build:

```bash
pnpm build
```

The output will be generated in the dist folder.

## Project Structure

- src/components - UI components and dashboard layout
- src/components/panels - Weather, crypto, and sports panels
- src/lib/api - API integration modules
- src/types - Shared TypeScript types

## License

This project is open source and available under the MIT license.
