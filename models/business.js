const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BusinessSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  address: String,
  siteUrl: String
});

module.exports = mongoose.model('Business', BusinessSchema);
