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
  socket.on('kill', (data) => {
    io.emit('kill', data)
  })
  socket.on('disconnect', function (data) {
    console.log(data)
    console.log('user disconnected')
  })
})

http.listen(3000, function () {
  console.log('listening on *:3000')
})
