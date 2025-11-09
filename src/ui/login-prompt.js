import { API } from "../diapstash-api.js";
import { Library } from "../library/library.js";

class LoginPrompt {
    static {
        Library.loginPrompt = new LoginPrompt();
    }

    div;
    p;
    button;

    constructor() {
        this.div = Library.createElement("div", Library.mainDiv, "login-box");
        this.p = Library.createElement("p", this.div, "login-text");
        this.p.innerText = "You need to login!";
        this.button = Library.createElement("button", this.div, "accent-button");
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