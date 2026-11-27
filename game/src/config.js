// Gobble Run — tuning, stages and shared constants.
// One clear job: every number the game balances lives here, so the
// other files read like rules, not magic numbers.

export const VIEW_W = 1280;
export const VIEW_H = 720;
export const GROUND_Y = 600;
export const TURKEY_X = 300;
export const TURKEY_W = 92;
export const TURKEY_H = 84;
export const DUCK_H = 40;

// How far the turkey must run to slip out of the kitchen window.
export const ESCAPE_DISTANCE_M = 3600;
export const METERS_PER_PX = 1 / 20;

export const GRAVITY = 2600;
export const JUMP_VELOCITY = -880;
export const BASE_SPEED = 300;
export const MAX_SPEED = 470;
export const DASH_SPEED = 640;
export const DASH_TIME = 0.55;
export const DASH_COOLDOWN = 2.2;

export const MAX_LIVES = 3;
export const FARMER_GAP_START = 260;
export const FARMER_GAP_MAX = 260;
export const FARMER_GAP_HIT = 85;
export const FARMER_GAP_RECOVER = 14; // px per second while running clean
export const INVINCIBLE_TIME = 1.6;

export const CORN_SCORE = 10;
export const PIE_SCORE = 50;

// Three places to run through: the farmyard, the barn, the kitchen.
// Each stage has its own palette, speed and dangers.
export const STAGES = [
  {
    name: 'Farmyard',
    lengthM: 1200,
    speed: 300,
    skyTop: '#f7b267',
    skyBottom: '#f4845f',
    hillFar: '#c97b3d',
    hillNear: '#8a5a2b',
    ground: '#6b4423',
    groundTop: '#a4713a',
    obstacles: ['fence', 'hay', 'knife'],
    obstacleGap: [420, 760],
  },
  {
    name: 'Barn',
    lengthM: 1200,
    speed: 345,
    skyTop: '#e07a4e',
    skyBottom: '#b8452f',
    hillFar: '#7a3b26',
    hillNear: '#5a2c1e',
    ground: '#4a2c1a',
    groundTop: '#7d5233',
    obstacles: ['crate', 'hay', 'pitchfork', 'knife'],
    obstacleGap: [380, 700],
  },
  {
    name: 'Kitchen',
    lengthM: 1200,
    speed: 390,
    skyTop: '#8f5a3c',
    skyBottom: '#5d2f24',
    hillFar: '#4a241c',
    hillNear: '#38201a',
    ground: '#2e1a14',
    groundTop: '#6b4a35',
    obstacles: ['oven', 'knife', 'pot', 'crate'],
    obstacleGap: [360, 640],
  },
];

// Obstacle shapes: w/h in px, and how the turkey beats them.
export const OBSTACLES = {
  fence: { w: 46, h: 74, kind: 'jump', score: 5 },
  hay: { w: 96, h: 88, kind: 'jump', score: 5 },
  crate: { w: 84, h: 84, kind: 'jump', score: 5 },
  pitchfork: { w: 40, h: 108, kind: 'jump', score: 8 },
  oven: { w: 130, h: 138, kind: 'jump', score: 12 },
  knife: { w: 34, h: 150, kind: 'timing', score: 12 },
  pot: { w: 110, h: 64, kind: 'duck', score: 8 },
};

export function stageForDistance(distanceM) {
  let used = 0;
  for (let i = 0; i < STAGES.length; i += 1) {
    if (distanceM < used + STAGES[i].lengthM) return i;
    used += STAGES[i].lengthM;
  }
  return STAGES.length - 1;
}

export function stageProgress(distanceM) {
  const stage = stageForDistance(distanceM);
  let used = 0;
  for (let i = 0; i < stage; i += 1) used += STAGES[i].lengthM;
  return (distanceM - used) / STAGES[stage].lengthM;
}
