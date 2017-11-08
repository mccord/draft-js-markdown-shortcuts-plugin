import { CHECKABLE_LIST_ITEM } from 'draft-js-checkable-list-item';
import { RichUtils } from 'draft-js';
import changeCurrentBlockType from './changeCurrentBlockType';

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

  if (line.indexOf('# ') === 0) {
    return changeCurrentBlockType(editorState, 'header-three', line.replace(/^#+\s/, ''));
  }
 
  let matchArr = line.match(/^[*] (.*)$/);
  if (matchArr) {
    return changeCurrentBlockType(editorState, 'unordered-list-item', matchArr[1]);
  }
  matchArr = line.match(/^[\d]\. (.*)$/); // 1.
  if (matchArr) {
    return changeCurrentBlockType(editorState, 'ordered-list-item', matchArr[1]);
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
