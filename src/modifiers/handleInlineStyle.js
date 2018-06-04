import changeCurrentInlineStyle from './changeCurrentInlineStyle';
import { Modifier, EditorState } from 'draft-js';

const handleInlineStyle = (editorState, character) => {
  const originalContentState = editorState.getCurrentContent();
  const currentSelection = editorState.getSelection();
  const key = currentSelection.getStartKey();
  const text = editorState.getCurrentContent().getBlockForKey(key).getText();
  const cursorPosition = currentSelection.getStartOffset();
  const characterAtPosition = text[cursorPosition - 1];

  if (character === ' ' && characterAtPosition === '`') {
    const startPosition = text.indexOf('`');
    if (startPosition < 0) {
      return editorState;
    }
    let newContentState = originalContentState;

    // step 1: add a space (" ") after the ` (to separate it from the codeblock)
    const selectionToInsertSpace = currentSelection.merge({
      anchorKey: key,
      focusKey: key,
      anchorOffset: cursorPosition,
      focusOffset: cursorPosition,
    });
    newContentState = Modifier.insertText(
      newContentState,
      selectionToInsertSpace,
      ' '
    );

    // step 2: apply an inline style
    const selectionToStyle = currentSelection.merge({
      anchorKey: key,
      focusKey: key,
      anchorOffset: startPosition,
      focusOffset: cursorPosition,
    });
    newContentState = Modifier.applyInlineStyle(
      newContentState,
      selectionToStyle,
      'CODE'
    );

    // step 3: remove the backticks
    const selectionToRemove1 = currentSelection.merge({
      anchorKey: key,
      focusKey: key,
      anchorOffset: cursorPosition - 1,
      focusOffset: cursorPosition,
    });
    const selectionToRemove2 = currentSelection.merge({
      anchorKey: key,
      focusKey: key,
      anchorOffset: startPosition,
      focusOffset: startPosition + 1,
    });
    newContentState = Modifier.removeRange(
      newContentState,
      selectionToRemove1,
      'forward'
    );
    newContentState = Modifier.removeRange(
      newContentState,
      selectionToRemove2,
      'forward'
    );

    // step 4: move the cursor to after the space
    const selectionAfter = currentSelection.merge({
      anchorKey: key,
      focusKey: key,
      anchorOffset: cursorPosition - 1,
      focusOffset: cursorPosition - 1,
    });
    newContentState = newContentState.merge({
      selectionAfter,
    });

    return EditorState.push(
      editorState,
      newContentState,
      'change-inline-style'
    );
  }

  return editorState;
};

export default handleInlineStyle;
