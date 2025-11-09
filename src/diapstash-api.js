import { Statics } from "./library/statics.js";
import { Database, DatabaseStore } from "./database.js";
import { Delegate } from "./library/delegate.js";
import { WidgetStatics } from "./library/widget-statics.js";

// Swager: https://api.diapstash.com/api/docs/#/History
// Account: https://account.diapstash.com/account

if (!crypto.subtle) {
    console.error("Web Crypto API (subtle) is not available. PKCE is unavailable so we cannot fetch any API data");
}

export class API {
    static CLIENT_ID = "test-api-eada8297";
    static AUTH_URL = "https://account.diapstash.com/oidc/auth";
    static TOKEN_URL = "https://account.diapstash.com/oidc/token";
    static BASE_API_URL = "https://api.diapstash.com/api";
    static CHANGE_API_URL = `${API.BASE_API_URL}/v1/history/changes`;
    static ACCIDENT_API_URL = `${API.BASE_API_URL}/v1/history/accidents`;
    static TYPES_API_URL = `${API.BASE_API_URL}/v1/type/types`;
    static CUSTOM_TYPES_API_URL = `${API.BASE_API_URL}/v1/type/types/custom`;
    static BRANDS_API_URL = `${API.BASE_API_URL}/v1/brand/brands`;
    static SCOPE = "openid offline_access username cloud-sync.history cloud-sync.stock cloud-sync.types";
    
    static changeHistory = new Array();
    static accidentHistory = new Array();
    static types = new Map();
    static brands = new Map();
    
    static isFetching = false;
    static onStartFetchAPIData = new Delegate();
    static onStopFetchAPIData = new Delegate();
   
    static async handleAPI() {
        if (window.location.search) {
            await API.handleOAuthCallback();
        }
        else if (await API.getValidToken() == null) {
            Statics.loginPrompt.show();
        }
        else {
            await API.fetchData();
        }
    }
    
    static async fetchData(bypassTimeCheck = false) {
        let fetchTimeStr = localStorage.getItem("fetchDataTime");
        
        if (!bypassTimeCheck && fetchTimeStr) {
            let fetchTime = new Date(fetchTimeStr);
            let now = new Date();
            if ((now.getTime() - fetchTime.getTime()) / 1000 < 60) {
                console.log(`Tried to fetch data but it's been ${(now.getTime() - fetchTime.getTime()) / 1000} seconds since last fetch`);
                return false;
            }
        }
    
        API.isFetching = true;
        API.onStartFetchAPIData.broadcast();
    
        if (API.types.size == 0) {
            await API.fetchAllTypes();
        }
    
        if (API.brands.size == 0) {
            await API.fetchAllBrands();
        }
    
        if (API.changeHistory.length == 0)
            await API.fetchChangeHistory();
        else
            await API.fetchNewChangeHistory();
    
        if (API.accidentHistory.length == 0)
            await API.fetchAccidentHistory();
        else
            await API.fetchNewAccidentHistory();
    
        await WidgetStatics.updateWidgetsOnSelectedDashboard();
    
        localStorage.setItem("fetchDataTime", new Date().toUTCString());
        API.onStopFetchAPIData.broadcast();
        API.isFetching = false;
        return true;
    }
    
    static async fetchChangeHistory() {
        let params = new URLSearchParams({
            size: String(0)
        });
    
        let history = await API.fetchObjectFromAPI(API.CHANGE_API_URL, params, "change history");
        if (history == null || history.data == null)
            return;
    
        API.changeHistory = history.data;
        await API.modifyChangeHistory(API.changeHistory);
        await Database.clearObjectStore(DatabaseStore.Changes);
        await Database.addArrayToObjectStore(DatabaseStore.Changes, API.changeHistory);
    }
    
    static async modifyChangeHistory(history) {
        for (let i = 0; i < history.length; i++) {
            const change = history[i];
            if (change.startTime != null)
                change.startTime = new Date(change.startTime);
    
            if (change.endTime != null)
                change.endTime = new Date(change.endTime);
    
            change.price = 0;
            for (let j = 0; j < change.diapers.length; j++) {
                const diaper = change.diapers[j];
                change.price += diaper.price;
            }
    
            await API.setChangeString(change);
        }
    
        console.log("Modified change history:");
        console.log(history);
    }
    
