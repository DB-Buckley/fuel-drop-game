// state.js

const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let PLAY_AREA_WIDTH = isMobile ? canvas.width * 0.95 : canvas.width * 0.6;
let PLAY_AREA_LEFT = (canvas.width - PLAY_AREA_WIDTH) / 2;

const car = {
  x: PLAY_AREA_LEFT + PLAY_AREA_WIDTH / 2 - 30,
  y: canvas.height - 100,
  width: 60,
  height: 30,
  baseColor: "#F5A623",
  bonusColor: "#00CFFF",
  color: "#F5A623",
  speed: 7,
  dx: 0,
};

let drops = [];
let dropSpeed = 2;
let spawnInterval = 1500;
let lastSpawn = 0;
let lastDropY = -100;
let lastDropBonus = false;
let lastDropGreen = false;
let fuelIncreases = 0;

let score = 0;
let highScore = 0;
let missedDrops = 0;
const maxMisses = 10;
let gameOver = false;
let gameStarted = false;

let bonusActive = false;
let bonusTimer = 0;
const bonusDuration = 8000;
let showBonusBanner = false;

let showFuelPriceBanner = false;
let fuelPriceBannerTimer = 0;
const fuelPriceBannerDuration = 3000;

let showFuelDecreaseBanner = false;
let fuelDecreaseTimer = 0;
const fuelDecreaseBannerDuration = 2000;

let nextDifficultyThreshold = 300;

let playerName = "";
let leaderboard = JSON.parse(localStorage.getItem("mzansi_leaderboard") || "[]");

// Make variables accessible in other modules
window.state = {
  canvas, ctx, isMobile,
  PLAY_AREA_WIDTH, PLAY_AREA_LEFT,
  car, drops,
  dropSpeed, spawnInterval, lastSpawn, lastDropY, lastDropBonus, lastDropGreen,
  fuelIncreases, nextDifficultyThreshold,
  score, highScore, missedDrops, maxMisses,
  gameOver, gameStarted,
  bonusActive, bonusTimer, bonusDuration,
  showBonusBanner, showFuelPriceBanner, showFuelDecreaseBanner,
  fuelPriceBannerTimer, fuelPriceBannerDuration,
  fuelDecreaseTimer, fuelDecreaseBannerDuration,
  playerName, leaderboard,
  images: {} // Added this empty object for images
};
