import { defaultPalette } from '../js/getCustomTheme';

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
  }],
  ['palette', {
    test: /^\.palette/i,
    multiple: false,
    defaultValue: defaultPalette,
  }],
  ['env', {
    test: /^\.env/i,
    multiple: false,
    defaultValue: {
      DEBUG: [true, 'boolean', 'A flag means test mode'],
      TITLE: ['My App', 'string', 'A name of this app'],
    },
  }],
  ['babelrc', {
    test: /^\.babelrc/i,
    multiple: false,
    defaultValue: {
      presets: ['es2015'],
    },
  }],
]);
