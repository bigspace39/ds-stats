// Swager: https://api.diapstash.com/api/docs/#/History
// Account: https://account.diapstash.com/account

const CLIENT_ID = "test-api-eada8297";
let REDIRECT_URI = "http://localhost:8080/";
if (window.location.protocol == "https:") {
    REDIRECT_URI = "https://bigspace39.github.io/ds-stats/"
    console.log(`We are using https, assuming production, changing redirect uri to ${REDIRECT_URI}`);
}

const AUTH_URL = "https://account.diapstash.com/oidc/auth";
const TOKEN_URL = "https://account.diapstash.com/oidc/token";
const BASE_API_URL = "https://api.diapstash.com/api";
const CHANGE_API_URL = `${BASE_API_URL}/v1/history/changes`;
const ACCIDENT_API_URL = `${BASE_API_URL}/v1/history/accidents`;
const TYPES_API_URL = `${BASE_API_URL}/v0/diaper/types`;
const CUSTOM_TYPES_API_URL = `${BASE_API_URL}/v0/diaper/types/custom`;
const BRANDS_API_URL = `${BASE_API_URL}/v0/diaper/brands`;
const SCOPE = "openid offline_access username cloud-sync.history cloud-sync.stock cloud-sync.types";

let changeHistory = new Array();
let accidentHistory = new Array();
let types = new Map();
let brands = new Map();

async function handleAPI() {
    deserializeStoredData();

    if (window.location.search) {
        handleOAuthCallback();
    }
    else if (await getValidToken() == null) {
        loginPrompt.show();
    }
    else {
        fetchData();
    }
}

async function fetchData() {
    let fetchTime = localStorage.getItem("fetchDataTime");

    if (fetchTime) {
        fetchTime = new Date(fetchTime);
        let now = new Date();
        if ((now - fetchTime) / 1000 < 60) {
            console.log(`Tried to fetch data but it's been ${(now - fetchTime) / 1000} seconds since last fetch`);
            return;
        }
    }

    if (types.size == 0) {
        await fetchAllTypes();
    }

    if (brands.size == 0) {
        await fetchAllBrands();
    }

    await fetchChangeHistory();
    await fetchAccidentHistory();

    createdWidgets.forEach(function(value, key, map) {
        if (value.dashboardId != selectedDashboard.boardId)
            return;

        value.update();
    });

    localStorage.setItem("fetchDataTime", new Date().toUTCString());
}

async function fetchChangeHistory() {
    let params = new URLSearchParams({
        size: 0
    });

    let history = await fetchObjectFromAPI(CHANGE_API_URL, params, "change history");
    if (history == null || history.data == null)
        return;

    changeHistory = history.data;
    for (let i = 0; i < changeHistory.length; i++) {
        const change = changeHistory[i];
        if (change.startTime != null)
            change.startTime = new Date(change.startTime);

        if (change.endTime != null)
            change.endTime = new Date(change.endTime);

        change.price = 0;
        for (let j = 0; j < change.diapers.length; j++) {
            const diaper = change.diapers[j];
            change.price += diaper.price;
        }

        await setChangeString(change);
    }

    console.log("Modified change history:");
    console.log(changeHistory);
    localStorage.setItem("changeHistory", JSON.stringify(changeHistory));
}

async function fetchAccidentHistory() {
    let params = new URLSearchParams({
        size: 0
    });

    let history = await fetchObjectFromAPI(ACCIDENT_API_URL, params, "accident history");
    if (history == null || history.data == null)
        return;

    accidentHistory = history.data;
    localStorage.setItem("accidentHistory", JSON.stringify(accidentHistory));
}

async function fetchAllTypes() {
    let params = new URLSearchParams({
        size: 0
    });

    let temp = await fetchObjectFromAPI(TYPES_API_URL, params, "types");
    if (temp == null || temp.data == null)
        return;
    
    for (let i = 0; i < temp.data.length; i++) {
        types.set(temp.data[i].id, temp.data[i]);
    }
    
    // let customTemp = await fetchObjectFromAPI(CUSTOM_TYPES_API_URL, params, "custom types");
    // if (customTemp == null || customTemp.data == null)
    //     return;

    // for (let i = 0; i < customTemp.data.length; i++) {
    //     brands.set(customTemp.data[i].id, customTemp.data[i]);
    // }
}

async function fetchAllBrands() {
    let params = new URLSearchParams({
        size: 0
    });

    let temp = await fetchObjectFromAPI(BRANDS_API_URL, params, "brands");
    if (temp == null || temp.data == null)
        return;

    for (let i = 0; i < temp.data.length; i++) {
        brands.set(temp.data[i].code, temp.data[i]);
    }
}

async function getType(id) {
    if (types.has(id))
        return types.get(id);

    let type = await fetchObjectFromAPI(`${TYPES_API_URL}/${id}`, null, `type ${id}`);
    if (type.status == 404) {
        console.warn(`Tried to fetch official type with id ${id} but got a ${type.status} ${type.name}, trying to fetch custom type instead!`);
        type = await fetchObjectFromAPI(`${CUSTOM_TYPES_API_URL}/${id}`, null, `custom type ${id}`);
        if (type.status == 404) {
            console.error(`Tried to fetch custom type with id ${id} but got a ${type.status} ${type.name}`);
            return null;
        }
    }

    if (type == null || type.type == null)
        return;

    type = type.type;
    types.set(id, type);
    localStorage.setItem("types", JSON.stringify(Array.from(types.entries())));
    return type;
}

