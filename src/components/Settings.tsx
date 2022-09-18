import { FormEvent } from "react";
import { useGameStore } from "../game";

export default function Settings() {
  const settings = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);

  const handleShowFlowField = (e: FormEvent<HTMLInputElement>) => {
    updateSettings({
      showFlowField: e.currentTarget.checked,
    });
  };
  return (
    <label>
      <input
        type="checkbox"
        checked={settings.showFlowField}
        onChange={handleShowFlowField}
      />{" "}
      Show flow field
    </label>
  );
}
