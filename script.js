
"use strict";

const audio = document.getElementById("audioPlayer");

const tracks = [
  {
    id: 1,
    title: "Midnight Dreams",
    artist: "Luna Waves",
    category: "Chill",
    duration: "5:02",
    cover: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=500&q=85",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 2,
    title: "Golden Hour",
    artist: "Amber Skies",
    category: "Pop",
    duration: "6:12",
    cover: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=500&q=85",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 3,
    title: "Ocean Breeze",
    artist: "Coastal Echo",
    category: "Chill",
    duration: "5:18",
    cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=85",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    id: 4,
    title: "Deep Focus",
    artist: "Quiet Theory",
    category: "Focus",
    duration: "5:46",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=85",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  {
    id: 5,
    title: "Electric Soul",
    artist: "Nova Pulse",
    category: "Energy",
    duration: "5:31",
    cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=500&q=85",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
  },
  {
    id: 6,
    title: "Velvet Skies",
    artist: "Mira Bloom",
    category: "Pop",
    duration: "5:04",
    cover: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=500&q=85",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
  },
  {
    id: 7,
    title: "Soft Horizons",
    artist: "The Stillness",
    category: "Focus",
    duration: "5:24",
    cover: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=500&q=85",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"
  },
  {
    id: 8,
    title: "Afterglow",
    artist: "Neon Hearts",
    category: "Energy",
    duration: "5:09",
    cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=500&q=85",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
  }
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const elements = {
  search: $("#searchInput"),
  clearSearch: $("#clearSearch"),
  categoryFilters: $("#categoryFilters"),
  trackGrid: $("#trackGrid"),
  resultCount: $("#resultCount"),
  sectionTitle: $("#sectionTitle"),
  emptyState: $("#emptyState"),
  queueList: $("#queueList"),
  currentCover: $("#currentCover"),
  currentTitle: $("#currentTitle"),
  currentArtist: $("#currentArtist"),
  playPause: $("#playPauseBtn"),
  previous: $("#previousBtn"),
  next: $("#nextBtn"),
  progress: $("#progressBar"),
  currentTime: $("#currentTime"),
  duration: $("#duration"),
  volume: $("#volumeBar"),
  volumeValue: $("#volumeValue"),
  favoriteCurrent: $("#favoriteCurrent"),
  shuffle: $("#shuffleBtn"),
  repeat: $("#repeatBtn"),
  breadcrumb: $("#breadcrumb"),
  playlistLinks: $("#playlistLinks"),
  dialog: $("#playlistDialog"),
  playlistForm: $("#playlistForm"),
  playlistName: $("#playlistName"),
  toast: $("#toast")
};

const defaultPlaylists = {
  chill: { name: "Chill Vibes", ids: [1, 3, 7], builtIn: true },
  focus: { name: "Focus Time", ids: [4, 7, 1], builtIn: true },
  energy: { name: "Energy Boost", ids: [5, 8, 2], builtIn: true }
};

let customPlaylists = loadJSON("meloraPlaylists", {});
let favorites = loadJSON("meloraFavorites", []);
let queue = tracks.map(track => track.id);
let currentTrackId = null;
let currentView = "discover";
let activeCategory = "All";
let activePlaylist = "all";
let searchTerm = "";
let isShuffle = false;
let repeatMode = 0;
let toastTimer;

const getTrack = id => tracks.find(track => track.id === Number(id));
const allPlaylists = () => ({ ...defaultPlaylists, ...customPlaylists });

function loadJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    showToast("Browser storage is unavailable.");
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2400);
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function getVisibleTracks() {
  let result = [...tracks];

  if (currentView === "favorites") {
    result = result.filter(track => favorites.includes(track.id));
  }

  if (activePlaylist !== "all") {
    const playlist = allPlaylists()[activePlaylist];
    result = playlist
      ? result.filter(track => playlist.ids.includes(track.id))
      : result;
  }

  if (activeCategory !== "All") {
    result = result.filter(track => track.category === activeCategory);
  }

  if (searchTerm) {
    result = result.filter(track =>
      `${track.title} ${track.artist} ${track.category}`
        .toLowerCase()
        .includes(searchTerm)
    );
  }

  return result;
}

