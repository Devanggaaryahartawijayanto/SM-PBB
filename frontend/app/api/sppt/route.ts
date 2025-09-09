import { type NextRequest, NextResponse } from "next/server"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import fs from "node:fs/promises"
import path from "node:path"

interface Field {
  label: string;
  param: string;
  suffix?: string;
  isCurrency?: boolean;
  isBold?: boolean;
}

interface Section {
  title: string;
  fields: Field[];
  startY: number;
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const p = (params: string, lpad: number = 0, isCur: boolean = false) => {
    return String(searchParams.get(params) || "").padStart(lpad)
  }
  const cur = (value: string) => value.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  const div = (a: string, b: string, lpad: number = 0): string => {
    const numerator = Number(a);
    const denominator = Number(b);
    if (denominator === 0) return "";
    return String(numerator / denominator).padStart(lpad);
  }
  const plus = (a: string, b: string, lpad: number = 0): string => {
    const num1 = Number(a);
    const num2 = Number(b);
    const sum = num1 + num2;
    return sum ? String(sum).padStart(lpad) : "";
  }

  const year = searchParams.get("year") || "2025"
  const nop = searchParams.get("nop") || "00.00.000.000.000.0000.0"
  
  // Load image file
  const imagePath = path.join(process.cwd(), "public", "sppt.jpg")
  const imageBytes = await fs.readFile(imagePath)

  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4 size
  const { width, height } = page.getSize()
  const font = await pdfDoc.embedFont(StandardFonts.Courier)
  const boldFont = await pdfDoc.embedFont(StandardFonts.CourierBold)

  // Embed image
  const image = await pdfDoc.embedJpg(imageBytes)
  // Calculate image dimensions to fit the page width while maintaining aspect ratio
  const targetWidth = width
  const scaleFactor = targetWidth / image.width
  const scaledWidth = image.width * scaleFactor
  const scaledHeight = image.height * scaleFactor

  // Draw image centered at the top
  page.drawImage(image, {
    x: (width - scaledWidth) / 2,
    y: height - scaledHeight - 10,
    width: scaledWidth,
    height: scaledHeight,
  })

  // Helper function to draw text
  const drawText = (text: string, y: number, options: { size?: number; font?: typeof font; color?: [number, number, number]; x?: number } = {}) => {
    const {
      size = 12,
      font: textFont = font,
      color = [0, 0, 0],
      x = 0,
    } = options

    page.drawText(text, {
      x,
      y: height - y,
      size,
      font: boldFont,
      color: rgb(...color),
    })
  }

  // Draw title
  const titleY = height - scaledHeight - 30
  drawText("SURAT PEMBERITAHUAN PAJAK TERHUTANG (SPPT)", height - titleY, { size: 10, font: boldFont, x: (width - font.widthOfTextAtSize("SURAT PEMBERITAHUAN PAJAK TERHUTANG (SPPT)", 10)) / 2 })
  drawText(`TAHUN PAJAK ${year}`, height - titleY + 20, { size: 10, font: boldFont, x: (width - font.widthOfTextAtSize(`TAHUN PAJAK ${year}`, 10)) / 2 })

  // Draw NOP
  const nopY = height - titleY + 40
  drawText("NOMOR OBJEK PAJAK:", height - nopY, { font: boldFont, x: 10 })
  drawText(nop, height - nopY, { x: 150 })
  drawText("Nomor SPPT:", height - nopY + 20, { font: boldFont, x: 10 })

  const _y = 0
  // OP
  drawText(year, 100 + _y, {x: 290})
  drawText(p("nop"), 100 + _y, {x: 50})
  drawText("BUMI", 230 + _y, {x: 30})
  drawText("BANGUNAN", 245 + _y, {x: 30})
  drawText(p("luas_bumi", 10), 230 + _y, {x: 120})
  drawText(p("luas_bng", 10), 245 + _y, {x: 120})
  drawText(div(p("njop_bumi"), p("luas_bumi"), 10), 230 + _y, {x: 330})
  drawText(div(p("njop_bng"), p("luas_bng"), 10), 245 + _y, {x: 330})
  drawText(p("njop_bumi", 12), 230 + _y, {x: 480})
  drawText(p("njop_bng", 12), 245 + _y, {x: 480})

  drawText(plus(p("njop_bumi"), p("njop_bng"), 12), 310 + _y, {x: 480})
  drawText(p("njoptkp", 12), 325 + _y, {x: 460})
  drawText(p("njop", 12), 360 + _y, {x: 480})

  // Draw sections
  const sections: Section[] = [
    {
      title: "DATA WAJIB PAJAK",
      fields: [
        { label: "Nama", param: "name" },
        { label: "Alamat", param: "jln_wp" },
        { label: "RT/RW", param: "rt_rw_wp" },
        { label: "Kelurahan", param: "kelurahan_wp" },
        { label: "Kota", param: "kota_wp" },
        { label: "Kode Pos", param: "kd_pos_wp" },
      ],
      startY: nopY + 20
    },
    {
      title: "LETAK OBJEK PAJAK",
      fields: [
        { label: "Alamat", param: "jln_op" },
        { label: "RT/RW", param: "rt_rw_op" },
        { label: "Kelurahan", param: "kelurahan_op" },
      ],
      startY: nopY + 120
    },
    {
      title: "PENILAIAN OBJEK PAJAK",
      fields: [
        { label: "Luas Bumi", param: "luas_bumi", suffix: "m²" },
        { label: "Luas Bangunan", param: "luas_bng", suffix: "m²" },
        { label: "NJOP Bumi", param: "njop_bumi", isCurrency: true },
        { label: "NJOP Bangunan", param: "njop_bng", isCurrency: true },
      ],
      startY: nopY + 220
    },
    {
      title: "PERHITUNGAN PAJAK",
      fields: [
        { label: "NJOP sebagai dasar pengenaan PBB", param: "njop_sppt", isCurrency: true },
        { label: "NJOPTKP (NJOP Tidak Kena Pajak)", param: "njoptkp", isCurrency: true },
        { label: "NJOP untuk perhitungan PBB", param: "njkp", isCurrency: true },
        { label: "PBB yang terhutang", param: "pbb_terhutang", isCurrency: true },
        { label: "PBB yang harus dibayar", param: "pbb_harus_dibayar", isCurrency: true, isBold: true },
      ],
      startY: nopY + 320
    },
    {
      title: "INFORMASI PEMBAYARAN",
      fields: [
        { label: "Tanggal Terbit", param: "tgl_terbit" },
        { label: "Tanggal Jatuh Tempo", param: "tgl_jatuh_tempo" },
        { label: "Status Pembayaran", param: "status_pembayaran" },
      ],
      startY: nopY + 460
    }
  ]

  // Draw each section
  sections.forEach(section => {
    drawText(section.title, section.startY, { font: boldFont, size: 10, x: 10 })
    
    section.fields.forEach((field, index) => {
      const y = section.startY + 20 + (index * 15)
      const value = searchParams.get(field.param) || "-"
      let displayValue = value

      if (field.isCurrency) {
        displayValue = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(parseInt(value))
      }

      if (field.suffix) {
        displayValue = `${value} ${field.suffix}`
      }

      drawText(`${field.label}:`, y, { size: 10, x: 10 })
      drawText(displayValue, y, { 
        x: 250,
        font: field.isBold ? boldFont : font,
        size: 10
      })
    })
  })

  const pdfBytes = await pdfDoc.save()

  return new NextResponse(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=sppt-${year}-${nop.replace(/\./g, "")}.pdf`,
    },
  })
}
