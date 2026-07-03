/* ==========================================================================
   DIGITAL FAREWELL MEMORY - JAVASCRIPT LOGIC
   Handles dynamic data retrieval, page animations, and UI states.
   ========================================================================== */

// --- KONFIGURASI ---
// Isi API_URL dengan URL Google Apps Script Web App setelah di-deploy.
// Lihat SETUP_GUIDE.md untuk panduan lengkap step-by-step.
const API_URL = "https://script.google.com/macros/s/AKfycbzeMLNYNpTs5apPdqDjHBuXW2F2gGRF0Kqeb8m1kAb2pQhgXadwhM0uNEhprn52MkM/exec";


// URL Google Form opsional (sebagai alternatif write.html)
// Biarkan kosong jika pakai write.html
const GOOGLE_FORM_URL = "";

// --- MOCK DATA FALLBACK ---
// Data ini otomatis digunakan jika API_URL kosong atau gagal mengambil data dari Google Sheets
const MOCK_MESSAGES = [
  {
    nama: "Andi Wijaya (Tech Lead)",
    pesan: "Terima kasih banyak atas kontribusi dan dedikasimu selama ini! Bekerja bersamamu adalah salah satu momen terbaik. Sukses selalu di tempat kerja yang baru, semoga karirmu melesat tinggi!"
  },
  {
    nama: "Siti Rahma (Product Manager)",
    pesan: "Selamat atas petualangan barumu! Terima kasih telah sabar mendengarkan masukan dan selalu memberikan hasil terbaik. Kantor pasti terasa sepi tanpamu. Jaga komunikasi ya!"
  },
  {
    nama: "Budi Santoso (Designer)",
    pesan: "Terima kasih untuk semua tawa, diskusi seru, dan kerjasama kreatif kita. Semoga tempat baru memberikan kebahagiaan dan tantangan seru yang kamu impikan. Sukses kawan!"
  },
  {
    nama: "Dewi Lestari (HR Team)",
    pesan: "Perpisahan bukanlah akhir dari sebuah persahabatan. Semoga di tempat yang baru kamu semakin sukses, dikelilingi oleh rekan-rekan yang menyenangkan, dan mencapai semua target hidupmu!"
  },
  {
    nama: "Rian Hidayat (Marketing)",
    pesan: "All the best untuk langkah barumu! Terima kasih atas bantuan luar biasa selama ini. Jangan lupa untuk tetap mampir sesekali ke sini ya. Sukses selalu!"
  }
];

// --- APP STATE ---
let messages = [];
let currentLetterIndex = 0;
let isAnimating = false;

// --- DOM ELEMENTS ---
const recipientNameEl = document.getElementById("recipient-name");
const screenLanding = document.getElementById("screen-landing");
const screenReader = document.getElementById("screen-reader");
const screenClosing = document.getElementById("screen-closing");
const btnOpenLetter = document.getElementById("btn-open-letter");
const envelopeWrapper = document.querySelector(".envelope-wrapper");
const letterContainer = document.getElementById("letter-container");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const progressLabel = document.getElementById("progress-label");
const progressTextMini = document.getElementById("progress-text-mini");
const progressRingIndicator = document.getElementById("progress-ring-indicator");
const btnRestart = document.getElementById("btn-restart");
const linkForm = document.getElementById("link-form");

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  setupRecipientName();
  setupGoogleFormLink();
  loadData();
  setupEventListeners();
});

// 1. Setup Recipient Name from URL parameter (?to=...)
function setupRecipientName() {
  const urlParams = new URLSearchParams(window.location.search);
  const toParam = urlParams.get("to") || urlParams.get("name") || urlParams.get("recipient");

  if (toParam) {
    const formattedName = decodeURIComponent(toParam).trim();
    recipientNameEl.textContent = formattedName;
    document.title = `Digital Farewell Memory - ${formattedName}`;
  } else {
    recipientNameEl.textContent = "Ana Witantri";
  }
}

// 2. Setup Google Form Link
function setupGoogleFormLink() {
  if (linkForm) {
    linkForm.href = GOOGLE_FORM_URL || "#";
  }
}

// 3. Fetch Data from Apps Script or Fallback to Mock
async function loadData() {
  if (!API_URL) {
    console.log("API_URL kosong. Menggunakan data simulasi.");
    messages = MOCK_MESSAGES;
    return;
  }

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      messages = data;
      console.log(`Berhasil memuat ${data.length} pesan dari Google Sheets.`);
    } else {
      console.warn("API mengembalikan data kosong. Menggunakan data simulasi.");
      messages = MOCK_MESSAGES;
    }
  } catch (error) {
    console.error("Gagal mengambil data dari Google Sheets API:", error);
    console.log("Menggunakan data simulasi sebagai cadangan.");
    messages = MOCK_MESSAGES;
  }
}

