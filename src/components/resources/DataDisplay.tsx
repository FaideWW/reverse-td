import { useGameStore } from "../../game";
import { formatNumber } from "../../utils/number";

export default function DataDisplay() {
  const data = useGameStore((state) => state.player.resources.currentData);
  const maxData = useGameStore((state) => state.player.resources.maxData);

  return (
    <div>
      Data: {formatNumber(data)} / {maxData}
    </div>
  );
}
