const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  name: String,
  password: String,
  type: String,
  photoDir: String,
  photoType: String
});

UserSchema.methods.verifyPassword = function(password, cb) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

UserSchema.pre('save', function(callback) {
  var user = this;
  if (!user.isModified('password'))
    return callback();

  bcrypt.genSalt(5, function(err, salt) {
    if (err)
      return callback(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err)
        return callback(err);

      user.password = hash;
      callback();
    });
  });
});

module.exports = mongoose.model('User', UserSchema);
