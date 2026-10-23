/**
 * Google Apps Script - Web App for exporting member data to a Google Sheet.
 *
 * HOW TO DEPLOY:
 *   1. Open the destination Google Sheet:
 *      https://docs.google.com/spreadsheets/d/1v85Al1tqyt7D6u11U5Ede6UeBG8oV9dU2-1Vht3eglE
 *   2. Go to: Extensions > Apps Script
 *   3. Delete any existing code and paste this entire file.
 *   4. Click "Deploy" > "New deployment"
 *   5. Click the gear icon next to "Select type" > choose "Web app"
 *   6. Configure:
 *        - Description: "Export member data"
 *        - Execute as: "Me" (your account)
 *        - Who has access: "Anyone"  <-- IMPORTANT, must be "Anyone" not "Anyone with Google account"
 *   7. Click "Deploy" > authorize when prompted.
 *   8. Copy the "Web app URL" (ends with /exec).
 *   9. Paste that URL into EXPORT_SCRIPT_URL in quanli.html.
 *
 * The frontend sends a POST with JSON body:
 *   { "headers": ["col1", "col2", ...], "rows": [["v1","v2",...], ...] }
 *
 * This script:
 *   - Clears the first sheet of the destination spreadsheet
 *   - Writes the header row (bold, colored background)
 *   - Writes all data rows in batches of 500
 *   - Returns JSON { success: true, count: N } or { success: false, error: "..." }
 */

// ===== Config =====
const DESTINATION_SHEET_ID = '1v85Al1tqyt7D6u11U5Ede6UeBG8oV9dU2-1Vht3eglE';
const HEADER_BG_COLOR = '#33b5e5';
const HEADER_TEXT_COLOR = '#ffffff';
const BATCH_SIZE = 500;

/**
 * Handle POST requests from the frontend.
 * Expected body: JSON string { headers: string[], rows: string[][] }
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('No POST body received');
    }

    const data = JSON.parse(e.postData.contents);
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

    // Write data rows in batches (avoids timeout on large datasets)
    if (rows.length > 0) {
      let currentRow = 2; // start after header
      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        // Normalize row width to match header width (pad with empty strings if needed)
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

    // Auto-resize columns (best-effort, may be slow on very wide sheets)
    try {
      sheet.autoResizeColumns(1, Math.min(headers.length, 20));
    } catch (autoResizeErr) {
      // Non-fatal: continue even if auto-resize fails
      console.warn('autoResizeColumns failed:', autoResizeErr);
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        count: rows.length,
        sheetName: sheet.getName()
      }))
      .setMimeType(ContentService.MimeType.JSON);

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
 * Visit the /exec URL directly to verify the script is deployed.
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Export endpoint is live. Send a POST request with JSON body { headers: [], rows: [] } to export data.',
      destinationSheetId: DESTINATION_SHEET_ID
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
