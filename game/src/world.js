// Gobble Run — the running world: turkey physics, the chasing farmer,
// obstacles, corn and the three stages.
// One clear job: everything that moves, spawns and collides while a run
// is in play. Rendering lives in art.js, the state machine in game.js.

import {
  GRAVITY,
  JUMP_VELOCITY,
  BASE_SPEED,
  MAX_SPEED,
  DASH_SPEED,
  DASH_TIME,
  DASH_COOLDOWN,
  GROUND_Y,
  TURKEY_X,
  TURKEY_W,
  TURKEY_H,
  DUCK_H,
  ESCAPE_DISTANCE_M,
  METERS_PER_PX,
  MAX_LIVES,
  FARMER_GAP_START,
  FARMER_GAP_MAX,
  FARMER_GAP_HIT,
  FARMER_GAP_RECOVER,
  INVINCIBLE_TIME,
  CORN_SCORE,
  PIE_SCORE,
  STAGES,
  OBSTACLES,
  stageForDistance,
  stageProgress,
} from './config.js';
import { mulberry32, pick, range, rangeInt } from './random.js';

export class World {
  constructor(seed) {
    this.rng = mulberry32(seed);
    this.reset();
  }

  reset() {
    this.distancePx = 0;
    this.distanceM = 0;
    this.score = 0;
    this.corn = 0;
    this.pies = 0;
    this.lives = MAX_LIVES;
    this.farmerGap = FARMER_GAP_START;
    this.turkeyY = GROUND_Y;
    this.turkeyVy = 0;
    this.grounded = true;
    this.ducking = false;
    this.dashTime = 0;
    this.dashCooldown = 0;
    this.invincible = 0;
    this.cleanTime = 0;
    this.runPhase = 0;
    this.scrollPx = 0;
    this.time = 0;
    this.obstacles = [];
    this.pickups = [];
    this.nextSpawnPx = 700;
    this.nextCornPx = 500;
    this.cleared = new Set();
    this.over = null; // 'caught' | 'escaped' | null
    this.events = [];
  }

  get stage() {
    return stageForDistance(this.distanceM);
  }

  get speed() {
    const stage = STAGES[this.stage];
    const base = Math.min(stage.speed + this.distanceM * 0.012, MAX_SPEED);
    return this.dashTime > 0 ? DASH_SPEED : base;
  }

  get farmerClose() {
    return this.farmerGap < 110;
  }

  get farmerX() {
    // The farmer runs behind the turkey, closing in as the gap shrinks.
    return TURKEY_X - 130 - this.farmerGap;
  }

  spawnObstacle(px) {
    const stage = STAGES[this.stage];
    const type = pick(this.rng, stage.obstacles);
    const def = OBSTACLES[type];
    this.obstacles.push({
      id: this.obstacles.length,
      type,
      x: px,
      w: def.w,
      h: def.h,
      kind: def.kind,
      score: def.score,
      passed: false,
      swing: this.rng() * Math.PI * 2,
      swingSpeed: range(this.rng, 1.6, 2.4),
    });
  }

  spawnPickup(px, kind) {
    this.pickups.push({
      kind,
      x: px,
      y: kind === 'pie' ? GROUND_Y - 190 : GROUND_Y - range(this.rng, 90, 170),
      taken: false,
    });
  }

