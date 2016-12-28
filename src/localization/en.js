export default {

  accept: ['en', 'en-us'],
  native: 'English',

  menu: {
    shutdown: 'Shutdown',
    popout: 'Pop-out Screen',
    palette: 'Palette',
    env: 'Configure env',
    language: 'Language',
    download: 'Download',
    aboutFeeles: 'About Feeles',
    deploy: 'Deploy This App',
  },
  downloadDialog: {
    title: 'Chose download type',
    sourceOnly: 'Source Only',
    bundleAll: 'Bundle All',
    libraryType: 'Library Type',
    hostingOnCdn: 'Hosting in CDN',
    embedInHtml: 'Embed in HTML',
    requirement: 'Requirement',
    needInternet: 'Need internet',
    maybeNothing: 'Maybe nothing',
    fileSize: 'File Size',
    download: 'Download'
  },
  envDialog: {
    title: 'Configure Environment Variables',
  },
  paletteDialog: {
    title: 'Color Palette',
  },
  aboutDialog: {
    title: 'About Feeles',
    coreVersion: 'Core Version',
    changeVersion: 'Change Version',
    change: 'Change',
  },
  editorMenu: {
    lineWrapping: 'Line Wrapping',
    tabVisibility: 'Tab Visibility',
    darkness: 'Darkness',
    indentUnit4: '4 spaces indent',
  },
  readme: {
    text: `# Introduction
This is an application can do... ← You can write here
## How to edit this
1. First open [Getting Started](README.md)
2. Next change the letters
3. Take a tab \`README\`
## Advanced
If you have ordinary letters, **such things** or *like this* let's try it
\`\`\`
\/\/ How, you can code here!
alert('Hi!');
\`\`\`
> It seems to say \`Markdown\` how to write such a symbol. ~~Strange!~~
- - -
Thanks
- When making this application,
- If someone help you,
- Write down his/her name here.
`,
  },
  shot: {
    shoot: 'After rewriting, send the code',
    restore: 'Restore',
  },
  hierarchy: {
    emptyTrashBox: 'Empty trash',
  },
  snippet: {
    readMore: 'Read more',
  },
  credit: {
    writeAuthorName: 'Write author name',
    credits: 'Credits',
    whoMade: (name) => `Who made the file "${name}"?`,
    website: 'Website URL (optional)',
  },

};
