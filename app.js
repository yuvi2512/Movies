import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import bodyParser from "body-parser";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Initialize session middleware
app.use(session({
    secret: "my_key",
    resave: false,
    saveUninitialized: true
}));

mongoose.connect("mongodb://127.0.0.1:27017/mydb", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB");
    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    });
}).catch(error => {
    console.error("Error connecting to MongoDB:", error);
});

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    playlists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Playlist"
    }]
});
const User = mongoose.model("User", userSchema);

// Register endpoint
app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newUser = new User({
            name,
            email,
            password
        });
        await newUser.save();
        console.log("User Registered Successfully");
        return res.redirect('register.html');
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).send("An error occurred");
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.send("User not found or incorrect credentials");
        }
        req.session.userId = user._id; // Set the user ID in the session
        return res.redirect('userhome.html'); // Redirect to user home
    } catch (error) {
        console.error("Login error:", error);
        res.send("An error occurred");
    }
});

// Logout endpoint
app.get("/logout", (req, res) => {
    req.session.destroy(); // Destroy the session
    return res.redirect('login.html');
});

const playlistSchema = new mongoose.Schema({
    name: String,
    movies: [
        {
            title: String
        }
    ]
});
const Playlist = mongoose.model("Playlist", playlistSchema);

// Endpoint to get playlists
app.get("/get-playlists", async (req, res) => {
    try {
        // Check if the user is authenticated
        if (!req.session.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await User.findById(req.session.userId).populate("playlists");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user.playlists);
    } catch (error) {
        console.error("Error fetching playlists:", error);
        res.status(500).json({ error: "An error occurred" });
    }
});


// Endpoint to create a new playlist
app.post("/create-playlist", async (req, res) => {
    const { playlistName } = req.body;
    try {
        const userId = req.session.userId;

        const newPlaylist = new Playlist({
            name: playlistName
            // You can set other properties of the playlist here
        });
        await newPlaylist.save();

        if (userId) {
            const user = await User.findByIdAndUpdate(userId, { $push: { playlists: newPlaylist._id } });
            res.json({ message: "Playlist created successfully", playlistId: newPlaylist._id });
        } else {
            res.status(401).json({ error: "User not authenticated" });
        }
    } catch (error) {
        console.error("Error creating playlist:", error);
        res.status(500).json({ error: "An error occurred" });
    }
});

// Endpoint to save selected movies to a playlist
app.post("/save-movies", async (req, res) => {
    const { playlistId, moviesTitles } = req.body;

    try {
        const user = await User.findById(req.session.userId);
        const playlist = await Playlist.findById(playlistId);

        if (!user || !playlist) {
            return res.status(400).json({ error: "Invalid user or playlist" });
        }

        // Create an array of movie objects with titles
        const movies = moviesTitles.map(title => ({ title }));

        // Add the movies to the playlist's movies array
        playlist.movies.push(...movies);

        // Save the playlist with the updated movies
        await playlist.save();

        res.json({ message: "Movies saved to playlist" });
    } catch (error) {
        console.error("Error saving movies to playlist:", error);
        res.status(500).json({ error: "An error occurred" });
    }
});
 
// Endpoint to get a specific playlist by ID
app.get("/get-playlist/:id", async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) {
            return res.status(404).json({ error: "Playlist not found" });
        }
        return res.json(playlist);
    } catch (error) {
        console.error("Error fetching playlist:", error);
        return res.status(500).json({ error: "An error occurred" });
    }
});

// Endpoint to get movies of a specific playlist
app.get("/get-playlist-movies/:id", async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) {
            return res.status(404).json({ error: "Playlist not found" });
        }
        return res.json(playlist.movies);
    } catch (error) {
        console.error("Error fetching playlist movies:", error);
        return res.status(500).json({ error: "An error occurred" });
    }
});
