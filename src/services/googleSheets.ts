import { getAccessToken } from './googleAuth';
import { AppDatabase } from '../types';

export const SHEET_NAMES = [
  '01_CONFIG',
  '02_USERS',
  '03_ADMIN',
  '04_GURU',
  '05_MURID',
  '06_KELAS',
  '07_MAPEL',
  '08_ROMBEL',
  '09_TAHUN_AJARAN',
  '10_MATERI',
  '11_TUGAS',
  '12_PENGUMPULAN_TUGAS',
  '13_BANK_SOAL',
  '14_JAWABAN_QUIZ',
  '15_PRESENSI',
  '16_NILAI',
  '17_JURNAL',
  '18_EKSTRAKURIKULER',
  '19_LOG_AKTIVITAS'
] as const;

export interface DriveSpreadsheetFile {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export interface SheetTabInfo {
  sheetId: number;
  title: string;
  index: number;
}

export interface SpreadsheetMetadata {
  spreadsheetId: string;
  title: string;
  sheets: SheetTabInfo[];
  spreadsheetUrl: string;
}

// Convert an array of objects to 2D array [headers, ...rows]
export function tableToSheetValues(items: any[]): (string | number)[][] {
  if (!items || items.length === 0) {
    return [[]];
  }
  const headers = Object.keys(items[0]);
  const rows = items.map(item =>
    headers.map(h => {
      const val = item[h];
      if (val === null || val === undefined) return '';
      if (typeof val === 'object') return JSON.stringify(val);
      return val;
    })
  );
  return [headers, ...rows];
}

// Convert 2D array [headers, ...rows] back to array of objects
export function sheetValuesToTable(values: any[][]): any[] {
  if (!values || values.length <= 1) return [];
  const headers = values[0].map(h => String(h || '').trim());
  const rows = values.slice(1);

  return rows
    .filter(row => row.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== ''))
    .map(row => {
      const obj: Record<string, any> = {};
      headers.forEach((h, idx) => {
        if (!h) return;
        const cellVal = row[idx];
        obj[h] = cellVal !== undefined && cellVal !== null ? cellVal : '';
      });
      return obj;
    });
}

/**
 * Google Sheets API Service
 */
