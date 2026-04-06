import { SpinnerUI } from "../base-ui/spinner-ui";
import { UIBuilder } from "../base-ui/ui-builder";
import { Statics } from "../library/statics";

/**
 * @readonly
 * @enum {number}
 */
export let NotificationType = {
    Info: 0,
    Warning: 1,
    Error: 2,
    Success: 3,
    Loading: 4
}

export class Notification {
    /** @type {HTMLDivElement} */
    div;
    spinner;
    /** @type {HTMLSpanElement | HTMLParagraphElement} */
    leftElement;
    /** @type {HTMLParagraphElement} */
    text;

    /**
     * @param {NotificationType} type 
     * @param {string} text 
     */
    constructor(type, text) {
        this.div = UIBuilder.createElement("div", Statics.notificationArea.div, "notification");
        if (type == NotificationType.Loading) {
            this.spinner = new SpinnerUI(this.div, false);
            this.leftElement = this.spinner.span;
        }
        else {
            this.leftElement = UIBuilder.createElement("p", this.div, "notification-icon");
            if (type == NotificationType.Error) {
                this.leftElement.innerText = "❌";
                this.div.style.backgroundColor = "#ff8b8b";
            }
            else if (type == NotificationType.Success) {
                this.leftElement.innerText = "✅";
                this.div.style.backgroundColor = "#92ff92";
            }
            else if (type == NotificationType.Warning) {
                this.leftElement.innerText = "⚠️";
                this.div.style.backgroundColor = "#ffc252";
            }
            else if (type == NotificationType.Info) {
                this.leftElement.innerText = "🛈";
            }

            setTimeout(this.onTimeout, 5 * 1000);
        }

        this.leftElement.style.marginRight = "10px";
        this.text = UIBuilder.createElement("p", this.div, "notification-text");
        this.text.innerText = text;
    }

    onTimeout() {
        this.div.remove();
    }

    /**
     * Sets the text of the notification if it needs to be updated after creation.
     * @param {string} text 
     */
    setText(text) {
        this.text.innerText = text;
    }
}