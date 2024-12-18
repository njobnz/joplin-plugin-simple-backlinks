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
  setting__ignoreText: string;
  setting__ignoreText__description: string;
  setting__ignoreList: string;
  setting__ignoreList__description: string;

  message__noBacklinksHint: string;
  message__reloadPanel: string;
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
  setting__ignoreText: 'Ignore text',
  setting__ignoreText__description: 'Text to add to notes to ignore it from backlinks.',
  setting__ignoreList: 'Ignore list',
  setting__ignoreList__description: 'List of notes to ignore from backlinks.',

  message__noBacklinksHint: '\n\n*No backlinks found.*',
  message__reloadPanel: '# Simple Backlinks\n\nChange notes to reload this panel.',
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
