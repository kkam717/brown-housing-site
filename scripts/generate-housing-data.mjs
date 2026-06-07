/**
 * Regenerates public/data/mock_data.json from Brown's Fall 2023 Housing Selection
 * Room List (most recent public inventory PDF from Residential Life), merged with
 * existing sqft / address / image metadata where room keys match.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const ROOM_LIST_PATH = path.join(
  ROOT,
  "scripts",
  "fall-2023-room-list.txt",
);
const OLD_DATA_PATH = path.join(ROOT, "scripts/legacy-mock_data.json");
const OUT_PATH = path.join(ROOT, "public/data/mock_data.json");

/** Official PDF prefix -> canonical building name in the app */
const BUILDING_MAP = {
  "250 BROOK STREET 250 BROOK": "250 Brook Street",
  "BARBOUR HALL BARBOUR": "Barbour Hall",
  "BUXTON HOUSE BUXTON": "Buxton House",
  "CASWELL HALL CASWELL": "Casswell Hall",
  "CHAPIN HOUSE CHAPIN": "Chapin House",
  "DANOFF HALL DANOFF": "Danoff Hall",
  "DIMAN HOUSE DIMAN": "Diman House",
  "GODDARD HOUSE GODDARD": "Goddard House",
  "GRAD CENTER A GRADCTR A": "Grad Center A",
  "GRAD CENTER B GRADCTR B": "Grad Center B",
  "GRAD CENTER C GRADCTR C": "Grad Center C",
  "GRAD CENTER D GRADCTR D": "Grad Center D",
  "GREGORIAN QUAD A GREG A": "V. Gregorian Quad A",
  "GREGORIAN QUAD B GREG B": "V. Gregorian Quad B",
  "HARKNESS HOUSE HARKNESS": "Harkness House",
  "HEGEMAN HALL HEGEMAN": "Hegeman Hall",
  "HOPE COLLEGE HOPE": "Hope College",
  "KING HOUSE KING": "King House",
  "LITTLEFIELD HALL LITTLEFLD": "Littlefield Hall",
  "MACHADO HOUSE MACHADO": "Machado House",
  "MARCY HOUSE MARCY": "Marcy House",
  "MINDEN HALL MINDEN": "Minden Hall",
  "OLNEY HOUSE OLNEY": "Olney",
  "PERKINS HALL PERKINS": "Perkins Hall",
  "SEARS HOUSE SEARS": "Sears House",
  "SLATER HALL SLATER": "Slater Hall",
  "STERNLICHT COMMONS STERNLICHT": "Sternlicht Commons",
  "WAYLAND HOUSE WAYLAND": "Wayland House",
  "YOUNG ORCHARD 10 YO 10": "Young Orchard 10",
  "YOUNG ORCHARD 2 YO 2": "Young Orchard 2",
  "YOUNG ORCHARD 4 YO 4": "Young Orchard 4",
};

