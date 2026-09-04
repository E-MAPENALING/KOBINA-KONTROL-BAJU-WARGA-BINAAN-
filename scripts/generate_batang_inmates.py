import re
import json

# Read and parse all 6 pages
from parse_test import parsed

def get_crime_category(pasal, no_reg):
    pasal_upper = pasal.upper()
    no_reg_upper = no_reg.upper()
    if 'NAPITER' in no_reg_upper or pasal_upper == '15':
        return 'Tindak Pidana Terorisme'
    if 'TPK' in no_reg_upper or '603' in pasal_upper or '2 AYAT (1)' in pasal_upper or '3 JO. PSL. 18' in pasal_upper:
        return 'Tindak Pidana Korupsi'
    if any(p in pasal_upper for p in ['114', '112', '111', '127', '132', '609', '435']):
        return 'Narkotika'
    if any(p in pasal_upper for p in ['81', '82', '80', '76D', '76E', '76C']):
        return 'Perlindungan Anak (UU PA)'
    if '363' in pasal_upper:
        return 'Pencurian (Pasal 363 KUHP)'
    if '362' in pasal_upper:
        return 'Pencurian Biasa (Pasal 362 KUHP)'
    if '372' in pasal_upper:
        return 'Penggelapan (Pasal 372 KUHP)'
    if '378' in pasal_upper:
        return 'Penipuan (Pasal 378 KUHP)'
    if any(p in pasal_upper for p in ['351', '355', '354', '170']):
        return 'Penganiayaan (Pasal 351 KUHP)'
    if any(p in pasal_upper for p in ['480', '488', '476', '477', '473', '479', '426', '427', '486', '459', '415', '407', '306', '307', '262', '492']):
        return 'Tindak Pidana Umum'
    return 'Tindak Pidana Umum'

def extract_alias(nama):
    # check for ALS or ALIAS
    m = re.search(r'\b(?:ALS|ALIAS)\s+([A-Z0-9\'. -]+?)(?:\s+BIN|\s+BINTI|$)', nama, re.IGNORECASE)
    if m:
        return m.group(1).strip()
    # else first word of name
    parts = nama.split()
    if parts:
        return parts[0].strip()
    return ""

# Group by block
by_block = {'A': [], 'B': [], 'C': [], 'D': [], 'E': [], 'F': []}
for item in parsed:
    b = item['blok']
    by_block[b].append(item)

# Room count per block
# A: 2 rooms (Kamar 01: 5, Kamar 02: 4)
# B: 10 rooms (106 inmates -> ~10-11 per room)
# C: 10 rooms (110 inmates -> 11 per room)
# D: 10 rooms (105 inmates -> ~10-11 per room)
# E: 10 rooms (104 inmates -> ~10-11 per room)
# F: 1 room (5 inmates)

room_config = {
    'A': 2,
    'B': 10,
    'C': 10,
    'D': 10,
    'E': 10,
    'F': 1
}

final_inmates = []
wbp_idx = 1

clothing_sizes = ['M', 'L', 'L', 'XL', 'L', 'M', 'XL', 'XXL', 'L', 'L']
conditions = ['Layak Pakai', 'Layak Pakai', 'Layak Pakai', 'Layak Pakai', 'Layak Pakai', 'Layak Pakai', 'Perlu Ganti', 'Layak Pakai']

