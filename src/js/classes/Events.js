class Events {
  /** @type {{[key: string]: (event: Event) => void}} */
  static #events;

  static get events() {
    return this.#events;
  }

  /**
   * @param {{ [key: string]: (event: Event) => void; }} events
   */
  static addEvents(events) {
    this.#events = events;
    Object.keys(this.#events).forEach((key) => {
      document.addEventListener(key, this.#events[key]);
    });
  }

  static removeEvents() {
    Object.keys(this.#events).forEach((key) => {
      document.removeEventListener(key, this.#events[key]);
    });
    this.#events = {};
  }
}