/** Building-level defaults for rooms without a legacy match */
const BUILDING_DEFAULTS = {
  "250 Brook Street": {
    address: "250 Brook St, Providence, RI 02906",
    campusside: "South",
    imgurl:
      "https://reslife.brown.edu/sites/default/files/styles/classic_xsml/public/2020-04/250Brook_1.jpg",
    avgSqft: 140,
    sharedbathrooms: false,
    suite: true,
  },
  "Barbour Hall": {
    address: "100 Charlesfield St, Providence, RI 02906",
    campusside: "South",
    imgurl: "https://reslife.brown.edu/sites/default/files/styles/classic_xsml/public/2020-04/Barbour_1.jpg",
    avgSqft: 195,
    sharedbathrooms: false,
    suite: true,
  },
  "Buxton House": {
    address: "29 Brown St, Providence, RI 02904",
    campusside: "South",
    imgurl:
      "https://reslife.brown.edu/sites/default/files/styles/classic_xsml/public/2020-04/Buxton_2.jpg",
    avgSqft: 175,
    sharedbathrooms: true,
    suite: false,
  },
  "Casswell Hall": {
    address: "168 Thayer St, Providence, RI 02906",
    campusside: "South",
    imgurl: "https://reslife.brown.edu/sites/default/files/styles/classic_xsml/public/2020-04/Caswell_1.jpg",
    avgSqft: 180,
    sharedbathrooms: true,
    suite: false,
  },
  "Chapin House": {
    address: "27 Brown St, Providence, RI 02904",
    campusside: "South",
    imgurl:
      "https://reslife.brown.edu/sites/default/files/styles/classic_xsml/public/2020-04/Chapin_1.jpg",
    avgSqft: 170,
    sharedbathrooms: true,
    suite: false,
  },
  "Danoff Hall": {
    address: "141 George St, Providence, RI 02906",
    campusside: "North",
    imgurl: "https://www.brown.edu/about/visit/images/campus-aerial.jpg",
    avgSqft: 165,
    sharedbathrooms: true,
    suite: false,
  },
  "Diman House": {
    address: "29 Brown St, Providence, RI 02904",
    campusside: "South",
    imgurl:
      "https://reslife.brown.edu/sites/default/files/styles/classic_xsml/public/2020-04/Diman_2.jpg",
    avgSqft: 170,
    sharedbathrooms: true,
    suite: false,
  },
  "Goddard House": {
    address: "29 Brown St, Providence, RI 02904",
    campusside: "South",
    imgurl:
      "https://brown.edu/Facilities/Facilities_Management/maps/docx/building_picture/8371_156.jpg",
    avgSqft: 165,
    sharedbathrooms: true,
    suite: false,
  },
  "Grad Center A": {
    address: "40 Charlesfield St, Providence, RI 02906",
    campusside: "South",
    imgurl: "https://i.imgur.com/gM9VEQs.jpg",
    avgSqft: 120,
    sharedbathrooms: false,
    suite: true,
  },
  "Grad Center B": {
    address: "40 Charlesfield St, Providence, RI 02906",
    campusside: "South",
    imgurl: "https://i.imgur.com/gM9VEQs.jpg",
    avgSqft: 120,
    sharedbathrooms: false,
    suite: true,
  },
  "Grad Center C": {
    address: "40 Charlesfield St, Providence, RI 02906",
    campusside: "South",
    imgurl: "https://i.imgur.com/gM9VEQs.jpg",
    avgSqft: 120,
    sharedbathrooms: false,
    suite: true,
  },
  "Grad Center D": {
    address: "40 Charlesfield St, Providence, RI 02906",
    campusside: "South",
    imgurl: "https://i.imgur.com/gM9VEQs.jpg",
    avgSqft: 120,
    sharedbathrooms: false,
    suite: true,
  },
  "V. Gregorian Quad A": {
    address: "95 Brown St, Providence, RI 02906",
    campusside: "South",
    imgurl: "https://www.brown.edu/about/visit/images/campus-aerial.jpg",
    avgSqft: 130,
    sharedbathrooms: false,
    suite: true,
  },
  "V. Gregorian Quad B": {
    address: "95 Brown St, Providence, RI 02906",
    campusside: "South",
    imgurl: "https://www.brown.edu/about/visit/images/campus-aerial.jpg",
    avgSqft: 130,
    sharedbathrooms: false,
    suite: true,
  },
  "Harkness House": {
    address: "29 Brown St, Providence, RI 02904",
    campusside: "South",
    imgurl: "https://i.imgur.com/D1KFD1n.jpg",
    avgSqft: 165,
    sharedbathrooms: true,
    suite: false,
  },
  "Hegeman Hall": {
    address: "69 Brown St, Providence, RI 02906",
    campusside: "South",
    imgurl: "https://www.brown.edu/about/visit/images/campus-aerial.jpg",
    avgSqft: 155,
    sharedbathrooms: true,
    suite: false,
  },
  "Hope College": {
    address: "1 Prospect St, Providence, RI 02906",
    campusside: "North",
    imgurl: "https://www.brown.edu/about/visit/images/campus-aerial.jpg",
    avgSqft: 160,
    sharedbathrooms: true,
    suite: false,
  },
  "King House": {
    address: "11 Prospect St, Providence, RI 02906",
    campusside: "North",
    imgurl: "https://www.brown.edu/about/visit/images/campus-aerial.jpg",
    avgSqft: 165,
    sharedbathrooms: true,
    suite: false,
  },
  "Littlefield Hall": {
    address: "1 Euclid Ave, Providence, RI 02906",
    campusside: "North",
    imgurl: "https://www.brown.edu/about/visit/images/campus-aerial.jpg",
    avgSqft: 175,
    sharedbathrooms: true,
    suite: false,
  },
  "Machado House": {
    address: "83 Waterman St, Providence, RI 02906",
    campusside: "South",
    imgurl: "https://www.brown.edu/about/visit/images/campus-aerial.jpg",
    avgSqft: 160,
    sharedbathrooms: true,
    suite: false,
  },
  "Marcy House": {
    address: "29 Brown St, Providence, RI 02904",
    campusside: "South",
    imgurl: "https://i.imgur.com/vTrVbxT.jpg",
    avgSqft: 170,
    sharedbathrooms: true,
    suite: false,
  },
  "Minden Hall": {
    address: "121 Waterman St, Providence, RI 02906",
    campusside: "South",
    imgurl: "https://www.brown.edu/about/visit/images/campus-aerial.jpg",
    avgSqft: 145,
    sharedbathrooms: false,
    suite: true,
  },
  Olney: {
    address: "29 Brown St, Providence, RI 02904",
    campusside: "South",
    imgurl: "https://i.ibb.co/619nHB0/Olney-1.jpg",
    avgSqft: 190,
    sharedbathrooms: true,
    suite: false,
  },
  "Perkins Hall": {
    address: "167 George St, Providence, RI 02906",
    campusside: "North",
    imgurl: "https://www.brown.edu/about/visit/images/campus-aerial.jpg",
    avgSqft: 150,
    sharedbathrooms: true,
    suite: false,
  },
  "Sears House": {
    address: "29 Brown St, Providence, RI 02904",
    campusside: "South",
    imgurl: "https://i.imgur.com/PhSDUE1.jpg",
    avgSqft: 170,
    sharedbathrooms: true,
    suite: false,
  },
  "Slater Hall": {
    address: "219 Thayer St, Providence, RI 02906",
    campusside: "North",
    imgurl: "https://www.brown.edu/about/visit/images/campus-aerial.jpg",
    avgSqft: 165,
    sharedbathrooms: true,
    suite: false,
  },
  "Sternlicht Commons": {
    address: "353 Brook St, Providence, RI 02906",
    campusside: "South",
    imgurl: "https://www.brown.edu/about/visit/images/campus-aerial.jpg",
    avgSqft: 155,
    sharedbathrooms: true,
    suite: false,
  },
  "Wayland House": {
    address: "36 Waterman St, Providence, RI 02906",
    campusside: "South",
    imgurl: "https://www.brown.edu/about/visit/images/campus-aerial.jpg",
    avgSqft: 165,
    sharedbathrooms: true,
    suite: false,
  },
  "Young Orchard 2": {
    address: "2 Young Orchard Ave, Providence, RI 02906",
    campusside: "South",
    imgurl: "https://www.brown.edu/about/visit/images/campus-aerial.jpg",
    avgSqft: 175,
    sharedbathrooms: true,
    suite: false,
  },
  "Young Orchard 4": {
    address: "4 Young Orchard Ave, Providence, RI 02906",
    campusside: "South",
    imgurl: "https://www.brown.edu/about/visit/images/campus-aerial.jpg",
    avgSqft: 175,
    sharedbathrooms: true,
    suite: false,
  },
  "Young Orchard 10": {
    address: "10 Young Orchard Ave, Providence, RI 02906",
    campusside: "South",
    imgurl: "https://www.brown.edu/about/visit/images/campus-aerial.jpg",
    avgSqft: 175,
    sharedbathrooms: true,
    suite: false,
  },
};