function renderTracks() {
  const visibleTracks = getVisibleTracks();

  elements.resultCount.textContent =
    `${visibleTracks.length} ${visibleTracks.length === 1 ? "track" : "tracks"}`;

  elements.trackGrid.innerHTML = visibleTracks.map(track => {
    const isPlaying = currentTrackId === track.id;
    const isFavorite = favorites.includes(track.id);

    return `
      <article class="track-card ${isPlaying ? "playing" : ""}">
        <div class="track-cover-wrap">
          <img
            class="track-cover"
            src="${track.cover}"
            alt="Cover for ${escapeHTML(track.title)}"
            loading="lazy"
          >
          <div class="cover-overlay">
            <button
              class="card-play"
              data-action="play"
              data-id="${track.id}"
              aria-label="${isPlaying && !audio.paused ? "Pause" : "Play"} ${escapeHTML(track.title)}"
            >${isPlaying && !audio.paused ? "Ⅱ" : "▶"}</button>
            <button
              class="card-add"
              data-action="add"
              data-id="${track.id}"
              aria-label="Add ${escapeHTML(track.title)} to playlist"
              title="Add to playlist"
            >＋</button>
          </div>
        </div>
        <div class="track-title-row">
          <h3 class="track-title" title="${escapeHTML(track.title)}">${escapeHTML(track.title)}</h3>
          <button
            class="track-menu"
            data-action="favorite"
            data-id="${track.id}"
            aria-label="${isFavorite ? "Remove from" : "Add to"} favorites"
            title="Toggle favorite"
          >${isFavorite ? "♥" : "♡"}</button>
        </div>
        <p class="track-artist">${escapeHTML(track.artist)}</p>
        <div class="track-meta">
          <span class="genre-tag">${escapeHTML(track.category)}</span>
          <span class="track-duration">${track.duration}</span>
        </div>
      </article>
    `;
  }).join("");

  elements.emptyState.hidden = visibleTracks.length > 0;
  elements.trackGrid.hidden = visibleTracks.length === 0;
}

function renderQueue() {
  const queuedTracks = queue
    .map(id => getTrack(id))
    .filter(Boolean);

  if (queuedTracks.length === 0) {
    elements.queueList.innerHTML =
      '<div class="queue-empty">Your queue is empty. Add a song to get started.</div>';
    return;
  }

  elements.queueList.innerHTML = queuedTracks.map((track, index) => `
    <div class="queue-row ${currentTrackId === track.id ? "current" : ""}">
      <button
        class="queue-play"
        data-action="play"
        data-id="${track.id}"
        aria-label="Play ${escapeHTML(track.title)}"
      >${currentTrackId === track.id && !audio.paused ? "Ⅱ" : "▶"}</button>
      <div class="queue-track">
        <img src="${track.cover}" alt="" loading="lazy">
        <div>
          <strong>${escapeHTML(track.title)}</strong>
          <span>${escapeHTML(track.artist)}</span>
        </div>
      </div>
      <span class="queue-genre">${escapeHTML(track.category)}</span>
      <span class="queue-duration">${track.duration}</span>
      <button
        class="queue-remove"
        data-action="remove"
        data-id="${track.id}"
        aria-label="Remove ${escapeHTML(track.title)} from queue"
        title="Remove from queue"
      >×</button>
    </div>
  `).join("");
}

function renderPlaylists() {
  const playlists = allPlaylists();

  const builtInHTML = `
    <button class="playlist-link ${activePlaylist === "all" ? "active" : ""}" data-playlist="all">
      <span>♫</span> All Songs
    </button>
    <button class="playlist-link ${activePlaylist === "chill" ? "active" : ""}" data-playlist="chill">
      <span>☾</span> Chill Vibes
    </button>
    <button class="playlist-link ${activePlaylist === "focus" ? "active" : ""}" data-playlist="focus">
      <span>◈</span> Focus Time
    </button>
    <button class="playlist-link ${activePlaylist === "energy" ? "active" : ""}" data-playlist="energy">
      <span>⚡</span> Energy Boost
    </button>
  `;

  const customHTML = Object.entries(customPlaylists).map(([id, playlist]) => `
    <button
      class="playlist-link ${activePlaylist === id ? "active" : ""}"
      data-playlist="${escapeHTML(id)}"
      title="${escapeHTML(playlist.name)}"
    >
      <span>♫</span> ${escapeHTML(playlist.name)}
    </button>
  `).join("");

  elements.playlistLinks.innerHTML = builtInHTML + customHTML;
}

function updateHeading() {
  const headings = {
    discover: "Explore sounds",
    library: "Music library",
    favorites: "Your favorites"
  };

  let heading = headings[currentView] || "Explore sounds";

  if (activePlaylist !== "all" && allPlaylists()[activePlaylist]) {
    heading = allPlaylists()[activePlaylist].name;
  }

  elements.sectionTitle.textContent = heading;
  elements.breadcrumb.textContent = heading;
}

