import { useGameStore } from "../../game";
import { formatNumber } from "../../utils/number";

export default function MemoryDisplay() {
  const memory = useGameStore((state) => state.player.resources.currentMemory);
  const maxMemory = useGameStore((state) => state.player.resources.maxMemory);

  return (
    <div>
      Memory: {formatNumber(memory)} / {maxMemory}
    </div>
  );
}
