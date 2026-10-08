export async function loadComponent (path, selector) {
    const element = document.querySelector(selector);
    if (!element) {
        throw new Error(`No found: ${selector}`);
    }
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Could not load ${path}: ${response.status}`);
    }
    element.innerHTML = await response.text();
}