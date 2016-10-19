import React, { PropTypes, Component } from 'react';
import ReactCodeMirror from 'react-codemirror';
import { FloatingActionButton } from 'material-ui';
import ContentAdd from 'material-ui/svg-icons/content/add';
import { darkWhite, faintBlack, darkBlack } from 'material-ui/styles/colors';


import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/hint/show-hint.css';


import '../js/codemirror-hint-extension';
import EditorMenu from './EditorMenu';
import { DialogTypes } from './FileDialog/';
import ChromeTabs from './ChromeTabs';
import Preview from './Preview';
import { makeFromType } from '../js/files';

const TAB_CONTENT_CONTAINER = CSS_PREFIX + 'tab_content';
const CODEMIRROR_HINT_CONTAINER = 'CodeMirror-hint_container';

export default class EditorPane extends Component {

  static propTypes = {
    selectedFile: PropTypes.object,
    tabbedFiles: PropTypes.array.isRequired,
    addFile: PropTypes.func.isRequired,
    updateFile: PropTypes.func.isRequired,
    selectFile: PropTypes.func.isRequired,
    handleRun: PropTypes.func.isRequired,
    onTabContextMenu: PropTypes.func.isRequired,
    editorOptions: PropTypes.object.isRequired,
    handleEditorOptionChange: PropTypes.func.isRequired,
    openFileDialog: PropTypes.func.isRequired,
  };

  componentDidMount() {
    window.addEventListener('resize', this.setEnoughHeight);
  }

  componentWillUnmount() {
    window.addEventListener('resize', this.setEnoughHeight);
  }

  componentWillReceiveProps(nextProps) {
    const { style, tabbedFiles } = this.props;
    // Optimize styles when size changed
    if (style !== nextProps.style) {
      this.setEnoughHeight();
    }
    // Destruct codemirror instance
    if (tabbedFiles !== nextProps.tabbedFiles) {
      tabbedFiles
        .filter(file => nextProps.tabbedFiles.every(next => file.key !== next.key))
        .map(file => this.removeCodemirror(file.key));
    }
  }

  setEnoughHeight = () => {
    this.codemirrorInstances.forEach(cm => {
      cm.setSize(this.getStyle().width, this.getStyle().height);
    });
  };

  codemirrorInstances = [];
  handleCodemirror (ref, file) {
    if (!ref || this.hasCodemirror(file.key)) return;
    const cm = ref.getCodeMirror();
    cm.key = file.key;
    cm.setValue(file.text);
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
      if (change.origin === 'setValue' || change.origin === 'complete') return;
      const token = cm.getTokenAt(cm.getCursor());
      if (/\S/.test(token.string)) {
        cm.showHint({ completeSingle: false, container: this.hints });
      }
    });
  }

  getStyle() {
    if (!this.style) {
      const ref = document.querySelector('.' + TAB_CONTENT_CONTAINER);
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

  handleAdd = () => {
    const { openFileDialog, addFile } = this.props;
    openFileDialog(DialogTypes.Add)
      .then(seed => makeFromType('text/javascript', seed))
      .then(file => addFile(file));
  };

  render() {
    const {
      selectedFile, tabbedFiles,
      updateFile, selectFile, closeTab,
      handleRun,
      editorOptions,
      handleEditorOptionChange,
      openFileDialog,
    } = this.props;

    const options = (file) => Object.assign({
      lineNumbers: true,
      mode: 'javascript',
      indentUnit: 4,
      indentWithTabs: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      readOnly: file.options.isReadOnly,
    }, editorOptions);

    const style = Object.assign({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      overflow: 'hidden',
    }, this.props.style);

    const addButtonStyle = {
      position: 'absolute',
      right: 23,
      bottom: 23,
    };

    const tabStyle = (file) => ({
      width: '100%',
      height: '100%',
      position: 'absolute',
      visibility: file === selectedFile ? 'visible' : 'hidden',
    });

    return (
    <div style={style}>
      <EditorMenu
        editorOptions={editorOptions}
        handleEditorOptionChange={handleEditorOptionChange}
      />
      <ChromeTabs
        selectedFile={selectedFile}
        tabbedFiles={tabbedFiles}
        handleSelect={selectFile}
        handleClose={closeTab}
        handleRun={handleRun}
      />
      <div className={TAB_CONTENT_CONTAINER} style={{ flex: '1 1 auto' }}>
      {tabbedFiles.map(file => (
        <div key={file.key} style={tabStyle(file)}>
        {file.isText ? (
          <ReactCodeMirror
            className={options.tabVisibility ? 'ReactCodeMirror__tab-visible' : ''}
            ref={(cm) => this.handleCodemirror(cm, file)}
            value={file.text}
            onChange={(text) => updateFile(file, { text })}
            options={options(file)}
          />
        ) : (
          <Preview file={file} />
        )}
        </div>
      ))}
      </div>
      <div className={CODEMIRROR_HINT_CONTAINER} ref={(div) => this.hints = div}></div>
      <FloatingActionButton
        style={addButtonStyle}
        onClick={this.handleAdd}
      >
        <ContentAdd />
      </FloatingActionButton>
    </div>
    );
  }
}
