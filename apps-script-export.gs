/**
 * Google Apps Script - Web App for the Taekwondo PTIT management page.
 *
 * Supports two actions via POST:
 *   1. action: "export" (default) - Overwrites the first sheet with member data.
 *      Body: { headers: string[], rows: string[][] }
 *   2. action: "attendance" - Appends one row to the "diemdanh" tab.
 *      Body: { date, timestamp, maHV, hoTen, ngaySinh, capDai, ghiChu }
 *
 * HOW TO DEPLOY:
 *   1. Open the destination Google Sheet:
 *      https://docs.google.com/spreadsheets/d/1v85Al1tqyt7D6u11U5Ede6UeBG8oV9dU2-1Vht3eglE
 *   2. Go to: Extensions > Apps Script
 *   3. Delete any existing code and paste this entire file.
 *   4. Click "Deploy" > "New deployment"
 *   5. Click the gear icon next to "Select type" > choose "Web app"
 *   6. Configure:
 *        - Description: "Taekwondo PTIT management"
 *        - Execute as: "Me" (your account)
 *        - Who has access: "Anyone"  <-- IMPORTANT, must be "Anyone" not "Anyone with Google account"
 *   7. Click "Deploy" > authorize when prompted.
 *   8. Copy the "Web app URL" (ends with /exec).
 *   9. Paste that URL into EXPORT_SCRIPT_URL in quanli.html.
 *
 * NOTE: After updating this script, you must create a NEW deployment version
 *       (Deploy > Manage deployments > Edit > Version: New version) for changes
 *       to take effect. The /exec URL stays the same.
 */

// ===== Config =====
const DESTINATION_SHEET_ID = '1v85Al1tqyt7D6u11U5Ede6UeBG8oV9dU2-1Vht3eglE';
const HEADER_BG_COLOR = '#33b5e5';
const HEADER_TEXT_COLOR = '#ffffff';
const BATCH_SIZE = 500;
const ATTENDANCE_TAB_NAME = 'diemdanh';
const ATTENDANCE_TAB_GID = 1395531960; // fallback if name lookup fails
const ATTENDANCE_HEADERS = ['NGAY', 'TIMESTAMP', 'MA_HV', 'HO_TEN', 'NGAY_SINH', 'CAP_DAI', 'GHI_CHU'];
const FUND_TAB_NAME = 'dongquy';
const FUND_TAB_GID = 803125790; // fallback if name lookup fails
const FUND_HEADERS = ['NGAY', 'TIMESTAMP', 'MA_HV', 'HO_TEN', 'NGAY_SINH', 'CAP_DAI', 'GHI_CHU'];

/**
 * Handle POST requests from the frontend.
 * Routes to handleExport() or handleAttendance() based on data.action.
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('No POST body received');
    }

    const data = JSON.parse(e.postData.contents);
    const action = data.action || 'export';

    if (action === 'attendance') {
      return handleAttendance(data);
    } else if (action === 'attendanceMultiple') {
      return handleAttendanceMultiple(data);
    } else if (action === 'closeFund') {
      return handleCloseFund(data);
    } else if (action === 'closeFundMultiple') {
      return handleCloseFundMultiple(data);
    } else {
      return handleExport(data);
    }
  } catch (err) {
    console.error('doPost error:', err);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: err.message || String(err)
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests (for testing the endpoint in a browser).
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Taekwondo PTIT endpoint is live. POST JSON to use.',
      actions: ['export', 'attendance', 'attendanceMultiple', 'closeFund', 'closeFundMultiple'],
      destinationSheetId: DESTINATION_SHEET_ID,
      attendanceTab: ATTENDANCE_TAB_NAME,
      fundTab: FUND_TAB_NAME
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ACTION: export
 * Overwrites the first sheet with the provided headers + rows.
 */
