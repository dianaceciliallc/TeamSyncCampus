import { dialogTemplates } from "./dialogTemplates.mjs"

export default class HandleDialogs {
    constructor(parentSelector = "body") {
        this.element = document.querySelector(parentSelector);
        this.activeDialog = null;
    }

    open(type, data = {}) {
        console.log(`[HandleDialogs] open() called with type:`, type);
        
        const buildTemplate = dialogTemplates[type];
        if (!buildTemplate) {
            console.error(`[HandleDialogs] Could not find template for type: "${type}"`);
            return Promise.resolve(null);
        }

        const config = buildTemplate(data);

        return new Promise((resolve) => {
            this.close();

            let dialogElement = document.querySelector("#dialog-root")

            if (!dialogElement || dialogElement.tagName !== "DIALOG") {
                if (dialogElement) dialogElement.remove();
                
                dialogElement = document.createElement("dialog");
                dialogElement.id = "dialog-root";
                document.body.appendChild(dialogElement);
            }

            dialogElement.className = "app-dialog";
            dialogElement.innerHTML = `
                <form method="dialog" class="app-dialog__form">
                    <header class="app-dialog__header">
                        <h2>${config.title}</h2>
                        <button type="button" class="app-dialog__close" data-action="cancel">&times;</button>
                    </header>
                    <div class="app-dialog__body">
                        ${config.fields}
                    </div>
                    <footer class="app-dialog__actions">
                        <button type="button" class="app-dialog__cancel" data-action="cancel">Cancel</button>
                        <button type="submit" class="app-dialog__submit ${config.isDanger ? "app-dialog__submit--danger" : ""}">
                            ${config.submitText}
                        </button>
                    </footer>
                </form>
            `;

            this.activeDialog = dialogElement;

            const form = dialogElement.querySelector("form");

            const handleCancel = () => {
                this._cleanup(dialogElement);
                resolve(null);
            };

            dialogElement.querySelectorAll('[data-action="cancel"]').forEach(btn => {
                btn.addEventListener("click", handleCancel);
            });

            dialogElement.addEventListener("click", (event) => {
                if (event.target === dialogElement) {
                    handleCancel();
                }
            });

            form.addEventListener("submit", (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const result = Object.fromEntries(formData.entries());

                this._cleanup(dialogElement);
                resolve(result);
            });

            dialogElement.showModal();
        });

    }

    _cleanup(dialogElement) {
        if (dialogElement) {
            dialogElement.close();

            dialogElement.innerHTML = "";
            dialogElement.className = "";

            if (this.activeDialog === dialogElement) {
                this.activeDialog = null;
            }
        }
    }

    close() {
        if (this.activeDialog) {
            this._cleanup(this.activeDialog);
        }
    }
}

export const dialogs = new HandleDialogs();