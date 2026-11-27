// Gobble Run — the game itself: states, the loop, the HUD and the screens.
// One clear job: title -> playing -> caught/escaped, and everything the
// player sees on top of the world (score, distance, lives, farmer bar).

import {
  VIEW_W,
  VIEW_H,
  GROUND_Y,
  TURKEY_X,
  TURKEY_W,
  TURKEY_H,
  DUCK_H,
  ESCAPE_DISTANCE_M,
  MAX_LIVES,
  STAGES,
  OBSTACLES,
  stageForDistance,
  stageProgress,
} from './config.js';
import { World } from './world.js';
import { SoundFX } from './audio.js';
import { Input } from './input.js';
import {
  drawTurkey,
  drawFarmer,
  drawFence,
  drawHay,
  drawCrate,
  drawPitchforkHazard,
  drawOven,
  drawKnife,
  drawPot,
  drawCorn,
  drawPie,
  drawBackground,
  drawStageDressing,
} from './art.js';

export class Game {
  constructor(canvas, seed) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.seed = seed;
    this.world = new World(seed);
    this.sfx = new SoundFX();
    this.input = new Input();
    this.input.attach(canvas);
    this.state = 'title'; // title | playing | paused | caught | escaped
    this.best = 0;
    this.lastTime = 0;
    this.floaters = []; // +10 popups
    this.shotMode = null;
    this.shotReady = false;
  }

  start() {
    const params = new URLSearchParams(window.location.search);
    const shot = params.get('shot');
    const seed = Number(params.get('seed') || 7);
    if (shot) {
      this.seed = seed;
      this.stageShot(shot, seed);
      this.render(0);
      window.__shotReady = true;
      this.shotReady = true;
      return;
    }
    this.lastTime = performance.now();
    const loop = (now) => {
      const dt = Math.min((now - this.lastTime) / 1000, 0.05);
      this.lastTime = now;
      this.tick(dt);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  stageShot(name, seed) {
    // Deterministic scenes for the screenshots: real renders of the game.
    this.shotMode = name;
    if (name === 'title') {
      this.state = 'title';
      this.world.reset();
      this.world.stageRun(seed, 0, 200);
    } else if (name === 'farm') {
      this.state = 'playing';
      this.world.stageRun(seed, 0, 120); // farmer close enough to see
    } else if (name === 'kitchen') {
      this.state = 'playing';
      this.world.stageRun(seed, 2, 70);
      this.world.lives = 1;
      this.world.score = 2980;
    } else if (name === 'escaped') {
      this.state = 'escaped';
      this.world.stageRun(seed, 2, 240);
      this.world.distanceM = ESCAPE_DISTANCE_M;
      this.world.score = 4210;
      this.world.corn = 31;
      this.world.pies = 2;
      this.best = 4210;
    } else if (name === 'caught') {
      this.state = 'caught';
      this.world.stageRun(seed, 1, 0);
      this.world.lives = 0;
      this.world.score = 1870;
    }
  }

  tick(dt) {
    const input = this.input;
    if (input.muteHit) this.sfx.toggleMute();

    if (this.state === 'title') {
      this.sfx.ensure();
      if (input.startHit) {
        this.sfx.ensure();
        this.sfx.gobble();
        this.sfx.click();
        this.world = new World(this.seed + Math.floor(Math.random() * 100000));
        this.state = 'playing';
      }
    } else if (this.state === 'playing') {
      if (input.pauseHit) {
        this.state = 'paused';
        this.sfx.stopAlarm();
      } else {
        const before = this.world.events.length;
        this.world.update(dt, input, this.sfx);
        for (let i = before; i < this.world.events.length; i += 1) {
          const ev = this.world.events[i];
          if (ev.type === 'dodge' || ev.type === 'corn' || ev.type === 'pie') {
            this.floaters.push({ x: TURKEY_X + 40, y: this.world.turkeyY - 110, text: `+${ev.score}`, life: 0.9 });
          }
        }
        if (this.world.over) {
          this.best = Math.max(this.best, Math.floor(this.world.score));
          this.state = this.world.over;
        }
      }
    } else if (this.state === 'paused') {
      if (input.pauseHit || input.startHit) this.state = 'playing';
    } else if (this.state === 'caught' || this.state === 'escaped') {
      if (input.restartHit) {
        this.sfx.click();
        this.world = new World(this.seed + Math.floor(Math.random() * 100000));
        this.floaters = [];
        this.state = 'playing';
      }
    }

    for (const f of this.floaters) f.life -= dt;
    this.floaters = this.floaters.filter((f) => f.life > 0);
    this.render(dt);
    input.endFrame();
  }

  render(dt) {
    const ctx = this.ctx;
    const w = this.world;
    const stageIndex = stageForDistance(w.distanceM);
    const stage = STAGES[stageIndex];
    drawBackground(ctx, stage, w.scrollPx, w.time);
    drawStageDressing(ctx, stageIndex, w.scrollPx);

    if (this.state === 'title') {
      this.renderTitle();
      return;
    }

    // On an end screen the world behind is dimmed and the end art takes
    // the turkey's place, so the player never sees two turkeys.
    if (this.state === 'caught' || this.state === 'escaped') {
      this.renderHud();
      this.renderEnd(this.state === 'escaped');
      return;
    }

    // Pickups.
    for (const p of w.pickups) {
      const sx = p.x - w.distancePx;
      if (sx < -80 || sx > VIEW_W + 80) continue;
      if (p.kind === 'corn') drawCorn(ctx, sx, p.y, w.time);
      else drawPie(ctx, sx, p.y, w.time);
    }

    // Obstacles.
    for (const o of w.obstacles) {
      const sx = o.x - w.distancePx;
      if (sx < -160 || sx > VIEW_W + 160) continue;
      if (o.type === 'fence') drawFence(ctx, sx, GROUND_Y);
      else if (o.type === 'hay') drawHay(ctx, sx, GROUND_Y, w.time);
      else if (o.type === 'crate') drawCrate(ctx, sx, GROUND_Y);
      else if (o.type === 'pitchfork') drawPitchforkHazard(ctx, sx, GROUND_Y);
      else if (o.type === 'oven') drawOven(ctx, sx, GROUND_Y, w.time);
      else if (o.type === 'knife') {
        const angle = Math.sin(w.time * o.swingSpeed + o.swing) * 0.7;
        // A wooden beam across the top, so the knife reads as mounted.
        ctx.fillStyle = '#6b4423';
        ctx.fillRect(sx - 80, 92, 160, 14);
        ctx.fillStyle = '#8a5a2b';
        ctx.fillRect(sx - 80, 92, 160, 5);
        ctx.save();
        ctx.translate(sx, 106);
        ctx.strokeStyle = '#6b4423';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 14);
        ctx.stroke();
        ctx.restore();
        drawKnife(ctx, sx, 120, angle);
      } else if (o.type === 'pot') {
        drawPot(ctx, sx, GROUND_Y - 74, w.time);
      }
    }

    // The farmer, chasing from the left.
    const farmerX = w.farmerX;
    if (farmerX > -140) {
      drawFarmer(ctx, farmerX, GROUND_Y, 1.15, w.runPhase * 1.15, w.farmerClose);
    }

    // The turkey.
    const ducking = w.ducking;
    drawTurkey(ctx, TURKEY_X, w.turkeyY, 1, w.runPhase, ducking, w.invincible > 0, w.dashTime > 0);
    if (w.dashTime > 0) {
      ctx.strokeStyle = 'rgba(255, 207, 63, 0.8)';
      ctx.lineWidth = 4;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.moveTo(TURKEY_X - 60 - i * 18, w.turkeyY - 30 - i * 12);
        ctx.lineTo(TURKEY_X - 100 - i * 18, w.turkeyY - 30 - i * 12);
        ctx.stroke();
      }
    }

    // Score popups.
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.textAlign = 'left';
    for (const f of this.floaters) {
      ctx.globalAlpha = Math.min(1, f.life * 2);
      ctx.fillStyle = '#ffcf3f';
      ctx.fillText(f.text, f.x, f.y - (0.9 - f.life) * 40);
    }
    ctx.globalAlpha = 1;

    this.renderHud();

    if (this.state === 'paused') this.renderPaused();
  }

  renderHud() {
    const ctx = this.ctx;
    const w = this.world;
    const stageIndex = stageForDistance(w.distanceM);
    const stage = STAGES[stageIndex];

    // Top bar.
    ctx.fillStyle = 'rgba(30, 16, 8, 0.55)';
    ctx.beginPath();
    ctx.roundRect(16, 14, VIEW_W - 32, 64, 12);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE ${Math.floor(w.score)}`, 36, 56);
    ctx.fillText(`🌽 ${w.corn}`, 300, 56);
    ctx.textAlign = 'center';
    ctx.fillText(`${stage.name.toUpperCase()}  ·  ${Math.floor(w.distanceM)} m`, VIEW_W / 2, 56);
    ctx.textAlign = 'right';
    // Lives as hearts.
    let hearts = '';
    for (let i = 0; i < MAX_LIVES; i += 1) hearts += i < w.lives ? '♥ ' : '♡ ';
    ctx.fillStyle = '#ff6b5e';
    ctx.fillText(hearts.trim(), VIEW_W - 36, 56);
    ctx.textAlign = 'left';

    // Stage progress: farmyard -> barn -> kitchen -> freedom.
    const barX = 36;
    const barY = 92;
    const barW = 420;
    ctx.fillStyle = 'rgba(30, 16, 8, 0.55)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, 16, 8);
    ctx.fill();
    const total = w.distanceM / ESCAPE_DISTANCE_M;
    ctx.fillStyle = '#ffcf3f';
    ctx.beginPath();
    ctx.roundRect(barX, barY, Math.max(16, barW * Math.min(1, total)), 16, 8);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText(`ESCAPE ${Math.floor(total * 100)}% — ${Math.max(0, ESCAPE_DISTANCE_M - Math.floor(w.distanceM))} m to the woods`, barX, barY + 36);

    // Farmer gap bar: how close the farmer is.
    const gapX = VIEW_W - 356;
    ctx.fillStyle = 'rgba(30, 16, 8, 0.55)';
    ctx.beginPath();
    ctx.roundRect(gapX, barY, 320, 16, 8);
    ctx.fill();
    const gapFrac = w.farmerGap / 260;
    ctx.fillStyle = w.farmerClose ? '#ff3b30' : '#ff8c42';
    ctx.beginPath();
    ctx.roundRect(gapX, barY, Math.max(16, 320 * gapFrac), 16, 8);
    ctx.fill();
    ctx.fillStyle = w.farmerClose ? '#ff6b5e' : '#fff';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText(w.farmerClose ? '⚠ THE FARMER IS RIGHT BEHIND YOU!' : `FARMER ${Math.floor(w.farmerGap / 4)} m BEHIND`, gapX, barY + 36);

    // Dash cooldown pip.
    if (w.dashCooldown > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.fillText(`DASH… ${w.dashCooldown.toFixed(1)}s`, 36, 150);
    } else {
      ctx.fillStyle = '#ffcf3f';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.fillText('DASH READY — SHIFT / X', 36, 150);
    }
  }

  renderTitle() {
    const ctx = this.ctx;
    const w = this.world;
    // The turkey, big, on the title lawn, with the farmer lurking.
    drawTurkey(ctx, 330, GROUND_Y, 2.1, w.time * 2, false, false, false);
    drawFarmer(ctx, 1060, GROUND_Y, 1.5, w.time * 2.4, false);
    ctx.fillStyle = 'rgba(30, 16, 8, 0.45)';
    ctx.beginPath();
    ctx.roundRect(180, 60, VIEW_W - 360, 300, 20);
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffcf3f';
    ctx.font = 'bold 84px system-ui, sans-serif';
    ctx.fillText('GOBBLE RUN', VIEW_W / 2, 150);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 34px system-ui, sans-serif';
    ctx.fillText("A turkey's Thanksgiving escape", VIEW_W / 2, 205);
    ctx.font = '24px system-ui, sans-serif';
    ctx.fillStyle = '#ffe9c4';
    ctx.fillText('Outrun the farmer. Dodge the oven and the carving knife.', VIEW_W / 2, 255);
    ctx.fillText('Run the farmyard, the barn and the kitchen — then reach the woods.', VIEW_W / 2, 292);
    ctx.fillStyle = '#ffcf3f';
    ctx.font = 'bold 28px system-ui, sans-serif';
    const blink = Math.floor(w.time * 2) % 2 === 0;
    if (blink) ctx.fillText('▶  PRESS ENTER OR CLICK TO RUN  ◀', VIEW_W / 2, 340);
    ctx.fillStyle = '#fff';
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillText('SPACE / ↑ / CLICK — jump      ↓ / S — duck under pots      SHIFT / X — gobble dash', VIEW_W / 2, 660);
    ctx.fillText('P — pause      M — mute      R — restart', VIEW_W / 2, 690);
    if (this.best > 0) {
      ctx.fillStyle = '#ffcf3f';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillText(`Best score so far: ${this.best}`, VIEW_W / 2, 400);
    }
  }

  renderPaused() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(20, 10, 5, 0.6)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 64px system-ui, sans-serif';
    ctx.fillText('PAUSED', VIEW_W / 2, VIEW_H / 2 - 10);
    ctx.font = '24px system-ui, sans-serif';
    ctx.fillText('P or Enter to keep running', VIEW_W / 2, VIEW_H / 2 + 40);
  }

  renderEnd(escaped) {
    const ctx = this.ctx;
    const w = this.world;
    ctx.fillStyle = escaped ? 'rgba(20, 60, 20, 0.55)' : 'rgba(60, 10, 5, 0.6)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    // Panel with the result, art standing on the ground below it.
    ctx.fillStyle = 'rgba(30, 16, 8, 0.72)';
    ctx.beginPath();
    ctx.roundRect(VIEW_W / 2 - 430, 84, 860, 300, 20);
    ctx.fill();
    ctx.textAlign = 'center';
    if (escaped) {
      ctx.fillStyle = '#7ee081';
      ctx.font = 'bold 76px system-ui, sans-serif';
      ctx.fillText('ESCAPED!', VIEW_W / 2, 170);
      ctx.fillStyle = '#fff';
      ctx.font = '28px system-ui, sans-serif';
      ctx.fillText('You made it to the woods. No Thanksgiving dinner for you!', VIEW_W / 2, 232);
    } else {
      ctx.fillStyle = '#ff6b5e';
      ctx.font = 'bold 76px system-ui, sans-serif';
      ctx.fillText('CAUGHT!', VIEW_W / 2, 170);
      ctx.fillStyle = '#fff';
      ctx.font = '28px system-ui, sans-serif';
      ctx.fillText('The farmer got you. Dinner is at six — better luck next run!', VIEW_W / 2, 232);
    }
    ctx.fillStyle = '#ffcf3f';
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.fillText(
      `Score ${Math.floor(w.score)}   ·   ${Math.floor(w.distanceM)} m   ·   🌽 ${w.corn}   ·   Best ${this.best}`,
      VIEW_W / 2,
      300,
    );
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px system-ui, sans-serif';
    const blink = Math.floor(w.time * 2) % 2 === 0;
    if (blink) ctx.fillText('▶  PRESS R OR CLICK TO RUN AGAIN  ◀', VIEW_W / 2, 350);
    if (escaped) {
      drawTurkey(ctx, VIEW_W / 2, GROUND_Y, 1.6, 1.2, false, false, false);
    } else {
      drawFarmer(ctx, VIEW_W / 2 + 240, GROUND_Y, 1.3, 0.4, true);
      drawTurkey(ctx, VIEW_W / 2 - 260, GROUND_Y, 1.2, 0.4, false, false, false);
    }
  }
}
