'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _changeCurrentInlineStyle = require('./changeCurrentInlineStyle');

var _changeCurrentInlineStyle2 = _interopRequireDefault(_changeCurrentInlineStyle);

var _draftJs = require('draft-js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var handleInlineStyle = function handleInlineStyle(editorState, character) {
  var originalContentState = editorState.getCurrentContent();
  var currentSelection = editorState.getSelection();
  var key = currentSelection.getStartKey();
  var text = editorState.getCurrentContent().getBlockForKey(key).getText();
  var cursorPosition = currentSelection.getStartOffset();
  var characterAtPosition = text[cursorPosition - 1];

  if (character === ' ' && characterAtPosition === '`') {
    var startPosition = text.indexOf('`');
    if (startPosition < 0) {
      return editorState;
    }
    var newContentState = originalContentState;

    // step 1: add a space (" ") after the ` (to separate it from the codeblock)
    var selectionToInsertSpace = currentSelection.merge({
      anchorKey: key,
      focusKey: key,
      anchorOffset: cursorPosition,
      focusOffset: cursorPosition
    });
    newContentState = _draftJs.Modifier.insertText(newContentState, selectionToInsertSpace, ' ');

    // step 2: apply an inline style
    var selectionToStyle = currentSelection.merge({
      anchorKey: key,
      focusKey: key,
      anchorOffset: startPosition,
      focusOffset: cursorPosition
    });
    newContentState = _draftJs.Modifier.applyInlineStyle(newContentState, selectionToStyle, 'CODE');

    // step 3: remove the backticks
    var selectionToRemove1 = currentSelection.merge({
      anchorKey: key,
      focusKey: key,
      anchorOffset: cursorPosition - 1,
      focusOffset: cursorPosition
    });
    var selectionToRemove2 = currentSelection.merge({
      anchorKey: key,
      focusKey: key,
      anchorOffset: startPosition,
      focusOffset: startPosition + 1
    });
    newContentState = _draftJs.Modifier.removeRange(newContentState, selectionToRemove1, 'forward');
    newContentState = _draftJs.Modifier.removeRange(newContentState, selectionToRemove2, 'forward');

    // step 4: move the cursor to after the space
    var selectionAfter = currentSelection.merge({
      anchorKey: key,
      focusKey: key,
      anchorOffset: cursorPosition - 1,
      focusOffset: cursorPosition - 1
    });
    newContentState = newContentState.merge({
      selectionAfter: selectionAfter
    });

    return _draftJs.EditorState.push(editorState, newContentState, 'change-inline-style');
  }

  return editorState;
};

exports.default = handleInlineStyle;