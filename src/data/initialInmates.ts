import { Inmate, BlokHunian } from '../types';
import { LAPAS_BREBES_INMATES } from './lapasBrebesInmates';

export const DEFAULT_BLOK_LIST: BlokHunian[] = [
  { id: 'b-anggrek', nama: 'BLOK ANGGREK', deskripsi: 'Blok Hunian Anggrek (Blok A / Wanita)' },
  { id: 'b-bougenville', nama: 'BLOK BOUGENVILLE', deskripsi: 'Blok Hunian Bougenville (Blok B)' },
  { id: 'b-classic', nama: 'BLOK CLASSIC', deskripsi: 'Blok Hunian Classic (Blok C)' },
  { id: 'b-dahlia', nama: 'BLOK DAHLIA', deskripsi: 'Blok Hunian Dahlia (Blok D)' },
  { id: 'b-edelweis', nama: 'BLOK EDELWEIS', deskripsi: 'Blok Hunian Edelweis (Blok E)' },
  { id: 'b-flamboyan', nama: 'BLOK FLAMBOYAN', deskripsi: 'Blok Hunian Flamboyan (Blok F / Isolasi)' },
];

export const DAFTAR_BLOK = [
  'Semua Blok',
  'BLOK ANGGREK',
  'BLOK BOUGENVILLE',
  'BLOK CLASSIC',
  'BLOK DAHLIA',
  'BLOK EDELWEIS',
  'BLOK FLAMBOYAN',
];

export const DAFTAR_KAMAR = [
  'Semua Kamar',
  ...Array.from(new Set(LAPAS_BREBES_INMATES.map((i) => i.kamarHunian))).sort(),
];

export const DAFTAR_JENIS_KEJAHATAN = [
  'Semua Kejahatan',
  'Narkotika',
  'Tindak Pidana Korupsi',
  'Tindak Pidana Terorisme',
  'Tindak Pidana Umum',
  'Pencurian (Pasal 363 KUHP)',
  'Penggelapan (Pasal 372 KUHP)',
  'Penipuan (Pasal 378 KUHP)',
  'Perlindungan Anak (UU PA)',
  'Penganiayaan (Pasal 351 KUHP)',
  'Pengeroyokan (Pasal 170 KUHP)',
  'Penadahan (Pasal 480 KUHP)',
  'Pencurian Biasa (Pasal 362 KUHP)',
];

export const INITIAL_INMATES: Inmate[] = LAPAS_BREBES_INMATES;
