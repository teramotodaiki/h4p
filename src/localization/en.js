export default {

  accept: ['en', 'en-us'],
  native: 'English',

  menu: {
    shutdown: 'Shutdown',
    popout: 'Pop-out Screen',
    language: 'Language',
    clone: 'Save / Load / Clone',
    aboutFeeles: 'About Feeles',
    deploy: 'Deploy This App',
  },
  cloneDialog: {
    saveTitle: 'Save',
    saveHeader: 'Save to the browser',
    loadTitle: 'Load',
    loadHeader: 'Load from the browser',
    cloneTitle: 'Clone',
    cloneHeader: 'Clone to the desktop',
    overwriteSave: 'Overwrite Save',
    saveInNew: 'Save in New Slot',
    remove: 'Remove',
    openOnThisTab: 'Open on This Tab',
    openInNewTab: 'Open in New Tab',
    created: 'Creation date and time',
    updated: 'Update date and time',
    size: 'Data size',
    embed: 'All in one HTML file',
    divide: 'Separate by HTML file and library',
    cdn: 'Get the library from the internet',
    save: 'Save',
    cancel: 'Cancel',
    saveHTML: 'Save Only HTML',
    saveLibrary: 'Save Only Library',
    saveAll: 'Save All',
    failedToSave: 'Failed to save this app.',
    failedToRemove: 'Failed to remove this app.',
    failedToOpenTab: 'Failed to open an app because new tab is blocked!!',
    failedToRename: 'Failed to rename this app.',
  },
  saveDialog: {
    title: 'You need to download it manually, because Your browser does not support HTML5!',
    description: (filename) => `Right click on the above link, click "download with alias", and save it with the name "${filename}"`,
    cancel: 'Cancel',
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
    subtitle: 'Please read this first',
    edit: 'Edit',
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
    title: 'Assets',
    subtitle: 'Drag and drop it to the code on the right',
    fileNotSelected: 'File not selected',
    readMore: 'Read more',
  },
  credit: {
    writeAuthorName: 'Write author name',
    credits: 'Credits',
    whoMade: (name) => `Who made the file "${name}"?`,
    website: 'Website URL (optional)',
  },
  common: {
    tapTwiceQuickly: 'Tap twice quickly',
    cannotBeUndone: 'This operation can not be undone',
  },
  editor: {
    undo: 'Undo',
    save: 'Save',
    play: 'Play',
    notice: 'This tab has not saved. Are you sure?',
  },
  env: {
    title: 'Environment Variables',
    subtitle: '',
    remove: 'Remove',
  },
  palette: {
    title: 'Color Palette',
    subtitle: `Let's change the color according to your mood`,
  },

};
