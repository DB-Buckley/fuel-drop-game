// Mzansi Fuel Drop - Updated with bonus logic, adaptive play area, game over retry, high score
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);

// Play area logic
let PLAY_AREA_WIDTH = isMobile ? canvas.width * 0.95 : canvas.width * 0.6;
let PLAY_AREA_LEFT = (canvas.width - PLAY_AREA_WIDTH) / 2;

let car = {
  x: PLAY_AREA_LEFT + PLAY_AREA_WIDTH / 2 - 30,
  y: canvas.height - 100,
  width: 60,
  height: 30,
  baseColor: "#F5A623",
  bonusColor: "#00CFFF",
  color: "#F5A623",
  speed: 7,
  dx: 0
};

let drops = [];
let dropSpeed = 2;
let spawnInterval = 1500;
let lastSpawn = 0;

let score = 0;
let highScore = 0;
let missedDrops = 0;
const maxMisses = 10;
let gameOver = false;

let bonusActive = false;
let bonusTimer = 0;
const bonusDuration = 15000; // 15 seconds

function randomDropX() {
  return PLAY_AREA_LEFT + Math.random() * (PLAY_AREA_WIDTH - 20);
}

function spawnDrop() {
  const isBonus = !bonusActive && Math.random() < 0.1; // 10% chance
  drops.push({
    x: randomDropX(),
    y: -20,
    radius: 10,
    caught: false,
    bonus: isBonus
  });
}

function drawCar() {
  ctx.fillStyle = car.color;
  ctx.fillRect(car.x, car.y, car.width, car.height);
}

function drawDrop(drop) {
  ctx.beginPath();
  ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
  ctx.fillStyle = drop.bonus ? "#00CFFF" : "gold";
  ctx.fill();
  ctx.closePath();
}

function drawScore() {
  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 20, 30);
}

function drawMisses() {
  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText(`Missed: ${missedDrops}/${maxMisses}`, 20, 60);
}

function drawHighScore() {
  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText(`High Score: ${highScore}`, canvas.width - 180, 30);
}

function drawPlayAreaFrame() {
  if (!isMobile) {
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 2;
    ctx.strokeRect(PLAY_AREA_LEFT, 0, PLAY_AREA_WIDTH, canvas.height);
  }
}

function drawGameOver() {
  ctx.fillStyle = "#fff";
  ctx.font = "36px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 40);
  ctx.font = "24px Arial";
  ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2);
  ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 30);
  ctx.fillText("Tap to Retry", canvas.width / 2, canvas.height / 2 + 70);
}

function updateDrops() {
  for (let drop of drops) {
    drop.y += dropSpeed;

    if (
      drop.y + drop.radius > car.y &&
      drop.x > car.x &&
      drop.x < car.x + car.width &&
      drop.y < car.y + car.height
    ) {
      drop.caught = true;
      if (drop.bonus) {
        bonusActive = true;
        bonusTimer = Date.now();
        car.color = car.bonusColor;
      }
      score += bonusActive ? 5 * 5 : 5;
    }

    if (drop.y > canvas.height && !drop.caught) {
      missedDrops++;
      drop.caught = true;
      if (missedDrops >= maxMisses) gameOver = true;
    }
  }

  drops = drops.filter(d => !d.caught);

  if (!gameOver && Date.now() - lastSpawn > spawnInterval) {
    spawnDrop();
    lastSpawn = Date.now();
  }

  if (bonusActive && Date.now() - bonusTimer > bonusDuration) {
    bonusActive = false;
    car.color = car.baseColor;
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = bonusActive ? "#e0f7ff" : "#333";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function update() {
  car.x += car.dx;
  if (car.x < PLAY_AREA_LEFT) car.x = PLAY_AREA_LEFT;
  if (car.x + car.width > PLAY_AREA_LEFT + PLAY_AREA_WIDTH)
    car.x = PLAY_AREA_LEFT + PLAY_AREA_WIDTH - car.width;

  clearCanvas();
  drawPlayAreaFrame();
  drawCar();
  updateDrops();
  for (let drop of drops) drawDrop(drop);
  drawScore();
  drawHighScore();
  drawMisses();

  if (gameOver) {
    if (score > highScore) highScore = score;
    drawGameOver();
    return;
  }

  requestAnimationFrame(update);
}

function resetGame() {
  score = 0;
  missedDrops = 0;
  drops = [];
  car.color = car.baseColor;
  gameOver = false;
  bonusActive = false;
  spawnDrop();
  update();
}

// Controls
function moveLeft() { car.dx = -car.speed; }
function moveRight() { car.dx = car.speed; }
function stopMove() { car.dx = 0; }

document.addEventListener("keydown", e => {
  if (["ArrowLeft", "a", "A"].includes(e.key)) moveLeft();
  if (["ArrowRight", "d", "D"].includes(e.key)) moveRight();
});
document.addEventListener("keyup", e => {
  if (["ArrowLeft", "ArrowRight", "a", "A", "d", "D"].includes(e.key)) stopMove();
});

// Touch & Mouse
let isDragging = false;
canvas.addEventListener("touchstart", e => {
  if (gameOver) return resetGame();
  const x = e.touches[0].clientX;
  car.x = x - car.width / 2;
});
canvas.addEventListener("touchmove", e => {
  const x = e.touches[0].clientX;
  car.x = x - car.width / 2;
});
canvas.addEventListener("mousedown", e => {
  if (gameOver) return resetGame();
  isDragging = true;
  car.x = e.clientX - car.width / 2;
});
canvas.addEventListener("mousemove", e => {
  if (isDragging) car.x = e.clientX - car.width / 2;
});
canvas.addEventListener("mouseup", () => { isDragging = false; stopMove(); });

spawnDrop();
update();
