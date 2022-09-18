import { useCallback } from "react";
import { useGameStore } from "../game";
import { handleMouseDown, handleMouseMove, handleMouseUp } from "../game/input";

export interface CanvasProps {
  onContextLoaded: () => void;
}

export default function Canvas({ onContextLoaded }: CanvasProps) {
  const registerCanvas = useGameStore((store) => store.registerCanvas);
  const contextRef = useCallback(
    (node: HTMLCanvasElement) => {
      if (node !== null) {
        const ctx = node.getContext("2d");
        const rect = node.getBoundingClientRect();
        registerCanvas(ctx, rect.width, rect.height);
        if (ctx !== null) {
          onContextLoaded();
        }
      }
    },
    [registerCanvas, onContextLoaded]
  );
  return (
    <canvas
      ref={contextRef}
      width={300}
      height={600}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    />
  );
}
