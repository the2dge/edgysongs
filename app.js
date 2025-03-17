const CLIENT_ID = "a1080a4e2eb547f7a892752a81acbcc9"; // Your Spotify Client ID
const REDIRECT_URI = "https://the2dge.github.io/edgysongs/callback"; // Must match Spotify Developer Dashboard

// Spotify Authentication URL
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(
  REDIRECT_URI
)}&scope=streaming user-read-playback-state user-modify-playback-state`;

// Login Button - Redirect User to Spotify Login Page
document.getElementById("loginButton").addEventListener("click", function () {
  window.location.href = AUTH_URL;
});

// Extract Access Token from URL
function getTokenFromURL() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get("access_token");
}

// Store token if available
const token = getTokenFromURL();
if (token) {
  localStorage.setItem("spotify_token", token);
  window.history.pushState({}, null, "/"); // Remove token from URL for security
}

// Retrieve stored token
const storedToken = localStorage.getItem("spotify_token");

// Initialize Spotify Web Playback SDK
window.onSpotifyWebPlaybackSDKReady = () => {
  if (!storedToken) {
    console.log("User not logged in. Please login.");
    return;
  }

  const player = new Spotify.Player({
    name: "Edgy Songs Player",
    getOAuthToken: (cb) => {
      cb(storedToken);
    },
    volume: 0.5,
  });

  // Connect the player
  player.connect().then((success) => {
    if (success) {
      console.log("Spotify Player connected!");
    }
  });

  // Listen for player state changes
  player.addListener("player_state_changed", (state) => {
    if (!state) return;
    console.log(state);
  });

  // Play a song using Spotify API
  function playSong(uri) {
    fetch(`https://api.spotify.com/v1/me/player/play`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${storedToken}`,
      },
      body: JSON.stringify({
        uris: [uri],
      }),
    }).catch((err) => console.error("Error playing song:", err));
  }

  // Play button event
  document.querySelector(".play-pause-btn").addEventListener("click", () => {
    playSong(songs[currentSongIndex].source);
  });
};

// Song List (Using Spotify Track URIs)
const songs = [
  {
    title: "Redemption",
    name: "Besomorph & Coopex",
    source: "spotify:track:3n3Ppam7vgaVa1iaRUc9Lp",
    cover: "https://i.scdn.co/image/ab67616d0000b2738f0b9c39f879a6db7b6ec92b",
  },
  {
    title: "Blinding Lights",
    name: "The Weeknd",
    source: "spotify:track:0VjIjW4GlUZAMYd2vXMi3b",
    cover: "https://i.scdn.co/image/ab67616d0000b273b3f4b0a6dbecf6b71db3c35a",
  },
];

let currentSongIndex = 0;

// Update song info
function updateSongInfo() {
  document.querySelector(".music-player h2").textContent = songs[currentSongIndex].title;
  document.querySelector(".music-player p").textContent = songs[currentSongIndex].name;
  document.getElementById("rotatingImage").src = songs[currentSongIndex].cover;
}

// Next and Previous Buttons
document.querySelector(".controls button.forward").addEventListener("click", function () {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  updateSongInfo();
});

document.querySelector(".controls button.backward").addEventListener("click", function () {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  updateSongInfo();
});

updateSongInfo();
