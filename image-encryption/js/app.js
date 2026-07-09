"use strict";

const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
let mouseX = 0;
let mouseY = 0;
let ringX = 0;
let ringY = 0;

const particlesContainer = document.getElementById('particles');
const colors = ['#00f5ff', '#aa00ff', '#ff00aa', '#00ff88', '#0066ff', '#ffdd00'];

const fileInput = document.getElementById('fileInput');
const uploadZone = document.getElementById('uploadZone');
const browseBtn = document.getElementById('browseBtn');
const previewContainer = document.getElementById('previewContainer');
const originalCanvas = document.getElementById('originalCanvas');
const resultCanvas = document.getElementById('resultCanvas');
const imageInfo = document.getElementById('imageInfo');
const resultInfo = document.getElementById('resultInfo');
const resultLabel = document.getElementById('resultLabel');

const encryptModeBtn = document.getElementById('encryptModeBtn');
const decryptModeBtn = document.getElementById('decryptModeBtn');
const genKeyBtn = document.getElementById('genKeyBtn');
const encKey = document.getElementById('encKey');
const keyStrengthFill = document.getElementById('keyStrengthFill');
const keyStrengthLabel = document.getElementById('keyStrengthLabel');

const processBtn = document.getElementById('processBtn');
const processBtnText = document.getElementById('processBtnText');
const progressWrap = document.getElementById('progressWrap');
const progressBar = document.getElementById('progressBar');
const progressLabel = document.getElementById('progressLabel');
const terminalBody = document.getElementById('terminalBody');
const clearLogBtn = document.getElementById('clearLogBtn');
const downloadSection = document.getElementById('downloadSection');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const successTitle = document.getElementById('successTitle');
const successDesc = document.getElementById('successDesc');
const compareSection = document.getElementById('compareSection');
const compareWrap = document.getElementById('compareWrap');
const compareCanvas = document.getElementById('compareCanvas');
const compareSlider = document.getElementById('compareSlider');

let originalImageData = null;
let processedImageData = null;
let originalFile = null;
let currentMode = 'encrypt';
let isProcessing = false;
let sliderPos = 50;
let isDraggingSlider = false;

function animateCursor() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top = ringY + 'px';
  requestAnimationFrame(animateCursor);
}

document.addEventListener('mousemove', (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
  cursorDot.style.left = `${mouseX}px`;
  cursorDot.style.top = `${mouseY}px`;
});

animateCursor();

document.addEventListener('mousedown', () => cursorDot.classList.add('clicked'));
document.addEventListener('mouseup', () => cursorDot.classList.remove('clicked'));

document.querySelectorAll('button, label, .upload-zone, a, .method-box, .upload-browse').forEach((el) => {
  el.addEventListener('mouseenter', () => cursorRing.classList.add('expand'));
  el.addEventListener('mouseleave', () => cursorRing.classList.remove('expand'));
});

