import { FormEvent, useState } from "react";
import { useGameStore } from "../game";

export default function DevConsole() {
  const [open, setOpen] = useState(false);
  const updateConfig = useGameStore((state) => state.updateConfig);
  const config = useGameStore((state) => state.config);

  const handleChangeConfig =
    (key: string) => (e: FormEvent<HTMLInputElement>) => {
      updateConfig({
        [key]: Number(e.currentTarget.value),
      });
    };

  return (
    <div
      className={`absolute bottom-2 right-2 border rounded border-gray-700 p-2 ${
        open ? "opacity-100" : "opacity-25 hover:opacity-100"
      } `}
    >
      <h3
        className="text-lg font-bold cursor-pointer"
        onClick={() => setOpen((open) => !open)}
      >
        Dev console
      </h3>
      {open && (
        <div className="table text-gray-700 gap-1">
          <div className="table-row-group">
            {Object.entries(config).map(([key, val]) => (
              <label key={key} className="text-sm table-row justify-between">
                <div className="table-cell pr-2">{key}</div>
                <input
                  type="number"
                  value={val}
                  onChange={handleChangeConfig(key)}
                  className="table-cell w-12 text-right border border-gray-700"
                />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
