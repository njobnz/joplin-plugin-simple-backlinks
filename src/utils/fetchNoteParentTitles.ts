import joplin from 'api';
import { JoplinNote } from '../types';

export default async (note: JoplinNote, depth: number = 1): Promise<string[]> => {
  const results: string[] = [];

  let parentId = note?.parent_id;
  while (parentId && parentId !== '' && depth > -1) {
    if (depth !== 0) depth = depth === 1 ? (depth = -1) : depth--;

    try {
      const folder = await joplin.data.get(['folders', parentId], { fields: ['title', 'parent_id'] });
      results.unshift(folder['title']);
      parentId = folder.parent_id;
    } catch (error) {
      console.error('Error fetching note parent:', error, note);
      break;
    }
  }

  return results;
};
