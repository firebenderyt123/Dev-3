const root = document.getElementById("root") ?? undefined;

const formController = new FormController(root);
const lettersController = new LettersController();

Events.addEvents({
  mousedown: mouseDown.bind(this),
  mousemove: mouseMove.bind(this),
  mouseup: mouseUp.bind(this),
});
Events.addEvent(formController.form, "submit", formSubmit.bind(this));

/**
 * @param {MouseEvent & {target: HTMLElement}} event
 */
function mouseDown(event) {
  const elem = event.target;
  if (lettersController.isSelectableElemClicked(elem)) {
    lettersController.startMoving(event);

    // directly pressed the letter
    if (!lettersController.selectedLetters.has(elem)) {
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

/**
 * @param {SubmitEvent} event
 */
function formSubmit(event) {
  event.preventDefault();

  let leftOffset = window.innerWidth / 2;
  const elements = [];
  formController.input.value.split("").forEach((char) => {
    const span = document.createElement("span");
    if (char !== " ") span.classList.add("selectable");
    span.style.left = leftOffset + "px";
    span.innerHTML = char !== " " ? char : "&nbsp;";

    formController.result.appendChild(span);
    if (char !== " ") elements.push(span);
  });

  LettersController.addManyAllLetters(elements);
  lettersController.correctElemPositons(elements);
}
