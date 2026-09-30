# MovieExplorer

A responsive React Movie/TV Show Explorer built for Foundation Program Assignment 2.

## Features

- Responsive Home Page
- Navbar with navigation
- Dynamic hero banner
- Movie/Show listing page
- Search by title
- TVMaze API integration
- Responsive CSS Grid
- Reusable Movie Card
- Interactive details modal
- Modal close button and outside-click close
- Escape key support
- Loading skeletons
- Empty and error states
- Mobile/tablet/desktop responsive layout

## Tech Stack

- React
- JavaScript
- React Router
- CSS
- TVMaze API
- Vite

## Run locally

```bash
pnpm install
pnpm dev
```

Or:

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite.

## API endpoints used

All shows:

`https://api.tvmaze.com/shows?page=0`

Search:

`https://api.tvmaze.com/search/shows?q=YOUR_QUERY`

The app uses TVMaze because it provides free public show data without requiring an API key.