for (let i = 0; i < 60; i += 1) {
  const particle = document.createElement('div');
  particle.className = 'particle';
  const size = Math.random() * 3 + 1;
  const left = Math.random() * 100;
  const top = Math.random() * 100;
  const color = colors[Math.floor(Math.random() * colors.length)];
  particle.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    left: ${left}%;
    top: ${top}%;
    background: ${color};
    box-shadow: 0 0 12px ${color};
    animation-duration: ${Math.random() * 12 + 8}s;
    animation-delay: ${Math.random() * 10}s;
  `;
  particlesContainer.appendChild(particle);
}

const cubeFaces = document.querySelectorAll('.cube-face');
function animateCubeFaces() {
  cubeFaces.forEach((face) => {
    face.innerHTML = '';
    for (let i = 0; i < 25; i += 1) {
      const cell = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      cell.style.background = `${color}`;
      cell.style.opacity = `${Math.random() * 0.4 + 0.1}`;
      face.appendChild(cell);
    }
  });
}

animateCubeFaces();
setInterval(() => {
  document.querySelectorAll('.cube-face > div').forEach((cell) => {
    const color = colors[Math.floor(Math.random() * colors.length)];
    cell.style.background = color;
    cell.style.opacity = `${Math.random() * 0.4 + 0.08}`;
  });
}, 1400);

const orbitSelectors = ['.orbit-1', '.orbit-2', '.orbit-3'];
orbitSelectors.forEach((selector, index) => {
  const orbit = document.querySelector(selector);
  const dot = document.createElement('div');
  dot.style.cssText = `
    position: absolute;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${colors[index % colors.length]};
    box-shadow: 0 0 18px ${colors[index % colors.length]};
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `;
  orbit.appendChild(dot);
});

const sections = document.querySelectorAll('.panel, .preview-panel, .terminal-panel, .hiw-section, .hiw-card');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });
sections.forEach((section) => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(28px)';
  section.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  observer.observe(section);
});

function log(text, type = '') {
  const line = document.createElement('div');
  line.className = 't-line';
  line.innerHTML = `<span class="t-prompt">❯</span> <span class="t-text ${type}">${text}</span>`;
  terminalBody.appendChild(line);
  terminalBody.scrollTop = terminalBody.scrollHeight;
  if (terminalBody.children.length > 45) {
    terminalBody.removeChild(terminalBody.firstChild);
  }
}

function clearLog() {
  terminalBody.innerHTML = '';
}

function updateMethodSelection() {
  document.querySelectorAll('.method-box').forEach((box) => {
    const input = box.querySelector('input');
    box.classList.toggle('active', input.checked);
  });
}

updateMethodSelection();
document.querySelectorAll('.method-box input').forEach((input) => {
  input.addEventListener('change', updateMethodSelection);
});

encryptModeBtn.addEventListener('click', () => setMode('encrypt'));
decryptModeBtn.addEventListener('click', () => setMode('decrypt'));

function setMode(mode) {
  currentMode = mode;
  encryptModeBtn.classList.toggle('active', mode === 'encrypt');
  decryptModeBtn.classList.toggle('active', mode === 'decrypt');
  processBtnText.textContent = mode === 'encrypt' ? 'ENCRYPT IMAGE' : 'DECRYPT IMAGE';
  resultLabel.textContent = mode === 'encrypt' ? 'ENCRYPTED' : 'DECRYPTED';
  log(`Mode switched to: ${mode.toUpperCase()}`, 't-info');
}

encKey.addEventListener('input', updateKeyStrength);

genKeyBtn.addEventListener('click', () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
  let key = '';
  for (let i = 0; i < 24; i += 1) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  encKey.value = key;
  updateKeyStrength();
  log(`Random key generated: ${key.slice(0, 10)}...`, 't-info');
});

function updateKeyStrength() {
  const key = encKey.value;
  if (!key) {
    keyStrengthFill.style.width = '0';
    keyStrengthFill.style.background = 'var(--green)';
    keyStrengthLabel.textContent = 'No key entered';
    keyStrengthLabel.style.color = 'var(--text-dim)';
    return;
  }

  let score = 0;
  score += Math.min(20, key.length * 2);
  if (key.length >= 8) score += 10;
  if (key.length >= 16) score += 10;
  if (/[A-Z]/.test(key)) score += 10;
  if (/[0-9]/.test(key)) score += 15;
  if (/[^a-zA-Z0-9]/.test(key)) score += 15;

  score = Math.min(100, score);
  keyStrengthFill.style.width = `${score}%`;

  if (score < 30) {
    keyStrengthFill.style.background = 'var(--red)';
    keyStrengthLabel.textContent = 'Weak key';
    keyStrengthLabel.style.color = 'var(--red)';
  } else if (score < 60) {
    keyStrengthFill.style.background = 'var(--yellow)';
    keyStrengthLabel.textContent = 'Fair key';
    keyStrengthLabel.style.color = 'var(--yellow)';
  } else if (score < 85) {
    keyStrengthFill.style.background = 'var(--cyan)';
    keyStrengthLabel.textContent = 'Strong key';
    keyStrengthLabel.style.color = 'var(--cyan)';
  } else {
    keyStrengthFill.style.background = 'var(--green)';
    keyStrengthLabel.textContent = 'Very strong key';
    keyStrengthLabel.style.color = 'var(--green)';
  }
}

function deriveKeyBytes(keyStr, length) {
  const bytes = new Uint8Array(length);
  let seed = 5381;
  for (let i = 0; i < keyStr.length; i += 1) {
    seed = ((seed << 5) + seed) ^ keyStr.charCodeAt(i);
    seed >>>= 0;
  }
  for (let i = 0; i < length; i += 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    bytes[i] = seed & 0xff;
  }
  return bytes;
}

function xorCipher(data, keyStr) {
  const bytes = deriveKeyBytes(keyStr, 256);
  const result = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i += 4) {
    result[i] = data[i] ^ bytes[i % bytes.length];
    result[i + 1] = data[i + 1] ^ bytes[(i + 1) % bytes.length];
    result[i + 2] = data[i + 2] ^ bytes[(i + 2) % bytes.length];
    result[i + 3] = data[i + 3];
  }
  return result;
}

function rotateByte(value, amount) {
  return ((value << amount) | (value >> (8 - amount))) & 0xff;
}

function bitShift(data, keyStr, decrypt) {
  const bytes = deriveKeyBytes(keyStr, 128);
  const result = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const shift = (bytes[(i / 4) % bytes.length] % 6) + 1;
    for (let channel = 0; channel < 3; channel += 1) {
      const value = data[i + channel];
      result[i + channel] = decrypt ? rotateByte(value, 8 - shift) : rotateByte(value, shift);
    }
    result[i + 3] = data[i + 3];
  }
  return result;
}

function channelSwap(data, keyStr, decrypt) {
  const perms = [
    [0, 1, 2],
    [2, 1, 0],
    [1, 2, 0],
    [0, 2, 1],
    [2, 0, 1],
    [1, 0, 2],
  ];
  const mode = deriveKeyBytes(keyStr, 1)[0] % perms.length;
  const perm = perms[mode];
  const inv = [0, 0, 0];
  inv[perm[0]] = 0;
  inv[perm[1]] = 1;
  inv[perm[2]] = 2;

  const mapping = decrypt ? inv : perm;
  const result = new Uint8ClampedArray(data.length);

  for (let i = 0; i < data.length; i += 4) {
    result[i + mapping[0]] = data[i];
    result[i + mapping[1]] = data[i + 1];
    result[i + mapping[2]] = data[i + 2];
    result[i + 3] = data[i + 3];
  }
  return result;
}

function rowShuffle(data, width, height, keyStr, decrypt) {
  const rowSize = width * 4;
  const rows = Array.from({ length: height }, (_, idx) => idx);
  const bytes = deriveKeyBytes(keyStr, height);

  for (let i = height - 1; i > 0; i -= 1) {
    const j = bytes[i] % (i + 1);
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }

  const map = new Array(height);
  rows.forEach((row, index) => { map[row] = index; });
  const useMap = decrypt ? map : rows;
  const result = new Uint8ClampedArray(data.length);

  for (let row = 0; row < height; row += 1) {
    const source = decrypt ? useMap[row] : row;
    const target = decrypt ? row : useMap[row];
    result.set(data.subarray(source * rowSize, source * rowSize + rowSize), target * rowSize);
  }
  return result;
}

function addNoise(data, keyStr) {
  const bytes = deriveKeyBytes(keyStr, data.length);
  const result = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i += 4) {
    result[i] = Math.min(255, data[i] + (bytes[i % bytes.length] & 31));
    result[i + 1] = Math.min(255, data[i + 1] + (bytes[(i + 1) % bytes.length] & 31));
    result[i + 2] = Math.min(255, data[i + 2] + (bytes[(i + 2) % bytes.length] & 31));
    result[i + 3] = data[i + 3];
  }
  return result;
}

function removeNoise(data, keyStr) {
  const bytes = deriveKeyBytes(keyStr, data.length);
  const result = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i += 4) {
    result[i] = Math.max(0, data[i] - (bytes[i % bytes.length] & 31));
    result[i + 1] = Math.max(0, data[i + 1] - (bytes[(i + 1) % bytes.length] & 31));
    result[i + 2] = Math.max(0, data[i + 2] - (bytes[(i + 2) % bytes.length] & 31));
    result[i + 3] = data[i + 3];
  }
  return result;
}

function invertChannels(data) {
  const result = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i += 4) {
    result[i] = 255 - data[i];
    result[i + 1] = 255 - data[i + 1];
    result[i + 2] = 255 - data[i + 2];
    result[i + 3] = data[i + 3];
  }
  return result;
}

function loadImage(file) {
  if (!file.type.startsWith('image/')) {
    log('Error: Invalid file type. Use PNG, JPG, WEBP or BMP.', 't-error');
    return;
  }
  originalFile = file;
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      originalCanvas.width = img.width;
      originalCanvas.height = img.height;
      const ctx = originalCanvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      originalImageData = ctx.getImageData(0, 0, img.width, img.height);

      resultCanvas.width = img.width;
      resultCanvas.height = img.height;
      resultCanvas.getContext('2d').clearRect(0, 0, resultCanvas.width, resultCanvas.height);

      imageInfo.textContent = `${img.width} × ${img.height}px · ${(file.size / 1024).toFixed(1)} KB`;
      resultInfo.textContent = 'Ready for processing';
      previewContainer.classList.remove('invisible');
      downloadSection.classList.add('invisible');
      compareSection.classList.add('invisible');

      clearLog();
      log(`Image loaded: ${file.name}`, 't-success');
      log(`Dimensions: ${img.width} × ${img.height}px`);
      log(`Size: ${(file.size / 1024).toFixed(1)} KB`);
      log(`Ready to ${currentMode}. Enter your key and click process.`, 't-info');
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

browseBtn.addEventListener('click', () => fileInput.click());
uploadZone.addEventListener('click', (event) => {
  if (!event.target.classList.contains('upload-browse')) {
    fileInput.click();
  }
});

uploadZone.addEventListener('dragover', (event) => {
  event.preventDefault();
  uploadZone.classList.add('drag-over');
});

uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', (event) => {
  event.preventDefault();
  uploadZone.classList.remove('drag-over');
  if (event.dataTransfer.files.length) {
    loadImage(event.dataTransfer.files[0]);
  }
});

fileInput.addEventListener('change', (event) => {
  if (event.target.files.length) {
    loadImage(event.target.files[0]);
  }
});

processBtn.addEventListener('click', () => {
  if (isProcessing) return;
  if (!originalImageData) {
    log('Error: No image loaded. Upload a file first.', 't-error');
    return;
  }
  const key = encKey.value.trim();
  if (!key) {
    log('Error: Enter an encryption key first.', 't-error');
    encKey.focus();
    return;
  }
  runEncryption();
});

async function runEncryption() {
  isProcessing = true;
  processBtn.disabled = true;
  progressWrap.style.display = 'block';
  progressBar.style.width = '0%';
  progressLabel.textContent = 'Initializing engine...';

  const key = encKey.value.trim();
  const method = document.querySelector('input[name="method"]:checked').value;
  const useNoise = document.getElementById('noiseOpt').checked;
  const useInvert = document.getElementById('invertOpt').checked;
  const useShuffle = document.getElementById('rowShuffleOpt').checked;
  const decrypt = currentMode === 'decrypt';

  clearLog();
  log(`Initializing ${currentMode.toUpperCase()} engine...`, 't-info');
  await tick();

  let pixels = new Uint8ClampedArray(originalImageData.data);
  const width = originalImageData.width;
  const height = originalImageData.height;

  try {
    if (decrypt) {
      setProgress(14, 'Reversing row shuffle...');
      if (useShuffle) {
        pixels = rowShuffle(pixels, width, height, key, true);
        log('→ Row shuffle reversed');
      }
      await sleep(120);

      setProgress(28, 'Removing noise layer...');
      if (useNoise) {
        pixels = removeNoise(pixels, key);
        log('→ Noise layer removed');
      }
      await sleep(120);

      setProgress(44, 'Reverting inversion...');
      if (useInvert) {
        pixels = invertChannels(pixels);
        log('→ Channel inversion reversed');
      }
      await sleep(120);

      setProgress(62, 'Applying reverse cipher...');
      if (method === 'xor') {
        pixels = xorCipher(pixels, key);
        log('→ XOR cipher reversed');
      } else if (method === 'shift') {
        pixels = bitShift(pixels, key, true);
        log('→ Bit shift reversed');
      } else if (method === 'swap') {
        pixels = channelSwap(pixels, key, true);
        log('→ Channel swap reversed');
      } else {
        pixels = xorCipher(pixels, key);
        pixels = bitShift(pixels, key, true);
        pixels = channelSwap(pixels, key, true);
        log('→ Combo cipher reversed');
      }
      await sleep(150);
    } else {
      setProgress(18, 'Applying cipher...');
      if (method === 'xor') {
        pixels = xorCipher(pixels, key);
        log('→ XOR cipher applied');
      } else if (method === 'shift') {
        pixels = bitShift(pixels, key, false);
        log('→ Bit shift applied');
      } else if (method === 'swap') {
        pixels = channelSwap(pixels, key, false);
        log('→ Channel swap applied');
      } else {
        pixels = channelSwap(pixels, key, false);
        pixels = bitShift(pixels, key, false);
        pixels = xorCipher(pixels, key);
        log('→ Combo cipher applied');
      }
      await sleep(150);

      setProgress(42, 'Applying inversion...');
      if (useInvert) {
        pixels = invertChannels(pixels);
        log('→ Channel inversion applied');
      }
      await sleep(120);

      setProgress(60, 'Adding noise layer...');
      if (useNoise) {
        pixels = addNoise(pixels, key);
        log('→ Noise layer added');
      }
      await sleep(120);

      setProgress(78, 'Shuffling rows...');
      if (useShuffle) {
        pixels = rowShuffle(pixels, width, height, key, false);
        log('→ Row shuffle applied');
      }
      await sleep(120);
    }

    setProgress(90, 'Rendering output...');
    await sleep(120);
    const ctx = resultCanvas.getContext('2d');
    resultCanvas.width = width;
    resultCanvas.height = height;
    const imageData = new ImageData(pixels, width, height);
    ctx.putImageData(imageData, 0, 0);
    processedImageData = imageData;

    setProgress(100, 'Complete!');
    await sleep(160);

    const kb = Math.round((pixels.length / 1024) * 0.7);
    resultInfo.textContent = `${width} × ${height}px · ~${kb} KB`;
    successTitle.textContent = currentMode === 'encrypt' ? 'Encryption Complete!' : 'Decryption Complete!';
    successDesc.textContent = `Your image has been successfully ${currentMode}ed using ${method.toUpperCase()}.`;

    downloadSection.classList.remove('invisible');
    compareSection.classList.remove('invisible');
    buildCompare(originalImageData, processedImageData);
    compareSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    log('');
    log(`✓ ${currentMode.toUpperCase()} COMPLETED`, 't-success');
    log(`Output ready: ${width}×${height}px`, 't-success');
  } catch (error) {
    log(`Error: ${error.message}`, 't-error');
    console.error(error);
  }

  progressWrap.style.display = 'none';
  processBtn.disabled = false;
  isProcessing = false;
}

function setProgress(percent, label) {
  progressBar.style.width = `${percent}%`;
  progressLabel.textContent = label;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function tick() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

downloadBtn.addEventListener('click', () => {
  if (!processedImageData) return;
  const canvas = document.createElement('canvas');
  canvas.width = processedImageData.width;
  canvas.height = processedImageData.height;
  canvas.getContext('2d').putImageData(processedImageData, 0, 0);
  const link = document.createElement('a');
  link.download = `cipherpixel_${currentMode}_${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  log(`File downloaded: ${link.download}`, 't-success');
});

