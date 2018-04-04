//IndexedDB
let DB_VERSION = 2;
let DB_NAME = "chat_db";

//Öffnet die DB und erstellt 2 ObjectStores wenn diese nicht existieren
let openDatabase = function () {
    return new Promise(function (resolve, reject) {
        //Prüfen ob IndexedDB vom Browser unterstützt wird
        if (!self.indexedDB) {
            return false;
        }
        let request = self.indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = function (event) {
            reject("Database error: ", event.target.error);
        };

        request.onupgradeneeded = function (event) {
            let db = event.target.result;
            let upgradeTransaction = event.target.transaction;
            let objectStore;
            if (!db.objectStoreNames.contains("users")) {
                objectStore = db.createObjectStore("users",
                    {keyPath: "nickname"}
                );
            }
            else {
                objectStore = upgradeTransaction.openObjectStore(storeName);
            }

            if (!db.objectStoreNames.contains("messages")) {
                objectStore = db.createObjectStore("messages",
                    {autoIncrement: false}
                );
            }
            else {
                objectStore = upgradeTransaction.openObjectStore(storeName);
            }
        };
        request.onsuccess = function (event) {
            resolve(event.target.result);
        };
    });
};

//Öffnet ObjectStore
let openObjectStore = function (db, storeName, transactionMode) {
    return db.transaction(storeName, transactionMode)
        .objectStore(storeName);
};

//Fügt Messages dem ObjectStore "messages" hinzu
let addMessageToObjectStore = function (storeName, object) {
    return new Promise(function (resolve, reject) {
        openDatabase().then(function (db) {
            let objectStore = openObjectStore(db, storeName, "readwrite");
            let messages = [];
            let cursor = objectStore.openCursor();

            cursor.onsuccess = function (event) {
                let cursor = event.target.result;
                if (cursor) {
                    messages.push(cursor.value);
                    cursor.continue();
                } else {
                    objectStore.add(object, messages.length).onsuccess = resolve;
                }
            };
        }).catch(function (errorMessage) {
            reject(errorMessage);
        });
    });
};

//Fügt User dem ObjectStore "users" hinzu
let addUserToObjectStore = function (storeName, object) {
    return new Promise(function (resolve, reject) {
        openDatabase().then(function (db) {
            let objectStore = openObjectStore(db, storeName, "readwrite");
            objectStore.add(object).onsuccess = resolve;
        }).catch(function (errorMessage) {
            reject(errorMessage);
        });
    });
};

//Leert den gewünschten ObjectStore
let clearObjectStore = function (storeName) {
    openDatabase().then(function (db) {
        let objectStore = openObjectStore(db, storeName, "readwrite");
        objectStore.clear();
    });
};

//Holt Daten von MongoDB Server
//Der Code testet zunächst, ob $ (jQuery) in self verfügbar ist. Wenn dies der Fall ist, verwendet es $.ajax, um den JSON zu erhalten,
//Wenn dies nicht der Fall ist, prüft es, ob Fetch verfügbar ist, und verwendet es, um den JSON zu erhalten.
//Einfacher wäre es mit $.getJSON. Aber $.getJSON funktioniert nicht auf IE, da die Daten gecacht werden.
//Bei $.ajax kann man explizit angeben, dass die Daten nicht gecacht werden sollen und es läuft auch auf IE
let getDataFromServer = function (url) {
    return new Promise(function (resolve) {
        //self bezieht sich auf den Service-Mitarbeiter oder auf window
        if (self.$) {
            $.ajax({
                url: url,
                cache: false,
                dataType: "json",
                success: function(data) {
                    resolve(data);
                }
            });
            //fetch ist die methode eines Service Workers um die Daten zu holen
        } else if (self.fetch) {
            fetch(url).then(function (response) {
                return response.json();
            }).then(function (users) {
                resolve(users);
            });
        }
        //Internet Explorer unterstützt kein self, deswegen müssen hier die Daten ganz normal abgefragt werden
        else {
            $.ajax({
                url: url,
                cache: false,
                dataType: "json",
                success: function(data) {
                    resolve(data);
                }
            });
        }
    });
};

