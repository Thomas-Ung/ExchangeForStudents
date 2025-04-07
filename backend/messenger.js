"use strict";
//run this file in terminal 
// 1st: cd backend
// 2nd: tsc messenger.ts
// 3rd: node messenger.js
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var admin = require("firebase-admin");
var serviceAccount = require('C:/Users/thoma/Documents/ExchangeForStudents/exchange-for-students-firebase-adminsdk-fbsvc-55c7e57c50.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
var db = admin.firestore();
var Message = /** @class */ (function () {
    function Message(sender, content, timestamp) {
        this.sender = sender;
        this.content = content;
        this.timestamp = timestamp;
    }
    return Message;
}());
var Conversation = /** @class */ (function () {
    function Conversation(participants, product, docId) {
        this.participants = participants;
        this.product = product;
        this.docId = docId;
    }
    Conversation.prototype.addMessage = function (sender, content) {
        return __awaiter(this, void 0, void 0, function () {
            var now, message, messageRef;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.participants.includes(sender)) return [3 /*break*/, 2];
                        now = new Date().toISOString();
                        message = new Message(sender, content, now);
                        messageRef = db.collection('conversations')
                            .doc(this.docId)
                            .collection('messages');
                        return [4 /*yield*/, messageRef.add({
                                sender: message.sender,
                                content: message.content,
                                timestamp: message.timestamp,
                            })];
                    case 1:
                        _a.sent();
                        console.log("Message added to convo ".concat(this.docId, ": ").concat(content));
                        return [2 /*return*/, true];
                    case 2:
                        console.log("Sender not in participants");
                        return [2 /*return*/, false];
                }
            });
        });
    };
    Conversation.prototype.printMessages = function () {
        return __awaiter(this, void 0, void 0, function () {
            var messagesSnapshot;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.collection('conversations')
                            .doc(this.docId)
                            .collection('messages')
                            .orderBy('timestamp')
                            .get()];
                    case 1:
                        messagesSnapshot = _a.sent();
                        console.log("\nConversation about \"".concat(this.product, "\" between [").concat(this.participants.join(', '), "]:"));
                        messagesSnapshot.forEach(function (doc) {
                            var _a = doc.data(), sender = _a.sender, content = _a.content, timestamp = _a.timestamp;
                            console.log("- ".concat(timestamp, " | ").concat(sender, ": ").concat(content));
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    return Conversation;
}());
var Messenger = /** @class */ (function () {
    function Messenger() {
        this.conversations = [];
    }
    Messenger.prototype.loadFromDB = function () {
        return __awaiter(this, void 0, void 0, function () {
            var snapshot;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.collection('conversations').get()];
                    case 1:
                        snapshot = _a.sent();
                        this.conversations = [];
                        snapshot.forEach(function (doc) {
                            var data = doc.data();
                            var convo = new Conversation(data.participants, data.product, doc.id);
                            _this.conversations.push(convo);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    Messenger.prototype.printAllMessages = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, convo;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.conversations;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        convo = _a[_i];
                        return [4 /*yield*/, convo.printMessages()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Messenger.prototype.addConversation = function (participants, product) {
        return __awaiter(this, void 0, void 0, function () {
            var docRef, convo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.collection('conversations').add({ participants: participants, product: product })];
                    case 1:
                        docRef = _a.sent();
                        convo = new Conversation(participants, product, docRef.id);
                        this.conversations.push(convo);
                        console.log("Conversation added with ID: ".concat(docRef.id));
                        return [2 /*return*/, convo];
                }
            });
        });
    };
    return Messenger;
}());
// ✅ Manual test code (not called automatically)
function test() {
    return __awaiter(this, void 0, void 0, function () {
        var messenger, convo1, convo2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messenger = new Messenger();
                    return [4 /*yield*/, messenger.loadFromDB()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, messenger.addConversation(['John', 'Kim'], 'Book')];
                case 2:
                    convo1 = _a.sent();
                    return [4 /*yield*/, convo1.addMessage('John', 'Book please?')];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, convo1.addMessage('Kim', 'FS $20')];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, convo1.addMessage('John', 'Great')];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, messenger.addConversation(['Bill', 'Kate'], 'Calculator')];
                case 6:
                    convo2 = _a.sent();
                    return [4 /*yield*/, convo2.addMessage('Bill', 'Calc please?')];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, convo2.addMessage('Kate', 'By calc do you mean calculator')];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, convo2.addMessage('Bill', 'Yup')];
                case 9:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function test2() {
    return __awaiter(this, void 0, void 0, function () {
        var messenger, convo3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messenger = new Messenger();
                    return [4 /*yield*/, messenger.loadFromDB()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, messenger.addConversation(['Alice', 'Bob'], 'Headphones')];
                case 2:
                    convo3 = _a.sent();
                    return [4 /*yield*/, convo3.addMessage('Alice', 'Are the headphones still available?')];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, convo3.addMessage('Bob', 'Yes, they are in good condition!')];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// ✅ Active logic (just loads existing data and prints it)
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var messenger;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messenger = new Messenger();
                    return [4 /*yield*/, messenger.loadFromDB()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, messenger.printAllMessages()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(console.error);
