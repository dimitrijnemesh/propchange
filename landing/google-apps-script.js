// PropChange waitlist + feedback → Google Sheets
// Paste this into Extensions → Apps Script of your Google Sheet (see README).
const SECRET = "change-me-to-a-long-random-string"; // same value as WAITLIST_SECRET

const SHEETS = {
  waitlist: {
    name: "Waitlist",
    header: ["Date", "Email", "Role", "Language", "X", "Phone", "Form", "Referrer"],
    row: (d) => [new Date(), d.email, d.role, d.lang, d.x, d.phone, d.source, d.referrer],
    dedupeColumn: 2, // Email
  },
  feedback: {
    name: "Feedback",
    header: ["Date", "Rating (1-5)", "Liked", "Improve", "Email", "Language", "Referrer"],
    row: (d) => [new Date(), d.rating, d.liked, d.improve, d.email, d.lang, d.referrer],
    dedupeColumn: 0,
  },
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents || "{}");
    if (data.secret !== SECRET) return json({ ok: false, error: "auth" });

    const cfg = SHEETS[data.type] || SHEETS.waitlist;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(cfg.name);
    if (!sheet) {
      sheet = ss.insertSheet(cfg.name);
      sheet.appendRow(cfg.header);
      sheet.setFrozenRows(1);
    }

    if (cfg.dedupeColumn) {
      const value = String(data.email || "").toLowerCase().trim();
      if (!value) return json({ ok: false, error: "email" });
      const last = sheet.getLastRow();
      if (last > 1) {
        const existing = sheet.getRange(2, cfg.dedupeColumn, last - 1, 1).getValues().flat().map(String);
        if (existing.indexOf(value) !== -1) return json({ ok: true, duplicate: true });
      }
    }

    sheet.appendRow(cfg.row(data).map((v) => (v === undefined || v === null ? "" : v)));
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
