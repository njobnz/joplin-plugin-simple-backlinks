import joplin from 'api';
import { ViewHandle } from 'api/types';
import { BACKLINKS_PANEL_EL, BACKLINKS_PANEL_ID } from '../../constants';
import localization from '../../localization';
import App from '..';

export default class BacklinksView {
  app: App = null;
  panel: ViewHandle = null;
  setting: Function = null;

  constructor(app: App) {
    if (!app) throw Error('app cannot be null');
    this.app = app;
  }

  build = async (): Promise<void> => {
    if (!this.app && this.panel) return;
    this.panel = await joplin.views.panels.create(BACKLINKS_PANEL_ID);
    const html = this.app.renderer.render(localization.message__reloadPanel);
    await joplin.views.panels.setHtml(this.panel, `<div id="${BACKLINKS_PANEL_EL}">${html}</div>`);
    await joplin.views.panels.addScript(this.panel, './plugins/backlinks/assets/panel.css');
    await joplin.views.panels.addScript(this.panel, './plugins/backlinks/assets/panel.js');
    await joplin.views.panels.onMessage(this.panel, this.app.onMessageHandler);
    await joplin.views.panels.show(this.panel);
  };

  refresh = async (): Promise<void> => {
    if (!this.app) return;

    if ((await this.setting('showPanel')) as boolean) {
      if (!this.panel) await this.build();
      else await joplin.views.panels.show(this.panel);

      if (this.panel) {
        const backlinks = await this.app.getBacklinksList(true, true);
        backlinks.head = backlinks.head.replace(/<\/?h[1-6]\b/g, match => (match[1] === '/' ? '</h1' : '<h1'));

        const text = `${backlinks.head}${backlinks.body}`;
        const html = text !== '' ? text : this.app.renderer.render(localization.message__reloadPanel);
        const body = `<div id="${BACKLINKS_PANEL_EL}">${html}</div>`;

        await joplin.views.panels.setHtml(this.panel, body);
      } else console.error('Failed to initialize backlinks panel.');
    } else if (this.panel) await joplin.views.panels.hide(this.panel);
  };

  init = async (): Promise<void> => {
    this.setting = this.app.settings.get;
    await joplin.settings.onChange(this.refresh);
    await joplin.workspace.onNoteSelectionChange(this.refresh);
  };
}
