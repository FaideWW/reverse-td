import { useGameStore } from "../../game";
import { resolve } from "../../game/util";
import { formatNumber } from "../../utils/number";

export default function MemoryDisplay() {
  const memory = useGameStore((state) => state.player.resources.currentMemory);
  const maxMemory = useGameStore((state) =>
    resolve(state.player.resources.maxMemory)
  );

  return (
    <div>
      Memory: {formatNumber(memory)} / {maxMemory}
    </div>
  );
}
