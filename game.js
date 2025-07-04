const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let car = {
  x: canvas.width / 2,
  y: canvas.height - 100,
  width: 60,
  height: 30,
  color: "#F5A623",
  speed: 7,
  dx: 0
};

function drawCar() {
  ctx.fillStyle = car.color;
  ctx.fillRect(car.x, car.y, car.width, car.height);
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function update() {
  car.x += car.dx;

  // Prevent going off-screen
  if (car.x < 0) car.x = 0;
  if (car.x + car.width > canvas.width) car.x = canvas.width - car.width;

  clearCanvas();
  drawCar();

  requestAnimationFrame(update);
}

function moveLeft() {
  car.dx = -car.speed;
}
function moveRight() {
  car.dx = car.speed;
}
function stopMove() {
  car.dx = 0;
}

// Keyboard controls
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") moveLeft();
  if (e.key === "ArrowRight") moveRight();
});
document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") stopMove();
});

// Touch controls
let touchStartX = null;
canvas.addEventListener("touchstart", e => {
  touchStartX = e.touches[0].clientX;
});
canvas.addEventListener("touchmove", e => {
  const touchX = e.touches[0].clientX;
  if (touchStartX !== null) {
    if (touchX < touchStartX) moveLeft();
    else moveRight();
  }
});
canvas.addEventListener("touchend", () => {
  stopMove();
  touchStartX = null;
});

update();
