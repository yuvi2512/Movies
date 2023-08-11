
document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.getElementById("searchButton");
    searchButton.addEventListener("click", performSearch);

    populatePlaylistsSidebar();

    const addToPlaylistButton = document.getElementById("addToPlaylistButton");
    addToPlaylistButton.addEventListener("click", addToPlaylist);

    const createPlaylistForm = document.getElementById("createPlaylistForm");
    createPlaylistForm.addEventListener("submit", createPlaylist);

    const playlistSelect = document.getElementById("playlistSelect");
    playlistSelect.addEventListener("change", async (event) => {
        if (event.target.tagName === "SELECT") {
            const selectedPlaylistOption = event.target.options[event.target.selectedIndex];
            const selectedPlaylistId = selectedPlaylistOption.dataset.playlistId;
            console.log("Selected Playlist ID:", selectedPlaylistId);
            await showPlaylistMovies(selectedPlaylistId);
        }
    });
    });


async function performSearch() {
    const searchInput = document.getElementById("searchInput").value;
    const resultsContainer = document.getElementById("resultsContainer");
    resultsContainer.innerHTML = "";

    try {
        const response = await fetch(`http://www.omdbapi.com/?&apikey=3f171c26&s=${searchInput}`);
        const data = await response.json();

        if (data.Response === "True") {
            data.Search.forEach(movie => {
                const movieElement = document.createElement("div");
                movieElement.classList.add("movie-card");
                movieElement.innerHTML = `
                    <input type="checkbox" class="movie-checkbox" style="width: 20px; height: 20px;">
                    <img src="${movie.Poster}" alt="${movie.Title} Poster">
                    <h3>${movie.Title}</h3>
                    <p>Year: ${movie.Year}</p>
                `;

                const movieCheckbox = movieElement.querySelector(".movie-checkbox");
                movieCheckbox.addEventListener("change", () => {
                    if (movieCheckbox.checked) {
                        selectedMovies.push(movie.Title);
                    } else {
                        selectedMovies = selectedMovies.filter(title => title !== movie.Title);
                    }
                });

                resultsContainer.appendChild(movieElement);
            });
        } else {
            console.error("No results found.");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

async function populatePlaylistsSidebar() {
    const playlistList = document.getElementById("playlistSelect");

    try {
        const response = await fetch("/get-playlists");
        const playlists = await response.json();

        playlistList.innerHTML = "";

        playlists.forEach(playlist => {
            const playlistItem = document.createElement("option");
            playlistItem.textContent = playlist.name;
            playlistItem.dataset.playlistId = playlist._id;
            playlistList.appendChild(playlistItem);
        });
    } catch (error) {
        console.error("Error fetching playlists:", error);
    }
}
async function showPlaylistMovies(playlistId) {
    try {
        const response = await fetch(`/get-playlist-movies/${playlistId}`);
        const movies = await response.json();

        const playlistContainer = document.getElementById("playlistContainer");
        playlistContainer.innerHTML = "";

        // Display the playlist name
        const playlistNameHeading = document.createElement("h2");
        playlistNameHeading.textContent = "Playlist Movies";
        playlistContainer.appendChild(playlistNameHeading);

        // Create a list to display the movies
        const playlistMoviesList = document.createElement("ul");
        playlistMoviesList.classList.add("playlist-movies-list");

        movies.forEach(movie => {
            const movieItem = document.createElement("li");
            movieItem.textContent = movie.title;
            playlistMoviesList.appendChild(movieItem);
        });
        console.log("Received movies:", movies);

        playlistContainer.appendChild(playlistMoviesList);
    } catch (error) {
        console.error("Error fetching playlist movies:", error);
    }
}

async function addToPlaylist() {
    const playlistSelect = document.getElementById("playlistSelect");
    const selectedPlaylistOption = playlistSelect.options[playlistSelect.selectedIndex];
    const selectedPlaylistId = selectedPlaylistOption.dataset.playlistId;


    if (selectedMovies.length === 0) {
        alert("No movies selected!");
        return;
    }

    try {
        // Send selected movies and playlist ID to the server
        const response = await fetch("/save-movies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                playlistId: selectedPlaylistId,
                moviesTitles: selectedMovies
            })
        });

        const result = await response.json();
        console.log(result); // Log the response from the server
        alert("Movies added to playlist!");
        showPlaylistMovies(selectedPlaylistId);
    } catch (error) {
        console.error("Error adding movies to playlist:", error);
    }
}

async function createPlaylist(event) {
event.preventDefault();
const playlistName = document.getElementById("playlistName").value;

if (!playlistName) {
    return;
}

try {
    const response = await fetch("/create-playlist", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ playlistName })
    });

    const result = await response.json();
    console.log(result);

    populatePlaylistsSidebar();
} catch (error) {
    console.error("Error creating playlist:", error);
}
}

let selectedMovies = []; // Initialize an array to store selected movies
playlistList.addEventListener("change", async (event) => {
    if (event.target.tagName === "SELECT") {
        const selectedPlaylistOption = event.target.options[event.target.selectedIndex];
        const selectedPlaylistId = selectedPlaylistOption.dataset.playlistId;
        console.log("Selected Playlist ID:", selectedPlaylistId); // Debugging log
        await showPlaylistMovies(selectedPlaylistId);
    }
});
