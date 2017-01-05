import React, { Component, PropTypes } from 'react';
import localforage from 'localforage';
import Dialog from 'material-ui/Dialog';
import {Tabs, Tab} from 'material-ui/Tabs';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import CircularProgress from 'material-ui/CircularProgress';
import { Card, CardHeader, CardActions } from 'material-ui/Card';
import ContentSave from 'material-ui/svg-icons/content/save';
import ContentAddCircle from 'material-ui/svg-icons/content/add-circle';
import ActionOpenInBrowser from 'material-ui/svg-icons/action/open-in-browser';
import ActionOpenInNew from 'material-ui/svg-icons/action/open-in-new';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import { lightBlue100, red100, brown50, red400 } from 'material-ui/styles/colors';


import { SourceFile } from '../File/';

const BundleTypes = [
  'embed',
  'divide',
  'cdn'
];

const KEY_APPS = 'apps';

const gen = (template, begin, array) => {
  for (let i = 0; i < array.length + 1; i++) {
    const name = template(begin + i);
    if (array.includes(name)) {
      continue;
    }
    return name;
  }
};

export default class CloneDialog extends Component {

  static propTypes = {
    resolve: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    files: PropTypes.array.isRequired,
    localization: PropTypes.object.isRequired,
    coreString: PropTypes.string,
    saveAs: PropTypes.func.isRequired,
    getConfig: PropTypes.func.isRequired,
  };

  state = {
    bundleType: BundleTypes[0],
    composedFiles: null,
    error: null,
    apps: null,
    processing: false,
  };

  get title() {
    return (this.props.getConfig('env').TITLE || [''])[0];
  }

  componentDidMount() {

    Promise.all(this.props.files.map((file) => file.compose()))
      .then((composedFiles) => this.setState({ composedFiles }));

    localforage.getItem(KEY_APPS)
      .then((apps) => apps || [])
      .then((apps) => this.setState({ apps }));

  }

  handleClone = () => {
    switch (this.state.bundleType) {
      case 'embed':
        this.props.saveAs(SourceFile.embed({
          TITLE: this.title,
          files: this.state.composedFiles,
          coreString: this.props.coreString,
        }))
          .then(() => this.props.onRequestClose());
        break;
      case 'divide':
        this.props.saveAs(SourceFile.divide({
          TITLE: this.title,
          files: this.state.composedFiles,
        }));
        break;
      case 'cdn':
        this.props.saveAs(SourceFile.cdn({
          TITLE: this.title,
          files: this.state.composedFiles,
        }))
          .then(() => this.props.onRequestClose());
        break;
    }
  };

  handleCloneLibrary = () => {
    this.props.saveAs(SourceFile.library({
      coreString: this.props.coreString,
    }));
  };

  handleCloneAll = () => {
    Promise.resolve()
      .then(() => this.props.saveAs(
        SourceFile.library({
          coreString: this.props.coreString,
        }),
        SourceFile.divide({
          TITLE: this.title,
          files: this.state.composedFiles,
        })
      ))
      .then(() => this.props.onRequestClose());
  };

  handleBundleTypeChange = (event, bundleType) => {
    this.setState({ bundleType });
  };

  handleCreate = () => {
    const titles = this.state.apps.map((item) => item.title);

    Promise.resolve()
      .then(() => localforage.keys())
      .then((keys) => this.handleSave({
        htmlKey: gen((n) => `app_${n}`, new Date().getTime(), keys),
        title: gen(this.props.localization.cloneDialog.defaultAppName, 1, titles),
        created: new Date().getTime(),
      }));

  };

  handleSave = (app) => {
    this.setState({ processing: true });

    const html = SourceFile.embed({
      TITLE: this.title,
      files: this.state.composedFiles,
      coreString: this.props.coreString,
    });

    app = Object.assign({}, app, {
      size: html.blob.size,
      updated: new Date().getTime(),
      CORE_VERSION,
      CORE_CDN_URL,
    });

    const apps = [app].concat(
      this.state.apps.filter((item) => item.htmlKey !== app.htmlKey)
    );

    return Promise.resolve()
      .then(() => localforage.setItem(app.htmlKey, html.blob))
      .then(() => localforage.setItem(KEY_APPS, apps))
      .then(() => this.setState({
        apps,
        processing: false,
      }))
      .catch((err) => {
        localforage.removeItem(htmlKey);
        throw err;
      })
      .catch((err) => {
        alert(this.props.localization.cloneDialog.failedToSave);
        this.setState({ processing: false });
        throw err;
      });

  };

  handleLoad = (app, openInNewTab) => {

  };

  handleRemove = (app) => {

  };

