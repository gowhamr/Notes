import { exportAllNotes, importNotes, getSetting, setSetting } from './storage';

// ─── Google Drive ─────────────────────────────────────────────────────────────

const GDRIVE_BACKUP_FILE = 'secure-notes-backup.json';
const GDRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';

export async function initGoogleDrive(clientId) {
  return new Promise((resolve, reject) => {
    if (!window.gapi) { reject(new Error('Google API not loaded')); return; }
    window.gapi.load('client:auth2', async () => {
      try {
        await window.gapi.client.init({
          clientId,
          scope: GDRIVE_SCOPE,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });
        resolve(window.gapi.auth2.getAuthInstance().isSignedIn.get());
      } catch (e) { reject(e); }
    });
  });
}

export async function signInGoogleDrive() {
  return window.gapi.auth2.getAuthInstance().signIn();
}

export async function backupToGoogleDrive() {
  const notes = await exportAllNotes();
  const backup = JSON.stringify({ notes, exportedAt: Date.now(), version: 1 });
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;
  const existing = await findGDriveFile();
  const metadata = { name: GDRIVE_BACKUP_FILE, mimeType: 'application/json', parents: ['appDataFolder'] };
  const body = `${delimiter}Content-Type: application/json\r\n\r\n${JSON.stringify(metadata)}${delimiter}Content-Type: application/json\r\n\r\n${backup}${closeDelimiter}`;
  const method = existing ? 'PATCH' : 'POST';
  const url = existing
    ? `https://www.googleapis.com/upload/drive/v3/files/${existing}?uploadType=multipart`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
  await window.gapi.client.request({ path: url, method, params: { uploadType: 'multipart' }, headers: { 'Content-Type': `multipart/related; boundary="${boundary}"` }, body });
  await setSetting('lastGDriveSync', Date.now());
  return true;
}

async function findGDriveFile() {
  try {
    const res = await window.gapi.client.drive.files.list({
      spaces: 'appDataFolder',
      fields: 'files(id, name)',
      q: `name='${GDRIVE_BACKUP_FILE}'`,
    });
    return res.result.files?.[0]?.id || null;
  } catch { return null; }
}

export async function restoreFromGoogleDrive() {
  const fileId = await findGDriveFile();
  if (!fileId) throw new Error('No backup found in Google Drive');
  const res = await window.gapi.client.drive.files.get({ fileId, alt: 'media' });
  const { notes } = JSON.parse(res.body);
  await importNotes(notes);
  return notes.length;
}

// ─── Export / Import (local) ──────────────────────────────────────────────────

export async function exportToJSON() {
  const notes = await exportAllNotes();
  const blob = new Blob([JSON.stringify({ notes, exportedAt: Date.now(), version: 1 }, null, 2)], { type: 'application/json' });
  downloadBlob(blob, 'secure-notes-backup.json');
}

export async function exportNoteAsMarkdown(note) {
  const frontmatter = `---\ntitle: ${note.title || 'Untitled'}\ntags: ${(note.tags || []).join(', ')}\ncreated: ${new Date(note.createdAt).toISOString()}\n---\n\n`;
  const blob = new Blob([frontmatter + (note.content || '')], { type: 'text/markdown' });
  downloadBlob(blob, `${(note.title || 'note').replace(/[^a-z0-9]/gi, '-')}.md`);
}

export async function importFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const { notes } = JSON.parse(e.target.result);
        await importNotes(notes);
        resolve(notes.length);
      } catch { reject(new Error('Invalid backup file')); }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export async function importMarkdownFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const titleMatch = text.match(/^#\s+(.+)$/m) || text.match(/^title:\s*(.+)$/m);
      resolve({
        title: titleMatch ? titleMatch[1].trim() : file.name.replace('.md', ''),
        content: text,
        tags: [],
        isPinned: 0,
        isArchived: 0,
        isHidden: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
