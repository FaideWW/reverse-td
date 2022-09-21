import { useGameStore } from "../game";
import { Upgrades } from "../game/types";

export function useNextUpgradeCost(upgrade: Upgrades, increment = 1) {
  return useGameStore((game) => {
    if (increment === 1) {
      return game.player.upgrades[upgrade].nextCost;
    }

    const base = game.player.upgrades[upgrade].nextCost;
    const coef = game.player.upgrades[upgrade].nextCostCoefficient;

    return base * coef ** increment;
  });
}