function renderAll() {
  updateHeading();
  renderTracks();
  renderQueue();
  renderPlaylists();
  updatePlayer();
}

function updatePlayer() {
  const track = getTrack(currentTrackId);

  if (!track) {
    elements.currentTitle.textContent = "Choose a track";
    elements.currentArtist.textContent = "Your next favorite sound";
    elements.playPause.textContent = "▶";
    elements.playPause.setAttribute("aria-label", "Play");
    elements.currentTime.textContent = "0:00";
    elements.duration.textContent = "0:00";
    elements.progress.value = 0;
    elements.progress.style.setProperty("--range-progress", "0%");
    elements.favoriteCurrent.textContent = "♡";
    elements.favoriteCurrent.classList.remove("favorited");
    return;
  }

  elements.currentCover.src = track.cover;
  elements.currentCover.alt = `Cover for ${track.title}`;
  elements.currentTitle.textContent = track.title;
  elements.currentArtist.textContent = track.artist;
  elements.playPause.textContent = audio.paused ? "▶" : "Ⅱ";
  elements.playPause.setAttribute("aria-label", audio.paused ? "Play" : "Pause");

  const isFavorite = favorites.includes(track.id);
  elements.favoriteCurrent.textContent = isFavorite ? "♥" : "♡";
  elements.favoriteCurrent.classList.toggle("favorited", isFavorite);

  updateProgress();
}

function updateProgress() {
  const current = audio.currentTime || 0;
  const duration = audio.duration || 0;
  const percentage = duration ? (current / duration) * 100 : 0;

  elements.currentTime.textContent = formatTime(current);
  elements.duration.textContent = formatTime(duration);
  elements.progress.value = percentage;
  elements.progress.style.setProperty("--range-progress", `${percentage}%`);
}

function updateVolume() {
  const volume = Number(elements.volume.value);
  audio.volume = volume;
  elements.volumeValue.textContent = `${Math.round(volume * 100)}%`;
  elements.volume.style.setProperty("--range-progress", `${volume * 100}%`);
}

function updateActiveControls() {
  elements.shuffle.classList.toggle("enabled", isShuffle);
  elements.shuffle.setAttribute("aria-pressed", String(isShuffle));
  elements.repeat.classList.toggle("enabled", repeatMode !== 0);
  elements.repeat.setAttribute(
    "aria-label",
    repeatMode === 2 ? "Repeat one" : repeatMode === 1 ? "Repeat all" : "Repeat off"
  );
  elements.repeat.title =
    repeatMode === 2 ? "Repeat one" : repeatMode === 1 ? "Repeat all" : "Repeat off";
}

async function playTrack(id, autoplay = true) {
  const track = getTrack(id);
  if (!track) return;

  currentTrackId = track.id;

  if (!queue.includes(track.id)) {
    queue.push(track.id);
  }

  if (audio.src !== track.audio) {
    audio.src = track.audio;
    audio.load();
  }

  renderAll();

  if (autoplay) {
    try {
      await audio.play();
    } catch (error) {
      if (error.name !== "AbortError") {
        showToast("Unable to play this track. Check your internet connection.");
      }
    }
  }

  updatePlayer();
  renderTracks();
  renderQueue();
}

async function togglePlay() {
  if (!currentTrackId) {
    const firstTrack = queue.length ? queue[0] : tracks[0].id;
    await playTrack(firstTrack);
    return;
  }

  if (audio.paused) {
    try {
      await audio.play();
    } catch {
      showToast("Unable to play this track. Check your internet connection.");
    }
  } else {
    audio.pause();
  }

  updatePlayer();
  renderTracks();
  renderQueue();
}

function getPlaybackSequence() {
  const available = queue.filter(id => getTrack(id));

  if (available.length) return available;

  return tracks.map(track => track.id);
}

function playNext() {
  const sequence = getPlaybackSequence();

  if (repeatMode === 2 && currentTrackId) {
    audio.currentTime = 0;
    audio.play().catch(() => showToast("Unable to replay this track."));
    return;
  }

  let nextId;

  if (isShuffle) {
    const choices = sequence.filter(id => id !== currentTrackId);
    nextId = choices.length
      ? choices[Math.floor(Math.random() * choices.length)]
      : currentTrackId;
  } else {
    const index = sequence.indexOf(currentTrackId);
    if (index >= 0 && index < sequence.length - 1) {
      nextId = sequence[index + 1];
    } else if (repeatMode === 1 && sequence.length) {
      nextId = sequence[0];
    } else {
      audio.pause();
      audio.currentTime = 0;
      updatePlayer();
      renderTracks();
      renderQueue();
      showToast("You've reached the end of the queue.");
      return;
    }
  }

  if (nextId) playTrack(nextId);
}

