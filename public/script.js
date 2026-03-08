const songsDiv = document.getElementById("songs");
const playerDiv = document.getElementById("player");

const params = new URLSearchParams(window.location.search);
const songId = params.get("id");

if (songsDiv) {

fetch("/api/songs")
.then(res => res.json())
.then(data => {

data.forEach(song => {

const a = document.createElement("a");

a.className = "song";
a.href = `/song.html?id=${song.id}`;
a.innerText = `${song.name} - ${song.artist}`;

songsDiv.appendChild(a);

});

});

}

if (playerDiv && songId) {

fetch("/api/song/" + songId)
.then(res => res.json())
.then(song => {

playerDiv.innerHTML = `

<img src="${song.image}" class="cover">

<h2>${song["song name"]}</h2>
<p>Artist: ${song.artist}</p>
<p>Album: ${song.album}</p>

<audio controls autoplay>
<source src="${song.audio}" type="audio/mpeg">
</audio>

`;

});

}
