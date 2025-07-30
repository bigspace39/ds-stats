// Swager: https://api.diapstash.com/api/docs/#/History
// Account: https://account.diapstash.com/account

const CLIENT_ID = "test-api-eada8297";
const REDIRECT_URI = "http://localhost:8080";
const AUTH_URL = "https://account.diapstash.com/oidc/auth";
const TOKEN_URL = "https://account.diapstash.com/oidc/token";
const BASE_API_URL = "https://api.diapstash.com/api";
const CHANGE_API_URL = `${BASE_API_URL}/v1/history/changes`;
const ACCIDENT_API_URL = `${BASE_API_URL}/v1/history/accidents`;
const TYPES_API_URL = `${BASE_API_URL}/v0/diaper/types`;
const CUSTOM_TYPES_API_URL = `${BASE_API_URL}/v0/diaper/types/custom`;
const BRANDS_API_URL = `${BASE_API_URL}/v0/diaper/brands`;
const SCOPE = "openid cloud-sync.history cloud-sync.types";

let changeHistory;
let accidentHistory;
let types = new Map();
let brands = new Map();

if (window.location.search) {
    handleOAuthCallback();
}
else if (getValidToken() == null) {
    login();
}
else {
    fetchData();
}

async function fetchData() {
    console.log("Attempting to fetch data with the following token:");
    const token = getTokenDebugObject();
    console.log(token);

    await fetchChangeHistory();
    await fetchAccidentHistory();
}

async function fetchChangeHistory() {
    let params = new URLSearchParams({
        size: 0
    });

    changeHistory = await fetchObjectFromAPI(CHANGE_API_URL, params, "change history");
    // let type = await getType(changeHistory.data[0].diapers[0].typeId);
    // let brand = await getBrand(type.type.brand_code);
}

async function fetchAccidentHistory() {
    let params = new URLSearchParams({
        size: 0
    });

    accidentHistory = await fetchObjectFromAPI(ACCIDENT_API_URL, params, "accident history");
}

async function getType(id) {
    if (types.has(id))
        return types.get(id);

    let type = await fetchObjectFromAPI(`${TYPES_API_URL}/${id}`, null, `type ${id}`);
    if (type != null)
        return type;

    type = await fetchObjectFromAPI(`${CUSTOM_TYPES_API_URL}/${id}`, null, `custom type ${id}`);
    return type;
}

async function getBrand(code) {
    if (brands.has(code))
        return brands.get(code);

    let brand = await fetchObjectFromAPI(`${BRANDS_API_URL}/${code}`, null, `brand ${code}`);
    return brand;
}

async function fetchObjectFromAPI(url, params, debugString) {
    const token = getValidToken();
    if (token == null) {
        console.error(`Tried to fetch ${debugString} with null token`);
        return;
    }

    if (params != null)
        url = `${url}?${params}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "DS-API-CLIENT-ID": CLIENT_ID
        }
    });

    let obj = await response.json();
    console.log(`Fetched ${debugString}:`);
    console.log(obj);
    return obj;
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

function getTokenDebugObject() {
    let token = localStorage.getItem('auth_token');
    try {
        if (token) {
            token = JSON.parse(token);
            token.expires_at = new Date(token.expires_at * 1000);
        }
    }
    catch (err) {
        console.log("Invalid token data");
    }

    return token;
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
    changeHistory = null;
    accidentHistory = null;
    types = new Map();
    brands = new Map();
    window.location.href = "/";
}