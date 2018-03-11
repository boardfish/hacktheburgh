var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)

app.use(express.static(process.cwd() + '/public'))

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})

io.on('connection', function (socket) {
  console.log('user connected')
  socket.on('playermove', function (data) {
    console.log('playermove: ', data.id, data.x, data.y)
    io.emit('playermove', data)
  })
  socket.on('disconnect', function () {
    console.log('user disconnected')
  })
  socket.on('kill', (data) => {
    console.log('kill:', data.id)
    io.emit('kill', {
       id: data.id,
       x: 800 * Math.random(),
       y: 600 * Math.random()
    })
  })
})

http.listen(3000, function () {
  console.log('listening on *:3000')
})
