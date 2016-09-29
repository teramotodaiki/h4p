import React, {PropTypes, Component} from 'react';
import {FlatButton, DropDownMenu, MenuItem} from 'material-ui';
import PowerSettingsNew from 'material-ui/svg-icons/action/power-settings-new';
import FileDownload from 'material-ui/svg-icons/file/file-download';
import 'whatwg-fetch';

import { DialogTypes } from './FileDialog/';
import download from '../html/download';

export default class Menu extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    handleRun: PropTypes.func.isRequired,
    handleOpenDialog: PropTypes.func.isRequired,
    style: PropTypes.object,
  };

  handleDownload = () => {
    const { files, handleOpenDialog } = this.props;

    fetch(CORE_CDN_URL, { mode: 'cors' })
      .then(result => result.text())
      .then(h4pJs => {
        h4pJs = encodeURIComponent(h4pJs);
        const html = download({ EXPORT_VAR_NAME, CSS_PREFIX, files, h4pJs });
        const content = {
          name: 'download',
          ext: '.html',
          code: html,
        };
        handleOpenDialog(DialogTypes.Save, content);
      });
  };

  render() {
    const { handleRun } = this.props;

    const style = Object.assign({
      display: 'flex',
      flexDirection: 'row-reverse',
    }, this.props.style);

    return (
      <div style={style}>
        <FlatButton icon={<PowerSettingsNew />} onClick={handleRun} />
        <FlatButton icon={<FileDownload />} onClick={this.handleDownload} />
      </div>
    );
  }
}