function playPrevious() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  const sequence = getPlaybackSequence();
  const index = sequence.indexOf(currentTrackId);
  const previousId = index > 0
    ? sequence[index - 1]
    : repeatMode === 1 && sequence.length
      ? sequence[sequence.length - 1]
      : currentTrackId;

  if (previousId) playTrack(previousId);
}

function toggleFavorite(id) {
  const trackId = Number(id);

  if (favorites.includes(trackId)) {
    favorites = favorites.filter(item => item !== trackId);
    showToast("Removed from favorites");
  } else {
    favorites.push(trackId);
    showToast("Added to favorites ♥");
  }

  saveJSON("meloraFavorites", favorites);
  renderAll();
}

function addToPlaylist(id) {
  const trackId = Number(id);

  if (activePlaylist !== "all" &&
      allPlaylists()[activePlaylist] &&
      !defaultPlaylists[activePlaylist]) {
    const playlist = customPlaylists[activePlaylist];

    if (!playlist.ids.includes(trackId)) {
      playlist.ids.push(trackId);
      saveJSON("meloraPlaylists", customPlaylists);
      showToast(`Added to ${playlist.name}`);
    } else {
      showToast("This song is already in the playlist.");
    }
  } else {
    if (!queue.includes(trackId)) {
      queue.push(trackId);
      showToast("Added to playing queue");
    } else {
      showToast("This song is already in the queue.");
    }
  }

  renderAll();
}

function removeFromQueue(id) {
  const trackId = Number(id);

  queue = queue.filter(item => item !== trackId);

  if (currentTrackId === trackId) {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    currentTrackId = null;
    renderAll();
    showToast("Track removed from queue");
    return;
  }

  renderQueue();
  showToast("Removed from queue");
}

function setView(view) {
  currentView = view;
  activePlaylist = "all";
  activeCategory = "All";
  elements.search.value = "";
  searchTerm = "";

  $$(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  $$(".category-chip").forEach(button => {
    button.classList.toggle("active", button.dataset.category === "All");
  });

  elements.clearSearch.hidden = true;
  renderAll();
}

function selectPlaylist(id) {
  activePlaylist = id;
  currentView = "discover";
  activeCategory = "All";
  searchTerm = "";
  elements.search.value = "";
  elements.clearSearch.hidden = true;

  $$(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.view === "discover");
  });

  $$(".category-chip").forEach(button => {
    button.classList.toggle("active", button.dataset.category === "All");
  });

  renderAll();
}

function shuffleAll() {
  const list = getVisibleTracks();

  if (!list.length) {
    showToast("No tracks available to shuffle.");
    return;
  }

  const shuffled = list
    .map(track => track.id)
    .sort(() => Math.random() - 0.5);

  queue = [...new Set([...shuffled, ...queue])];
  isShuffle = true;
  updateActiveControls();
  playTrack(shuffled[0]);
}

function createPlaylist(name) {
  const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  customPlaylists[id] = {
    name,
    ids: [],
    builtIn: false
  };

  saveJSON("meloraPlaylists", customPlaylists);
  renderPlaylists();
  selectPlaylist(id);
  showToast(`Playlist "${name}" created`);
}

// Track cards and queue use event delegation.
elements.trackGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "play") {
    if (currentTrackId === id && !audio.paused) {
      audio.pause();
    } else {
      playTrack(id);
    }
  }

  if (action === "add") addToPlaylist(id);
  if (action === "favorite") toggleFavorite(id);

  updatePlayer();
  renderTracks();
  renderQueue();
});

elements.queueList.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);

  if (button.dataset.action === "play") {
    if (currentTrackId === id && !audio.paused) {
      audio.pause();
    } else {
      playTrack(id);
    }
  }

  if (button.dataset.action === "remove") removeFromQueue(id);
});

elements.search.addEventListener("input", () => {
  searchTerm = elements.search.value.trim().toLowerCase();
  elements.clearSearch.hidden = !elements.search.value;
  renderTracks();
});

elements.clearSearch.addEventListener("click", () => {
  elements.search.value = "";
  searchTerm = "";
  elements.clearSearch.hidden = true;
  renderTracks();
  elements.search.focus();
});

elements.categoryFilters.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  activeCategory = button.dataset.category;

  $$(".category-chip").forEach(chip => {
    chip.classList.toggle("active", chip === button);
  });

  renderTracks();
});

elements.playlistLinks.addEventListener("click", event => {
  const button = event.target.closest("[data-playlist]");
  if (button) selectPlaylist(button.dataset.playlist);
});

