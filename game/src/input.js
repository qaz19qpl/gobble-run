// Gobble Run — keyboard and mouse input.
// One clear job: turn keys and clicks into the game's verbs, with edge
// detection so one press is one jump, one dash, one start.

export class Input {
  constructor() {
    this.keys = new Set();
    this.pressed = new Set();
    this.pointerX = 0;
    this.pointerY = 0;
    this.clicked = false;
    this.onKey = (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      if (!e.repeat) this.pressed.add(e.code);
      this.keys.add(e.code);
    };
    this.onKeyUp = (e) => this.keys.delete(e.code);
    this.onPointerDown = (e) => {
      const rect = e.target.getBoundingClientRect();
      this.pointerX = e.clientX - rect.left;
      this.pointerY = e.clientY - rect.top;
      this.clicked = true;
      this.pressed.add('Pointer');
    };
  }

  attach(canvas) {
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('keyup', this.onKeyUp);
    canvas.addEventListener('pointerdown', this.onPointerDown);
  }

  detach(canvas) {
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('keyup', this.onKeyUp);
    canvas.removeEventListener('pointerdown', this.onPointerDown);
  }

  down(...codes) {
    return codes.some((c) => this.keys.has(c));
  }

  // True once, on the frame the key went down; consumed by endFrame().
  hit(...codes) {
    return codes.some((c) => this.pressed.has(c));
  }

  get jumpHit() {
    return this.hit('Space', 'ArrowUp', 'KeyW', 'Pointer');
  }

  get duckHeld() {
    return this.down('ArrowDown', 'KeyS');
  }

  get dashHit() {
    return this.hit('ShiftLeft', 'ShiftRight', 'KeyX');
  }

  get startHit() {
    return this.hit('Enter', 'Space', 'Pointer');
  }

  get restartHit() {
    return this.hit('KeyR', 'Enter', 'Space', 'Pointer');
  }

  get pauseHit() {
    return this.hit('KeyP', 'Escape');
  }

  get muteHit() {
    return this.hit('KeyM');
  }

  endFrame() {
    this.pressed.clear();
    this.clicked = false;
  }
}
