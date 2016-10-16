import React, { Component, PropTypes } from 'react';
import { IconButton } from 'material-ui';
import PlayCircleOutline from 'material-ui/svg-icons/av/play-circle-outline';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import { darkBlack } from 'material-ui/styles/colors';
import classNames from 'classnames';


const TAB_CONTAINER = CSS_PREFIX + 'tab_container';
const TAB_ITEM = CSS_PREFIX + 'tab';
const TAB_ACTIVE = CSS_PREFIX + 'tab-active';

export default class ChromeTabs extends Component {

  static propTypes = {
    files: PropTypes.array.isRequired,
    selectedFile: PropTypes.object,
    handleSelect: PropTypes.func.isRequired,
    handleRun: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
  };

  render() {
    const { files, selectedFile, handleSelect, handleRun, handleClose } = this.props;

    return (
      <div className={TAB_CONTAINER}>
      {files
        .map(file => (
        <ChromeTab
          key={file.key}
          active={selectedFile === file}
          label={file.name}
          leftIcon={file.options.isEntryPoint ? (<PlayCircleOutline color={darkBlack} />) : null}
          onLeftTouchTap={(e) => handleRun()}
          rightIcon={<NavigationClose color={darkBlack} />}
          onRightTouchTap={(e) => handleClose(file)}
          onTouchTap={(e) => handleSelect(file)}
        />
      ))}
      </div>
    );
  }
}


export const ChromeTab = (props) => {

  const {
    active,
    label,
    leftIcon,
    rightIcon,
    onTouchTap,
  } = props;

  const commonStyle = {
    padding: 0,
  };

  const leftIconStyle = Object.assign({}, commonStyle, {
    transform: 'scale(0.8)',
    marginLeft: -24,
    marginRight: -10
  }, props.leftIconStyle);

  const rightIconStyle = Object.assign({}, commonStyle, {
    transform: 'scale(0.55)',
    marginLeft: -10,
    marginRight: -24
  }, props.rightIconStyle);

  const onLeftTouchTap = (e) => {
    e.stopPropagation();
    props.onLeftTouchTap(e);
  };

  const onRightTouchTap = (e) => {
    e.stopPropagation();
    props.onRightTouchTap(e);
  };

  const className = classNames(TAB_ITEM, {
    [TAB_ACTIVE]: active
  });

  return (
    <div className={className}>
      <div onTouchTap={onTouchTap}>
      {leftIcon ? (
        <IconButton onTouchTap={onLeftTouchTap} style={leftIconStyle}>
        {leftIcon}
        </IconButton>
      ) : null}
        <a href="#" title={label}>{label}</a>
        <IconButton onTouchTap={onRightTouchTap} style={rightIconStyle}>
        {rightIcon}
        </IconButton>
      </div>
    </div>
  );

};

ChromeTab.defaultProps = {
  active: false,
  label: '',
  leftIcon: null,
  leftIconStyle: {},
  onLeftTouchTap: () => {},
  rightIcon: null,
  rightIconStyle: {},
  onRightTouchTap: () => {},
  onTouchTap: () => {},
};
