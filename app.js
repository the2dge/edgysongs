const navItems = document.querySelectorAll(".nav-item");
const CLIENT_ID = "a1080a4e2eb547f7a892752a81acbcc9";
const REDIRECT_URI = "https://the2dge.github.io/callback"; // Change this to your domain

const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(
  REDIRECT_URI
)}&scope=streaming user-read-playback-state user-modify-playback-state`;

window.location.href = AUTH_URL;
window.onSpotifyWebPlaybackSDKReady = () => {
  const token = getTokenFromURL(); // Extract token from URL
  const player = new Spotify.Player({
    name: "My Web Player",
    getOAuthToken: (cb) => {
      cb(token);
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

  // Play song function
  function playSong(uri) {
    fetch(`https://api.spotify.com/v1/me/player/play`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        uris: [uri],
      }),
    });
  }

  // Add event listener to play button
  document.querySelector(".play-pause-btn").addEventListener("click", () => {
    playSong(songs[currentSongIndex].source);
  });
};
navItems.forEach((navItem) => {
  navItem.addEventListener("click", (e) => {
    e.preventDefault(); 

    const activeItem = document.querySelector(".nav-item.active");
    if (activeItem) {
      activeItem.classList.remove("active");
    }
    
    navItem.classList.add("active");
  });
});

const containers = document.querySelectorAll(".containers");

containers.forEach((container) => {
  let isDragging = false;
  let startX;
  let scrollLeft;

  container.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
  });

  container.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const x = e.pageX - container.offsetLeft;
    const step = (x - startX) * 0.6;
    container.scrollLeft = scrollLeft - step;
  });

  container.addEventListener("mouseup", () => {
    isDragging = false;
  });

  container.addEventListener("mouseleave", () => {
    isDragging = false;
  });
});

const progress = document.getElementById("progress");
const song = document.getElementById("song");
const controlIcon = document.getElementById("controlIcon");
const playPauseButton = document.querySelector(".play-pause-btn");
const forwardButton = document.querySelector(".controls button.forward");
const backwardButton = document.querySelector(".controls button.backward");
const rotatingImage = document.getElementById("rotatingImage");
const songName = document.querySelector(".music-player h2");
const artistName = document.querySelector(".music-player p");

let rotating = false;
let currentRotation = 0;
let rotationInterval;

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

function updateSongInfo() {
  songName.textContent = songs[currentSongIndex].title;
  artistName.textContent = songs[currentSongIndex].name;
  rotatingImage.src = songs[currentSongIndex].cover;

  // Instead of playing locally, open Spotify link
  playPauseButton.onclick = () => {
    window.open(songs[currentSongIndex].source, "_blank");
  };
}

forwardButton.addEventListener("click", function () {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  updateSongInfo();
});

backwardButton.addEventListener("click", function () {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  updateSongInfo();
});


function startRotation() {
  if (!rotating) {
    rotating = true;
    rotationInterval = setInterval(rotateImage, 50);
  }
}

function pauseRotation() {
  clearInterval(rotationInterval);
  rotating = false;
}

function rotateImage() {
  currentRotation += 1;
  rotatingImage.style.transform = `rotate(${currentRotation}deg)`;
}

song.addEventListener("loadedmetadata", function () {
  progress.max = song.duration;
  progress.value = song.currentTime;
});

song.addEventListener("ended", function () {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  updateSongInfo();
  playPause();
});

song.addEventListener("timeupdate", function () {
  if (!song.paused) {
    progress.value = song.currentTime;
  }
});

function playPause() {
  if (song.paused) {
    song.play();
    controlIcon.classList.add("fa-pause");
    controlIcon.classList.remove("fa-play");
    startRotation();
  } else {
    song.pause();
    controlIcon.classList.remove("fa-pause");
    controlIcon.classList.add("fa-play");
    pauseRotation();
  }
}

playPauseButton.addEventListener("click", playPause);

progress.addEventListener("input", function () {
  song.currentTime = progress.value;
});

progress.addEventListener("change", function () {
  song.play();
  controlIcon.classList.add("fa-pause");
  controlIcon.classList.remove("fa-play");
  startRotation();
});

forwardButton.addEventListener("click", function () {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  updateSongInfo();
  playPause();
});

backwardButton.addEventListener("click", function () {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  updateSongInfo();
  playPause();
});

updateSongInfo();

var swiper = new Swiper(".swiper", {
  effect: "coverflow",
  grabCursor: true,
  centeredSlides: true,
  loop: true,
  speed: 600,
  slidesPerView: "auto",
  coverflowEffect: {
    rotate: 10,
    stretch: 120,
    depth: 200,
    modifier: 1,
    slideShadows: false,
  },
   on: {
    click(event) {
      swiper.slideTo(this.clickedIndex);
    },
  },
  pagination: {
    el: ".swiper-pagination",
  },
});
