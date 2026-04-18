import Dexie from 'dexie';

const db = new Dexie('SecureNotesDB');

db.version(1).stores({
  notes: '++id, title, isPinned, isArchived, isHidden, createdAt, updatedAt, *tags',
  settings: 'key',
});

// ─── Notes ────────────────────────────────────────────────────────────────────

export async function getAllNotes() {
  return db.notes.where('isHidden').equals(0).toArray();
}

export async function getVaultNotes() {
  return db.notes.where('isHidden').equals(1).toArray();
}

export async function getNoteById(id) {
  return db.notes.get(id);
}

export async function saveNote(note) {
  const now = Date.now();
  if (note.id) {
    await db.notes.update(note.id, { ...note, updatedAt: now });
    return note.id;
  }
  return db.notes.add({ ...note, createdAt: now, updatedAt: now });
}

export async function deleteNote(id) {
  return db.notes.delete(id);
}

export async function pinNote(id, isPinned) {
  return db.notes.update(id, { isPinned: isPinned ? 1 : 0, updatedAt: Date.now() });
}

export async function archiveNote(id, isArchived) {
  return db.notes.update(id, { isArchived: isArchived ? 1 : 0, updatedAt: Date.now() });
}

export async function moveToVault(id) {
  return db.notes.update(id, { isHidden: 1, updatedAt: Date.now() });
}

export async function moveFromVault(id) {
  return db.notes.update(id, { isHidden: 0, updatedAt: Date.now() });
}

export async function searchNotes(query) {
  const q = query.toLowerCase();
  return db.notes
    .filter(n => !n.isHidden && (
      (n.title || '').toLowerCase().includes(q) ||
      (n.content || '').toLowerCase().includes(q) ||
      (n.tags || []).some(t => t.toLowerCase().includes(q))
    ))
    .toArray();
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSetting(key, defaultVal = null) {
  const row = await db.settings.get(key);
  return row ? row.value : defaultVal;
}

export async function setSetting(key, value) {
  return db.settings.put({ key, value });
}

// ─── Bulk Export / Import ─────────────────────────────────────────────────────

export async function exportAllNotes() {
  return db.notes.toArray();
}

export async function importNotes(notes) {
  return db.notes.bulkPut(notes);
}

export async function clearAllData() {
  await db.notes.clear();
  await db.settings.clear();
}

export default db;
