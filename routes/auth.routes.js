const {Router} = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config =  require('config')
const User = require('../models/User')
const router = Router()
const {check, validationResult} = require('express-validator')

///api/auth/register
router.post(
  '/register',
  [     //добавляем масив мидлвееров которые делают валидацию
    check('email', 'Некорректный email').isEmail(), //isEmail - это встроеная функция проверки эмейла
    check('password', 'Минимальная длина пароля 6 символов')
        .isLength({min: 6}) //указываем мин длину пароля
  ],
  async (req, res) => {
  try {
    const errors = validationResult(req) //валидирует входяшие поля

    if(!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Некорректные данные при регестрации, попробуйте снова'
      })
    }

    //будем отпровлять с фронтенда 
    const {email, password} = req.body

    //валидация должна происходить на сервере


    //логика регистрации //проверяем будет ли совподать почта, если будет то не регистрируем а говорим что такой пользоватекль уже зарег
    const candidate = await User.findOne({email: email})

    if (candidate) {
      return res.status(400).json({message: 'Такой пользователь уже существует'})
    }

    //длаем шифрование для пароля через npm bcrypt
    const hashedPassword = await bcrypt.hash(password, 12) //пишем наш пароль плюс добавляем соль salt  для лучшего хеширования
    
    //так как не работает bcrypt просто передаем пароль, но в работе лучше заменить другой програмой
    // const hashedPassword = password
    
    const user = new User({email, password: hashedPassword})

    await user.save() //пользователь сохранится

    res.status(201).json({message: 'Пользователь создан'})

  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так, попробуйте снова!'})
  }
})

///api/auth/login
router.post(
  '/login',
  [
    check('email', 'Введите коректный email').normalizeEmail().isEmail(),
    check('password', 'Введите пароль').exists() //пароль должен сушествовать// не пустая строка
  ],
  async (req, res) => {
  try {
    const errors = validationResult(req) //валидирует входяшие поля

    if(!errors.isEmpty()) {
      return res.status(400).json({
        errors:errors.array(),
        message: 'Некорректные данные при входе в систему'
      })
    }

    const {email, password} = req.body

    const user = await User.findOne({ email }) //ищем одного пользоателя по эмейлу

    if (!user) { //если нет такого пользователя
      return res.status(400).json({message: 'Пользователь не найден'})
    }

    //сравниваем захешированые пароли
    const isMatch = await bcrypt.compare(password, user.password) //сравниваем пароль что получили с фронта и тот что отвечает юзеру
    // const isMatch = await password === user.password

    if (!isMatch) {
      return res.status(400).json({message: 'Неверный пароль, попробуйте снова'})
    }

    //если дошло сюда то с пользователем все хорошо и нужно сделать авторизацию

    const token = jwt.sign(
      { userId: user.id }, //передаем индентифицирующую информацйию, еще может быть логином и паролем и тд
      config.get('jwtSecret'), //секретный ключ
      { expiresIn: '1h' }   //через сколько наш jwt токен закончит свое сушествование(потеряет актуальность)
    )

    //ответ сервера
    res.json({ token, userId: user.id })

  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так, попробуйте снова!'})
  }
})


module.exports = router