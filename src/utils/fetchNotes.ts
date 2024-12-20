import joplin from 'api';
import { JoplinNote } from '../types';

export default async (path: string[], query?: string, fields?: string[], limit: number = 0): Promise<JoplinNote[]> => {
  const results: JoplinNote[] = [];

  for (let page = 1; ; page++) {
    try {
      const { items, has_more } = await joplin.data.get(path, {
        page,
        fields: fields ?? ['id', 'parent_id', 'title'],
        ...(query && { query }),
      });
      results.push(...items);
      if (!has_more || (limit > 0 && results.length >= limit)) break;
    } catch (error) {
      console.error('Error fetching notes:', error, path, query, fields);
      break;
    }
  }

  return results;
};
