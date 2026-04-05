import { Statics } from "./library/statics.js";
import { Database, DatabaseStore } from "./database.js";
import { Delegate } from "./library/delegate.js";
import { WidgetStatics } from "./library/widget-statics.js";
import { Enum } from "./library/enum.js";

// Swager: https://api.diapstash.com/api/docs/#/History
// Account: https://account.diapstash.com/account

if (!crypto.subtle) {
    console.error("Web Crypto API (subtle) is not available. PKCE is unavailable so we cannot fetch any API data");
}

class FetchDataType extends Enum {
    static Changes = "changes";
    static Accidents = "accidents";
    static Brands = "brands";
    static Types = "types";
    static CustomTypes = "custom types";
    static Stocks = "stocks";
    static DisposableStocks = "disposable stocks";
    static ReusableStocks = "reusable stocks";
}

export class API {
    static CLIENT_ID = "diapstash-statistics-2b43cf32";
    static AUTH_URL = "https://account.diapstash.com/oidc/auth";
    static TOKEN_URL = "https://account.diapstash.com/oidc/token";
    static BASE_API_URL = "https://api.diapstash.com/api";
    static CHANGE_API_URL = `${API.BASE_API_URL}/v1/history/changes`;
    static ACCIDENT_API_URL = `${API.BASE_API_URL}/v1/history/accidents`;
    static DISPOSABLE_STOCKS_API_URL = `${API.BASE_API_URL}/v1/stock/disposables`;
    static REUSABLE_STOCKS_API_URL = `${API.BASE_API_URL}/v1/stock/reusables`;
    static TYPES_API_URL = `${API.BASE_API_URL}/v1/type/types`;
    static CUSTOM_TYPES_API_URL = `${API.BASE_API_URL}/v1/type/types/custom`;
    static BRANDS_API_URL = `${API.BASE_API_URL}/v1/brand/brands`;
    static SCOPE = "openid offline_access username cloud-sync.history cloud-sync.stock cloud-sync.types";
    static MAX_FETCH_SIZE = 200;
    static LOCAL_STORAGE_RATELIMIT_PREFIX = "rateLimit_";
    
    /** @type {APITypes.Change[]} */
    static changeHistory = new Array();
    /** @type {APITypes.Accident[]} */
    static accidentHistory = new Array();
    /** This is currently disabled since it's not in use! */
    static disposableStocks = new Array();
    /** This is currently disabled since it's not in use! */
    static reusableStocks = new Array();
    /** @type {Map<number, APITypes.Type>} */
    static types = new Map();
    /** @type {Map<string, APITypes.Brand>} */
    static brands = new Map();
    
    static isFetching = false;
    static onStartFetchAPIData = new Delegate();
    static onStopFetchAPIData = new Delegate();

    static #rateLimited = false;
   
    static async handleAPI() {
        if (window.location.search) {
            await API.#handleOAuthCallback();
        }
        else if (await API.getValidToken() == null) {
            Statics.loginPrompt.show();
        }
        else {
            await API.fetchData();
        }
    }
    
    /**
     * If we have no API data, will fetch all types, brands, changes, and accidents.
     * If we have already fetched before, only new changes, and accidents will be fetched.
     * @param {boolean} bypassTimeCheck Whether we should check the time since last fetch and disallow fetching if too recent.
     * @returns {Promise<boolean>} Returns false if we aren't allowed to fetch yet (based on time check).
     */
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
    
        API.#rateLimited = false;
        API.isFetching = true;
        API.onStartFetchAPIData.broadcast();

        if (API.brands.size == 0 && !API.#rateLimited) {
            await API.fetchBrands();
        }
    
        if (!API.#rateLimited) {
            await API.fetchTypes();
        }
    
        if (!API.#rateLimited) {
            let changePromise = API.fetchChangeHistory();
            let accidentPromise = API.fetchAccidentHistory();
            await changePromise;
            await accidentPromise;
        }

        // TODO: We need to fetch this more efficiently, and only new stocks/updated stocks
        // await API.fetchDisposableStocks();
        // await API.fetchReusableStocks();
    
        await WidgetStatics.updateWidgetsOnSelectedDashboard();
    