//Benutzernickname ändern
let updateUserNickname = function(nickname, value) {
    openDatabase().then(function (db) {
        //Ändern des Nicknames im ObjectStore "users"
        let objectStore = openObjectStore(db, "users", "readwrite");
        objectStore.openCursor().onsuccess = function(event) {
            let cursor = event.target.result;
            if(cursor) {
                if(cursor.value.nickname === nickname) {
                    let updateData = cursor.value;
                    updateData.nickname = value;
                    objectStore.delete(nickname);
                    let request = objectStore.put(updateData);
                    request.onsuccess = function() {
                        console.log("User aktualisiert");
                    };
                }
                cursor.continue();
            }
        };
    });
    let countMessages = 0;
    openDatabase().then(function (db) {
        //Ändern des Nicknames im ObjectStore "messages"
        let objectStore = openObjectStore(db, "messages", "readwrite");
        objectStore.openCursor().onsuccess = function(event) {
            let cursor = event.target.result;

            if(cursor) {
                if(cursor.value.sender === nickname) {
                    let updateData = cursor.value;
                    updateData.sender = value;
                    objectStore.delete(nickname);
                    let request = objectStore.put(updateData, countMessages);
                }
                else if(cursor.value.receiver === nickname) {
                    let updateData = cursor.value;
                    updateData.receiver = value;
                    objectStore.delete(nickname);
                    let request = objectStore.put(updateData, countMessages);
                };
                countMessages++;
                cursor.continue();
            }
        };
    });
};

//Benutzername ändern
var updateUserName = function(nickname, value) {
    openDatabase().then(function (db) {
        //Ändern des Nicknames im ObjectStore "users"
        let objectStore = openObjectStore(db, "users", "readwrite");
        objectStore.openCursor().onsuccess = function(event) {
            let cursor = event.target.result;
            if(cursor) {
                if(cursor.value.nickname === nickname) {
                    let updateData = cursor.value;
                    updateData.name = value;
                    objectStore.delete(nickname);
                    let request = objectStore.put(updateData);
                    request.onsuccess = function() {
                        console.log("User aktualisiert");
                    };
                }
                cursor.continue();
            }
        };
    });
};

//Benutzeremail ändern
let updateUserEmail = function(nickname, value) {
    openDatabase().then(function (db) {
        //Ändern des Nicknames im ObjectStore "users"
        let objectStore = openObjectStore(db, "users", "readwrite");
        objectStore.openCursor().onsuccess = function(event) {
            let cursor = event.target.result;
            if(cursor) {
                if(cursor.value.nickname === nickname) {
                    let updateData = cursor.value;
                    updateData.email = value;
                    objectStore.delete(nickname);
                    let request = objectStore.put(updateData);
                    request.onsuccess = function() {
                        console.log("User aktualisiert");
                    };
                }
                cursor.continue();
            }
        };
    });
};

//Benutzerkennwort ändern
let updateUserPassword = function(nickname, value) {
    openDatabase().then(function (db) {
        //Ändern des Nicknames im ObjectStore "users"
        let objectStore = openObjectStore(db, "users", "readwrite");
        objectStore.openCursor().onsuccess = function(event) {
            let cursor = event.target.result;
            if(cursor) {
                if(cursor.value.nickname === nickname) {
                    let updateData = cursor.value;
                    updateData.password = value;
                    objectStore.delete(nickname);
                    let request = objectStore.put(updateData);
                    request.onsuccess = function() {
                        console.log("User aktualisiert");
                    };
                }
                cursor.continue();
            }
        };
    });
};

