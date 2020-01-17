//гекнерация ссылок 
const {Router} = require('express')
const config = require('config')
const shortid = require('shortid')
const Link = require('../models/Link')
const auth = require('../middleware/auth.middleware')
const router = Router()

//запрос на создание ссылки
router.post('/generate',auth, async (req, res) => {
  try {
    const baseUrl = config.get('baseUrl')
    const {from} = req.body

    //делаем короткий код ссылки при помощи библиотеки shortid
    const code = shortid.generate()

    //проверяем есть ли в базе такая ссылка как from
    const existing = await Link.findOne({ from })

    //если такая переменная -ссылка уже есть то значит мы уже сформировали эту сылку и нет смысла повторятся
    if (existing) {
      return res.json({ link: existing})
    }

    //наша обработаная ссылка
    const to = baseUrl + '/t/' + code

    const link = new Link({
      code, to, from, owner: req.user.userId,
    })

    //сохраняем, получаем промис
    await link.save()

    //201 - статус created
    res.status(201).json({ link })
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так, попробуйте снова!'})
  }
})

//запрос для получения всех ссылок// осуществляем на авторизацию пользователя и на поиск ссылок этого пользователя 
router.get('/', auth, async(req, res) => {
  try {
    const links = await Link.find({owner: req.user.userId}) 
    res.json(links)
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так, попробуйте снова!'})
  }
})

//запрос ссылки по айди 
router.get('/:id',auth, async(req, res) => {
  try {
    const link = await Link.findById(req.params.id) //???
    res.json(link)
  } catch (e) {
    res.status(500).json({message: 'Что-то пошло не так, попробуйте снова!'})
  }
})



module.exports = router
