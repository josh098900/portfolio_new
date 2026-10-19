// Three small canvas games sharing one loop. Each draws at a fixed internal
// resolution that CSS scales to fit, and reports score and status to React.

export const WIDTH = 640;
export const HEIGHT = 400;

export type GameEvents = { score: (value: number) => void; status: (text: string | null) => void };
export type Game = {
  key: (key: string, down: boolean) => boolean;
  pointer: (x: number, y: number) => void;
  swipe: (dx: number, dy: number) => void;
  action: () => void;
  stop: () => void;
};

const palette = { bg: "#0b0d14", fg: "#f2f2f7", dim: "rgb(242 242 247 / 0.25)", accent: "#64d2ff", warm: "#ff9f0a" };
const brickColours = ["#ff453a", "#ff9f0a", "#ffd60a", "#30d158", "#64d2ff", "#bf5af2"];

/** Runs `step` once per animation frame with a delta in 60fps units, pausing while the tab is hidden. */
function loop(step: (dt: number) => void) {
  let last = performance.now();
  let frame = requestAnimationFrame(function tick(now) {
    const dt = Math.min(3, (now - last) / (1000 / 60));
    last = now;
    if (!document.hidden) step(dt);
    frame = requestAnimationFrame(tick);
  });
  return () => cancelAnimationFrame(frame);
}

function setup(canvas: HTMLCanvasElement) {
  const scale = Math.min(2, devicePixelRatio || 1);
  canvas.width = WIDTH * scale;
  canvas.height = HEIGHT * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  return ctx;
}

