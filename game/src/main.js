// Gobble Run — boot: find the canvas, build the game, start the loop.
// One clear job: wiring only. The game lives in game.js.

import { Game } from './game.js';
import { VIEW_W, VIEW_H } from './config.js';

const canvas = document.getElementById('game');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') || 7);

const game = new Game(canvas, seed);
window.__game = game;
game.start();
