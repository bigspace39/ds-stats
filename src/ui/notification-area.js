import { UIBuilder } from "../base-ui/ui-builder.js";
import { Statics } from "../library/statics.js";

export class NotificationArea {
    static {
        Statics.notificationArea = new NotificationArea();
    }

    div;

    constructor() {
        this.div = UIBuilder.createElement("div", Statics.mainDiv, "notification-area");
    }
}