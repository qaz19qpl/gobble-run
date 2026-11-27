// Gobble Run — every picture in the game, drawn in code.
// One clear job: original Thanksgiving art (turkey, farmer, oven, knife,
// farmyard, barn, kitchen) with no image files and no borrowed art.

import { GROUND_Y, VIEW_W, VIEW_H } from './config.js';

// --- the turkey: brown body, fanned tail, red wattle, worried eye ---
export function drawTurkey(ctx, x, y, scale, runPhase, ducking, invincible, dashing) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (invincible && Math.floor(runPhase * 14) % 2 === 0) ctx.globalAlpha = 0.35;
  const bob = ducking ? 0 : Math.abs(Math.sin(runPhase)) * 3;
  const legSwing = Math.sin(runPhase) * 14;

  // Tail fan: five feathers fanning out behind.
  ctx.save();
  ctx.translate(-26, -14 - bob);
  for (let i = -2; i <= 2; i += 1) {
    ctx.save();
    ctx.rotate(i * 0.32 - 0.5);
    ctx.fillStyle = i % 2 === 0 ? '#8a5a2b' : '#6b4423';
    ctx.beginPath();
    ctx.ellipse(-16, -12, 26, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d9a05b';
    ctx.beginPath();
    ctx.ellipse(-30, -12, 9, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // Legs, mid-stride.
  ctx.strokeStyle = '#e8912d';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, 16);
  ctx.lineTo(-6 + legSwing, 30);
  ctx.moveTo(8, 16);
  ctx.lineTo(8 - legSwing, 30);
  ctx.stroke();

  // Body.
  const bodyH = ducking ? 30 : 44;
  ctx.fillStyle = '#7a4a21';
  ctx.beginPath();
  ctx.ellipse(0, -6 - bob, 34, bodyH, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#9c6b30';
  ctx.beginPath();
  ctx.ellipse(6, -2 - bob, 24, bodyH - 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Wing.
  ctx.fillStyle = '#5d3a1a';
  ctx.beginPath();
  ctx.ellipse(-4, -8 - bob, 20, 13, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Neck and head, stretched forward while dashing.
  const neckLean = dashing ? 10 : 4;
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(24, -30 - bob);
  ctx.lineTo(30 + neckLean, -46 - bob);
  ctx.stroke();
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath();
  ctx.arc(32 + neckLean, -50 - bob, 13, 0, Math.PI * 2);
  ctx.fill();
  // Beak.
  ctx.fillStyle = '#f2a541';
  ctx.beginPath();
  ctx.moveTo(42 + neckLean, -52 - bob);
  ctx.lineTo(58 + neckLean, -47 - bob);
  ctx.lineTo(42 + neckLean, -44 - bob);
  ctx.closePath();
  ctx.fill();
  // Wattle.
  ctx.fillStyle = '#d43d2a';
  ctx.beginPath();
  ctx.ellipse(40 + neckLean, -40 - bob, 4, 8, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Worried eye.
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(34 + neckLean, -54 - bob, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1d1d1d';
  ctx.beginPath();
  ctx.arc(36 + neckLean, -54 - bob, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// --- the farmer: overalls, straw hat, pitchfork, very cross ---
export function drawFarmer(ctx, x, y, scale, runPhase, reaching) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const legSwing = Math.sin(runPhase) * 18;
  const bob = Math.abs(Math.sin(runPhase)) * 3;

  // Legs.
  ctx.strokeStyle = '#3a5a8c';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-8, -52);
  ctx.lineTo(-8 + legSwing, 0);
  ctx.moveTo(10, -52);
  ctx.lineTo(10 - legSwing, 0);
  ctx.stroke();

  // Body: red shirt, blue overalls.
  ctx.fillStyle = '#b83226';
  ctx.beginPath();
  ctx.roundRect(-20, -108 - bob, 44, 60, 10);
  ctx.fill();
  ctx.fillStyle = '#3a5a8c';
  ctx.beginPath();
  ctx.roundRect(-18, -78 - bob, 40, 30, 6);
  ctx.fill();
  // Arm reaching forward with the pitchfork.
  const reach = reaching ? 14 : 6;
  ctx.strokeStyle = '#e8b88a';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(18, -96 - bob);
  ctx.lineTo(44 + reach, -84 - bob);
  ctx.stroke();
  // Pitchfork.
  ctx.strokeStyle = '#8c8c8c';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(40 + reach, -100 - bob);
  ctx.lineTo(66 + reach, -52 - bob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(66 + reach, -52 - bob);
  ctx.lineTo(58 + reach, -66 - bob);
  ctx.moveTo(66 + reach, -52 - bob);
  ctx.lineTo(66 + reach, -68 - bob);
  ctx.moveTo(66 + reach, -52 - bob);
  ctx.lineTo(74 + reach, -66 - bob);
  ctx.stroke();

  // Head and straw hat.
  ctx.fillStyle = '#e8b88a';
  ctx.beginPath();
  ctx.arc(6, -126 - bob, 17, 0, Math.PI * 2);
  ctx.fill();
  // Angry brows and moustache.
  ctx.strokeStyle = '#4a2c14';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-2, -132 - bob);
  ctx.lineTo(8, -129 - bob);
  ctx.moveTo(14, -132 - bob);
  ctx.lineTo(6, -129 - bob);
  ctx.stroke();
  ctx.fillStyle = '#4a2c14';
  ctx.beginPath();
  ctx.ellipse(6, -116 - bob, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d9a05b';
  ctx.beginPath();
  ctx.ellipse(6, -140 - bob, 26, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(6, -142 - bob, 15, Math.PI, 0);
  ctx.fill();
  ctx.restore();
}

// --- hazards and pickups ---
export function drawFence(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#d9a05b';
  ctx.strokeStyle = '#5d3a1a';
  ctx.lineWidth = 2;
  ctx.fillRect(-23, -74, 8, 74);
  ctx.strokeRect(-23, -74, 8, 74);
  ctx.fillRect(15, -74, 8, 74);
  ctx.strokeRect(15, -74, 8, 74);
  ctx.fillStyle = '#e8b878';
  ctx.fillRect(-28, -70, 56, 9);
  ctx.strokeRect(-28, -70, 56, 9);
  ctx.fillRect(-28, -44, 56, 9);
  ctx.strokeRect(-28, -44, 56, 9);
  ctx.restore();
}

export function drawHay(ctx, x, y, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#d9a05b';
  ctx.beginPath();
  ctx.arc(0, -44, 48, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b57e2e';
  ctx.lineWidth = 3;
  for (let i = 0; i < 7; i += 1) {
    const a = (i / 7) * Math.PI * 2 + t * 0.05;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 12, -44 + Math.sin(a) * 12);
    ctx.lineTo(Math.cos(a) * 44, -44 + Math.sin(a) * 44);
    ctx.stroke();
  }
  ctx.fillStyle = '#c98f3d';
  ctx.beginPath();
  ctx.arc(0, -44, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawCrate(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#a4713a';
  ctx.fillRect(-42, -84, 84, 84);
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 5;
  ctx.strokeRect(-42, -84, 84, 84);
  ctx.beginPath();
  ctx.moveTo(-42, -84);
  ctx.lineTo(42, 0);
  ctx.moveTo(42, -84);
  ctx.lineTo(-42, 0);
  ctx.stroke();
  ctx.restore();
}

export function drawPitchforkHazard(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = '#c9c9c9';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -96);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-12, -108);
  ctx.lineTo(-12, -84);
  ctx.moveTo(0, -112);
  ctx.lineTo(0, -84);
  ctx.moveTo(12, -108);
  ctx.lineTo(12, -84);
  ctx.stroke();
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(-4, -16, 8, 16);
  ctx.restore();
}

export function drawOven(ctx, x, y, t) {
  ctx.save();
  ctx.translate(x, y);
  // Body.
  ctx.fillStyle = '#3d3d3d';
  ctx.beginPath();
  ctx.roundRect(-65, -138, 130, 138, 8);
  ctx.fill();
  ctx.fillStyle = '#555';
  ctx.fillRect(-65, -138, 130, 18);
  // Glowing door.
  const glow = 0.75 + Math.sin(t * 5) * 0.25;
  ctx.fillStyle = `rgba(255, ${Math.floor(120 + 60 * glow)}, 30, ${glow})`;
  ctx.beginPath();
  ctx.roundRect(-48, -104, 96, 66, 6);
  ctx.fill();
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 4;
  ctx.strokeRect(-48, -104, 96, 66);
  ctx.beginPath();
  ctx.moveTo(-48, -71);
  ctx.lineTo(48, -71);
  ctx.stroke();
  // Knobs and a very rude sign.
  ctx.fillStyle = '#ddd';
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.arc(i * 30, -126, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#ffcf3f';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HOT! 450°F', 0, -24);
  ctx.restore();
}

export function drawKnife(ctx, x, y, angle) {
  // A carving knife hung from a pivot at (x, y), swinging like a pendulum.
  // The blade is long enough to reach the turkey when it hangs vertical.
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  // Handle.
  ctx.fillStyle = '#4a2c14';
  ctx.beginPath();
  ctx.roundRect(-13, -8, 26, 56, 8);
  ctx.fill();
  ctx.fillStyle = '#c9a06a';
  for (let i = 0; i < 3; i += 1) ctx.fillRect(-13, 4 + i * 16, 26, 4);
  // Blade, glinting.
  const grad = ctx.createLinearGradient(-10, 48, 10, 48);
  grad.addColorStop(0, '#e8e8e8');
  grad.addColorStop(0.5, '#ffffff');
  grad.addColorStop(1, '#b8b8b8');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-10, 48);
  ctx.lineTo(10, 48);
  ctx.lineTo(10, 400);
  ctx.lineTo(0, 430);
  ctx.lineTo(-10, 400);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawPot(ctx, x, y, t) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 2) * 4);
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-40, -64);
  ctx.lineTo(-40, 0);
  ctx.moveTo(40, -64);
  ctx.lineTo(40, 0);
  ctx.stroke();
  ctx.fillStyle = '#2f2f2f';
  ctx.beginPath();
  ctx.ellipse(0, -6, 55, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e07a4e';
  ctx.beginPath();
  ctx.ellipse(0, -14, 46, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawCorn(ctx, x, y, t) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 3) * 5);
  ctx.fillStyle = '#ffcf3f';
  ctx.beginPath();
  ctx.ellipse(0, 0, 13, 20, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8a91c';
  for (let r = -1; r <= 1; r += 1) {
    ctx.beginPath();
    ctx.ellipse(r * 6, 0, 2.5, 15, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#5da24a';
  ctx.beginPath();
  ctx.ellipse(-8, 16, 8, 5, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawPie(ctx, x, y, t) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 2.5) * 5);
  ctx.fillStyle = '#e8912d';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, 26, -0.5, 1.1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f7b267';
  ctx.beginPath();
  ctx.arc(0, 0, 20, -0.4, 1.0);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-6, -4, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// --- backgrounds: parallax sky, hills and ground per stage ---
export function drawBackground(ctx, stage, scrollPx, t) {
  const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  sky.addColorStop(0, stage.skyTop);
  sky.addColorStop(1, stage.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // Sun and slow clouds.
  ctx.fillStyle = 'rgba(255, 236, 180, 0.9)';
  ctx.beginPath();
  ctx.arc(1060, 110, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 244, 214, 0.75)';
  for (let i = 0; i < 3; i += 1) {
    const cx = ((i * 430 - scrollPx * 0.08 + t * 6) % (VIEW_W + 320) + VIEW_W + 320) % (VIEW_W + 320) - 160;
    ctx.beginPath();
    ctx.ellipse(cx, 90 + i * 46, 74, 20, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Far hills.
  ctx.fillStyle = stage.hillFar;
  ctx.beginPath();
  ctx.moveTo(0, 480);
  for (let x = 0; x <= VIEW_W; x += 40) {
    const px = x - ((scrollPx * 0.15) % 320);
    ctx.lineTo(px, 470 + Math.sin((x + scrollPx * 0.15) * 0.006) * 34);
  }
  ctx.lineTo(VIEW_W, GROUND_Y);
  ctx.lineTo(0, GROUND_Y);
  ctx.closePath();
  ctx.fill();

  // Near hills / stage dressing.
  ctx.fillStyle = stage.hillNear;
  ctx.beginPath();
  ctx.moveTo(0, 540);
  for (let x = 0; x <= VIEW_W; x += 40) {
    const px = x - ((scrollPx * 0.3) % 260);
    ctx.lineTo(px, 530 + Math.sin((x + scrollPx * 0.3) * 0.009) * 22);
  }
  ctx.lineTo(VIEW_W, GROUND_Y);
  ctx.lineTo(0, GROUND_Y);
  ctx.closePath();
  ctx.fill();

  // Ground.
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
  ctx.fillStyle = stage.groundTop;
  ctx.fillRect(0, GROUND_Y, VIEW_W, 10);
  // Scrub / tiles scrolling past.
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (let i = 0; i < 14; i += 1) {
    const gx = ((i * 173 - scrollPx) % (VIEW_W + 120) + VIEW_W + 120) % (VIEW_W + 120) - 60;
    ctx.fillRect(gx, GROUND_Y + 34 + (i % 3) * 26, 44, 6);
  }
}

// Stage dressing silhouettes: barn in the barn stage, kitchen wall in the kitchen.
export function drawStageDressing(ctx, stageIndex, scrollPx) {
  if (stageIndex === 1) {
    // A big red barn drifting past.
    const bx = ((900 - scrollPx * 0.5) % (VIEW_W + 700) + VIEW_W + 700) % (VIEW_W + 700) - 350;
    ctx.fillStyle = '#8c2f22';
    ctx.fillRect(bx, 360, 260, 240);
    ctx.fillStyle = '#6e2318';
    ctx.beginPath();
    ctx.moveTo(bx - 20, 360);
    ctx.lineTo(bx + 130, 280);
    ctx.lineTo(bx + 280, 360);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#f4e3c2';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(bx + 130, 400);
    ctx.lineTo(bx + 130, 600);
    ctx.moveTo(bx + 60, 500);
    ctx.lineTo(bx + 200, 500);
    ctx.stroke();
  } else if (stageIndex === 2) {
    // Kitchen window and hanging pans on the wall, below the HUD bars.
    ctx.fillStyle = 'rgba(20, 12, 8, 0.35)';
    ctx.fillRect(0, 150, VIEW_W, 190);
    ctx.strokeStyle = '#c9a06a';
    ctx.lineWidth = 8;
    ctx.strokeRect(96, 176, 150, 130);
    ctx.fillStyle = '#f4e3c2';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('THANKSGIVING', 300, 216);
    ctx.fillText('DINNER — 6 PM', 300, 250);
    ctx.fillStyle = '#2f2f2f';
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.arc(980 + i * 70, 236, 26, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
