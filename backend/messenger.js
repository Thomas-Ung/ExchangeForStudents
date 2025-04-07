var Message = /** @class */ (function () {
    function Message(sender, content, timestamp) {
        this.sender = sender;
        this.content = content;
        this.timestamp = timestamp;
    }
    // __repr__ equivalent
    Message.prototype.toString = function () {
        return "Message from ".concat(this.sender, " at ").concat(this.timestamp, ": ").concat(this.content);
    };
    return Message;
}());
var Conversation = /** @class */ (function () {
    function Conversation(participants, product) {
        this.participants = participants;
        this.product = product;
        this.messages = [];
    }
    Conversation.prototype.addMessage = function (sender, content) {
        if (this.participants.includes(sender)) {
            var now = new Date().toISOString().slice(0, 19).replace('T', ' ');
            var message = new Message(sender, content, now);
            this.messages.push(message);
            return true;
        }
        return false;
    };
    // __repr__ equivalent
    Conversation.prototype.toString = function () {
        var output = '';
        this.messages.forEach(function (message) {
            output += "".concat(message.toString(), " \n");
        });
        return "<Conversation between ".concat(this.participants.join(', '), ">\n").concat(output);
    };
    return Conversation;
}());
var Messenger = /** @class */ (function () {
    function Messenger() {
        this.conversations = [];
    }
    Messenger.prototype.addConversation = function (conversation) {
        this.conversations.push(conversation);
    };
    Messenger.prototype.getConversations = function () {
        return this.conversations;
    };
    // __repr__ equivalent
    Messenger.prototype.toString = function () {
        var output = '';
        this.conversations.forEach(function (conversation) {
            output += "".concat(conversation.toString(), " \n");
        });
        return "<Messenger with ".concat(this.conversations.length, " conversations>,\n").concat(output);
    };
    return Messenger;
}());
// Test Example
var messenger = new Messenger();
var convo1 = new Conversation(["John", "Kim"], "Book");
messenger.addConversation(convo1);
convo1.addMessage("John", "Book please?");
convo1.addMessage("Kim", "FS $20");
convo1.addMessage("John", "Great");
var convo2 = new Conversation(["Bill", "Kate"], "Calculator");
messenger.addConversation(convo2);
convo2.addMessage("Bill", "Calc please?");
convo2.addMessage("Kate", "By calc do you mean calculator");
convo2.addMessage("Bill", "Yup");
console.log(messenger.toString());
