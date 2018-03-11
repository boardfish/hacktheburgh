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
  socket.on('kill', (data) => {
    console.log('kill:', data.id)
    io.emit('kill', {
       id: data.id,
       x: 800 * Math.random(),
       y: 600 * Math.random()
    })
  })
  window.socket.on('kill', (data) => {
    if (data.id === socket.id) {
      window.socket.emit('playermove', {
        x: data.x,
        y: data.y,
        rotation: 0
      })
      console.log('You were killed.')
    } else {
      console.log("Player", data.id, "was killed.")
    }
  })
})

http.listen(3000, function () {
  console.log('listening on *:3000')
})
