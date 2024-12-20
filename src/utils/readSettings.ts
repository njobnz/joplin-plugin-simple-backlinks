import { LOCAL_STORE_SETTINGS_KEY } from '../constants';
import { PluginSettings } from '../types';

/**
 * Read settings from localStorage.
 *
 * @returns {PluginSettings} Plugin settings object.
 */
export const readSettings = (): PluginSettings => JSON.parse(localStorage.getItem(LOCAL_STORE_SETTINGS_KEY));
