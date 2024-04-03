class LettersController {
  /** @type {HTMLElement[]} */
  static #allLetters = [];
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
  /** @type {Map<HTMLElement, {delta: number[], canBeUnselected: boolean}>} - selected letters */
  #selectedLetters;

  /**
   * @param {HTMLElement[]} elems
   */
  static addManyAllLetters(elems) {
    LettersController.#allLetters = [
      ...LettersController.#allLetters,
      ...elems,
    ];
  }

  /**
   * @param {HTMLElement} elem
   */
  static deleteElemAllLetters(elem) {
    LettersController.#allLetters = LettersController.#allLetters.filter(
      (element) => elem !== element
    );
    elem.remove();
  }

  static clearLetters() {
    LettersController.#allLetters = [];
  }

  static get allLetters() {
    return LettersController.#allLetters;
  }

  constructor(elem = document.body) {
    this.#disableSelecting();
    this.#disableMoving();
    this.#selectedLetters = new Map();
    this.#appendSelectorToHTML(elem);
  }

  get selectedLetters() {
    return this.#selectedLetters;
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
    return this.#selectedLetters.get(elem)?.canBeUnselected || false;
  }

  /**
   * @param {HTMLElement} elem
   */
  selectOne(elem) {
    if (
      this.isSelectableElemClicked(elem) &&
      !this.#selectedLetters.has(elem)
    ) {
      this.#addSelectedLetter(elem);
    }
  }

  /**
   * @param {HTMLElement} elem
   */
  unselectOne(elem) {
    if (this.canBeUnselected(elem)) {
      this.#removeSelectedLetter(elem);
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

    const rect1 = new DOMRect(x1, y1, x2 - x1, y2 - y1);

    LettersController.#allLetters.forEach((elem) => {
      const rect2 = elem.getBoundingClientRect();
      if (this.#isRectOverlay(rect1, rect2)) {
        this.#addSelectedLetter(elem);
      } else {
        this.#removeSelectedLetter(elem);
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
    this.#selectedLetters.forEach((data, elem) => {
      const rect = elem.getBoundingClientRect();
      const [x0, y0] = [rect.left, rect.top];
      this.#selectedLetters.set(elem, {
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

    this.#selectedLetters.forEach((data, elem) => {
      const [dx, dy] = data.delta;
      this.#move(elem, x + dx, y + dy);
      if (x + dx < 0) {
        LettersController.deleteElemAllLetters(elem);
      }
    });
  }

  /**
   * @param {MouseEvent} event
   */
  endMoving(event) {
    if (!this.#isMoving) return;
    this.#movingEnd = [event.clientX, event.clientY];
    this.#isMoving = false;

    const elems = Array.from(this.#selectedLetters.entries()).map(
      ([elem]) => elem
    );
    this.correctElemPositons(elems);
  }

  /**
   * @param {HTMLElement} elem
   */
  isSelectableElemClicked(elem) {
    return LettersController.#allLetters.includes(elem);
  }

  clearSelection() {
    this.#selectedLetters.forEach((_, elem) => {
      this.#selectedLetters.delete(elem);
      elem.classList.remove("selected");
    });
  }

  /**
   * @param {HTMLElement[]} elements
   */
  correctElemPositons(elements) {
    const newElemsToMove = [];
    for (const elem1 of elements) {
      for (const elem2 of LettersController.#allLetters) {
        if (elem1 === elem2) continue;

        const rect1 = elem1.getBoundingClientRect();
        const rect2 = elem2.getBoundingClientRect();

        if (this.#isRectOverlay(rect1, rect2)) {
          const [x, y] = [rect2.left, rect2.top];
          const [dx, dy] = [rect2.left - rect1.right, 0];
          this.#move(elem2, x + dx, y + dy);
          if (x + dx < 0) {
            LettersController.deleteElemAllLetters(elem2);
          } else {
            newElemsToMove.push(elem2);
          }
        }
      }
    }
    if (!!newElemsToMove.length) this.correctElemPositons(newElemsToMove);
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

  /**
   * @param {HTMLElement | Element} elem
   * @param {number} x
   * @param {number} y
   */
  #move(elem, x, y) {
    if (!("style" in elem)) return;
    elem.style.left = x + "px";
    elem.style.top = y + "px";
  }

  /**
   * @param {Element} elem
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
  #addSelectedLetter(elem) {
    this.#selectedLetters.set(elem, { delta: [0, 0], canBeUnselected: false });
    elem.classList.add("selected");
  }

  /**
   * @param {HTMLElement} elem
   */
  #removeSelectedLetter(elem) {
    this.#selectedLetters.delete(elem);
    elem.classList.remove("selected");
  }

  /**
   * @param {DOMRect} rect1
   * @param {DOMRect} rect2
   */
  #isRectOverlay(rect1, rect2) {
    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  }
}
