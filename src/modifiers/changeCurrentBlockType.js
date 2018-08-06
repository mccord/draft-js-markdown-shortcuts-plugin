import { EditorState, Modifier } from 'draft-js';

const changeCurrentBlockType = (editorState, type, text, blockMetadata = {}) => {
  const originalContentState = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  const key = selection.getStartKey();
  const blockMap = originalContentState.getBlockMap();
  const block = blockMap.get(key);

  // step 1: delete the markdown shortcut characters (for example, '# ' or '* ').
  // need to use Modifier to do this in order to preserve entity and inline style ranges properly.
  const previousText = originalContentState.getBlockMap().get(key).getText();
  const difference = text.length - previousText.length;

  let newContentState = Modifier.removeRange(
    originalContentState,
    selection.merge({anchorKey: key, focusKey: key, anchorOffset: 0, focusOffset: difference * -1, isBackward: false}),
    'forward'
  );

  // step 2: change the block type
  const newerBlock = newContentState.getBlockMap().get(key).merge({ type, data: blockMetadata});
  const newSelection = selection.merge({
    anchorOffset: 0,
    focusOffset: 0,
  });
  newContentState = newContentState.merge({
    blockMap: newContentState.getBlockMap().set(key, newerBlock),
    selectionAfter: newSelection,
  });

  return EditorState.push(
    editorState,
    newContentState,
    'change-block-type'
  );
};

export default changeCurrentBlockType;
