
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const photo = document.getElementById('photo');
const filterSelect = document.getElementById('filter');
const captionInput = document.getElementById('caption');
const gallery = document.getElementById('gallery');
const download = document.getElementById('download');
const shareWA = document.getElementById('share-wa');
const shareIG = document.getElementById('share-ig');

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
}
setupCamera();

filterSelect.addEventListener('change', () => {
  video.style.filter = filterSelect.value;
});

// Drag & drop emoji
const draggables = document.querySelectorAll('.draggable');
draggables.forEach(el => {
  el.addEventListener('dragstart', dragStart);
});

function dragStart(e) {
  const style = window.getComputedStyle(e.target, null);
  const str = (parseInt(style.getPropertyValue('left'), 10) - e.clientX) + ',' +
               (parseInt(style.getPropertyValue('top'), 10) - e.clientY);
  e.dataTransfer.setData('Text', str);
}

document.getElementById('camera-wrapper').addEventListener('dragover', e => e.preventDefault());

document.getElementById('camera-wrapper').addEventListener('drop', e => {
  const offset = e.dataTransfer.getData('Text').split(',');
  const dragEl = document.elementFromPoint(e.clientX, e.clientY);
  dragEl.style.left = (e.clientX + parseInt(offset[0], 10)) + 'px';
  dragEl.style.top = (e.clientY + parseInt(offset[1], 10)) + 'px';
  e.preventDefault();
});

function capturePhoto() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.filter = filterSelect.value;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const caption = captionInput.value;
  if (caption) {
    ctx.font = "40px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(caption, 20, canvas.height - 40);
  }

  const data = canvas.toDataURL('image/png');
  const timestamp = new Date().getTime();
  photo.src = data;
  photo.style.display = 'block';
  download.href = data;
  download.download = `photo_${timestamp}.png`;

  // WhatsApp share
  const blob = data;
  const waUrl = `https://wa.me/?text=Check out my photo!`;
  shareWA.href = waUrl;

  // Instagram info
  shareIG.href = "https://www.instagram.com/";

  const img = document.createElement('img');
  img.src = data;
  img.alt = "Captured";
  gallery.appendChild(img);
}



let videoElement = document.querySelector("video");
let currentStream;
let usingFrontCamera = true;

async function getCameraStream() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  const constraints = {
    video: {
      facingMode: usingFrontCamera ? "user" : "environment"
    },
    audio: false
  };

  try {
    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = currentStream;
  } catch (err) {
    console.error("Gagal mendapatkan kamera:", err);
  }
}

document.getElementById("switchCameraBtn")?.addEventListener("click", () => {
  usingFrontCamera = !usingFrontCamera;
  getCameraStream();
});

window.addEventListener("DOMContentLoaded", getCameraStream);


function flashScreen() {
  const flash = document.getElementById('flash');
  flash.style.opacity = '1';
  setTimeout(() => {
    flash.style.opacity = '0';
  }, 100);
}

function startCountdownAndCapture(callback) {
  const countdownEl = document.getElementById('countdown');
  const timer = parseInt(document.getElementById('timerSelect').value, 10);
  if (timer > 0) {
    let count = timer;
    countdownEl.style.display = 'block';
    countdownEl.textContent = count;
    const countdownInterval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(countdownInterval);
        countdownEl.style.display = 'none';
        flashScreen();
        callback();
      } else {
        countdownEl.textContent = count;
      }
    }, 1000);
  } else {
    flashScreen();
    callback();
  }
}


// Gesture detection dengan handtrack.js
let handModel = null;
const gestureVideo = document.querySelector("video");

const gestureParams = {
  flipHorizontal: true,
  maxNumBoxes: 1,
  iouThreshold: 0.5,
  scoreThreshold: 0.7,
};

handTrack.load(gestureParams).then(model => {
  handModel = model;
  runGestureDetection();
});

function runGestureDetection() {
  if (!handModel) return;
  handModel.detect(gestureVideo).then(predictions => {
    if (predictions.length > 0) {
      const hand = predictions[0];
      if (hand.label === "open") {
        console.log("Gesture Tangan Terbuka Terdeteksi");
        startCountdownAndCapture(takePhoto);
      }
    }
    requestAnimationFrame(runGestureDetection);
  });
}


// Terapkan filter ke video
document.getElementById("filterSelect").addEventListener("change", (e) => {
  const video = document.querySelector("video");
  video.style.filter = e.target.value;
});

// Tambahkan emoji ke canvas saat ambil foto
function takePhoto() {
  const video = document.querySelector("video");
  const canvas = document.createElement("canvas");
  const emoji = document.getElementById("emojiSelect").value;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext("2d");
  context.filter = video.style.filter || "none";
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  if (emoji) {
    context.font = "80px serif";
    context.fillText(emoji, canvas.width - 100, 100);
  }

  const imageDataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = imageDataUrl;
  link.download = "photo.png";
  link.click();
}