  update(dt, input, sfx) {
    this.time += dt;
    if (this.over) return;

    // Dash.
    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    if (this.dashTime > 0) this.dashTime -= dt;
    if (input.dashHit && this.dashCooldown <= 0 && this.grounded) {
      this.dashTime = DASH_TIME;
      this.dashCooldown = DASH_COOLDOWN;
      sfx.dash();
    }

    // Jump / duck.
    this.ducking = input.duckHeld && this.grounded;
    if (input.jumpHit && this.grounded && !this.ducking) {
      this.turkeyVy = JUMP_VELOCITY;
      this.grounded = false;
      sfx.jump();
    }
    this.turkeyVy += GRAVITY * dt;
    this.turkeyY += this.turkeyVy * dt;
    if (this.turkeyY >= GROUND_Y) {
      this.turkeyY = GROUND_Y;
      this.turkeyVy = 0;
      this.grounded = true;
    }

    // Forward motion.
    const step = this.speed * dt;
    this.distancePx += step;
    this.scrollPx += step;
    this.distanceM = this.distancePx * METERS_PER_PX;
    this.runPhase += dt * (this.speed / 34);

    // The farmer: a hit lets him close in; clean running buys space back.
    this.cleanTime += dt;
    if (this.invincible > 0) this.invincible -= dt;
    if (this.cleanTime > 2 && this.farmerGap < FARMER_GAP_MAX) {
      this.farmerGap = Math.min(FARMER_GAP_MAX, this.farmerGap + FARMER_GAP_RECOVER * dt);
    }
    if (this.farmerClose) sfx.startAlarm();
    else sfx.stopAlarm();

    // Spawn ahead of the screen.
    const ahead = this.distancePx + 1400;
    while (this.nextSpawnPx < ahead) {
      this.spawnObstacle(this.nextSpawnPx);
      const gap = range(this.rng, ...STAGES[this.stage].obstacleGap);
      this.nextSpawnPx += gap;
      // Corn trails between obstacles, sometimes a pie up high.
      if (this.rng() < 0.55) {
        const cx = this.nextSpawnPx - gap * range(this.rng, 0.35, 0.7);
        for (let i = 0; i < 3; i += 1) this.spawnPickup(cx + i * 44, 'corn');
      }
      if (this.rng() < 0.12) this.spawnPickup(this.nextSpawnPx - 160, 'pie');
    }

    // Move and cull.
    const leftEdge = this.distancePx - 300;
    this.obstacles = this.obstacles.filter((o) => o.x > leftEdge);
    this.pickups = this.pickups.filter((p) => p.x > leftEdge && !p.taken);

    // Collisions.
    const tTop = this.turkeyY - (this.ducking ? DUCK_H : TURKEY_H);
    const tBottom = this.turkeyY;
    const tLeft = TURKEY_X - TURKEY_W / 2 + 8;
    const tRight = TURKEY_X + TURKEY_W / 2 - 8;
    for (const o of this.obstacles) {
      const screenX = o.x - this.distancePx;
      const oLeft = screenX - o.w / 2;
      const oRight = screenX + o.w / 2;
      const oTop = GROUND_Y - o.h;
      // The swinging knife only bites while its blade hangs near vertical.
      let hitTop = oTop;
      if (o.type === 'knife') {
        const swing = Math.sin(this.time * o.swingSpeed + o.swing);
        if (Math.abs(swing) > 0.4) continue; // blade swung aside: safe to pass
        hitTop = GROUND_Y - 150;
      }
      if (o.type === 'pot') {
        // The pot hangs low: duck under it.
        if (this.ducking) continue;
        hitTop = GROUND_Y - 130;
      }
      const overlap =
        tRight > oLeft && tLeft < oRight && tBottom > hitTop + 6 && tTop < GROUND_Y;
      if (overlap && this.invincible <= 0) this.hitObstacle(o, sfx);
      if (!o.passed && oRight < tLeft) {
        o.passed = true;
        this.score += o.score;
        this.events.push({ type: 'dodge', score: o.score });
      }
    }
    for (const p of this.pickups) {
      const screenX = p.x - this.distancePx;
      if (Math.abs(screenX - TURKEY_X) < 52 && Math.abs(p.y - (tTop + 30)) < 58) {
        p.taken = true;
        if (p.kind === 'corn') {
          this.corn += 1;
          this.score += CORN_SCORE;
          sfx.corn();
        } else {
          this.pies += 1;
          this.score += PIE_SCORE;
          this.lives = Math.min(MAX_LIVES, this.lives + 1);
          sfx.pie();
        }
        this.events.push({ type: p.kind, score: p.kind === 'corn' ? CORN_SCORE : PIE_SCORE });
      }
    }

    // Score ticks up with every metre run.
    this.score += step * METERS_PER_PX;

    // Escape: the kitchen window at the end of stage three.
    if (this.distanceM >= ESCAPE_DISTANCE_M) {
      this.over = 'escaped';
      sfx.stopAlarm();
      sfx.escaped();
    }
    // Caught: the farmer's hand on your tail feathers.
    if (this.farmerGap <= 0) {
      this.over = 'caught';
      sfx.stopAlarm();
      sfx.caught();
    }
  }

  hitObstacle(obstacle, sfx) {
    this.lives -= 1;
    this.farmerGap -= FARMER_GAP_HIT;
    this.invincible = INVINCIBLE_TIME;
    this.cleanTime = 0;
    sfx.thud();
    sfx.gobble();
    this.events.push({ type: 'hit', obstacle: obstacle.type, lives: this.lives });
    if (this.lives <= 0) {
      this.over = 'caught';
      sfx.stopAlarm();
      sfx.caught();
    }
  }

  // A frozen mid-run moment for a screenshot: obstacles, corn, farmer.
  stageRun(seed, stageIndex, farmerGap) {
    this.reset();
    this.rng = mulberry32(seed);
    this.distanceM = stageIndex * 1200 + 320;
    this.distancePx = this.distanceM / METERS_PER_PX;
    this.scrollPx = this.distancePx;
    this.score = Math.floor(this.distanceM) + 240;
    this.corn = 14;
    this.farmerGap = farmerGap;
    this.time = 6.5;
    this.runPhase = 2.2;
    this.turkeyY = GROUND_Y;
    // A little scene: fence ahead, corn trail, a knife swinging, a pie.
    const base = this.distancePx;
    this.obstacles = [
      { id: 0, type: 'fence', x: base + 620, w: 46, h: 74, kind: 'jump', score: 5, passed: false, swing: 0, swingSpeed: 2 },
      { id: 1, type: 'knife', x: base + 880, w: 34, h: 150, kind: 'timing', score: 12, passed: false, swing: 1.2, swingSpeed: 2.1 },
      { id: 2, type: stageIndex === 2 ? 'oven' : 'hay', x: base + 1120, w: stageIndex === 2 ? 130 : 96, h: stageIndex === 2 ? 138 : 88, kind: 'jump', score: 12, passed: false, swing: 0, swingSpeed: 2 },
    ];
    this.pickups = [
      { kind: 'corn', x: base + 480, y: GROUND_Y - 120, taken: false },
      { kind: 'corn', x: base + 524, y: GROUND_Y - 120, taken: false },
      { kind: 'corn', x: base + 568, y: GROUND_Y - 120, taken: false },
      { kind: 'pie', x: base + 760, y: GROUND_Y - 190, taken: false },
    ];
    this.nextSpawnPx = base + 1400;
  }
}

export { stageProgress };
