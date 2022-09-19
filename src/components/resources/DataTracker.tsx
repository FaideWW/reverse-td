import { useGameStore } from "../../game";
import { resolve } from "../../game/util";
import { formatNumber } from "../../utils/number";

export default function DataTracker() {
  const data = useGameStore((state) => state.player.resources.currentData);
  const maxData = useGameStore((state) =>
    resolve(state.player.resources.maxData)
  );

  return (
    <div>
      Data: {formatNumber(data)} / {maxData}
    </div>
  );
}
