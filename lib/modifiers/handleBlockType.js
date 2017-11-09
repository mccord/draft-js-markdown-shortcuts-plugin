'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _draftJsCheckableListItem = require('draft-js-checkable-list-item');

var _draftJs = require('draft-js');

var _changeCurrentBlockType = require('./changeCurrentBlockType');

var _changeCurrentBlockType2 = _interopRequireDefault(_changeCurrentBlockType);

var _insertEmptyBlock = require('./insertEmptyBlock');

var _insertEmptyBlock2 = _interopRequireDefault(_insertEmptyBlock);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sharps = function sharps(len) {
  var ret = '';
  while (ret.length < len) {
    ret += '#';
  }
  return ret;
};

var handleBlockType = function handleBlockType(editorState, character) {
  var currentSelection = editorState.getSelection();
  var key = currentSelection.getStartKey();
  var text = editorState.getCurrentContent().getBlockForKey(key).getText();
  var position = currentSelection.getAnchorOffset();
  var line = [text.slice(0, position), character, text.slice(position)].join('');
  var blockType = _draftJs.RichUtils.getCurrentBlockType(editorState);

  if (line.indexOf('# ') === 0) {
    return (0, _changeCurrentBlockType2.default)(editorState, 'header-three', line.replace(/^#+\s/, ''));
  }

  var matchArr = line.match(/^[*] (.*)$/);
  if (matchArr) {
    return (0, _changeCurrentBlockType2.default)(editorState, 'unordered-list-item', matchArr[1]);
  }
  matchArr = line.match(/^[\d]\. (.*)$/); // 1.
  if (matchArr) {
    return (0, _changeCurrentBlockType2.default)(editorState, 'ordered-list-item', matchArr[1]);
  }
  // matchArr = line.match(/^> (.*)$/);
  // if (matchArr) {
  //   return changeCurrentBlockType(editorState, 'blockquote', matchArr[1]);
  // }
  matchArr = line.match(/^\[([x ])] (.*)$/i);
  if (matchArr && blockType === 'unordered-list-item') {
    return (0, _changeCurrentBlockType2.default)(editorState, _draftJsCheckableListItem.CHECKABLE_LIST_ITEM, matchArr[2], { checked: matchArr[1] !== ' ' });
  }
  return editorState;
};

exports.default = handleBlockType;