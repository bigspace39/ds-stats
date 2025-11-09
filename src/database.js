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