resetBtn.addEventListener('click', () => {
  originalImageData = null;
  processedImageData = null;
  originalFile = null;
  fileInput.value = '';
  previewContainer.classList.add('invisible');
  downloadSection.classList.add('invisible');
  compareSection.classList.add('invisible');
  encKey.value = '';
  updateKeyStrength();
  clearLog();
  log('System reset. Ready for a new image.', 't-info');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

function buildCompare(origData, procData) {
  const width = origData.width;
  const height = origData.height;
  const scale = Math.min(780 / width, 340 / height, 1);
  const displayWidth = Math.round(width * scale);
  const displayHeight = Math.round(height * scale);

  compareCanvas.width = displayWidth;
  compareCanvas.height = displayHeight;

  const originalCopy = document.createElement('canvas');
  originalCopy.width = width;
  originalCopy.height = height;
  originalCopy.getContext('2d').putImageData(origData, 0, 0);

  const processedCopy = document.createElement('canvas');
  processedCopy.width = width;
  processedCopy.height = height;
  processedCopy.getContext('2d').putImageData(procData, 0, 0);

  compareWrap._orig = originalCopy;
  compareWrap._proc = processedCopy;
  compareWrap._displayWidth = displayWidth;
  compareWrap._displayHeight = displayHeight;

  sliderPos = 50;
  drawCompare();
}

function drawCompare() {
  if (!compareWrap._orig) return;
  const ctx = compareCanvas.getContext('2d');
  const drawW = compareWrap._displayWidth;
  const drawH = compareWrap._displayHeight;
  const split = Math.round((sliderPos / 100) * drawW);

  ctx.clearRect(0, 0, drawW, drawH);
  ctx.drawImage(compareWrap._orig, 0, 0, drawW, drawH);
  ctx.drawImage(compareWrap._proc, split, 0, drawW - split, drawH, split, 0, drawW - split, drawH);

  ctx.font = '700 12px Orbitron, monospace';
  ctx.fillStyle = 'rgba(0,245,255,0.92)';
  ctx.fillText('ORIGINAL', 16, 22);
  ctx.fillStyle = 'rgba(255,136,254,0.92)';
  const label = currentMode === 'encrypt' ? 'ENCRYPTED' : 'DECRYPTED';
  ctx.fillText(label, split + 16, 22);

  compareSlider.style.left = `${sliderPos}%`;
}

compareWrap.addEventListener('mousedown', () => {
  isDraggingSlider = true;
});
document.addEventListener('mouseup', () => {
  isDraggingSlider = false;
});
document.addEventListener('mousemove', (event) => {
  if (!isDraggingSlider) return;
  const rect = compareCanvas.getBoundingClientRect();
  sliderPos = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
  drawCompare();
});

compareWrap.addEventListener('touchstart', () => { isDraggingSlider = true; });
document.addEventListener('touchend', () => { isDraggingSlider = false; });
document.addEventListener('touchmove', (event) => {
  if (!isDraggingSlider || !event.touches.length) return;
  const rect = compareCanvas.getBoundingClientRect();
  const touch = event.touches[0];
  sliderPos = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
  drawCompare();
});

clearLogBtn.addEventListener('click', clearLog);

log('CipherPixel v1.0 initialized', 't-success');
log('Upload an image to begin encryption');
