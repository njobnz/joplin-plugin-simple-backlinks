import { JoplinNote } from '../types';
import fetchNotes from './fetchNotes';

/**
 * Finds all notes that backlink to the given note and excludes ignored notes.
 * 
 * @param {JoplinNote} note - The note to search for backlinks.
 * @param {string[]} ignoreList - A list of note IDs to ignore.
 * @param {string} ignoreText - Notes with this text will be ignored.
 * @returns {Promise<JoplinNote[]>} Array of backlinked notes.
 */
export default async (note: JoplinNote, ignoreList: string[], ignoreText: string): Promise<JoplinNote[]> => {
  if (!ignoreList && !ignoreList.length) ignoreList = [];
  const notes = note?.id !== null ? await fetchNotes(['search'], note.id, ['id', 'parent_id', 'title', 'body']) : [];
  return notes.filter(item => !ignoreList.includes(item.id) && ignoreText !== '' && !item.body.includes(ignoreText));
};
