import produce from "immer";
import { StateCreator } from "zustand";
import { GameState, GameStore, ResourceActions, Upgrades } from "../types";
import { computeBulkBuyCost } from "../util";

export const createResourceActionsSlice: StateCreator<
  GameStore,
  [],
  [],
  ResourceActions
> = (set) => ({
  buyMaxDataUpgrade(numPurchased) {
    set(
      produce(({ player }: GameState) => {
        const upgrade = player.upgrades[Upgrades.MaxData];
        const cost = computeBulkBuyCost(upgrade, numPurchased);
        if (player.resources.currentData < cost) return;

        player.resources.currentData -= cost;
        player.upgrades[Upgrades.MaxData].numberOwned += numPurchased;

        player.globalMods.player.maxData.multiplier *=
          upgrade.nextUpgradeMultiplier ** numPurchased;
      })
    );
  },
  buyMaxMemoryUpgrade(numPurchased) {
    set(
      produce(({ player }: GameState) => {
        const upgrade = player.upgrades[Upgrades.MaxMemory];
        const cost = computeBulkBuyCost(upgrade, numPurchased);
        if (player.resources.currentData < cost) return;

        player.resources.currentData -= cost;
        player.upgrades[Upgrades.MaxMemory].numberOwned += numPurchased;

        player.globalMods.player.maxMemory.multiplier *=
          upgrade.nextUpgradeMultiplier ** numPurchased;
      })
    );
  },
  buyMinionSpeedUpgrade(numPurchased) {
    set(
      produce(({ player }: GameState) => {
        const upgrade = player.upgrades[Upgrades.MinionSpeed];
        const cost = computeBulkBuyCost(upgrade, numPurchased);
        if (player.resources.currentData < cost) return;

        player.resources.currentData -= cost;
        player.upgrades[Upgrades.MinionSpeed].numberOwned += numPurchased;

        player.globalMods.minion.movementSpeed.multiplier *=
          upgrade.nextUpgradeMultiplier ** numPurchased;
      })
    );
  },
  buyMinionHealthUpgrade(numPurchased) {
    set(
      produce(({ player }: GameState) => {
        const upgrade = player.upgrades[Upgrades.MinionHealth];
        const cost = computeBulkBuyCost(upgrade, numPurchased);
        if (player.resources.currentData < cost) return;

        player.resources.currentData -= cost;
        player.upgrades[Upgrades.MinionHealth].numberOwned += numPurchased;

        player.globalMods.minion.maxHealth.multiplier *=
          upgrade.nextUpgradeMultiplier ** numPurchased;
      })
    );
  },
});
