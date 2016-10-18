import React, { Component, PropTypes } from 'react';
import { transparent } from 'material-ui/styles/colors';


import FileCard from './FileCard';
import {
  Types,
  CardHeight, BlankWidth, StepWidth, BorderWidth,
  labelColor, borderColor, backgroundColor, selectedColor,
} from './constants';

export default class DirCard extends Component {

  static propTypes = {
    dir: PropTypes.object.isRequired,
    isSelected: PropTypes.func.isRequired,
    isSelectedOne: PropTypes.func.isRequired,
    handleSelectFile: PropTypes.func.isRequired,
    isDirOpened: PropTypes.func.isRequired,
    handleDirToggle: PropTypes.func.isRequired,
    isRoot: PropTypes.bool,
  };

  static defaultProps = {
    isRoot: false
  };

  render() {
    const { isSelected, isSelectedOne, handleSelectFile, isDirOpened, handleDirToggle, isRoot } = this.props;
    const cd = this.props.dir;

    const transfer = { isSelected, isSelectedOne, handleSelectFile, isDirOpened, handleDirToggle };

    const dirStyle = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'space-around',
      boxSizing: 'border-box',
      height: isDirOpened(cd, 'auto', CardHeight),
      marginTop: BlankWidth,
      borderColor: borderColor,
      borderStyle: 'solid',
      borderTopWidth: BorderWidth,
      borderRightWidth: isDirOpened(cd, 0, BorderWidth),
      borderBottomWidth: BorderWidth,
      borderLeftWidth: BorderWidth,
      borderRadius: 2,
      borderTopRightRadius: isDirOpened(cd, 0, 2),
      borderBottomRightRadius: isDirOpened(cd, 0, 2),
      marginRight: isDirOpened(cd, 0, StepWidth),
      paddingBottom: isDirOpened(cd, BlankWidth, 0),
      paddingLeft: isDirOpened(cd, StepWidth, 0),
      backgroundColor: isDirOpened(cd, transparent, backgroundColor),
      transition: 'margin .2s ease, padding-bottom .2s ease, border .2s ease',
    };

    const closedStyle = {
      color: labelColor,
      paddingLeft: StepWidth,
    };

    const hierarchy =
      isDirOpened(cd, [].concat(
        isRoot ? null : <DirCloser key="closer" onTouchTap={() => handleDirToggle(cd)} />,
        cd.dirs.map(dir => <DirCard key={dir.path} dir={dir} {...transfer} />),
        cd.files.map(file =><FileCard key={file.key} file={file} {...transfer}  />)
      ),
      <div style={closedStyle} onTouchTap={() => handleDirToggle(cd)}>{cd.path}</div>
    );

    return (
      <div style={isRoot ? {} : dirStyle}>
      {hierarchy}
      </div>
    );
  }
}


export const DirCloser = (props) => {
  const style = {
    marginLeft: -StepWidth,
    backgroundColor: borderColor,
  };

  const backwordStyle = {
    paddingLeft: StepWidth,
    fontWeight: 'bold',
    color: labelColor,
  };

  return (
    <div style={style} onTouchTap={props.onTouchTap}>
      <span style={backwordStyle}>../</span>
    </div>
  )
};


/**
 * @param items Array of files
 * @param path A string of current path like 'sub/' (default='')
 * @param An object has hierarchy
 */
export const getHierarchy = (items, path = '') => {

  const files = [];
  const dirs = [];

  items
    .filter(item => item.name.indexOf(path) === 0)
    .forEach((item, i, all) => {
      const relativePath = item.name.replace(path, '');
      const slash = relativePath.indexOf('/');
      if (slash < 0) {
        // no slash
        files.push(item);
        return;
      }
      const subPath = path + relativePath.substr(0, slash + 1);
      if (dirs.every(dir => dir.path !== subPath)) {
        dirs.push(getHierarchy(all, subPath));
      }
    });

  return { files, dirs, path };
};
