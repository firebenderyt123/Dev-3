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
  /** @type {string} */
  #elemsSelector;
  /** @type {"Id" | "Class" | "Tag"} */
  #elemsSelectorType;
  /** @type {Map<Element, {delta: number[], canBeUnselected: boolean}>} */
  #letters;

  /**
   * @param {string} elemsSelector
   */
  constructor(elemsSelector, elem = document.body) {
    this.#disableSelecting();
    this.#disableMoving();
    this.#elemsSelector = elemsSelector;
    this.#elemsSelectorType = elemsSelector.includes(".")
      ? "Class"
      : elemsSelector.includes("#")
      ? "Id"
      : "Tag";
    this.#letters = new Map();
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

    const elements = this.#getAllElements();
    elements.forEach((elem) => {
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
      this.#move(elem, x + dx, y + dy);
    });
  }

  /**
   * @param {MouseEvent} event
   */
  endMoving(event) {
    if (!this.#isMoving) return;
    this.#movingEnd = [event.clientX, event.clientY];
    this.#isMoving = false;

    const elems = Array.from(this.#letters.entries()).map(([elem]) => elem);
    this.#correctElemPositons(elems);
  }

  /**
   * @param {HTMLElement | null} elem
   */
  isSelectableElemClicked(elem) {
    if (!elem) return false;

    if (this.#elemsSelectorType === "Id") {
      return this.#elemsSelector.slice(1) === elem.id;
    } else if (this.#elemsSelectorType === "Class") {
      return elem.classList.contains(this.#elemsSelector.slice(1));
    } else {
      return this.#elemsSelector === elem.tagName;
    }
  }

  clearSelection() {
    this.#letters.forEach((_, elem) => {
      this.#letters.delete(elem);
      elem.classList.remove("selected");
    });
  }

  #getAllElements() {
    return Array.from(document.querySelectorAll(this.#elemsSelector));
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
   * @param {Element} elem
   */
  #addLetter(elem) {
    this.#letters.set(elem, { delta: [0, 0], canBeUnselected: false });
    elem.classList.add("selected");
  }

  /**
   * @param {Element} elem
   */
  #removeLetter(elem) {
    this.#letters.delete(elem);
    elem.classList.remove("selected");
  }

  /**
   * @param {Element[]} elements
   */
  #correctElemPositons(elements) {
    const newElemsToMove = [];
    for (const elem1 of elements) {
      for (const elem2 of this.#getAllElements()) {
        if (elem1 === elem2) continue;

        const rect1 = elem1.getBoundingClientRect();
        const rect2 = elem2.getBoundingClientRect();

        if (this.#isRectOverlay(rect1, rect2)) {
          const [x, y] = [rect2.left, rect2.top];
          const [dx, dy] = [rect2.left - rect1.right, 0];
          this.#move(elem2, x + dx, y + dy);
          newElemsToMove.push(elem2);
        }
      }
    }
    if (!!newElemsToMove.length) this.#correctElemPositons(newElemsToMove);
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
