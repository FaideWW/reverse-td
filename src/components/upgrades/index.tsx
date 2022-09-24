import MaxMemory from "./MaxMemory";

import { useState } from "react";
import MaxData from "./MaxData";
import MinionHealth from "./MinionHealth";
import MinionSpeed from "./MinionSpeed";

const purchaseAmountButtonClass = "px-1 border border-gray-700 rounded";

export default function UpgradesMenu() {
  const [purchaseAmount, setPurchaseAmount] = useState(1);
  return (
    <div>
      <h3 className="font-bold text-xl">Upgrades</h3>
      <div>
        <button
          className={purchaseAmountButtonClass}
          onClick={() => setPurchaseAmount(1)}
        >
          +1
        </button>
        <button
          className={purchaseAmountButtonClass}
          onClick={() => setPurchaseAmount(10)}
        >
          +10
        </button>
        <button
          className={purchaseAmountButtonClass}
          onClick={() => setPurchaseAmount(100)}
        >
          +100
        </button>
        <button
          className={purchaseAmountButtonClass}
          onClick={() => setPurchaseAmount(-1)}
        >
          Max
        </button>
      </div>
      <MaxData purchaseAmount={purchaseAmount} />
      <MaxMemory purchaseAmount={purchaseAmount} />
      <MinionSpeed purchaseAmount={purchaseAmount} />
      <MinionHealth purchaseAmount={purchaseAmount} />
    </div>
  );
}
