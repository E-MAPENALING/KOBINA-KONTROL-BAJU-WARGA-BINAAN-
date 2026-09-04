import React, { useState, useEffect, useMemo } from 'react';
import { Inmate, FilterOptions, ActionCategory, ClothingCondition, BlokHunian, PenukaranRecord, KamarDetail } from './types';
import { INITIAL_INMATES, DEFAULT_BLOK_LIST, DAFTAR_KAMAR, DAFTAR_JENIS_KEJAHATAN } from './data/initialInmates';
import { Header } from './components/Header';
import { BlokSidebar } from './components/BlokSidebar';
import { StatSummary } from './components/StatSummary';
import { FilterBar } from './components/FilterBar';
import { InmateTable } from './components/InmateTable';
import { InmateCardView } from './components/InmateCardView';
import { InmateModal } from './components/InmateModal';
import { QuickControlModal } from './components/QuickControlModal';
import { KamarInspectionModal } from './components/KamarInspectionModal';
import { DetailModal } from './components/DetailModal';
import { PrintReportModal } from './components/PrintReportModal';
import { KelolaBlokModal } from './components/KelolaBlokModal';
import { TukarPakaianModal } from './components/TukarPakaianModal';
import { DataSyncBar } from './components/DataSyncBar';
import { DataSyncModal } from './components/DataSyncModal';
import { DetailKamarBlokModal } from './components/DetailKamarBlokModal';
import { DeleteInmateModal } from './components/DeleteInmateModal';
import {
  getSpecificRoomsForBlok,
  getAllRoomsGroupedByBlok,
  getAllSpecificRoomsFlat,
  normalizeInmateWithBlok,
  generateDefaultKamarDetails,
} from './utils/kamarHelper';
import { LayoutGrid, Table, Info, RefreshCw, ShieldCheck, DoorOpen } from 'lucide-react';

const STORAGE_KEY = 'lapas_batang_kontrol_baju_v2';
const BLOK_STORAGE_KEY = 'lapas_batang_daftar_blok_v2';
const KAMAR_STORAGE_KEY = 'lapas_batang_kamar_details_v2';
const LAST_SYNC_KEY = 'lapas_batang_last_sync_v2';

