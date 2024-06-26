class FormController {
  /** @type {HTMLFormElement} */
  #form;
  /** @type {HTMLInputElement} */
  #input;
  /** @type {HTMLParagraphElement} */
  #result;

  constructor(elem = document.body) {
    this.#form = document.createElement("form");
    this.#form.id = "form";
    this.#form.method = "post";

    const label = document.createElement("label");
    label.setAttribute("for", "inputField");
    label.textContent = "Input:";

    this.#input = document.createElement("input");
    this.#input.type = "text";
    this.#input.id = "inputField";
    this.#input.name = "inputField";

    const button = document.createElement("button");
    button.type = "submit";
    button.textContent = "Submit";

    this.#form.appendChild(label);
    this.#form.appendChild(this.#input);
    this.#form.appendChild(button);

    this.#result = document.createElement("p");
    this.#result.classList.add("results");

    elem.appendChild(this.#form);
    elem.appendChild(this.#result);
  }

  get form() {
    return this.#form;
  }

  get input() {
    return this.#input;
  }

  get result() {
    return this.#result;
  }
}
