import { useNextUpgradeCost } from "../../hooks/useNextUpgradeCost";

import { Upgrades } from "../../game/types";
import { formatNumber } from "../../utils/number";

export default function MaxData() {
  const nextUpgrade = useNextUpgradeCost(Upgrades.MaxData);

  return <div>Increase max data: {formatNumber(nextUpgrade)}</div>;
}
