import { BACKLINKS_SCRIPT_EL, BACKLINKS_LIST_RULE, BacklinksListPosition, GET_BACKLINKS_CMD } from '../../constants';
import { readSettings } from '../../utils/readSettings';

export default (context: any) => ({
  plugin: (markdownIt: any, _options: any): any => {
    const contentScriptId: string = context.contentScriptId;

    markdownIt.renderer.rules[BACKLINKS_LIST_RULE] = (_tokens, _idx, _options) => {
      const script = `
        const simpleBacklinksInit = () => {
          const findHeaderByName = (name, el) => {
            if (el && name && name !== '')
              for (const child of el.children)
                if (child.tagName.startsWith('H') && child.textContent.trim() == name)
                  return child;
            return null;
          };

          const element = document.getElementById('rendered-md');
          const heading = '${readSettings().listHeader.replace(/^#{1,6}\s+/gm, '')}';
          const header = findHeaderByName(heading, element);
          const message = {
            command: '${GET_BACKLINKS_CMD}',
            isFound: header ? true : false
          };

          webviewApi.postMessage('${contentScriptId}', message).then(result => {
            if (!element || result?.hide) return;

            const head = result?.head ?? '';
            const body = result?.body ?? '';

            if (header) {
              header.insertAdjacentHTML('afterend', body);
            } else {
              const location = Number(result?.position ?? 0);
              if (location == ${BacklinksListPosition.None}) return;
              const position = location == ${BacklinksListPosition.Header} ? 'afterbegin' : 'beforeend';
              element.insertAdjacentHTML(position, head + body);
            }
          });
        };

        simpleBacklinksInit();

        return false;
      `;

      // Append a full closing </style> tag to prevent corrupting other plugins.
      // https://github.com/joplin/plugin-bibtex/issues/30#issuecomment-1518667708
      return `<style id="${BACKLINKS_SCRIPT_EL}" onload="${script.replace(/\s+/g, ' ')}"></style>`;
    };

    markdownIt.core.ruler.push(BACKLINKS_LIST_RULE, (state: any) => {
      let token = new state.Token(BACKLINKS_LIST_RULE, '', 0);
      state.tokens.push(token);
    });
  },
});
