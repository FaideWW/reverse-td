import { useGameStore } from "../../game";
import { Upgrades } from "../../game/types";
import { useNextUpgrade } from "../../hooks/useNextUpgrade";
import { formatNumber, formatPercent } from "../../utils/number";

interface MaxDataProps {
  purchaseAmount: number;
}

export default function MaxData({ purchaseAmount }: MaxDataProps) {
  const [upgrade, nextCost, canAfford] = useNextUpgrade(
    Upgrades.MaxData,
    purchaseAmount
  );
  const buyMaxData = useGameStore((store) => store.buyMaxDataUpgrade);

  return (
    <button
      type="button"
      className="block p-1 border rounded border-gray-700 disabled:bg-gray-200 disabled:text-gray-500"
      onClick={() => buyMaxData(purchaseAmount)}
      disabled={!canAfford}
    >
      Max data +{formatPercent(upgrade.nextUpgradeMultiplier)}:{" "}
      {formatNumber(nextCost)} Data
    </button>
  );
}
