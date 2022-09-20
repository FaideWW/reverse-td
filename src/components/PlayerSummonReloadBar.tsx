import { useGameStore } from "../game";

export default function PlayerSummonReloadBar() {
  const playerReloadRemaining = useGameStore(
    (game) => game.player.stats.summonReload
  );
  const playerReloadMax = useGameStore(
    (game) => game.player.stats.summonReloadTime
  );

  if (playerReloadRemaining === undefined || playerReloadMax === undefined)
    return null;

  const percent = Math.min(
    (1 - playerReloadRemaining / playerReloadMax) * 100,
    100
  );
  return (
    <div className="w-full bg-gray-200 h-2.5">
      <div className="bg-blue-600 h-2.5" style={{ width: `${percent}%` }}></div>
    </div>
  );
}
