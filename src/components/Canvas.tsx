import { useCallback } from "react";
import { drawRect, registerCanvasContext } from "../game/draw";

export interface CanvasProps {
  onContextLoaded: () => void;
}

export default function Canvas({ onContextLoaded }: CanvasProps) {
  const contextRef = useCallback(
    (node: HTMLCanvasElement) => {
      if (node !== null) {
        const ctx = node.getContext("2d");
        registerCanvasContext(ctx);
        if (ctx !== null) {
          onContextLoaded();
        }
        drawRect(0, 0, 100, 100, [255, 0, 0, 0.5]);
      }
    },
    [onContextLoaded]
  );
  return <canvas ref={contextRef} width={300} height={600} />;
}
