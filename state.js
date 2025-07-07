const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const PLAY_AREA_WIDTH = isMobile ? canvas.width * 0.95 : canvas.width * 0.6;
const PLAY_AREA_LEFT = (canvas.width - PLAY_AREA_WIDTH) / 2;
const PLAY_AREA_HEIGHT = canvas.height;

const state = {
  canvas,
  ctx,
  isMobile,

  PLAY_AREA_WIDTH,
  PLAY_AREA_LEFT,
  PLAY_AREA_HEIGHT,

  // Dynamic car size based on device
  car: (() => {
    const carWidth = isMobile ? PLAY_AREA_WIDTH * 0.34 : PLAY_AREA_WIDTH * 0.20;
    const carHeight = isMobile ? PLAY_AREA_WIDTH * 0.17 : PLAY_AREA_WIDTH * 0.10;
    const x = PLAY_AREA_LEFT + (PLAY_AREA_WIDTH - carWidth) / 2;
    const yOffset = isMobile ? 50 : 20; // Mobile: move up by 30px more
    const y = canvas.height - carHeight - yOffset;

    return {
      x,
      y,
      width: carWidth,
      height: carHeight,
      baseColor: "#F5A623",
      bonusColor: "#00CFFF",
      color: "#F5A623",
      speed: 7,
      dx: 0,
    };
  })(),

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

  // Parallax Scroll Tracking
  bgScroll: {
    layer1X: 0,
    layer2X: 0,
    layer3X: 0,
  },

  // Scroll Speeds (customizable)
  bgSpeed: {
    layer1: 0.8,   // front (road)
    layer2: 0.4,   // middle (trees)
    layer3: 0.15   // back (mountains)
  },

  // Preloaded images
  images: {
    car: null,
    fuel_gold: null,
    fuel_bonus: null,
    fuel_green: null,
    banner_bonus: null,
    banner_increase: null,
    banner_decrease: null,
    mzansiLogo: null,
    splash_desktop: null,
    splash_mobile: null,

    // Parallax: Desktop
    gbg_desktop_layer1: null,
    gbg_desktop_layer2: null,
    gbg_desktop_layer3: null,

    // Parallax: Mobile
    gbg_mobile_layer1: null,
    gbg_mobile_layer2: null,
    gbg_mobile_layer3: null,

    // Nighttime filters
    nt_filter_desktop: null,
    nt_filter_mobile: null,
  },

  // Night mode state for day/night cycle
  nightModeActive: false,
  nightCycleTimer: 0, // milliseconds counter
};

window.state = state;
