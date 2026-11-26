// Helper terpisah agar mudah diuji (unit test).
// Membersihkan teks sebelum dikirim ke TTS Deepgram (model Fitri belum punya normalisasi angka).

const ONES = [
  "nol",
  "satu",
  "dua",
  "tiga",
  "empat",
  "lima",
  "enam",
  "tujuh",
  "delapan",
  "sembilan",
];

function twoDigitWords(n) {
  if (n < 10) return ONES[n];
  if (n === 10) return "sepuluh";
  if (n === 11) return "sebelas";
  if (n < 20) return `${ONES[n - 10]} belas`;
  const tens = Math.floor(n / 10);
  const rem = n % 10;
  const tensWord =
    tens === 2
      ? "dua puluh"
      : tens === 3
        ? "tiga puluh"
        : tens === 4
          ? "empat puluh"
          : tens === 5
            ? "lima puluh"
            : tens === 6
              ? "enam puluh"
              : tens === 7
                ? "tujuh puluh"
                : tens === 8
                  ? "delapan puluh"
                  : "sembilan puluh";
  return rem === 0 ? tensWord : `${tensWord} ${ONES[rem]}`;
}

export function numberToWords(num) {
  const n = Number(String(num).replace(/\s/g, ""));
  if (!Number.isFinite(n)) return String(num);
  if (n < 0) return `minus ${numberToWords(Math.abs(n))}`;

  const intPart = Math.trunc(n);
  const fracPart = Math.round((Math.abs(n) - intPart) * 100);

  let words = "";
  if (intPart === 0) {
    words = "nol";
  } else {
    const chunks = [];
    let remaining = intPart;
    const scales = ["", "ribu", "juta", "miliar", "triliun"];
    let scaleIdx = 0;
    while (remaining > 0 && scaleIdx < scales.length) {
      const chunk = remaining % 1000;
      if (chunk !== 0) {
        let chunkWords = "";
        const hundreds = Math.floor(chunk / 100);
        const rest = chunk % 100;
        if (hundreds > 0) {
          chunkWords +=
            hundreds === 1 ? "seratus" : `${ONES[hundreds]} ratus`;
        }
        if (rest > 0) {
          if (chunkWords) chunkWords += " ";
          chunkWords += twoDigitWords(rest);
        }
        if (scaleIdx > 0) {
          if (chunk === 1 && scaleIdx === 1) {
            chunkWords = "seribu";
          } else {
            chunkWords += ` ${scales[scaleIdx]}`;
          }
        }
        chunks.unshift(chunkWords.trim());
      }
      remaining = Math.floor(remaining / 1000);
      scaleIdx++;
    }
    words = chunks.join(" ").trim();
  }

  if (fracPart > 0) {
    words += ` koma ${numberToWords(fracPart)}`.replace("nol ", "");
  }
  return words.trim();
}

function digitWord(d) {
  return ONES[Number(d)] || d;
}

export function normalizeForIndonesianTTS(text) {
  if (text == null) return "";
  let s = String(text);

  // Hapus markdown: **, #, *, _, bullet
  s = s.replace(/\*\*/g, "");
  s = s.replace(/#{1,6}/g, "");
  s = s.replace(/[*_`~]/g, " ");
  s = s.replace(/^\s*[-•*]\s+/gm, "");
  s = s.replace(/•/g, " ");

  // Hapus emoji
  s = s.replace(
    /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu,
    " ",
  );

  // Normalisasi jam: 08.00 / 08:00 -> pukul delapan
  s = s.replace(/\b(\d{1,2})[.:](\d{2})(?:[.:](\d{2}))?\b/g, (_, h, m) => {
    const hour = Number(h);
    const minute = Number(m);
    let res = `pukul ${numberToWords(hour)}`;
    if (minute > 0) res += ` ${numberToWords(minute)}`;
    return res;
  });

  // Normalisasi nomor telepon: urutan digit (>=7) dibaca per digit
  s = s.replace(/(?:\+?\d[\d\s().-]{5,}\d)/g, (match) => {
    const digits = match.replace(/\D/g, "");
    if (digits.length < 7) return match;
    return digits.split("").map(digitWord).join(" ");
  });

  // Normalisasi angka biasa (integer) -> kata
  s = s.replace(/\b\d+(?:[.,]\d+)?\b/g, (match) => {
    // jangan konversi yang sudah menjadi kata (tidak ada digit tersisa)
    if (!/\d/.test(match)) return match;
    const normalized = match.replace(/\./g, "").replace(/,/g, ".");
    // jika ada pemisah ribuan (mis. 1.000) numberToWords handle
    return numberToWords(normalized);
  });

  // Rapikan spasi
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

export default normalizeForIndonesianTTS;