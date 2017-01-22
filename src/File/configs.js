import { defaultPalette } from '../js/getCustomTheme';
import { Snippet } from '../SnippetPane/';


export default new Map([
  ['codemirror', {
    test: /^feeles\/codemirror\.json$/i,
    multiple: false,
    defaultValue: {
    	lineNumbers: true,
    	indentUnit: 4,
    	indentWithTabs: true,
    	matchBrackets: true,
    	autoCloseBrackets: true,
    	keyMap: 'sublime',
    	scrollbarStyle: 'simple',
    	foldGutter: true,
    	foldOptions: {
    		widget: '✧⟣❃⟢✧',
    		minFoldSize: 1,
    		scanUp: false
    	},
    },
    defaultName: 'feeles/codemirror.json',
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
      MODULE: [true, 'boolean', 'A flag to use module bundler'],
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
  ['ogp', {
    test: /^feeles\/ogp\.json$/i,
    multiple: false,
    defaultValue: {
      'og:title': 'My App',
    },
    defaultName: 'feeles/ogp.json',
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
