// main.js

window.addEventListener('load', () => {
  const state = window.state;

  // Load assets
  const imagePaths = {
    car: "assets/car.png",
    fuel_gold: "assets/fuel_gold.png",
    fuel_bonus: "assets/fuel_bonus.png",
    fuel_green: "assets/fuel_green.png",
    banner_bonus: "assets/banner_bonus.png",
    banner_increase: "assets/banner_increase.png",
    banner_decrease: "assets/banner_decrease.png"
  };

  let loaded = 0;
  const total = Object.keys(imagePaths).length;

  for (let key in imagePaths) {
    const img = new Image();
    img.src = imagePaths[key];
    img.onload = () => {
      loaded++;
      if (loaded === total) {
        state.imagesLoaded = true;
        requestAnimationFrame(mainLoop);
      }
    };
    state.images[key] = img;
  }

  // Keyboard input
  document.addEventListener("keydown", (e) => {
    if (!state.gameStarted && !state.gameOver && /^[a-zA-Z0-9 ]$/.test(e.key) && state.playerName.length < 12) {
      state.playerName += e.key;
    } else if (!state.gameStarted && !state.gameOver && e.key === "Backspace") {
      state.playerName = state.playerName.slice(0, -1);
    } else if (!state.gameStarted && !state.gameOver && e.key === "Enter" && state.playerName.length > 0) {
      startGame();
    }

    if (["ArrowLeft", "a", "A"].includes(e.key)) moveCar(-state.car.speed);
    if (["ArrowRight", "d", "D"].includes(e.key)) moveCar(state.car.speed);

    if (state.gameOver && e.key === "Enter") {
      resetGame();
      startGame();
    }
  });

  // Mouse/touch movement
  let dragging = false;

  state.canvas.addEventListener("mousedown", (e) => {
    dragging = true;
    moveCarTo(e.clientX);
  });

  state.canvas.addEventListener("mousemove", (e) => {
    if (dragging) moveCarTo(e.clientX);
  });

  document.addEventListener("mouseup", () => dragging = false);

  state.canvas.addEventListener("touchstart", (e) => {
    dragging = true;
    moveCarTo(e.touches[0].clientX);
  });

  state.canvas.addEventListener("touchmove", (e) => {
    moveCarTo(e.touches[0].clientX);
  });

  document.addEventListener("touchend", () => dragging = false);

  state.canvas.addEventListener("click", () => {
    if (state.gameOver) {
      resetGame();
      startGame();
    }
  });

  function moveCarTo(clientX) {
    const x = clientX - state.car.width / 2;
    const maxX = state.PLAY_AREA_LEFT + state.PLAY_AREA_WIDTH - state.car.width;
    state.car.x = Math.max(state.PLAY_AREA_LEFT, Math.min(maxX, x));
  }

  function moveCar(offset) {
    state.car.x += offset;
    const maxX = state.PLAY_AREA_LEFT + state.PLAY_AREA_WIDTH - state.car.width;
    if (state.car.x < state.PLAY_AREA_LEFT) state.car.x = state.PLAY_AREA_LEFT;
    if (state.car.x > maxX) state.car.x = maxX;
  }

  function startGame() {
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
    state.bonusActive = false;
    state.bonusTimer = 0;
    state.showBonusBanner = false;
    state.showFuelPriceBanner = false;
    state.showFuelDecreaseBanner = false;
    state.fuelIncreases = 0;
    state.nextDifficultyThreshold = 300;
    state.gameOver = false;

    state.car.x = state.PLAY_AREA_LEFT + state.PLAY_AREA_WIDTH / 2 - state.car.width / 2;
  }

  function mainLoop(timestamp) {
    const state = window.state;

    if (!state.imagesLoaded) return;

    const now = Date.now();

    if (!state.gameStarted) {
      window.renderStartScreen();
      requestAnimationFrame(mainLoop);
      return;
    }

    if (state.gameOver) {
      window.renderGameOver();
      requestAnimationFrame(mainLoop);
      return;
    }

    if (!state.lastSpawn || now - state.lastSpawn > state.spawnInterval) {
      window.spawnDrop();
      state.lastSpawn = now;
    }

    window.updateDrops(16);
    window.updateBonus(16);
    window.updateDifficulty();

    window.render();

    requestAnimationFrame(mainLoop);
  }
});
