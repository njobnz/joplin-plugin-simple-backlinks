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
import { MenuItemLocation, ToolbarButtonLocation } from 'api/types';

export default class App {
  markdown: any;
  settings: AppSettings;
  setting: Function;
  viewer: MarkdownView;
  panel: BacklinksView;
  dialogs: {
    ignoreList: any;
  };

  constructor() {
    this.markdown = new MarkdownIt({ breaks: true });
    this.settings = new AppSettings(this);
    this.viewer = new MarkdownView(this);
    this.panel = new BacklinksView(this);
  }

  onMessageHandler = async (message: any): Promise<any> => {
    switch (message?.command) {
      case GET_BACKLINKS_CMD:
        return await this.getBacklinksList(message?.isFound ? true : false);
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

  getBacklinksList = async (isFound: boolean = false, isPanel: boolean = false): Promise<BacklinksContent> => {
    const result = {
      position: BacklinksListPosition.Footer,
      hide: true,
      head: '',
      body: '',
    };

    result.position = (await this.setting('listPosition')) as BacklinksListPosition;
    if (!isFound && result.position === BacklinksListPosition.None) return result;

    const note = (await joplin.workspace.selectedNote()) as JoplinNote;
    if (!note || (!isPanel && note.body.includes(await this.setting('manualText')))) return result;

    const notes = await findNoteBacklinks(note.id, await this.setting('ignoreList'), await this.setting('ignoreText'));

    result.hide = notes.length === 0 && (await this.setting('hideEmpty'));
    result.head = this.markdown.render(await this.generateBacklinksHead(note, await this.setting('listHeader')));
    result.body = this.markdown.render(
      await this.generateBacklinksList(notes, await this.setting('listType'), await this.setting('showHint'))
    );

    return result;
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

  createBacklinksDialogs = async () => {
    this.dialogs = {
      ignoreList: await joplin.views.dialogs.create('simpleBacklinksIgnoreListDialog'),
    };
  };

  registerInsertBacklinksHeadCmd = async () => {
    await joplin.commands.register({
      name: 'insertBacklinksHeader',
      label: localization.command_insertBacklinksHeader,
      iconName: 'fas fa-hand-point-left',
      execute: async () => {
        const note = (await joplin.workspace.selectedNote()) as JoplinNote;
        if (!note) return;

        const head = await this.generateBacklinksHead(note, await this.setting('listHeader'));
        const body = `${note.body}\n${head}`;

        await joplin.commands.execute('textSelectAll');
        await joplin.commands.execute('replaceSelection', body);
      },
    });
  };

  registerInsertBacklinksListCmd = async () => {
    await joplin.commands.register({
      name: 'insertBacklinksList',
      label: localization.command_insertBacklinksList,
      iconName: 'fas fa-hand-point-left',
      execute: async () => {
        const note = (await joplin.workspace.selectedNote()) as JoplinNote;
        if (!note) return;

        const notes = await findNoteBacklinks(
          note.id,
          await this.setting('ignoreList'),
          await this.setting('ignoreTag')
        );
        if (!notes) return;

        const text = await this.setting('manualText');
        const head = await this.generateBacklinksHead(note, await this.setting('listHeader'));
        const list = await this.generateBacklinksList(
          notes,
          await this.setting('listType'),
          await this.setting('showHint')
        );
        const html = `${text}\n${head}\n\n${list}`;
        const body =
          (await this.setting('listPosition')) === BacklinksListPosition.Header
            ? `${html}\n\n${note.body}`
            : `${note.body}\n${html}\n`;

        await joplin.commands.execute('textSelectAll');
        await joplin.commands.execute('replaceSelection', body);
      },
    });

    await joplin.views.menuItems.create('insertBacklinksListMenu', 'insertBacklinksList', MenuItemLocation.Note, {
      accelerator: 'Ctrl+Alt+B',
    });

    await joplin.views.toolbarButtons.create(
      'insertBacklinksListToolbar',
      'insertBacklinksList',
      ToolbarButtonLocation.EditorToolbar
    );
  };

  registerToggleIgnoreListCmd = async () => {
    await joplin.commands.register({
      name: 'toggleNoteBacklinksIgnoreList',
      label: localization.command_toggleNoteBacklinksIgnoreList,
      iconName: 'fas fa-hand-point-left',
      execute: async () => {
        const note = (await joplin.workspace.selectedNote()) as JoplinNote;
        if (!note) return;

        const list = (await this.setting('ignoreList')) as string[];
        if (list.includes(note.id)) {
          let index = list.indexOf(note.id);
          if (index > -1) list.splice(index, 1);
          alert(localization.message__noteIgnoreListRemoved);
        } else {
          list.push(note.id);
          alert(localization.message__noteIgnoreListAdded);
        }

        await joplin.settings.setValue('ignoreList', list);
      },
    });
  };

  registerOpenIgnoreListCmd = async () => {
    await joplin.commands.register({
      name: 'openBacklinksIgnoreList',
      label: localization.command_openBacklinksIgnoreList,
      iconName: 'fas fa-hand-point-left',
      execute: async () => {
        const options = [];
        const list = await this.setting('ignoreList');

        for (const id of list) {
          const note = await fetchNoteById(id, ['title']);
          if (note) options.push(`<option value="${id}">${note.title.trim() !== '' ? note.title : id}</option>`);
          else options.push(`<option value="${id}">NOTE DELETED (${id})</option>`);
        }

        if (!options.length)
          options.push(`<option selected="selected">${localization.dialog_ignoreList_empty}</option>`);

        const html = options.join('\n');
        const body = `
          <h3>${localization.dialog_ignoreList_title}</h3>
          <form name="notes">
            <select style="width: 100%" name="noteId" size="12">
              ${html}
            </select>
          </form>
        `;

        await joplin.views.dialogs.setHtml(this.dialogs.ignoreList, body);
        await joplin.views.dialogs.setButtons(this.dialogs.ignoreList, [
          {
            id: 'ok',
            title: localization.dialog_ignoreList_open,
          },
          {
            id: 'cancel',
            title: localization.dialog_ignoreList_close,
          },
        ]);

        const response = await joplin.views.dialogs.open(this.dialogs.ignoreList);
        if (response.id == 'ok') {
          try {
            await joplin.commands.execute('openNote', response.formData.notes.noteId);
          } catch (e) {}
        }
      },
    });
  };

  registerToggleBacklinksPanelCmd = async () => {
    await joplin.commands.register({
      name: 'toggleBacklinksPanel',
      label: localization.command_toggleBacklinksPanel,
      iconName: 'fas fa-hand-point-left',
      execute: async () => {
        if (!this.panel) throw new Error('no referrer panel');
        await joplin.settings.setValue('showPanel', !(await this.setting('showPanel')));
        this.panel.refresh();
      },
    });

    await joplin.views.toolbarButtons.create(
      'toggleBacklinksPanelToolbar',
      'toggleBacklinksPanel',
      ToolbarButtonLocation.NoteToolbar
    );
  };

  createBacklinksMenus = async () => {
    await joplin.views.menus.create('simpleBacklinksMenu', 'Simple backlinks', [
      {
        commandName: 'openBacklinksIgnoreList',
        accelerator: 'Ctrl+Alt+L',
      },
      {
        commandName: 'toggleNoteBacklinksIgnoreList',
        accelerator: 'Ctrl+Alt+I',
      },
    ]);
  };

  init = async (): Promise<void> => {
    await this.settings.init();
    await this.viewer.init();
    await this.panel.init();

    this.setting = this.settings.get;

    this.createBacklinksDialogs();
    this.registerInsertBacklinksHeadCmd();
    this.registerInsertBacklinksListCmd();
    this.registerOpenIgnoreListCmd();
    this.registerToggleIgnoreListCmd();
    this.registerToggleBacklinksPanelCmd();
    this.createBacklinksMenus();
  };
}