    static async fetchAccidentHistory() {
        let params = new URLSearchParams({
            size: String(0)
        });
    
        let history = await API.fetchObjectFromAPI(API.ACCIDENT_API_URL, params, "accident history");
        if (history == null || history.data == null)
            return;
    
        API.accidentHistory = history.data;
        await API.modifyAccidentHistory(API.accidentHistory);
        await Database.clearObjectStore(DatabaseStore.Accidents);
        await Database.addArrayToObjectStore(DatabaseStore.Accidents, API.accidentHistory);
    }
    
    static async modifyAccidentHistory(history) {
        for (let i = 0; i < history.length; i++) {
            const accident = history[i];
            if (accident.when != null)
                accident.when = new Date(accident.when);
        }
    
        console.log("Modified accident history:");
        console.log(history);
    }
    
    static async fetchNewChangeHistory() {
        const lastChange = API.changeHistory[API.changeHistory.length - 1];
        let params = new URLSearchParams({
            size: String(0),
            "startTime.gte": lastChange.startTime.toJSON()
        });
    
        let history = await API.fetchObjectFromAPI(API.CHANGE_API_URL, params, "new change history");
        if (history == null || history.data == null || history.data.length == 0)
            return;
    
        await API.modifyChangeHistory(history.data);
        await Database.putArrayInObjectStore(DatabaseStore.Changes, history.data);
        API.changeHistory = await Database.getAllFromObjectStore(DatabaseStore.Changes, "startDate");
        console.log("Change history after fetching new changes:");
        console.log(API.changeHistory);
    }
    
    static async fetchNewAccidentHistory() {
        const lastAccident = API.accidentHistory[API.accidentHistory.length - 1];
        let params = new URLSearchParams({
            size: String(0),
            "when.gte": lastAccident.when.toJSON()
        });
    
        let history = await API.fetchObjectFromAPI(API.ACCIDENT_API_URL, params, "new accident history");
        if (history == null || history.data == null || history.data.length == 0)
            return;
    
        await API.modifyAccidentHistory(history.data);
        await Database.putArrayInObjectStore(DatabaseStore.Accidents, history.data);
        API.accidentHistory = await Database.getAllFromObjectStore(DatabaseStore.Accidents, "when");
        console.log("Accident history after fetching new accidents:");
        console.log(API.accidentHistory);
    }
    
    static async fetchAllTypes() {
        let params = new URLSearchParams({
            size: String(0),
            detailed: String(true)
        });
    
        await Database.clearObjectStore(DatabaseStore.Types);
        API.types.clear();
    
        let temp = await API.fetchObjectFromAPI(API.TYPES_API_URL, params, "types");
        if (temp == null || temp.data == null)
            return;
        
        for (let i = 0; i < temp.data.length; i++) {
            API.types.set(temp.data[i].id, temp.data[i]);
        }
        
        let customTemp = await API.fetchObjectFromAPI(API.CUSTOM_TYPES_API_URL, params, "custom types");
        if (customTemp == null || customTemp.data == null)
            return;
    
        for (let i = 0; i < customTemp.data.length; i++) {
            API.types.set(customTemp.data[i].id, customTemp.data[i]);
        }
    
        await Database.putArrayInObjectStore(DatabaseStore.Types, customTemp.data);
        await Database.putArrayInObjectStore(DatabaseStore.Types, temp.data);
    }
    
    static async fetchAllBrands() {
        let params = new URLSearchParams({
            size: String(0)
        });
    
        await Database.clearObjectStore(DatabaseStore.Brands);
        API.brands.clear();
    
        let temp = await API.fetchObjectFromAPI(API.BRANDS_API_URL, params, "brands");
        if (temp == null || temp.data == null)
            return;
    
        for (let i = 0; i < temp.data.length; i++) {
            API.brands.set(temp.data[i].code, temp.data[i]);
        }
    
        await Database.addArrayToObjectStore(DatabaseStore.Brands, temp.data);
    }
    
