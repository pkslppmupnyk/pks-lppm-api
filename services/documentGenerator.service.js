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
  Footer,
  PageNumber,
  BorderStyle, // Tambahan untuk divider
} from "docx";
import imageSize from "image-size";
import terbilang from "terbilang";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { toAllCapital, toCapitalizeFirst } from "./textFormatter.js";

export const generateDocument = async (pks) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // ============================================================
    // 1. PERSIAPAN LOGO
    // ============================================================
    const upnLogoPath = path.join(__dirname, "../public/images/logo_upn.png");
    const upnLogo = fs.readFileSync(upnLogoPath);

    let partnerLogo = null;
    if (pks.logoUpload && pks.logoUpload.fileName) {
      const partnerLogoPath = path.join(
        __dirname,
        "../uploads/logos",
        pks.logoUpload.fileName,
      );
      try {
        if (fs.existsSync(partnerLogoPath)) {
          partnerLogo = fs.readFileSync(partnerLogoPath);
        }
      } catch (e) {
        console.error("Logo mitra tidak ditemukan.");
      }
    }

    const createLogoHeader = () => {
      const logoChildren = [];

      // LOGO MITRA DI KIRI
      if (partnerLogo) {
        const partnerDimensions = imageSize(partnerLogo);
        const partnerHeight = 60;
        const partnerWidth =
          (partnerDimensions.width / partnerDimensions.height) * partnerHeight;

        logoChildren.push(
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    data: partnerLogo,
                    transformation: {
                      width: partnerWidth,
                      height: partnerHeight,
                    },
                  }),
                ],
                alignment: AlignmentType.LEFT,
              }),
            ],
            verticalAlign: "center",
          }),
        );
      } else {
        // Placeholder jika tidak ada logo mitra
        logoChildren.push(
          new TableCell({ children: [], verticalAlign: "center" }),
        );
      }

      // LOGO UPN DI KANAN
      const upnDimensions = imageSize(upnLogo);
      const upnHeight = 60;
      const upnWidth = (upnDimensions.width / upnDimensions.height) * upnHeight;

      logoChildren.push(
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new ImageRun({
                  data: upnLogo,
                  transformation: { width: upnWidth, height: upnHeight },
                }),
              ],
              alignment: AlignmentType.RIGHT, // Align Kanan
            }),
          ],
          verticalAlign: "center",
        }),
      );

      return new Table({
        columnWidths: [4500, 4500],
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [new TableRow({ children: logoChildren })],
        borders: TableBorders.NONE,
      });
    };

    // ============================================================
    // 2. DATA PREPARATION
    // ============================================================

    const data = pks;
    const content = data.content;
    const tanggal = new Date(content.tanggal); // Pastikan object Date
    const formattedNomorUPN = content.nomor
      ? content.nomor.replace(/-/g, "/")
      : "....................";

    // --- LOGIKA PEMBALIKAN PIHAK ---
    // PIHAK KESATU = MITRA (Data dari Database)
    const pihakKesatu = {
      instansi: data.pihakKedua.instansi,
      nama: data.pihakKedua.nama,
      jabatan: data.pihakKedua.jabatan,
      alamat: data.pihakKedua.alamat,
      nomorDokumen: data.pihakKedua.nomor || "....................",
    };

    // PIHAK KEDUA = UPN (Data Statis)
    const pihakKedua = {
      instansi: `UPN "Veteran" Yogyakarta`,
      nama: "Prof. Dr. Dyah Sugandini, SE, M.Si",
      jabatan: "Kepala Lembaga Penelitian dan Pengabdian Kepada Masyarakat",
      // Teks deskripsi dipotong sedikit agar "PIHAK KEDUA" bisa dibold manual di bawah
      deskripsi: `Selaku Kepala Lembaga Penelitian dan Pengabdian Kepada Masyarakat Universitas Pembangunan Nasional "Veteran" Yogyakarta, berdasarkan Surat Keputusan Rektor Universitas pembangunan Nasional "Veteran" Yogyakarta Nomor 1569/UN62/KP/2024 tanggal 20 Maret 2024, dalam jabatan tersebut bertindak untuk dan atas nama Universitas Pembangunan Nasional "Veteran" Yogyakarta, berkedudukan di Jl. Pajajaran 104 (Lingkar Utara) Condongcatur, Depok, Sleman, Yogyakarta 55283, untuk selanjutnya disebut `,
      nip: "19710617 202121 2 001",
    };

    // Helper Text
    const capitalizeEachWord = (str) =>
      str.replace(/\b\w/g, (char) => char.toUpperCase());
    const namaHari = capitalizeEachWord(
      tanggal.toLocaleDateString("id-ID", { weekday: "long" }),
    );
    const namaBulan = capitalizeEachWord(
      tanggal.toLocaleDateString("id-ID", { month: "long" }),
    );
    const tanggalHuruf = capitalizeEachWord(terbilang(tanggal.getDate()));
    const tahunHuruf = capitalizeEachWord(terbilang(tanggal.getFullYear()));

    // Formatting Doc settings
    const fontSize = 24; // 12pt
    const lineSpacing = 276; // 1.15

    // ============================================================
    // 3. DOCUMENT GENERATION
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
              alignment: AlignmentType.JUSTIFIED,
            },
            run: {
              font: "Times New Roman",
              size: fontSize,
            },
          },
        ],
      },
      sections: [
        {
          properties: {
            page: {
              margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, // Approx 2.54cm
            },
          },
          headers: {
            default: new Header({
              children: [createLogoHeader(), new Paragraph({ text: "" })],
            }),
          },
          footer: {
            default: new Footer({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      children: ["Halaman ", PageNumber.CURRENT],
                    }),
                    new TextRun({
                      children: [" dari ", PageNumber.TOTAL_PAGES],
                    }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
              ],
            }),
          },
          children: [
            // --- JUDUL ---
            new Paragraph({
              children: [
                new TextRun({ text: "PERJANJIAN KERJA SAMA", bold: true }),
                new TextRun({ break: 1 }),
                // Italic & Bold untuk MoA
                new TextRun({
                  text: "( MEMORANDUM OF AGREEMENT )",
                  bold: true,
                  italics: true,
                }),
                new TextRun({ break: 1 }),
                new TextRun({ text: "ANTARA", bold: true }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({ text: "" }),

            // --- NAMA MITRA ---
            new Paragraph({
              children: [
                new TextRun({
                  text: toAllCapital(pihakKesatu.instansi),
                  bold: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({
              children: [new TextRun({ text: "DAN", bold: true })],
              alignment: AlignmentType.CENTER,
            }),

            // --- NAMA UPN ---
            new Paragraph({
              children: [
                new TextRun({
                  text: `LEMBAGA PENELITIAN DAN PENGABDIAN KEPADA MASYARAKAT`,
                  bold: true,
                }),
                new TextRun({ break: 1 }),
                new TextRun({
                  text: `UNIVERSITAS PEMBANGUNAN NASIONAL "VETERAN" YOGYAKARTA`,
                  bold: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({ text: "" }),

            // --- TENTANG ---
            new Paragraph({
              children: [new TextRun({ text: "TENTANG", bold: true })],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: toAllCapital(content.judul), bold: true }),
              ],
              alignment: AlignmentType.CENTER,
              // DIVIDER (Garis bawah pada paragraf judul/tentang)
              border: {
                bottom: {
                  style: BorderStyle.SINGLE,
                  size: 6,
                  color: "000000",
                },
              },
              spacing: { after: 200 }, // Jarak setelah garis
            }),

            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),

            // --- TABEL NOMOR ---
            new Table({
              columnWidths: [2000, 500, 7500],
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                // Baris 1: Nomor Mitra
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: "NOMOR", bold: true }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      borders: {
                        top: { style: "none" },
                        bottom: { style: "none" },
                        left: { style: "none" },
                        right: { style: "none" },
                      },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: ":", bold: true })],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      borders: {
                        top: { style: "none" },
                        bottom: { style: "none" },
                        left: { style: "none" },
                        right: { style: "none" },
                      },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: pihakKesatu.nomorDokumen,
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      borders: {
                        top: { style: "none" },
                        bottom: { style: "none" },
                        left: { style: "none" },
                        right: { style: "none" },
                      },
                    }),
                  ],
                }),
                // Baris 2: Nomor UPN
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: "NOMOR", bold: true }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      borders: {
                        top: { style: "none" },
                        bottom: { style: "none" },
                        left: { style: "none" },
                        right: { style: "none" },
                      },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: ":", bold: true })],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      borders: {
                        top: { style: "none" },
                        bottom: { style: "none" },
                        left: { style: "none" },
                        right: { style: "none" },
                      },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: formattedNomorUPN,
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      borders: {
                        top: { style: "none" },
                        bottom: { style: "none" },
                        left: { style: "none" },
                        right: { style: "none" },
                      },
                    }),
                  ],
                }),
              ],
              borders: TableBorders.NONE,
            }),

            new Paragraph({ text: "" }),

            // --- KALIMAT PEMBUKA (REVISI: Title Case Judul) ---
            new Paragraph({
              children: [
                new TextRun({
                  // REVISI: Menggunakan capitalizeEachWord untuk Capitalize First Letter Each Word
                  text: `Perjanjian Kerja Sama tentang ${capitalizeEachWord(content.judul)} (selanjutnya disebut “Perjanjian”) ini dibuat dan ditandatangani pada hari ${namaHari} tanggal ${tanggalHuruf} bulan ${namaBulan} tahun ${tahunHuruf}, bertempat di Yogyakarta, oleh dan antara:`,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
            }),

            new Paragraph({ text: "" }),

            // --- IDENTITAS PARA PIHAK ---

            // 1. PIHAK KESATU
            new Paragraph({
              children: [
                new TextRun({
                  text: "I.\t",
                  bold: true,
                }),
                new TextRun({
                  text: `${pihakKesatu.nama}, selaku ${pihakKesatu.jabatan}, dalam jabatan tersebut bertindak untuk dan atas nama ${pihakKesatu.instansi}, berkedudukan di ${pihakKesatu.alamat}, untuk selanjutnya disebut `,
                }),
                new TextRun({
                  text: "PIHAK KESATU.",
                  bold: true,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              indent: {
                left: 720,
                hanging: 360,
              },
            }),

            new Paragraph({ text: "" }),

            // 2. PIHAK KEDUA
            new Paragraph({
              children: [
                new TextRun({
                  text: "II.\t",
                  bold: true,
                }),
                new TextRun({
                  text: `${pihakKedua.nama}, selaku ${pihakKedua.jabatan}, dalam jabatan tersebut bertindak untuk dan atas nama ${pihakKedua.instansi}, berkedudukan di ${pihakKedua.alamat}, untuk selanjutnya disebut `,
                }),
                new TextRun({
                  text: "PIHAK KEDUA.",
                  bold: true,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              indent: {
                left: 720,
                hanging: 360,
              },
            }),

            new Paragraph({ text: "" }),

            // --- KONSIDERANS (Latar Belakang) ---
            // REVISI: BOLD "PARA PIHAK"
            new Paragraph({
              children: [
                new TextRun({ text: "PARA PIHAK", bold: true }),
                new TextRun({ text: " terlebih dahulu menerangkan:" }),
              ],
              alignment: AlignmentType.JUSTIFIED,
            }),

            // Poin 1 (Mitra) - REVISI: Ganti Bullet jadi Angka
            new Paragraph({
              children: [
                new TextRun({
                  text: `1.\tbahwa PIHAK KESATU adalah ${pihakKesatu.instansi};`,
                }),
              ],
              indent: { left: 720, hanging: 360 }, // Hanging indent untuk angka
              alignment: AlignmentType.JUSTIFIED,
            }),

            // Poin 2 (UPN) - REVISI: Ganti Bullet jadi Angka
            new Paragraph({
              children: [
                new TextRun({
                  text: "2.\tbahwa PIHAK KEDUA adalah salah satu unsur pelaksana akademik di bidang penelitian dan pengabdian kepada masyarakat yang berada di bawah dan bertanggung jawab kepada Rektor berdasarkan Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia Nomor 20 Tahun 2024 tentang Organisasi dan Tata Kerja Universitas Pembangunan Nasional “Veteran” Yogyakarta;",
                }),
              ],
              indent: { left: 720, hanging: 360 }, // Hanging indent untuk angka
              alignment: AlignmentType.JUSTIFIED,
            }),

            new Paragraph({ text: "dan" }),

            // --- KESEPAKATAN ---
            // REVISI: BOLD "PARA PIHAK"
            new Paragraph({
              children: [
                new TextRun({
                  text: `Berdasarkan hal-hal tersebut di atas, `,
                }),
                new TextRun({
                  text: "PARA PIHAK",
                  bold: true,
                }),
                new TextRun({
                  text: ` sepakat untuk mengikatkan diri dalam Perjanjian Kerja Sama tentang ${toCapitalizeFirst(content.judul)} (kegiatan atau program yang akan dilaksanakan).`,
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
            }),

            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),

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
                // Bagian 1: Teks normal sebelum "PARA PIHAK"
                new TextRun({
                  text: "Tujuan dilakukan perjanjian ini adalah sebagai landasan bagi ",
                }),

                // Bagian 2: Teks "PARA PIHAK" yang di-bold
                new TextRun({
                  text: "PARA PIHAK",
                  bold: true,
                }),

                // Bagian 3: Teks normal sisanya (termasuk variabel judul)
                new TextRun({
                  text: ` dalam melakukan kegiatan dukungan PIHAK KEDUA dalam rangka penyelenggaraan Tri Dharma Perguruan Tinggi melalui kerja sama ${toCapitalizeFirst(content.judul)}.`,
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
            // Poin 1: Logika 3 Pilihan
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
              indent: { left: 720, hanging: 360 },
              alignment: AlignmentType.JUSTIFIED,
            }),
            // Poin 2: Statis (REVISI: BOLD PARA PIHAK)
            new Paragraph({
              children: [
                new TextRun({
                  text: "2.\tPemanfaatan sumberdaya manusia serta fasilitas sarana dan prasarana yang dimiliki ",
                }),
                new TextRun({
                  text: "PARA PIHAK",
                  bold: true,
                }),
                new TextRun({
                  text: " untuk menunjang kelancaran penyelenggaraan kegiatan.",
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
            // Ayat 1 (REVISI: BOLD PARA PIHAK)
            new Paragraph({
              children: [
                new TextRun({ text: "(1)\t" }),
                new TextRun({
                  text: "PARA PIHAK",
                  bold: true,
                }),
                new TextRun({
                  text: " sepakat dalam pelaksanaan kegiatan akan mematuhi seluruh aspek perundang-undangan yang berlaku dan menunjuk wakil-wakilnya yang memiliki kompetensi dan disiplin ilmu yang terkait untuk melaksanakan Perjanjian ini.",
                }),
              ],
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
            // Ayat 4 (REVISI: BOLD PARA PIHAK 2x)
            new Paragraph({
              children: [
                new TextRun({
                  text: "(4)\tApabila salah satu dari ",
                }),
                new TextRun({
                  text: "PARA PIHAK",
                  bold: true,
                }),
                new TextRun({
                  text: " berkehendak melibatkan pihak lain dalam pelaksanaan kegiatan perjanjian ini maka dibutuhkan persetujuan tertulis dari ",
                }),
                new TextRun({
                  text: "PARA PIHAK",
                  bold: true,
                }),
                new TextRun({ text: "." }),
              ],
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
            // Ayat 2 (REVISI: BOLD PARA PIHAK)
            new Paragraph({
              children: [
                new TextRun({
                  text: "(2)\tSegala biaya yang timbul sebagai akibat dari pelaksanaan Perjanjian ini menjadi beban ",
                }),
                new TextRun({
                  text: "PARA PIHAK",
                  bold: true,
                }),
                new TextRun({
                  text: " sesuai dengan proporsi tanggung jawab masing-masing;",
                }),
              ],
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

            // Ayat (1) - PIHAK KESATU
            new Paragraph({
              text: "(1)\tPIHAK KESATU mempunyai Tugas dan Tanggungjawab:",
              indent: { left: 720, hanging: 450 },
              alignment: AlignmentType.JUSTIFIED,
            }),
            // 1.a
            new Paragraph({
              text: "a.\tMengidentifikasi dan menyiapkan data dan informasi dalam mendukung pelaksanaan Perjanjian Kerjasama;",
              indent: { left: 1440, hanging: 360 }, // Indent lebih dalam untuk sub-poin
              alignment: AlignmentType.JUSTIFIED,
            }),
            // 1.b (Contains BOLD PARA PIHAK)
            new Paragraph({
              children: [
                new TextRun({
                  text:
                    content.bentukKerjaSama.includes("Penelitian") &&
                    content.bentukKerjaSama.includes("Pengabdian Masyarakat")
                      ? "b.\tMemfasilitasi Kegiatan Penelitian dan Pengabdian bagi Masyarakat serta menyediakan fasilitas sarana dan prasarana yang dimiliki "
                      : content.bentukKerjaSama.includes("Penelitian")
                        ? "b.\tMemfasilitasi Kegiatan Penelitian serta menyediakan fasilitas sarana dan prasarana yang dimiliki "
                        : "b.\tMemfasilitasi Kegiatan Pengabdian bagi Masyarakat serta menyediakan fasilitas sarana dan prasarana yang dimiliki ",
                }),
                new TextRun({
                  text: "PARA PIHAK",
                  bold: true,
                }),
                new TextRun({
                  text: " untuk menunjang kelancaran penyelenggaraan kegiatan.",
                }),
              ],
              indent: { left: 1440, hanging: 360 },
              alignment: AlignmentType.JUSTIFIED,
            }),

            // Ayat (2) - PIHAK KEDUA
            new Paragraph({
              text: "(2)\tPIHAK KEDUA mempunyai Tugas dan Tanggungjawab:",
              indent: { left: 720, hanging: 450 },
              alignment: AlignmentType.JUSTIFIED,
            }),
            // 2.a
            new Paragraph({
              text: "a.\tMengolah data dan informasi yang diperoleh dari PIHAK KESATU;",
              indent: { left: 1440, hanging: 360 },
              alignment: AlignmentType.JUSTIFIED,
            }),
            // 2.b
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
              indent: { left: 1440, hanging: 360 },
              alignment: AlignmentType.JUSTIFIED,
            }),

            // Ayat (3) - BERSAMA (Contains BOLD PARA PIHAK)
            new Paragraph({
              children: [
                new TextRun({ text: "(3)\t" }),
                new TextRun({
                  text: "PARA PIHAK",
                  bold: true,
                }),
                new TextRun({
                  text: " bersama-sama mempunyai tugas dan tanggungjawab menyusun laporan pelaksanaan kegiatan.",
                }),
              ],
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
            // Ayat 1: Durasi (REVISI: BOLD PARA PIHAK)
            new Paragraph({
              children: [
                new TextRun({
                  text: `(1)\tPerjanjian ini berlaku untuk jangka waktu 1 (satu) tahun, terhitung sejak tanggal ${tanggalHuruf} bulan ${namaBulan} tahun ${tahunHuruf} sampai dengan tanggal ${content.tanggalKadaluarsa ? new Date(content.tanggalKadaluarsa).toLocaleDateString("id-ID") : "...................."} dan dapat diperpanjang berdasarkan kesepakatan `,
                }),
                new TextRun({
                  text: "PARA PIHAK",
                  bold: true,
                }),
                new TextRun({
                  text: ";",
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
            // ============================================================
            ...(() => {
              const dynamicSections = [];
              let pCounter = 7; // Mulai hitungan dari Pasal 7

              // PASAL 7 - PENGHENTIAN PERJANJIAN
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
              pCounter++;

              // PASAL 8 (OPSIONAL) - HAK KEKAYAAN INTELEKTUAL
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
                  // Ayat 1 (REVISI: BOLD para pihak)
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "(1)\tSetiap HKI yang dibawa oleh ",
                      }),
                      new TextRun({
                        text: "para pihak",
                        bold: true,
                      }),
                      new TextRun({
                        text: " (HKI bawaan) dalam melaksanakan kegiatan menurut perjanjian ini menjadi milik PIHAK KEDUA.",
                      }),
                    ],
                    indent: { left: 720, hanging: 450 },
                    alignment: AlignmentType.JUSTIFIED,
                  }),
                  // Ayat 2
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
                  // Ayat 5 (REVISI: BOLD para pihak)
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "(5)\tPenghentian pelaksanaan kegiatan menurut perjanjian ini tidak serta merta menghentikan segala hak dan/atau kewajiban ",
                      }),
                      new TextRun({
                        text: "para pihak",
                        bold: true,
                      }),
                      new TextRun({
                        text: " yang diatur dalam pasal ini.",
                      }),
                    ],
                    indent: { left: 720, hanging: 450 },
                    alignment: AlignmentType.JUSTIFIED,
                  }),
                  new Paragraph({ text: "" }),
                );
                pCounter++;
              }

              // PASAL FORCE MAJEURE
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
                // Paragraf Akhir (REVISI: BOLD PARA PIHAK)
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Setelah keadaan Kahar/Force Majeure berakhir dan kondisinya masih memungkinkan kegiatan dapat dilaksanakan oleh PIHAK PERTAMA maka ",
                    }),
                    new TextRun({
                      text: "PARA PIHAK",
                      bold: true,
                    }),
                    new TextRun({
                      text: " akan melanjutkan pelaksanaan perjanjian ini sesuai dengan ketentuan-ketentuan yang diatur dalam perjanjian ini.",
                    }),
                  ],
                  indent: { left: 720 },
                  alignment: AlignmentType.JUSTIFIED,
                }),
                new Paragraph({ text: "" }),
              );
              pCounter++;

              // PASAL PENYELESAIAN PERSELISIHAN
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

              // PASAL PEMBATALAN PERJANJIAN
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

              // PASAL KORESPONDENSI
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
                // Ayat 2 (REVISI: BOLD PARA PIHAK)
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "(2)\tAlamat ",
                    }),
                    new TextRun({
                      text: "PARA PIHAK",
                      bold: true,
                    }),
                    new TextRun({
                      text: " yang akan dipakai untuk komunikasi guna keperluan sebagaimana dimaksud pada ayat (1) adalah sebagai berikut:",
                    }),
                  ],
                  indent: { left: 720, hanging: 450 },
                  alignment: AlignmentType.JUSTIFIED,
                }),

                // Detail Kontak PIHAK KESATU (MITRA)
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
                new Paragraph({
                  text: `Nama\t: ${pihakKesatu.nama}`,
                  indent: { left: 1440 },
                }),
                new Paragraph({
                  text: `Alamat\t: ${pihakKesatu.alamat}`,
                  indent: { left: 1440 },
                }),
                new Paragraph({
                  text: `Email\t: ${data.properties.email || "-"}`,
                  indent: { left: 1440 },
                }),
                new Paragraph({
                  text: `Telepon\t: ${data.properties.telepon || "-"}`,
                  indent: { left: 1440 },
                }),

                // Detail Kontak PIHAK KEDUA (UPN)
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
                new Paragraph({
                  text: "Alamat\t: Jalan Pajajaran 104, Sleman, Daerah Istimewa Yogyakarta, 55283",
                  indent: { left: 1440 },
                }),
                new Paragraph({
                  text: "Email\t: lppm@upnyk.ac.id",
                  indent: { left: 1440 },
                }),
                new Paragraph({
                  text: "Telepon\t: (0274) 486773",
                  indent: { left: 1440 },
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

              // PASAL PENUTUP
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
                // Ayat 1 (REVISI: BOLD PARA PIHAK)
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "(1)\tPerubahan terhadap Perjanjian Kerja Sama ini akan ditetapkan dalam addendum yang disepakati oleh ",
                    }),
                    new TextRun({
                      text: "PARA PIHAK",
                      bold: true,
                    }),
                    new TextRun({
                      text: " dan merupakan bagian yang tidak terpisahkan dari Perjanjian Kerja Sama ini.",
                    }),
                  ],
                  indent: { left: 720, hanging: 450 },
                  alignment: AlignmentType.JUSTIFIED,
                }),
                // Ayat 2 (REVISI: BOLD PARA PIHAK)
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "(2)\tPerjanjian Kerja Sama ini dibuat dan ditandatangani oleh ",
                    }),
                    new TextRun({
                      text: "PARA PIHAK",
                      bold: true,
                    }),
                    new TextRun({
                      text: " pada hari dan tanggal tersebut pada bagian awal Kesepakatan Bersama ini, dibuat dalam rangkap 2 (dua) yang bermeterai cukup dan mempunyai kekuatan hukum yang sama, untuk masing-masing pihak dan dipergunakan sebagaimana mestinya.",
                    }),
                  ],
                  indent: { left: 720, hanging: 450 },
                  alignment: AlignmentType.JUSTIFIED,
                }),
                new Paragraph({ text: "" }),
                // Paragraf Penutup Akhir (REVISI: BOLD PARA PIHAK 2x)
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Demikian Perjanjian Kerja Sama ini dibuat oleh ",
                    }),
                    new TextRun({
                      text: "PARA PIHAK",
                      bold: true,
                    }),
                    new TextRun({
                      text: " dengan itikad baik, untuk dapat dipatuhi dan dilaksanakan oleh ",
                    }),
                    new TextRun({
                      text: "PARA PIHAK.",
                      bold: true,
                    }),
                  ],
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
                  cantSplit: true, // PENTING: Mencegah tanda tangan terpotong antar halaman
                  children: [
                    // --- KOLOM KIRI (MITRA / PIHAK KESATU) ---
                    new TableCell({
                      children: [
                        // HEADER: PIHAK KESATU
                        new Paragraph({
                          children: [
                            new TextRun({ text: "PIHAK KESATU", bold: true }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                        // SUB-HEADER: JABATAN (Revisi: Pakai Jabatan & CapitalizeFirst)
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: toCapitalizeFirst(pihakKesatu.jabatan),
                              bold: true,
                              size: 20,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),

                        // SPACER (Ruang Tanda Tangan)
                        new Paragraph({
                          text: "",
                          spacing: { before: 1500 }, // Jarak untuk tanda tangan
                        }),

                        // NAMA PENANDATANGAN
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
                        // FOOTER: INSTANSI (Pindah ke bawah agar rapi)
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: toCapitalizeFirst(pihakKesatu.instansi),
                              size: 20,
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: { size: 50, type: WidthType.PERCENTAGE },
                    }),

                    // --- KOLOM KANAN (UPN / PIHAK KEDUA) ---
                    new TableCell({
                      children: [
                        // HEADER: PIHAK KEDUA
                        new Paragraph({
                          children: [
                            new TextRun({ text: "PIHAK KEDUA", bold: true }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                        // SUB-HEADER: JABATAN UPN
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

                        // SPACER (Ruang Tanda Tangan)
                        new Paragraph({
                          text: "",
                          spacing: { before: 1500 },
                        }),

                        // NAMA PENANDATANGAN
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
                        // FOOTER: NIP
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
                      width: { size: 50, type: WidthType.PERCENTAGE },
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