for block_letter in ['A', 'B', 'C', 'D', 'E', 'F']:
    block_inmates = by_block[block_letter]
    num_rooms = room_config[block_letter]
    total_in_block = len(block_inmates)
    
    for i, item in enumerate(block_inmates):
        # Distribute into rooms
        room_num = (i % num_rooms) + 1
        kamar_nomor = f"Kamar {room_num:02d}"
        blok_name = f"BLOK {block_letter}"
        kamar_hunian = f"{blok_name} - {kamar_nomor}"
        
        status = "Tahanan" if item['noReg'].startswith('A') else "Warga Binaan"
        crime_cat = get_crime_category(item['pasal'], item['noReg'])
        alias = extract_alias(item['nama'])
        
        size = clothing_sizes[wbp_idx % len(clothing_sizes)]
        cond = conditions[wbp_idx % len(conditions)]
        
        # Pakaian list
        pakaian_list = [
            {
                "id": f"p-wbp-{wbp_idx:03d}-1",
                "namaItem": "Baju Seragam",
                "ukuran": size,
                "jumlah": 2,
                "maxJumlah": 2,
                "keterangan": f"Atasan seragam resmi (Pasal: {item['pasal']})"
            },
            {
                "id": f"p-wbp-{wbp_idx:03d}-2",
                "namaItem": "Celana Seragam",
                "ukuran": size,
                "jumlah": 2,
                "maxJumlah": 2,
                "keterangan": "Bawahan seragam resmi"
            },
            {
                "id": f"p-wbp-{wbp_idx:03d}-3",
                "namaItem": "Sarung" if block_letter != 'A' else "Mukena / Jilbab",
                "ukuran": "Standar",
                "jumlah": 1,
                "maxJumlah": 1,
                "keterangan": "Perlengkapan ibadah"
            },
            {
                "id": f"p-wbp-{wbp_idx:03d}-4",
                "namaItem": "Handuk Mandi",
                "ukuran": "Standar",
                "jumlah": 1,
                "maxJumlah": 1,
                "keterangan": "Peralatan sanitasi"
            }
        ]
        
        inmate_obj = {
            "id": f"wbp-{wbp_idx:03d}",
            "noRegister": item['noReg'],
            "nama": item['nama'],
            "alias": alias,
            "status": status,
            "blok": blok_name,
            "kamarNomor": kamar_nomor,
            "kamarHunian": kamar_hunian,
            "lokasiSel": f"LT 1/{room_num}",
            "jenisKejahatan": crime_cat,
            "pakaianList": pakaian_list,
            "riwayatPenukaran": [],
            "ukuranBaju": size,
            "ukuranCelana": size,
            "jumlahBaju": 2,
            "maxBaju": 2,
            "jumlahCelana": 2,
            "maxCelana": 2,
            "jumlahBajuMilik": 2,
            "jatahStandar": 2,
            "kondisiBaju": cond,
            "statusDistribusi": "Lengkap",
            "bajuTerlarangDisita": 0,
            "statusKelayakan": "Memenuhi Syarat" if cond == "Layak Pakai" else "Baju Rusak / Usang",
            "tanggalDistribusiTerakhir": "01/08/2026",
            "tanggalKontrolTerakhir": "03/09/2026",
            "petugasPemeriksa": "Petugas Kamtib Batang",
            "catatanKhusus": f"Pasal Utama: {item['pasal']} (No. Urut: {item['no']})",
            "riwayatKontrol": [
                {
                    "id": f"ctrl-{wbp_idx:03d}-1",
                    "tanggal": "03/09/2026",
                    "petugas": "Seksi Adm Kamtib",
                    "kategoriAksi": "Pemeriksaan Rutin",
                    "jumlahSebelumnya": 2,
                    "jumlahSesudahnya": 2,
                    "jumlahCelanaSebelumnya": 2,
                    "jumlahCelanaSesudahnya": 2,
                    "kondisi": cond,
                    "catatan": f"Pemeriksaan berkala tertib sandang kamar hunian {kamar_hunian}. Sesuai standar SOP."
                }
            ]
        }
        
        final_inmates.append(inmate_obj)
        wbp_idx += 1

print(f"Generated {len(final_inmates)} inmates across all blocks and rooms.")

# Save to ts file
ts_content = """// Data Resmi 439 WBP Lapas Kelas IIB Batang Terdistribusi per Kamar Hunian
import { Inmate } from '../types';

export const LAPAS_BATANG_INMATES: Inmate[] = """ + json.dumps(final_inmates, indent=2, ensure_ascii=False) + ";\n"

with open("src/data/lapasBatangInmates.ts", "w", encoding="utf-8") as f:
    f.write(ts_content)

print("Saved to src/data/lapasBatangInmates.ts successfully!")
