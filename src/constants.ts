export const MARKDOWNIT_SCRIPT_ID: string = 'tuibyte.SimpleBacklinks.MarkdownIt';
export const LOCAL_STORE_SETTINGS_KEY: string = 'tuibyte.SimpleBacklinks.Settings';
export const SETTINGS_SECTION_NAME: string = 'tuibyte-simple-backlinks';
export const BACKLINKS_SCRIPT_EL: string = 'simple-backlinks-list';
export const BACKLINKS_LIST_RULE: string = 'simple_backlinks_list';
export const BACKLINKS_PANEL_EL: string = 'simple-backlinks-panel';
export const BACKLINKS_PANEL_ID: string = 'simple_backlinks_panel';
export const GET_BACKLINKS_CMD: string = 'getBacklinks';
export const GET_SETTING_CMD: string = 'getSetting';
export const SET_SETTING_CMD: string = 'setSetting';
export const OPEN_NOTE_CMD: string = 'openNote';
export enum BacklinksListPosition {
  Footer,
  Header,
  None,
}
export enum BacklinksListType {
  Ordered,
  Unordered,
  NewLine,
}
export enum BacklinksListParent {
  Full,
  Direct,
  None,
}
