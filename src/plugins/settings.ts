import joplin from 'api';
import { SettingItem, SettingItemType, SettingStorage } from 'api/types';
import { PluginSettings } from '../types';
import localization from '../localization';
import {
  BacklinksListParent,
  BacklinksListPosition,
  BacklinksListType,
  LOCAL_STORE_SETTINGS_KEY,
  SETTINGS_SECTION_NAME,
} from '../constants';
import { readSettings } from '../utils/readSettings';
import App from '.';

/**
 * Plugin settings.
 */
export default class AppSettings {
  app: App = null;

  constructor(app: App) {
    if (!app) throw Error('app cannot be null');
    this.app = app;
  }

  specification: Record<keyof PluginSettings, SettingItem> = {
    listHeader: {
      public: true,
      section: SETTINGS_SECTION_NAME,
      storage: SettingStorage.File,
      label: localization.setting__listHeader,
      description: localization.setting__listHeader__description,
      type: SettingItemType.String,
      value: 'Backlinks',
    },

    listPosition: {
      public: true,
      section: SETTINGS_SECTION_NAME,
      storage: SettingStorage.File,
      label: localization.setting__listPosition,
      description: localization.setting__listPosition__description,
      type: SettingItemType.Int,
      value: BacklinksListPosition.Footer,
      isEnum: true,
      options: {
        [BacklinksListPosition.Footer]: 'Note Footer',
        [BacklinksListPosition.Header]: 'Note Header',
        [BacklinksListPosition.None]: 'None',
      },
    },

    listType: {
      public: true,
      section: SETTINGS_SECTION_NAME,
      storage: SettingStorage.File,
      label: localization.setting__listType,
      description: localization.setting__listType__description,
      type: SettingItemType.Int,
      value: BacklinksListType.Ordered,
      isEnum: true,
      options: {
        [BacklinksListType.Ordered]: 'Ordered List',
        [BacklinksListType.Unordered]: 'Unordered List',
        [BacklinksListType.NewLine]: 'Line Breaks',
      },
    },

    showParent: {
      public: true,
      section: SETTINGS_SECTION_NAME,
      storage: SettingStorage.File,
      label: localization.setting__showParents,
      description: localization.setting__showParents__description,
      type: SettingItemType.Int,
      value: BacklinksListParent.None,
      isEnum: true,
      options: {
        [BacklinksListParent.None]: 'None',
        [BacklinksListParent.Direct]: 'Direct Parent',
        [BacklinksListParent.Full]: 'Full Path',
      },
    },

    hideEmpty: {
      public: true,
      section: SETTINGS_SECTION_NAME,
      storage: SettingStorage.File,
      label: localization.setting__hideEmpty,
      description: localization.setting__hideEmpty__description,
      type: SettingItemType.Bool,
      value: true,
    },

    showHint: {
      public: true,
      section: SETTINGS_SECTION_NAME,
      storage: SettingStorage.File,
      label: localization.setting__showHint,
      description: localization.setting__showHint__description,
      type: SettingItemType.Bool,
      value: true,
    },

    showPanel: {
      public: true,
      section: SETTINGS_SECTION_NAME,
      storage: SettingStorage.File,
      label: localization.setting__showPanel,
      description: localization.setting__showPanel__description,
      type: SettingItemType.Bool,
      value: false,
    },

    showIcon: {
      public: true,
      section: SETTINGS_SECTION_NAME,
      storage: SettingStorage.File,
      label: localization.setting__showIcon,
      description: localization.setting__showIcon__description,
      type: SettingItemType.Bool,
      value: true,
    },

    manualText: {
      public: true,
      section: SETTINGS_SECTION_NAME,
      storage: SettingStorage.File,
      label: localization.setting__manualText,
      description: localization.setting__manualText__description,
      type: SettingItemType.String,
      value: '<!-- backlinks-manual -->',
      advanced: true,
    },

    ignoreText: {
      public: true,
      section: SETTINGS_SECTION_NAME,
      storage: SettingStorage.File,
      label: localization.setting__ignoreText,
      description: localization.setting__ignoreText__description,
      type: SettingItemType.String,
      value: '<!-- backlinks-ignore -->',
      advanced: true,
    },

    ignoreList: {
      public: false,
      section: SETTINGS_SECTION_NAME,
      storage: SettingStorage.File,
      label: localization.setting__ignoreList,
      description: localization.setting__ignoreList__description,
      type: SettingItemType.Array,
      value: [],
    },
  };

  /**
   * Get a setting from Joplin API.
   *
   * @returns {Promise<any>} The setting value.
   */
  get = async (name: string, fallback: any = null): Promise<any> => {
    try {
      return (await joplin.settings.values(name))[name];
    } catch (e) {
      return fallback;
    }
  };

  /**
   * Set a setting using Joplin API.
   *
   * @returns {Promise<any>} The setting value.
   */
  set = async (name: string, value: any): Promise<void> => await joplin.settings.setValue(name, value);

  /**
   * Read settings from localStorage.
   *
   * @returns {PluginSettings} Plugin settings object.
   */
  read = readSettings;

  /**
   * Fetches plugin settings from Joplin's API and saves them in localStorage.
   * Makes settings easily accessible in non-async functions.
   *
   * This function is triggered whenever settings are changed.
   */
  save = async () => {
    const settings = {};
    for (const setting in this.specification) {
      let value: any = (await joplin.settings.values(setting))[setting];
      settings[setting] = value;
    }
    localStorage.setItem(LOCAL_STORE_SETTINGS_KEY, JSON.stringify(settings));
  };

  init = async () => {
    await joplin.settings.registerSection(SETTINGS_SECTION_NAME, {
      label: localization.settings__appName,
      description: localization.settings__description,
      iconName: 'fas fa-hand-point-left',
    });
    await joplin.settings.registerSettings(this.specification);
    await joplin.settings.onChange(this.save);
    await this.save();
  };
}
