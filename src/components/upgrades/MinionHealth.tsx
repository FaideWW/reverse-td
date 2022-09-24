import { useGameStore } from "../../game";
import { Upgrades } from "../../game/types";
import { useNextUpgrade } from "../../hooks/useNextUpgrade";
import { formatNumber, formatPercent } from "../../utils/number";

interface MinionHealthProps {
  purchaseAmount: number;
}
export default function MinionHealth({ purchaseAmount }: MinionHealthProps) {
  const [upgrade, nextCost, canAfford] = useNextUpgrade(
    Upgrades.MinionHealth,
    purchaseAmount
  );
  const buy = useGameStore((store) => store.buyMinionHealthUpgrade);

  return (
    <button
      type="button"
      className="block p-1 border rounded border-gray-700 disabled:bg-gray-200 disabled:text-gray-500"
      onClick={() => buy(purchaseAmount)}
      disabled={!canAfford}
    >
      Minion health +{formatPercent(upgrade.nextUpgradeMultiplier)}:{" "}
      {formatNumber(nextCost)} Data
    </button>
  );
}
