import { SpinnerUI } from "../base-ui/spinner-ui.js";
import { UIBuilder } from "../base-ui/ui-builder.js";
import { ElementStatics } from "../library/element-statics.js";
import { NotificationType, NotificationStatics } from "../library/notification-statics.js";
import { Statics } from "../library/statics.js";

export class Notification {
    /** @type {HTMLDivElement} */
    div;
    spinner;
    /** @type {HTMLSpanElement | HTMLParagraphElement} */
    leftElement;
    /** @type {HTMLParagraphElement} */
    text;
    /** @type {NodeJS.Timeout?} */
    timeout = null;
    isValid = true;

    /**
     * @param {NotificationType} type 
     * @param {string} text 
     */
    constructor(type, text) {
        this.div = UIBuilder.createElement("div", Statics.notificationArea.div, "notification");
        if (type == NotificationType.Loading) {
            this.spinner = new SpinnerUI(this.div, false);
            this.leftElement = this.spinner.span;
            this.spinner.span.style.margin = "0px";
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
                this.leftElement.innerText = "ℹ️";
            }

            this.startRemoveTimer();
            ElementStatics.bindOnClick(this.div, this, 
                /** @this {Notification} */
                function() {
                    this.remove();
                },
            this);
        }

        this.leftElement.style.marginRight = "10px";
        this.text = UIBuilder.createElement("p", this.div, "notification-text");
        this.text.innerText = text;
    }

    remove() {
        if (!this.isValid)
            return;

        this.div.remove();
        this.isValid = false;
        NotificationStatics.savedNotifications.delete(this);
    }

    /**
     * Sets the text of the notification if it needs to be updated after creation.
     * @param {string} text 
     */
    setText(text) {
        this.text.innerText = text;

        if (this.timeout != null) {
            clearTimeout(this.timeout);
            this.startRemoveTimer();
        }
    }

    startRemoveTimer() {
        this.timeout = setTimeout(() => { this.remove(); }, 5 * 1000);
    }
}