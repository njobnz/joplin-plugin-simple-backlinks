import {
  BacklinksListPosition,
  BACKLINKS_LIST_RULE,
  BACKLINKS_SCRIPT_EL,
  GET_BACKLINKS_CMD,
  GET_SETTING_CMD,
} from '../../constants';

export default (context: any) => ({
  plugin: (markdownIt: any, _options: any): any => {
    const contentScriptId: string = context.contentScriptId;

    markdownIt.renderer.rules[BACKLINKS_LIST_RULE] = (_tokens, _idx, _options) => {
      const script = `
        const simpleBacklinks = async () => {
          const findHeaderByName = (name, el) => {
            if (el && name && name !== '')
              for (const child of el.children)
                if (child.tagName.startsWith('H') && child.textContent.trim() == name)
                  return child;
            return null;
          };

          const header = (await webviewApi.postMessage('${contentScriptId}', { 
            command: '${GET_SETTING_CMD}', 
            name: 'listHeader' 
          })).replace(/^#{1,6}\\s+/gm, '');

          const content = document.getElementById('rendered-md');
          const heading = document.getElementById('backlinks-header') ?? findHeaderByName(header, content);
          const message = {
            command: '${GET_BACKLINKS_CMD}',
            isFound: !!heading
          };

          webviewApi.postMessage('${contentScriptId}', message).then(result => {
            if (!content || result?.hide) return;

            const head = result?.head ?? '';
            const body = result?.body ?? '';

            if (heading) {
              heading.insertAdjacentHTML('afterend', body);
            } else {
              const location = Number(result?.position ?? 0);
              if (location == ${BacklinksListPosition.None}) return;
              const position = location == ${BacklinksListPosition.Header} ? 'afterbegin' : 'beforeend';
              content.insertAdjacentHTML(position, head + body);
            }
          });
        };

        simpleBacklinks();

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
