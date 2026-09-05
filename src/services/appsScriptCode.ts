// Google Apps Script Complete Source Code & Deployment Manifest
// Corresponds to Section AR & BK of LMS PJOK Specification

export interface AppsScriptFile {
  filename: string;
  description: string;
  code: string;
}

export const APPS_SCRIPT_SHEET_NAMES = [
  '01_CONFIG',
  '02_USERS',
  '03_ADMIN',
  '04_GURU',
  '05_MURID',
  '06_KELAS',
  '07_MAPEL',
  '08_ATP',
  '09_MATERI',
  '10_TUGAS',
  '11_PENGUMPULAN_TUGAS',
  '12_QUIZ',
  '13_SOAL',
  '14_JAWABAN_QUIZ',
  '15_PRESENSI',
  '16_PENILAIAN',
  '17_JURNAL',
  '18_NOTIFIKASI',
  '19_LOG_AKTIVITAS'
];

export const APPS_SCRIPT_HEADERS: Record<string, string[]> = {
  '01_CONFIG': ['KEY', 'VALUE', 'DESCRIPTION'],
  '02_USERS': ['USER_ID', 'USERNAME', 'PASSWORD_HASH', 'ROLE', 'REF_ID', 'NAMA', 'STATUS', 'LAST_LOGIN', 'CREATED_AT', 'UPDATED_AT'],
  '03_ADMIN': ['ADMIN_ID', 'NAMA', 'USERNAME', 'EMAIL', 'NO_HP', 'STATUS'],
  '04_GURU': ['GURU_ID', 'NIP', 'NAMA_GURU', 'JENIS_KELAMIN', 'EMAIL', 'NO_HP', 'MATA_PELAJARAN', 'STATUS'],
  '05_MURID': ['MURID_ID', 'NIS', 'NISN', 'NAMA_MURID', 'JENIS_KELAMIN', 'KELAS_ID', 'NAMA_KELAS', 'TAHUN_PELAJARAN', 'USERNAME', 'STATUS'],
  '06_KELAS': ['KELAS_ID', 'TINGKAT', 'NAMA_KELAS', 'WALI_KELAS', 'GURU_ID', 'TAHUN_PELAJARAN', 'STATUS'],
  '07_MAPEL': ['MAPEL_ID', 'NAMA_MAPEL', 'FASE', 'TINGKAT', 'GURU_ID', 'TAHUN_PELAJARAN', 'SEMESTER', 'STATUS'],
  '08_ATP': ['ATP_ID', 'MAPEL_ID', 'FASE', 'KELAS', 'ELEMEN', 'MATERI', 'TUJUAN_PEMBELAJARAN', 'MEMAHAMI', 'MENERAPKAN', 'MEREFLEKSI', 'INDIKATOR', 'ALOKASI_WAKTU', 'SEMESTER', 'TAHUN_PELAJARAN', 'GURU_ID', 'STATUS'],
  '09_MATERI': ['MATERI_ID', 'JUDUL', 'MAPEL_ID', 'FASE', 'KELAS', 'TOPIK', 'DESKRIPSI', 'TUJUAN_PEMBELAJARAN', 'ISI_MATERI', 'VIDEO_URL', 'PDF_URL', 'GAMBAR_URL', 'GURU_ID', 'TANGGAL', 'STATUS'],
  '10_TUGAS': ['TUGAS_ID', 'JUDUL', 'MATERI_ID', 'MAPEL_ID', 'KELAS_ID', 'GURU_ID', 'DESKRIPSI', 'INSTRUKSI', 'TANGGAL_MULAI', 'DEADLINE', 'FILE_URL', 'NILAI_MAKSIMAL', 'STATUS'],
  '11_PENGUMPULAN_TUGAS': ['PENGUMPULAN_ID', 'TUGAS_ID', 'MURID_ID', 'NAMA_MURID', 'FILE_URL', 'JAWABAN', 'TANGGAL_KUMPUL', 'STATUS', 'NILAI', 'KOMENTAR_GURU', 'DINILAI_OLEH', 'TANGGAL_DINILAI'],
  '12_QUIZ': ['QUIZ_ID', 'JUDUL', 'MAPEL_ID', 'MATERI_ID', 'KELAS_ID', 'GURU_ID', 'DESKRIPSI', 'JUMLAH_SOAL', 'DURASI', 'TANGGAL_MULAI', 'DEADLINE', 'KKM', 'ACAK_SOAL', 'ACAK_JAWABAN', 'STATUS'],
  '13_SOAL': ['SOAL_ID', 'QUIZ_ID', 'NOMOR', 'PERTANYAAN', 'OPSI_A', 'OPSI_B', 'OPSI_C', 'OPSI_D', 'OPSI_E', 'KUNCI', 'BOBOT', 'JENIS_SOAL'],
  '14_JAWABAN_QUIZ': ['JAWABAN_ID', 'QUIZ_ID', 'SOAL_ID', 'MURID_ID', 'JAWABAN', 'BENAR_SALAH', 'BOBOT', 'WAKTU_JAWAB'],
  '15_PRESENSI': ['PRESENSI_ID', 'TANGGAL', 'KELAS_ID', 'MURID_ID', 'NAMA_MURID', 'GURU_ID', 'STATUS', 'KETERANGAN', 'WAKTU'],
  '16_PENILAIAN': ['NILAI_ID', 'MURID_ID', 'NAMA_MURID', 'KELAS_ID', 'GURU_ID', 'MAPEL_ID', 'MATERI', 'JENIS_PENILAIAN', 'ASPEK', 'NILAI', 'SKOR_MAKSIMAL', 'PREDIKAT', 'KETERANGAN', 'TANGGAL', 'SEMESTER', 'TAHUN_PELAJARAN'],
  '17_JURNAL': ['JURNAL_ID', 'TANGGAL', 'GURU_ID', 'KELAS_ID', 'MAPEL_ID', 'MATERI', 'TUJUAN', 'KEGIATAN', 'METODE', 'MEDIA', 'JUMLAH_HADIR', 'CATATAN', 'REFLEKSI_GURU'],
  '18_NOTIFIKASI': ['NOTIFIKASI_ID', 'USER_ID', 'ROLE', 'JUDUL', 'PESAN', 'TIPE', 'LINK', 'STATUS', 'TANGGAL'],
  '19_LOG_AKTIVITAS': ['LOG_ID', 'USER_ID', 'NAMA', 'ROLE', 'AKTIVITAS', 'DETAIL', 'WAKTU']
};