function npeopleFromType(type) {
  if (/single/i.test(type)) return 1;
  if (/double/i.test(type)) return 2;
  if (/triple/i.test(type)) return 3;
  if (/quad/i.test(type)) return 4;
  if (/quint/i.test(type)) return 5;
  return 1;
}

function isSuiteType(type) {
  return /suite|apartment/i.test(type);
}

function joinWrappedLines(rawLines) {
  const joined = [];
  let buffer = "";

  for (const raw of rawLines) {
    const line = raw.trim();
    if (!line) continue;

    buffer = buffer ? `${buffer} ${line}` : line;

    if (/\s(CoEd|Male|Female|DynamicGender)$/.test(buffer)) {
      joined.push(buffer);
      buffer = "";
    }
  }

  if (buffer.trim()) joined.push(buffer.trim());
  return joined;
}

function parseLine(line) {
  const profileMatch = line.match(/\s(\d{2}-\d{2})\s+(.+?)\s+(CoEd|Male|Female|DynamicGender)$/);
  if (!profileMatch) return null;

  let roomType = profileMatch[2].trim();
  let suiteSize = null;

  const sizeMatchSpaced = roomType.match(/^(.+?)\s+(\d+)$/);
  const sizeMatchTight = roomType.match(/^(.+\))\s*(\d+)$/);

  if (sizeMatchSpaced && /suite|apartment/i.test(roomType)) {
    roomType = sizeMatchSpaced[1].trim();
    suiteSize = Number(sizeMatchSpaced[2]);
  } else if (sizeMatchTight) {
    roomType = sizeMatchTight[1].trim();
    suiteSize = Number(sizeMatchTight[2]);
  }

  const beforeProfile = line.slice(0, line.indexOf(` ${profileMatch[1]} `));
  const flMatch = beforeProfile.match(/^(.+?) FL (\d+) (.+)$/);
  if (!flMatch) return null;

  const prefix = flMatch[1].trim();
  const building = BUILDING_MAP[prefix];
  if (!building) return null;

  const floor = Number(flMatch[2]);
  const rest = flMatch[3];

  const bedMatch = rest.match(/(\d+[A-Z]?)-(\d+)$/);
  if (!bedMatch) return null;

  const rnumRaw = bedMatch[1];
  const rnum = parseInt(rnumRaw.replace(/[A-Z]/g, ""), 10);
  if (!Number.isFinite(rnum)) return null;

  return { building, floor, rnum, rnumRaw, roomType, suiteSize, bed: bedMatch[0] };
}

