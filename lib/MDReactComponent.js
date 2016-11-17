// https://github.com/endaaman/markdown-react-js
// https://github.com/davnicwil/markdown-react-js
// https://github.com/alexkuz/markdown-react-js
/*
The MIT License (MIT)

Copyright (c) 2015 alexkuz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mdReact = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _markdownIt = require('markdown-it');

var _markdownIt2 = _interopRequireDefault(_markdownIt);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _assign = require('lodash/assign');

var _assign2 = _interopRequireDefault(_assign);

var _reduce = require('lodash/reduce');

var _reduce2 = _interopRequireDefault(_reduce);

var _zipObject = require('lodash/zipObject');

var _zipObject2 = _interopRequireDefault(_zipObject);

var _sortBy = require('lodash/sortBy');

var _sortBy2 = _interopRequireDefault(_sortBy);

var _compact = require('lodash/compact');

var _compact2 = _interopRequireDefault(_compact);

var _camelCase = require('lodash/camelCase');

var _camelCase2 = _interopRequireDefault(_camelCase);

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

var _fromPairs = require('lodash/fromPairs');

var _fromPairs2 = _interopRequireDefault(_fromPairs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var DEFAULT_TAGS = {
  'html': 'span'
};

var DEFAULT_RULES = {
  image: function image(token, attrs, children) {
    if (children.length) {
      attrs = (0, _assign2.default)({}, attrs, { alt: children[0] });
    }
    return [[token.tag, attrs]];
  },
  codeInline: function codeInline(token, attrs) {
    return [(0, _compact2.default)([token.tag, attrs, token.content])];
  },
  codeBlock: function codeBlock(token, attrs) {
    return [['pre', (0, _compact2.default)([token.tag, attrs, token.content])]];
  },
  fence: function fence(token, attrs) {
    if (token.info) {
      var langName = token.info.trim().split(/\s+/g)[0];
      attrs = (0, _assign2.default)({}, attrs, { 'data-language': langName });
    }

    return [['pre', (0, _compact2.default)([token.tag, attrs, token.content])]];
  },
  hardbreak: function hardbreak() {
    return [['br']];
  },
  softbreak: function softbreak(token, attrs, children, options) {
    return options.breaks ? [['br']] : '\n';
  },
  text: function text(token) {
    return token.content;
  },
  htmlBlock: function htmlBlock(token) {
    return token.content;
  },
  htmlInline: function htmlInline(token) {
    return token.content;
  },
  inline: function inline(token, attrs, children) {
    return children;
  },
  default: function _default(token, attrs, children, options, getNext) {
    if (token.nesting === 1 && token.hidden) {
      return getNext();
    }
    /* plugin-related */
    if (!token.tag) {
      return token.content;
    }
    if (token.info) {
      attrs = (0, _assign2.default)({}, attrs, { 'data-info': token.info.trim() });
    }
    /* plugin-related */
    return [(0, _compact2.default)([token.tag, attrs].concat(token.nesting === 1 && getNext()))];
  }
};

function convertTree(tokens, convertRules, options) {
  function convertBranch(tkns, nested) {
    var branch = [];

    if (!nested) {
      branch.push('html');
    }

    function getNext() {
      return convertBranch(tkns, true);
    }

    var token = tkns.shift();
    while (token && token.nesting !== -1) {
      var attrs = token.attrs && (0, _fromPairs2.default)((0, _sortBy2.default)(token.attrs, 0));
      var children = token.children && convertBranch(token.children.slice(), true);
      var rule = convertRules[(0, _camelCase2.default)(token.type)] || convertRules.default;

      branch = branch.concat(rule(token, attrs, children, options, getNext));
      token = tkns.shift();
    }
    return branch;
  }

  return convertBranch(tokens, false);
}

function mdReactFactory() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var onIterate = options.onIterate;
  var _options$tags = options.tags;
  var tags = _options$tags === undefined ? DEFAULT_TAGS : _options$tags;
  var presetName = options.presetName;
  var markdownOptions = options.markdownOptions;
  var _options$enableRules = options.enableRules;
  var enableRules = _options$enableRules === undefined ? [] : _options$enableRules;
  var _options$disableRules = options.disableRules;
  var disableRules = _options$disableRules === undefined ? [] : _options$disableRules;
  var _options$plugins = options.plugins;
  var plugins = _options$plugins === undefined ? [] : _options$plugins;
  var _options$onGenerateKe = options.onGenerateKey;
  var onGenerateKey = _options$onGenerateKe === undefined ? function (tag, index) {
    return 'mdrct-' + tag + '-' + index;
  } : _options$onGenerateKe;

  var rootElementProps = _objectWithoutProperties(options, ['onIterate', 'tags', 'presetName', 'markdownOptions', 'enableRules', 'disableRules', 'plugins', 'onGenerateKey']);

  var md = (0, _markdownIt2.default)(markdownOptions || presetName).enable(enableRules).disable(disableRules);

  var convertRules = (0, _assign2.default)({}, DEFAULT_RULES, options.convertRules);

  md = (0, _reduce2.default)(plugins, function (m, plugin) {
    return plugin.plugin ? m.use.apply(m, [plugin.plugin].concat(_toConsumableArray(plugin.args))) : m.use(plugin);
  }, md);

  function renderChildren(tag) {
    return ['img', 'hr', 'br'].indexOf(tag) < 0;
  }

  function iterateTree(tree) {
    var level = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
    var index = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

    var tag = tree.shift();
    var key = onGenerateKey(tag, index);

    var props = tree.length && (0, _isPlainObject2.default)(tree[0]) ? (0, _assign2.default)(tree.shift(), { key: key }) : { key: key };

    if (level === 0) {
      props = _extends({}, props, rootElementProps);
    }

    var children = tree.map(function (branch, idx) {
      return Array.isArray(branch) ? iterateTree(branch, level + 1, idx) : branch;
    });

    tag = tags[tag] || tag;

    if ((0, _isString2.default)(props.style)) {
      props.style = (0, _zipObject2.default)(props.style.split(';').map(function (prop) {
        return prop.split(':');
      }).map(function (keyVal) {
        return [(0, _camelCase2.default)(keyVal[0].trim()), keyVal[1].trim()];
      }));
    }

    if (typeof onIterate === 'function') {
      var element = onIterate(tag, props, children, level);
      if (element) {
        return element;
      }
    }
    return _react2.default.createElement(tag, props, renderChildren(tag) ? children : undefined);
  }

  return function (text) {
    var tree = convertTree(md.parse(text, {}), convertRules, md.options);
    return iterateTree(tree);
  };
}

var MDReactComponent = function MDReactComponent(props) {
  var text = props.text;

  var propsWithoutText = _objectWithoutProperties(props, ['text']);

  return mdReactFactory(propsWithoutText)(text);
};

MDReactComponent.propTypes = {
  text: _react.PropTypes.string.isRequired,
  onIterate: _react.PropTypes.func,
  onGenerateKey: _react.PropTypes.func,
  tags: _react.PropTypes.object,
  presetName: _react.PropTypes.string,
  markdownOptions: _react.PropTypes.object,
  enableRules: _react.PropTypes.array,
  disableRules: _react.PropTypes.array,
  convertRules: _react.PropTypes.object,
  plugins: _react.PropTypes.array,
  className: _react.PropTypes.string
};

exports.default = MDReactComponent;
exports.mdReact = mdReactFactory;
