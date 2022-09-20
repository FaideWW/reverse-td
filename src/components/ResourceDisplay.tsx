import DataDisplay from "./resources/DataDisplay";
import MemoryDisplay from "./resources/MemoryDisplay";

export default function ResourceTracker() {
  return (
    <div>
      <h3 className="font-bold text-xl">Resources</h3>
      <MemoryDisplay />
      <DataDisplay />
    </div>
  );
}
