const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  birthDate: Date
});

module.exports = mongoose.model('Student', StudentSchema);