// 4. Setup Event Listeners
function setupEventListeners() {
  // Landing: Open Letter Button
  btnOpenLetter.addEventListener("click", () => {
    envelopeWrapper.classList.add("open");

    // Tunggu animasi amplop terbuka selesai sebelum pindah screen (800ms)
    setTimeout(() => {
      switchScreen(screenLanding, screenReader);
      renderLetter(currentLetterIndex, "none");
    }, 850);
  });

  // Navigation: Next
  btnNext.addEventListener("click", () => {
    if (isAnimating) return;

    if (currentLetterIndex < messages.length - 1) {
      navigateLetters(currentLetterIndex + 1, "next");
    } else {
      // Jika surat terakhir selesai dibaca, pindah ke halaman penutup
      switchScreen(screenReader, screenClosing);
    }
  });

  // Navigation: Prev
  btnPrev.addEventListener("click", () => {
    if (isAnimating) return;

    if (currentLetterIndex > 0) {
      navigateLetters(currentLetterIndex - 1, "prev");
    }
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (screenReader.classList.contains("active")) {
      if (e.key === "ArrowRight") {
        btnNext.click();
      } else if (e.key === "ArrowLeft") {
        btnPrev.click();
      }
    }
  });

  // Restart Button on Closing Screen
  btnRestart.addEventListener("click", () => {
    currentLetterIndex = 0;
    envelopeWrapper.classList.remove("open");
    switchScreen(screenClosing, screenLanding);
  });
}

// 5. Switch Screens smoothly
function switchScreen(fromScreen, toScreen) {
  fromScreen.classList.add("fade-out");

  setTimeout(() => {
    fromScreen.classList.remove("active", "fade-out");
    toScreen.classList.add("active", "fade-in");

    setTimeout(() => {
      toScreen.classList.remove("fade-in");
    }, 400);
  }, 400);
}

// 6. Generate Letter Card Element
function createLetterPaperElement(messageObj) {
  const paper = document.createElement("div");
  paper.className = "letter-paper";

  paper.innerHTML = `
    <div class="paper-lines"></div>
    <div class="letter-content-inner">
      <p class="letter-message">${escapeHTML(messageObj.pesan)}</p>
      <div class="letter-signature">
        — <span class="letter-sender">${escapeHTML(messageObj.nama)}</span>
      </div>
    </div>
  `;

  return paper;
}

// 7. Navigation Animation Engine (Tactile Stack Slide Effect)
function navigateLetters(newIndex, direction) {
  isAnimating = true;
  const currentPaper = letterContainer.querySelector(".letter-paper");
  const nextMessage = messages[newIndex];
  const nextPaper = createLetterPaperElement(nextMessage);

  // Append new paper to the container
  letterContainer.appendChild(nextPaper);

  if (direction === "next") {
    // Current paper slides away to left
    currentPaper.classList.add("slide-out-left");
    // New paper slides in from right
    nextPaper.classList.add("slide-in-right");
  } else if (direction === "prev") {
    // Current paper slides away to right
    currentPaper.classList.add("slide-out-right");
    // New paper slides in from left
    nextPaper.classList.add("slide-in-left");
  }

  // Update states immediately for styling
  currentLetterIndex = newIndex;
  updatePaginationUI();

  // Clean up DOM after animation finishes
  setTimeout(() => {
    currentPaper.remove();
    nextPaper.classList.remove("slide-in-right", "slide-in-left");
    isAnimating = false;
  }, 450); // Matches CSS keyframe duration (450ms)
}

// 8. Render Letter initially (without slide animations)
function renderLetter(index, animType) {
  letterContainer.innerHTML = "";
  if (messages.length === 0) return;

  const paper = createLetterPaperElement(messages[index]);
  letterContainer.appendChild(paper);

  updatePaginationUI();
}

// 9. Update navigation text & dynamic progress bar
function updatePaginationUI() {
  const total = messages.length;
  const current = currentLetterIndex + 1;

  // Update text labels
  progressLabel.textContent = `Surat ${current} dari ${total}`;
  progressTextMini.textContent = `${current}/${total}`;

  // Update Prev button disabled state
  btnPrev.disabled = currentLetterIndex === 0;

  // Customize Next button label on last letter
  if (currentLetterIndex === total - 1) {
    btnNext.innerHTML = `<span>Selesai</span> <i class="fa-solid fa-check"></i>`;
  } else {
    btnNext.innerHTML = `<span>Selanjutnya</span> <i class="fa-solid fa-arrow-right"></i>`;
  }

  // Update Circular Progress Ring
  // Circumference: 2 * PI * r = 2 * 3.14159 * 18 = 113.1
  const radius = 18;
  const circumference = 2 * Math.PI * radius;

  progressRingIndicator.style.strokeDasharray = `${circumference} ${circumference}`;

  const percentage = (current / total) * 100;
  const offset = circumference - (percentage / 100) * circumference;
  progressRingIndicator.style.strokeDashoffset = offset;
}

// --- UTILITY FUNCTIONS ---
// Prevent XSS Injection from Google Sheets
function escapeHTML(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