  renderAppCards(isSave) {
    if (
      !this.state.apps ||
      !this.state.composedFiles ||
      !this.props.coreString
    ) {
      return (
        <div style={{ textAlign: 'center' }}>
          <CircularProgress size={120} />
        </div>
      );
    }

    const {
      localization,
    } = this.props;

    const styles = {
      container: {
        margin: 16,
        padding: 8,
        paddingBottom: 16,
        maxHeight: '20rem',
        overflow: 'scroll',
        backgroundColor: brown50,
      },
      card: {
        marginTop: 16,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: isSave ? lightBlue100 : red100,
      },
      remove: {
        color: red400,
      },
    };

    return (
      <div style={styles.container}>
      {isSave ? (
        <RaisedButton fullWidth
          key={'new_app'}
          label={localization.cloneDialog.saveInNew}
          style={styles.card}
          icon={<ContentAddCircle />}
          disabled={this.state.processing}
          onTouchTap={this.handleCreate}
        />
      ) : null}
      {this.state.apps.map((app, i) => (
        <Card key={app.htmlKey} style={styles.card}>
          <CardHeader
            title={app.title}
            subtitle={new Date(app.updated).toLocaleString()}
          />
        {isSave ? (
          <CardActions>
            <FlatButton
              label={localization.cloneDialog.overwriteSave}
              icon={<ContentSave />}
              disabled={this.state.processing}
              onTouchTap={() => this.handleSave(app)}
            />
            <FlatButton
              label={localization.cloneDialog.remove}
              icon={<ActionDelete color={red400} />}
              labelStyle={styles.remove}
              disabled={this.state.processing}
              onTouchTap={() => this.handleRemove(app)}
            />
          </CardActions>
        ) : (
          <CardActions>
            <FlatButton
              label={localization.cloneDialog.openOnThisTab}
              icon={<ActionOpenInBrowser />}
              disabled={this.state.processing}
              onTouchTap={() => this.handleLoad(app, false)}
            />
            <FlatButton
              label={localization.cloneDialog.openInNewTab}
              icon={<ActionOpenInNew />}
              disabled={this.state.processing}
              onTouchTap={() => this.handleLoad(app, true)}
            />
          </CardActions>
        )}
        </Card>
      ))}
      </div>
    );
  }

  render() {
    const {
      onRequestClose,
      content,
      localization,
      coreString,
    } = this.props;
    const { bundleType, composedFiles } = this.state;

    const styles = {
      body: {
        padding: 0,
      },
      button: {
        marginLeft: 16,
      },
      header: {
        marginLeft: 24,
      },
      radio: {
        marginBottom: 16,
      },
      group: {
        padding: 24,
      },
      center: {
        textAlign: 'center',
      },
    };

    const actions =  [
      <FlatButton
        label={localization.cloneDialog.cancel}
        style={styles.button}
        onTouchTap={onRequestClose}
      />,
    ];

    return (
      <Dialog open
        bodyStyle={styles.body}
        actions={actions}
        onRequestClose={onRequestClose}
      >
        <Tabs>
          <Tab label={localization.cloneDialog.saveTitle}>
            <h1 style={styles.header}>{localization.cloneDialog.saveHeader}</h1>
            {this.renderAppCards(true)}
          </Tab>
          <Tab label={localization.cloneDialog.loadTitle}>
            <h1 style={styles.header}>{localization.cloneDialog.loadHeader}</h1>
            {this.renderAppCards(false)}
          </Tab>
          <Tab label={localization.cloneDialog.cloneTitle}>
            <h1 style={styles.header}>{localization.cloneDialog.cloneHeader}</h1>
            <RadioButtonGroup
              name="libType"
              valueSelected={bundleType}
              style={styles.group}
              onChange={this.handleBundleTypeChange}
            >
            {BundleTypes.map((type) => (
              <RadioButton
                key={type}
                value={type}
                label={localization.cloneDialog[type]}
                style={styles.radio}
              />
            ))}
            </RadioButtonGroup>,
          {bundleType === 'divide' ? (
            <div style={styles.center}>
              <RaisedButton primary
                label={localization.cloneDialog.saveHTML}
                disabled={!composedFiles}
                style={styles.button}
                onTouchTap={this.handleClone}
              />
              <RaisedButton primary
                label={localization.cloneDialog.saveLibrary}
                disabled={!coreString}
                style={styles.button}
                onTouchTap={this.handleCloneLibrary}
              />
              <RaisedButton primary
                label={localization.cloneDialog.saveAll}
                disabled={!coreString}
                style={styles.button}
                onTouchTap={this.handleCloneAll}
              />
            </div>
          ) : (
            <RaisedButton primary
              label={localization.cloneDialog.save}
              disabled={!composedFiles || !coreString}
              style={styles.button}
              onTouchTap={this.handleClone}
            />
          )}
          </Tab>
        </Tabs>
      </Dialog>
    );
  }
}
