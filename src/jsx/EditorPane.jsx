import React, { PropTypes, Component } from 'react';
import CodeMirror from 'react-codemirror';
import { Tabs, Tab } from 'material-ui';
import PlayCircleOutline from 'material-ui/svg-icons/av/play-circle-outline';

require('codemirror/mode/javascript/javascript');
require('codemirror/addon/hint/show-hint');
require('codemirror/addon/edit/closebrackets');
require('codemirror/addon/edit/matchbrackets');
require('../js/codemirror-hint-extension');

require('codemirror/lib/codemirror.css');
require('codemirror/addon/hint/show-hint.css');


import EditorMenu from './EditorMenu';

const PANE_CONTENT_CONTAINER = 'PANE_CONTENT_CONTAINER'; // classname

export default class EditorPane extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    updateFile: PropTypes.func.isRequired,
    handleSelectFile: PropTypes.func.isRequired,
    selectedFile: PropTypes.object,
    onTabContextMenu: PropTypes.func.isRequired,
    editorOptions: PropTypes.object.isRequired,
    handleEditorOptionChange: PropTypes.func.isRequired,
    handleOpenDialog: PropTypes.func.isRequired,
    style: PropTypes.object
  };

  componentDidMount() {
    window.addEventListener('resize', this.setEnoughHeight);
  }

  componentWillUnmount() {
    window.addEventListener('resize', this.setEnoughHeight);
  }

  componentWillReceiveProps(nextProps) {
    const { style, files } = this.props;
    if (style !== nextProps.style) {
      this.setEnoughHeight();
    }
    if (files !== nextProps.files) {
      files
        .filter(file => nextProps.files.every(next => file.key !== next.key))
        .map(file => this.removeCodemirror(file.key));
    }
  }

  setEnoughHeight = () => {
    this.codemirrorInstances.forEach(cm => {
      cm.setSize(this.getStyle().width, this.getStyle().height);
    });
  };

  codemirrorInstances = [];
  handleCodemirror (ref, key) {
    if (!ref || this.hasCodemirror(key)) return;
    const cm = ref.getCodeMirror();
    cm.key = key;
    this.showHint(cm);
    this.codemirrorInstances = this.codemirrorInstances.concat(cm);
    this.setEnoughHeight();
  }

  removeCodemirror (key) {
    this.codemirrorInstances =
      this.codemirrorInstances.filter(cm => cm.key !== key);
  }

  hasCodemirror (key) {
    return this.codemirrorInstances.some(cm => cm.key === key);
  }

  showHint(cm) {
    cm.on('change', (_cm, change) => {
      if (change.origin === 'setValue') return;
      const token = cm.getTokenAt(cm.getCursor());
      if (token.type !== null) {
        cm.showHint({ completeSingle: false });
      }
    });
  }

  getStyle() {
    if (!this.style) {
      const ref = document.querySelector('.' + PANE_CONTENT_CONTAINER);
      if (!ref) return { width: '100%', height: 300 };
      this.style = ref.currentStyle || document.defaultView.getComputedStyle(ref);
    }
    return this.style;
  }

  handleContextMenu(event, file) {
    event.preventDefault();
    const { clientX, clientY } = event.nativeEvent;
    this.props.onTabContextMenu({ file, event: { absX: clientX, absY: clientY } });
  }

  render() {
    const {
      files,
      updateFile,
      handleSelectFile,
      selectedFile,
      editorOptions,
      handleEditorOptionChange,
      handleOpenDialog,
    } = this.props;

    const options = Object.assign({
      lineNumbers: true,
      mode: 'javascript',
      indentUnit: 4,
      indentWithTabs: true,
      matchBrackets: true,
      autoCloseBrackets: true,
    }, editorOptions);

    const style = Object.assign({
      display: 'flex',
      flexDirection: 'column',
    }, this.props.style);

    const menuStyle = {
      flex: '0 0 auto',
    };

    const tabsStyle = {
      display: 'flex',
      flexDirection: 'column',
      flex: '1 1 auto',
    };

    const tabLabels = files.map(file => file.isEntryPoint ? (
      <span>
        <PlayCircleOutline color="white" style={{ position: 'absolute', marginLeft: '-1rem', marginTop: -4 }} />
          <span style={{ marginLeft: '1rem' }}>
            {file.name}
          </span>
      </span>
    ) : file.name);

    return (
    <div style={style}>
      <EditorMenu
        editorOptions={editorOptions}
        handleEditorOptionChange={handleEditorOptionChange}
        handleOpenDialog={handleOpenDialog}
        style={menuStyle}
      />
      <Tabs
        style={tabsStyle}
        tabItemContainerStyle={{ flex: '0 0 auto' }}
        contentContainerStyle={{ flex: '1 1 auto' }}
        contentContainerClassName={PANE_CONTENT_CONTAINER}
        onChange={this.handleSelectFile}
        value={selectedFile}
      >
      {files.map((file, index) => (
        <Tab
          key={file.key}
          value={file}
          label={tabLabels[index]}
          style={{ textTransform: 'none' }}
          onContextMenu={(e) => this.handleContextMenu(e, file)}
        >
          <CodeMirror
            className={options.tabVisibility ? 'ReactCodeMirror__tab-visible' : ''}
            ref={(cm) => this.handleCodemirror(cm, file.key)}
            value={file.code}
            onChange={(code) => updateFile(file, { code })}
            options={options}
          />
        </Tab>
      ))}
      </Tabs>
    </div>
    );
  }
}
