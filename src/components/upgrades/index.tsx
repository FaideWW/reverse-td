import MaxMemory from "./MaxMemory";

import MaxData from "./MaxData";

export default function UpgradesMenu() {
  return (
    <div>
      <h3 className="font-bold text-xl">Upgrades</h3>
      <MaxData />
      <MaxMemory />
    </div>
  );
}
