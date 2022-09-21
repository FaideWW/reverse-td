import { useEffect, useRef } from "react";
import { draw, init, start, step } from "../game";
import Canvas from "./Canvas";
import DevConsole from "./DevConsole";
import PlayerSummonReloadBar from "./PlayerSummonReloadBar";
import ResourceDisplay from "./resources";

import Settings from "./Settings";
import UpgradesMenu from "./upgrades";

export default function GameScreen() {
  const handleStartGame = () => {
    init();
    start();
  };
  const rafId = useRef<number>(0);

  useEffect(() => {
    let lastFrametime = performance.now();
    function gameLoop(frametime: DOMHighResTimeStamp) {
      const delta = frametime - lastFrametime;

      step(delta);

      lastFrametime = frametime;
      rafId.current = window.requestAnimationFrame(gameLoop);
    }

    rafId.current = window.requestAnimationFrame(gameLoop);
    draw();
    return () => window.cancelAnimationFrame(rafId.current);
  }, []);

  return (
    <div className="w-1/2 mx-2 flex gap-8">
      <div className="grow">
        {process.env.VERCEL_ENV !== "production" && <DevConsole />}
        <Settings />
        <ResourceDisplay />
        <UpgradesMenu />
      </div>
      <div className="flex-none">
        <Canvas onContextLoaded={handleStartGame} />
        <PlayerSummonReloadBar />
      </div>
    </div>
  );
}
