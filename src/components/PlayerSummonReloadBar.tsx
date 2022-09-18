import { useGameStore } from "../game";

export default function PlayerSummonReloadBar() {
  const playerReloadRemaining = useGameStore(
    (game) => game.stage?.player.summonReloadRemaining
  );
  const playerReloadMax = useGameStore(
    (game) => game.stage?.player.summonReloadTime
  );

  if (playerReloadRemaining === undefined || playerReloadMax === undefined)
    return null;

  const percent = (playerReloadMax - playerReloadRemaining) * 100;
  return (
    <div className="w-full bg-gray-200 h-2.5">
      <div className="bg-blue-600 h-2.5" style={{ width: `${percent}%` }}></div>
    </div>
  );
}
