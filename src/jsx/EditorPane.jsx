import React, { PropTypes, Component } from 'react';
import ReactCodeMirror from 'react-codemirror';
import { Tabs, Tab, FloatingActionButton } from 'material-ui';
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
import TabLabel from './TabLabel';
import Preview from './Preview';
import { makeFromType } from '../js/files';

const PANE_CONTENT_CONTAINER = 'PANE_CONTENT_CONTAINER';
const CODEMIRROR_HINT_CONTAINER = 'CodeMirror-hint_container';

export default class EditorPane extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    addFile: PropTypes.func.isRequired,
    updateFile: PropTypes.func.isRequired,
    selectFile: PropTypes.func.isRequired,
    selectedFile: PropTypes.object,
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
    const { style, files } = this.props;
    // Optimize styles when size changed
    if (style !== nextProps.style) {
      this.setEnoughHeight();
    }
    // Destruct codemirror instance
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

  handleAdd = () => {
    const { openFileDialog, addFile } = this.props;
    openFileDialog(DialogTypes.Add)
      .then(seed => makeFromType('text/javascript', seed))
      .then(file => addFile(file));
  };

  handleClose = (file) => {
    const { updateFile, selectFile, selectedFile, files } = this.props;

    const nextSelect = files.find((item) => item !== file);
    const options = Object.assign({}, file.options, { isOpened: false });
    updateFile(file, { options })
      .then(() => nextSelect && selectFile(nextSelect));
  };

  render() {
    const {
      files,
      updateFile,
      selectFile,
      selectedFile,
      handleRun,
      editorOptions,
      handleEditorOptionChange,
      openFileDialog,
    } = this.props;

    const options = Object.assign({
      lineNumbers: true,
      mode: 'javascript',
      indentUnit: 4,
      indentWithTabs: true,
      matchBrackets: true,
      autoCloseBrackets: true,
    }, editorOptions);

    const readOnlyOptions = Object.assign({}, options, {
      readOnly: true,
    });

    const style = Object.assign({
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
    }, this.props.style);

    const tabsStyle = {
      borderBottomColor: darkWhite,
    };

    const tabStyle = {
      borderBottomColor: faintBlack,
      color: darkBlack,
      zIndex: 1,
    };

    const tabActiveStyle = {
      borderBottomColor: darkWhite,
      color: darkBlack,
      zIndex: 2,
    };

    const addButtonStyle = {
      position: 'absolute',
      right: 23,
      bottom: 23,
    };


    return (
    <div style={style}>
      <EditorMenu
        editorOptions={editorOptions}
        handleEditorOptionChange={handleEditorOptionChange}
      />
      <Tabs
        style={tabsStyle}
        className={CSS_PREFIX + 'tab_container'}
        tabItemContainerStyle={{ flex: '0 0 auto' }}
        contentContainerStyle={{ flex: '1 1 auto' }}
        contentContainerClassName={PANE_CONTENT_CONTAINER}
        onChange={selectFile}
        value={selectedFile}
        inkBarStyle={{ display: 'none' }}
      >
      {files.map((file, index) => (
        <Tab
          key={file.key}
          value={file}
          label={<TabLabel handleRun={handleRun} handleClose={this.handleClose} file={file} />}
          onContextMenu={(e) => this.handleContextMenu(e, file)}
          className={CSS_PREFIX + 'tab'}
          style={selectedFile === file ? tabActiveStyle : tabStyle}
        >
        {file.isText ? (
          <ReactCodeMirror
            className={options.tabVisibility ? 'ReactCodeMirror__tab-visible' : ''}
            ref={(cm) => this.handleCodemirror(cm, file)}
            value={file.text}
            onChange={(text) => updateFile(file, { text })}
            options={file.options.isReadOnly ? readOnlyOptions: options}
          />
        ) : (
          <Preview containerStyle={this.style} file={file} />
        )}
        </Tab>
      ))}
      </Tabs>
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
