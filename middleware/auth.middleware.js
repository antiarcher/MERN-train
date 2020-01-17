//позволяет перехватывать данные и делать определенные действия

//подключаем модуль декодирования токена
const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = (req, res, next) => {
  //спец. метод. rest api который проверяет доступность сервера, то никак не реагируем
  if ( req.method === 'OPTIONS') {
    return next()
  }

  try {
    //в заголовке есть строка authorizations которая содержит строку по типу "Bearer TOKEN" из которой можем получить токен
    const token = req.headers.authorization.split(' ')[1]
    
    //если нет токена
    if (!token) {
      return res.status(401).json({ message: 'Нет авторизации'}) //нет авторизации
    }

    const decoded = jwt.verify(token, config.get('jwtSecret'))
    req.user = decoded
    next()

  } catch (e) {
    return res.status(401).json({ message: 'Нет авторизации'})
  }

}