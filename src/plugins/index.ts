import joplin from 'api';
import MarkdownIt from 'markdown-it';
import { BacklinksContent, JoplinNote } from '../types';
import localization from '../localization';
import {
  BacklinksListType,
  BacklinksListParent,
  BacklinksListPosition,
  OPEN_NOTE_CMD,
  GET_BACKLINKS_CMD,
} from '../constants';
import findNoteBacklinks from '../utils/findNoteBacklinks';
import fetchNoteParentTitles from '../utils/fetchNoteParentTitles';
import escapeMarkdown from '../utils/escapeMarkdown';
import AppSettings from './settings';
import MarkdownView from './markdownIt';
import BacklinksView from './backlinks';

export default class App {
  markdown: any;
  settings: AppSettings;
  viewer: MarkdownView;
  panel: BacklinksView;
  setting: Function;

  constructor() {
    this.markdown = new MarkdownIt({ breaks: true });
    this.settings = new AppSettings(this);
    this.viewer = new MarkdownView(this);
    this.panel = new BacklinksView(this);
  }

  getBacklinksList = async (isManual: boolean = false): Promise<BacklinksContent> => {
    const position = (await this.setting('listPosition')) as BacklinksListPosition;
    if (position === BacklinksListPosition.None && !isManual) {
      return {
        position: position,
        hide: true,
        head: '',
        body: '',
      };
    }

    const note = (await joplin.workspace.selectedNote()) as JoplinNote;
    const notes = await findNoteBacklinks(note, await this.setting('ignoreList'), await this.setting('ignoreTag'));

    return {
      position: position,
      hide: notes.length === 0 && (await this.setting('hideEmpty')),
      head: this.markdown.render(await this.generateBacklinksHead(note, await this.setting('listHeader'))),
      body: this.markdown.render(
        await this.generateBacklinksList(notes, await this.setting('listType'), await this.setting('showHint'))
      ),
    };
  };

  generateBacklinksHead = async (note: JoplinNote, header: string): Promise<string> => {
    if (!header || /^#{1,6}(?=\s)/.test(header)) return header;
    const headers = note.body.match(/^#{1,6}(?=\s)/gm) || [];
    const largest = headers.length ? '#'.repeat(Math.min(...headers.map(h => h.length))) : '#';
    return `${largest} ${header}`;
  };

  generateBacklinksList = async (
    notes: JoplinNote[],
    type: BacklinksListType = BacklinksListType.NewLine,
    hint: boolean = false
  ): Promise<string> => {
    if (!notes.length && hint) return localization.message__noBacklinksHint;

    const result = await Promise.all(
      notes.map(async (note, index) => {
        let prefix = '';

        if (type == BacklinksListType.Ordered) prefix = `${index + 1}. `;
        else if (type == BacklinksListType.Unordered) prefix = `- `;

        const depth = (await this.setting('showParent')) as BacklinksListParent;
        const title =
          depth !== BacklinksListParent.None
            ? `${(await fetchNoteParentTitles(note, depth)).join('/')}/${note.title}`
            : note.title;

        return `${prefix}[${escapeMarkdown(title)}](:/${note.id})`;
      })
    );

    return result.join('\n');
  };

  onMessageHandler = async (message: any): Promise<any> => {
    switch (message?.command) {
      case GET_BACKLINKS_CMD:
        return await this.getBacklinksList(message?.isManual ? true : false);
      case OPEN_NOTE_CMD:
        try {
          if (!message?.noteId) throw Error('Note ID is missing.');
          return await joplin.commands.execute('openNote', message.noteId);
        } catch (exception) {
          console.error('Cannot open note:', exception, message);
          return { error: 'Cannot open note:', exception, message };
        }
      default:
        console.error('Unknown command:', message);
        return { error: 'Unknown command:', message };
    }
  };

  done = false;
  init = async (): Promise<void> => {
    if (this.done) return;

    await this.settings.init();
    await this.viewer.init();
    await this.panel.init();

    this.setting = this.settings.get;

    this.done = true;
  };
}
