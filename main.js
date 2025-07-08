(function () {
  const s = window.state;

  function toggleMobileControls() {
    const controls = document.getElementById("mobile-controls");
    if (!controls) return;

    if (s.gameStarted && !s.gameOver) {
      controls.classList.add("hidden");
    } else {
      controls.classList.remove("hidden");
    }
  }

  function toggleReturnButton(show) {
    const btn = document.getElementById("return-start-screen");
    if (btn) {
      btn.style.display = show ? "block" : "none";
    }
  }

  function startGame() {
    s.gameStarted = true;
    s.gameOver = false;
    s.paused = false;
    s.score = 0;
    s.missedDrops = 0;
    s.bonusActive = false;
    s.drops = [];
    s.lastDropBonus = false;
    s.lastDropGreen = false;
    s.lastDropY = -50;
    s.lastSpawn = Date.now();
    s.dropSpeed = 2;
    s.spawnInterval = 1000;
    s.nextDifficultyThreshold = 300;
    s.fuelIncreases = 0;
    s.showBonusBanner = false;
    s.showFuelPriceBanner = false;
    s.showFuelDecreaseBanner = false;
    s.nightCycleTimer = 0;
    s.nightModeActive = false;

    toggleMobileControls();
    toggleReturnButton(false);
  }

  function resetGame() {
    s.gameStarted = false;
    s.gameOver = false;
    s.paused = false;
    s.playerName = "";

    toggleMobileControls();
    toggleReturnButton(false);
  }

  function mainLoop(timestamp) {
  if (!s.gameStarted) {
    window.renderStartScreen();
  } else if (s.gameOver) {
    window.renderGameOver();
    toggleMobileControls();
    toggleReturnButton(true);
  } else if (s.paused) {
    window.render();
    const ctx = s.ctx;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, s.canvas.width, s.canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Paused", s.canvas.width / 2, s.canvas.height / 2);
  } else {
    const now = Date.now();
    const deltaTime = now - (s.lastFrameTime || now);
    s.lastFrameTime = now;

    // Spawn drop if interval passed
    if (now - s.lastSpawn > s.spawnInterval) {
      window.spawnDrop();
      s.lastSpawn = now;
    }

    // === Update night filter alpha if fading ===
    if (s.nightFilterFadingIn) {
      s.nightFilterAlpha = Math.min(s.nightFilterAlpha + s.nightFilterFadeSpeed, s.nightFilterMaxAlpha);
      if (s.nightFilterAlpha >= s.nightFilterMaxAlpha) s.nightFilterFadingIn = false;
    } else if (s.nightFilterFadingOut) {
      s.nightFilterAlpha = Math.max(s.nightFilterAlpha - s.nightFilterFadeSpeed, 0);
      if (s.nightFilterAlpha <= 0) s.nightFilterFadingOut = false;
    }

    // === Toggle night mode every 45s ===
    s.nightCycleTimer += deltaTime;
    const cycleHalf = s.nightCycleDuration / 2;

    if (!s.nightModeActive && s.nightCycleTimer > cycleHalf) {
      s.nightModeActive = true;
      window.fadeInNightFilter();
    } else if (s.nightModeActive && s.nightCycleTimer > s.nightCycleDuration) {
      s.nightModeActive = false;
      window.fadeOutNightFilter();
      s.nightCycleTimer = 0;
    }

    // === Update game state & render ===
    window.update(deltaTime);
    window.render();
  }

  requestAnimationFrame(mainLoop);
}

  function loadAllImages(callback) {
    const imagePaths = {
      car: "assets/car.png",
      car_night: "assets/car_night.png",
      fuel_gold: "assets/fuel_gold.png",
      fuel_bonus: "assets/fuel_bonus.png",
      fuel_green: "assets/fuel_green.png",
      banner_bonus: "assets/banner_bonus.png",
      banner_increase: "assets/banner_increase.png",
      banner_decrease: "assets/banner_decrease.png",
      mzansiLogo: "assets/mzansi_logo.png",
      splash_desktop: "assets/splash_desktop.png",
      splash_mobile: "assets/splash_mobile.png",
      gbg_desktop_layer1: "assets/games_screen/gbg_desktop_layer1.png",
      gbg_desktop_layer2: "assets/games_screen/gbg_desktop_layer2.png",
      gbg_desktop_layer3: "assets/games_screen/gbg_desktop_layer3.png",
      gbg_mobile_layer1: "assets/games_screen/gbg_mobile_layer1.png",
      gbg_mobile_layer2: "assets/games_screen/gbg_mobile_layer2.png",
      gbg_mobile_layer3: "assets/games_screen/gbg_mobile_layer3.png",
      nt_filter_desktop: "assets/games_screen/nt_filter_desktop.png",
      nt_filter_mobile: "assets/games_screen/nt_filter_mobile.png"
    };

    let loadedCount = 0;
    const keys = Object.keys(imagePaths);
    const totalImages = keys.length;

    keys.forEach((key) => {
      const img = new Image();
      img.src = imagePaths[key];
      s.images[key] = img;

      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalImages) callback();
      };

      img.onerror = () => {
        console.warn(`Failed to load image: ${key}`);
        loadedCount++;
        if (loadedCount === totalImages) callback();
      };
    });
  }

  // Initial loading screen
  s.ctx.fillStyle = "#000";
  s.ctx.fillRect(0, 0, s.canvas.width, s.canvas.height);
  s.ctx.fillStyle = "#fff";
  s.ctx.font = "32px Arial";
  s.ctx.textAlign = "center";
  s.ctx.fillText("Loading...", s.canvas.width / 2, s.canvas.height / 2);

  loadAllImages(() => {
    resetGame();
    requestAnimationFrame(mainLoop);
  });

  // Expose globally
  window.startGame = startGame;
  window.resetGame = resetGame;
  window.mainLoop = mainLoop;

  // =============== INTERACTION HANDLING ==============

  const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);

  // Desktop only: Start on canvas click or Enter
  if (!isMobile) {
    s.canvas.addEventListener("click", () => {
      if (!s.gameStarted && !s.gameOver) {
        startGame();
      } else if (s.gameOver) {
        resetGame();
        startGame();
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        if (!s.gameStarted && !s.gameOver) {
          startGame();
        } else if (s.gameOver) {
          resetGame();
          startGame();
        }
      }
    });
  }

  // Mobile-only start button
  const mobileStartBtn = document.getElementById("mobile-start-btn");
  if (mobileStartBtn) {
    mobileStartBtn.addEventListener("click", () => {
      const nameInput = document.getElementById("mobile-player-name");
      if (nameInput?.value.trim()) {
        s.playerName = nameInput.value.trim().slice(0, 12);
        startGame();
      }
    });
  }

  // Return to Start Screen button (shown on Game Over)
  const returnBtn = document.getElementById("return-start-btn");
  if (returnBtn) {
    returnBtn.addEventListener("click", () => {
      resetGame();
    });
  }
})();
