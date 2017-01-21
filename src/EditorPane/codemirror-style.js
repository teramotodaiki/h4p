import { grey100 } from 'material-ui/styles/colors';
import transitions from 'material-ui/styles/transitions';


export default (palette) => `
textarea {
  font-size: 16px !important; // In smartphone, will not scale automatically
}
.ReactCodeMirror {
  position: absolute;
  width: 100%;
  height: 100%;
  transition: ${transitions.easeOut()};
}
.CodeMirror {
  font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace;
  width: 100%;
  height: 100%;
  background-color: ${grey100};
}
.CodeMirror-gutters {
  border-color: ${palette.primary1Color} !important;
}`;
