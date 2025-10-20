import PKS from "../models/pks.model.js";
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
          children: [
            // HEADER
            logoHeader,
            new Paragraph({ text: "" }),

            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({
                  text: "PERJANJIAN KERJASAMA",
                  bold: true,
                  size: fontSize,
                }),
                new TextRun({ break: 1 }),
                new TextRun({ text: " ANTARA", bold: true, size: fontSize }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({ text: "" }),

            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({
                  text: `LEMBAGA PENELITIAN DAN PENGABDIAN KEPADA MASYARAKAT`,
                  bold: true,
                  size: fontSize,
                }),
                new TextRun({ break: 1 }),
                new TextRun({
                  text: `UNIVERSITAS PEMBANGUNAN NASIONAL "VETERAN" YOGYAKARTA`,
                  bold: true,
                  size: fontSize,
                }),
                new TextRun({ break: 1 }),
                new TextRun({ text: `DAN`, bold: true, size: fontSize }),
                new TextRun({ break: 1 }),
                new TextRun({
                  text: `${pihakKedua.instansi}`,
                  bold: true,
                  size: fontSize,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({ text: "" }),

            // NOMOR
            new Table({
              columnWidths: [3500, 500, 6000],
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
                              text: "Nomor",
                              size: fontSize,
                              bold: true,
                            }),
                          ],
                          alignment: AlignmentType.RIGHT,
                        }),
                      ],
                      width: { size: 35, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: ":",
                              size: fontSize,
                              bold: true,
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
                              text: `${formattedNomor}`,
                              size: fontSize,
                              bold: true,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      width: { size: 60, type: WidthType.PERCENTAGE },
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
                              text: "Nomor",
                              size: fontSize,
                              bold: true,
                            }),
                          ],
                          alignment: AlignmentType.RIGHT,
                        }),
                      ],
                      width: { size: 35, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: ":",
                              size: fontSize,
                              bold: true,
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
                              text: `${pihakKedua.nomor}`,
                              size: fontSize,
                              bold: true,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      width: { size: 60, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
              ],
              borders: TableBorders.NONE,
            }),

            new Paragraph({ text: "" }),

            // TENTANG
            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({ text: "TENTANG", bold: true, size: fontSize }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({
                  text: `${content.judul}`,
                  bold: true,
                  size: fontSize,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({ text: "" }),

            // PEMBUKAAN
            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({
                  text: `${kalimatTanggal}, yang bertanda tangan di bawah ini : `,
                  bold: false,
                  size: fontSize,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
            }),

            new Paragraph({ text: "" }),

            // PIHAK PERTAMA
            new Table({
              columnWidths: [500, 3000, 500, 6000],
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
                              text: "I.",
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
                      width: { size: 30, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: ":",
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
                              text: pihakPertama.nama,
                              bold: true,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.JUSTIFIED,
                        }),
                      ],
                      width: { size: 60, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [new TextRun({ text: "", bold: false })],
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
                      width: { size: 30, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: ":",
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
                              text: pihakPertama.jabatan,
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.JUSTIFIED,
                        }),
                      ],
                      width: { size: 60, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [new TextRun({ text: "", bold: false })],
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
                              text: "SK. Jabatan",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      width: { size: 30, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: ":",
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
                              text: pihakPertama.skJabatan,
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.JUSTIFIED,
                        }),
                      ],
                      width: { size: 60, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [new TextRun({ text: " ", bold: false })],
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
                              text: "Alamat Kantor",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      width: { size: 30, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: ":",
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
                              text: pihakPertama.alamat,
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.JUSTIFIED,
                        }),
                      ],
                      width: { size: 60, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
              ],
              borders: TableBorders.NONE,
            }),

            new Paragraph({ text: "" }),

            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({
                  text: "Selanjutnya yang disebut sebagai",
                  bold: false,
                  size: fontSize,
                }),
                new TextRun({
                  text: " PIHAK PERTAMA.",
                  bold: true,
                  size: fontSize,
                }),
              ],
            }),

            new Paragraph({ text: "" }),

            // PIHAK KEDUA
            new Table({
              columnWidths: [500, 3000, 500, 6000],
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
                              text: "II.",
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
                      width: { size: 30, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: ":",
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
                              text: `${pihakKedua.nama}`,
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.JUSTIFIED,
                        }),
                      ],
                      width: { size: 60, type: WidthType.PERCENTAGE },
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
                      width: { size: 30, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: ":",
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
                              text: `${pihakKedua.jabatan}`,
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.JUSTIFIED,
                        }),
                      ],
                      width: { size: 60, type: WidthType.PERCENTAGE },
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
                              text: "Alamat Kantor",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      width: { size: 30, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: ":",
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
                              text: `${pihakKedua.alamat}`,
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.JUSTIFIED,
                        }),
                      ],
                      width: { size: 60, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
              ],
              borders: TableBorders.NONE,
            }),

            new Paragraph({ text: "" }),

            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({
                  text: "Selanjutnya yang disebut sebagai",
                  bold: false,
                  size: fontSize,
                }),
                new TextRun({
                  text: " PIHAK KEDUA.",
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
                  text: "PIHAK PERTAMA dan PIHAK KEDUA secara sendiri-sendiri disebut PIHAK dan secara bersama-sama disebut PARA PIHAK. PARA PIHAK menyatakan sepakat dan setuju mengadakan kerjasama untuk saling menunjang pelaksanaan tugas masing-masing dengan ketentuan sebagai berikut : ",
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
                  text: "TUJUAN KERJASAMA",
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
                  text: `Dengan tetap mengindahkan ketentuan dan peraturan perundang-undangan yang berlaku bagi PARA PIHAK, Perjanjian Kerjasama ini dibuat dalam rangka menunjang Pelaksanaan Tri Darma Perguruan Tinggi serta membina hubungan kelembagaan antara PARA PIHAK untuk bekerjasama dan saling membantu dalam pelaksanaan Pengabdian Masyarakat dengan judul ${content.judul}. yang selanjutnya akan disebut program kerjasama.`,
                  bold: false,
                  size: fontSize,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
            }),

            new Paragraph({ text: "" }),

            // PASAL 2
            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({ text: "Pasal 2", bold: true, size: fontSize }),
                new TextRun({ break: 1 }),
                new TextRun({
                  text: "RUANG LINGKUP KERJASAMA",
                  bold: true,
                  size: fontSize,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({ text: "" }),

            new Table({
              columnWidths: [500, 500, 9000],
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
                              text: "Ruang lingkup perjanjian Kerjasama ini meliputi :",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.JUSTIFIED,
                        }),
                      ],
                      columnSpan: 3,
                      width: { size: 100, type: WidthType.PERCENTAGE },
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
                              text: " ",
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
                              text: "a.",
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
                              text: "Menunjang pelaksanaan Tri Darma Perguruan Tinggi",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.JUSTIFIED,
                        }),
                      ],
                      width: { size: 90, type: WidthType.PERCENTAGE },
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
                              text: " ",
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
                              text: "b.",
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
                              text: `Kegiatan pengabdian dalam rangka ${content.judul}.`,
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.JUSTIFIED,
                        }),
                      ],
                      width: { size: 90, type: WidthType.PERCENTAGE },
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
                              text: " ",
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
                              text: "c.",
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
                              text: "Kegiatan- kegiatan lain yang dianggap perlu.",
                              bold: false,
                              size: fontSize,
                            }),
                          ],
                          alignment: AlignmentType.JUSTIFIED,
                        }),
                      ],
                      width: { size: 90, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
              ],
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
                  text: "PELAKSANAAN",
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
                  text: `Pelaksanaan kerjasama secara rinci dalam bidang-bidang tertentu akan disusun dan dituangkan dalam naskah Perjanjian kerjasama yang disetujui oleh PARA PIHAK dan merupakan bagian yang tidak terpisahkan dari naskah perjanjian kerjasama ini.`,
                  bold: false,
                  size: fontSize,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
            }),

            new Paragraph({ text: "" }),

            // PASAL 4
            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({ text: "Pasal 4", bold: true, size: fontSize }),
                new TextRun({ break: 1 }),
                new TextRun({
                  text: "PELAKSANAAN",
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
                              text: "Kegiatan-kegiatan yang akan dilaksanakan berdasarkan Perjanjian Kerjasama ini akan dibiayai dari dana yang relevan dari PARA PIHAK.",
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
                              text: "Pembiayaan untuk kegiatan yang disepakati tersebut akan diatur dalam Perjanjian Kerjasama tersendiri.",
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
                  text: "HAK DAN KEWAJIBAN",
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
                  text: `Hak dan kewajiban PARA PIHAK akan dimusyawarahkan bersama sesuai dengan bentuk dan jenis kegiatan yang dilaksanakan.`,
                  bold: false,
                  size: fontSize,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
            }),

            new Paragraph({ text: "" }),

            // PASAL 6
            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({ text: "Pasal 6", bold: true, size: fontSize }),
                new TextRun({ break: 1 }),
                new TextRun({
                  text: "JANGKA WAKTU",
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
                  text: `Perjanjian Kerjasama ini berlaku untuk jangka waktu 1 (satu) bulan terhitung sejak tanggal penandatanganan dan apabila masa berlakunya sudah berakhir dapat diperpanjang atau diakhiri atas persetujuan PARA PIHAK paling lambat 30 (tiga puluh) hari kalender sebelum masa berlaku Perjanjian Kerjasama ini berakhir.`,
                  bold: false,
                  size: fontSize,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
            }),

            new Paragraph({ text: "" }),

            // PASAL 7
            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({ text: "Pasal 7", bold: true, size: fontSize }),
                new TextRun({ break: 1 }),
                new TextRun({
                  text: "PENYELESAIAN PERSELISIHAN",
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
                  text: `Perselisihan timbul sebagai akibat dari pelaksanaan kerjasama ini akan diselesaikan oleh PARA PIHAK secara musyawarah dan mufakat.`,
                  bold: false,
                  size: fontSize,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
            }),

            new Paragraph({ text: "" }),

            // PASAL 8
            new Paragraph({
              style: "Normal",
              children: [
                new TextRun({ text: "Pasal 8", bold: true, size: fontSize }),
                new TextRun({ break: 1 }),
                new TextRun({ text: "PENUTUPAN", bold: true, size: fontSize }),
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
