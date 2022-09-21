import DataDisplay from "./DataDisplay";
import MemoryDisplay from "./MemoryDisplay";

export default function ResourceTracker() {
  return (
    <div>
      <h3 className="font-bold text-xl">Resources</h3>
      <MemoryDisplay />
      <DataDisplay />
    </div>
  );
}
