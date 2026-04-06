import { UIBuilder } from "../base-ui/ui-builder";
import { Statics } from "../library/statics";

export class NotificationArea {
    static {
        Statics.notificationArea = new NotificationArea();
    }

    div;

    constructor() {
        this.div = UIBuilder.createElement("div", Statics.mainDiv, "notification-area");
    }
}