import { initStage } from "./stage";
import { GameState } from "./types";

let game: GameState;
let rafId = 0;

export function initGame(): GameState {
  const [stage, update, draw] = initStage();
  game = {
    currentStage: stage,
    running: false,
    lastFrametime: -1,
    delegate: { update, draw },
  };
  return game;
}

export function start() {
  game.running = true;
  rafId = window.requestAnimationFrame(loop);
}

export function stop() {
  game.running = false;
  window.cancelAnimationFrame(rafId);
}

export function loop(frametime: DOMHighResTimeStamp) {
  if (!game.running) return;
  if (game.lastFrametime === -1) {
    game.lastFrametime = frametime;
  }

  const delta = frametime - game.lastFrametime;

  game.delegate.update(game.currentStage, delta);
  game.delegate.draw(game.currentStage);

  rafId = window.requestAnimationFrame(loop);
}