function clear(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function createPong(canvas: HTMLCanvasElement, ev: GameEvents): Game {
  const ctx = setup(canvas);
  const PADDLE = { w: 10, h: 70 };
  const TARGET = 7;
  let player = HEIGHT / 2, cpu = HEIGHT / 2, scores = [0, 0];
  let ball = { x: WIDTH / 2, y: HEIGHT / 2, vx: 0, vy: 0 };
  let playing = false;
  const keys = new Set<string>();

  const serve = (towards: 1 | -1) => {
    ball = { x: WIDTH / 2, y: HEIGHT / 2, vx: 5 * towards, vy: (Math.random() * 4 - 2) };
  };
  const reset = () => { scores = [0, 0]; ev.score(0); serve(1); };
  ev.status("Press Space or tap to play. Move with the mouse, a finger, W/S or ↑/↓.");

  const stopLoop = loop(dt => {
    if (playing) {
      if (keys.has("up")) player -= 7 * dt;
      if (keys.has("down")) player += 7 * dt;
      player = clamp(player, PADDLE.h / 2, HEIGHT - PADDLE.h / 2);
      const target = ball.vx > 0 ? ball.y : HEIGHT / 2;
      cpu += clamp(target - cpu, -4.4 * dt, 4.4 * dt);
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      if (ball.y < 6 || ball.y > HEIGHT - 6) { ball.vy *= -1; ball.y = clamp(ball.y, 6, HEIGHT - 6); }
      const hit = (paddleY: number, side: 1 | -1) => {
        const offset = (ball.y - paddleY) / (PADDLE.h / 2);
        const speed = Math.min(13, Math.hypot(ball.vx, ball.vy) * 1.06);
        ball.vx = -side * speed * Math.cos(offset * 0.9);
        ball.vy = speed * Math.sin(offset * 0.9);
      };
      if (ball.vx < 0 && ball.x < 30 && ball.x > 14 && Math.abs(ball.y - player) < PADDLE.h / 2 + 6) hit(player, -1);
      if (ball.vx > 0 && ball.x > WIDTH - 30 && ball.x < WIDTH - 14 && Math.abs(ball.y - cpu) < PADDLE.h / 2 + 6) hit(cpu, 1);
      if (ball.x < -10 || ball.x > WIDTH + 10) {
        const youScored = ball.x > WIDTH;
        scores[youScored ? 0 : 1]++;
        ev.score(scores[0]);
        if (scores[0] >= TARGET || scores[1] >= TARGET) {
          playing = false;
          ev.status(scores[0] >= TARGET ? `You win ${scores[0]}–${scores[1]}! Space or tap to play again.` : `The computer wins ${scores[1]}–${scores[0]}. Space or tap for a rematch.`);
        } else serve(youScored ? -1 : 1);
      }
    }
    clear(ctx);
    ctx.fillStyle = palette.dim;
    for (let y = 8; y < HEIGHT; y += 24) ctx.fillRect(WIDTH / 2 - 1, y, 2, 12);
    ctx.font = "600 44px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText(String(scores[0]), WIDTH / 2 - 60, 56);
    ctx.fillText(String(scores[1]), WIDTH / 2 + 60, 56);
    ctx.fillStyle = palette.accent;
    ctx.fillRect(14, player - PADDLE.h / 2, PADDLE.w, PADDLE.h);
    ctx.fillStyle = palette.fg;
    ctx.fillRect(WIDTH - 24, cpu - PADDLE.h / 2, PADDLE.w, PADDLE.h);
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  return {
    key: (key, down) => {
      const dir = /^(w|arrowup)$/i.test(key) ? "up" : /^(s|arrowdown)$/i.test(key) ? "down" : null;
      if (dir) { if (down) keys.add(dir); else keys.delete(dir); return true; }
      if (key === " " && down) { if (!playing) { playing = true; reset(); ev.status(null); } return true; }
      return false;
    },
    pointer: (_, y) => { player = clamp(y * HEIGHT, PADDLE.h / 2, HEIGHT - PADDLE.h / 2); },
    swipe: () => {},
    action: () => { if (!playing) { playing = true; reset(); ev.status(null); } },
    stop: stopLoop,
  };
}

export function createSnake(canvas: HTMLCanvasElement, ev: GameEvents): Game {
  const ctx = setup(canvas);
  const CELL = 20;
  const COLS = WIDTH / CELL, ROWS = HEIGHT / CELL;
  let snake = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
  let dir = { x: 1, y: 0 }, queued: { x: number; y: number }[] = [];
  let food = { x: 20, y: 10 }, score = 0, playing = false, timer = 0;

  const place = () => {
    do food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    while (snake.some(s => s.x === food.x && s.y === food.y));
  };
  const start = () => {
    snake = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }];
    dir = { x: 1, y: 0 }; queued = []; score = 0; playing = true;
    ev.score(0); ev.status(null); place();
  };
  const turn = (x: number, y: number) => {
    const last = queued.at(-1) ?? dir;
    if (last.x === -x && last.y === -y) return;
    if (queued.length < 3) queued.push({ x, y });
  };
  ev.status("Press Space or tap to start. Steer with the arrow keys, WASD or swipes.");

  const stopLoop = loop(dt => {
    if (playing) {
      timer += dt;
      const interval = Math.max(4, 8 - score * 0.15);
      while (timer >= interval && playing) {
        timer -= interval;
        if (queued.length) dir = queued.shift()!;
        const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
        if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS || snake.some(s => s.x === head.x && s.y === head.y)) {
          playing = false;
          ev.status(`Game over with ${score} ${score === 1 ? "apple" : "apples"}. Space or tap to try again.`);
          break;
        }
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) { score++; ev.score(score); place(); } else snake.pop();
      }
    }
    clear(ctx);
    ctx.fillStyle = "rgb(255 255 255 / 0.03)";
    for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) if ((x + y) % 2) ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
    ctx.fillStyle = "#ff453a";
    ctx.beginPath();
    ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 3, 0, Math.PI * 2);
    ctx.fill();
    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? palette.accent : `hsl(${150 - Math.min(i, 30) * 1.5} 70% ${55 - Math.min(i, 30) * 0.4}%)`;
      ctx.beginPath();
      ctx.roundRect(s.x * CELL + 2, s.y * CELL + 2, CELL - 4, CELL - 4, 5);
      ctx.fill();
    });
  });

  return {
    key: (key, down) => {
      if (!down) return /^(arrow|[wasd]$)/i.test(key);
      const k = key.toLowerCase();
      if (k === "arrowup" || k === "w") turn(0, -1);
      else if (k === "arrowdown" || k === "s") turn(0, 1);
      else if (k === "arrowleft" || k === "a") turn(-1, 0);
      else if (k === "arrowright" || k === "d") turn(1, 0);
      else if (k === " ") { if (!playing) start(); }
      else return false;
      return true;
    },
    pointer: () => {},
    swipe: (dx, dy) => {
      if (!playing) return;
      if (Math.abs(dx) > Math.abs(dy)) turn(Math.sign(dx), 0); else turn(0, Math.sign(dy));
    },
    action: () => { if (!playing) start(); },
    stop: stopLoop,
  };
}

