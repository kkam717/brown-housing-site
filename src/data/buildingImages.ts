/** Stable HTTPS image URLs per building (Wikimedia Commons + verified hosts). */
function wiki(file: string): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}`;
}

export const BUILDING_IMAGES: Record<string, string> = {
  "250 Brook Street": wiki("Chen Family Hall at Brown University.jpg"),
  "Barbour Hall": wiki("BrownUniversity-BarbourHall.jpg"),
  "Buxton House": wiki("BrownUniversity-BuxtonHouse.jpg"),
  "Casswell Hall": wiki("Metcalf Hall (Brown University, Providence, RI, USA).jpg"),
  "Chapin House":
    "https://reslife.brown.edu/sites/default/files/styles/classic_xsml/public/2020-04/Chapin_1.jpg",
  "Danoff Hall": wiki("Danoff Hall, Brown University residence hall.jpg"),
  "Diman House": wiki("BrownUniversity-DimanHouse.jpg"),
  "Goddard House": wiki("BrownUniversity-GoddardHouse.jpg"),
  "Grad Center A": wiki("BrownUniversity-GradCenterA.jpg"),
  "Grad Center B": wiki("BrownUniversity-GradCenterB.jpg"),
  "Grad Center C": wiki("BrownUniversity-GradCenterC.jpg"),
  "Grad Center D": wiki("BrownUniversity-GradCenterD.jpg"),
  "Harkness House": wiki("BrownUniversity-HarknessHouse.jpg"),
  "Hegeman Hall": wiki("BrownUniversity-HegemanHall.jpg"),
  "Hope College": wiki("BrownUniversity-HopeCollege.jpg"),
  "King House": wiki("BrownUniversity-KingHouse.jpg"),
  "Littlefield Hall": wiki("King House (Brown).jpg"),
  "Machado House": wiki("BrownUniversity-MachadoHouse.jpg"),
  "Marcy House": wiki("BrownUniversity-MarcyHouse.jpg"),
  "Minden Hall": wiki("BrownUniversity-MindenHall.jpg"),
  "Olney": wiki("BrownUniversity-OlneyHouse.jpg"),
  "Perkins Hall": wiki("BrownUniversity-PerkinsHall.jpg"),
  "Sears House": wiki("BrownUniversity-HarknessHouse.jpg"),
  "Slater Hall": wiki("BrownUniversity-SlaterHall.jpg"),
  "Sternlicht Commons": wiki(
    "Sternlicht Commons and Health & Wellness Center at Brown University.jpg",
  ),
  "V. Gregorian Quad A": wiki("BrownUniversity-VartanGregorianQuad.jpg"),
  "V. Gregorian Quad B": wiki("Vartan Gregorian Quad B (Brown) 2.jpg"),
  "Wayland House": wiki("Brown University—Hope College.jpg"),
  "Young Orchard 2": wiki("Wriston Quadrangle—Marcy, Olney, Diman.jpg"),
  "Young Orchard 4": wiki("Wriston Quadrangle—Marcy, Olney, Diman.jpg"),
  "Young Orchard 10": wiki("Wriston Quadrangle—Marcy, Olney, Diman.jpg"),
};

export const DEFAULT_BUILDING_IMAGE = `${import.meta.env.BASE_URL}images/building-placeholder.svg`;

export function getBuildingImage(building: string): string {
  return BUILDING_IMAGES[building.trim()] ?? DEFAULT_BUILDING_IMAGE;
}
