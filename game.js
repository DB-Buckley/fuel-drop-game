const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// PLAYER (Car)
let car = {
  x: canvas.width / 2 - 30,
  y: canvas.height - 100,
  width: 60,
  height: 30,
  color: "#F5A623",
  speed: 7,
  dx: 0
};

// DROPS
let drops = [];
let dropSpeed = 2;
let spawnInterval = 1500;
let lastSpawn = 0;

// SCORE
let score = 0;

// HELPERS
function randomX() {
  return Math.random() * (canvas.width - 20);
}

function spawnDrop() {
  drops.push({
    x: randomX(),
    y: -20,
    radius: 10,
    caught: false
  });
}

function drawCar() {
  ctx.fillStyle = car.color;
  ctx.fillRect(car.x, car.y, car.width, car.height);
}

function drawDrop(drop) {
  ctx.beginPath();
  ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
  ctx.fillStyle = "gold";
  ctx.fill();
  ctx.closePath();
}

function drawScore() {
  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 20, 30);
}

function updateDrops(delta) {
  for (let drop of drops) {
    drop.y += dropSpeed;

    // Collision with car
    if (
      drop.y + drop.radius > car.y &&
      drop.x > car.x &&
      drop.x < car.x + car.width &&
      drop.y < car.y + car.height
    ) {
      drop.caught = true;
      score += 2;
    }
  }

  // Remove caught or missed drops
  drops = drops.filter(d => d.y < canvas.height && !d.caught);

  // Spawn new drops
  if (Date.now() - lastSpawn > spawnInterval) {
    spawnDrop();
    lastSpawn = Date.now();
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function update() {
  car.x += car.dx;
  if (car.x < 0) car.x = 0;
  if (car.x + car.width > canvas.width) car.x = canvas.width - car.width;

  clearCanvas();
  drawCar();
  updateDrops();
  for (let drop of drops) drawDrop(drop);
  drawScore();

  requestAnimationFrame(update);
}

// CONTROLS
function moveLeft() { car.dx = -car.speed; }
function moveRight() { car.dx = car.speed; }
function stopMove() { car.dx = 0; }

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") moveLeft();
  if (e.key === "ArrowRight") moveRight();
});
document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") stopMove();
});

// Touch support
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

spawnDrop(); // Start with one drop
update();
