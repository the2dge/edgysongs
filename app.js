const CLIENT_ID = "a1080a4e2eb547f7a892752a81acbcc9"; // Your Spotify Client ID
const REDIRECT_URI = "https://the2dge.github.io/edgysongs/callback"; // Must match Spotify Developer Dashboard

// Spotify Authentication URL
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(
  REDIRECT_URI
)}&scope=${encodeURIComponent("streaming user-read-playback-state user-modify-playback-state")}`;

// Login Button - Redirect User to Spotify Login Page
document.getElementById("loginButton").addEventListener("click", function () {
  window.location.href = AUTH_URL;
});

// Extract Access Token from URL
function getTokenFromURL() {
  const hash = window.location.hash.substring(1); // Remove the "#"
  const params = new URLSearchParams(hash);
  const token = params.get("access_token");

  if (token) {
    localStorage.setItem("spotify_token", token); // Store token
    window.history.pushState({}, null, "/"); // Remove token from URL for security
    return token;
  } else {
    return null; // No token found
  }
}
function getActiveDevice(callback) {
  fetch("https://api.spotify.com/v1/me/player/devices", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("spotify_token")}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.devices.length > 0) {
        console.log("Active device found:", data.devices[0]);
        callback(data.devices[0].id);
      } else {
        alert("No active Spotify device found. Please open Spotify on your phone or computer and try again.");
      }
    })
    .catch((error) => console.error("Error fetching devices:", error));
}
const storedToken = getTokenFromURL() || localStorage.getItem("spotify_token");

if (!storedToken) {
  console.log("User is not authenticated. Redirecting to login...");
}

// Store token if available
const token = getTokenFromURL();
if (token) {
  localStorage.setItem("spotify_token", token);
  window.history.pushState({}, null, "/"); // Remove token from URL for security
}


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

function playSong(uri) {
  const token = localStorage.getItem("spotify_token");

  if (!token) {
    console.error("No valid Spotify token found.");
    return;
  }

  getActiveDevice((deviceId) => {
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        uris: [uri],
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => Promise.reject(err));
        }
        console.log("Song is playing:", uri);
      })
      .catch((error) => {
        console.error("Error playing song:", error);
      });
  });
}

// Play button event
document.querySelector(".play-pause-btn").addEventListener("click", () => {
  playSong(songs[currentSongIndex].source);
});

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
