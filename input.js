// input.js

(function() {
  const {
    canvas, car, PLAY_AREA_LEFT, PLAY_AREA_WIDTH,
    state
  } = window.state;

  function moveLeft() {
    car.x -= car.speed;
    if (car.x < PLAY_AREA_LEFT) car.x = PLAY_AREA_LEFT;
  }

  function moveRight() {
    car.x += car.speed;
    if (car.x + car.width > PLAY_AREA_LEFT + PLAY_AREA_WIDTH)
      car.x = PLAY_AREA_LEFT + PLAY_AREA_WIDTH - car.width;
  }

  function startGame() {
    if (!state.playerName) return;
    state.gameStarted = true;
    resetGame();
  }

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
    car.x = PLAY_AREA_LEFT + PLAY_AREA_WIDTH / 2 - car.width / 2;
  }

  // Keyboard Controls
  document.addEventListener("keydown", (e) => {
    if (!state.gameStarted && !state.gameOver && state.playerName.length < 12 && /^[a-zA-Z0-9 ]$/.test(e.key)) {
      state.playerName += e.key;
    } else if (!state.gameStarted && !state.gameOver && e.key === "Backspace") {
      state.playerName = state.playerName.slice(0, -1);
    } else if (!state.gameStarted && !state.gameOver && e.key === "Enter") {
      startGame();
    }

    if (["ArrowLeft", "a", "A"].includes(e.key)) moveLeft();
    if (["ArrowRight", "d", "D"].includes(e.key)) moveRight();

    if (state.gameOver && e.key === "Enter") {
      startGame();
    }
  });

  // Mouse drag (Desktop)
  let isDragging = false;
  canvas.addEventListener("mousedown", (e) => {
    if (state.gameOver) {
      startGame();
    } else {
      isDragging = true;
      car.x = e.clientX - car.width / 2;
    }
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDragging && state.gameStarted) {
      car.x = e.clientX - car.width / 2;
    }
  });

  canvas.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Touch drag (Mobile)
  canvas.addEventListener("touchstart", (e) => {
    if (state.gameOver) {
      startGame();
    } else {
      const touch = e.touches[0];
      car.x = touch.clientX - car.width / 2;
    }
  });

  canvas.addEventListener("touchmove", (e) => {
    if (state.gameStarted) {
      const touch = e.touches[0];
      car.x = touch.clientX - car.width / 2;
    }
  });

})();