export const APPS_SCRIPT_FILES: AppsScriptFile[] = [
  {
    filename: 'Code.gs',
    description: 'Routing utama doGet() dan doPost() untuk Web App Google Apps Script',
    code: `/**
 * LMS PJOK - Learning Management System Pendidikan Jasmani, Olahraga, dan Kesehatan
 * "Belajar, Bergerak, Berkembang."
 * 
 * Google Apps Script Web App Entry Point
 */

function doGet(e) {
  // Jika dipanggil via browser biasa, tampilkan index HTML
  // atau kembalikan response JSON jika memiliki parameter action
  if (e && e.parameter && e.parameter.action) {
    return handleApiRequest(e.parameter.action, e.parameter);
  }
  
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('LMS PJOK - Learning Management System')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    var contents = e.postData ? JSON.parse(e.postData.contents) : {};
    var action = contents.action || (e.parameter && e.parameter.action);
    var payload = contents.payload || contents;
    
    return handleApiRequest(action, payload);
  } catch (err) {
    return createJsonResponse({ success: false, message: 'Gagal memproses request: ' + err.toString() });
  }
}

function handleApiRequest(action, payload) {
  try {
    switch (action) {
      case 'ping':
        return createJsonResponse({ success: true, message: 'LMS PJOK Backend Aktif', timestamp: new Date() });
      case 'setupDatabase':
        return createJsonResponse(setupDatabase());
      case 'getAllData':
        return createJsonResponse({ success: true, data: fetchAllDatabaseData() });
      case 'login':
        return createJsonResponse(loginUser(payload.username, payload.password));
      case 'savePresensi':
        return createJsonResponse(savePresensi(payload));
      case 'savePenilaian':
        return createJsonResponse(savePenilaian(payload));
      case 'saveJurnal':
        return createJsonResponse(saveJurnal(payload));
      case 'submitTugas':
        return createJsonResponse(submitTugas(payload));
      case 'gradeTugas':
        return createJsonResponse(gradeTugas(payload));
      case 'submitQuiz':
        return createJsonResponse(submitQuiz(payload));
      case 'addMateri':
        return createJsonResponse(addMateri(payload));
      case 'updateMateri':
        return createJsonResponse(updateMateri(payload));
      case 'deleteMateri':
        return createJsonResponse(deleteMateri(payload.materiId));
      default:
        return createJsonResponse({ success: false, message: 'Action tidak dikenal: ' + action });
    }
  } catch (error) {
    return createJsonResponse({ success: false, message: error.toString() });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}`
  },
  {
    filename: 'Database.gs',
    description: 'Inisialisasi 19 Sheets lengkap dengan header dan operasi CRUD',
    code: `/**
 * Database.gs - Engine Google Spreadsheet Database LMS PJOK
 */

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function setupDatabase() {
  var ss = getSpreadsheet();
  var sheetConfigs = ${JSON.stringify(APPS_SCRIPT_HEADERS, null, 2)};
  
  var created = [];
  var existing = [];
  
  for (var sheetName in sheetConfigs) {
    var sheet = ss.getSheetByName(sheetName);
    var headers = sheetConfigs[sheetName];
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#0f766e').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
      created.push(sheetName);
    } else {
      // Verifikasi header
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#0f766e').setFontColor('#ffffff');
        sheet.setFrozenRows(1);
      }
      existing.push(sheetName);
    }
  }
  
  // Masukkan default config jika 01_CONFIG baru dibuat
  seedDefaultData(ss);
  
  return {
    success: true,
    message: 'Setup Database LMS PJOK Selesai.',
    createdSheets: created,
    existingSheets: existing
  };
}

function seedDefaultData(ss) {
  var configSheet = ss.getSheetByName('01_CONFIG');
  if (configSheet && configSheet.getLastRow() <= 1) {
    configSheet.appendRow(['NAMA_APLIKASI', 'LMS PJOK', 'Nama Sistem Pembelajaran']);
    configSheet.appendRow(['SUBJUDUL', 'Learning Management System Pendidikan Jasmani, Olahraga, dan Kesehatan', 'Subjudul Aplikasi']);
    configSheet.appendRow(['SLOGAN', 'Belajar, Bergerak, Berkembang.', 'Slogan Utama']);
    configSheet.appendRow(['NAMA_SEKOLAH', 'SMA Negeri 1 Prestasi Bangsa', 'Nama Sekolah Pengguna']);
    configSheet.appendRow(['TAHUN_PELAJARAN', '2026/2027', 'Tahun Ajaran Aktif']);
    configSheet.appendRow(['SEMESTER', '1 (Ganjil)', 'Semester Berjalan']);
    configSheet.appendRow(['KKM', '75', 'Kriteria Ketuntasan Minimal']);
  }
  
  var userSheet = ss.getSheetByName('02_USERS');
  if (userSheet && userSheet.getLastRow() <= 1) {
    userSheet.appendRow(['USR001', 'admin', 'admin123', 'ADMIN', 'ADM001', 'Administrator PJOK', 'AKTIF', '', new Date(), new Date()]);
    userSheet.appendRow(['USR002', 'guru01', 'guru123', 'GURU', 'G001', 'I Ketut Suardana, S.Pd., M.Fis.', 'AKTIF', '', new Date(), new Date()]);
    userSheet.appendRow(['USR003', 'murid01', 'murid123', 'MURID', 'M001', 'Andi Pratama', 'AKTIF', '', new Date(), new Date()]);
  }
}

function fetchAllDatabaseData() {
  var ss = getSpreadsheet();
  var result = {};
  var sheetConfigs = ${JSON.stringify(APPS_SCRIPT_HEADERS, null, 2)};
  
  for (var sheetName in sheetConfigs) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      result[sheetName] = [];
      continue;
    }
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      result[sheetName] = [];
      continue;
    }
    
    var headers = data[0];
    var rows = [];
    for (var i = 1; i < data.length; i++) {
      var rowObj = {};
      for (var j = 0; j < headers.length; j++) {
        rowObj[headers[j]] = data[i][j];
      }
      rows.push(rowObj);
    }
    result[sheetName] = rows;
  }
  return result;
}

function appendToSheet(sheetName, rowData) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error('Sheet ' + sheetName + ' tidak ditemukan.');
  
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rowArray = [];
  for (var i = 0; i < headers.length; i++) {
    var key = headers[i];
    rowArray.push(rowData[key] !== undefined ? rowData[key] : '');
  }
  sheet.appendRow(rowArray);
  return true;
}`
  },
  {
    filename: 'Auth.gs',
    description: 'Autentikasi, validasi login, dan session pengguna',
    code: `/**
 * Auth.gs - Login, Session & Role Security
 */

function loginUser(username, password) {
  if (!username || !password) {
    return { success: false, message: 'Username dan password wajib diisi.' };
  }
  
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('02_USERS');
  if (!sheet) return { success: false, message: 'Sheet 02_USERS tidak ditemukan.' };
  
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var uName = String(row[1]).trim();
    var pass = String(row[2]).trim();
    var role = row[3];
    var refId = row[4];
    var nama = row[5];
    var status = row[6];
    
    if (uName.toLowerCase() === String(username).trim().toLowerCase()) {
      if (pass !== String(password).trim()) {
        return { success: false, message: 'Username atau password salah.' };
      }
      
      if (status !== 'AKTIF') {
        return { success: false, message: 'Akun Anda tidak aktif. Silakan hubungi administrator.' };
      }
      
      // Update last login
      sheet.getRange(i + 1, 8).setValue(new Date());
      
      // Log Aktivitas
      logActivity(row[0], nama, role, 'LOGIN', 'Berhasil masuk ke aplikasi LMS PJOK');
      
      return {
        success: true,
        user: {
          user_id: row[0],
          username: uName,
          role: role,
          ref_id: refId,
          nama: nama,
          status: status
        }
      };
    }
  }
  
  return { success: false, message: 'Username atau password salah.' };
}

function logActivity(userId, nama, role, aktivitas, detail) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName('19_LOG_AKTIVITAS');
    if (!sheet) return;
    var logId = 'LOG' + new Date().getTime();
    sheet.appendRow([logId, userId, nama, role, aktivitas, detail, new Date()]);
  } catch(e) {}
}`
  },
  {
    filename: 'Presensi.gs',
    description: 'Presensi harian guru & murid dengan proteksi anti-duplikasi',
    code: `/**
 * Presensi.gs - Modul Presensi LMS PJOK
 */

function savePresensi(payload) {
  var tanggal = payload.tanggal;
  var kelasId = payload.kelasId;
  var guruId = payload.guruId;
  var records = payload.records; // Array of { muridId, namaMurid, status, keterangan }
  
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('15_PRESENSI');
  if (!sheet) throw new Error('Sheet 15_PRESENSI tidak ditemukan.');
  
  var data = sheet.getDataRange().getValues();
  
  // Cari baris yang sudah ada untuk tanggal, kelas, dan murid ini agar tidak duplikat
  records.forEach(function(rec) {
    var foundIndex = -1;
    for (var i = 1; i < data.length; i++) {
      var d = Utilities.formatDate(new Date(data[i][1]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
      var k = data[i][2];
      var m = data[i][3];
      if (d === tanggal && k === kelasId && m === rec.muridId) {
        foundIndex = i + 1;
        break;
      }
    }
    
    var timeNow = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'HH:mm');
    if (foundIndex > 0) {
      // Update record
      sheet.getRange(foundIndex, 7).setValue(rec.status);
      sheet.getRange(foundIndex, 8).setValue(rec.keterangan || '');
      sheet.getRange(foundIndex, 9).setValue(timeNow);
    } else {
      // Buat baru
      var id = 'PRS' + new Date().getTime() + Math.floor(Math.random() * 100);
      sheet.appendRow([id, tanggal, kelasId, rec.muridId, rec.namaMurid, guruId, rec.status, rec.keterangan || '', timeNow]);
    }
  });
  
  return { success: true, message: 'Presensi berhasil disimpan.' };
}`
  },
  {
    filename: 'Penilaian.gs',
    description: 'Penilaian praktik PJOK (Rubrik 1-4) dan rekap nilai akhir',
    code: `/**
 * Penilaian.gs - Penilaian Praktik PJOK & Teori
 */

function savePenilaian(payload) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('16_PENILAIAN');
  if (!sheet) throw new Error('Sheet 16_PENILAIAN tidak ditemukan.');
  
  var id = payload.nilaiId || ('NIL' + new Date().getTime());
  var predikat = calculatePredikat(payload.nilai);
  
  sheet.appendRow([
    id,
    payload.muridId,
    payload.namaMurid,
    payload.kelasId,
    payload.guruId,
    payload.mapelId,
    payload.materi,
    payload.jenisPenilaian,
    payload.aspek,
    payload.nilai,
    payload.skorMaksimal || 100,
    predikat,
    payload.keterangan || '',
    payload.tanggal || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    payload.semester || '1',
    payload.tahunPelajaran || '2026/2027'
  ]);
  
  return { success: true, message: 'Penilaian berhasil disimpan.' };
}

function calculatePredikat(nilai) {
  if (nilai >= 90) return 'A';
  if (nilai >= 80) return 'B';
  if (nilai >= 70) return 'C';
  return 'D';
}`
  }
];