export function createBricks(canvas: HTMLCanvasElement, ev: GameEvents): Game {
  const ctx = setup(canvas);
  const COLS = 10, ROWS = 6, GAP = 6, TOP = 50;
  const BW = (WIDTH - GAP * (COLS + 1)) / COLS, BH = 16;
  let paddle = WIDTH / 2, lives = 3, score = 0, level = 1, playing = false, launched = false;
  let ball = { x: 0, y: 0, vx: 0, vy: 0 };
  let bricks: boolean[] = [];
  const keys = new Set<string>();

  const build = () => { bricks = Array(COLS * ROWS).fill(true); };
  const ready = () => { launched = false; ball = { x: paddle, y: HEIGHT - 40, vx: 0, vy: 0 }; };
  const launch = () => {
    const speed = 5 + level * 0.6;
    launched = true;
    ball.vx = speed * (Math.random() > 0.5 ? 0.6 : -0.6);
    ball.vy = -speed * 0.8;
  };
  const start = () => { lives = 3; score = 0; level = 1; playing = true; build(); ready(); ev.score(0); ev.status(null); };
  ev.status("Press Space or tap to start. Move with the mouse, a finger or ←/→.");
  build();
  ready();

  const stopLoop = loop(dt => {
    if (keys.has("left")) paddle -= 9 * dt;
    if (keys.has("right")) paddle += 9 * dt;
    paddle = clamp(paddle, 45, WIDTH - 45);
    if (playing) {
      if (!launched) { ball.x = paddle; ball.y = HEIGHT - 40; }
      else {
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;
        if (ball.x < 7 || ball.x > WIDTH - 7) { ball.vx *= -1; ball.x = clamp(ball.x, 7, WIDTH - 7); }
        if (ball.y < 7) { ball.vy = Math.abs(ball.vy); }
        if (ball.vy > 0 && ball.y > HEIGHT - 34 && ball.y < HEIGHT - 20 && Math.abs(ball.x - paddle) < 52) {
          const offset = (ball.x - paddle) / 52;
          const speed = Math.hypot(ball.vx, ball.vy);
          ball.vx = speed * Math.sin(offset * 1.05);
          ball.vy = -speed * Math.cos(offset * 1.05);
        }
        const col = Math.floor((ball.x - GAP) / (BW + GAP));
        const row = Math.floor((ball.y - TOP) / (BH + GAP));
        if (row >= 0 && row < ROWS && col >= 0 && col < COLS && bricks[row * COLS + col]) {
          bricks[row * COLS + col] = false;
          ball.vy *= -1;
          score += (ROWS - row) * 10;
          ev.score(score);
          if (!bricks.some(Boolean)) { level++; build(); ready(); ev.status(`Level ${level}! Space or tap to launch.`); }
        }
        if (ball.y > HEIGHT + 10) {
          lives--;
          if (lives <= 0) { playing = false; ev.status(`Game over: ${score} points. Space or tap to play again.`); }
          else { ready(); ev.status(`${lives} ${lives === 1 ? "ball" : "balls"} left. Space or tap to launch.`); }
        }
      }
    }
    clear(ctx);
    bricks.forEach((alive, i) => {
      if (!alive) return;
      const row = Math.floor(i / COLS), col = i % COLS;
      ctx.fillStyle = brickColours[row % brickColours.length];
      ctx.beginPath();
      ctx.roundRect(GAP + col * (BW + GAP), TOP + row * (BH + GAP), BW, BH, 4);
      ctx.fill();
    });
    ctx.fillStyle = palette.fg;
    ctx.beginPath();
    ctx.roundRect(paddle - 45, HEIGHT - 28, 90, 10, 5);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "600 13px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = palette.dim;
    ctx.fillText(`Level ${level}  ·  ${"●".repeat(Math.max(lives, 0))}`, 10, 24);
  });

  const go = () => { if (!playing) start(); else if (!launched) { launch(); ev.status(null); } };
  return {
    key: (key, down) => {
      const dir = /^(a|arrowleft)$/i.test(key) ? "left" : /^(d|arrowright)$/i.test(key) ? "right" : null;
      if (dir) { if (down) keys.add(dir); else keys.delete(dir); return true; }
      if (key === " " && down) { go(); return true; }
      return false;
    },
    pointer: x => { paddle = clamp(x * WIDTH, 45, WIDTH - 45); },
    swipe: () => {},
    action: go,
    stop: stopLoop,
  };
}

export const engines = { pong: createPong, snake: createSnake, bricks: createBricks };
