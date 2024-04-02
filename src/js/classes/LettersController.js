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
  /** @type {Map<HTMLElement, {delta: number[], canBeUnselected: boolean}>} */
  #letters;
  /** @type {HTMLElement | null} */
  #lastAddedElem;

  /**
   * @param {HTMLElement} resultsElem
   */
  constructor(resultsElem, elem = document.body) {
    this.#disableSelecting();
    this.#disableMoving();
    this.#container = resultsElem;
    this.#letters = new Map();
    this.#lastAddedElem = null;
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
  canBeUnselected(elem) {
    return this.#letters.get(elem)?.canBeUnselected || false;
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
    if (this.canBeUnselected(elem)) {
      this.#removeLetter(elem);
    }
  }

  /**
   * @param {MouseEvent} event
   */
  startSelection(event) {
    this.#selectionStart = [event.clientX, event.clientY];
    this.#isSelecting = true;
    this.#disableMoving();
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
    if (!this.#isSelecting) return;
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
    this.#letters.forEach((data, elem) => {
      const rect = elem.getBoundingClientRect();
      const [x0, y0] = [rect.left, rect.top];
      this.#letters.set(elem, {
        ...data,
        delta: [x0 - x, y0 - y],
        canBeUnselected: true,
      });
    });
    this.#isMoving = true;
    this.#disableSelecting();
  }

  /**
   * @param {MouseEvent} event
   */
  updateMoving(event) {
    if (!this.#isMoving) return;

    const [x, y] = [event.clientX, event.clientY];

    this.#letters.forEach((data, elem) => {
      const [dx, dy] = data.delta;
      elem.style.left = x + dx + "px";
      elem.style.top = y + dy + "px";
    });
  }

  /**
   * @param {MouseEvent} event
   */
  endMoving(event) {
    if (!this.#isMoving) return;
    this.#movingEnd = [event.clientX, event.clientY];
    this.#isMoving = false;
  }

  /**
   * @param {HTMLElement | null} elem
   */
  isSelectableElemClicked(elem) {
    return elem ? elem.classList.contains("selectable") : false;
  }

  clearSelection() {
    this.#letters.forEach((_, elem) => {
      this.#letters.delete(elem);
      elem.classList.remove("selected");
    });
  }

  #disableMoving() {
    this.#movingStart = [0, 0];
    this.#movingEnd = [0, 0];
    this.#isMoving = false;
  }

  #disableSelecting() {
    this.#selectionStart = [0, 0];
    this.#selectionEnd = [0, 0];
    this.#isSelecting = false;
  }

  #setCanBeUnselected() {
    if (!this.#lastAddedElem) return;
    const data = this.#letters.get(this.#lastAddedElem) ?? {
      delta: [0, 0],
      canBeUnselected: true,
    };
    this.#letters.set(this.#lastAddedElem, { ...data, canBeUnselected: true });
    this.#lastAddedElem = null;
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
    this.#lastAddedElem = elem;
    this.#letters.set(elem, { delta: [0, 0], canBeUnselected: false });
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
