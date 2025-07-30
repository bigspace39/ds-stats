const CLIENT_ID = "test-api-eada8297";
const REDIRECT_URI = "http://localhost:8080";
const AUTH_URL = "https://account.diapstash.com/oidc/auth";
const TOKEN_URL = "https://account.diapstash.com/oidc/token";
const CHANGE_API_URL = "https://api.diapstash.com/api/v1/history/changes";
const SCOPE = "openid cloud-sync.history";

if (window.location.search) {
    handleOAuthCallback();
}
else if (getValidToken() == null) {
    login();
}
else {
    fetchData();
}

async function login() {
    const { code_verifier, code_challenge } = await generatePKCECodes();
    const state = crypto.randomUUID();
    const nonce = crypto.randomUUID();

    // Store in sessionStorage for use after redirect
    sessionStorage.setItem("pkce_code_verifier", code_verifier);
    sessionStorage.setItem("oauth_state", state);
    sessionStorage.setItem("oauth_nonce", nonce);

    const params = new URLSearchParams({
        response_type: "code",
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: SCOPE,
        code_challenge: code_challenge,
        code_challenge_method: "S256",
        state,
        nonce,
    });

    window.location.href = `${AUTH_URL}?${params}`;
}

async function handleOAuthCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (code == null || state == null) {
        clearSearchParameters();
        console.warn("Search parameters are not an OAuth callback, ignoring...");
        return;
    }

    const expectedState = sessionStorage.getItem("oauth_state");
    if (state !== expectedState) {
        alert("Invalid state");
        clearSearchParameters();
        return;
    }

    const code_verifier = sessionStorage.getItem("pkce_code_verifier");

    const data = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code_verifier: code_verifier
    });

    const response = await fetch(TOKEN_URL, {
        method: "POST",
        body: data,
    });

    const tokenResult = await response.json();
    if (tokenResult.error) {
        alert("Token exchange failed: " + tokenResult.error_description);
        clearSearchParameters();
        return;
    }

    saveToken(tokenResult);
    clearSearchParameters();
    await fetchData();
}

function clearSearchParameters() {
    window.history.replaceState({ additionalInformation: 'Cleared OAuth callback parameters' }, '', REDIRECT_URI);
}

function saveToken(data) {
    const now = Math.floor(Date.now() / 1000);
    const tokenData = {
        access_token: data.access_token,
        expires_at: now + data.expires_in
    };
    localStorage.setItem('auth_token', JSON.stringify(tokenData));
}

function getValidToken() {
    const raw = localStorage.getItem('auth_token');
    if (!raw) {
        return null;
    }

    try {
        const tokenData = JSON.parse(raw);
        const now = Math.floor(Date.now() / 1000);
        if (now >= tokenData.expires_at) {
            console.warn('Stored token expired.');
            localStorage.removeItem('auth_token');
            return null;
        }
        return tokenData.access_token;
    }
    catch (err) {
        console.error('Invalid token data:', err);
        localStorage.removeItem('auth_token');
        return null;
    }
}

async function fetchData() {
    await fetchChangeHistory();
}

async function fetchChangeHistory() {
    const token = getValidToken();
    if (token == null) {
        console.error("Tried to fetch change history with null token");
        return;
    }

    console.log(token);
    const response = await fetch(`${CHANGE_API_URL}?size=0`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "DS-API-CLIENT-ID": CLIENT_ID
        }
    });

    const data = await response.json();
    console.log(data);
    document.body.innerText = JSON.stringify(data, null, 2);
}

function base64URLEncode(str) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

async function generatePKCECodes() {
    const code_verifier = base64URLEncode(crypto.getRandomValues(new Uint8Array(32)));
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(code_verifier));
    const code_challenge = base64URLEncode(digest);
    return { code_verifier, code_challenge };
}

function logout() {
    sessionStorage.clear();
    window.location.href = "/";
}