//Ändert den Wert der Variable messageread auf true
let setMessageFromUnreadToRead = function(fullmessagedate, value) {
    let countMessages = 0;
    openDatabase().then(function (db) {
        let objectStore = openObjectStore(db, "messages", "readwrite");
        objectStore.openCursor().onsuccess = function(event) {
            let cursor = event.target.result;
            if(cursor) {
                if(cursor.value.fullmessagedate === fullmessagedate) {
                    let updateData = cursor.value;
                    updateData.messageread = value;
                    objectStore.delete(fullmessagedate);
                    let request = objectStore.put(updateData, countMessages);
                }
                countMessages++;
                cursor.continue();
            }
        };
    });
};

//Abfrage der Daten aus dem Users-Store
let getUsers = function (indexName, indexValue) {
    return new Promise(function (resolve, reject) {

        //Prüfen ob der Server läuft und es einen zugriff auf Datenbank gibt
        $.ajax({
            url: "index.html",
            type: 'HEAD',
            success: function (result) {console.log("1");
                getDataFromServer("/users/").then(function (users) {
                    openDatabase().then(function (db) {
                        let objectStore = openObjectStore(db, "users", "readwrite");
                        for (let i = 0; i < users.length; i++) {
                            let User = {
                                nickname: users[i].nickname,
                                name: users[i].name,
                                email: users[i].email,
                                password: "",
                            };
                            objectStore.add(User);
                        }
                        resolve(users);
                    }).catch(function (errorMessage) {
                        reject(errorMessage);
                    });
                });
            },
            error: function (result) {console.log("2")
                openDatabase().then(function (db) {
                    let objectStore = openObjectStore(db, "users");
                    let users = [];
                    let cursor;
                    if (indexName && indexValue) {
                        cursor = objectStore.index(indexName).openCursor(indexValue);
                    } else {
                        cursor = objectStore.openCursor();
                    }

                    cursor.onsuccess = function (event) {
                        let cursor = event.target.result;
                        if (cursor) {
                            users.push(cursor.value);
                            cursor.continue();
                        } else {
                            resolve(users);
                        }
                    };
                }).catch(function () {
                    getDataFromServer("/users/").then(function (users) {
                        resolve(users);
                    });
                });
            }
        });

    });
};

//Abfragen der Daten aus dem Messages-Store-------------------------------------------------------------------------------------------
let getMessages = function (sender, indexName, indexValue) {
    return new Promise(function (resolve, reject) {
        //Prüfen ob der Server läuft und es einen zugriff auf Datenbank gibt
        $.ajax({
            url: "index.html",
            type: 'HEAD',
            success: function (result) {
                getDataFromServer("/messages/").then(function (messages) {
                    openDatabase().then(function (db) {
                        let objectStore = openObjectStore(db, "messages", "readwrite");
                        let countMessages = 0;

                        for (let i = 0; i < messages.length; i++) {
                            if (sender === messages[i].sender || sender === messages[i].receiver) {
                                let Message = {
                                    sender: messages[i].sender,
                                    receiver: messages[i].receiver,
                                    message: messages[i].message,
                                    time: messages[i].time,
                                    date: messages[i].date,
                                    fullmessagedate: messages[i].fullmessagedate,
                                    messageread: messages[i].messageread
                                };

                                objectStore.add(Message, countMessages);
                                countMessages++;
                            }
                        }
                        resolve(messages);
                    }).catch(function (errorMessage) {
                        reject(errorMessage);
                    });
                });
            },
            error: function (result) {
                openDatabase().then(function (db) {
                    let objectStore = openObjectStore(db, "messages");
                    let messages = [];
                    let cursor;
                    if (indexName && indexValue) {
                        cursor = objectStore.index(indexName).openCursor(indexValue);
                    } else {
                        cursor = objectStore.openCursor();
                    }

                    cursor.onsuccess = function (event) {
                        let cursor = event.target.result;
                        if (cursor) {
                            messages.push(cursor.value);
                            cursor.continue();
                        } else {
                            resolve(messages);
                        }
                    };
                }).catch(function () {
                    getDataFromServer("/messages/").then(function (messages) {
                        resolve(messages);
                    });
                });
            }
        });
    });
};




