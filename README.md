## Project Structure

```
splash_finder/
├── client/                 # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── search/     # Search form and grid
│   │   │   ├── top-searches/ # Top searches banner
│   │   │   └── history/    # Search history panel
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # API client utilities
│   │   ├── pages/          # Page components (Login, Search)
│   │   ├── providers/      # Context providers (Auth)
│   │   ├── router/         # App routing
│   │   └── main.tsx        # App entry point
│   ├── tests/              # Frontend tests
│   └── package.json
├── server/                 # Express backend (Node.js + TypeScript)
│   ├── src/
│   │   ├── api/
│   │   │   ├── routes/     # API route handlers
│   │   │   └── middleware/ # Auth and error handling
│   │   ├── auth/           # Passport OAuth strategies
│   │   ├── cache/          # Top searches cache
│   │   ├── config/         # DB and env config
│   │   ├── models/         # Mongoose schemas
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript declarations
│   │   ├── utils/          # Unsplash client
│   │   └── index.ts        # Server entry point
│   ├── tests/              # Backend tests
│   └── package.json
├── docs/
│   ├── assets/
│   │   └── screenshots/    # Visual proofs
│   └── postman/            # API collection
├── specs/                  # Project specifications
└── README.md
```

## Features

- OAuth authentication (Google, Facebook, GitHub)
- Search Unsplash images
- View top community searches
- Review personal search history
- Responsive grid with multi-select counter

## Setup

### Prerequisites

- Node.js 20 LTS
- npm 10+
- MongoDB Atlas account or local MongoDB 6.x
- Unsplash developer account
- OAuth credentials for Google, Facebook, GitHub

### Installation

```bash
# Clone the repo
git clone <repo-url>
cd splash_finder

# Install dependencies
npm install --prefix server
npm install --prefix client
```

### Environment Variables

Copy `.env.example` to `.env` in `server/` and `client/` directories, then update the values.

#### server/.env

```
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb+srv://<user>:<password>@cluster/sample
SESSION_SECRET=change-me-to-random-string
UNSPLASH_ACCESS_KEY=your-unsplash-access-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

#### client/.env

```
VITE_API_BASE_URL=http://localhost:4000
```

### OAuth Setup

1. **Google**: Create project in Google Cloud Console, enable Google+ API, create OAuth 2.0 credentials.
2. **Facebook**: Create app in Facebook Developers, add Facebook Login product.
3. **GitHub**: Create OAuth App in GitHub settings.

Set redirect URIs to `http://localhost:4000/api/auth/google/callback`, etc.

### Running

```bash
# Backend (with hot reload)
npm run dev --prefix server

# Frontend (Vite dev server)
npm run dev --prefix client
```

Visit `http://localhost:5173` for the app, `http://localhost:4000` for API.

## API Usage

### Authentication

All endpoints require session authentication.

- `POST /api/auth/google` - Start Google OAuth
- `POST /api/auth/facebook` - Start Facebook OAuth
- `POST /api/auth/github` - Start GitHub OAuth
- `POST /api/auth/logout` - Logout

### Search

- `POST /api/search` - Search images
  - Body: `{ "term": "kittens" }`
  - Response: `{ "term": "kittens", "resultCount": 10, "images": [...] }`

### Top Searches

- `GET /api/top-searches` - Get top 5 community searches
  - Response: `{ "terms": [{ "term": "sunset", "count": 12 }, ...] }`

### History

- `GET /api/history?limit=20&cursor=2023-01-01T00:00:00.000Z` - Get user history
  - Response: `{ "searches": [{ "term": "cats", "timestamp": "2023-01-01T...", "resultCount": 5 }, ...] }`

## Testing

```bash
# Backend tests
npm test --prefix server

# Frontend tests
npm test --prefix client

# With coverage
npm run test:coverage --prefix server
```

## Screenshots

See `docs/assets/screenshots/` for visual proofs.

## License

MIT
