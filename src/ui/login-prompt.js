import { UIBuilder } from "../base-ui/ui-builder.js";
import { API } from "../diapstash-api.js";
import { Statics } from "../library/statics.js";

class LoginPrompt {
    static {
        Statics.loginPrompt = new LoginPrompt();
    }

    div;
    p;
    button;

    constructor() {
        this.div = UIBuilder.createElement("div", Statics.mainDiv, "login-box");
        this.p = UIBuilder.createElement("p", this.div, "login-text");
        this.p.innerText = "You need to login!";
        this.button = UIBuilder.createElement("button", this.div, "accent-button");
        this.button.innerText = "Login";
        this.button.addEventListener("click", async function() {
            await API.login();
        });

        this.hide();
    }

    show() {
        this.div.style.display = "";
    }

    hide() {
        this.div.style.display = "none";
    }
}