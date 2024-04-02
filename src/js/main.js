const root = document.getElementById("root") ?? undefined;

const formController = new FormController(root);
const lettersController = new LettersController(".selectable");

Events.addEvents({
  mousedown: mouseDown.bind(this),
  mousemove: mouseMove.bind(this),
  mouseup: mouseUp.bind(this),
});

/**
 * @param {MouseEvent & {target: HTMLElement}} event
 */
function mouseDown(event) {
  const elem = event.target;
  if (lettersController.isSelectableElemClicked(elem)) {
    lettersController.startMoving(event);

    // directly pressed the letter
    if (!lettersController.letters.has(elem)) {
      if (!event.ctrlKey) lettersController.clearSelection();
      lettersController.selectOne(elem);
    }
  } else {
    // clicked anywhere but on an item
    lettersController.startSelection(event);
  }
}

/**
 * @param {MouseEvent} event
 */
function mouseMove(event) {
  lettersController.updateMoving(event);
  lettersController.updateSelection(event);
}

/**
 * @param {MouseEvent & {target: HTMLElement}} event
 */
function mouseUp(event) {
  const elem = event.target;

  lettersController.endMoving(event);
  lettersController.endSelection(event);

  if (lettersController.wasMoved) {
    lettersController.clearSelection();
  } else {
    lettersController.unselectOne(elem);
  }
}
