class Events {
  /** @type {(Document | HTMLElement | string | EventListenerOrEventListenerObject)[][]} */
  static #events = [];

  static get events() {
    return this.#events;
  }

  /**
   * @param {{ [key: string]: (event: Event) => void; }} events
   */
  static addEvents(events) {
    Object.keys(events).forEach((key) => {
      this.#events.push([document, key, events[key]]);
      document.addEventListener(key, events[key]);
    });
  }

  /**
   * @param {HTMLElement} elem
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} event
   */
  static addEvent(elem, type, event) {
    this.#events.push([elem, type, event]);
    elem.addEventListener(type, event);
  }

  static removeEvents() {
    this.#events.forEach((event) => {
      if (
        typeof event[0] === "object" &&
        "removeEventListener" in event[0] &&
        typeof event[1] === "string" &&
        typeof event[2] === "function"
      )
        event[0].removeEventListener(event[1], event[2]);
    });
    this.#events = [];
  }
}
