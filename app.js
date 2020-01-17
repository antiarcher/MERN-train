const express = require('express')
const config = require('config') //подключаемся к конфигу
const mongoose = require('mongoose') //подключаемся к монгоДБ
const path = require('path')

const app = express()

app.use(express.json( {extended: true}))

//регистрируем роуты, указываем различные пути
app.use('/api/auth', require('./routes/auth.routes'))
app.use( '/api/link', require('./routes/link.routes'))
app.use('/t', require('./routes/redirect.routes'))

//помимо формирования апи нужно еще и отдавать сам фронтенд//если это действительно то нужно отдавать статику
if (process.env.NODE_ENV === 'production') {
  //перенапрявляем в ту папку с билдом
  app.use( '/', express.static(path.join(__dirname, 'client', 'build')))

  //любой другой гет запрос
  app.get('*', (req, res) => {

    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}

const PORT = config.get('port') || 5000

async function start() {
  try{
    await mongoose.connect(config.get('mongoUrl'),{ //передаем базу данных
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    }) 
    app.listen(PORT, ()=> console.log(`App has been started on port ${PORT}...`)) //запускаем сервер на 5000 сервере и выводим в терминал сообщение
  } catch(e) {
    console.log('Server Error', e.message)
    process.exit(1) //завершаем процес если что то пошло не так
  }
}

start()


