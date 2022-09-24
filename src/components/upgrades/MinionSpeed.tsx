import { useGameStore } from "../../game";
import { Upgrades } from "../../game/types";
import { useNextUpgrade } from "../../hooks/useNextUpgrade";
import { formatNumber, formatPercent } from "../../utils/number";

interface MinionSpeedProps {
  purchaseAmount: number;
}
export default function MinionSpeed({ purchaseAmount }: MinionSpeedProps) {
  const [upgrade, nextCost, canAfford] = useNextUpgrade(
    Upgrades.MinionSpeed,
    purchaseAmount
  );
  const buy = useGameStore((store) => store.buyMinionSpeedUpgrade);

  return (
    <button
      type="button"
      className="block p-1 border rounded border-gray-700 disabled:bg-gray-200 disabled:text-gray-500"
      onClick={() => buy(purchaseAmount)}
      disabled={!canAfford}
    >
      Minion speed +{formatPercent(upgrade.nextUpgradeMultiplier)}:{" "}
      {formatNumber(nextCost)} Data
    </button>
  );
}
