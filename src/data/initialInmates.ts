import { Inmate, BlokHunian } from '../types';
import { LAPAS_BATANG_INMATES } from './lapasBatangInmates';

export const DEFAULT_BLOK_LIST: BlokHunian[] = [
  { id: 'b-a', nama: 'BLOK A', deskripsi: 'Blok Hunian A (Wanita)' },
  { id: 'b-b', nama: 'BLOK B', deskripsi: 'Blok Hunian B' },
  { id: 'b-c', nama: 'BLOK C', deskripsi: 'Blok Hunian C' },
  { id: 'b-d', nama: 'BLOK D', deskripsi: 'Blok Hunian D' },
  { id: 'b-e', nama: 'BLOK E', deskripsi: 'Blok Hunian E' },
  { id: 'b-f', nama: 'BLOK F', deskripsi: 'Blok Hunian F' },
];

export const DAFTAR_BLOK = [
  'Semua Blok',
  'BLOK A',
  'BLOK B',
  'BLOK C',
  'BLOK D',
  'BLOK E',
  'BLOK F',
];

export const DAFTAR_KAMAR = [
  'Semua Kamar',
  ...Array.from(new Set(LAPAS_BATANG_INMATES.map((i) => i.kamarHunian))).sort(),
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

export const INITIAL_INMATES: Inmate[] = LAPAS_BATANG_INMATES;
