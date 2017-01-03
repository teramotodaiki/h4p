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
      indentUnit4: true,
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
  ['provider', {
    test: /^\.provider$/i,
    multiple: false,
    defaultValue: {
      publishUrl: '',
    },
    defaultName: '.provider',
  }],
  ['snippets', {
    test: /^snippets\/.*\.json$/i,
    multiple: true,
    defaultValue: {},
    defaultName: 'snippets/snippet.json',
    bundle: (files) => {
      const snippets = files
        .reduce((p, file) => {
          const { name, json } = file;
          Object.keys(json).forEach((scope) => {
            p[scope] = (p[scope] || []).concat(
              Object.keys(json[scope])
                .map((key) => new Snippet(
                  Object.assign({
                    name,
                    fileKey: file.key,
                  }, json[scope][key])
                ))
            );
          });
          return p;
        }, Object.create(null));
      const scopes = Object.keys(snippets);
      return (file) =>
        scopes.filter((scope) => file.is(scope))
          .map((scope) => snippets[scope])
          .reduce((p, c) => p.concat(c), []);
    },
  }]
]);