export const googleSheetsService = {
  /**
   * List Google Spreadsheets from user's Google Drive
   */
  async listUserSpreadsheets(): Promise<DriveSpreadsheetFile[]> {
    const token = await getAccessToken();
    if (!token) throw new Error('Silakan hubungkan akun Google Anda terlebih dahulu.');

    const q = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
    const fields = encodeURIComponent('files(id,name,modifiedTime,webViewLink)');
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=modifiedTime%20desc&pageSize=25&fields=${fields}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Gagal mengambil daftar spreadsheet (${res.status})`);
    }

    const data = await res.json();
    return (data.files || []) as DriveSpreadsheetFile[];
  },

  /**
   * Fetch spreadsheet metadata and tabs
   */
  async getSpreadsheetMetadata(spreadsheetId: string): Promise<SpreadsheetMetadata> {
    const token = await getAccessToken();
    if (!token) throw new Error('Silakan hubungkan akun Google Anda terlebih dahulu.');

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties.title,sheets.properties`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Gagal membaca spreadsheet (${res.status})`);
    }

    const data = await res.json();
    const sheets: SheetTabInfo[] = (data.sheets || []).map((s: any) => ({
      sheetId: s.properties.sheetId,
      title: s.properties.title,
      index: s.properties.index
    }));

    return {
      spreadsheetId: data.spreadsheetId,
      title: data.properties?.title || 'Spreadsheet LMS PJOK',
      sheets,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`
    };
  },

  /**
   * Create a new Google Spreadsheet with all 19 LMS PJOK sheets and seed with current database
   */
  async createNewLmsSpreadsheet(title = 'Database LMS PJOK SMA', db: AppDatabase): Promise<SpreadsheetMetadata> {
    const token = await getAccessToken();
    if (!token) throw new Error('Silakan hubungkan akun Google Anda terlebih dahulu.');

    // 1. Create spreadsheet with 19 sheet tabs
    const createPayload = {
      properties: {
        title: title
      },
      sheets: SHEET_NAMES.map(sheetName => ({
        properties: {
          title: sheetName,
          gridProperties: {
            frozenRowCount: 1
          }
        }
      }))
    };

    const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createPayload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Gagal membuat spreadsheet baru (${res.status})`);
    }

    const createdData = await res.json();
    const spreadsheetId = createdData.spreadsheetId;

    // 2. Populate initial values into all sheets
    await this.exportAllToSpreadsheet(spreadsheetId, db, false);

    const sheets: SheetTabInfo[] = (createdData.sheets || []).map((s: any) => ({
      sheetId: s.properties.sheetId,
      title: s.properties.title,
      index: s.properties.index
    }));

    return {
      spreadsheetId,
      title: createdData.properties?.title || title,
      sheets,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
    };
  },

  /**
   * Export all 19 database tables into the spreadsheet
   */
  async exportAllToSpreadsheet(spreadsheetId: string, db: AppDatabase, checkConfirmation = true): Promise<void> {
    const token = await getAccessToken();
    if (!token) throw new Error('Silakan hubungkan akun Google Anda terlebih dahulu.');

    if (checkConfirmation) {
      const confirmed = window.confirm(
        `Apakah Anda yakin ingin mengekspor seluruh data LMS PJOK ke Google Spreadsheet?\n\nSpreadsheet ID: ${spreadsheetId}\n\nOperasi ini akan memperbarui 19 sheet database.`
      );
      if (!confirmed) return;
    }

    // Inspect existing sheets in target spreadsheet to create missing tabs if needed
    const meta = await this.getSpreadsheetMetadata(spreadsheetId);
    const existingTitles = meta.sheets.map(s => s.title);
    const missingSheets = SHEET_NAMES.filter(name => !existingTitles.includes(name));

    if (missingSheets.length > 0) {
      // Add missing sheets
      const addRequests = missingSheets.map(title => ({
        addSheet: {
          properties: {
            title,
            gridProperties: { frozenRowCount: 1 }
          }
        }
      }));

      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requests: addRequests })
      });
    }

    // Prepare batch data for all 19 sheets
    const dataUpdates = SHEET_NAMES.map(sheetName => {
      const tableData = (db as any)[sheetName] || [];
      const values = tableToSheetValues(tableData);
      return {
        range: `'${sheetName}'!A1`,
        values
      };
    });

    // Clear and write new values
    const batchRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: dataUpdates
      })
    });

    if (!batchRes.ok) {
      const err = await batchRes.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Gagal menyimpan data ke spreadsheet (${batchRes.status})`);
    }
  },

  /**
   * Import / Sync all 19 sheets from Google Spreadsheet into local database
   */
  async importAllFromSpreadsheet(spreadsheetId: string): Promise<Partial<AppDatabase>> {
    const token = await getAccessToken();
    if (!token) throw new Error('Silakan hubungkan akun Google Anda terlebih dahulu.');

    const meta = await this.getSpreadsheetMetadata(spreadsheetId);
    const existingTitles = meta.sheets.map(s => s.title);

    // Build ranges to fetch
    const availableSheets = SHEET_NAMES.filter(s => existingTitles.includes(s));
    if (availableSheets.length === 0) {
      throw new Error('Spreadsheet ini tidak memiliki sheet tabel LMS PJOK (01_CONFIG, 02_USERS, dll).');
    }

    const rangesQuery = availableSheets.map(s => `ranges=${encodeURIComponent(`'${s}'!A1:Z`)}`).join('&');
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${rangesQuery}&valueRenderOption=UNFORMATTED_VALUE`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Gagal mengimpor dari Google Sheets (${res.status})`);
    }

    const data = await res.json();
    const valueRanges = data.valueRanges || [];

    const importedDb: Partial<AppDatabase> = {};

    valueRanges.forEach((rangeObj: any) => {
      const fullRange = rangeObj.range || '';
      // extract sheet name from range e.g. "'01_CONFIG'!A1:Z10"
      const matched = fullRange.match(/'?([^'!]+)'?!/);
      const sheetName = matched ? matched[1] : '';

      if (sheetName && (SHEET_NAMES as readonly string[]).includes(sheetName)) {
        const table = sheetValuesToTable(rangeObj.values || []);
        (importedDb as any)[sheetName] = table;
      }
    });

    return importedDb;
  }
};
