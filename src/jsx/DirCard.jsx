import React, { Component, PropTypes } from 'react';
import { Paper } from 'material-ui';
import { white, lightWhite, faintBlack, lightBlack, darkBlack, transparent } from 'material-ui/styles/colors';


const StepWidth = 14;
const BorderWidth = 4;
const CardHeight = 40;
const BlankWidth = 12;

const backwordColor = white;
const linkColor = white;
const labelColor = darkBlack;
const dirColor = lightBlack;


const DIR = CSS_PREFIX + 'hierarchy_dir';
const DIR_OPEN = CSS_PREFIX + 'hierarchy_dir-open';
const FILE = CSS_PREFIX + 'hierarchy_file';
const FILE_ACTIVE = CSS_PREFIX + 'hierarchy_file-active';

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
      marginLeft: StepWidth,
      borderColor: dirColor,
      borderStyle: 'solid',
      borderTopWidth: isDirOpened(cd, BorderWidth, 0),
      borderRightWidth: 0,
      borderBottomWidth: isDirOpened(cd, BorderWidth, 0),
      borderLeftWidth: isDirOpened(cd, BorderWidth, 0),
      borderRadius: 2,
      borderTopRightRadius: isDirOpened(cd, 0, 2),
      borderBottomRightRadius: isDirOpened(cd, 0, 2),
      marginRight: isDirOpened(cd, 0, StepWidth),
      paddingBottom: isDirOpened(cd, BlankWidth, 0),
      backgroundColor: isDirOpened(cd, transparent, dirColor),
      transition: 'margin .2s ease, padding .2s ease-in',
    };

    const closedStyle = {
      color: linkColor,
      paddingLeft: StepWidth,
    };

    const hierarchy =
      isDirOpened(cd, [].concat(
        isRoot ? null : <Closer key="closer" path={cd.path} onTouchTap={() => handleDirToggle(cd)} />,
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

export class FileCard extends Component {

  static propTypes = {
    file: PropTypes.object.isRequired,
    isSelected: PropTypes.func.isRequired,
    isSelectedOne: PropTypes.func.isRequired,
    handleSelectFile: PropTypes.func.isRequired,
  };

  render() {
    const { file, isSelected, isSelectedOne, handleSelectFile } = this.props;

    const style = (file) => Object.assign({
      boxSizing: 'border-box',
      height: CardHeight,
      marginTop: BlankWidth,
      marginRight: isSelectedOne(file, 0, StepWidth),
      marginLeft: StepWidth,
      padding: '.25rem',
      paddingLeft: StepWidth,
      borderTopRightRadius: isSelectedOne(file, 0, 2),
      borderBottomRightRadius: isSelectedOne(file, 0, 2),
      backgroundColor: isSelected(file, white, lightWhite),
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      color: labelColor,
      transition: 'all .2s ease',
    });

    return (
      <Paper
        key={file.key}
        zDepth={isSelected(file, 2, 0)}
        onTouchTap={() => handleSelectFile(file)}
        style={style(file)}
      >
      {file.name}
      </Paper>
    );
  }
}

export const Closer = (props) => {
  const style = {
    backgroundColor: dirColor,
  };

  const pathStyle = {
    color: labelColor,
  };

  const backwordStyle = {
    color: linkColor,
    fontWeight: 'bold',
    paddingLeft: StepWidth,
  };

  return (
    <div style={style} onTouchTap={props.onTouchTap}>
      <span style={pathStyle}>{props.path}</span>
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