function loadLegacyMeta() {
  const old = JSON.parse(fs.readFileSync(OLD_DATA_PATH, "utf8"));
  const byKey = new Map();
  const byBuilding = new Map();

  for (const d of old.dorms) {
    const building = d.building.trim();
    byKey.set(`${building}|${d.floor}|${d.rnum}`, d);
    if (!byBuilding.has(building)) {
      byBuilding.set(building, {
        sqft: [],
        address: d.address,
        imgurl: d.imgurl,
        campusside: d.campusside,
      });
    }
    byBuilding.get(building).sqft.push(d.sqft);
  }

  for (const [b, info] of byBuilding) {
    info.avgSqft = Math.round(info.sqft.reduce((a, c) => a + c, 0) / info.sqft.length);
  }

  return { byKey, byBuilding };
}

function main() {
  const text = fs.readFileSync(ROOM_LIST_PATH, "utf8");
  const rawLines = text.split("\n").slice(1);
  const lines = joinWrappedLines(rawLines);
  const { byKey, byBuilding } = loadLegacyMeta();

  /** @type {Map<string, {building:string,floor:number,rnum:number,roomType:string,suiteSize:number|null,beds:Set<string>}>} */
  const rooms = new Map();

  let skipped = 0;
  for (const line of lines) {
    const parsed = parseLine(line);
    if (!parsed) {
      skipped++;
      continue;
    }
    const key = `${parsed.building}|${parsed.floor}|${parsed.rnumRaw}`;
    if (!rooms.has(key)) {
      rooms.set(key, {
        building: parsed.building,
        floor: parsed.floor,
        rnum: parsed.rnum,
        roomType: parsed.roomType,
        suiteSize: parsed.suiteSize,
        beds: new Set(),
      });
    }
    const room = rooms.get(key);
    room.beds.add(parsed.bed);
    room.roomType = parsed.roomType;
    room.suiteSize = parsed.suiteSize;
  }

  const dorms = [];
  let id = 0;
  let legacyMatches = 0;

  for (const room of rooms.values()) {
    const legacy = byKey.get(`${room.building}|${room.floor}|${room.rnum}`);
    const legacyBuilding = byBuilding.get(room.building);
    const defaults = BUILDING_DEFAULTS[room.building] ?? {
      address: "Providence, RI",
      campusside: "South",
      imgurl: "https://www.brown.edu/about/visit/images/campus-aerial.jpg",
      avgSqft: 170,
      sharedbathrooms: true,
      suite: false,
    };

    const suite = legacy?.suite ?? defaults.suite ?? isSuiteType(room.roomType);
    const npeople = legacy?.npeople ?? Math.max(npeopleFromType(room.roomType), room.beds.size);
    const sharedbathrooms =
      legacy?.sharedbathrooms ??
      defaults.sharedbathrooms ??
      (!suite && !/suite|apartment/i.test(room.roomType));

    if (legacy) legacyMatches++;

    dorms.push({
      building: room.building,
      npeople,
      floor: room.floor,
      rnum: room.rnum,
      sqft: legacy?.sqft ?? legacyBuilding?.avgSqft ?? defaults.avgSqft,
      address: legacy?.address ?? legacyBuilding?.address ?? defaults.address,
      nwindows: legacy?.nwindows ?? (npeople === 1 ? 2 : 1),
      campusside: legacy?.campusside ?? legacyBuilding?.campusside ?? defaults.campusside,
      suite,
      sharedbathrooms,
      id: id++,
      imgurl: legacy?.imgurl ?? legacyBuilding?.imgurl ?? defaults.imgurl,
    });
  }

  dorms.sort(
    (a, b) =>
      a.building.localeCompare(b.building) || a.floor - b.floor || a.rnum - b.rnum,
  );

  const payload = {
    meta: {
      source: "Brown Residential Life Fall 2023 Housing Selection Room List",
      sourceUrl:
        "https://reslife.brown.edu/sites/default/files/Fall%202023%20Housing%20Selection%20Room%20List.pdf",
      generatedAt: new Date().toISOString().slice(0, 10),
      roomCount: dorms.length,
      buildingCount: new Set(dorms.map((d) => d.building)).size,
    },
    dorms,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2) + "\n");

  console.log(`Joined ${rawLines.length} raw lines into ${lines.length} bed rows (${skipped} skipped)`);
  console.log(`Rooms: ${dorms.length}, legacy matches: ${legacyMatches}`);
  console.log(`Buildings: ${payload.meta.buildingCount}`);
  console.log(`Written to ${OUT_PATH}`);
}

main();