export default function App() {
  // 1. Blok Hunian State with LocalStorage Persistence
  const [daftarBlok, setDaftarBlok] = useState<BlokHunian[]>(() => {
    try {
      const saved = localStorage.getItem(BLOK_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === DEFAULT_BLOK_LIST.length) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading saved blok:', err);
    }
    return DEFAULT_BLOK_LIST;
  });

  useEffect(() => {
    try {
      localStorage.setItem(BLOK_STORAGE_KEY, JSON.stringify(daftarBlok));
    } catch (err) {
      console.error('Error saving blok to localStorage:', err);
    }
  }, [daftarBlok]);

  // Active Selected Blok (for Sidebar navigation)
  const [selectedBlok, setSelectedBlok] = useState<string>('Semua Blok');

  // Kamar Details State (Capacity, Category, Description, Room Leader/PJ per Room)
  const [kamarDetails, setKamarDetails] = useState<KamarDetail[]>(() => {
    try {
      const saved = localStorage.getItem(KAMAR_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading kamarDetails:', err);
    }
    return generateDefaultKamarDetails(DEFAULT_BLOK_LIST, INITIAL_INMATES);
  });

  useEffect(() => {
    try {
      localStorage.setItem(KAMAR_STORAGE_KEY, JSON.stringify(kamarDetails));
    } catch (err) {
      console.error('Error saving kamarDetails to localStorage:', err);
    }
  }, [kamarDetails]);

  // 2. Inmates State with LocalStorage Persistence (Synchronized with 439 Lapas Batang inmates)
  const [inmates, setInmates] = useState<Inmate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 400) {
          return parsed.map((rawItem: any) => {
            const item = normalizeInmateWithBlok(rawItem, DEFAULT_BLOK_LIST);
            // Ensure pakaianList exists
            const pakaianList = item.pakaianList && item.pakaianList.length > 0
              ? item.pakaianList
              : [
                  {
                    id: `p-${item.id}-1`,
                    namaItem: 'Baju Seragam',
                    ukuran: item.ukuranBaju || 'L',
                    jumlah: item.jumlahBaju ?? item.jumlahBajuMilik ?? 2,
                    maxJumlah: item.maxBaju ?? item.jatahStandar ?? 2,
                    keterangan: 'Atasan seragam wajib',
                  },
                  {
                    id: `p-${item.id}-2`,
                    namaItem: 'Celana Seragam',
                    ukuran: item.ukuranCelana || item.ukuranBaju || 'L',
                    jumlah: item.jumlahCelana ?? 2,
                    maxJumlah: item.maxCelana ?? 2,
                    keterangan: 'Bawahan seragam resmi',
                  },
                  {
                    id: `p-${item.id}-3`,
                    namaItem: 'Sarung',
                    ukuran: 'Standar',
                    jumlah: 1,
                    maxJumlah: 1,
                    keterangan: 'Perlengkapan ibadah',
                  },
                  {
                    id: `p-${item.id}-4`,
                    namaItem: 'Handuk Mandi',
                    ukuran: 'Standar',
                    jumlah: 1,
                    maxJumlah: 1,
                    keterangan: 'Peralatan sanitasi',
                  },
                ];

            return {
              ...item,
              pakaianList,
              riwayatKontrol: item.riwayatKontrol || [],
              riwayatPenukaran: item.riwayatPenukaran || [],
              jumlahBaju: item.jumlahBaju ?? item.jumlahBajuMilik ?? 2,
              maxBaju: item.maxBaju ?? item.jatahStandar ?? 2,
              jumlahCelana: item.jumlahCelana ?? 2,
              maxCelana: item.maxCelana ?? 2,
            };
          });
        }
      }
    } catch (err) {
      console.error('Error loading saved inmates:', err);
    }
    return INITIAL_INMATES;
  });

  // Data Sync Timestamp State
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    return localStorage.getItem(LAST_SYNC_KEY) || (new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');
  });

  // Save changes to localStorage in real-time on EVERY inmate mutation
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inmates));
      const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      setLastSyncTime(nowStr);
      localStorage.setItem(LAST_SYNC_KEY, nowStr);
    } catch (err) {
      console.error('Error saving inmates to localStorage:', err);
    }
  }, [inmates]);

  // 3. View Mode (Table vs Card)
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // 4. Filter Options
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    kamarHunian: 'Semua Kamar',
    jenisKejahatan: 'Semua Kejahatan',
    statusTahanan: 'All',
    kondisiBaju: 'All',
    statusDistribusi: 'All',
    hanyaBajuBermasalah: false,
  });

  // Generate all rooms grouped by current blocks (strictly synchronized with kamarDetails)
  const roomGroups = useMemo(() => {
    return getAllRoomsGroupedByBlok(daftarBlok, inmates, kamarDetails);
  }, [daftarBlok, inmates, kamarDetails]);

  // Dynamic Room List strictly matching the current block list and kamarDetails
  const dynamicDaftarKamar = useMemo(() => {
    if (selectedBlok !== 'Semua Blok') {
      const specificRooms = getSpecificRoomsForBlok(selectedBlok, inmates, kamarDetails);
      return ['Semua Kamar', ...specificRooms];
    }
    return ['Semua Kamar', ...getAllSpecificRoomsFlat(daftarBlok, inmates, kamarDetails)];
  }, [inmates, daftarBlok, selectedBlok, kamarDetails]);

  const handleSelectBlok = (blok: string) => {
    setSelectedBlok(blok);
    if (blok !== 'Semua Blok' && filters.kamarHunian !== 'Semua Kamar') {
      if (!filters.kamarHunian.toLowerCase().includes(blok.toLowerCase())) {
        setFilters((prev) => ({ ...prev, kamarHunian: 'Semua Kamar' }));
      }
    }
  };

  // Dynamic Crime Types List from Current Inmates
  const dynamicDaftarKejahatan = useMemo(() => {
    const set = new Set<string>();
    inmates.forEach((i) => {
      if (i.jenisKejahatan) set.add(i.jenisKejahatan.trim());
    });
    DAFTAR_JENIS_KEJAHATAN.forEach((c) => {
      if (c !== 'Semua Kejahatan') set.add(c);
    });
    return ['Semua Kejahatan', ...Array.from(set).sort()];
  }, [inmates]);

  // Filtered Inmates List
  const filteredInmates = useMemo(() => {
    return inmates.filter((inmate) => {
      // 0. Selected Blok from Sidebar
      if (selectedBlok !== 'Semua Blok') {
        const inmateBlok = (inmate.blok || '').toLowerCase().trim();
        const inmateKamar = (inmate.kamarHunian || '').toLowerCase().trim();
        const sel = selectedBlok.toLowerCase().trim();

        let isMatch = inmateBlok === sel || inmateKamar.includes(sel);

        // Flexible match for abbreviations to full names
        if (!isMatch) {
          if ((inmateBlok === 'blok a' || inmateBlok.includes('angrek') || inmateBlok.includes('anggrek')) && (sel.includes('anggrek') || sel.includes('angrek') || sel === 'blok a')) {
            isMatch = true;
          } else if (inmateBlok === 'blok b' && (sel.includes('bougenville') || sel === 'blok b')) {
            isMatch = true;
          } else if (inmateBlok === 'blok c' && (sel.includes('classic') || sel === 'blok c')) {
            isMatch = true;
          } else if (inmateBlok === 'blok d' && (sel.includes('dahlia') || sel === 'blok d')) {
            isMatch = true;
          } else if (inmateBlok === 'blok e' && (sel.includes('edelweis') || sel === 'blok e')) {
            isMatch = true;
          } else if (inmateBlok === 'blok f' && (sel.includes('flamboyan') || sel === 'blok f')) {
            isMatch = true;
          }
        }

        if (!isMatch) {
          return false;
        }
      }

      // 1. Search Query (Nama, Alias, No. Register)
      if (filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchNama = inmate.nama.toLowerCase().includes(q);
        const matchAlias = inmate.alias ? inmate.alias.toLowerCase().includes(q) : false;
        const matchReg = inmate.noRegister.toLowerCase().includes(q);
        if (!matchNama && !matchAlias && !matchReg) return false;
      }

      // 2. Kamar Hunian / Blok Filter
      if (filters.kamarHunian !== 'Semua Kamar') {
        if (inmate.kamarHunian !== filters.kamarHunian && inmate.blok !== filters.kamarHunian) {
          return false;
        }
      }

      // 3. Jenis Kejahatan Filter (manual search)
      if (filters.jenisKejahatan !== 'Semua Kejahatan') {
        if (!inmate.jenisKejahatan.toLowerCase().includes(filters.jenisKejahatan.toLowerCase())) {
          return false;
        }
      }

      // 4. Status Tahanan vs WBP
      if (filters.statusTahanan !== 'All') {
        if (inmate.status !== filters.statusTahanan) return false;
      }

      // 5. Kondisi Baju
      if (filters.kondisiBaju !== 'All') {
        if (inmate.kondisiBaju !== filters.kondisiBaju) return false;
      }

      // 6. Status Distribusi
      if (filters.statusDistribusi !== 'All') {
        if (inmate.statusDistribusi !== filters.statusDistribusi) return false;
      }

      // 7. Hanya Baju Bermasalah (Melebihi Kuota Max, Rusak, Sobek, atau Memiliki Sitaan)
      if (filters.hanyaBajuBermasalah) {
        const isOver = inmate.pakaianList?.some((p) => p.jumlah > p.maxJumlah);
        const isKurang = inmate.pakaianList?.some((p) => p.jumlah < p.maxJumlah);
        const isRusak = inmate.kondisiBaju === 'Perlu Ganti' || inmate.kondisiBaju === 'Rusak/Sobek';
        const hasSitaan = inmate.bajuTerlarangDisita > 0;
        if (!isOver && !isKurang && !isRusak && !hasSitaan) return false;
      }

      return true;
    });
  }, [inmates, filters, selectedBlok]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inmateToEdit, setInmateToEdit] = useState<Inmate | null>(null);

  const [isQuickControlOpen, setIsQuickControlOpen] = useState(false);
  const [inmateForQuickControl, setInmateForQuickControl] = useState<Inmate | null>(null);

  const [isKamarInspectOpen, setIsKamarInspectOpen] = useState(false);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [inmateForDetail, setInmateForDetail] = useState<Inmate | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printTargetKamar, setPrintTargetKamar] = useState<string | undefined>(undefined);
  const [isKelolaBlokOpen, setIsKelolaBlokOpen] = useState(false);

  // Detail Kamar per Blok Modal State
  const [isDetailKamarOpen, setIsDetailKamarOpen] = useState(false);
  const [detailKamarBlok, setDetailKamarBlok] = useState<string>('BLOK B');

  const handleOpenDetailKamar = (blokNama?: string) => {
    if (blokNama && blokNama !== 'Semua Blok') {
      setDetailKamarBlok(blokNama);
    } else if (selectedBlok && selectedBlok !== 'Semua Blok') {
      setDetailKamarBlok(selectedBlok);
    } else {
      setDetailKamarBlok(daftarBlok[0]?.nama || 'BLOK B');
    }
    setIsDetailKamarOpen(true);
  };

  // Inmate Delete Confirmation Modal State (replaces window.confirm)
  const [inmateToDelete, setInmateToDelete] = useState<Inmate | null>(null);

  const handleOpenPrintModal = (kamarName?: string) => {
    if (kamarName) {
      setPrintTargetKamar(kamarName);
    } else if (filters.kamarHunian && filters.kamarHunian !== 'Semua Kamar') {
      setPrintTargetKamar(filters.kamarHunian);
    } else {
      setPrintTargetKamar(undefined);
    }
    setIsPrintModalOpen(true);
  };

  // Penukaran Pakaian Modal
  const [isTukarPakaianOpen, setIsTukarPakaianOpen] = useState(false);
  const [inmateForTukar, setInmateForTukar] = useState<Inmate | null>(null);

  // Data Sync Modal
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Total Sync (Reset back to pure 444 Master Inmates & 6 Blocks Lapas Batang)
  const handleSyncToDummy = () => {
    setInmates(INITIAL_INMATES);
    setDaftarBlok(DEFAULT_BLOK_LIST);
    setSelectedBlok('Semua Blok');
    setFilters({
      searchQuery: '',
      kamarHunian: 'Semua Kamar',
      jenisKejahatan: 'Semua Kejahatan',
      statusTahanan: 'All',
      kondisiBaju: 'All',
      statusDistribusi: 'All',
      hanyaBajuBermasalah: false,
    });
    const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    setLastSyncTime(nowStr);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INMATES));
      localStorage.setItem(BLOK_STORAGE_KEY, JSON.stringify(DEFAULT_BLOK_LIST));
      localStorage.setItem(LAST_SYNC_KEY, nowStr);
    } catch (e) {
      console.error(e);
    }
  };

  // Smart Sync (Preserves live inspection/swap records while synchronizing all 444 WBP & 6 Blocks Lapas Batang)
  const handleSmartSync = () => {
    const liveMap = new Map<string, Inmate>();
    inmates.forEach((item) => {
      if (item.id) liveMap.set(item.id, item);
      if (item.noRegister) liveMap.set(item.noRegister, item);
    });

    const merged = INITIAL_INMATES.map((masterItem) => {
      const live = liveMap.get(masterItem.id) || liveMap.get(masterItem.noRegister);
      if (live) {
        return {
          ...masterItem,
          ...live,
          pakaianList: live.pakaianList && live.pakaianList.length > 0 ? live.pakaianList : masterItem.pakaianList,
          riwayatKontrol: live.riwayatKontrol || [],
          riwayatPenukaran: live.riwayatPenukaran || [],
        };
      }
      return masterItem;
    });

    setInmates(merged);
    setDaftarBlok(DEFAULT_BLOK_LIST);
    const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    setLastSyncTime(nowStr);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      localStorage.setItem(BLOK_STORAGE_KEY, JSON.stringify(DEFAULT_BLOK_LIST));
      localStorage.setItem(LAST_SYNC_KEY, nowStr);
    } catch (e) {
      console.error(e);
    }
  };

  // Import JSON Backup Data Handler
  const handleImportData = (importedInmates: Inmate[], importedBlok?: BlokHunian[]) => {
    if (Array.isArray(importedInmates) && importedInmates.length > 0) {
      const activeBloks = importedBlok && importedBlok.length > 0 ? importedBlok : daftarBlok;
      const normalized = importedInmates.map((raw) => normalizeInmateWithBlok(raw, activeBloks));
      setInmates(normalized);
      if (importedBlok && importedBlok.length > 0) {
        setDaftarBlok(importedBlok);
      }
      const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
      setLastSyncTime(nowStr);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        if (importedBlok) {
          localStorage.setItem(BLOK_STORAGE_KEY, JSON.stringify(importedBlok));
        }
        localStorage.setItem(LAST_SYNC_KEY, nowStr);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Block CRUD Handlers
  const handleTambahBlok = (nama: string, deskripsi?: string) => {
    const id = `b-${Date.now()}`;
    const newBlok: BlokHunian = {
      id,
      nama: nama.toUpperCase(),
      namaBlok: nama.toUpperCase(),
      deskripsi,
    };
    setDaftarBlok((prev) => [...prev, newBlok]);
  };

  const handleEditBlok = (id: string, namaBaru: string, deskripsiBaru?: string) => {
    const oldBlok = daftarBlok.find((b) => b.id === id);
    const oldNama = oldBlok?.nama || oldBlok?.namaBlok;

    setDaftarBlok((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              nama: namaBaru.toUpperCase(),
              namaBlok: namaBaru.toUpperCase(),
              deskripsi: deskripsiBaru ?? b.deskripsi,
            }
          : b
      )
    );

    if (oldNama && oldNama.toLowerCase() !== namaBaru.toLowerCase()) {
      setInmates((prev) =>
        prev.map((inmate) => {
          if (inmate.blok?.toLowerCase() === oldNama.toLowerCase()) {
            return {
              ...inmate,
              blok: namaBaru.toUpperCase(),
              kamarHunian: inmate.kamarHunian.replace(oldNama, namaBaru.toUpperCase()),
            };
          }
          return inmate;
        })
      );
      if (selectedBlok.toLowerCase() === oldNama.toLowerCase()) {
        setSelectedBlok(namaBaru.toUpperCase());
      }
    }
  };

  const handleHapusBlok = (id: string, namaBlok: string) => {
    setDaftarBlok((prev) => prev.filter((b) => b.id !== id));
    if (selectedBlok.toLowerCase() === namaBlok.toLowerCase()) {
      setSelectedBlok('Semua Blok');
    }
  };

  // Execute Clothing Exchange (1-in 1-out)
  const handleSaveTukarPakaian = (inmateId: string, swapRecord: PenukaranRecord) => {
    const todayStr = new Date().toISOString().split('T')[0];

    setInmates((prev) =>
      prev.map((inmate) => {
        if (inmate.id !== inmateId) return inmate;

        const newRiwayatPenukaran = [swapRecord, ...(inmate.riwayatPenukaran || [])];

        const newKontrolRecord = {
          id: `r-${Date.now()}`,
          tanggal: todayStr,
          petugas: swapRecord.petugas,
          kategoriAksi: 'Penukaran Pakaian 1:1' as ActionCategory,
          jumlahSebelumnya: inmate.jumlahBajuMilik,
          jumlahSesudahnya: inmate.jumlahBajuMilik,
          kondisi: 'Layak Pakai' as ClothingCondition,
          catatan: `Penukaran Sandang (1:1): Menukar ${swapRecord.jumlah} pcs "${swapRecord.itemDitukar}" (${swapRecord.kondisiLama}) dengan "${swapRecord.itemPengganti}". Alasan: ${swapRecord.alasan}.`,
        };

        return {
          ...inmate,
          riwayatPenukaran: newRiwayatPenukaran,
          riwayatKontrol: [newKontrolRecord, ...inmate.riwayatKontrol],
          kondisiBaju: 'Layak Pakai',
          tanggalKontrolTerakhir: todayStr,
          petugasPemeriksa: swapRecord.petugas,
        };
      })
    );

    if (inmateForDetail && inmateForDetail.id === inmateId) {
      setInmateForDetail((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          riwayatPenukaran: [swapRecord, ...(prev.riwayatPenukaran || [])],
        };
      });
    }
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      kamarHunian: 'Semua Kamar',
      jenisKejahatan: 'Semua Kejahatan',
      statusTahanan: 'All',
      kondisiBaju: 'All',
      statusDistribusi: 'All',
      hanyaBajuBermasalah: false,
    });
    setSelectedBlok('Semua Blok');
  };

  const handleFilterAlerts = () => {
    setFilters((prev) => ({
      ...prev,
      hanyaBajuBermasalah: true,
    }));
  };

  const handleResetData = () => {
    if (window.confirm('Kembalikan semua data pakaian dan blok hunian ke data awal standar Lapas?')) {
      setInmates(INITIAL_INMATES);
      setDaftarBlok(DEFAULT_BLOK_LIST);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(BLOK_STORAGE_KEY);
      handleResetFilters();
    }
  };

  // Quick inline adjustment for clothing
  const handleQuickAdjustClothing = (inmateId: string, delta: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setInmates((prev) =>
      prev.map((i) => {
        if (i.id !== inmateId) return i;
        const currentBaju = i.jumlahBaju ?? i.jumlahBajuMilik ?? 2;
        const newBaju = Math.max(0, currentBaju + delta);

        const updatedPakaianList = (i.pakaianList || []).map((p) => {
          if (p.namaItem.toLowerCase().includes('baju')) {
            return { ...p, jumlah: Math.max(0, p.jumlah + delta) };
          }
          return p;
        });

        return {
          ...i,
          jumlahBaju: newBaju,
          jumlahBajuMilik: newBaju,
          pakaianList: updatedPakaianList,
          tanggalKontrolTerakhir: todayStr,
        };
      })
    );
  };

  // Add / Edit Inmate
  const handleSaveInmate = (
    inmateData: Omit<Inmate, 'id' | 'riwayatKontrol'>,
    idToEdit?: string
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];

    if (idToEdit) {
      setInmates((prev) =>
        prev.map((i) => {
          if (i.id !== idToEdit) return i;
          return {
            ...i,
            ...inmateData,
            tanggalKontrolTerakhir: todayStr,
          };
        })
      );
    } else {
      const newId = `wbp-${Date.now()}`;
      const newInmate: Inmate = {
        id: newId,
        ...inmateData,
        riwayatPenukaran: [],
        riwayatKontrol: [
          {
            id: `r-${Date.now()}`,
            tanggal: todayStr,
            petugas: inmateData.petugasPemeriksa || 'Petugas Registrasi',
            kategoriAksi: 'Distribusi Jatah',
            jumlahSebelumnya: 0,
            jumlahSesudahnya: inmateData.jumlahBajuMilik,
            kondisi: inmateData.kondisiBaju,
            catatan: 'Registrasi awal pakaian narapidana / tahanan dan penentuan kuota maksimal sandang.',
          },
        ],
      };
      setInmates((prev) => [newInmate, ...prev]);
    }
  };

  // Quick Control Record
  const handleSaveQuickControl = (
    inmateId: string,
    data: {
      kategoriAksi: ActionCategory;
      jumlahSesudahnya: number;
      jumlahCelanaSesudahnya?: number;
      kondisi: ClothingCondition;
      bajuTerlarangDisita: number;
      petugas: string;
      catatan: string;
    }
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];

    setInmates((prev) =>
      prev.map((i) => {
        if (i.id !== inmateId) return i;

        const newRecord = {
          id: `r-${Date.now()}`,
          tanggal: todayStr,
          petugas: data.petugas,
          kategoriAksi: data.kategoriAksi,
          jumlahSebelumnya: i.jumlahBajuMilik,
          jumlahSesudahnya: data.jumlahSesudahnya,
          kondisi: data.kondisi,
          catatan: `${data.catatan} (Disita pakaian non-standar: ${data.bajuTerlarangDisita} potong)`,
        };

        const finalBaju = data.jumlahSesudahnya;
        const finalCelana = data.jumlahCelanaSesudahnya ?? i.jumlahCelana;
        const maxBaju = i.maxBaju ?? 2;
        const maxCelana = i.maxCelana ?? 2;

        const updatedPakaianList = (i.pakaianList || []).map((p) => {
          if (p.namaItem.toLowerCase().includes('baju')) {
            return { ...p, jumlah: finalBaju };
          }
          if (p.namaItem.toLowerCase().includes('celana') && data.jumlahCelanaSesudahnya !== undefined) {
            return { ...p, jumlah: finalCelana };
          }
          return p;
        });

        const statusDistribusi =
          finalBaju > maxBaju || finalCelana > maxCelana
            ? 'Kelebihan Baju'
            : finalBaju === maxBaju && finalCelana === maxCelana
            ? 'Sudah Lengkap'
            : finalBaju === 0
            ? 'Belum Dapat'
            : 'Sebagian Saja';

        const statusKelayakan =
          finalBaju > maxBaju || finalCelana > maxCelana || data.bajuTerlarangDisita > 0
            ? 'Baju Berlebih (Rentan Gangguan Kamtib)'
            : data.kondisi === 'Perlu Ganti' || data.kondisi === 'Rusak/Sobek'
            ? 'Baju Rusak / Usang'
            : finalBaju < maxBaju || finalCelana < maxCelana
            ? 'Kurang Jatah'
            : 'Memenuhi Syarat';

        return {
          ...i,
          jumlahBaju: finalBaju,
          jumlahBajuMilik: finalBaju,
          jumlahCelana: finalCelana,
          pakaianList: updatedPakaianList,
          kondisiBaju: data.kondisi,
          bajuTerlarangDisita: data.bajuTerlarangDisita,
          statusDistribusi,
          statusKelayakan,
          tanggalKontrolTerakhir: todayStr,
          petugasPemeriksa: data.petugas,
          riwayatKontrol: [newRecord, ...i.riwayatKontrol],
        };
      })
    );
  };

  // Bulk Cell Room Inspection
  const handleBatchInspectKamar = (
    kamarName: string,
    petugas: string,
    catatan: string,
    updatedOccupants: Inmate[]
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updateMap = new Map<string, Inmate>();
    updatedOccupants.forEach((o) => updateMap.set(o.id, o));

    setInmates((prev) =>
      prev.map((i) => {
        if (!updateMap.has(i.id)) return i;
        const updated = updateMap.get(i.id)!;

        const newRecord = {
          id: `r-${Date.now()}-${i.id}`,
          tanggal: todayStr,
          petugas: petugas,
          kategoriAksi: 'Sidak Kamar' as ActionCategory,
          jumlahSebelumnya: i.jumlahBajuMilik,
          jumlahSesudahnya: updated.jumlahBajuMilik,
          kondisi: updated.kondisiBaju,
          catatan: `Sidak serentak kamar ${kamarName}: ${catatan}`,
        };

        return {
          ...updated,
          tanggalKontrolTerakhir: todayStr,
          petugasPemeriksa: petugas,
          riwayatKontrol: [newRecord, ...i.riwayatKontrol],
        };
      })
    );
  };

  // Delete inmate using custom in-app confirmation modal
  const handleDeleteInmate = (id: string, nama: string) => {
    const target = inmates.find((i) => i.id === id);
    if (target) {
      setInmateToDelete(target);
    } else {
      setInmates((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleConfirmDeleteInmate = () => {
    if (!inmateToDelete) return;
    setInmates((prev) => prev.filter((i) => i.id !== inmateToDelete.id));
    setInmateToDelete(null);
  };

  // Open Tukar Pakaian modal for inmate
  const handleOpenTukarPakaian = (inmate: Inmate) => {
    setInmateForTukar(inmate);
    setIsTukarPakaianOpen(true);
  };

  const daftarBlokNames = useMemo(() => {
    return daftarBlok.map((b) => b.nama);
  }, [daftarBlok]);

  return (
    <div className="min-h-screen kobina-bg text-slate-100 flex flex-col font-sans antialiased relative selection:bg-amber-400 selection:text-slate-950">
      {/* Background Constellation & Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none kobina-constellation opacity-40 z-0" />
      
      {/* Header */}
      <Header
        totalInmates={inmates.length}
        onOpenAddModal={() => {
          setInmateToEdit(null);
          setIsAddModalOpen(true);
        }}
        onOpenKamarInspect={() => setIsKamarInspectOpen(true)}
        onOpenPrintModal={() => handleOpenPrintModal()}
        onOpenKelolaBlok={() => setIsKelolaBlokOpen(true)}
        onOpenDetailKamar={() => handleOpenDetailKamar()}
        onResetData={handleResetData}
      />

      {/* Main Content Area: Two-Column Layout matching the image */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10 space-y-6">
        
        {/* Statistics Cards */}
        <StatSummary
          inmates={inmates}
          onFilterAlerts={handleFilterAlerts}
        />

        {/* Data Synchronization Status Bar (Live vs Data Dami) */}
        <DataSyncBar
          liveInmates={inmates}
          dummyInmates={INITIAL_INMATES}
          liveBlok={daftarBlok}
          dummyBlok={DEFAULT_BLOK_LIST}
          selectedBlok={selectedBlok}
          lastSyncTime={lastSyncTime}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          onQuickSyncToDummy={handleSyncToDummy}
          onSmartSync={handleSmartSync}
        />

        {/* Two-column Container: Sidebar on Left, Content on Right */}
        <div className="flex flex-col lg:flex-row items-start gap-6">
          
          {/* Left Navigation: Blok Hunian Sidebar */}
          <BlokSidebar
            daftarBlok={daftarBlok}
            selectedBlok={selectedBlok}
            onSelectBlok={handleSelectBlok}
            inmates={inmates}
            onOpenKelolaBlok={() => setIsKelolaBlokOpen(true)}
            onOpenDetailKamar={handleOpenDetailKamar}
            onEditBlok={handleEditBlok}
            onHapusBlok={handleHapusBlok}
          />

          {/* Right Main Column */}
          <div className="flex-1 w-full space-y-5 min-w-0">
            
            {/* Quick Information Banner */}
            <div className="bg-[#09203d]/95 backdrop-blur-md border border-blue-900/70 rounded-2xl p-3.5 text-xs text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white uppercase tracking-wider font-condensed">
                    STANDAR SANDANG & SOP PERGANTIAN PAKAIAN:
                  </span>{' '}
                  <span className="text-slate-200 font-medium">
                    Bila kuota pakaian telah maksimal, penambahan dilarang. Penggantian wajib melalui mekanisme{' '}
                    <strong className="text-amber-300 font-bold">Tukar Baju (1-in 1-out)</strong> dengan pencatatan riwayat pergantian.
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                <span className="text-[11px] text-slate-300 font-semibold mr-1 hidden sm:inline">Mode:</span>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-xl text-xs font-bold transition shadow-xs ${
                    viewMode === 'table' 
                      ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20 border border-amber-200' 
                      : 'bg-[#07182e] text-slate-300 hover:text-white border border-blue-900/60'
                  }`}
                  title="Tampilan Tabel"
                >
                  <Table className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-2 rounded-xl text-xs font-bold transition shadow-xs ${
                    viewMode === 'card' 
                      ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20 border border-amber-200' 
                      : 'bg-[#07182e] text-slate-300 hover:text-white border border-blue-900/60'
                  }`}
                  title="Tampilan Kartu"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter & Search Bar with specific room groups */}
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              onResetFilters={handleResetFilters}
              daftarKamar={dynamicDaftarKamar}
              daftarKejahatan={dynamicDaftarKejahatan}
              totalResults={filteredInmates.length}
              totalData={inmates.length}
              selectedBlok={selectedBlok}
              roomGroups={roomGroups}
              onOpenPrintModal={handleOpenPrintModal}
            />

            {/* Selected Block Banner Indicator */}
            {selectedBlok !== 'Semua Blok' && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/40 rounded-xl px-4 py-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-slate-300">
                    Menyaring data untuk blok:{' '}
                    <strong className="text-white font-condensed text-sm tracking-wider uppercase">
                      {selectedBlok}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleOpenDetailKamar(selectedBlok)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 hover:text-white border border-amber-400/50 font-bold transition text-xs shadow-xs"
                    title={`Lihat, Edit, dan Kelola Kamar ${selectedBlok}`}
                  >
                    <DoorOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Detail & Edit Kamar {selectedBlok}</span>
                  </button>
                  <button
                    onClick={() => setSelectedBlok('Semua Blok')}
                    className="text-cyan-300 hover:text-white underline font-semibold transition"
                  >
                    Tampilkan Semua Blok
                  </button>
                </div>
              </div>
            )}

            {/* Data View (Table or Card) */}
            {viewMode === 'table' ? (
              <InmateTable
                inmates={filteredInmates}
                onOpenDetail={(inmate) => {
                  setInmateForDetail(inmate);
                  setIsDetailOpen(true);
                }}
                onOpenQuickControl={(inmate) => {
                  setInmateForQuickControl(inmate);
                  setIsQuickControlOpen(true);
                }}
                onOpenEdit={(inmate) => {
                  setInmateToEdit(inmate);
                  setIsAddModalOpen(true);
                }}
                onDelete={handleDeleteInmate}
                onOpenTukarPakaian={handleOpenTukarPakaian}
                onQuickAdjustClothing={handleQuickAdjustClothing}
              />
            ) : (
              <InmateCardView
                inmates={filteredInmates}
                onOpenDetail={(inmate) => {
                  setInmateForDetail(inmate);
                  setIsDetailOpen(true);
                }}
                onOpenQuickControl={(inmate) => {
                  setInmateForQuickControl(inmate);
                  setIsQuickControlOpen(true);
                }}
                onOpenEdit={(inmate) => {
                  setInmateToEdit(inmate);
                  setIsAddModalOpen(true);
                }}
                onDelete={handleDeleteInmate}
                onOpenTukarPakaian={handleOpenTukarPakaian}
              />
            )}

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="no-print bg-[#05151f]/90 border-t border-[#144963] mt-auto py-5 text-center text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>KOBINA (Kontrol Baju Warga Binaan) • Sistem Pengawasan Sandang & Inventarisasi Pakaian</span>
          <span className="text-cyan-400 font-mono text-[11px]">Subseksi Registrasi & Bimbingan Kemasyarakatan Lapas Batang</span>
        </div>
      </footer>

      {/* Modals */}
      <InmateModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setInmateToEdit(null);
        }}
        inmateToEdit={inmateToEdit}
        onSave={handleSaveInmate}
        daftarBlok={daftarBlokNames}
        onOpenKelolaBlok={() => setIsKelolaBlokOpen(true)}
      />

      <KelolaBlokModal
        isOpen={isKelolaBlokOpen}
        onClose={() => setIsKelolaBlokOpen(false)}
        daftarBlok={daftarBlok}
        inmates={inmates}
        onTambahBlok={handleTambahBlok}
        onEditBlok={handleEditBlok}
        onHapusBlok={handleHapusBlok}
        onOpenDetailKamar={handleOpenDetailKamar}
      />

      <TukarPakaianModal
        isOpen={isTukarPakaianOpen}
        onClose={() => {
          setIsTukarPakaianOpen(false);
          setInmateForTukar(null);
        }}
        inmate={inmateForTukar}
        onSaveTukar={handleSaveTukarPakaian}
      />

      <QuickControlModal
        isOpen={isQuickControlOpen}
        onClose={() => {
          setIsQuickControlOpen(false);
          setInmateForQuickControl(null);
        }}
        inmate={inmateForQuickControl}
        onSave={handleSaveQuickControl}
      />

      <KamarInspectionModal
        isOpen={isKamarInspectOpen}
        onClose={() => setIsKamarInspectOpen(false)}
        inmates={inmates}
        daftarKamar={dynamicDaftarKamar}
        roomGroups={roomGroups}
        onBatchInspect={handleBatchInspectKamar}
        onPrintKamar={handleOpenPrintModal}
      />

      <DetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setInmateForDetail(null);
        }}
        inmate={inmateForDetail}
        onOpenQuickControl={(inmate) => {
          setInmateForQuickControl(inmate);
          setIsQuickControlOpen(true);
        }}
        onOpenTukarPakaian={handleOpenTukarPakaian}
      />

      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setPrintTargetKamar(undefined);
        }}
        inmates={inmates}
        daftarBlok={daftarBlok}
        roomGroups={roomGroups}
        initialKamar={printTargetKamar || (filters.kamarHunian !== 'Semua Kamar' ? filters.kamarHunian : undefined)}
        initialBlok={selectedBlok !== 'Semua Blok' ? selectedBlok : undefined}
      />

      {/* Data Sync Live & Dami Comparison Modal */}
      <DataSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        liveInmates={inmates}
        dummyInmates={INITIAL_INMATES}
        liveBlok={daftarBlok}
        dummyBlok={DEFAULT_BLOK_LIST}
        onSyncToDummy={handleSyncToDummy}
        onSmartSync={handleSmartSync}
        onImportData={handleImportData}
        lastSyncTime={lastSyncTime}
      />

      {/* Detail & Edit Kamar Hunian per Blok Modal */}
      <DetailKamarBlokModal
        isOpen={isDetailKamarOpen}
        onClose={() => setIsDetailKamarOpen(false)}
        daftarBlok={daftarBlok}
        initialBlok={detailKamarBlok}
        inmates={inmates}
        kamarDetails={kamarDetails}
        onUpdateKamarDetails={(updated) => setKamarDetails(updated)}
        onUpdateInmates={(updated) => setInmates(updated)}
        onOpenSidakKamar={() => {
          setIsDetailKamarOpen(false);
          setIsKamarInspectOpen(true);
        }}
      />

      {/* In-App Confirmation Modal for Inmate Deletion */}
      <DeleteInmateModal
        isOpen={Boolean(inmateToDelete)}
        inmate={inmateToDelete}
        onClose={() => setInmateToDelete(null)}
        onConfirm={handleConfirmDeleteInmate}
      />

    </div>
  );
}
