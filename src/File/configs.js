import { defaultPalette } from '../js/getCustomTheme';
import Snippet from './Snippet';


export default new Map([
  ['options', {
    test: /^\.options$/i,
    multiple: false,
    defaultValue: {
      tabVisibility: false,
      darkness: false,
      lineWrapping: false,
      indentUnit4: false,
    },
    defaultName: '.options',
  }],
  ['palette', {
    test: /^\.palette$/i,
    multiple: false,
    defaultValue: defaultPalette,
    defaultName: '.palette',
  }],
  ['env', {
    test: /^\.env$/i,
    multiple: false,
    defaultValue: {
      DEBUG: [true, 'boolean', 'A flag means test mode'],
      TITLE: ['My App', 'string', 'A name of this app'],
    },
    defaultName: '.env',
  }],
  ['babelrc', {
    test: /^\.babelrc$/i,
    multiple: false,
    defaultValue: {
      presets: ['es2015'],
    },
    defaultName: '.babelrc',
  }],
  ['snippets', {
    test: /^snippets\//i,
    multiple: true,
    defaultValue: {},
    defaultName: 'snippets/snippet.json',
    bundle: (files) => {
      const snippets = files
        .map((file) => file.json)
        .reduce((p, c) => {
          Object.keys(c).forEach((scope) => {
            p[scope] = (p[scope] || []).concat(
              Object.keys(c[scope])
                .map((name) => Object.assign({ name }, c[scope][name]))
                .map((props) => new Snippet(props))
            );
          });
          return p;
        }, Object.create(null));
      Object.keys(snippets).forEach((scope) => {
        snippets[scope] = snippets[scope].sort(
          (a, b) =>
            a.prefix.toLowerCase() > b.prefix.toLowerCase() ? 1 : -1
        );
      });
      return snippets;
    },
  }]
]);
