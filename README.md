# Digital Farewell Memory

Sebuah website kenangan digital modern, minimalis, dan responsif untuk kado perpisahan rekan kerja. Dibuat menggunakan HTML5, CSS3, dan Vanilla JavaScript dengan fokus pada optimasi tampilan mobile (diakses via QR Code). Data pesan diambil secara dinamis dari **Google Sheets** menggunakan **Google Apps Script** sebagai REST API.

---

## 🛠️ Panduan Integrasi Google Sheets & Google Form

Ikuti langkah-langkah di bawah ini untuk menghubungkan website dengan data ucapan dari rekan-rekan kerja secara real-time.

### Langkah 1: Buat Google Form
1. Buat Google Form baru.
2. Tambahkan **dua pertanyaan** wajib:
   - Pertanyaan 1: **Nama** (Tipe: Jawaban Singkat / Short Text)
   - Pertanyaan 2: **Pesan** (Tipe: Paragraf / Paragraph)
3. Di tab **Jawaban (Responses)**, hubungkan formulir tersebut ke **Google Sheets** baru.

### Langkah 2: Pasang Google Apps Script
1. Buka spreadsheet Google Sheets yang terhubung dengan form tersebut.
2. Pada menu atas, pilih **Ekstensi (Extensions)** > **Apps Script**.
3. Hapus kode bawaan yang ada di editor, lalu salin dan tempel kode berikut:

```javascript
function doGet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  }
  
  var headers = data[0];
  var jsonData = [];
  
  // Cari indeks kolom berdasarkan nama kolom (case-insensitive)
  var namaIdx = -1;
  var pesanIdx = -1;
  
  for (var i = 0; i < headers.length; i++) {
    var headerStr = headers[i].toString().toLowerCase().trim();
    if (headerStr === 'nama' || headerStr === 'nama pengirim') {
      namaIdx = i;
    } else if (headerStr === 'pesan' || headerStr === 'ucapan') {
      pesanIdx = i;
    }
  }
  
  // Jika tidak ditemukan, default ke kolom ke-2 (Nama) dan kolom ke-3 (Pesan)
  // Catatan: Google Form biasanya menyimpan: [Timestamp, Nama, Pesan]
  if (namaIdx === -1) namaIdx = 1;
  if (pesanIdx === -1) pesanIdx = 2;
  
  for (var rowIdx = 1; rowIdx < data.length; rowIdx++) {
    var row = data[rowIdx];
    var namaVal = row[namaIdx];
    var pesanVal = row[pesanIdx];
    
    // Masukkan hanya jika kolom pesan tidak kosong
    if (pesanVal && pesanVal.toString().trim() !== "") {
      jsonData.push({
        nama: namaVal ? namaVal.toString().trim() : "Anonim",
        pesan: pesanVal.toString().trim()
      });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(jsonData))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*');
}
```

### Langkah 3: Deploy sebagai Web App
1. Klik tombol **Terapkan (Deploy)** di bagian kanan atas editor Apps Script > Pilih **Penerapan Baru (New deployment)**.
2. Klik ikon gerigi (Pilih jenis) > Pilih **Aplikasi Web (Web app)**.
3. Konfigurasikan:
   - **Deskripsi**: `API Ucapan Perpisahan`
   - **Jalankan sebagai (Execute as)**: `Saya (Me - email anda)`
   - **Siapa yang memiliki akses (Who has access)**: `Siapa saja (Anyone)`
4. Klik **Terapkan (Deploy)**.
5. Salin **URL Aplikasi Web (Web App URL)** yang dihasilkan. URL ini akan terlihat seperti:
   `https://script.google.com/macros/s/XXXXXX/exec`

### Langkah 4: Hubungkan ke Website
1. Buka file [app.js](file:///C:/Users/user/.gemini/antigravity/scratch/digital-farewell-memory/app.js) di folder proyek.
2. Cari variabel `API_URL` di bagian atas file.
3. Ganti nilainya dengan URL Aplikasi Web yang Anda salin pada Langkah 3.
   ```javascript
   const API_URL = "https://script.google.com/macros/s/XXXXXX/exec";
   ```
4. Simpan perubahan.

---

## 🎨 Struktur Proyek
- [index.html](file:///C:/Users/user/.gemini/antigravity/scratch/digital-farewell-memory/index.html) - Kerangka halaman web (Landing Page, Letter Reader, Closing Screen).
- [styles.css](file:///C:/Users/user/.gemini/antigravity/scratch/digital-farewell-memory/styles.css) - Desain modern, warna krem hangat, efek flip kertas, responsif mobile.
- [app.js](file:///C:/Users/user/.gemini/antigravity/scratch/digital-farewell-memory/app.js) - Logika aplikasi, dynamic fetching, visual state transitions.