$$(".nav-item").forEach(button => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

$("#playFeatured").addEventListener("click", () => {
  const list = getVisibleTracks();
  if (list.length) playTrack(list[0].id);
  else showToast("No tracks available. Clear your filters first.");
});

$("#heroShuffle").addEventListener("click", shuffleAll);
$("#shuffleDiscover").addEventListener("click", shuffleAll);
elements.playPause.addEventListener("click", togglePlay);
elements.next.addEventListener("click", playNext);
elements.previous.addEventListener("click", playPrevious);

elements.shuffle.addEventListener("click", () => {
  isShuffle = !isShuffle;
  updateActiveControls();
  showToast(isShuffle ? "Shuffle enabled" : "Shuffle disabled");
});

elements.repeat.addEventListener("click", () => {
  repeatMode = (repeatMode + 1) % 3;
  updateActiveControls();

  const labels = ["Repeat off", "Repeat all", "Repeat one"];
  showToast(labels[repeatMode]);
});

elements.progress.addEventListener("input", () => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime = (Number(elements.progress.value) / 100) * audio.duration;
    updateProgress();
  }
});

elements.volume.addEventListener("input", updateVolume);

elements.favoriteCurrent.addEventListener("click", () => {
  if (currentTrackId) toggleFavorite(currentTrackId);
  else showToast("Play a song first.");
});

$("#clearQueue").addEventListener("click", () => {
  queue = [];

  audio.pause();
  audio.removeAttribute("src");
  audio.load();
  currentTrackId = null;

  renderAll();
  showToast("Queue cleared");
});

$("#resetFilters").addEventListener("click", () => {
  searchTerm = "";
  elements.search.value = "";
  elements.clearSearch.hidden = true;
  activeCategory = "All";
  currentView = "discover";
  activePlaylist = "all";

  $$(".category-chip").forEach(button => {
    button.classList.toggle("active", button.dataset.category === "All");
  });

  $$(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.view === "discover");
  });

  renderAll();
});

$("#createPlaylist").addEventListener("click", () => {
  elements.playlistName.value = "";
  elements.dialog.showModal();
  elements.playlistName.focus();
});

$("#closeDialog").addEventListener("click", () => {
  elements.dialog.close();
});

elements.dialog.addEventListener("click", event => {
  if (event.target === elements.dialog) elements.dialog.close();
});

elements.playlistForm.addEventListener("submit", event => {
  event.preventDefault();

  const name = elements.playlistName.value.trim();

  if (!name) {
    elements.playlistName.focus();
    return;
  }

  const duplicate = Object.values(allPlaylists()).some(
    playlist => playlist.name.toLowerCase() === name.toLowerCase()
  );

  if (duplicate) {
    showToast("A playlist with that name already exists.");
    return;
  }

  createPlaylist(name);
  elements.dialog.close();
});

$("#menuToggle").addEventListener("click", () => {
  $("#sidebar").classList.toggle("open");
});

document.addEventListener("click", event => {
  const sidebar = $("#sidebar");
  const menuButton = $("#menuToggle");

  if (
    window.innerWidth <= 800 &&
    sidebar.classList.contains("open") &&
    !sidebar.contains(event.target) &&
    !menuButton.contains(event.target)
  ) {
    sidebar.classList.remove("open");
  }
});

document.addEventListener("keydown", event => {
  const tag = document.activeElement?.tagName;
  const typing = tag === "INPUT" || tag === "TEXTAREA";

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    elements.search.focus();
  }

  if (event.code === "Space" && !typing && !elements.dialog.open) {
    event.preventDefault();
    togglePlay();
  }

  if (event.key === "Escape") {
    $("#sidebar").classList.remove("open");
  }
});

// Audio events keep the interface synchronized with actual playback.
audio.addEventListener("timeupdate", updateProgress);

audio.addEventListener("loadedmetadata", () => {
  updateProgress();
  renderQueue();
});

audio.addEventListener("play", () => {
  updatePlayer();
  renderTracks();
  renderQueue();
});

audio.addEventListener("pause", () => {
  updatePlayer();
  renderTracks();
  renderQueue();
});

audio.addEventListener("ended", () => {
  if (repeatMode === 2) {
    audio.currentTime = 0;
    audio.play().catch(() => showToast("Unable to replay this track."));
    return;
  }

  playNext();
});

audio.addEventListener("error", () => {
  if (currentTrackId !== null) {
    showToast("Audio could not load. Check your internet connection and try again.");
  }
});

// Initial setup
audio.volume = Number(elements.volume.value);
updateVolume();
updateActiveControls();
renderAll();
