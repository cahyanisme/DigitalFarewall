// ============================================================
//  DIGITAL FAREWELL MEMORY — Google Apps Script Backend
//  
//  CARA PAKAI:
//  1. Buka https://script.google.com
//  2. Buat project baru → paste kode ini
//  3. Ubah SHEET_NAME jika perlu
//  4. Klik "Deploy" → "New deployment" → pilih "Web App"
//  5. Setting: Execute as = "Me", Who has access = "Anyone"
//  6. Klik "Deploy", copy URL-nya
//  7. Paste URL tersebut ke:
//     - write.html  → const API_URL = "URL_DISINI";
//     - app.js      → const API_URL = "URL_DISINI";
// ============================================================

// Nama sheet di Google Spreadsheet kamu
const SHEET_NAME = "Pesan";

// ── GET: Ambil semua pesan (untuk index.html) ──────────────
function doGet(e) {
  try {
    const sheet = SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(SHEET_NAME);

    const data = sheet.getDataRange().getValues();

    // Baris pertama = header, skip dan baca dari baris ke-2
    const rows = data.slice(1)
      .filter(row => row[1] && row[2]) // pastikan nama & pesan tidak kosong
      .map(row => ({
        timestamp: row[0] ? new Date(row[0]).toISOString() : "",
        nama:  String(row[1]).trim(),
        pesan: String(row[2]).trim(),
      }));

    return ContentService
      .createTextOutput(JSON.stringify(rows))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── POST: Simpan pesan baru (dari write.html) ──────────────
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const nama  = String(body.nama  || "").trim();
    const pesan = String(body.pesan || "").trim();

    if (!nama || !pesan) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: "Nama dan pesan tidak boleh kosong." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(SHEET_NAME);

    // Tambah baris baru: [timestamp, nama, pesan]
    sheet.appendRow([new Date(), nama, pesan]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
