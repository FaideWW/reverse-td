import { useGameStore } from "../../game";
import { Upgrades } from "../../game/types";
import { useNextUpgrade } from "../../hooks/useNextUpgrade";
import { formatNumber, formatPercent } from "../../utils/number";

interface MaxMemoryProps {
  purchaseAmount: number;
}
export default function MaxMemory({ purchaseAmount }: MaxMemoryProps) {
  const [upgrade, nextCost, canAfford] = useNextUpgrade(
    Upgrades.MaxMemory,
    purchaseAmount
  );
  const buyMaxMemory = useGameStore((store) => store.buyMaxMemoryUpgrade);

  return (
    <button
      type="button"
      className="block p-1 border rounded border-gray-700 disabled:bg-gray-200 disabled:text-gray-500"
      onClick={() => buyMaxMemory(purchaseAmount)}
      disabled={!canAfford}
    >
      Max memory +{formatPercent(upgrade.nextUpgradeMultiplier)}:{" "}
      {formatNumber(nextCost)} Data
    </button>
  );
}
