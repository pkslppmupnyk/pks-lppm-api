import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  TableBorders,
  WidthType,
  ImageRun,
  Header,
} from "docx";
import terbilang from "terbilang";
import fs from "fs"; // <-- 2. Impor 'fs' untuk membaca file
import path from "path"; // <-- 3. Impor 'path' untuk mengelola path file
import { fileURLToPath } from "url"; // <-- 4. Impor 'fileURLToPath'

export const generateDocument = async (pks) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // ============================================================
    // PERSIAPAN LOGO
    // ============================================================

    // Baca logo UPN dari folder public
    const upnLogoPath = path.join(__dirname, "../public/images/logo_upn.png");
    const upnLogo = fs.readFileSync(upnLogoPath);

    // Baca logo mitra jika ada
    let partnerLogo = null;
    if (pks.logoUpload && pks.logoUpload.fileName) {
      const partnerLogoPath = path.join(
        __dirname,
        "../uploads/logos",
        pks.logoUpload.fileName
      );
      try {
        // Cek apakah file logo mitra benar-benar ada sebelum dibaca
        if (fs.existsSync(partnerLogoPath)) {
          partnerLogo = fs.readFileSync(partnerLogoPath);
        }
      } catch (e) {
        console.error("Logo mitra tidak ditemukan, akan dilewati.");
      }
    }

    // Buat tabel header untuk menampung logo
    const logoHeader = new Table({
      columnWidths: [4500, 4500],
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: upnLogo,
                      transformation: { width: 100, height: 100 },
                    }),
                  ],
                  alignment: AlignmentType.LEFT,
                }),
              ],
            }),
            new TableCell({
              children: [
                partnerLogo
                  ? new Paragraph({
                      children: [
                        new ImageRun({
                          data: partnerLogo,
                          transformation: { width: 100, height: 100 },
                        }),
                      ],
                      alignment: AlignmentType.RIGHT,
                    })
                  : new Paragraph({ text: "" }), // Kosongkan sel jika tidak ada logo mitra
              ],
            }),
          ],
        }),
      ],
      borders: TableBorders.NONE,
    });

    // ============================================================
    // DATA EXTRACTION
    // ============================================================

    const data = pks; // langsung pakai object PKS dari controller

    // ============================================================
    // VARIABLE INITIALIZATION
    // Sesuaikan variabel di sini untuk lingkungan baru
    // ============================================================

    // Content data
    const content = data.content;
    const tanggal = content.tanggal; // ← Ubah ini sesuai kebutuhan (misal: pks.date)
    const formattedNomor = content.nomor.replace(/-/g, "/");

    // Pihak Kedua data
    const pihakKedua = data.pihakKedua;

    // Helper function
    const capitalizeEachWord = (str) => {
      return str.replace(/\b\w/g, (char) => char.toUpperCase());
    };

    // Date formatting
    const namaHari = capitalizeEachWord(
      tanggal.toLocaleDateString("id-ID", { weekday: "long" })
    );
    const namaBulan = capitalizeEachWord(
      tanggal.toLocaleDateString("id-ID", { month: "long" })
    );
    const tanggalHuruf = capitalizeEachWord(terbilang(tanggal.getDate()));
    const tahunHuruf = capitalizeEachWord(terbilang(tanggal.getFullYear()));
    const formatAngka = `${tanggal.getDate().toString().padStart(2, "0")}-${(
      tanggal.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${tanggal.getFullYear()}`;
    const kalimatTanggal = `${namaHari}, tanggal ${tanggalHuruf} bulan ${namaBulan} tahun ${tahunHuruf} (${formatAngka})`;

    // Pihak Pertama data (static - bisa dipindah ke config jika perlu)
    const pihakPertama = {
      nama: "Dr. Dyah Sugandini, SE, M.Si",
      jabatan: `Kepala Lembaga Penelitian dan Pengabdian Kepada Masyarakat Universitas Pembangunan Nasional "Veteran" Yogyakarta`,
      skJabatan: `Surat Keputusan Rektor Universitas pembangunan Nasional "Veteran" Yogyakarta Nomor 1569/UN62/KP/2024 tanggal 20 Maret 2024 dalam jabatan tersebut bertindak untuk dan atas nama Universitas Pembangunan Nasional "Veteran" Yogyakarta`,
      alamat:
        "Jl. Pajajaran 104 (Lingkar Utara) Condongcatur, Depok, Sleman, Yogyakarta 55283",
      nip: "19710617 202121 2 001",
    };

    // Document settings
    const fontSize = 24; // 12pt (docx uses half-points)
    const lineSpacing = 276; // 1.15 line spacing

    // ============================================================
    // DOCUMENT GENERATION
    // ============================================================
    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: "Normal",
            name: "Normal",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            paragraph: {
              spacing: {
                before: 0,
                after: 0,
                line: lineSpacing,
                lineRule: "auto",
              },
            },
          },
        ],
      },
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 4 * 567,
                bottom: 3 * 567,
                left: 2.54 * 567,
                right: 2.54 * 567,
              },
            },
          },
          // TAMBAHKAN HEADER DI SINI
          headers: {
            default: new Header({
              children: [logoHeader, new Paragraph({ text: "" })],
            }),
          },
          children: [
            // HAPUS logoHeader dari sini karena sudah dipindah ke header
            // logoHeader, <-- DIHAPUS
            // new Paragraph({ text: "" }), <-- DIHAPUS

            // JUDUL PKS - UBAH DARI SEMUA KAPITAL MENJADI TITLE CASE
            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({
                  text: "Perjanjian Kerjasama",
                  bold: true,
                  size: fontSize,
                }),
                new TextRun({ break: 1 }),
                new TextRun({ text: " Antara", bold: true, size: fontSize }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({ text: "" }),

            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({
                  text: `Lembaga Penelitian dan Pengabdian Kepada Masyarakat`,
                  bold: true,
                  size: fontSize,
                }),
                new TextRun({ break: 1 }),
                new TextRun({
                  text: `Universitas Pembangunan Nasional "Veteran" Yogyakarta`,
                  bold: true,
                  size: fontSize,
                }),
                new TextRun({ break: 1 }),
                new TextRun({ text: "Dengan", bold: true, size: fontSize }),
                new TextRun({ break: 1 }),
                new TextRun({
                  text: `${pihakKedua.nama}`,
                  bold: true,
                  size: fontSize,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({ text: "" }),

            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({
                  text: "Nomor",
                  bold: true,
                  size: fontSize,
                }),
                new TextRun({ break: 1 }),
                new TextRun({
                  text: `${formattedNomor}`,
                  bold: true,
                  size: fontSize,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({ text: "" }),

            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({
                  text: "Tentang",
                  bold: true,
                  size: fontSize,
                }),
                new TextRun({ break: 1 }),
                new TextRun({
                  text: `${content.tentang}`,
                  bold: true,
                  size: fontSize,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),

            // ISI DOKUMEN
            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({
                  text: `Pada hari ini ${kalimatTanggal}, kami yang bertanda tangan dibawah ini:`,
                  bold: false,
                  size: fontSize,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
            }),

            new Paragraph({ text: "" }),

            new Table({
              columnWidths: [1500, 500, 8000],
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "1.",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 5, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "Nama",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      width: { size: 20, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: `: ${pihakPertama.nama}`,
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      width: { size: 75, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),

                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 5, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "Jabatan",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      width: { size: 20, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: `: ${pihakPertama.jabatan}`,
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      width: { size: 75, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),

                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 5, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      width: { size: 20, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: `Berdasarkan ${pihakPertama.skJabatan}`,
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      width: { size: 75, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),

                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 5, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "Alamat",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      width: { size: 20, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: `: ${pihakPertama.alamat}`,
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      width: { size: 75, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
              ],
              borders: TableBorders.NONE,
            }),

            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({
                  text: `Untuk selanjutnya disebut sebagai `,
                  bold: false,
                  size: fontSize,
                }),
                new TextRun({
                  text: `"PIHAK PERTAMA"`,
                  bold: true,
                  size: fontSize,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
            }),

            new Paragraph({ text: "" }),

            new Table({
              columnWidths: [1500, 500, 8000],
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "2.",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 5, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "Nama",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      width: { size: 20, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: `: ${pihakKedua.nama}`,
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      width: { size: 75, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),

                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 5, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "Jabatan",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      width: { size: 20, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: `: ${pihakKedua.jabatan}`,
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      width: { size: 75, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),

                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 5, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "Alamat",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      width: { size: 20, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: `: ${pihakKedua.alamat}`,
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      width: { size: 75, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
              ],
              borders: TableBorders.NONE,
            }),

            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({
                  text: `Untuk selanjutnya disebut sebagai `,
                  bold: false,
                  size: fontSize,
                }),
                new TextRun({
                  text: `"PIHAK KEDUA"`,
                  bold: true,
                  size: fontSize,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
            }),

            new Paragraph({ text: "" }),

            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({
                  text: `PIHAK PERTAMA`,
                  bold: true,
                  size: fontSize,
                }),
                new TextRun({
                  text: ` dan `,
                  bold: false,
                  size: fontSize,
                }),
                new TextRun({
                  text: `PIHAK KEDUA`,
                  bold: true,
                  size: fontSize,
                }),
                new TextRun({
                  text: ` secara bersama-sama selanjutnya disebut sebagai "PARA PIHAK".`,
                  bold: false,
                  size: fontSize,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
            }),

            new Paragraph({ text: "" }),

            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({
                  text: `PARA PIHAK sepakat untuk menjalin `,
                  bold: false,
                  size: fontSize,
                }),
                new TextRun({
                  text: `kerjasama ${content.tentang}`,
                  bold: false,
                  size: fontSize,
                }),
                new TextRun({
                  text: ` dengan ketentuan dan syarat-syarat yang telah disetujui sebagai berikut:`,
                  bold: false,
                  size: fontSize,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
            }),

            new Paragraph({ text: "" }),

            // PASAL 1
            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({ text: "Pasal 1", bold: true, size: fontSize }),
                new TextRun({ break: 1 }),
                new TextRun({
                  text: "Maksud dan Tujuan",
                  bold: true,
                  size: fontSize,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({ text: "" }),

            new Table({
              columnWidths: [500, 9500],
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "1.",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 5, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: `Perjanjian kerjasama ini ditandatangani dengan maksud untuk menyempurnakan kerjasama ${content.tentang}`,
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.JUSTIFIED,
                        }),
                      ],
                      width: { size: 95, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "2.",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 5, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: `Perjanjian kerjasama ini dilaksanakan dengan tujuan untuk mencapai kegiatan yang sinergis, efektif, dan efisien untuk mengembangkan kerja sama berkelanjutan antar PARA PIHAK`,
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.JUSTIFIED,
                        }),
                      ],
                      width: { size: 95, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
              ],
              borders: TableBorders.NONE,
            }),

            new Paragraph({ text: "" }),

            // PASAL 2
            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({ text: "Pasal 2", bold: true, size: fontSize }),
                new TextRun({ break: 1 }),
                new TextRun({
                  text: "Ruang Lingkup",
                  bold: true,
                  size: fontSize,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({ text: "" }),

            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({
                  text: `Ruang lingkup kerjasama ${content.tentang} adalah sebagai berikut:`,
                  bold: false,
                  size: fontSize,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
            }),

            new Paragraph({ text: "" }),

            new Table({
              columnWidths: [500, 9500],
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: content.ruangLingkup.map((item, index) => {
                return new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: `${index + 1}.`,
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 5, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: item,
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.JUSTIFIED,
                        }),
                      ],
                      width: { size: 95, type: WidthType.PERCENTAGE },
                    }),
                  ],
                });
              }),
              borders: TableBorders.NONE,
            }),

            new Paragraph({ text: "" }),

            // PASAL 3
            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({ text: "Pasal 3", bold: true, size: fontSize }),
                new TextRun({ break: 1 }),
                new TextRun({
                  text: "Hak dan Kewajiban",
                  bold: true,
                  size: fontSize,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({ text: "" }),

            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({
                  text: "Hak dan kewajiban PARA PIHAK adalah sebagai berikut:",
                  bold: false,
                  size: fontSize,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
            }),

            new Paragraph({ text: "" }),

            new Table({
              columnWidths: [500, 9500],
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "1.",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 5, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "PIHAK PERTAMA",
                              bold: true,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      width: { size: 95, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 5, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "a. Hak",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      width: { size: 95, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),

                ...content.hakPihakPertama.map((hak, index) => {
                  return new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            style: "Normal",
                            children: [
                              new TextRun({
                                text: "",
                                bold: false,
                                size: fontSize,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        width: { size: 5, type: WidthType.PERCENTAGE },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            style: "Normal",
                            children: [
                              new TextRun({
                                text: `   ${index + 1}) ${hak}`,
                                bold: false,
                                size: fontSize,
                              }),
                            ],
                            alignment: AlignmentType.JUSTIFIED,
                          }),
                        ],
                        width: { size: 95, type: WidthType.PERCENTAGE },
                      }),
                    ],
                  });
                }),

                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 5, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "b. Kewajiban",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      width: { size: 95, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),

                ...content.kewajibanPihakPertama.map((kewajiban, index) => {
                  return new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            style: "Normal",
                            children: [
                              new TextRun({
                                text: "",
                                bold: false,
                                size: fontSize,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        width: { size: 5, type: WidthType.PERCENTAGE },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            style: "Normal",
                            children: [
                              new TextRun({
                                text: `   ${index + 1}) ${kewajiban}`,
                                bold: false,
                                size: fontSize,
                              }),
                            ],
                            alignment: AlignmentType.JUSTIFIED,
                          }),
                        ],
                        width: { size: 95, type: WidthType.PERCENTAGE },
                      }),
                    ],
                  });
                }),

                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "2.",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 5, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "PIHAK KEDUA",
                              bold: true,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      width: { size: 95, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),

                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 5, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "a. Hak",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      width: { size: 95, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),

                ...content.hakPihakKedua.map((hak, index) => {
                  return new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            style: "Normal",
                            children: [
                              new TextRun({
                                text: "",
                                bold: false,
                                size: fontSize,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        width: { size: 5, type: WidthType.PERCENTAGE },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            style: "Normal",
                            children: [
                              new TextRun({
                                text: `   ${index + 1}) ${hak}`,
                                bold: false,
                                size: fontSize,
                              }),
                            ],
                            alignment: AlignmentType.JUSTIFIED,
                          }),
                        ],
                        width: { size: 95, type: WidthType.PERCENTAGE },
                      }),
                    ],
                  });
                }),

                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 5, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "b. Kewajiban",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      width: { size: 95, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),

                ...content.kewajibanPihakKedua.map((kewajiban, index) => {
                  return new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            style: "Normal",
                            children: [
                              new TextRun({
                                text: "",
                                bold: false,
                                size: fontSize,
                              }),
                            ],
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        width: { size: 5, type: WidthType.PERCENTAGE },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            style: "Normal",
                            children: [
                              new TextRun({
                                text: `   ${index + 1}) ${kewajiban}`,
                                bold: false,
                                size: fontSize,
                              }),
                            ],
                            alignment: AlignmentType.JUSTIFIED,
                          }),
                        ],
                        width: { size: 95, type: WidthType.PERCENTAGE },
                      }),
                    ],
                  });
                }),
              ],
              borders: TableBorders.NONE,
            }),

            new Paragraph({ text: "" }),

            // PASAL 4
            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({ text: "Pasal 4", bold: true, size: fontSize }),
                new TextRun({ break: 1 }),
                new TextRun({
                  text: "Jangka Waktu",
                  bold: true,
                  size: fontSize,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({ text: "" }),

            new Table({
              columnWidths: [500, 9500],
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "1.",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 5, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: `Perjanjian Kerjasama ini dibuat dan ditandatangani di Yogyakarta, berlaku mulai tanggal ${formatAngka} untuk waktu ${content.jangkaWaktu} tahun. Perpanjangan Perjanjian Kerjasama ini dapat dilakukan sesuai dengan kesepakatan PARA PIHAK.`,
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.JUSTIFIED,
                        }),
                      ],
                      width: { size: 95, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "2.",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 5, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: `Perpanjangan atau pengakhiran perjanjian ini, apabila dipandang perlu harus diajukan secara tertulis oleh salah satu PIHAK paling lambat 3 (tiga) bulan sebelum berakhirnya Perjanjian Kerjasama ini.`,
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.JUSTIFIED,
                        }),
                      ],
                      width: { size: 95, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
              ],
              borders: TableBorders.NONE,
            }),

            new Paragraph({ text: "" }),

            // PASAL 5
            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({ text: "Pasal 5", bold: true, size: fontSize }),
                new TextRun({ break: 1 }),
                new TextRun({
                  text: "Penyelesaian Perselisihan",
                  bold: true,
                  size: fontSize,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({ text: "" }),

            new Table({
              columnWidths: [500, 9500],
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "1.",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 5, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: `Segala sesuatu perbedaan atau perselisihan yang timbul karena atau sebagai akibat dari pelaksanaan Perjanjian Kerjasama ini akan diselesaikan secara musyawarah dan mufakat oleh PARA PIHAK.`,
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.JUSTIFIED,
                        }),
                      ],
                      width: { size: 95, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "2.",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 5, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: `Apabila musyawarah dan mufakat tidak tercapai, PARA PIHAK sepakat untuk menyelesaikan perselisihan melalui Pengadilan Negeri Yogyakarta.`,
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.JUSTIFIED,
                        }),
                      ],
                      width: { size: 95, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
              ],
              borders: TableBorders.NONE,
            }),

            new Paragraph({ text: "" }),

            // PASAL 6
            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({ text: "Pasal 6", bold: true, size: fontSize }),
                new TextRun({ break: 1 }),
                new TextRun({
                  text: "Penutup",
                  bold: true,
                  size: fontSize,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({ text: "" }),

            new Table({
              columnWidths: [500, 9500],
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "1.",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 5, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: `Hal-hal yang bersifat melengkapi dan belum diatur dalam Perjanjian Kerjasama ini akan ditentukan kemudian atas dasar persetujuan PARA PIHAK dan akan dibuat "addendum" tersendiri yang merupakan bagian yang tidak terpisahkan dari Perjanjian Kerjasama ini.`,
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.JUSTIFIED,
                        }),
                      ],
                      width: { size: 95, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "2.",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 5, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "Perjanjian Kerjasama ini dibuat dalam rangkap 2 (dua) asli, masing-masing bermaterai cukup dan keduanya mempunyai kekuatan hukum yang sama, ditanda tangani dan dibubuhi cap lembaga masing-masing serta diberikan kepada PARA PIHAK pada saat perjanjian ditanda tangani.",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.JUSTIFIED,
                        }),
                      ],
                      width: { size: 95, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
              ],
              borders: TableBorders.NONE,
            }),

            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),

            // TANDA TANGAN
            new Table({
              columnWidths: [5000, 5000],
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "PIHAK PERTAMA,",
                              bold: false,
                              size: fontSize,
                            }),
                            new TextRun({ break: 1 }),
                            new TextRun({ break: 1 }),
                            new TextRun({ break: 1 }),
                            new TextRun({ break: 1 }),
                            new TextRun({ break: 1 }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 50, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: "PIHAK KEDUA",
                              bold: false,
                              size: fontSize,
                            }),
                            new TextRun({ break: 1 }),
                            new TextRun({ break: 1 }),
                            new TextRun({ break: 1 }),
                            new TextRun({ break: 1 }),
                            new TextRun({ break: 1 }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 50, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: pihakPertama.nama,
                              underline: true,
                              bold: true,
                              size: fontSize,
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
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: `${pihakKedua.nama}`,
                              underline: true,
                              bold: true,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 50, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: `NIP ${pihakPertama.nip}`,
                              bold: true,
                              size: fontSize,
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
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: `${pihakKedua.jabatan}`,
                              bold: true,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 50, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
              ],
              borders: TableBorders.NONE,
            }),
          ],
        },
      ],
    });

    // ============================================================
    // RESPONSE GENERATION
    // ============================================================
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Gagal membuat dokumen: " + error.message);
  }
};
