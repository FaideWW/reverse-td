import { useNextUpgradeCost } from "../../hooks/useNextUpgradeCost";

import { Upgrades } from "../../game/types";
import { formatNumber } from "../../utils/number";

export default function MaxData() {
  const nextUpgrade = useNextUpgradeCost(Upgrades.MaxMemory);

  return <div>Increase max memory: {formatNumber(nextUpgrade)}</div>;
}
