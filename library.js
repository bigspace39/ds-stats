const mainDiv = document.getElementById("main");
const headerDiv = document.getElementById("header");
let loginPrompt = null;
let toolbar = null;
let addWidgetDialog = null;
let settingsDialog = null;
let db;

const dashboardStoreName = "dashboards";
const widgetStoreName = "widgets";
const changeStoreName = "changes";
const accidentStoreName = "accidents";
const typeStoreName = "types";
const brandStoreName = "brands";

function createElement(tag, parentElement, id) {
    let element = document.createElement(tag);
    if (id != null)
        element.id = id;
    
    if (parentElement != null)
        parentElement.appendChild(element);
    
    return element;
}

class Delegate {
    constructor() {
        this.functions = new Set();
    }

    addFunction(thisObj, fn) {
        const boundFn = thisObj ? fn.bind(thisObj) : fn;
        this.functions.add(boundFn);
        return boundFn;
    }

    removeFunction(fn) {
        this.functions.delete(fn);
    }

    broadcast(...args) {
        for (let fn of this.functions) {
            fn(...args);
        }
    }

    clear() {
        this.functions.clear();
    }
}

function getAllFromObjectStore(storeName, sortParameter = null, ascending = true) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], "readonly");
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

function getAllFromObjectStoreIntoMap(storeName, key) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], "readonly");
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

function clearObjectStore(storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], "readwrite");
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

function deleteFromObjectStore(storeName, key) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], "readwrite");
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

function putInObjectStore(storeName, object) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], "readwrite");
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

function putArrayInObjectStore(storeName, objectsArray, chunkSize = 100) {
    return new Promise((resolve, reject) => {
        const totalChunks = Math.ceil(objectsArray.length / chunkSize);

        for (let i = 0; i < totalChunks; i++) {
            const chunk = objectsArray.slice(i * chunkSize, (i + 1) * chunkSize);
            const transaction = db.transaction([storeName], "readwrite");
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

function addToObjectStore(storeName, object) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], "readwrite");
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

function addArrayToObjectStore(storeName, objectsArray, chunkSize = 100) {
    return new Promise((resolve, reject) => {
        const totalChunks = Math.ceil(objectsArray.length / chunkSize);

        for (let i = 0; i < totalChunks; i++) {
            const chunk = objectsArray.slice(i * chunkSize, (i + 1) * chunkSize);
            const transaction = db.transaction([storeName], "readwrite");
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

function getCountInObjectStore(storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.count();

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

function getCountInObjectStore(storeName, query) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], "readonly");
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