async function getBrand(code) {
    if (brands.has(code))
        return brands.get(code);

    let brand = await fetchObjectFromAPI(`${BRANDS_API_URL}/${code}`, null, `brand ${code}`);
    if (brand.status == 404) {
        console.error(`Tried to fetch brand with code ${code} but got a ${brand.status} ${brand.name}`);
        return null;
    }

    if (brand == null || brand.brand == null)
        return;

    brand = brand.brand;
    brands.set(code, brand);
    localStorage.setItem("brands", JSON.stringify(Array.from(brands.entries())));
    return brand;
}

async function setChangeString(change) {
    let str = "";
    let firstBrand = null;
    for (let i = 0; i < change.diapers.length; i++) {
        let diaper = change.diapers[i];
        const type = await getType(diaper.typeId);
        let brand = null;
        if (type != null && type.brand_code != null) {
            brand = await getBrand(type.brand_code);
            if (i == 0)
                firstBrand = brand;
        }

        if (i != 0)
            str += ", ";

        let fullName = "";
        fullName += brand != null ? brand.name.trim() + " " : "";
        fullName += type != null ? type.name.trim() : "Unknown";
        diaper.name = fullName;

        let name = "";
        name += brand != null && (brand != firstBrand || i == 0) ? brand.name.trim() + " " : "";
        name += type != null ? type.name.trim() : "Unknown";
        str += name;
    }

    change.changeString = str;
}

async function fetchObjectFromAPI(url, params, debugString) {
    const token = await getValidToken();
    if (token == null) {
        console.warn("No valid token, login required!");
        loginPrompt.show();
        return null;
    }

    if (params != null)
        url = `${url}?${params}`;

    let response = null;
    try {
        response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "DS-API-CLIENT-ID": CLIENT_ID
            }
        });
    }
    catch(err) {
        console.error(`Failed to fetch ${debugString}, error is: ${err}`);
        return null;
    }

    let obj = await response.json();
    console.log(`Fetched ${debugString}:`);
    console.log(obj);
    return obj;
}

function deserializeStoredData() {
    let temp = localStorage.getItem("changeHistory");
    if (temp) changeHistory = JSON.parse(temp);

    temp = localStorage.getItem("accidentHistory");
    if (temp) accidentHistory = JSON.parse(temp);

    temp = localStorage.getItem("types");
    if (temp) types = new Map(JSON.parse(temp));

    temp = localStorage.getItem("brands");
    if (temp) brands = new Map(JSON.parse(temp));
}

async function login() {
    const { code_verifier, code_challenge } = await generatePKCECodes();
    const state = crypto.randomUUID();
    const nonce = crypto.randomUUID();

    // Store in sessionStorage for use after redirect to get token
    sessionStorage.setItem("pkce_code_verifier", code_verifier);
    sessionStorage.setItem("oauth_state", state);

    const params = new URLSearchParams({
        response_type: "code",
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: SCOPE,
        code_challenge: code_challenge,
        code_challenge_method: "S256",
        state,
        nonce,
        prompt: "consent"
    });

    let url = `${AUTH_URL}?${params}`;
    window.location.href = url;
}

async function handleOAuthCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (code == null || state == null) {
        if (params.get("error"))
            console.warn(params.toString());
        else
            console.warn("Search parameters are not an OAuth callback, ignoring...");
        
        clearSearchParameters();
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
        code_verifier: code_verifier,
        redirect_uri: REDIRECT_URI,
        prompt: "consent"
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
    let jwt = decodeJwt(tokenResult.id_token);
    console.log(`Got token for user: ${jwt.username}`);
    console.log(getTokenDebugObject());

    clearSearchParameters();
    await fetchData();
}

function clearSearchParameters() {
    window.history.replaceState({ additionalInformation: 'Cleared OAuth callback parameters' }, '', REDIRECT_URI);
    sessionStorage.removeItem("pkce_code_verifier");
    sessionStorage.removeItem("oauth_state");
}

function saveToken(data) {
    const now = Date.now();
    const tokenData = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        access_expires_at: now + (data.expires_in * 1000)
    };
    localStorage.setItem('auth_token', JSON.stringify(tokenData));
}

async function getValidToken() {
    const raw = localStorage.getItem('auth_token');
    if (!raw) {
        return null;
    }

    try {
        const tokenData = JSON.parse(raw);
        const now = Date.now();
        if (now >= tokenData.access_expires_at) {
            console.warn('Stored token expired.');
            localStorage.removeItem('auth_token');

            let result = await fetchAccessTokenFromRefreshToken(tokenData);
            return result;
        }
        return tokenData.access_token;
    }
    catch (err) {
        console.error('Invalid token data:', err);
        localStorage.removeItem('auth_token');
        return null;
    }
}

async function fetchAccessTokenFromRefreshToken(tokenData) {
    const data = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: CLIENT_ID,
        refresh_token: tokenData.refresh_token,
        redirect_uri: REDIRECT_URI,
        prompt: "consent"
    });

    try {
        let response = await fetch(TOKEN_URL, {
            method: "POST",
            body: data,
        });

        response = await response.json();

        saveToken(response);
        let jwt = decodeJwt(response.id_token);
        console.log(`Got token using refresh token for user: ${jwt.username}`);
        console.log(getTokenDebugObject());

        return response.access_token;
    }
    catch(err) {
        console.error(`Failed to fetch access token using refresh token, error is: ${err}`);
        return null;
    }
}

function getTokenDebugObject() {
    let token = localStorage.getItem('auth_token');
    try {
        if (token) {
            token = JSON.parse(token);
            token.access_expires_at = new Date(token.access_expires_at);
        }
    }
    catch (err) {
        console.log("Invalid token data");
    }

    return token;
}

function decodeJwt(token) {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    try {
        const payload = atob(parts[1]);
        return JSON.parse(payload);
    } catch {
        return null;
    }
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
    localStorage.removeItem('auth_token');
    changeHistory = new Array();
    accidentHistory = new Array();
    types = new Map();
    brands = new Map();
    window.location.href = "/";
}