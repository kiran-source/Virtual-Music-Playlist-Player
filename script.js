// 🎵 Doubly Linked List Implementation
class SongNode {
  constructor(name, file) {
    this.name = name;
    this.file = file;
    this.prev = null;
    this.next = null;
  }
}

class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.current = null;
  }

  addSong(name, file) {
    const newNode = new SongNode(name, file);
    if (!this.head) {
      this.head = this.tail = this.current = newNode;
    } else {
      this.tail.next = newNode;
      newNode.prev = this.tail;
      this.tail = newNode;
    }
  }

  deleteSongByName(name) {
    let node = this.head;
    while (node) {
      if (node.name === name) {
        if (node.prev) node.prev.next = node.next;
        else this.head = node.next;
        if (node.next) node.next.prev = node.prev;
        else this.tail = node.prev;
        if (this.current === node) this.current = node.next || node.prev || null;
        break;
      }
      node = node.next;
    }
  }

  toArray() {
    const result = [];
    let node = this.head;
    while (node) {
      result.push(node);
      node = node.next;
    }
    return result;
  }
}

// 📂 Playlist Setup
let playlists = {
  Default: new DoublyLinkedList(),
  Bollywood: new DoublyLinkedList(),
  "Lo-fi": new DoublyLinkedList(),
  Workout: new DoublyLinkedList()
};

// 🎶 Preloaded Playlist Songs
playlists["Bollywood"].addSong("Tum Hi Ho", null);
playlists["Bollywood"].addSong("Kal Ho Naa Ho", null);
playlists["Lo-fi"].addSong("Chill Vibes", null);
playlists["Lo-fi"].addSong("Dreamscape", null);
playlists["Workout"].addSong("Beast Mode", null);
playlists["Workout"].addSong("Pump It Up", null);

let currentPlaylist = "Default";
const audioPlayer = document.getElementById("audio-player");
const playlistSelect = document.getElementById("playlist-select");

function updatePlaylistDisplay() {
  const playlistElement = document.getElementById("playlist");
  playlistElement.innerHTML = "";
  const songs = playlists[currentPlaylist].toArray();
  songs.forEach((song) => {
    const li = document.createElement("li");
    const nameSpan = document.createElement("span");
    nameSpan.textContent = song.name;
    nameSpan.onclick = () => playSelectedSongByNode(song);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      playlists[currentPlaylist].deleteSongByName(song.name);
      updatePlaylistDisplay();
    };

    li.appendChild(nameSpan);
    li.appendChild(deleteBtn);
    playlistElement.appendChild(li);
  });
}

function updatePlaylistSelect() {
  playlistSelect.innerHTML = "";
  for (let name in playlists) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    playlistSelect.appendChild(option);
  }
  playlistSelect.value = currentPlaylist;
}

function createPlaylist() {
  const name = prompt("Enter playlist name:");
  if (name && !playlists[name]) {
    playlists[name] = new DoublyLinkedList();
    currentPlaylist = name;
    updatePlaylistSelect();
    updatePlaylistDisplay();
  }
}

function switchPlaylist() {
  currentPlaylist = playlistSelect.value;
  updatePlaylistDisplay();
}

function uploadSongs() {
  const files = document.getElementById("song-files").files;
  for (let file of files) {
    playlists[currentPlaylist].addSong(file.name, file);
  }
  updatePlaylistDisplay();
}

function playSelectedSongByNode(node) {
  playlists[currentPlaylist].current = node;
  if (!node.file) {
    alert("This song is just a placeholder. Upload files to play.");
    return;
  }
  const url = URL.createObjectURL(node.file);
  audioPlayer.src = url;
  audioPlayer.play();
  document.getElementById("now-playing").textContent = "Now Playing: " + node.name;
}

function playSong() {
  audioPlayer.play();
}

function nextSong() {
  const node = playlists[currentPlaylist].current;
  if (node && node.next) playSelectedSongByNode(node.next);
}

function previousSong() {
  const node = playlists[currentPlaylist].current;
  if (node && node.prev) playSelectedSongByNode(node.prev);
}

function shuffleSong() {
  const nodes = playlists[currentPlaylist].toArray();
  const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
  playSelectedSongByNode(randomNode);
}

//
// 🔊 Pulse Visualizer
//
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let audioCtx, analyser, source, dataArray;

function setupVisualizer() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  source = audioCtx.createMediaElementSource(audioPlayer);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  analyser.fftSize = 1024;
  dataArray = new Uint8Array(analyser.fftSize);
  drawWaveform();
}

function drawWaveform() {
  requestAnimationFrame(drawWaveform);
  analyser.getByteTimeDomainData(dataArray);
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#00ffff";
  ctx.beginPath();

  const sliceWidth = canvas.width / dataArray.length;
  let x = 0;

  for (let i = 0; i < dataArray.length; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * canvas.height) / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
}

audioPlayer.addEventListener("play", () => {
  if (!audioCtx) setupVisualizer();
});

audioPlayer.addEventListener("pause", () => {
  clearCanvas();
});

audioPlayer.addEventListener("ended", () => {
  clearCanvas();
});

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

//
// 🌈 Theme Toggle
//
const themes = [
  { background: '#0d1b2a', text: '#f8f9fa', accent: '#1e6091' },
  { background: '#ffedd5', text: '#4b2e2e', accent: '#ff5722' },
  { background: '#e0f7fa', text: '#004d40', accent: '#009688' }
];
let currentTheme = 0;

document.getElementById("toggle-theme").addEventListener("click", () => {
  currentTheme = (currentTheme + 1) % themes.length;
  const root = document.documentElement;
  root.style.setProperty('--bg-color', themes[currentTheme].background);
  root.style.setProperty('--text-color', themes[currentTheme].text);
  root.style.setProperty('--accent-color', themes[currentTheme].accent);
});

updatePlaylistSelect();
updatePlaylistDisplay();
