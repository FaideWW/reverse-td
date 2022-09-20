import { useEffect } from "react";
import { init, start, step } from "../game";
import Canvas from "./Canvas";
import DevConsole from "./DevConsole";
import PlayerSummonReloadBar from "./PlayerSummonReloadBar";
import ResourceDisplay from "./ResourceDisplay";

import Settings from "./Settings";

export default function GameScreen() {
  const handleStartGame = () => {
    init();
    start();
  };

  useEffect(() => {
    let lastFrametime = performance.now();
    function gameLoop(frametime: DOMHighResTimeStamp) {
      const delta = frametime - lastFrametime;

      step(delta);

      lastFrametime = frametime;
      window.requestAnimationFrame(gameLoop);
    }

    window.requestAnimationFrame(gameLoop);
  }, []);

  return (
    <div className="w-1/2 mx-2 flex gap-8">
      <div className="grow">
        <DevConsole />
        <Settings />
        <ResourceDisplay />
      </div>
      <div className="flex-none">
        <Canvas onContextLoaded={handleStartGame} />
        <PlayerSummonReloadBar />
      </div>
    </div>
  );
}
