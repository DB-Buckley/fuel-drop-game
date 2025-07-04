// main.js

// Use state variables from global state object
const {
  canvas, ctx, PLAY_AREA_WIDTH, PLAY_AREA_LEFT,
  car, drops, maxMisses,
  isMobile,
  playerName, leaderboard
} = state;

let images = {};
let imagesLoaded = false;

const imagePaths = {
  car: 'assets/car.png',
  fuel_gold: 'assets/fuel_gold.png',
  fuel_bonus: 'assets/fuel_bonus.png',
  fuel_green: 'assets/fuel_green.png',
  banner_bonus: 'assets/banner_bonus.png',
  banner_increase: 'assets/banner_increase.png',
  banner_decrease: 'assets/banner_decrease.png',
};

function loadImages() {
  let loadedCount = 0;
  const total = Object.keys(imagePaths).length;

  for (let key in imagePaths) {
    const img = new Image();
    img.src = imagePaths[key];
    img.onload = () => {
      loadedCount++;
      if (loadedCount === total) {
        imagesLoaded = true;
        requestAnimationFrame(mainLoop);
      }
    };
    images[key] = img;
  }
}

// Drawing functions (simplified here, use your existing ones or expand as needed)
function drawCar() {
  ctx.drawImage(images.car, car.x, car.y, car.width, car.height);
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (state.bonusActive) {
    ctx.fillStyle = "#1c63ff"; // updated bonus background color as requested
  } else {
    ctx.fillStyle = "#111";
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!isMobile) {
    ctx.strokeStyle = state.bonusActive ? "#333" : "#666";
    ctx.lineWidth = 4;
    ctx.strokeRect(PLAY_AREA_LEFT, 0, PLAY_AREA_WIDTH, canvas.height);
  }
}

// Game reset function
function resetGame() {
  state.drops = [];
  state.score = 0;
  state.missedDrops = 0;
  state.dropSpeed = 2;
  state.spawnInterval = 1500;
  state.lastSpawn = 0;
  state.lastDropY = -100;
  state.lastDropBonus = false;
  state.lastDropGreen = false;
  state.gameOver = false;
  state.bonusActive = false;
  state.showBonusBanner = false;
  state.showFuelPriceBanner = false;
  state.showFuelDecreaseBanner = false;
  state.fuelPriceBannerTimer = 0;
  state.fuelDecreaseTimer = 0;
  state.bonusTimer = 0;
  state.fuelIncreases = 0;
  state.nextDifficultyThreshold = 300;
  state.car.x = PLAY_AREA_LEFT + PLAY_AREA_WIDTH / 2 - state.car.width / 2;
}

function startGame() {
  state.gameStarted = true;
  resetGame();
  if (state.score > state.highScore) state.highScore = state.score;
}

// Input handling
function setupInputs() {
  // Keyboard input
  document.addEventListener("keydown", (e) => {
    if (!state.gameStarted && !state.gameOver && /^[a-zA-Z0-9 ]$/.test(e.key) && state.playerName.length < 12) {
      state.playerName += e.key;
    } else if (!state.gameStarted && !state.gameOver && e.key === "Backspace") {
      state.playerName = state.playerName.slice(0, -1);
    } else if (!state.gameStarted && !state.gameOver && e.key === "Enter" && state.playerName.length > 0) {
      startGame();
    }

    if (["ArrowLeft", "a", "A"].includes(e.key)) moveLeft();
    if (["ArrowRight", "d", "D"].includes(e.key)) moveRight();

    if (state.gameOver && e.key === "Enter") {
      startGame();
    }
  });

  // Mouse and touch drag for car
  let isDragging = false;

  canvas.addEventListener("mousedown", (e) => {
    if (state.gameOver) {
      startGame();
    } else {
      isDragging = true;
      state.car.x = e.clientX - state.car.width / 2;
      clampCarPosition();
    }
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDragging) {
      state.car.x = e.clientX - state.car.width / 2;
      clampCarPosition();
    }
  });

  canvas.addEventListener("mouseup", () => {
    isDragging = false;
  });

  canvas.addEventListener("touchstart", (e) => {
    if (state.gameOver) {
      startGame();
    } else {
      isDragging = true;
      const touch = e.touches[0];
      state.car.x = touch.clientX - state.car.width / 2;
      clampCarPosition();
    }
  });

  canvas.addEventListener("touchmove", (e) => {
    if (isDragging) {
      const touch = e.touches[0];
      state.car.x = touch.clientX - state.car.width / 2;
      clampCarPosition();
    }
    e.preventDefault(); // Prevent scrolling while dragging
  });

  canvas.addEventListener("touchend", () => {
    isDragging = false;
  });

  // Click canvas to restart if game over
  canvas.addEventListener("click", () => {
    if (state.gameOver) {
      resetGame();
      startGame();
    }
  });
}

function clampCarPosition() {
  if (state.car.x < PLAY_AREA_LEFT) {
    state.car.x = PLAY_AREA_LEFT;
  } else if (state.car.x + state.car.width > PLAY_AREA_LEFT + PLAY_AREA_WIDTH) {
    state.car.x = PLAY_AREA_LEFT + PLAY_AREA_WIDTH - state.car.width;
  }
}

function moveLeft() {
  state.car.x -= state.car.speed;
  clampCarPosition();
}

function moveRight() {
  state.car.x += state.car.speed;
  clampCarPosition();
}

// mainLoop - stub for now, fill with your existing logic
function mainLoop() {
  if (!state.gameStarted) {
    // Draw start screen
    // Your drawStartScreen() function here
  } else if (state.gameOver) {
    // Draw game over screen
    // Your drawGameOver() function here
  } else {
    // Game running logic
    // updateDrops(), spawnDrop(), draw everything, etc.
  }

  requestAnimationFrame(mainLoop);
}

// Initialization
loadImages();
setupInputs();
