import joplin from 'api';
import App from './plugins';

let gSimpleBacklinksApp: App = null;

joplin.plugins.register({
  onStart: async () => {
    gSimpleBacklinksApp = new App();
    await gSimpleBacklinksApp.init();
  },
});
