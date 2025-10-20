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
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export const generateDocument = async (pks) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // --- PERSIAPAN LOGO ---
    const upnLogoPath = path.join(__dirname, "../public/images/logo_upn.png");
    const upnLogo = fs.readFileSync(upnLogoPath);

    let partnerLogo = null;
    if (pks.logoUpload && pks.logoUpload.fileName) {
      const partnerLogoPath = path.join(
        __dirname,
        "../uploads/logos",
        pks.logoUpload.fileName
      );
      if (fs.existsSync(partnerLogoPath)) {
        partnerLogo = fs.readFileSync(partnerLogoPath);
      }
    }

    // --- DATA EXTRACTION & FORMATTING ---
    const data = pks;
    const content = data.content || {};
    const tanggal = content.tanggal ? new Date(content.tanggal) : null;
    const formattedNomor = (content.nomor || "").replace(/-/g, "/");
    const pihakKedua = data.pihakKedua || {};

    const capitalizeEachWord = (str) =>
      str ? str.replace(/\b\w/g, (char) => char.toUpperCase()) : "";

    const judulKapital = (content.judul || "KERJA SAMA").toUpperCase();
    const judulAwalKapital = capitalizeEachWord(content.judul || "Kerja Sama");

    const namaHari = tanggal
      ? capitalizeEachWord(
          tanggal.toLocaleDateString("id-ID", { weekday: "long" })
        )
      : "";
    const namaBulan = tanggal
      ? capitalizeEachWord(
          tanggal.toLocaleDateString("id-ID", { month: "long" })
        )
      : "";
    const tanggalHuruf = tanggal
      ? capitalizeEachWord(terbilang(tanggal.getDate()))
      : "";
    const tahunHuruf = tanggal
      ? capitalizeEachWord(terbilang(tanggal.getFullYear()))
      : "";
    const formatAngka = tanggal
      ? `${tanggal.getDate().toString().padStart(2, "0")}-${(
          tanggal.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${tanggal.getFullYear()}`
      : "";
    const kalimatTanggal = tanggal
      ? `${namaHari}, tanggal ${tanggalHuruf} bulan ${namaBulan} tahun ${tahunHuruf} (${formatAngka})`
      : "Pada hari ini";

    const pihakPertama = {
      nama: "Dr. Dyah Sugandini, SE, M.Si",
      jabatan: `Kepala Lembaga Penelitian dan Pengabdian Kepada Masyarakat Universitas Pembangunan Nasional "Veteran" Yogyakarta`,
      skJabatan: `Surat Keputusan Rektor Universitas pembangunan Nasional "Veteran" Yogyakarta Nomor 1569/UN62/KP/2024 tanggal 20 Maret 2024 dalam jabatan tersebut bertindak untuk dan atas nama Universitas Pembangunan Nasional "Veteran" Yogyakarta`,
      alamat:
        "Jl. Pajajaran 104 (Lingkar Utara) Condongcatur, Depok, Sleman, Yogyakarta 55283",
      nip: "19710617 202121 2 001",
    };
    const fontSize = 24; // 12pt
    const lineSpacing = 276; // 1.15 line spacing

    // --- PEMBUATAN DOKUMEN ---
    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: "Normal",
            name: "Normal",
            run: { size: fontSize },
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
          headers: {
            default: new Header({
              children: [
                new Table({
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
                                      transformation: {
                                        width: 100,
                                        height: 100,
                                      },
                                    }),
                                  ],
                                  alignment: AlignmentType.RIGHT,
                                })
                              : new Paragraph({ text: "" }),
                          ],
                        }),
                      ],
                    }),
                  ],
                  borders: TableBorders.NONE,
                }),
              ],
            }),
          },
          properties: {
            page: {
              margin: {
                top: 1440,
                bottom: 1440,
                left: 1440,
                right: 1440,
                header: 720,
              },
            },
          },
          children: [
            new Paragraph({ text: "" }),
            // HEADER
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
                  text: `${(pihakKedua.instansi || "").toUpperCase()}`,
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
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          children: [
                            new TextRun({
                              text: `${pihakKedua.nomor || ""}`,
                              size: fontSize,
                              bold: true,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
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
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "TENTANG", bold: true, size: fontSize }),
                new TextRun({ break: 1 }),
                new TextRun({ text: judulKapital, bold: true, size: fontSize }),
              ],
            }),

            new Paragraph({ text: "" }),

            // PEMBUKAAN
            new Paragraph({
              style: "Normal",
              alignment: AlignmentType.JUSTIFIED,
              children: [
                new TextRun({
                  text: `${kalimatTanggal}, yang bertanda tangan di bawah ini : `,
                  size: fontSize,
                }),
              ],
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
                          text: "I.",
                          style: "Normal",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ text: "Nama", style: "Normal" }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: ":",
                          style: "Normal",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          style: "Normal",
                          alignment: AlignmentType.JUSTIFIED,
                          children: [
                            new TextRun({
                              text: pihakPertama.nama,
                              bold: true,
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: "", style: "Normal" })],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ text: "Jabatan", style: "Normal" }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: ":",
                          style: "Normal",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: pihakPertama.jabatan,
                          style: "Normal",
                          alignment: AlignmentType.JUSTIFIED,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: "", style: "Normal" })],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ text: "SK. Jabatan", style: "Normal" }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: ":",
                          style: "Normal",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: pihakPertama.skJabatan,
                          style: "Normal",
                          alignment: AlignmentType.JUSTIFIED,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: " ", style: "Normal" })],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: "Alamat Kantor",
                          style: "Normal",
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: ":",
                          style: "Normal",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: pihakPertama.alamat,
                          style: "Normal",
                          alignment: AlignmentType.JUSTIFIED,
                        }),
                      ],
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
                new TextRun({ text: "Selanjutnya yang disebut sebagai " }),
                new TextRun({ text: "PIHAK PERTAMA.", bold: true }),
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
                          text: "II.",
                          style: "Normal",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ text: "Nama", style: "Normal" }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: ":",
                          style: "Normal",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: `${pihakKedua.nama || ""}`,
                          style: "Normal",
                          alignment: AlignmentType.JUSTIFIED,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: "", style: "Normal" })],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ text: "Jabatan", style: "Normal" }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: ":",
                          style: "Normal",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: `${pihakKedua.jabatan || ""}`,
                          style: "Normal",
                          alignment: AlignmentType.JUSTIFIED,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: "", style: "Normal" })],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: "Alamat Kantor",
                          style: "Normal",
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: ":",
                          style: "Normal",
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: `${pihakKedua.alamat || ""}`,
                          style: "Normal",
                          alignment: AlignmentType.JUSTIFIED,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
              borders: TableBorders.NONE,
            }),

            new Paragraph({ text: "" }),

            new Paragraph({
              style: "Normal",
              alignment: AlignmentType.JUSTIFIED,
              children: [
                new TextRun({ text: "Selanjutnya yang disebut sebagai " }),
                new TextRun({ text: "PIHAK KEDUA.", bold: true }),
              ],
            }),

            new Paragraph({ text: "" }),

            new Paragraph({
              style: "Normal",
              alignment: AlignmentType.JUSTIFIED,
              text: "PIHAK PERTAMA dan PIHAK KEDUA secara sendiri-sendiri disebut PIHAK dan secara bersama-sama disebut PARA PIHAK. PARA PIHAK menyatakan sepakat dan setuju mengadakan kerjasama untuk saling menunjang pelaksanaan tugas masing-masing dengan ketentuan sebagai berikut : ",
            }),

            new Paragraph({ text: "" }),

            // PASAL 1
            new Paragraph({
              style: "Normal",
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Pasal 1", bold: true }),
                new TextRun({ break: 1 }),
                new TextRun({ text: "TUJUAN KERJASAMA", bold: true }),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              style: "Normal",
              alignment: AlignmentType.JUSTIFIED,
              text: `Dengan tetap mengindahkan ketentuan dan peraturan perundang-undangan yang berlaku bagi PARA PIHAK, Perjanjian Kerjasama ini dibuat dalam rangka menunjang Pelaksanaan Tri Darma Perguruan Tinggi serta membina hubungan kelembagaan antara PARA PIHAK untuk bekerjasama dan saling membantu dalam pelaksanaan Pengabdian Masyarakat dengan judul ${judulAwalKapital}. yang selanjutnya akan disebut program kerjasama.`,
            }),
            new Paragraph({ text: "" }),

            // PASAL 2
            new Paragraph({
              style: "Normal",
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Pasal 2", bold: true }),
                new TextRun({ break: 1 }),
                new TextRun({ text: "RUANG LINGKUP KERJASAMA", bold: true }),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              style: "Normal",
              alignment: AlignmentType.JUSTIFIED,
              text: "Ruang lingkup perjanjian Kerjasama ini meliputi :",
            }),
            new Paragraph({
              style: "Normal",
              alignment: AlignmentType.JUSTIFIED,
              indent: { left: 720 },
              text: "a. Menunjang pelaksanaan Tri Darma Perguruan Tinggi",
            }),
            new Paragraph({
              style: "Normal",
              alignment: AlignmentType.JUSTIFIED,
              indent: { left: 720 },
              text: `b. Kegiatan pengabdian dalam rangka ${judulAwalKapital}.`,
            }),
            new Paragraph({
              style: "Normal",
              alignment: AlignmentType.JUSTIFIED,
              indent: { left: 720 },
              text: "c. Kegiatan- kegiatan lain yang dianggap perlu.",
            }),
            new Paragraph({ text: "" }),

            // PASAL 3
            new Paragraph({
              style: "Normal",
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Pasal 3", bold: true }),
                new TextRun({ break: 1 }),
                new TextRun({ text: "PELAKSANAAN", bold: true }),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              style: "Normal",
              alignment: AlignmentType.JUSTIFIED,
              text: `Pelaksanaan kerjasama secara rinci dalam bidang-bidang tertentu akan disusun dan dituangkan dalam naskah Perjanjian kerjasama yang disetujui oleh PARA PIHAK dan merupakan bagian yang tidak terpisahkan dari naskah perjanjian kerjasama ini.`,
            }),
            new Paragraph({ text: "" }),

            // PASAL 4
            new Paragraph({
              style: "Normal",
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Pasal 4", bold: true }),
                new TextRun({ break: 1 }),
                new TextRun({ text: "PEMBIAYAAN", bold: true }),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              style: "Normal",
              alignment: AlignmentType.JUSTIFIED,
              text: "1. Kegiatan-kegiatan yang akan dilaksanakan berdasarkan Perjanjian Kerjasama ini akan dibiayai dari dana yang relevan dari PARA PIHAK.",
            }),
            new Paragraph({
              style: "Normal",
              alignment: AlignmentType.JUSTIFIED,
              text: "2. Pembiayaan untuk kegiatan yang disepakati tersebut akan diatur dalam Perjanjian Kerjasama tersendiri.",
            }),
            new Paragraph({ text: "" }),

            // PASAL 5
            new Paragraph({
              style: "Normal",
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Pasal 5", bold: true }),
                new TextRun({ break: 1 }),
                new TextRun({ text: "HAK DAN KEWAJIBAN", bold: true }),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              style: "Normal",
              alignment: AlignmentType.JUSTIFIED,
              text: `Hak dan kewajiban PARA PIHAK akan dimusyawarahkan bersama sesuai dengan bentuk dan jenis kegiatan yang dilaksanakan.`,
            }),
            new Paragraph({ text: "" }),

            // PASAL 6
            new Paragraph({
              style: "Normal",
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Pasal 6", bold: true }),
                new TextRun({ break: 1 }),
                new TextRun({ text: "JANGKA WAKTU", bold: true }),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              style: "Normal",
              alignment: AlignmentType.JUSTIFIED,
              text: `Perjanjian Kerjasama ini berlaku untuk jangka waktu 1 (satu) bulan terhitung sejak tanggal penandatanganan dan apabila masa berlakunya sudah berakhir dapat diperpanjang atau diakhiri atas persetujuan PARA PIHAK paling lambat 30 (tiga puluh) hari kalender sebelum masa berlaku Perjanjian Kerjasama ini berakhir.`,
            }),
            new Paragraph({ text: "" }),

            // PASAL 7
            new Paragraph({
              style: "Normal",
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Pasal 7", bold: true }),
                new TextRun({ break: 1 }),
                new TextRun({ text: "PENYELESAIAN PERSELISIHAN", bold: true }),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              style: "Normal",
              alignment: AlignmentType.JUSTIFIED,
              text: `Perselisihan timbul sebagai akibat dari pelaksanaan kerjasama ini akan diselesaikan oleh PARA PIHAK secara musyawarah dan mufakat.`,
            }),
            new Paragraph({ text: "" }),

            // PASAL 8
            new Paragraph({
              style: "Normal",
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Pasal 8", bold: true }),
                new TextRun({ break: 1 }),
                new TextRun({ text: "PENUTUP", bold: true }),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              style: "Normal",
              alignment: AlignmentType.JUSTIFIED,
              text: `1. Hal-hal yang bersifat melengkapi dan belum diatur dalam Perjanjian Kerjasama ini akan ditentukan kemudian atas dasar persetujuan PARA PIHAK dan akan dibuat "addendum" tersendiri yang merupakan bagian yang tidak terpisahkan dari Perjanjian Kerjasama ini.`,
            }),
            new Paragraph({
              style: "Normal",
              alignment: AlignmentType.JUSTIFIED,
              text: "2. Perjanjian Kerjasama ini dibuat dalam rangkap 2 (dua) asli, masing-masing bermaterai cukup dan keduanya mempunyai kekuatan hukum yang sama, ditanda tangani dan dibubuhi cap lembaga masing-masing serta diberikan kepada PARA PIHAK pada saat perjanjian ditanda tangani.",
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
                          text: "PIHAK PERTAMA,",
                          alignment: AlignmentType.CENTER,
                          style: "Normal",
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: "PIHAK KEDUA,",
                          alignment: AlignmentType.CENTER,
                          style: "Normal",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph(""),
                        new Paragraph(""),
                        new Paragraph(""),
                        new Paragraph(""),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph(""),
                        new Paragraph(""),
                        new Paragraph(""),
                        new Paragraph(""),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: pihakPertama.nama,
                              underline: true,
                              bold: true,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                          style: "Normal",
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: pihakKedua.nama || "",
                              underline: true,
                              bold: true,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                          style: "Normal",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: `NIP ${pihakPertama.nip}`,
                          alignment: AlignmentType.CENTER,
                          style: "Normal",
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: pihakKedua.jabatan || "",
                          alignment: AlignmentType.CENTER,
                          style: "Normal",
                        }),
                      ],
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

    const buffer = await Packer.toBuffer(doc);
    return buffer;
  } catch (error) {
    console.error("Error generating document in service:", error);
    throw new Error("Gagal membuat dokumen: " + error.message);
  }
};
