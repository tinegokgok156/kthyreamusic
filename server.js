// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const SONGS_DIR = path.join(__dirname, "songs");

// Serve static files
app.use("/songs", express.static(SONGS_DIR));
app.use(express.static("public"));

// Function to get all songs
function getSongs() {
    if (!fs.existsSync(SONGS_DIR)) return [];

    const folders = fs.readdirSync(SONGS_DIR).filter(f => fs.statSync(path.join(SONGS_DIR, f)).isDirectory());

    return folders.map(folder => {
        const infoPath = path.join(SONGS_DIR, folder, "info.json");
        if (!fs.existsSync(infoPath)) return null;

        const info = JSON.parse(fs.readFileSync(infoPath));

        return {
            id: folder,
            name: info["song name"] || "Unknown",
            artist: info.artist || "Unknown",
            album: info.album || "Unknown"
        };
    }).filter(Boolean);
}

// Home page - list all songs
app.get("/", (req, res) => {
    const songs = getSongs();

    const list = songs.map(song =>
        `<a class="song" href="/song/${song.id}">
            ${song.name} - ${song.artist}
        </a>`
    ).join("");  // ✅ Fixed, no extra parentheses or ...info

    res.send(`
    <html>
    <head>
        <title>Kthyrea Musics</title>
        <link rel="stylesheet" href="/style.css">
    </head>
    <body>
        <h1>Kthyrea Musics</h1>
        <div class="songs">
            ${list}
        </div>
    </body>
    </html>
    `);
});

// Song page
app.get("/song/:id", (req, res) => {
    const id = req.params.id;
    const songDir = path.join(SONGS_DIR, id);

    if (!fs.existsSync(songDir)) {
        return res.status(404).send("Song not found");
    }

    const infoPath = path.join(songDir, "info.json");
    if (!fs.existsSync(infoPath)) {
        return res.status(404).send("Song info missing");
    }

    const info = JSON.parse(fs.readFileSync(infoPath));
    const files = fs.readdirSync(songDir);

    const image = files.find(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    const mp3 = files.find(f => /\.mp3$/i.test(f));

    if (!mp3) {
        return res.status(404).send("MP3 file missing");
    }

    res.send(`
    <html>
    <head>
        <title>${info["song name"]}</title>
        <link rel="stylesheet" href="/style.css">
    </head>
    <body>
        <a class="back" href="/">← Back</a>
        <div class="player">
            ${image ? `<img src="/songs/${id}/${image}" class="cover">` : ""}
            <h2>${info["song name"]}</h2>
            <p>Artist: ${info.artist}</p>
            <p>Album: ${info.album}</p>

            <audio controls autoplay>
                <source src="/songs/${id}/${mp3}" type="audio/mpeg">
            </audio>
        </div>
    </body>
    </html>
    `);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
