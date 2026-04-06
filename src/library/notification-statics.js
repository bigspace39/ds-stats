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

export class NotificationStatics {
    /** @type {Set<import("../ui/notification.js").Notification>} */
    static savedNotifications = new Set();

    /**
     * Creates a notification with the given type and returns it.
     * @param {NotificationType} notificationType 
     * @param {string} text 
     * @returns {Promise<import("../ui/notification.js").Notification>}
     */
    static async createNotification(notificationType, text) {
        const { Notification } = await import("../ui/notification.js");
        let notification = new Notification(notificationType, text);
        this.savedNotifications.add(notification);
        return notification;
    }
}