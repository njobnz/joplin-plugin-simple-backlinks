interface AppLocalization {
  settings__appName: string;
  settings__description: string;

  setting__listHeader: string;
  setting__listHeader__description: string;
  setting__listPosition: string;
  setting__listPosition__description: string;
  setting__listType: string;
  setting__listType__description: string;
  setting__showParents: string;
  setting__showParents__description: string;
  setting__hideEmpty: string;
  setting__hideEmpty__description: string;
  setting__showHint: string;
  setting__showHint__description: string;
  setting__showPanel: string;
  setting__showPanel__description: string;
  setting__showIcon: string;
  setting__showIcon__description: string;
  setting__manualText: string;
  setting__manualText__description: string;
  setting__ignoreText: string;
  setting__ignoreText__description: string;
  setting__ignoreList: string;
  setting__ignoreList__description: string;

  command_importBacklinksIgnoreList: string;
  command_insertBacklinksHeader: string;
  command_insertBacklinksList: string;
  command_toggleNoteBacklinksIgnoreList: string;
  command_openBacklinksIgnoreList: string;
  command_pruneBacklinksIgnoreList: string;
  command_toggleBacklinksPanel: string;

  message__noteIgnoreListAdded: string;
  message__noteIgnoreListRemoved: string;
  message__ignoreListNotesPruned: string;
  message__ignoreListNoNotesPruned: string;
  message__importIgnoreListSuccess: string;
  message__importIgnoreListFailure: string;
  message__importIgnoreListNotFound: string;
  message__pruneIgnoreList: string;
  message__noBacklinksHint: string;
  message__reloadPanel: string;

  dialog_ignoreList_title: string;
  dialog_ignoreList_empty: string;
  dialog_ignoreList_open: string;
  dialog_ignoreList_close: string;

  menu_simpleBacklinks: string;
}

const defaultStrings: AppLocalization = {
  settings__appName: 'Simple Backlinks',
  settings__description: '',

  setting__listHeader: 'Backlinks header',
  setting__listHeader__description: 'Text to display as the header of the backlinks block.',
  setting__listPosition: 'Backlinks location',
  setting__listPosition__description: 'Location to display the automatic backlinks block.',
  setting__listType: 'List style',
  setting__listType__description: 'Display list using line breaks or as an ordered or unordered list.',
  setting__showParents: 'Show notebooks',
  setting__showParents__description: 'Prepend the notebook path to backlink titles.',
  setting__hideEmpty: 'Hide empty',
  setting__hideEmpty__description: 'Hide backlinks section if there are no backlinks.',
  setting__showHint: 'Display hint',
  setting__showHint__description: 'Display empty list hint.',
  setting__showPanel: 'Display panel',
  setting__showPanel__description: 'Display backlinks in a seperate panel.',
  setting__showIcon: 'Joplin icon',
  setting__showIcon__description: 'Display the internal Joplin link icon on backlinks.',
  setting__manualText: 'Manual text',
  setting__manualText__description: 'Text to add to notes to disable automatic backlinks.',
  setting__ignoreText: 'Ignore text',
  setting__ignoreText__description: 'Text to add to notes to ignore them from backlinks.',
  setting__ignoreList: 'Ignore list',
  setting__ignoreList__description: 'List of notes to ignore from backlinks.',

  command_importBacklinksIgnoreList: 'Import existing backlinks ignore list into Simple Backlinks',
  command_insertBacklinksHeader: 'Insert backlinks header',
  command_insertBacklinksList: 'Insert backlinks list',
  command_toggleNoteBacklinksIgnoreList: 'Add or remove note from ignore list',
  command_openBacklinksIgnoreList: 'Open backlinks ignore list',
  command_pruneBacklinksIgnoreList: 'Prune backlinks ignore list',
  command_toggleBacklinksPanel: 'Show/hide backlinks panel',

  message__noteIgnoreListAdded: 'Note added to backlinks ignore list',
  message__noteIgnoreListRemoved: 'Note removed from backlinks ignore list',
  message__ignoreListNotesPruned: 'note(s) pruned from ignore list',
  message__ignoreListNoNotesPruned: 'No deleted notes to prune from ignore list',
  message__importIgnoreListSuccess: 'Successfully imported existing backlinks ignore list into Simple Backlinks',
  message__importIgnoreListFailure: 'Failed to import existing backlinks ignore list into Simple Backlinks',
  message__importIgnoreListNotFound: 'An existing backlinks ignore list was not found',
  message__pruneIgnoreList: 'Prune permanently deleted notes from ignore list?',
  message__noBacklinksHint: '*No backlinks found.*',
  message__reloadPanel: '# Simple Backlinks\n\nSelect a note to load this panel.',

  dialog_ignoreList_title: 'Backlinks Ignore List',
  dialog_ignoreList_empty: 'List is empty',
  dialog_ignoreList_open: 'Open',
  dialog_ignoreList_close: 'Close',

  menu_simpleBacklinks: 'Simple backlinks',
};

const localizations: Record<string, AppLocalization> = {
  en: defaultStrings,

  es: {
    ...defaultStrings,
  },
};

let localization: AppLocalization | undefined;

const languages = [...navigator.languages];
for (const language of navigator.languages) {
  const localeSep = language.indexOf('-');

  if (localeSep !== -1) {
    languages.push(language.substring(0, localeSep));
  }
}

for (const locale of languages) {
  if (locale in localizations) {
    localization = localizations[locale];
    break;
  }
}

if (!localization) {
  console.log('No supported localization found. Falling back to default.');
  localization = defaultStrings;
}

export default localization!;
