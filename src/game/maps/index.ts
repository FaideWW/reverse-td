import type { MapData } from "../types";
import testMap0 from "./testMap0";
import testMap1 from "./testMap1";
import testMap2 from "./testMap2";
import testMap3 from "./testMap3";
import testMap4 from "./testMap4";

const mapRegistry: Record<string, MapData> = {
  [testMap0.id]: testMap0,
  [testMap1.id]: testMap1,
  [testMap2.id]: testMap2,
  [testMap3.id]: testMap3,
  [testMap4.id]: testMap4,
};

const mapPlaylist = [
  testMap0.id,
  testMap1.id,
  testMap2.id,
  testMap3.id,
  testMap4.id,
];

export function getNextMap(currentMapId: string | undefined): MapData {
  let currentMapIndex = mapPlaylist.findIndex(
    (mapId) => mapId === currentMapId
  );
  if (currentMapIndex === undefined) {
    currentMapIndex = -1;
  }

  // For development purposes, we'll just wrap the map playlist
  const nextMapIndex = (Number(currentMapIndex) + 1) % mapPlaylist.length;
  const nextMapId = mapPlaylist[nextMapIndex];
  if (nextMapId === undefined) {
    throw new Error("Map playlist is empty or has a bad reference!");
  }

  const nextMap = mapRegistry[nextMapId];
  if (nextMap === undefined) {
    throw new Error(
      `Map registry does not contain the requested map (id: ${nextMapId})`
    );
  }
  return nextMap;
}
