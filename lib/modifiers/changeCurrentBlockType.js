'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _draftJs = require('draft-js');

var changeCurrentBlockType = function changeCurrentBlockType(editorState, type, text) {
  var blockMetadata = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var originalContentState = editorState.getCurrentContent();
  var selection = editorState.getSelection();
  var key = selection.getStartKey();
  var blockMap = originalContentState.getBlockMap();
  var block = blockMap.get(key);

  // step 1: delete the markdown shortcut characters (for example, '# ' or '* ').
  // need to use Modifier to do this in order to preserve entity and inline style ranges properly.
  var previousText = originalContentState.getBlockMap().get(key).getText();
  var difference = text.length - previousText.length;

  var newContentState = _draftJs.Modifier.removeRange(originalContentState, selection.merge({ anchorKey: key, focusKey: key, anchorOffset: 0, focusOffset: difference * -1, isBackward: false }), 'forward');

  // step 2: change the block type
  var newerBlock = newContentState.getBlockMap().get(key).merge({ type: type });
  var newSelection = selection.merge({
    anchorOffset: 0,
    focusOffset: 0
  });
  newContentState = newContentState.merge({
    blockMap: newContentState.getBlockMap().set(key, newerBlock),
    selectionAfter: newSelection
  });

  return _draftJs.EditorState.push(editorState, newContentState, 'change-block-type');
};

exports.default = changeCurrentBlockType;