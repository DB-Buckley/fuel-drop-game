// state.js

const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Update play area dimensions on resize
  window.state.PLAY_AREA_WIDTH = isMobile ? canvas.width * 0.95 : canvas.width * 0.6;
  window.state.PLAY_AREA_LEFT = (canvas.width - window.state.PLAY_AREA_WIDTH) / 2;

  // Reposition car to stay centered horizontally and near the bottom
  window.state.car.x = window.state.PLAY_AREA_LEFT + window.state.PLAY_AREA_WIDTH / 2 - window.state.car.width / 2;
  window.state.car.y = canvas.height - 100;
}
resizeCanvas(); // Initial call

window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas);

const PLAY_AREA_WIDTH = isMobile ? canvas.width * 0.95 : canvas.width * 0.6;
const PLAY_AREA_LEFT = (canvas.width - PLAY_AREA_WIDTH) / 2;

const state = {
  canvas,
  ctx,
  isMobile,

  PLAY_AREA_WIDTH,
  PLAY_AREA_LEFT,

  car: {
    x: PLAY_AREA_LEFT + PLAY_AREA_WIDTH / 2 - 75, // centered with 150 width
    y: canvas.height - 100,
    width: 150,
    height: 70,
    baseColor: "#F5A623",
    bonusColor: "#00CFFF",
    color: "#F5A623",
    speed: 7,
    dx: 0,
  },

  drops: [],
  dropSpeed: 2,
  spawnInterval: 1500,
  lastSpawn: 0,
  lastDropY: -100,
  lastDropBonus: false,
  lastDropGreen: false,
  fuelIncreases: 0,

  score: 0,
  highScore: 0,
  missedDrops: 0,
  maxMisses: 10,
  gameOver: false,
  gameStarted: false,

  bonusActive: false,
  bonusTimer: 0,
  bonusDuration: 8000,
  showBonusBanner: false,

  showFuelPriceBanner: false,
  fuelPriceBannerTimer: 0,
  fuelPriceBannerDuration: 3000,

  showFuelDecreaseBanner: false,
  fuelDecreaseTimer: 0,
  fuelDecreaseBannerDuration: 2000,

  nextDifficultyThreshold: 300,

  playerName: "",
  leaderboard: JSON.parse(localStorage.getItem("mzansi_leaderboard") || "[]"),
};

window.state = state; // Expose globally
