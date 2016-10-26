import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {
  lightGreen400, lightGreenA100, pinkA100,
  fullWhite, fullBlack
} from 'material-ui/styles/colors';
import {
  fade,
  emphasize,
  getLuminance,
  convertColorToString,
  decomposeColor
} from 'material-ui/utils/colorManipulator';


export const defaultPalette = {
  backgroundColor: fade(lightGreenA100, 0.15),
  canvasColor: fullWhite,
  primary1Color: lightGreen400,
  accent1Color: pinkA100,
};

export default ({ palette }) => {

  const {
    backgroundColor,
    canvasColor,
    primary1Color,
    accent1Color
  } = Object.assign({}, defaultPalette, palette);

  palette = {
    primary1Color,
    primary2Color: emphasize(primary1Color),
    primary3Color: monochrome(primary1Color),
    accent1Color,
    accent2Color: monochrome(accent1Color),
    accent3Color: emphasize(monochrome(accent1Color)),
    textColor: emphasize(canvasColor, 1),
    secondaryTextColor: fade(emphasize(canvasColor, 1), 0.54),
    alternateTextColor: emphasize(emphasize(canvasColor, 1), 1),
    canvasColor,
    borderColor: fade(emphasize(canvasColor, 0.5), 0.3),
    disabledColor: fade(emphasize(canvasColor, 1), 0.3),
    pickerHeaderColor: primary1Color,
    clockCircleColor: fade(emphasize(canvasColor, 1), 0.07),
    shadowColor: emphasize(canvasColor, 1),

    backgroundColor,
  };

  return getMuiTheme({ palette });
};


function monochrome(color) {
  color = decomposeColor(color);
  const [r, g, b] = color.values;
  const _ = r * 0.3 + g * 0.59 + b * 0.11;
  color = { type: 'rgb', values: [_, _, _] };
  return convertColorToString(color);
}
