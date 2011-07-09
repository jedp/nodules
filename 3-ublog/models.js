// Models
// ======
//
// mongoDB models for a microblogger

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/ublog');

var Schema = mongoose.Schema;

// For each user, record the username and a list of usernames he or she is
// following

var UserSchema = new Schema({
  username: {type: String, index: true},
  following: [String]
});
var User = mongoose.model('UserModel', UserSchema);

// For a message, record the username who sent it, the message itself, and the
// date.  We may eventually want to extract mentions and hashtags and index
// them for faster retrieval.  Then again, mongo is fast.

var MessageSchema = new Schema({
  username: {type: String, index: true},
  message: String,
  date: Date
});
var Message = mongoose.model('MessageModel', MessageSchema);

// Export `User` and `Message` models.

if (typeof exports !== 'undefined') {
  exports.User = User;
  exports.Message = Message;
}