    static async getType(id) {
        if (API.types.has(id))
            return API.types.get(id);
    
        let type = await API.fetchObjectFromAPI(`${API.TYPES_API_URL}/${id}`, null, `type ${id}`);
        if (type.status == 404) {
            console.warn(`Tried to fetch official type with id ${id} but got a ${type.status} ${type.name}, trying to fetch custom type instead!`);
            type = await API.fetchObjectFromAPI(`${API.CUSTOM_TYPES_API_URL}/${id}`, null, `custom type ${id}`);
            if (type.status == 404) {
                console.error(`Tried to fetch custom type with id ${id} but got a ${type.status} ${type.name}`);
                return null;
            }
        }
    
        if (type == null || type.type == null)
            return;
    
        type = type.type;
        API.types.set(id, type);
        Database.addToObjectStore(DatabaseStore.Types, type);
        return type;
    }
    
    static async getBrand(code) {
        if (API.brands.has(code))
            return API.brands.get(code);
    
        let brand = await API.fetchObjectFromAPI(`${API.BRANDS_API_URL}/${code}`, null, `brand ${code}`);
        if (brand.status == 404) {
            console.error(`Tried to fetch brand with code ${code} but got a ${brand.status} ${brand.name}`);
            return null;
        }
    
        if (brand == null || brand.brand == null)
            return;
    
        brand = brand.brand;
        API.brands.set(code, brand);
        Database.addToObjectStore(DatabaseStore.Brands, brand);
        return brand;
    }
    
