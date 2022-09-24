import shallow from "zustand/shallow";
import { useGameStore } from "../game";
import { Upgrade, Upgrades } from "../game/types";
import { computeBulkBuyCost, computeMaxAffordable } from "../game/util";

export function useNextUpgrade(
  upgrade: Upgrades,
  increment = 1
): [Upgrade, number, boolean] {
  return useGameStore((game) => {
    let actualQuantity = increment;
    // TODO: Find the maximum number of purchases that can be made with the
    // current data
    if (actualQuantity === -1) {
      actualQuantity = computeMaxAffordable(
        game.player.upgrades[upgrade],
        game.player.resources.currentData
      );
    }

    const cost = computeBulkBuyCost(
      game.player.upgrades[upgrade],
      actualQuantity
    );
    const canAfford = game.player.resources.currentData >= cost;

    return [game.player.upgrades[upgrade], cost, canAfford];
  }, shallow);
}
