//модель ссылки
const {Schema, model, Types} = require('mongoose')

const schema = new Schema({
  from: {type: String, required: true}, //откуда сылка 
  to: {type: String, required: true, unique: true}, //наша сгенерированая ссылка, куда ведет
  code: {type: String, required: true, unique: true},  //
  date: {type: Date, default: Date.now}, //когда ссылка была создана 
  clicks: {type: Number, default: 0}, //сколько раз по ней кликнули
  owner: {type: Types.ObjectId, ref: 'User'}
})

module.exports = model('Link', schema)