    static async setChangeString(change) {
        let str = "";
        let firstBrand = null;
        for (let i = 0; i < change.diapers.length; i++) {
            let diaper = change.diapers[i];
            const type = await API.getType(diaper.typeId);
            let brand = null;
            if (type != null && type.brand_code != null) {
                brand = await API.getBrand(type.brand_code);
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
    
    static async fetchObjectFromAPI(url, params, debugString) {
        const token = await API.getValidToken();
        if (token == null) {
            console.warn("No valid token, login required!");
            Statics.loginPrompt.show();
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
                    "DS-API-CLIENT-ID": API.CLIENT_ID
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
    
    static async deserializeStoredAPIData() {
        API.changeHistory = await Database.getAllFromObjectStore(DatabaseStore.Changes, "startDate");
        for (let i = 0; i < API.changeHistory.length; i++) {
            let change = API.changeHistory[i];
            if (change.startTime != null)
                change.startTime = new Date(change.startTime);
    
            if (change.endTime != null)
                change.endTime = new Date(change.endTime);
        }
    
        API.accidentHistory = await Database.getAllFromObjectStore(DatabaseStore.Accidents, "when");
        for (let i = 0; i < API.accidentHistory.length; i++) {
            let accident = API.accidentHistory[i];
            if (accident.when != null)
                accident.when = new Date(accident.when);
        }
    
        API.types = await Database.getAllFromObjectStoreIntoMap(DatabaseStore.Types, "id");
        API.brands = await Database.getAllFromObjectStoreIntoMap(DatabaseStore.Brands, "code");
    }
    
    static async login() {
        const { code_verifier, code_challenge } = await API.generatePKCECodes();
        const state = crypto.randomUUID();
        const nonce = crypto.randomUUID();
    
        // Store in sessionStorage for use after redirect to get token
        sessionStorage.setItem("pkce_code_verifier", code_verifier);
        sessionStorage.setItem("oauth_state", state);
    
        const params = new URLSearchParams({
            response_type: "code",
            client_id: API.CLIENT_ID,
            redirect_uri: Statics.REDIRECT_URI,
            scope: API.SCOPE,
            code_challenge: code_challenge,
            code_challenge_method: "S256",
            state,
            nonce,
            prompt: "consent"
        });
    
        let url = `${API.AUTH_URL}?${params}`;
        window.location.href = url;
    }
    
    static async handleOAuthCallback() {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");
    
        if (code == null || state == null) {
            if (params.get("error"))
                console.warn(params.toString());
            else
                console.warn("Search parameters are not an OAuth callback, ignoring...");
            
            API.clearSearchParameters();
            return;
        }
    
        const expectedState = sessionStorage.getItem("oauth_state");
        if (state !== expectedState) {
            alert("Invalid state");
            API.clearSearchParameters();
            return;
        }
    
        const code_verifier = sessionStorage.getItem("pkce_code_verifier");
    
        const data = new URLSearchParams({
            grant_type: "authorization_code",
            code,
            client_id: API.CLIENT_ID,
            code_verifier: code_verifier,
            redirect_uri: Statics.REDIRECT_URI,
            prompt: "consent"
        });
    
        const response = await fetch(API.TOKEN_URL, {
            method: "POST",
            body: data,
        });
    
        const tokenResult = await response.json();
        if (tokenResult.error) {
            alert("Token exchange failed: " + tokenResult.error_description);
            API.clearSearchParameters();
            return;
        }
    
        API.saveToken(tokenResult);
        let jwt = API.decodeJwt(tokenResult.id_token);
        console.log(`Got token for user: ${jwt.username}`);
        console.log(API.getTokenDebugObject());
    
        API.clearSearchParameters();
        await API.fetchData();
    }
    
    static clearSearchParameters() {
        window.history.replaceState({ additionalInformation: 'Cleared OAuth callback parameters' }, '', Statics.REDIRECT_URI);
        sessionStorage.removeItem("pkce_code_verifier");
        sessionStorage.removeItem("oauth_state");
    }
    
    static saveToken(data) {
        const now = Date.now();
        let jwt = API.decodeJwt(data.id_token);
        const tokenData = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            access_expires_at: now + (data.expires_in * 1000),
            username: jwt.username
        };
        localStorage.setItem('auth_token', JSON.stringify(tokenData));
    }
    
    static async getValidToken() {
        let tokenObject = await API.getValidTokenObject();
        if (tokenObject == null)
            return null;
    
        return tokenObject.access_token;
    }
    
    static async getValidTokenObject() {
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
    
                let result = await API.fetchAccessTokenFromRefreshToken(tokenData);
                return result;
            }
            return tokenData;
        }
        catch (err) {
            console.error('Invalid token data:', err);
            localStorage.removeItem('auth_token');
            return null;
        }
    }
    
    static async fetchAccessTokenFromRefreshToken(tokenData) {
        const data = new URLSearchParams({
            grant_type: "refresh_token",
            client_id: API.CLIENT_ID,
            refresh_token: tokenData.refresh_token,
            redirect_uri: Statics.REDIRECT_URI,
            prompt: "consent"
        });
    
        try {
            let response = await fetch(API.TOKEN_URL, {
                method: "POST",
                body: data,
            });
    
            let responseJson = await response.json();
    
            API.saveToken(responseJson);
            let jwt = API.decodeJwt(responseJson.id_token);
            console.log(`Got token using refresh token for user: ${jwt.username}`);
            console.log(API.getTokenDebugObject());
    
            return responseJson;
        }
        catch(err) {
            console.error(`Failed to fetch access token using refresh token, error is: ${err}`);
            return null;
        }
    }
    
    static getTokenDebugObject() {
        let token = localStorage.getItem('auth_token');
        try {
            if (token) {
                let tokenJson = JSON.parse(token);
                tokenJson.access_expires_at = new Date(tokenJson.access_expires_at);
            }
        }
        catch (err) {
            console.log("Invalid token data");
        }
    
        return token;
    }
    
    static decodeJwt(token) {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        try {
            const payload = atob(parts[1]);
            return JSON.parse(payload);
        } catch {
            return null;
        }
    }
    
    static base64URLEncode(str) {
        return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
    }
    
    static async generatePKCECodes() {
        const code_verifier = API.base64URLEncode(crypto.getRandomValues(new Uint8Array(32)));
        const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(code_verifier));
        const code_challenge = API.base64URLEncode(digest);
        return { code_verifier, code_challenge };
    }
    
    static async logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem("fetchDataTime");
        await Database.clearObjectStore(DatabaseStore.Changes);
        await Database.clearObjectStore(DatabaseStore.Accidents);
        await Database.clearObjectStore(DatabaseStore.Types);
        await Database.clearObjectStore(DatabaseStore.Brands);
        window.location.href = "/";
    }
}