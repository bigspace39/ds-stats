class LoginPrompt {
    div;
    p;
    button;

    constructor() {
        this.div = createElement("div", mainDiv, "login-box");
        this.p = createElement("p", this.div, "login-text");
        this.p.innerText = "You need to login!";
        this.button = createElement("button", this.div, "login-button");
        this.button.innerText = "Login";
        this.button.addEventListener("click", async function() {
            await login();
        });

        loginPrompt = this;
        this.hide();
    }

    show() {
        this.div.style.display = "";
    }

    hide() {
        this.div.style.display = "none";
    }
}

loginPrompt = new LoginPrompt();