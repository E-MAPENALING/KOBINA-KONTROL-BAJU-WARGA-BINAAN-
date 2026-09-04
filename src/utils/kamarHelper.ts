import { BlokHunian, Inmate } from '../types';

export interface RoomGroup {
  blok: string;
  kamarList: string[];
}

/**
 * Standard room numbers for any block in Lapas
 */
export const STANDARD_ROOM_NUMBERS = [
  'Kamar 01',
  'Kamar 02',
  'Kamar 03',
  'Kamar 04',
  'Kamar 05',
  'Kamar 06',
];

/**
 * Generate specific room names for a given block name.
 * Combines standard rooms and any specific room numbers already registered in inmates.
 */
export function getSpecificRoomsForBlok(
  blokNama: string,
  inmates: Inmate[] = []
): string[] {
  const cleanBlok = blokNama.trim();
  const roomSet = new Set<string>();

  // 1. Add standard rooms for this block
  STANDARD_ROOM_NUMBERS.forEach((roomNum) => {
    roomSet.add(`${cleanBlok} - ${roomNum}`);
  });

  // 2. Add any existing room occupied by inmates in this block
  inmates.forEach((inmate) => {
    if (inmate.blok && inmate.blok.toLowerCase().trim() === cleanBlok.toLowerCase()) {
      if (inmate.kamarHunian) {
        roomSet.add(inmate.kamarHunian.trim());
      } else if (inmate.kamarNomor) {
        roomSet.add(`${cleanBlok} - ${inmate.kamarNomor.trim()}`);
      }
    }
  });

  return Array.from(roomSet).sort((a, b) => {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });
}

/**
 * Get all specific rooms grouped by block
 */
export function getAllRoomsGroupedByBlok(
  daftarBlok: BlokHunian[],
  inmates: Inmate[] = []
): RoomGroup[] {
  return daftarBlok.map((blok) => ({
    blok: blok.nama,
    kamarList: getSpecificRoomsForBlok(blok.nama, inmates),
  }));
}

/**
 * Get flat list of all specific rooms across all blocks
 */
export function getAllSpecificRoomsFlat(
  daftarBlok: BlokHunian[],
  inmates: Inmate[] = []
): string[] {
  const set = new Set<string>();
  daftarBlok.forEach((b) => {
    const rooms = getSpecificRoomsForBlok(b.nama, inmates);
    rooms.forEach((r) => set.add(r));
  });
  return Array.from(set).sort((a, b) => {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });
}

/**
 * Synchronize and normalize an inmate record with the current list of blocks
 */
export function normalizeInmateWithBlok(
  inmate: Inmate,
  daftarBlok: BlokHunian[]
): Inmate {
  const validBlokNames = daftarBlok.map((b) => b.nama.toUpperCase().trim());
  let currentBlok = (inmate.blok || '').trim().toUpperCase();

  // If inmate has obsolete or missing block, assign to matching or first block
  if (!validBlokNames.includes(currentBlok)) {
    // Check if alias / abbreviation match
    const foundBlok = validBlokNames.find((name) => {
      if ((currentBlok === 'BLOK A' || currentBlok.includes('ANGREK')) && (name.includes('ANGGREK') || name.includes('ANGREK'))) return true;
      if (currentBlok === 'BLOK B' && name.includes('BOUGENVILLE')) return true;
      if (currentBlok === 'BLOK C' && name.includes('CLASSIC')) return true;
      if (currentBlok === 'BLOK D' && name.includes('DAHLIA')) return true;
      if (currentBlok === 'BLOK E' && name.includes('EDELWEIS')) return true;
      if (currentBlok === 'BLOK F' && name.includes('FLAMBOYAN')) return true;
      return name.includes(currentBlok) || currentBlok.includes(name);
    });

    if (foundBlok) {
      currentBlok = foundBlok;
    } else if (validBlokNames.length > 0) {
      currentBlok = validBlokNames[0];
    } else {
      currentBlok = 'BLOK ANGGREK';
    }
  }

  // Ensure kamarNomor exists
  let kamarNomor = (inmate.kamarNomor || 'Kamar 01').trim();
  // Strip block prefix from kamarNomor if present
  if (kamarNomor.includes('-')) {
    const parts = kamarNomor.split('-');
    kamarNomor = parts[parts.length - 1].trim();
  }

  // Generate composite kamarHunian
  const kamarHunian = `${currentBlok} - ${kamarNomor}`;

  return {
    ...inmate,
    blok: currentBlok,
    kamarNomor,
    kamarHunian,
  };
}
