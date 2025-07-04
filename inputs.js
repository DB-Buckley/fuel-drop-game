const {
  canvas, car, PLAY_AREA_LEFT, PLAY_AREA_WIDTH,
  gameStarted, gameOver, playerName
} = window.state;

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
    resetGame();
    startGame();
  }
});

// Mouse drag (desktop)
canvas.addEventListener("mousedown", (e) => {
  if (state.gameOver) {
    resetGame();
    startGame();
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
  if (state.gameOver) {
    resetGame();
    startGame();
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
  if (state.gameOver) {
    resetGame();
    startGame();
  }
});
