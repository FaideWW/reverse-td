import { useEffect, useRef } from "react";
import { drawRect, registerCanvasContext } from "../game/draw";

export interface CanvasProps {
  onContextLoaded: () => void;
}

export default function Canvas({ onContextLoaded }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current !== null) {
      const ctx = canvasRef.current.getContext("2d");
      registerCanvasContext(ctx);
      if (ctx !== null) {
        onContextLoaded();
      }
      drawRect(0, 0, 100, 100, [255, 0, 0, 0.5]);
    }
  }, [canvasRef.current]);
  return <canvas ref={canvasRef} width={300} height={600} />;
}
