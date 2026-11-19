/**
 * Tech Mathura — website enquiries → Google Sheets
 * -----------------------------------------------------
 * Paste this whole file into Extensions ▸ Apps Script of your Google Sheet,
 * then Deploy ▸ New deployment ▸ Web app (Execute as: Me, Who has access: Anyone).
 * Copy the Web app URL into FORM_ENDPOINT at the top of script.js.
 * Full steps are in README.txt.
 */

const SHEET_NAME   = 'Enquiries';                  // tab name (created automatically)
const NOTIFY_EMAIL = 'mathurauniverse@gmail.com';  // gets an email for every enquiry; set to '' to turn off

const HEADERS = ['Submitted at', 'Form', 'Project', 'Budget', 'Name', 'Phone', 'Email',
                 'Company', 'Message', 'Consent', 'Page', 'Page URL'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);                            // avoid two enquiries writing the same row
  try {
    const p = (e && e.parameter) || {};
    if (p.website) return reply_({ ok: true });     // spam bot filled the hidden field: ignore

    const sheet = getSheet_();
    const row = [
      p.submittedAt || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      p.form, p.project, p.budget, p.name, p.phone, p.email, p.company, p.message, p.consent, p.page, p.pageUrl
    ].map(clean_);
    sheet.appendRow(row);

    if (NOTIFY_EMAIL) {
      const body = HEADERS.map((h, i) => h + ': ' + (row[i] || '-')).join('\n');
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: 'New enquiry: ' + (p.project || 'Website') + ' · ' + (p.name || 'Unknown'),
        body: body + '\n\nOpen the sheet: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
        replyTo: p.email || NOTIFY_EMAIL
      });
    }
    return reply_({ ok: true });
  } catch (err) {
    return reply_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Visiting the URL in a browser shows this — handy to check the deployment works.
function doGet() {
  return ContentService.createTextOutput('Tech Mathura enquiry endpoint is running.');
}

// Run once from the editor (▶ Run) to create the sheet and check permissions.
function setup() {
  getSheet_();
  Logger.log('Sheet ready: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl());
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#1E3A8A').setFontColor('#EEF2FC');
    sheet.setFrozenRows(1);
    sheet.setColumnWidths(1, HEADERS.length, 160);
    sheet.setColumnWidth(9, 360);
  }
  return sheet;
}

// Keep text as text (phone numbers keep their digits) and block spreadsheet-formula injection.
function clean_(v) {
  v = (v === undefined || v === null) ? '' : String(v).trim().slice(0, 2000);
  return /^[=+\-@]/.test(v) || /^\d{6,}$/.test(v) ? "'" + v : v;
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
