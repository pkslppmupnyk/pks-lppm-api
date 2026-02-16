const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, UnderlineType, ImageRun } = require("docx");
const fs = require("fs");
const path = require("path");

// --- HELPER FUNCTIONS ---

// 1. Helper: Mengubah string menjadi Title Case (Huruf Besar Awal Kata) untuk Judul di paragraf pembuka
function toTitleCase(str) {
    if (!str) return "";
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// 2. Helper: Mengubah angka menjadi teks (Terbilang Sederhana untuk Tanggal)
function numberToText(num) {
    const angka = ["Nol", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
    if (num < 12) return angka[num];
    if (num < 20) return numberToText(num - 10) + " Belas";
    if (num < 100) return numberToText(Math.floor(num / 10)) + " Puluh " + (num % 10 !== 0 ? numberToText(num % 10) : "");
    if (num < 200) return "Seratus " + (num % 100 !== 0 ? numberToText(num % 100) : "");
    if (num < 1000) return numberToText(Math.floor(num / 100)) + " Ratus " + (num % 100 !== 0 ? numberToText(num % 100) : "");
    if (num < 2000) return "Seribu " + (num % 1000 !== 0 ? numberToText(num % 1000) : "");
    if (num >= 2000) {
        // Khusus tahun 2000an
        return "Dua Ribu " + numberToText(num % 1000);
    }
    return num.toString();
}

// 3. Helper: Mendapatkan Nama Hari
function getDayName(date) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[date.getDay()];
}

// 4. Helper: Mendapatkan Nama Bulan
function getMonthName(date) {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return months[date.getMonth()];
}

const generatePksDocument = async (pks) => {
    // --- PERSIAPAN DATA ---

    // 1. Tanggal (Hari ini / Tanggal Pembuatan)
    const today = new Date(); 
    const hari = getDayName(today);
    const tanggalText = numberToText(today.getDate()); // Misal: "Sepuluh"
    const bulan = getMonthName(today);
    const tahunText = toTitleCase(numberToText(today.getFullYear())); // Misal: "Dua Ribu Dua Puluh Enam"

    // 2. Data Pihak Pertama (UPN) - Statis/Config
    const pihakPertama = {
        nama: "PROF. DR. MOHAMAD IRHAS EFFENDI, M.SI",
        jabatan: "Rektor UPN \"Veteran\" Yogyakarta",
        alamat: "Jl. SWK 104 (Lingkar Utara), Condongcatur, Yogyakarta 55283",
        instansi: "Universitas Pembangunan Nasional \"Veteran\" Yogyakarta"
    };

    // 3. Data Pihak Kedua (Mitra) - Dinamis dari DB
    const pihakKedua = {
        nama: pks.nama_mitra ? pks.nama_mitra.toUpperCase() : "NAMA MITRA", // Nama Mitra UPPERCASE
        jabatan: pks.jabatan_mitra || "Pimpinan Mitra",
        alamat: pks.alamat_mitra || "Alamat Mitra",
        instansi: pks.instansi_mitra || "Instansi Mitra"
    };

    // 4. Load Images (Logo)
    let logoUpnBuffer = null;
    let logoMitraBuffer = null;

    try {
        // Load Logo UPN (Default)
        const upnLogoPath = path.join(__dirname, "../public/images/logo_upn.png");
        if (fs.existsSync(upnLogoPath)) {
            logoUpnBuffer = fs.readFileSync(upnLogoPath);
        }

        // Load Logo Mitra (Jika ada di object pks, misal pks.logo_url atau path file)
        // Disini kita beri logika fallback: Jika tidak ada logo mitra, bisa kosong atau default
        // Contoh implementasi sederhana jika ada path logo mitra:
        if (pks.logo_mitra_path && fs.existsSync(pks.logo_mitra_path)) {
             logoMitraBuffer = fs.readFileSync(pks.logo_mitra_path);
        } else {
             // Opsional: Gunakan buffer kosong atau logo placeholder jika diperlukan
             // logoMitraBuffer = ...
        }

    } catch (error) {
        console.error("Error loading images:", error);
    }

    // --- STRUKTUR DOKUMEN ---
    
    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 1440, // 1 inch (dalam twips, 1440 twips = 1 inch)
                        right: 1440,
                        bottom: 1440,
                        left: 1440,
                    },
                },
            },
            children: [
                // ==========================================
                // 1. HEADER (LOGO)
                // ==========================================
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: BorderStyle.NONE, 
                    rows: [
                        new TableRow({
                            children: [
                                // KOLOM KIRI: Logo Mitra
                                new TableCell({
                                    width: { size: 20, type: WidthType.PERCENTAGE },
                                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                                    children: [
                                        new Paragraph({
                                            alignment: AlignmentType.LEFT,
                                            children: logoMitraBuffer ? [
                                                new ImageRun({
                                                    data: logoMitraBuffer,
                                                    transformation: { width: 80, height: 80 },
                                                }),
                                            ] : [], // Jika tidak ada logo, kosong
                                        })
                                    ],
                                }),
                                // KOLOM TENGAH: Spacer (Kosong)
                                new TableCell({
                                    width: { size: 60, type: WidthType.PERCENTAGE },
                                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                                    children: [],
                                }),
                                // KOLOM KANAN: Logo UPN (Dibalik ke Kanan)
                                new TableCell({
                                    width: { size: 20, type: WidthType.PERCENTAGE },
                                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                                    children: [
                                        new Paragraph({
                                            alignment: AlignmentType.RIGHT,
                                            children: logoUpnBuffer ? [
                                                new ImageRun({
                                                    data: logoUpnBuffer,
                                                    transformation: { width: 80, height: 80 },
                                                }),
                                            ] : [],
                                        })
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),

                new Paragraph({ text: "" }), // Spasi Kosong

                // ==========================================
                // 2. JUDUL UTAMA
                // ==========================================
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "PERJANJIAN KERJA SAMA", bold: true, font: "Times New Roman", size: 24 })],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "ANTARA", bold: true, font: "Times New Roman", size: 24 })],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "UNIVERSITAS PEMBANGUNAN NASIONAL “VETERAN” YOGYAKARTA", bold: true, font: "Times New Roman", size: 24 })],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "DENGAN", bold: true, font: "Times New Roman", size: 24 })],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ 
                        text: pihakKedua.instansi.toUpperCase(), 
                        bold: true, 
                        font: "Times New Roman", 
                        size: 24 
                    })],
                }),

                new Paragraph({ text: "" }), // Spasi

                // ==========================================
                // 3. MEMORANDUM OF AGREEMENT (Italic & Divider)
                // ==========================================
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    border: {
                        bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" } // GARIS DIVIDER
                    },
                    children: [
                        new TextRun({
                            text: "MEMORANDUM OF AGREEMENT",
                            bold: true,
                            italics: true, // ITALIC sesuai request
                            font: "Times New Roman",
                            size: 24
                        }),
                    ],
                    spacing: { after: 240 } // Memberi jarak sedikit setelah garis
                }),

                // ==========================================
                // 4. NOMOR PKS
                // ==========================================
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({
                            text: "NOMOR : ", // BOLD
                            bold: true,
                            font: "Times New Roman",
                            size: 24
                        }),
                        new TextRun({
                            text: pks.nomor_pks_upn || " .../UN62/PK/... ", // NORMAL (Tidak Bold)
                            bold: false,
                            font: "Times New Roman",
                            size: 24
                        }),
                    ],
                }),

                new Paragraph({ text: "" }), // Spasi

                // ==========================================
                // 5. KALIMAT PEMBUKA (Title Case & Tanggal Terbilang)
                // ==========================================
                new Paragraph({
                    alignment: AlignmentType.JUSTIFIED,
                    children: [
                        new TextRun({ text: "Perjanjian Kerja Sama tentang ", font: "Times New Roman", size: 24 }),
                        new TextRun({
                            text: toTitleCase(pks.judul), // TITLE CASE
                            bold: true,
                            font: "Times New Roman",
                            size: 24
                        }),
                        new TextRun({ text: " (selanjutnya disebut “Perjanjian”) ini dibuat dan ditandatangani pada ", font: "Times New Roman", size: 24 }),
                        // TANGGAL FORMAT TERBILANG
                        new TextRun({
                            text: `hari ${hari} tanggal ${toTitleCase(tanggalText)} bulan ${bulan} tahun ${tahunText}`, 
                            font: "Times New Roman",
                            size: 24
                        }),
                        new TextRun({ text: ", bertempat di Yogyakarta, oleh dan antara:", font: "Times New Roman", size: 24 }),
                    ],
                }),

                new Paragraph({ text: "" }), 

                // ==========================================
                // 6. PARA PIHAK (Format Romawi & Indentasi Rapi)
                // ==========================================
                
                // --- PIHAK I (PERTAMA) ---
                new Paragraph({
                    indent: { hanging: 720, left: 720 }, // Indentasi menggantung agar teks lurus setelah angka Romawi
                    alignment: AlignmentType.JUSTIFIED,
                    children: [
                        new TextRun({ text: "I.\t", bold: true, font: "Times New Roman", size: 24 }), // Angka Romawi
                        new TextRun({ text: pihakPertama.nama + ", ", bold: true, font: "Times New Roman", size: 24 }), // NAMA BOLD
                        new TextRun({ text: pihakPertama.jabatan + ", berkedudukan di " + pihakPertama.alamat + ", dalam hal ini bertindak untuk dan atas nama " + pihakPertama.instansi + ", selanjutnya disebut ", font: "Times New Roman", size: 24 }),
                        new TextRun({ text: "PIHAK PERTAMA.", bold: true, font: "Times New Roman", size: 24 }),
                    ]
                }),

                new Paragraph({ text: "" }), // Spasi antar pihak

                // --- PIHAK II (KEDUA) ---
                new Paragraph({
                    indent: { hanging: 720, left: 720 }, // Indentasi menggantung
                    alignment: AlignmentType.JUSTIFIED,
                    children: [
                        new TextRun({ text: "II.\t", bold: true, font: "Times New Roman", size: 24 }), // Angka Romawi
                        new TextRun({ text: pihakKedua.nama + ", ", bold: true, font: "Times New Roman", size: 24 }), // NAMA BOLD
                        new TextRun({ text: pihakKedua.jabatan + ", berkedudukan di " + pihakKedua.alamat + ", dalam hal ini bertindak untuk dan atas nama " + pihakKedua.instansi + ", selanjutnya disebut ", font: "Times New Roman", size: 24 }),
                        new TextRun({ text: "PIHAK KEDUA.", bold: true, font: "Times New Roman", size: 24 }),
                    ]
                }),

                new Paragraph({ text: "" }), 

                // ==========================================
                // 7. KATA PENGHUBUNG SEBELUM PASAL
                // ==========================================
                new Paragraph({
                    alignment: AlignmentType.JUSTIFIED,
                    children: [
                        new TextRun({
                            text: "PIHAK PERTAMA dan PIHAK KEDUA secara bersama-sama disebut PARA PIHAK dan secara sendiri-sendiri disebut PIHAK. PARA PIHAK sepakat untuk melakukan kerja sama dengan ketentuan dan syarat-syarat sebagai berikut:",
                            font: "Times New Roman",
                            size: 24
                        }),
                    ]
                }),

                new Paragraph({ text: "" }),

                // ... (KODE DISINI AKAN DILANJUTKAN DENGAN LOOPING PASAL 1 DST) ...

            new Paragraph({ text: "" }), // Spacer sebelum Pasal 1

            // ============================================================
            // DISINI MULAI PASAL 1 dst... (Nanti kita lanjut part berikutnya)
            // ============================================================

            // ============================================================
            // PASAL 1 - TUJUAN
            // ============================================================
            new Paragraph({
              children: [new TextRun({ text: "PASAL 1", bold: true })],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [new TextRun({ text: "TUJUAN", bold: true })],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Tujuan dilakukan perjanjian ini adalah sebagai landasan bagi PARA PIHAK dalam melakukan kegiatan dukungan PIHAK KEDUA dalam rangka penyelenggaraan Tri Dharma Perguruan Tinggi melalui kerja sama ${content.judul}.`,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
            }),

            new Paragraph({ text: "" }),

            // ============================================================
            // PASAL 2 - RUANG LINGKUP
            // ============================================================
            new Paragraph({
              children: [new TextRun({ text: "PASAL 2", bold: true })],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [new TextRun({ text: "RUANG LINGKUP", bold: true })],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: "Ruang lingkup Perjanjian ini meliputi:",
              alignment: AlignmentType.JUSTIFIED,
            }),
            // Poin 1: Logika 3 Pilihan (Penelitian, Pengabdian, atau Keduanya)
            new Paragraph({
              children: [
                new TextRun({
                  text:
                    content.bentukKerjaSama.includes("Penelitian") &&
                    content.bentukKerjaSama.includes("Pengabdian Masyarakat")
                      ? "1.\tKegiatan Penelitian dan Pengabdian bagi Masyarakat;"
                      : content.bentukKerjaSama.includes("Penelitian")
                        ? "1.\tKegiatan Penelitian;"
                        : "1.\tKegiatan Pengabdian bagi Masyarakat;",
                }),
              ],
              // Menggunakan hanging indent agar angka rapi
              indent: { left: 720, hanging: 360 },
              alignment: AlignmentType.JUSTIFIED,
            }),
            // Poin 2: Statis
            new Paragraph({
              children: [
                new TextRun({
                  text: "2.\tPemanfaatan sumberdaya manusia serta fasilitas sarana dan prasarana yang dimiliki PARA PIHAK untuk menunjang kelancaran penyelenggaraan kegiatan.",
                }),
              ],
              indent: { left: 720, hanging: 360 },
              alignment: AlignmentType.JUSTIFIED,
            }),

            new Paragraph({ text: "" }),

            // ============================================================
            // PASAL 3 - PELAKSANAAN
            // ============================================================
            new Paragraph({
              children: [new TextRun({ text: "PASAL 3", bold: true })],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [new TextRun({ text: "PELAKSANAAN", bold: true })],
              alignment: AlignmentType.CENTER,
            }),
            // Ayat 1
            new Paragraph({
              text: "(1)\tPARA PIHAK sepakat dalam pelaksanaan kegiatan akan mematuhi seluruh aspek perundang-undangan yang berlaku dan menunjuk wakil-wakilnya yang memiliki kompetensi dan disiplin ilmu yang terkait untuk melaksanakan Perjanjian ini.",
              indent: { left: 720, hanging: 450 },
              alignment: AlignmentType.JUSTIFIED,
            }),
            // Ayat 2
            new Paragraph({
              text: "(2)\tDalam melaksanakan ruang lingkup sebagaimana dimaksud dalam Pasal 2 Perjanjian ini, penanggungjawab kegiatan sebagaimana disebut pada ayat (1) berpedoman kepada Kerangka Acuan Kerja (KAK) sebagai bagian yang tidak terpisahkan Perjanjian ini.",
              indent: { left: 720, hanging: 450 },
              alignment: AlignmentType.JUSTIFIED,
            }),
            // Ayat 3
            new Paragraph({
              text: "(3)\tKerangka Acuan Kerja sebagaimana dimaksud pada ayat (2) berisi pedoman kerja yang mencakup antara lain tujuan, sasaran, output, tahapan dan jadwal pelaksanaan, personil yang terlibat, pembiayaan, serta hal-hal lain yang dianggap perlu.",
              indent: { left: 720, hanging: 450 },
              alignment: AlignmentType.JUSTIFIED,
            }),
            // Ayat 4
            new Paragraph({
              text: "(4)\tApabila salah satu dari PARA PIHAK berkehendak melibatkan pihak lain dalam pelaksanaan kegiatan perjanjian ini maka dibutuhkan persetujuan tertulis dari PARA PIHAK.",
              indent: { left: 720, hanging: 450 },
              alignment: AlignmentType.JUSTIFIED,
            }),

            new Paragraph({ text: "" }),

            // ============================================================
            // PASAL 4 - PEMBIAYAAN, HAK DAN KEWAJIBAN
            // ============================================================
            new Paragraph({
              children: [new TextRun({ text: "PASAL 4", bold: true })],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "PEMBIAYAAN, HAK DAN KEWAJIBAN",
                  bold: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            // Ayat 1
            new Paragraph({
              text: "(1)\tBiaya untuk pelaksanaan kerja sama akan diatur dalam Rancangan Pelaksanaan Kegiatan Kerjasama (Implementation Arrangement/IA) yang menjadi bagian tidak terpisahkan dari Perjanjian Kerja sama ini;",
              indent: { left: 720, hanging: 450 },
              alignment: AlignmentType.JUSTIFIED,
            }),
            // Ayat 2
            new Paragraph({
              text: "(2)\tSegala biaya yang timbul sebagai akibat dari pelaksanaan Perjanjian ini menjadi beban PARA PIHAK sesuai dengan proporsi tanggung jawab masing-masing;",
              indent: { left: 720, hanging: 450 },
              alignment: AlignmentType.JUSTIFIED,
            }),
            // Ayat 3
            new Paragraph({
              text: "(3)\tSumber biaya selain sebagaimana dimaksud pada ayat (2), dapat berasal dari pihak lain yang sifatnya sah dan tidak mengikat sesuai peraturan perundang-undangan.",
              indent: { left: 720, hanging: 450 },
              alignment: AlignmentType.JUSTIFIED,
            }),

            new Paragraph({ text: "" }),

            // ============================================================
            // PASAL 5 - TUGAS DAN TANGGUNG JAWAB
            // ============================================================
            new Paragraph({
              children: [new TextRun({ text: "PASAL 5", bold: true })],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "TUGAS DAN TANGGUNGJAWAB", bold: true }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            // [REVISI] Memperbaiki penomoran dari a), b) ke (1), (2) agar konsisten dengan (3)
            // (1) PIHAK KESATU (MITRA)
            new Paragraph({
              text: "(1)\tPIHAK KESATU mempunyai Tugas dan Tanggungjawab:",
              indent: { left: 720, hanging: 450 },
              alignment: AlignmentType.JUSTIFIED,
            }),
            new Paragraph({
              text: "a.\tMengidentifikasi dan menyiapkan data dan informasi dalam mendukung pelaksanaan Perjanjian Kerjasama;",
              indent: { left: 1440, hanging: 450 }, // Indent lebih dalam
              alignment: AlignmentType.JUSTIFIED,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text:
                    content.bentukKerjaSama.includes("Penelitian") &&
                    content.bentukKerjaSama.includes("Pengabdian Masyarakat")
                      ? "b.\tMemfasilitasi Kegiatan Penelitian dan Pengabdian bagi Masyarakat serta menyediakan fasilitas sarana dan prasarana yang dimiliki PARA PIHAK untuk menunjang kelancaran penyelenggaraan kegiatan."
                      : content.bentukKerjaSama.includes("Penelitian")
                        ? "b.\tMemfasilitasi Kegiatan Penelitian serta menyediakan fasilitas sarana dan prasarana yang dimiliki PARA PIHAK untuk menunjang kelancaran penyelenggaraan kegiatan."
                        : "b.\tMemfasilitasi Kegiatan Pengabdian bagi Masyarakat serta menyediakan fasilitas sarana dan prasarana yang dimiliki PARA PIHAK untuk menunjang kelancaran penyelenggaraan kegiatan.",
                }),
              ],
              indent: { left: 1440, hanging: 450 },
              alignment: AlignmentType.JUSTIFIED,
            }),

            // (2) PIHAK KEDUA (UPN)
            new Paragraph({
              text: "(2)\tPIHAK KEDUA mempunyai Tugas dan Tanggungjawab:",
              indent: { left: 720, hanging: 450 },
              alignment: AlignmentType.JUSTIFIED,
            }),
            new Paragraph({
              text: "a.\tMengolah data dan informasi yang diperoleh dari PIHAK KESATU;",
              indent: { left: 1440, hanging: 450 },
              alignment: AlignmentType.JUSTIFIED,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text:
                    content.bentukKerjaSama.includes("Penelitian") &&
                    content.bentukKerjaSama.includes("Pengabdian Masyarakat")
                      ? "b.\tMelaksanakan Kegiatan Penelitian dan Pengabdian bagi Masyarakat sesuai dengan kaidah akademik."
                      : content.bentukKerjaSama.includes("Penelitian")
                        ? "b.\tMelaksanakan Kegiatan Penelitian sesuai dengan kaidah akademik."
                        : "b.\tMelaksanakan Kegiatan Pengabdian bagi Masyarakat sesuai dengan kaidah akademik.",
                }),
              ],
              indent: { left: 1440, hanging: 450 },
              alignment: AlignmentType.JUSTIFIED,
            }),

            // (3) BERSAMA
            new Paragraph({
              text: "(3)\tPARA PIHAK bersama-sama mempunyai tugas dan tanggungjawab menyusun laporan pelaksanaan kegiatan.",
              indent: { left: 720, hanging: 450 },
              alignment: AlignmentType.JUSTIFIED,
            }),

            new Paragraph({ text: "" }),

            // ============================================================
            // PASAL 6 - JANGKA WAKTU
            // ============================================================
            new Paragraph({
              children: [new TextRun({ text: "PASAL 6", bold: true })],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [new TextRun({ text: "JANGKA WAKTU", bold: true })],
              alignment: AlignmentType.CENTER,
            }),
            // Ayat 1: Durasi
            new Paragraph({
              children: [
                new TextRun({
                  text: `(1)\tPerjanjian ini berlaku untuk jangka waktu 1 (satu) tahun, terhitung sejak tanggal ${tanggalHuruf} bulan ${namaBulan} tahun ${tahunHuruf} sampai dengan tanggal ${content.tanggalKadaluarsa ? new Date(content.tanggalKadaluarsa).toLocaleDateString("id-ID") : "...................."} dan dapat diperpanjang berdasarkan kesepakatan PARA PIHAK;`,
                }),
              ],
              indent: { left: 720, hanging: 450 },
              alignment: AlignmentType.JUSTIFIED,
            }),
            // Ayat 2: Pengakhiran Dini
            new Paragraph({
              text: "(2)\tPerjanjian ini dapat diakhiri sebelum masa berlakunya berakhir dengan ketentuan pihak yang ingin mengakhiri Perjanjian ini harus memberitahukan secara tertulis kepada pihak lainnya paling lambat 3 (tiga) bulan sebelumnya.",
              indent: { left: 720, hanging: 450 },
              alignment: AlignmentType.JUSTIFIED,
            }),

            new Paragraph({ text: "" }),

            // ============================================================
            // BAGIAN DINAMIS: PASAL 7 S/D PENUTUP
            // Menggunakan fungsi wrapper (IIFE) agar penomoran pasal bisa otomatis
            // ============================================================
            ...(() => {
              const dynamicSections = [];
              let pCounter = 7; // Mulai hitungan dari Pasal 7

              // ------------------------------------------------------------
              // PASAL 7 - PENGHENTIAN PERJANJIAN
              // ------------------------------------------------------------
              dynamicSections.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: `PASAL ${pCounter}`, bold: true }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "PENGHENTIAN PERJANJIAN", bold: true }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                  text: "(1)\tAtas permohonan salah satu pihak sebagai pemohon (PIHAK KESATU atau PIHAK KEDUA) dan berdasarkan persetujuan kedua belah pihak, perjanjian ini dapat dibatalkan sebelum berakhirnya jangka waktu perjanjian sebagaimana tersebut pada Pasal 6 perjanjian ini.",
                  indent: { left: 720, hanging: 450 },
                  alignment: AlignmentType.JUSTIFIED,
                }),
                new Paragraph({
                  text: "(2)\tPermohonan pembatalan perjanjian sebagaimana dimaksud pada Ayat (1) pasal ini harus disampaikan oleh pemohon kepada pihak lainnya secara tertulis disertai alasan-alasan yang mendasarinya paling lambat 30 (tiga puluh) hari sebelum tanggal pembatalan perjanjian.",
                  indent: { left: 720, hanging: 450 },
                  alignment: AlignmentType.JUSTIFIED,
                }),
                new Paragraph({ text: "" }),
              );
              pCounter++; // Naik ke 8

              // ------------------------------------------------------------
              // PASAL 8 (OPSIONAL) - HAK KEKAYAAN INTELEKTUAL
              // ------------------------------------------------------------
              if (content.hasHakCipta) {
                dynamicSections.push(
                  new Paragraph({
                    children: [
                      new TextRun({ text: `PASAL ${pCounter}`, bold: true }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "HAK KEKAYAAN INTELEKTUAL",
                        bold: true,
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                  new Paragraph({
                    text: "(1)\tSetiap HKI yang dibawa oleh para pihak (HKI bawaan) dalam melaksanakan kegiatan menurut perjanjian ini menjadi milik PIHAK KEDUA.",
                    indent: { left: 720, hanging: 450 },
                    alignment: AlignmentType.JUSTIFIED,
                  }),
                  // Ayat 2: Dinamis sesuai jenis kegiatan
                  new Paragraph({
                    children: [
                      new TextRun({
                        text:
                          content.bentukKerjaSama.includes("Penelitian") &&
                          content.bentukKerjaSama.includes(
                            "Pengabdian Masyarakat",
                          )
                            ? "(2)\tSetiap hasil Kegiatan Penelitian dan Pengabdian bagi Masyarakat, data dan informasi yang dihasilkan dari kegiatan menurut perjanjian ini dimiliki secara bersama-sama oleh kedua belah pihak."
                            : content.bentukKerjaSama.includes("Penelitian")
                              ? "(2)\tSetiap hasil Kegiatan Penelitian, data dan informasi yang dihasilkan dari kegiatan menurut perjanjian ini dimiliki secara bersama-sama oleh kedua belah pihak."
                              : "(2)\tSetiap hasil Kegiatan Pengabdian bagi Masyarakat, data dan informasi yang dihasilkan dari kegiatan menurut perjanjian ini dimiliki secara bersama-sama oleh kedua belah pihak.",
                      }),
                    ],
                    indent: { left: 720, hanging: 450 },
                    alignment: AlignmentType.JUSTIFIED,
                  }),
                  new Paragraph({
                    text: "Setiap pemanfaatan Hak Kekayaan Intelektual tersebut, baik itu untuk kepentingan komersial maupun nonkomersial, akan diatur secara tersendiri.",
                    indent: { left: 720 },
                    alignment: AlignmentType.JUSTIFIED,
                  }),
                  new Paragraph({
                    text: "(3)\tSetiap publikasi data dan informasi hasil kegiatan menurut perjanjian ini harus dilaksanakan bersama-sama atau dengan mekanisme lain yang diatur tersendiri yang merupakan bagian tidak terpisahkan dari perjanjian ini.",
                    indent: { left: 720, hanging: 450 },
                    alignment: AlignmentType.JUSTIFIED,
                  }),
                  new Paragraph({
                    text: "Publikasi yang dilakukan oleh salah satu pihak wajib mencantumkan pihak lainnya sebagai ungkapan penghargaan.",
                    indent: { left: 720 },
                    alignment: AlignmentType.JUSTIFIED,
                  }),
                  new Paragraph({
                    text: "(4)\tJika salah satu pihak bermaksud mengungkapkan data dan/atau informasi rahasia yang dihasilkan dari kegiatan menurut perjanjian ini kepada pihak ketiga atau bermaksud melakukan kerjasama dengan pihak ketiga, maka pihak tersebut harus terlebih dahulu mendapatkan persetujuan pihak lainnya.",
                    indent: { left: 720, hanging: 450 },
                    alignment: AlignmentType.JUSTIFIED,
                  }),
                  new Paragraph({
                    text: "(5)\tPenghentian pelaksanaan kegiatan menurut perjanjian ini tidak serta merta menghentikan segala hak dan/atau kewajiban para pihak yang diatur dalam pasal ini.",
                    indent: { left: 720, hanging: 450 },
                    alignment: AlignmentType.JUSTIFIED,
                  }),
                  new Paragraph({ text: "" }),
                );
                pCounter++; // Counter naik jika pasal ini ada
              }

              // ------------------------------------------------------------
              // PASAL FORCE MAJEURE (Nomor Dinamis)
              // ------------------------------------------------------------
              dynamicSections.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: `PASAL ${pCounter}`, bold: true }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "FORCE MAJEURE", bold: true }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                  text: "(1)\tMasing-masing pihak dibebaskan dari tanggung jawab atas keterlambatan atau kegagalan dalam memenuhi kewajiban yang tercantum dalam Perjanjian ini, yang disebabkan atau diakibatkan oleh kejadian di luar kekuasaan masing-masing pihak yang digolongkan sebagai Force Majeure.",
                  indent: { left: 720, hanging: 450 },
                  alignment: AlignmentType.JUSTIFIED,
                }),
                new Paragraph({
                  text: "(2)\tPeristiwa yang dapat digolongkan Force Majeure adalah: adanya bencana alam seperti gempa bumi, taufan, banjir atau hujan terus menerus, wabah penyakit, adanya perang, peledakan, sabotase, revolusi, pemberontakan, huru hara, adanya tindakan pemerintahan dalam bidang ekonomi dan moneter yang secara nyata berpengaruh terhadap pelaksanaan Perjanjian ini.",
                  indent: { left: 720, hanging: 450 },
                  alignment: AlignmentType.JUSTIFIED,
                }),
                new Paragraph({
                  text: "(3)\tApabila terjadi Force Majeure maka pihak yang lebih dahulu mengetahui wajib memberitahukan kepada pihak lainnya selambat-lambatnya dalam waktu 14 (empat belas hari) setelah terjadinya Force Majeure.",
                  indent: { left: 720, hanging: 450 },
                  alignment: AlignmentType.JUSTIFIED,
                }),
                new Paragraph({
                  text: "(4)\tKeadaan Kahar/Force Majeure sebagaimana dimaksud Ayat (2) perjanjian ini tidak menghapuskan atau mengakhiri perjanjian ini.",
                  indent: { left: 720, hanging: 450 },
                  alignment: AlignmentType.JUSTIFIED,
                }),
                new Paragraph({
                  text: "Setelah keadaan Kahar/Force Majeure berakhir dan kondisinya masih memungkinkan kegiatan dapat dilaksanakan oleh PIHAK PERTAMA maka PARA PIHAK akan melanjutkan pelaksanaan perjanjian ini sesuai dengan ketentuan-ketentuan yang diatur dalam perjanjian ini.",
                  indent: { left: 720 },
                  alignment: AlignmentType.JUSTIFIED,
                }),
                new Paragraph({ text: "" }),
              );
              pCounter++;

              // ------------------------------------------------------------
              // PASAL PENYELESAIAN PERSELISIHAN (Nomor Dinamis)
              // ------------------------------------------------------------
              dynamicSections.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: `PASAL ${pCounter}`, bold: true }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "PENYELESAIAN PERSELISIHAN",
                      bold: true,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                  text: "(1)\tApabila dalam pelaksanaan perjanjian ini diantara kedua belah pihak terdapat perselisihan atau ketidaksesuaian pendapat, akan diselesaikan dengan musyawarah untuk mencapai mufakat.",
                  indent: { left: 720, hanging: 450 },
                  alignment: AlignmentType.JUSTIFIED,
                }),
                new Paragraph({ text: "" }),
              );
              pCounter++;

              // ------------------------------------------------------------
              // PASAL PEMBATALAN PERJANJIAN (Nomor Dinamis)
              // ------------------------------------------------------------
              dynamicSections.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: `PASAL ${pCounter}`, bold: true }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "PEMBATALAN PERJANJIAN", bold: true }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                  text: "(1)\tAtas permohonan salah satu pihak sebagai pemohon (PIHAK KESATU atau PIHAK KEDUA) dan berdasarkan persetujuan kedua belah pihak, perjanjian ini dapat dibatalkan sebelum berakhirnya jangka waktu perjanjian sebagaimana tersebut pada Pasal 7 perjanjian ini.",
                  indent: { left: 720, hanging: 450 },
                  alignment: AlignmentType.JUSTIFIED,
                }),
                new Paragraph({
                  text: "(2)\tPermohonan pembatalan perjanjian sebagaimana dimaksud pada Ayat (1) pasal ini harus disampaikan oleh pemohon kepada pihak lainnya secara tertulis disertai alasan-alasan yang mendasarinya paling lambat 30 (tiga puluh) hari sebelum tanggal pembatalan perjanjian.",
                  indent: { left: 720, hanging: 450 },
                  alignment: AlignmentType.JUSTIFIED,
                }),
                new Paragraph({ text: "" }),
              );
              pCounter++;

              // ------------------------------------------------------------
              // PASAL KORESPONDENSI (Nomor Dinamis)
              // ------------------------------------------------------------
              dynamicSections.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: `PASAL ${pCounter}`, bold: true }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "KORESPONDENSI", bold: true }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                  text: "(1)\tKoordinasi, komunikasi, dokumen, dan/atau pemberitahuan yang berhubungan dengan Perjanjian Kerjasama ini disampaikan secara langsung dan/atau melalui pos tercatat serta cara-cara lain yang memungkinkan.",
                  indent: { left: 720, hanging: 450 },
                  alignment: AlignmentType.JUSTIFIED,
                }),
                new Paragraph({
                  text: "(2)\tAlamat PARA PIHAK yang akan dipakai untuk komunikasi guna keperluan sebagaimana dimaksud pada ayat (1) adalah sebagai berikut:",
                  indent: { left: 720, hanging: 450 },
                  alignment: AlignmentType.JUSTIFIED,
                }),

                // Detail Kontak PIHAK KESATU (MITRA) - Data Dinamis
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "PIHAK KESATU:",
                      bold: true,
                      underline: true,
                    }),
                  ],
                  indent: { left: 1440 },
                  spacing: { before: 100 },
                }),
                // [REVISI] Menambahkan TabStop untuk merapikan titik dua
                new Paragraph({
                  text: `Nama\t: ${pihakKesatu.nama}`,
                  indent: { left: 1440 },
                  tabStops: [
                    { type: TabStopType.LEFT, position: tabStopIndent },
                  ],
                }),
                new Paragraph({
                  text: `Alamat\t: ${pihakKesatu.alamat}`,
                  indent: { left: 1440 },
                  tabStops: [
                    { type: TabStopType.LEFT, position: tabStopIndent },
                  ],
                }),
                new Paragraph({
                  text: `Email\t: ${data.properties.email || "-"}`,
                  indent: { left: 1440 },
                  tabStops: [
                    { type: TabStopType.LEFT, position: tabStopIndent },
                  ],
                }),
                new Paragraph({
                  text: `Telepon\t: ${data.properties.telepon || "-"}`,
                  indent: { left: 1440 },
                  tabStops: [
                    { type: TabStopType.LEFT, position: tabStopIndent },
                  ],
                }),

                // Detail Kontak PIHAK KEDUA (UPN) - Statis
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "PIHAK KEDUA:",
                      bold: true,
                      underline: true,
                    }),
                  ],
                  indent: { left: 1440 },
                  spacing: { before: 100 },
                }),
                new Paragraph({
                  text: "Koordinator Tata Usaha Lembaga Penelitian dan Pengabdian Masyarakat Universitas Pembangunan Nasional Veteran Yogyakarta",
                  indent: { left: 1440 },
                }),
                // [REVISI] Menambahkan TabStop pada UPN juga
                new Paragraph({
                  text: "Alamat\t: Jalan Pajajaran 104, Sleman, Daerah Istimewa Yogyakarta, 55283",
                  indent: { left: 1440 },
                  tabStops: [
                    { type: TabStopType.LEFT, position: tabStopIndent },
                  ],
                }),
                new Paragraph({
                  text: "Email\t: lppm@upnyk.ac.id",
                  indent: { left: 1440 },
                  tabStops: [
                    { type: TabStopType.LEFT, position: tabStopIndent },
                  ],
                }),
                new Paragraph({
                  text: "Telepon\t: (0274) 486773",
                  indent: { left: 1440 },
                  tabStops: [
                    { type: TabStopType.LEFT, position: tabStopIndent },
                  ],
                }),

                new Paragraph({
                  text: "(3)\tBila terjadi perubahan terhadap alamat dari salah satu pihak, pihak yang berubah alamatnya wajib memberitahukan kepada pihak lainnya dalam waktu 14 (empat belas) hari setelah perubahan dilakukan.",
                  indent: { left: 720, hanging: 450 },
                  alignment: AlignmentType.JUSTIFIED,
                  spacing: { before: 200 },
                }),
                new Paragraph({ text: "" }),
              );
              pCounter++;

              // ------------------------------------------------------------
              // PASAL PENUTUP (Nomor Dinamis)
              // ------------------------------------------------------------
              dynamicSections.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: `PASAL ${pCounter}`, bold: true }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                  children: [new TextRun({ text: "PENUTUP", bold: true })],
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                  text: "(1)\tPerubahan terhadap Perjanjian Kerja Sama ini akan ditetapkan dalam addendum yang disepakati oleh PARA PIHAK dan merupakan bagian yang tidak terpisahkan dari Perjanjian Kerja Sama ini.",
                  indent: { left: 720, hanging: 450 },
                  alignment: AlignmentType.JUSTIFIED,
                }),
                new Paragraph({
                  text: "(2)\tPerjanjian Kerja Sama ini dibuat dan ditandatangani oleh PARA PIHAK pada hari dan tanggal tersebut pada bagian awal Kesepakatan Bersama ini, dibuat dalam rangkap 2 (dua) yang bermeterai cukup dan mempunyai kekuatan hukum yang sama, untuk masing-masing pihak dan dipergunakan sebagaimana mestinya.",
                  indent: { left: 720, hanging: 450 },
                  alignment: AlignmentType.JUSTIFIED,
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                  text: "Demikian Perjanjian Kerja Sama ini dibuat oleh PARA PIHAK dengan itikad baik, untuk dapat dipatuhi dan dilaksanakan oleh PARA PIHAK.",
                  alignment: AlignmentType.JUSTIFIED,
                }),
                new Paragraph({ text: "" }),
                new Paragraph({ text: "" }),
              );

              return dynamicSections;
            })(),

            // ============================================================
            // TANDA TANGAN (KIRI: MITRA, KANAN: UPN)
            // ============================================================
            new Table({
              columnWidths: [5000, 5000],
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: "PIHAK KESATU", bold: true }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: toAllCapital(pihakKesatu.instansi),
                              bold: true,
                              size: 20,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 50, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: "PIHAK KEDUA", bold: true }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Kepala LPPM UPN Veteran Yogyakarta",
                              bold: true,
                              size: 20,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 50, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
                // SPACER TANDA TANGAN
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({ text: "", spacing: { before: 1500 } }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ text: "", spacing: { before: 1500 } }),
                      ],
                    }),
                  ],
                }),
                // NAMA PENANDATANGAN
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: pihakKesatu.nama,
                              bold: true,
                              underline: true,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: pihakKesatu.jabatan,
                              size: 20,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: pihakKedua.nama,
                              bold: true,
                              underline: true,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "NIP " + pihakKedua.nip,
                              size: 20,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
              borders: TableBorders.NONE,
            }),
          ], // END CHILDREN
        },
      ],
    });

    // ============================================================
    // RESPONSE GENERATION
    // ============================================================
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  } catch (error) {
    console.error("Error generating document:", error);
    throw new Error("Gagal membuat dokumen: " + error.message);
  }
};
