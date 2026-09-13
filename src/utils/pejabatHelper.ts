/**
 * Helper utility for managing official signers / pejabat names in KOBINA.
 * Persists customized officer names and NIP in localStorage.
 */

export interface PejabatConfig {
  kota: string;
  judulPetugas: string;
  namaPetugas: string;
  nipPetugas: string;
  judulAtasan: string;
  namaAtasan: string;
  nipAtasan: string;
}

export const DEFAULT_PEJABAT_CONFIG: PejabatConfig = {
  kota: 'Batang',
  judulPetugas: 'PETUGAS',
  namaPetugas: 'SURYANTO, A.Md.P., S.H.',
  nipPetugas: '19850615 200801 1 001',
  judulAtasan: 'Kepala Kesatuan Pengamanan Lapas (Ka. KPR)',
  namaAtasan: 'H. SUHARTONO, S.Sos., M.Si.',
  nipAtasan: '19780412 200212 1 002',
};

const PEJABAT_STORAGE_KEY = 'kobina_pejabat_config';

export function getSavedPejabatConfig(): PejabatConfig {
  try {
    const saved = localStorage.getItem(PEJABAT_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_PEJABAT_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load pejabat config from localStorage:', e);
  }
  return DEFAULT_PEJABAT_CONFIG;
}

export function savePejabatConfig(config: PejabatConfig): void {
  try {
    localStorage.setItem(PEJABAT_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save pejabat config to localStorage:', e);
  }
}
