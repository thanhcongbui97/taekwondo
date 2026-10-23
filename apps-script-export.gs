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
      actions: ['export', 'attendance'],
      destinationSheetId: DESTINATION_SHEET_ID,
      attendanceTab: ATTENDANCE_TAB_NAME
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
  const row = [
    data.date || Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy'),
    data.timestamp || now.toISOString(),
    data.maHV || '',
    data.hoTen || '',
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
