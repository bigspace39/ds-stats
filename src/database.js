import { Enum } from "./library/enum.js";

export class DatabaseStore extends Enum {
    static Dashboards = "dashboards";
    static Widgets = "widgets";
    static Changes = "changes";
    static Accidents = "accidents";
    static Types = "types";
    static Brands = "brands";
}

export class Database {
    /**
     * @type {{ transaction: (arg0: any[], arg1: string) => any; onerror: (event: any) => void; }}
     */
    static db;
    
    /**
     * Gets an array of all objects in the given database store.
     * @param {string} storeName The object store.
     * @param {string} sortParameter The parameter to sort by.
     * @param {boolean} ascending Sort ascending/descending.
     * @returns {Promise<any[]>}
     */
    static getAllFromObjectStore(storeName, sortParameter = null, ascending = true) {
        return new Promise((resolve, reject) => {
            const transaction = Database.db.transaction([storeName], "readonly");
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
    
            request.onsuccess = () => {
                let array = request.result;
                if (sortParameter != null) {
                    array.sort((a, b) => {
                        if (a[sortParameter] > b[sortParameter])
                            return ascending ? 1 : -1;
                        else if(a[sortParameter] < b[sortParameter])
                            return ascending ? -1 : 1;
    
                        return 0;
                    });
                }
    
                resolve(request.result);
            };
    
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    /**
     * Gets a map of all objects in the given database store using a specified parameter as a key.
     * @param {string} storeName The object store.
     * @param {string} key The parameter to use as the key for the map.
     * @returns {Promise<Map<any, any>>}
     */
    static getAllFromObjectStoreIntoMap(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = Database.db.transaction([storeName], "readonly");
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
    
            request.onsuccess = () => {
                let map = new Map();
                for (let i = 0; i < request.result.length; i++) {
                    let object = request.result[i];
                    map.set(object[key], object);
                }
                resolve(map);
            };
    
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    /**
     * Clears the given object store
     * @param {string} storeName The object store.
     * @returns {Promise<Error> | Promise}
     */
    static clearObjectStore(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = Database.db.transaction([storeName], "readwrite");
            const store = transaction.objectStore(storeName);
            const request = store.clear();
    
            request.onsuccess = () => {
                resolve();
            };
    
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    /**
     * Deletes the object with the specified key from the object store.
     * @param {string} storeName The object store.
     * @param {*} key 
     * @returns {Promise<Error> | Promise}
     */
    static deleteFromObjectStore(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = Database.db.transaction([storeName], "readwrite");
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);
    
            request.onsuccess = () => {
                resolve();
            };
    
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    /**
     * Puts an object into the object store (put replaces, whereas add will throw an error if the key already exists).
     * @param {string} storeName The object store.
     * @param {Object} object The object to store.
     * @returns {Promise<Error> | Promise}
     */
    static putInObjectStore(storeName, object) {
        return new Promise((resolve, reject) => {
            const transaction = Database.db.transaction([storeName], "readwrite");
            const store = transaction.objectStore(storeName);
            const request = store.put(object);
    
            request.onsuccess = () => {
                resolve(request.result);
            };
    
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    /**
     * Puts a full array into the object store (put replaces, whereas add will throw an error if the key already exists).
     * @param {string} storeName The object store.
     * @param {Object[]} objectsArray The array of objects to store.
     * @param {number} chunkSize How many objects to process at one time.
     * @returns {Promise<Error> | Promise}
     */
    static putArrayInObjectStore(storeName, objectsArray, chunkSize = 100) {
        return new Promise((resolve, reject) => {
            const totalChunks = Math.ceil(objectsArray.length / chunkSize);
    
            for (let i = 0; i < totalChunks; i++) {
                const chunk = objectsArray.slice(i * chunkSize, (i + 1) * chunkSize);
                const transaction = Database.db.transaction([storeName], "readwrite");
                const store = transaction.objectStore(storeName);
    
                chunk.forEach(object => {
                    store.put(object);
                });
    
                transaction.oncomplete = () => {
                    if (i === totalChunks - 1) {
                        resolve();
                    }
                };
    
                transaction.onerror = (event) => {
                    reject(event.target.error);
                };
            }
        });
    }
    
    /**
     * Adds an object to the object store (add will throw an error if the key already exists in the database).
     * @param {string} storeName The object store.
     * @param {Object} object The object to store.
     * @returns {Promise<Error> | Promise}
     */
    static addToObjectStore(storeName, object) {
        return new Promise((resolve, reject) => {
            const transaction = Database.db.transaction([storeName], "readwrite");
            const store = transaction.objectStore(storeName);
            const request = store.add(object);
    
            request.onsuccess = () => {
                resolve(request.result);
            };
    
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    
    /**
     * 
     * @param {string} storeName The object store.
     * @param {Object[]} objectsArray The array of objects to store.
     * @param {number} chunkSize How many objects to process at one time.
     * @returns {Promise<Error> | Promise}
     */
    static addArrayToObjectStore(storeName, objectsArray, chunkSize = 100) {
        return new Promise((resolve, reject) => {
            const totalChunks = Math.ceil(objectsArray.length / chunkSize);
    
            for (let i = 0; i < totalChunks; i++) {
                const chunk = objectsArray.slice(i * chunkSize, (i + 1) * chunkSize);
                const transaction = Database.db.transaction([storeName], "readwrite");
                const store = transaction.objectStore(storeName);
    
                chunk.forEach(object => {
                    store.add(object);
                });
    
                transaction.oncomplete = () => {
                    if (i === totalChunks - 1) {
                        resolve();
                    }
                };
    
                transaction.onerror = (event) => {
                    reject(event.target.error);
                };
            }
        });
    }
    
    /**
     * Counts how many objects exists in the object store (can be queried).
     * @param {string} storeName The object store.
     * @param {string} query Query.
     * @returns {Promise<Error> | Promise}
     */
    static getCountInObjectStore(storeName, query = null) {
        return new Promise((resolve, reject) => {
            const transaction = Database.db.transaction([storeName], "readonly");
            const store = transaction.objectStore(storeName);
            const request = store.count(query);
    
            request.onsuccess = () => {
                resolve(request.result);
            };
    
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
}