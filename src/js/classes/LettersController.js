class LettersController {
  /** @type {number[]} */
  #selectionStart;
  /** @type {number[]} */
  #selectionEnd;
  /** @type {boolean} */
  #isSelecting;
  /** @type {number[]} */
  #movingStart;
  /** @type {number[]} */
  #movingEnd;
  /** @type {boolean} */
  #isMoving;
  /** @type {HTMLDivElement} */
  #selectorElement;
  /** @type {HTMLElement} */
  #container;
  /** @type {HTMLElement | null} */
  #clickedElement;
  /** @type {Set<HTMLElement>} */
  #letters;
  /** @type {number[][]} */
  #lettersDeltas;

  /**
   * @param {HTMLElement} resultsElem
   */
  constructor(resultsElem, elem = document.body) {
    this.#selectionStart = [0, 0];
    this.#selectionEnd = [0, 0];
    this.#isSelecting = false;
    this.#movingStart = [0, 0];
    this.#movingEnd = [0, 0];
    this.#isMoving = false;
    this.#container = resultsElem;
    this.#letters = new Set();
    this.#lettersDeltas = [];
    this.#appendSelectorToHTML(elem);
  }

  get letters() {
    return this.#letters;
  }

  get wasMoved() {
    return (
      this.#movingStart[0] != this.#movingEnd[0] ||
      this.#movingStart[1] != this.#movingEnd[1]
    );
  }

  /**
   * @param {HTMLElement} elem
   */
  selectOne(elem) {
    if (this.isSelectableElemClicked(elem) && !this.#letters.has(elem)) {
      this.#addLetter(elem);
    }
  }

  /**
   * @param {HTMLElement} elem
   */
  unselectOne(elem) {
    if (this.#letters.has(elem)) {
      this.#removeLetter(elem);
    }
  }

  /**
   * @param {MouseEvent} event
   */
  startSelection(event) {
    this.#selectionStart = [event.clientX, event.clientY];
    this.#isSelecting = true;
  }

  /**
   * @param {MouseEvent} event
   */
  updateSelection(event) {
    if (!this.#isSelecting) return;
    this.#selectionEnd = [event.clientX, event.clientY];

    const x1 = Math.min(this.#selectionStart[0], this.#selectionEnd[0]);
    const x2 = Math.max(this.#selectionStart[0], this.#selectionEnd[0]);
    const y1 = Math.min(this.#selectionStart[1], this.#selectionEnd[1]);
    const y2 = Math.max(this.#selectionStart[1], this.#selectionEnd[1]);

    this.#container.childNodes.forEach((elem) => {
      const rect = elem.getBoundingClientRect();
      const [x0, y0] = [rect.left, rect.top];
      if (x1 <= x0 && x2 >= x0 && y1 <= y0 && y2 >= y0) {
        this.#addLetter(elem);
      } else {
        this.#removeLetter(elem);
      }
    });

    this.#selectorElement.classList.remove("hidden");
    this.#selectorElement.style.width = x2 - x1 + "px";
    this.#selectorElement.style.height = y2 - y1 + "px";
    this.#selectorElement.style.left = x1 + "px";
    this.#selectorElement.style.top = y1 + "px";
  }

  /**
   * @param {MouseEvent} event
   */
  endSelection(event) {
    this.#selectionEnd = [event.clientX, event.clientY];
    this.#isSelecting = false;
    this.#selectorElement.classList.add("hidden");
  }

  /**
   * @param {MouseEvent} event
   */
  startMoving(event) {
    const [x, y] = [event.clientX, event.clientY];
    this.#movingStart = [x, y];
    this.#movingEnd = [x, y];
    this.#letters.forEach((elem) => {
      const rect = elem.getBoundingClientRect();
      const [x0, y0] = [rect.left, rect.top];
      this.#lettersDeltas.push([x0 - x, y0 - y]);
    });
    console.log(this.#lettersDeltas);
    this.#isMoving = true;
  }

  /**
   * @param {MouseEvent} event
   */
  updateMoving(event) {
    if (!this.#isMoving) return;

    const [x, y] = [event.clientX, event.clientY];

    let i = 0;
    this.#letters.forEach((elem) => {
      const [dx, dy] = this.#lettersDeltas[i];
      elem.style.left = x + dx + "px";
      elem.style.top = y + dy + "px";
      i++;
    });
  }

  /**
   * @param {MouseEvent} event
   */
  endMoving(event) {
    this.#movingEnd = [event.clientX, event.clientY];
    this.#lettersDeltas = [];
    this.#isMoving = false;
  }

  /**
   * @param {HTMLElement | null} elem
   */
  isSelectableElemClicked(elem) {
    return elem ? elem.classList.contains("selectable") : false;
  }

  clearSelection() {
    this.#letters.forEach((elem) => {
      this.#letters.delete(elem);
      elem.classList.remove("selected");
    });
  }

  /**
   * @param {HTMLElement} elem
   */
  #appendSelectorToHTML(elem) {
    this.#selectorElement = document.createElement("div");
    elem.appendChild(this.#selectorElement);
    this.#selectorElement.classList.add("rectangle-selector");
    this.#selectorElement.classList.add("hidden");
  }

  /**
   * @param {HTMLElement} elem
   */
  #addLetter(elem) {
    this.#letters.add(elem);
    elem.classList.add("selected");
  }

  /**
   * @param {HTMLElement} elem
   */
  #removeLetter(elem) {
    this.#letters.delete(elem);
    elem.classList.remove("selected");
  }
}