function handleExport(data) {
  const headers = data.headers;
  const rows = data.rows;

  if (!Array.isArray(headers) || headers.length === 0) {
    throw new Error('Invalid or missing "headers" array');
  }
  if (!Array.isArray(rows)) {
    throw new Error('Invalid or missing "rows" array');
  }

  const ss = SpreadsheetApp.openById(DESTINATION_SHEET_ID);
  const sheet = ss.getSheets()[0]; // first sheet

  // Clear all existing content
  sheet.clear();

  // Write header row
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange
    .setFontWeight('bold')
    .setBackground(HEADER_BG_COLOR)
    .setFontColor(HEADER_TEXT_COLOR)
    .setHorizontalAlignment('center');

  // Freeze header row
  sheet.setFrozenRows(1);

  // Write data rows in batches
  if (rows.length > 0) {
    let currentRow = 2;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const normalized = batch.map(r => {
        if (r.length < headers.length) {
          return r.concat(Array(headers.length - r.length).fill(''));
        } else if (r.length > headers.length) {
          return r.slice(0, headers.length);
        }
        return r;
      });
      sheet.getRange(currentRow, 1, normalized.length, headers.length)
        .setValues(normalized);
      currentRow += normalized.length;
    }
  }

  // Auto-resize columns (best-effort)
  try {
    sheet.autoResizeColumns(1, Math.min(headers.length, 20));
  } catch (autoResizeErr) {
    console.warn('autoResizeColumns failed:', autoResizeErr);
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      action: 'export',
      count: rows.length,
      sheetName: sheet.getName()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ACTION: attendance
 * Appends one row to the "diemdanh" tab. Creates the tab + header if missing.
 */
function handleAttendance(data) {
  const ss = SpreadsheetApp.openById(DESTINATION_SHEET_ID);

  // Find the diemdanh tab by name first, then by gid, then fallback to 2nd sheet
  let sheet = ss.getSheetByName(ATTENDANCE_TAB_NAME);
  if (!sheet) {
    const sheets = ss.getSheets();
    sheet = sheets.find(s => s.getSheetId() === ATTENDANCE_TAB_GID);
  }
  if (!sheet && ss.getSheets().length > 1) {
    sheet = ss.getSheets()[1]; // fallback to 2nd sheet
  }
  if (!sheet) {
    sheet = ss.insertSheet(ATTENDANCE_TAB_NAME);
  }

  // Write header if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, ATTENDANCE_HEADERS.length).setValues([ATTENDANCE_HEADERS]);
    const headerRange = sheet.getRange(1, 1, 1, ATTENDANCE_HEADERS.length);
    headerRange
      .setFontWeight('bold')
      .setBackground(HEADER_BG_COLOR)
      .setFontColor(HEADER_TEXT_COLOR)
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  }

  // Build attendance row
  const now = new Date();
  const ngay = data.date || Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  const maHV = (data.maHV || '').trim();
  const hoTen = (data.hoTen || '').trim();

  // Duplicate check: same NGAY + same person (by MA_HV if available, else by HO_TEN)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1 && (maHV || hoTen)) {
    const existing = sheet.getRange(2, 1, lastRow - 1, ATTENDANCE_HEADERS.length).getValues();
    const dup = existing.find(r => {
      if (String(r[0]).trim() !== ngay) return false;
      // Prefer MA_HV match if both sides have it
      if (maHV && String(r[2]).trim()) {
        return String(r[2]).trim() === maHV;
      }
      // Fallback to HO_TEN match
      return String(r[3]).trim() === hoTen;
    });
    if (dup) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          duplicate: true,
          error: `${hoTen || maHV} đã được điểm danh ngày ${ngay} rồi.`
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  const row = [
    ngay,
    data.timestamp || now.toISOString(),
    maHV,
    hoTen,
    data.ngaySinh || '',
    data.capDai || '',
    data.ghiChu || ''
  ];

  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      action: 'attendance',
      sheetName: sheet.getName(),
      rowNumber: sheet.getLastRow()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ACTION: attendanceMultiple
 * Appends multiple rows to the "diemdanh" tab for a specific member.
 * Each date is checked individually for duplicates.
 * Body: { maHV, hoTen, ngaySinh, capDai, dates: [{date, timestamp}, ...] }
 * Returns: { success, written: [dates], duplicates: [dates], writtenCount, duplicateCount }
 */
function handleAttendanceMultiple(data) {
  const ss = SpreadsheetApp.openById(DESTINATION_SHEET_ID);

  // Find the diemdanh tab
  let sheet = ss.getSheetByName(ATTENDANCE_TAB_NAME);
  if (!sheet) {
    const sheets = ss.getSheets();
    sheet = sheets.find(s => s.getSheetId() === ATTENDANCE_TAB_GID);
  }
  if (!sheet && ss.getSheets().length > 1) {
    sheet = ss.getSheets()[1];
  }
  if (!sheet) {
    sheet = ss.insertSheet(ATTENDANCE_TAB_NAME);
  }

  // Write header if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, ATTENDANCE_HEADERS.length).setValues([ATTENDANCE_HEADERS]);
    const headerRange = sheet.getRange(1, 1, 1, ATTENDANCE_HEADERS.length);
    headerRange
      .setFontWeight('bold')
      .setBackground(HEADER_BG_COLOR)
      .setFontColor(HEADER_TEXT_COLOR)
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  }

  const dates = Array.isArray(data.dates) ? data.dates : [];
  const maHV = (data.maHV || '').trim();
  const hoTen = (data.hoTen || '').trim();
  const ngaySinh = data.ngaySinh || '';
  const capDai = data.capDai || '';

  // Load existing data once for duplicate checking
  const lastRow = sheet.getLastRow();
  let existing = [];
  if (lastRow > 1) {
    existing = sheet.getRange(2, 1, lastRow - 1, ATTENDANCE_HEADERS.length).getValues();
  }

  const written = [];
  const duplicates = [];

  dates.forEach(d => {
    const ngay = (d && d.date) ? String(d.date).trim() : '';
    if (!ngay) return;

    // Check duplicate against existing rows
    const dup = existing.find(r => {
      if (String(r[0]).trim() !== ngay) return false;
      if (maHV && String(r[2]).trim()) {
        return String(r[2]).trim() === maHV;
      }
      return String(r[3]).trim() === hoTen;
    });

    if (dup) {
      duplicates.push(ngay);
      return;
    }

    // Write new row
    const row = [
      ngay,
      d.timestamp || new Date().toISOString(),
      maHV,
      hoTen,
      ngaySinh,
      capDai,
      ''
    ];
    sheet.appendRow(row);

    // Add to existing to prevent duplicates within the same batch
    existing.push(row);
    written.push(ngay);
  });

  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      action: 'attendanceMultiple',
      written: written,
      duplicates: duplicates,
      writtenCount: written.length,
      duplicateCount: duplicates.length,
      sheetName: sheet.getName()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ACTION: closeFundMultiple
 * Appends multiple rows to the "dongquy" tab for a specific member.
 * Each month is checked individually for duplicates.
 * Body: { maHV, hoTen, ngaySinh, capDai, months: [{thang, date, timestamp}, ...] }
 * Returns: { success, written: [thang], duplicates: [thang], writtenCount, duplicateCount }
 */
function handleCloseFundMultiple(data) {
  const ss = SpreadsheetApp.openById(DESTINATION_SHEET_ID);

  // Find the dongquy tab
  let sheet = ss.getSheetByName(FUND_TAB_NAME);
  if (!sheet) {
    const sheets = ss.getSheets();
    sheet = sheets.find(s => s.getSheetId() === FUND_TAB_GID);
  }
  if (!sheet && ss.getSheets().length > 2) {
    sheet = ss.getSheets()[2];
  }
  if (!sheet) {
    sheet = ss.insertSheet(FUND_TAB_NAME);
  }

  // Write header if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, FUND_HEADERS.length).setValues([FUND_HEADERS]);
    const headerRange = sheet.getRange(1, 1, 1, FUND_HEADERS.length);
    headerRange
      .setFontWeight('bold')
      .setBackground(HEADER_BG_COLOR)
      .setFontColor(HEADER_TEXT_COLOR)
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  }

  const months = Array.isArray(data.months) ? data.months : [];
  const maHV = (data.maHV || '').trim();
  const hoTen = (data.hoTen || '').trim();
  const ngaySinh = data.ngaySinh || '';
  const capDai = data.capDai || '';

  // Load existing data once for duplicate checking
  const lastRow = sheet.getLastRow();
  let existing = [];
  if (lastRow > 1) {
    existing = sheet.getRange(2, 1, lastRow - 1, FUND_HEADERS.length).getValues();
  }

  const written = [];
  const duplicates = [];

  months.forEach(m => {
    const thang = (m && m.thang) ? String(m.thang).trim() : '';
    if (!thang) return;

    // Check duplicate: same THANG + same person
    const dup = existing.find(r => {
      const rowNgay = String(r[0]).trim();
      const rowThang = rowNgay.length >= 10 ? rowNgay.substring(3, 10) : '';
      if (rowThang !== thang) return false;
      if (maHV && String(r[2]).trim()) {
        return String(r[2]).trim() === maHV;
      }
      return String(r[3]).trim() === hoTen;
    });

    if (dup) {
      duplicates.push(thang);
      return;
    }

    // Write new row. NGAY = first day of that month (dd/MM/yyyy)
    const ngay = m.date || (thang.length === 7 ? '01/' + thang : thang);
    const row = [
      ngay,
      m.timestamp || new Date().toISOString(),
      maHV,
      hoTen,
      ngaySinh,
      capDai,
      ''
    ];
    sheet.appendRow(row);

    // Add to existing to prevent duplicates within the same batch
    existing.push(row);
    written.push(thang);
  });

  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      action: 'closeFundMultiple',
      written: written,
      duplicates: duplicates,
      writtenCount: written.length,
      duplicateCount: duplicates.length,
      sheetName: sheet.getName()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ACTION: closeFund
 * Appends one row to the "dongquy" tab for a specific member.
 * Duplicate check: same THANG (extracted from NGAY) + same person (by MA_HV or HO_TEN).
 * Creates the tab + header if missing.
 */
function handleCloseFund(data) {
  const ss = SpreadsheetApp.openById(DESTINATION_SHEET_ID);

  // Find the dongquy tab by name first, then by gid, then fallback to 3rd sheet
  let sheet = ss.getSheetByName(FUND_TAB_NAME);
  if (!sheet) {
    const sheets = ss.getSheets();
    sheet = sheets.find(s => s.getSheetId() === FUND_TAB_GID);
  }
  if (!sheet && ss.getSheets().length > 2) {
    sheet = ss.getSheets()[2]; // fallback to 3rd sheet
  }
  if (!sheet) {
    sheet = ss.insertSheet(FUND_TAB_NAME);
  }

  // Write header if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, FUND_HEADERS.length).setValues([FUND_HEADERS]);
    const headerRange = sheet.getRange(1, 1, 1, FUND_HEADERS.length);
    headerRange
      .setFontWeight('bold')
      .setBackground(HEADER_BG_COLOR)
      .setFontColor(HEADER_TEXT_COLOR)
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  }

  const now = new Date();
  const ngay = data.date || Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  const maHV = (data.maHV || '').trim();
  const hoTen = (data.hoTen || '').trim();

  // Extract THANG (MM/yyyy) from NGAY (dd/MM/yyyy) for duplicate check
  const thang = ngay.length >= 10 ? ngay.substring(3, 10) : '';

  // Duplicate check: same THANG + same person
  const lastRow = sheet.getLastRow();
  if (lastRow > 1 && (maHV || hoTen) && thang) {
    const existing = sheet.getRange(2, 1, lastRow - 1, FUND_HEADERS.length).getValues();
    const dup = existing.find(r => {
      const rowNgay = String(r[0]).trim();
      const rowThang = rowNgay.length >= 10 ? rowNgay.substring(3, 10) : '';
      if (rowThang !== thang) return false;
      // Prefer MA_HV match if both sides have it
      if (maHV && String(r[2]).trim()) {
        return String(r[2]).trim() === maHV;
      }
      // Fallback to HO_TEN match
      return String(r[3]).trim() === hoTen;
    });
    if (dup) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          duplicate: true,
          error: `${hoTen || maHV} đã đóng quỹ tháng ${thang} rồi.`
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  const row = [
    ngay,
    data.timestamp || now.toISOString(),
    maHV,
    hoTen,
    data.ngaySinh || '',
    data.capDai || '',
    data.ghiChu || ''
  ];

  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      action: 'closeFund',
      sheetName: sheet.getName(),
      rowNumber: sheet.getLastRow()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