        localStorage.setItem("fetchDataTime", new Date().toUTCString());
        API.onStopFetchAPIData.broadcast();
        API.isFetching = false;
        return true;
    }
    
    /**
     * Fetches either the entire change history, or just the new changes if we already have some history.
     * @param {boolean} fullRefetch If true, will clear the database and refetch from scratch.
     * @returns {Promise<void>}
     */
    static async fetchChangeHistory(fullRefetch = false) {
        let params = new URLSearchParams({
            size: String(API.MAX_FETCH_SIZE),
            sort: "startTime,desc"
        });

        if (API.changeHistory.length == 0 || fullRefetch) {
            fullRefetch = true;
        }
        else {
            let fetchTime = API.getFetchTime(FetchDataType.Changes);
            if (fetchTime == null) {
                console.warn("Couldn't get the fetch time for changes, performing a full refetch!");
                fullRefetch = true;
            }
            else {
                params.append("updatedAt.gt", fetchTime.toJSON());
            }
        }

        if (fullRefetch) {
            localStorage.removeItem(API.LOCAL_STORAGE_RATELIMIT_PREFIX + FetchDataType.Changes);
            console.log("Performing full refetch of all changes");
        }
        
        let currentTime = new Date();
        params.append("updatedAt.lte", currentTime.toJSON());
        API.setFetchTime(FetchDataType.Changes, currentTime);

        let history = await API.#fetchIncrementallyFromAPI(API.CHANGE_API_URL, params, FetchDataType.Changes);
        if (history == null || history.length == 0)
            return;

        if (fullRefetch) {
            await Database.clearObjectStore(DatabaseStore.Changes);
        }
    
        await API.#modifyChangeHistory(history);
        await Database.putArrayInObjectStore(DatabaseStore.Changes, history);
        await API.#deserializeChangeHistory();
        console.log("Change history after fetching:");
        console.log(API.changeHistory);
    }
    
    /**
     * Loops through the change history and makes the times be actual Date objects instead of strings and also sets the changeString and overall price for the change.
     * @param {APITypes.Change[]} history 
     */
    static async #modifyChangeHistory(history) {
        for (let i = 0; i < history.length; i++) {
            const change = history[i];
    
            change.price = 0;
            for (let j = 0; j < change.diapers.length; j++) {
                const diaper = change.diapers[j];

                if (diaper.price != null)
                    change.price += diaper.price;
            }
    
            await API.#setChangeString(change);
        }
    
        console.log("Modified change history:");
        console.log(history);
    }
    
    /**
     * Fetches either the entire accident history, or just the new accidents if we already have some history.
     *  @param {boolean} fullRefetch If true, will clear the database and refetch from scratch.
     * @returns {Promise<void>}
     */
    static async fetchAccidentHistory(fullRefetch = false) {
        let params = new URLSearchParams({
            size: String(API.MAX_FETCH_SIZE),
            sort: "createdAt,desc"
        });

        if (API.accidentHistory.length == 0 || fullRefetch) {
            fullRefetch = true;
        }
        else {
            let fetchTime = API.getFetchTime(FetchDataType.Accidents);
            if (fetchTime == null) {
                console.warn("Couldn't get the fetch time for accidents, performing a full refetch!");
                fullRefetch = true;
            }
            else {
                params.append("updatedAt.gt", fetchTime.toJSON());
            }
        }

        if (fullRefetch) {
            localStorage.removeItem(API.LOCAL_STORAGE_RATELIMIT_PREFIX + FetchDataType.Accidents);
            console.log("Performing full refetch of all accidents");
        }

        let currentTime = new Date();
        params.append("updatedAt.lte", currentTime.toJSON());
        API.setFetchTime(FetchDataType.Accidents, currentTime);

        let history = await API.#fetchIncrementallyFromAPI(API.ACCIDENT_API_URL, params, FetchDataType.Accidents);
        if (history == null || history.length == 0)
            return;

        if (fullRefetch) {
            await Database.clearObjectStore(DatabaseStore.Accidents);
        }
    
        await Database.putArrayInObjectStore(DatabaseStore.Accidents, history);
        await API.#deserializeAccidentHistory();
        console.log("Accident history after fetching:");
        console.log(API.accidentHistory);
    }

    // static async fetchDisposableStocks() {
    //     let params = new URLSearchParams({
    //         size: String(API.MAX_FETCH_SIZE)
    //     });
    
    //     let history = await API.#fetchObjectFromAPI(API.DISPOSABLE_STOCKS_API_URL, params, "disposable stocks");
    //     if (history == null || history.data == null)
    //         return;
    
    //     API.disposableStocks = history.data;
    //     await Database.clearObjectStore(DatabaseStore.DisposableStocks);
    //     await Database.putArrayInObjectStore(DatabaseStore.DisposableStocks, API.disposableStocks);
    // }

    // static async fetchReusableStocks() {
    //     let params = new URLSearchParams({
    //         size: String(API.MAX_FETCH_SIZE)
    //     });
    
    //     let history = await API.#fetchObjectFromAPI(API.REUSABLE_STOCKS_API_URL, params, "reusable stocks");
    //     if (history == null || history.data == null)
    //         return;
    
    //     API.reusableStocks = history.data;
    //     await Database.clearObjectStore(DatabaseStore.ReusableStocks);
    //     await Database.putArrayInObjectStore(DatabaseStore.ReusableStocks, API.reusableStocks);
    // }
    
    /**
     * Fetches either the entire type catalog, or just the new/updated types if we already have some.
     * @param {boolean} fullRefetch If true, will clear the database and refetch from scratch.
     * @returns {Promise<void>}
     */
    static async fetchTypes(fullRefetch = false) {
        let params = new URLSearchParams({
            size: String(API.MAX_FETCH_SIZE),
            detailed: String(true)
        });

        if (API.types.size == 0 || fullRefetch) {
            fullRefetch = true;
        }
        else {
            let fetchTime = API.getFetchTime(FetchDataType.Types);
            if (fetchTime == null) {
                console.warn("Couldn't get the fetch time for types, performing a full refetch!");
                fullRefetch = true;
            }
            else {
                params.append("updatedAt.gt", fetchTime.toJSON());
            }
        }

        if (fullRefetch) {
            localStorage.removeItem(API.LOCAL_STORAGE_RATELIMIT_PREFIX + FetchDataType.CustomTypes);
            localStorage.removeItem(API.LOCAL_STORAGE_RATELIMIT_PREFIX + FetchDataType.Types);
            console.log("Performing full refetch of all types");
        }
        
        let currentTime = new Date();
        params.append("updatedAt.lte", currentTime.toJSON());
        API.setFetchTime(FetchDataType.Types, currentTime);
        
        let customTemp = await API.#fetchIncrementallyFromAPI(API.CUSTOM_TYPES_API_URL, params, FetchDataType.CustomTypes);
        let temp = await API.#fetchIncrementallyFromAPI(API.TYPES_API_URL, params, FetchDataType.Types);

        if (fullRefetch && (customTemp != null || temp != null)) {
            await Database.clearObjectStore(DatabaseStore.Types);
        }

        let typesChanged = false;
        if (customTemp != null && customTemp.length > 0) {
            await Database.putArrayInObjectStore(DatabaseStore.Types, customTemp);
            typesChanged = true;
        }
    
        if (temp != null && temp.length > 0) {
            await Database.putArrayInObjectStore(DatabaseStore.Types, temp);
            typesChanged = true;
        }

        if (!typesChanged)
            return;
        
        await API.#deserializeTypes();
        console.log("Types after fetching:");
        console.log(API.types);
    }
    
    /**
     * Deletes brands from the database and does a complete refetch of them.
     * @returns {Promise<void>}
     */
    static async fetchBrands() {
        let params = new URLSearchParams({
            size: String(API.MAX_FETCH_SIZE)
        });
    
        await Database.clearObjectStore(DatabaseStore.Brands);
        API.brands.clear();
    
        let temp = await API.#fetchIncrementallyFromAPI(API.BRANDS_API_URL, params, FetchDataType.Brands);
        if (temp == null || temp.length == 0)
            return;
    
        for (let i = 0; i < temp.length; i++) {
            API.brands.set(temp[i].code, temp[i]);
        }
    
        await Database.putArrayInObjectStore(DatabaseStore.Brands, temp);
    }
    
    /**
     * Returns the type if it has already been fetched, otherwise fetches it, saves it and returns it.
     * @param {number} id The id of the type to get.
     * @returns {Promise<APITypes.Type | undefined | null>}
     */
    static async getType(id) {
        if (API.types.has(id))
            return API.types.get(id);
    
        let type = await API.#fetchObjectFromAPI(`${API.TYPES_API_URL}/${id}`, null, `type ${id}`);
        if (type.status == 404) {
            console.warn(`Tried to fetch official type with id ${id} but got a ${type.status} ${type.name}, trying to fetch custom type instead!`);
            type = await API.#fetchObjectFromAPI(`${API.CUSTOM_TYPES_API_URL}/${id}`, null, `custom type ${id}`);
            if (type.status == 404) {
                console.error(`Tried to fetch custom type with id ${id} but got a ${type.status} ${type.name}`);
                return null;
            }
        }
    
        if (type == null || type.type == null || (type.status && !type.ok))
            return null;
    
        type = type.type;
        API.types.set(id, type);
        Database.addToObjectStore(DatabaseStore.Types, type);
        return type;
    }
    
    /**
     * Returns the brand if it has already been fetched, otherwise fetches it, saves it and returns it.
     * @param {string} code The code of the brand to get.
     * @returns {Promise<APITypes.Brand | undefined | null>}
     */
    static async getBrand(code) {
        if (API.brands.has(code))
            return API.brands.get(code);
    
        let brand = await API.#fetchObjectFromAPI(`${API.BRANDS_API_URL}/${code}`, null, `brand ${code}`);
        if (brand.status == 404) {
            console.error(`Tried to fetch brand with code ${code} but got a ${brand.status} ${brand.name}`);
            return null;
        }
    
        if (brand == null || brand.brand == null || (brand.status && !brand.ok))
            return null;
    
        brand = brand.brand;
        API.brands.set(code, brand);
        Database.addToObjectStore(DatabaseStore.Brands, brand);
        return brand;
    }

    /**
     * Will get the fetch time for the given data type str from localStorage.
     * @param {string} fetchTimeType The type of data that was fetched.
     * @returns {Date | null} 
     */
    static getFetchTime(fetchTimeType) {
        let str = localStorage.getItem("fetchTime_" + fetchTimeType);
        if (str == null)
            return null;

        let date = new Date(str);
        return date;
    }

    /**
     * Will set the fetch time for the given data type str in localStorage.
     * @param {string} fetchTimeType The type of data that was fetched.
     * @param {Date} time The fetch time.
     */
    static setFetchTime(fetchTimeType, time) {
        let str = time.toUTCString();
        localStorage.setItem("fetchTime_" + fetchTimeType, str);
    }
    
    /**
     * 
     * @param {APITypes.Change} change 
     */
    static async #setChangeString(change) {
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

    /**
     * Will keep fetching until all items in the list have been fetched or we hit the rate limit!
     * @param {string} url The endpoint for which to fetch from.
     * @param {URLSearchParams} params The parameters for the fetch
     * @param {string} type The string that will be used to print what was fetched to the log and to save what was partially fetched.
     * @param {Number} page The page to start on.
     * @returns {Promise<any[] | null>}
     */
    static async #fetchIncrementallyFromAPI(url, params, type, page = 0) {
        let data = new Array();
        let rateLimitInfoStr = localStorage.getItem(API.LOCAL_STORAGE_RATELIMIT_PREFIX + type);
        while (true) {
            params.set("page", String(page));
            let object = await API.#fetchObjectFromAPI(url, params, type);
            if (object == null)
                return null;

            if (object.status && object.status == 429) {
                /** @type {Response} */
                let response = object;
                let retryAfter = response.headers.get("retry-after");
                let retryAfterFloat = null;
                let minutes = null;
                if (retryAfter != null) {
                    retryAfterFloat = parseFloat(retryAfter);
                    minutes = retryAfterFloat / 60.0;
                }
                console.warn(`Rate limit reached while incrementally fetching ${type}, will expire in ${minutes} minutes`);
                API.#rateLimited = true;

                if (page > 0 && rateLimitInfoStr == null && type != FetchDataType.Brands) {
                    /** @type {APITypes.RateLimitInfo} */
                    const newRateLimit = {
                        type: type,
                        attemptedPage: page,
                        url: url,
                        params: params.toString(),
                        retryAfter: retryAfterFloat
                    };
                    localStorage.setItem(API.LOCAL_STORAGE_RATELIMIT_PREFIX + type, JSON.stringify(newRateLimit));
                    console.log("Saving rate limit info for fetch!");
                    console.log(newRateLimit);
                    break;
                }
                
                return null;
            }

            data = data.concat(object.data);
            let currentCount = page * object.size + object.count;
            let totalCount = object.totalCount;
            if (currentCount == totalCount)
                break;

            ++page;
        }

        if (rateLimitInfoStr != null) {
            /** @type {APITypes.RateLimitInfo} */
            let rateLimitInfo = JSON.parse(rateLimitInfoStr);
            console.log("Continuing previously rate limited fetch!");
            console.log(rateLimitInfo);
            localStorage.removeItem(API.LOCAL_STORAGE_RATELIMIT_PREFIX + type);
            let moreData = await API.#fetchIncrementallyFromAPI(rateLimitInfo.url, new URLSearchParams(rateLimitInfo.params), rateLimitInfo.type, rateLimitInfo.attemptedPage - 1);
            if (moreData != null)
                data.concat(moreData);
        }

        return data;
    }
    
    /**
     * Will fetch the javascript object from the specified API endpoint url with the specified params.
     * @param {string} url The endpoint for which to fetch from.
     * @param {URLSearchParams?} params The parameters for the fetch
     * @param {string} type The string that will be used to print what was fetched to the log.
     */
    static async #fetchObjectFromAPI(url, params, type) {
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
            console.error(`Failed to fetch ${type}, error is: ${err}`);
            return null;
        }

        if (!response.ok) {
            console.warn(`Failed to fetch ${type} because of status ${response.status} (${await response.text()})`);
            return response;
        }
    
        let obj = await response.json();
        console.log(`Fetched ${type}:`);
        console.log(obj);
        return obj;
    }
    
    /**
     * Loads all changes, accidents, types, and brands into memory from the database.
     */
    static async deserializeStoredAPIData() {
        await API.#deserializeChangeHistory();
        await API.#deserializeAccidentHistory();
        
        await API.#deserializeBrands();
        await API.#deserializeTypes();
        await API.#deserializeDisposableStocks();
        await API.#deserializeReusableStocks();
    }

    static async #deserializeChangeHistory() {
        API.changeHistory = await Database.getAllFromObjectStore(DatabaseStore.Changes, "startDate");
        for (let i = 0; i < API.changeHistory.length; i++) {
            let change = API.changeHistory[i];
            if (change.startTime != null)
                change.startTime = new Date(change.startTime);
    
            if (change.endTime != null)
                change.endTime = new Date(change.endTime);

            change.createdAt = new Date(change.createdAt);

            if (change.updatedAt != null)
                change.updatedAt = new Date(change.updatedAt);
        }
    }

    static async #deserializeAccidentHistory() {
        API.accidentHistory = await Database.getAllFromObjectStore(DatabaseStore.Accidents, "when");
        for (let i = 0; i < API.accidentHistory.length; i++) {
            let accident = API.accidentHistory[i];
            if (accident.when != null)
                accident.when = new Date(accident.when);

            accident.createdAt = new Date(accident.createdAt);

            if (accident.updatedAt != null)
                accident.updatedAt = new Date(accident.updatedAt);
        }
    }

    static async #deserializeBrands() {
        API.brands = await Database.getAllFromObjectStoreIntoMap(DatabaseStore.Brands, "code");
    }

    static async #deserializeTypes() {
        API.types = await Database.getAllFromObjectStoreIntoMap(DatabaseStore.Types, "id");
        API.types.forEach(function(value, key, map) {
            value.createdAt = new Date(value.createdAt);

            if (value.updatedAt != null)
                value.updatedAt = new Date(value.updatedAt);
        });
    }

    static async #deserializeDisposableStocks() {
        API.disposableStocks = await Database.getAllFromObjectStore(DatabaseStore.DisposableStocks, "order");
    }

    static async #deserializeReusableStocks() {
        API.reusableStocks = await Database.getAllFromObjectStore(DatabaseStore.ReusableStocks, "order");
    }
    
    /**
     * Redirects the browser to the login page for the diapstash API.
     */
    static async login() {
        const { code_verifier, code_challenge } = await API.#generatePKCECodes();
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
    
    static async #handleOAuthCallback() {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");
    
        if (code == null || state == null) {
            if (params.get("error"))
                console.warn(params.toString());
            else
                console.warn("Search parameters are not an OAuth callback, ignoring...");
            
            API.#clearSearchParameters();
            return;
        }
    
        const expectedState = sessionStorage.getItem("oauth_state");
        if (state !== expectedState) {
            alert("Invalid state");
            API.#clearSearchParameters();
            return;
        }
    
        const code_verifier = sessionStorage.getItem("pkce_code_verifier");
    
        // @ts-ignore
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
            API.#clearSearchParameters();
            return;
        }
    
        API.#saveToken(tokenResult);
        let jwt = API.#decodeJwt(tokenResult.id_token);
        console.log(`Got token for user: ${jwt.username}`);
        console.log(API.#getTokenDebugObject());
    
        API.#clearSearchParameters();
        await API.fetchData();
    }
    
    static #clearSearchParameters() {
        window.history.replaceState({ additionalInformation: 'Cleared OAuth callback parameters' }, '', Statics.REDIRECT_URI);
        sessionStorage.removeItem("pkce_code_verifier");
        sessionStorage.removeItem("oauth_state");
    }
    
    /**
     * Saves the raw fetched token into localStorage
     * @param {any} data 
     */
    static #saveToken(data) {
        const now = Date.now();
        let jwt = API.#decodeJwt(data.id_token);
        /** @type {APITypes.AuthToken} */
        const tokenData = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            access_expires_at: now + (data.expires_in * 1000),
            username: jwt.username
        };
        localStorage.setItem('auth_token', JSON.stringify(tokenData));
    }
    
    /**
     * Gets the access token string if there is a valid one.
     * @returns {Promise<string?>} The access token
     */
    static async getValidToken() {
        let tokenObject = await API.getValidTokenObject();
        if (tokenObject == null)
            return null;
    
        return tokenObject.access_token;
    }
    
    /**
     * Gets the auth token object if there is a valid one.
     * @returns {Promise<APITypes.AuthToken | null>} The auth token object.
     */
    static async getValidTokenObject() {
        const raw = localStorage.getItem('auth_token');
        if (!raw) {
            return null;
        }
    
        try {
            /** @type {APITypes.AuthToken} */
            const tokenData = JSON.parse(raw);
            const now = Date.now();
            if (now >= tokenData.access_expires_at) {
                console.warn('Stored token expired.');
                localStorage.removeItem('auth_token');
    
                let result = await API.#fetchAccessTokenFromRefreshToken(tokenData);
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
    
    /**
     * Fetches a new access token using the refresh token as part of the given auth token.
     * @param {APITypes.AuthToken} tokenData 
     * @returns {Promise<any | null>}
     */
    static async #fetchAccessTokenFromRefreshToken(tokenData) {
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
    
            API.#saveToken(responseJson);
            let jwt = API.#decodeJwt(responseJson.id_token);
            console.log(`Got token using refresh token for user: ${jwt.username}`);
            console.log(API.#getTokenDebugObject());
    
            return responseJson;
        }
        catch(err) {
            console.error(`Failed to fetch access token using refresh token, error is: ${err}`);
            return null;
        }
    }
    
    static #getTokenDebugObject() {
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
    
    /**
     * 
     * @param {any} token 
     * @returns 
     */
    static #decodeJwt(token) {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        try {
            const payload = atob(parts[1]);
            return JSON.parse(payload);
        } catch {
            return null;
        }
    }

    /**
     * 
     * @param {any} str 
     * @returns 
     */
    static #base64URLEncode(str) {
        // @ts-ignore
        return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
    }
    
    static async #generatePKCECodes() {
        const code_verifier = API.#base64URLEncode(crypto.getRandomValues(new Uint8Array(32)));
        const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(code_verifier));
        const code_challenge = API.#base64URLEncode(digest);
        return { code_verifier, code_challenge };
    }
    
    /**
     * Deletes the access token, and all API objects from the database and reloads the page.
     */
    static async logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem("fetchDataTime");
        await Database.clearObjectStore(DatabaseStore.Changes);
        await Database.clearObjectStore(DatabaseStore.Accidents);
        await Database.clearObjectStore(DatabaseStore.DisposableStocks);
        await Database.clearObjectStore(DatabaseStore.ReusableStocks);
        await Database.clearObjectStore(DatabaseStore.Types);
        await Database.clearObjectStore(DatabaseStore.Brands);
        window.location.href = "/";
    }
}