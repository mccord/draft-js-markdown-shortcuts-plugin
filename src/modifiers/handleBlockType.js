import { CHECKABLE_LIST_ITEM } from 'draft-js-checkable-list-item';
import { RichUtils } from 'draft-js';
import changeCurrentBlockType from './changeCurrentBlockType';
import insertEmptyBlock from './insertEmptyBlock';
import $ from '~/shared/$.js';

const sharps = (len) => {
  let ret = '';
  while (ret.length < len) {
    ret += '#';
  }
  return ret;
};

const handleBlockType = (editorState, character) => {
  const currentSelection = editorState.getSelection();
  const key = currentSelection.getStartKey();
  const text = editorState.getCurrentContent().getBlockForKey(key).getText();
  const position = currentSelection.getAnchorOffset();
  const line = [text.slice(0, position), character, text.slice(position)].join('');
  const blockType = RichUtils.getCurrentBlockType(editorState);

  const contentState = editorState.getCurrentContent();
  const anchorKey = currentSelection.getAnchorKey();
  const focusKey = currentSelection.getFocusKey();
  const anchorBlock = contentState.getBlockForKey(anchorKey);
  const focusBlock = contentState.getBlockForKey(focusKey);

  const notSupportedBlockTypes = [
    'code-block',
    'blockquote',
    'header-three',
    'unordered-list-item',
    'ordered-list-item',
  ];
  const shouldNotAllowBlocks = $.aContainsAll(
    notSupportedBlockTypes,
    [anchorBlock.getType(), focusBlock.getType()]
  );

  if (shouldNotAllowBlocks) {
    return editorState;
  }

  if (line.indexOf('# ') === 0) {
    return changeCurrentBlockType(editorState, 'header-three', line.replace(/^#+\s/, ''));
  }

  let matchArr = line.match(/^[*-] (.*)$/);
  if (
    (line.indexOf('-') === 0 || line.indexOf('*') === 0) &&
    currentSelection.getStartOffset() === 1 &&
    character === ' '
  ) {
    return changeCurrentBlockType(editorState, 'unordered-list-item', matchArr[1]);
  }
  matchArr = line.match(/^[0-9]{1,2}\. (.*)$/); // 1.
  if (matchArr) {
    return changeCurrentBlockType(editorState, 'ordered-list-item', matchArr[1], { 'startValue': matchArr[0].substring(0, matchArr[0].length - 2)});
  }
  // matchArr = line.match(/^> (.*)$/);
  // if (matchArr) {
  //   return changeCurrentBlockType(editorState, 'blockquote', matchArr[1]);
  // }
  matchArr = line.match(/^\[([x ])] (.*)$/i);
  if (matchArr && blockType === 'unordered-list-item') {
    return changeCurrentBlockType(editorState, CHECKABLE_LIST_ITEM, matchArr[2], { checked: matchArr[1] !== ' ' });
  }
  return editorState;
};

export default handleBlockType;
