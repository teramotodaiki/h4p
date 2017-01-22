import React, { PureComponent, PropTypes } from 'react';
import localforage from 'localforage';
import Dialog from 'material-ui/Dialog';
import {Tabs, Tab} from 'material-ui/Tabs';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import CircularProgress from 'material-ui/CircularProgress';
import { Card, CardHeader, CardActions, CardText } from 'material-ui/Card';
import ContentSave from 'material-ui/svg-icons/content/save';
import ContentAddCircle from 'material-ui/svg-icons/content/add-circle';
import ActionOpenInBrowser from 'material-ui/svg-icons/action/open-in-browser';
import ActionOpenInNew from 'material-ui/svg-icons/action/open-in-new';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import { lightBlue100, red100, brown50, red400 } from 'material-ui/styles/colors';


import { SourceFile } from '../File/';
import EditableLabel from '../jsx/EditableLabel';

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

export default class CloneDialog extends PureComponent {

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
    error: null,
    apps: null,
    processing: false,
  };

  componentDidMount() {

    localforage.getItem(KEY_APPS)
      .then((apps) => apps || [])
      .then((apps) => this.setState({ apps }));

  }

  handleClone = async () => {
    switch (this.state.bundleType) {
      case 'embed':

      await this.props.saveAs(
        await SourceFile.embed({
          getConfig: this.props.getConfig,
          files: this.props.files,
          coreString: this.props.coreString,
        })
      );
      this.props.onRequestClose();
      break;

      case 'divide':

      await this.props.saveAs(
        await SourceFile.divide({
          getConfig: this.props.getConfig,
          files: this.props.files,
        })
      );
      break;

      case 'cdn':

      await this.props.saveAs(
        await SourceFile.cdn({
          getConfig: this.props.getConfig,
          files: this.props.files,
        })
      );
      this.props.onRequestClose();
      break;
    }
  };

  handleCloneLibrary = () => {
    this.props.saveAs(SourceFile.library({
      coreString: this.props.coreString,
    }));
  };

  handleCloneAll = async () => {
    const divide = await SourceFile.divide({
      getConfig: this.props.getConfig,
      files: this.props.files,
    });
    const library = await SourceFile.library({
      coreString: this.props.coreString,
    });

    await this.props.saveAs(divide, library);

    this.props.onRequestClose();
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
        title: '',
        created: new Date().getTime(),
      }));

  };

  handleSave = async (app) => {
    this.setState({ processing: true });

    const html = await SourceFile.embed({
      getConfig: this.props.getConfig,
      files: this.props.files,
      coreString: this.props.coreString,
    });

    app = Object.assign({}, app, {
      size: html.blob.size,
      updated: new Date().getTime(),
      CORE_VERSION,
      CORE_CDN_URL,
    });

    const previous = this.state.apps.find((item) => item.htmlKey === app.htmlKey);
    const apps = previous ?
      this.state.apps.map((item) => item === previous ? app : item) :
      [app].concat(this.state.apps);

    try {

      await localforage.setItem(app.htmlKey, html.blob);
      await localforage.setItem(KEY_APPS, apps);

      this.setState({
        apps,
        processing: false,
      });

    } catch (e) {

      await localforage.removeItem(htmlKey);

      alert(this.props.localization.cloneDialog.failedToSave);
      this.setState({
        processing: false,
      });

    }

  };

  handleLoad = (app, openInNewTab) => {
    const tab = openInNewTab ? window.open('', '_blank') : null;
    if (openInNewTab && tab) {
      this.setState({ processing: true });
    }

    Promise.resolve()
      .then(() => localforage.getItem(app.htmlKey))
      .then((blob) => {
        if (openInNewTab) {
          if (!tab) {
            throw this.props.localization.cloneDialog.failedToOpenTab;
          }
          tab.location.href = URL.createObjectURL(blob);
          this.setState({ processing: false });
        } else {
          location.href = URL.createObjectURL(blob);
        }
      })
      .catch((err) => {
        alert(err.message);
        throw err;
      });

  };

  handleRemove = (app) => {
    if (!confirm(this.props.localization.common.cannotBeUndone)) {
      return;
    }
    this.setState({ processing: true });

    const apps = this.state.apps.filter((item) => item.htmlKey !== app.htmlKey);

    Promise.resolve()
      .then(() => localforage.removeItem(app.htmlKey))
      .then(() => localforage.setItem(KEY_APPS, apps))
      .then(() => this.setState({
        apps,
        processing: false,
      }))
      .catch((err) => {
        alert(this.props.localization.cloneDialog.failedToRemove);
        this.setState({ processing: false });
        throw err;
      });

  };

  handleTitleChange = (app, title) => {
    this.setState({ processing: true });

    const apps = this.state.apps
      .map((item) => {
        if (item.htmlKey === app.htmlKey) {
          return Object.assign({}, app, { title });
        }
        return item;
      });

    Promise.resolve()
      .then(() => localforage.setItem(KEY_APPS, apps))
      .then(() => this.setState({
        apps,
        processing: false,
      }))
      .catch((err) => {
        alert(this.props.localization.cloneDialog.failedToRename);
        this.setState({ processing: false });
        throw err;
      });

  };

  renderAppCards(isSave) {
    if (
      !this.state.apps ||
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
      label: {
        fontWeight: 600,
        marginRight: '1rem',
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
        <Card
          key={app.htmlKey}
          style={styles.card}
        >
          <CardHeader showExpandableButton
            title={(
              <EditableLabel id="title"
                defaultValue={app.title}
                tapTwiceQuickly={localization.common.tapTwiceQuickly}
                onEditEnd={(text) => this.handleTitleChange(app, text)}
              />
            )}
            subtitle={new Date(app.updated).toLocaleString()}
          />
          <CardText expandable>
            <div>
              <span style={styles.label}>{localization.cloneDialog.created}</span>
              {new Date(app.created).toLocaleString()}
            </div>
            <div>
              <span style={styles.label}>{localization.cloneDialog.updated}</span>
              {new Date(app.updated).toLocaleString()}
            </div>
            <div>
              <span style={styles.label}>{localization.cloneDialog.size}</span>
              {`${(app.size / 1024 / 1024).toFixed(2)}MB`}
            </div>
          </CardText>
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
    const { bundleType } = this.state;

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
        modal={this.state.processing}
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
              disabled={!coreString}
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
