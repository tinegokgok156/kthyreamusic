const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const SONGS_DIR = path.join(__dirname, "songs");

app.use("/songs", express.static(SONGS_DIR));
app.use(express.static("public"));

function getSongs() {
    const folders = fs.readdirSync(SONGS_DIR);

    return folders.map(folder => {
        const infoPath = path.join(SONGS_DIR, folder, "info.json");
        const info = JSON.parse(fs.readFileSync(infoPath));

        return {
            id: folder,
            name: info["song name"],
            artist: info.artist,
            album: info.album
        };
    });
}

app.get("/", (req, res) => {

    const songs = getSongs();

    let list = songs.map(song =>
        `<a class="song" href="/song/${song.id}">
            ${song.name} - ${song.artist}
        </a>`
    ).join("");

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

app.get("/song/:id", (req, res) => {

    const id = req.params.id;

    const info = JSON.parse(
        fs.readFileSync(path.join(SONGS_DIR, id, "info.json"))
    );

    const files = fs.readdirSync(path.join(SONGS_DIR, id));

    const image = files.find(f =>
        f.endsWith(".png") ||
        f.endsWith(".jpg") ||
        f.endsWith(".jpeg") ||
        f.endsWith(".webp")
    );

    const mp3 = files.find(f => f.endsWith(".mp3"));

    res.send(`
    <html>
    <head>
        <title>${info["song name"]}</title>
        <link rel="stylesheet" href="/style.css">
    </head>

    <body>

        <a class="back" href="/">← Back</a>

        <div class="player">

            <img src="/songs/${id}/${image}" class="cover">

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

app.listen(PORT, () => {
    console.log("Running at http://localhost:" + PORT);
});
