import { showAlert } from "./helpers.js";

async function runAction(event, actions, eventType) {
    const element = event.target.closest("[data-action]");
    if (!element) return;

    let type = "click";
    if (element.tagName === "FORM") {
        type = "submit";
    } else if (element.tagName === "SELECT" || element.type === "checkbox") {
        type = "change";
    } else if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
        type = "input";
    }
    if (type !== eventType) return;

    const action = actions[element.dataset.action];
    if (!action) return;

    if (eventType === "submit") {
        event.preventDefault();
    }

    try {
        await action(element);
    } catch (error) {
        console.error("Error in action " + element.dataset.action, error);
        showAlert("Something went wrong. Please try again.", "error");
    }
}

export function bindActions(actions) {
    const types = ["click", "submit", "change", "input"];
    for (const type of types) {
        document.addEventListener(type, (event) => runAction(event, actions, type));
    }
}
