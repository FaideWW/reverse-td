import { useMemo } from "react";
import { useGameStore } from "../game";
import { resolve } from "../game/util";

export default function PlayerSummonReloadBar() {
  const playerReloadRemaining = useGameStore(
    (game) => game.player.summonReloadRemaining
  );
  const playerReloadMax = useGameStore((game) => game.player.summonReloadTime);

  const resolvedPlayerReloadMax = useMemo(
    () => (playerReloadMax ? resolve(playerReloadMax) : 1),
    [playerReloadMax]
  );

  if (playerReloadRemaining === undefined || playerReloadMax === undefined)
    return null;

  const percent = (1 - playerReloadRemaining / resolvedPlayerReloadMax) * 100;
  return (
    <div className="w-full bg-gray-200 h-2.5">
      <div className="bg-blue-600 h-2.5" style={{ width: `${percent}%` }}></div>
    </div>
  );
}
