import { BlokHunian, Inmate, KamarDetail } from '../types';

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
  'Kamar 07',
  'Kamar 08',
  'Kamar 09',
  'Kamar 10',
];

/**
 * Generate specific room names for a given block name.
 * Priority 1: Rooms defined in kamarDetails for this block
 * Priority 2: Standard fallback rooms (if kamarDetails has no entries for this block)
 * Plus any specific rooms currently occupied by inmates.
 */
export function getSpecificRoomsForBlok(
  blokNama: string,
  inmates: Inmate[] = [],
  kamarDetails: KamarDetail[] = []
): string[] {
  const cleanBlok = blokNama.trim();
  const roomSet = new Set<string>();

  // 1. Check kamarDetails for this block
  const blockDetails = kamarDetails.filter(
    (k) =>
      k.blokNama &&
      (k.blokNama.toLowerCase().trim() === cleanBlok.toLowerCase() ||
        k.namaLengkap.toLowerCase().startsWith(cleanBlok.toLowerCase()))
  );

  if (blockDetails.length > 0) {
    blockDetails.forEach((k) => {
      roomSet.add(k.namaLengkap.trim());
    });
  } else {
    // 1b. Fallback to standard rooms if kamarDetails has no entries for this block
    STANDARD_ROOM_NUMBERS.forEach((roomNum) => {
      roomSet.add(`${cleanBlok} - ${roomNum}`);
    });
  }

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
  inmates: Inmate[] = [],
  kamarDetails: KamarDetail[] = []
): RoomGroup[] {
  return daftarBlok.map((blok) => ({
    blok: blok.nama,
    kamarList: getSpecificRoomsForBlok(blok.nama, inmates, kamarDetails),
  }));
}

/**
 * Get flat list of all specific rooms across all blocks
 */
export function getAllSpecificRoomsFlat(
  daftarBlok: BlokHunian[],
  inmates: Inmate[] = [],
  kamarDetails: KamarDetail[] = []
): string[] {
  const set = new Set<string>();
  daftarBlok.forEach((b) => {
    const rooms = getSpecificRoomsForBlok(b.nama, inmates, kamarDetails);
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
      if ((currentBlok === 'BLOK A' || currentBlok.includes('WANITA') || currentBlok.includes('FLAMBOYAN')) && name === 'BLOK A') return true;
      if ((currentBlok === 'BLOK B' || currentBlok.includes('BOUGENVILLE')) && name === 'BLOK B') return true;
      if ((currentBlok === 'BLOK C' || currentBlok.includes('CLASSIC')) && name === 'BLOK C') return true;
      if ((currentBlok === 'BLOK D' || currentBlok.includes('DAHLIA')) && name === 'BLOK D') return true;
      if ((currentBlok === 'BLOK E' || currentBlok.includes('EDELWEIS')) && name === 'BLOK E') return true;
      if ((currentBlok === 'BLOK F') && name === 'BLOK F') return true;
      return name.includes(currentBlok) || currentBlok.includes(name);
    });

    if (foundBlok) {
      currentBlok = foundBlok;
    } else if (validBlokNames.length > 0) {
      currentBlok = validBlokNames[0];
    } else {
      currentBlok = 'BLOK A';
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

/**
 * Generate default structured room details for all blocks and rooms
 */
export function generateDefaultKamarDetails(
  daftarBlok: BlokHunian[],
  inmates: Inmate[] = []
): KamarDetail[] {
  const result: KamarDetail[] = [];

  daftarBlok.forEach((blok) => {
    const rooms = getSpecificRoomsForBlok(blok.nama, inmates);
    rooms.forEach((roomFull) => {
      const parts = roomFull.split('-');
      const nomorKamar = parts[parts.length - 1].trim();
      const id = `kamar-${blok.nama.toLowerCase().replace(/\s+/g, '-')}-${nomorKamar.toLowerCase().replace(/\s+/g, '-')}`;

      let kategori = 'Hunian Umum';
      let keterangan = `Kamar hunian warga binaan pemasyarakatan ${blok.nama}`;
      let kapasitas = 15;

      if (blok.nama.includes('A') || blok.nama.includes('WANITA')) {
        kategori = 'Hunian Wanita & Tahanan';
        kapasitas = 10;
        keterangan = 'Kamar khusus warga binaan wanita & tahanan titipan';
      } else if (blok.nama.includes('F')) {
        kategori = 'Hunian Khusus';
        kapasitas = 10;
        keterangan = 'Kamar pembinaan khusus / pendalaman';
      }

      if (nomorKamar.toLowerCase().includes('isolasi')) {
        kategori = 'Isolasi / Disiplin';
        kapasitas = 2;
        keterangan = 'Kamar pengasingan / pelanggaran tata tertib';
      } else if (nomorKamar.toLowerCase().includes('mapenaling')) {
        kategori = 'Mapenaling';
        kapasitas = 15;
        keterangan = 'Masa pengenalan lingkungan tahanan / narapidana baru';
      }

      result.push({
        id,
        blokNama: blok.nama,
        nomorKamar,
        namaLengkap: roomFull,
        kapasitas,
        kategori,
        keterangan,
        pjKamar: '',
      });
    });
  });

  return result;
}

