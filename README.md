# Movie Search App 

Welcome to the Movie Search App project,The backend is responsible for handling user authentication, creating playlists, and managing movie data. The frontend provides a user interface for searching movies and interacting with playlists.

## Backend

The backend of the Movie Search App is built using the Express.js framework and MongoDB for database storage. It provides various endpoints for user registration, authentication, playlist creation, and movie management.

### Technologies Used

- Node.js
- Express.js
- MongoDB
- Express Session for session management

### Installation and Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm run dev app.js
   ```

### Endpoints

- `POST /register`: Register a new user.
- `POST /login`: Authenticate a user and set a session.
- `GET /logout`: Destroy the session and log out the user.
- `GET /get-playlists`: Get playlists for an authenticated user.
- `POST /create-playlist`: Create a new playlist for an authenticated user.
- `POST /save-movies`: Save selected movies to a playlist.
- `GET /get-playlist/:id`: Get a specific playlist by ID.
- `GET /get-playlist-movies/:id`: Get movies of a specific playlist by ID.

## Frontend

The frontend of the Movie Search App provides a user interface for searching movies and interacting with playlists. It is a simple HTML page enhanced with JavaScript for dynamic behavior.

### Technologies Used

- HTML
- CSS
- JavaScript

### Usage

1. Open `index.html` in a web browser to access the Movie Search App.
2. Use the search input to enter a movie title and click the "Search" button to retrieve search results.
3. Login or register to create and manage playlists.
4. Interact with playlists to add movies and view details.
