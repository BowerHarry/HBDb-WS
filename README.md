# HBDb-WS

The Node.js web service behind [HBDb](https://github.com/BowerHarry/HBDb), a personal film site. It handles accounts and makes all third-party API calls, so the browser never holds an API key.

**Status:** abandoned along with HBDb. It was hosted on Google App Engine; that deployment is no longer running.

## What it does

- Signs users in against a Firestore `users` collection and issues session tokens.
- Emails access requests to the site owner and runs a password-reset flow (single-use tokens, stored hashed, valid for 24 hours).
- Serves the film API the frontend uses. Each request is made to [TMDB](https://www.themoviedb.org/), [MDBList](https://mdblist.com/) or the YouTube Data API with the signed-in user's own keys, which are stored on their user document.

## Routes

| Route | Auth | Purpose |
| --- | --- | --- |
| `POST /login` | none | Check username and password, return `{ token, username }` |
| `POST /logout` | session | End the session |
| `GET /request`, `POST /request` | none | Access request form; emails the owner |
| `POST /reset` | none | Email a password-reset link |
| `GET /resetpassword`, `POST /resetpassword` | reset token | Reset form and submission |
| `GET /api/posters` | none | Poster URLs of popular films, for the sign-in page |
| `GET /api/films/search?query=` | session | Search films |
| `GET /api/films/:id` | session | Details, the user's rating and watchlist state, other sites' ratings, trailer |
| `GET /api/films/:id/similar` | session | Similar films |
| `PUT /api/films/:id/rating`, `DELETE …` | session | Rate a film (`{ "value": 0.5–10 }`) or remove the rating |
| `GET /api/watchlist` | session | The user's watchlist |
| `PUT /api/watchlist/:id`, `DELETE …` | session | Add or remove a film |
| `GET /api/history` | session | Films the user has rated |

Session routes expect `Authorization: Bearer <token>`. Tokens last seven days.

## Setup

Requires Node.js 20 or newer and a Firebase project with Firestore.

```bash
npm install
npm start
```

The server listens on `PORT`, or 8080.

Create a `.env` file with:

| Variable | Purpose |
| --- | --- |
| `FIREBASE_SERVICEACCOUNT` | Service account key for the Firebase project, as one line of JSON |
| `EMAIL_USER`, `EMAIL_PASS` | Gmail account used to send email (an app password) |
| `API_USER` | Username of the account whose TMDB key fetches the sign-in page posters |
| `ALLOWED_ORIGINS` | Comma-separated origins allowed to call the service from a browser. Defaults to `https://localhost:5173,http://localhost:5173` |
| `LIVE_MODE`, `ROOT_URL`, `TEST_URL` | Base URL used in reset emails: `ROOT_URL` when `LIVE_MODE` is `true`, otherwise `TEST_URL` |

### User documents

Accounts are added by hand to the Firestore `users` collection:

| Field | Purpose |
| --- | --- |
| `username`, `email` | Sign-in name and address for reset emails |
| `active` | Only active accounts can sign in |
| `passwordHash` | scrypt hash, written by the reset flow. To create an account, add it without a password and use "Reset Password" |
| `tmdbAPIKey` | TMDB API Read Access Token. The user's watchlist and ratings live in this TMDB account |
| `tmdbAccountId` | Optional. TMDB account id; looked up from the key when missing |
| `mdblistAPIKey` | MDBList API key |
| `googleAPIKey` | Google API key with the YouTube Data API enabled. It is used from the server, so it can't be restricted by HTTP referrer |

Accounts created before the move to scrypt have a `password` field holding a SHA-256 digest. It is replaced with `passwordHash` the first time that user signs in.

## Project structure

```
server.js              routes and middleware wiring
middleware/            session check, CORS allowlist
routes/                login, access requests, password reset, films, lists, posters
api/                   Firestore, TMDB, MDBList and YouTube clients
helper-functions.js    hashing, email, small utilities
views/                 HTML forms for access requests and password reset
tests/testLogin.js     manual check against a running server
app.yaml               App Engine config (Node.js 20, one instance)
```

## Known limitations

- No automated tests.
- No rate limiting on sign-in or reset requests.
- Watchlist and history return the first page of results from TMDB (20 films).
- Verified sessions are cached in memory for five minutes, which assumes a single instance.

## Licence

GPL-3.0. See [LICENSE](LICENSE).
