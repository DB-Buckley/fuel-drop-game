(function () {
  const canvas = window.state.canvas;
  const car = window.state.car;
  const PLAY_AREA_LEFT = window.state.PLAY_AREA_LEFT;
  const PLAY_AREA_WIDTH = window.state.PLAY_AREA_WIDTH;

  let isDragging = false;

  function clampCarPosition() {
    if (car.x < PLAY_AREA_LEFT) {
      car.x = PLAY_AREA_LEFT;
    } else if (car.x + car.width > PLAY_AREA_LEFT + PLAY_AREA_WIDTH) {
      car.x = PLAY_AREA_LEFT + PLAY_AREA_WIDTH - car.width;
    }
  }

  function moveLeft() {
    car.x -= car.speed;
    clampCarPosition();
  }

  function moveRight() {
    car.x += car.speed;
    clampCarPosition();
  }

  // Keyboard input
  document.addEventListener("keydown", (e) => {
    const state = window.state;

    if (!state.gameStarted && !state.gameOver && /^[a-zA-Z0-9 ]$/.test(e.key) && state.playerName.length < 12) {
      state.playerName += e.key;
    } else if (!state.gameStarted && !state.gameOver && e.key === "Backspace") {
      state.playerName = state.playerName.slice(0, -1);
    } else if (!state.gameStarted && !state.gameOver && e.key === "Enter" && state.playerName.length > 0) {
      window.startGame();
      // Hide mobile controls if any
      const mobileControls = document.getElementById('mobile-controls');
      if (mobileControls) mobileControls.style.display = 'none';
    }

    if (["ArrowLeft", "a", "A"].includes(e.key)) moveLeft();
    if (["ArrowRight", "d", "D"].includes(e.key)) moveRight();

    if (state.gameOver && e.key === "Enter") {
      window.resetGame();
      window.startGame();
    }

    // Pause/unpause keys
    if (["p", "P", "Escape"].includes(e.key) && state.gameStarted && !state.gameOver) {
      state.paused = !state.paused;
    }
  });

  // Mouse drag (desktop)
  canvas.addEventListener("mousedown", (e) => {
    const state = window.state;
    if (state.gameOver) {
      window.resetGame();
      window.startGame();
      // Hide mobile controls
      const mobileControls = document.getElementById('mobile-controls');
      if (mobileControls) mobileControls.style.display = 'none';
    } else {
      isDragging = true;
      car.x = e.clientX - car.width / 2;
      clampCarPosition();
    }
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDragging) {
      car.x = e.clientX - car.width / 2;
      clampCarPosition();
    }
  });

  canvas.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Touch drag (mobile)
  canvas.addEventListener("touchstart", (e) => {
    const state = window.state;
    if (state.gameOver) {
      window.resetGame();
      window.startGame();
      // Hide mobile controls
      const mobileControls = document.getElementById('mobile-controls');
      if (mobileControls) mobileControls.style.display = 'none';
    } else {
      isDragging = true;
      const touch = e.touches[0];
      car.x = touch.clientX - car.width / 2;
      clampCarPosition();
    }
  });

  canvas.addEventListener("touchmove", (e) => {
    if (isDragging) {
      const touch = e.touches[0];
      car.x = touch.clientX - car.width / 2;
      clampCarPosition();
    }
    e.preventDefault(); // Prevent scrolling while dragging
  });

  canvas.addEventListener("touchend", () => {
    isDragging = false;
  });

  // Click to restart game
  canvas.addEventListener("click", () => {
    const state = window.state;
    if (state.gameOver) {
      window.resetGame();
      window.startGame();
      // Hide mobile controls
      const mobileControls = document.getElementById('mobile-controls');
      if (mobileControls) mobileControls.style.display = 'none';
    }
  });

  // Mobile name input and start button logic
  (function () {
    const input = document.getElementById('mobile-player-name');
    const startBtn = document.getElementById('mobile-start-btn');

    if (input && startBtn) {
      // Sync input to state
      input.addEventListener('input', (e) => {
        window.state.playerName = e.target.value.slice(0, 12);
      });

      // Start game on button click
      startBtn.addEventListener('click', () => {
        if (window.state.playerName && window.state.playerName.trim().length > 0 && !window.state.gameStarted) {
          window.startGame();
          // Hide mobile controls after starting
          document.getElementById('mobile-controls').style.display = 'none';
        }
      });
    }
  })();
})();
