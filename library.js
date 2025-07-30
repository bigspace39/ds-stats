function createElement(tag, parentElement, id) {
    let element = document.createElement(tag);
    element.id = id;
    parentElement.appendChild(element);
    return element;
}