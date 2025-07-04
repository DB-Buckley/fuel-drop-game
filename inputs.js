(function () {
  const state = window.state;

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const mobileControls = document.getElementById('mobileControls');
  const playerNameInput = document.getElementById('playerNameInput');
  const startButton = document.getElementById('startButton');

  if (isMobile) {
    // Show input and button on mobile
    mobileControls.style.display = 'block';

    playerNameInput.value = state.playerName || '';

    playerNameInput.addEventListener('input', () => {
      const val = playerNameInput.value.trim();
      state.playerName = val;
      startButton.disabled = val.length === 0;
    });

    startButton.addEventListener('click', () => {
      if (state.playerName.trim().length > 0) {
        mobileControls.style.display = 'none';
        window.startGame();
      }
    });

    playerNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!startButton.disabled) {
          startButton.click();
        }
      }
    });
  }

  // Car movement and inputs for desktop remain unchanged below

  let isDragging = false;

  function clampCarPosition() {
    const car = state.car;
    const PLAY_AREA_LEFT = state.PLAY_AREA_LEFT;
    const PLAY_AREA_WIDTH = state.PLAY_AREA_WIDTH;
    if (car.x < PLAY_AREA_LEFT) {
      car.x = PLAY_AREA_LEFT;
    } else if (car.x + car.width > PLAY_AREA_LEFT + PLAY_AREA_WIDTH) {
      car.x = PLAY_AREA_LEFT + PLAY_AREA_WIDTH - car.width;
    }
  }

  function moveLeft() {
    const car = state.car;
    car.x -= car.speed;
    clampCarPosition();
  }

  function moveRight() {
    const car = state.car;
    car.x += car.speed;
    clampCarPosition();
  }

  if (!isMobile) {
    document.addEventListener("keydown", (e) => {
      if (!state.gameStarted && !state.gameOver && /^[a-zA-Z0-9 ]$/.test(e.key) && state.playerName.length < 12) {
        state.playerName += e.key;
      } else if (!state.gameStarted && !state.gameOver && e.key === "Backspace") {
        state.playerName = state.playerName.slice(0, -1);
      } else if (!state.gameStarted && !state.gameOver && e.key === "Enter" && state.playerName.length > 0) {
        window.startGame();
      }

      if (["ArrowLeft", "a", "A"].includes(e.key)) moveLeft();
      if (["ArrowRight", "d", "D"].includes(e.key)) moveRight();

      if (state.gameOver && e.key === "Enter") {
        window.resetGame();
        window.startGame();
      }
    });

    const canvas = state.canvas;

    // Mouse drag (desktop)
    canvas.addEventListener("mousedown", (e) => {
      if (state.gameOver) {
        window.resetGame();
        window.startGame();
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
  }

  // Touch drag (mobile)
  if (isMobile) {
    const canvas = state.canvas;

    canvas.addEventListener("touchstart", (e) => {
      if (state.gameOver) {
        window.resetGame();
        window.startGame();
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
      e.preventDefault();
    });

    canvas.addEventListener("touchend", () => {
      isDragging = false;
    });

    // Click to restart game on mobile canvas
    canvas.addEventListener("click", () => {
      if (state.gameOver) {
        window.resetGame();
        mobileControls.style.display = 'block'; // Show input/button on reset
      }
    });
  }

  // When game resets, show the controls again on mobile
  window.resetGame = (function (originalResetGame) {
    return function () {
      originalResetGame();
      if (isMobile) {
        mobileControls.style.display = 'block';
        playerNameInput.value = '';
        startButton.disabled = true;
      }
    };
  })(window.resetGame);

  // Clear playerName on desktop start to re-enable keyboard typing
  const origStartGame = window.startGame;
  window.startGame = function () {
    if (!isMobile) {
      state.playerName = '';
    }
    origStartGame();
  };
})();
