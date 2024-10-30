var createError = require('http-errors');
var express = require('express');
var path = require('path');
const http = require('http');
const cors = require('cors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var db = require('./database');

var questionsRouter = require('./routes/questions');
var quizSessionRouter = require('./routes/quizSession');
const {Server} = require("socket.io");
const {init, socket} = require("./socket");


var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/questions', questionsRouter);
app.use('/quiz', quizSessionRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

const server = http.createServer(app);
const io = init(server);

io.on('connection', (sk) => {
    socket.instance = sk;

    // Join a specific room (e.g., 'group1')
    const group = 'group1';
    sk.join(group);

    // Send a message to the client when they join the room
    sk.emit('message', `Welcome to ${group}`);

    // Listen for messages from the client
    sk.on('message', (message) => {
        console.log(`Received message from client: ${message}`);

        // Send the message to all clients in the room (including the sender)
        io.to(group).emit('message', `Message from ${group}: ${message}`);
    });

    sk.on('joinRoom', (room) => {
        sk.join(room);
        console.log(`Client joined room: ${room}`);
    });

    sk.on('messageToRoom', ({room, message}) => {
        io.to(room).emit('message', `Message to ${room}: ${message}`);
    });

    // Handle client disconnection
    sk.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(1213, () => {
    console.log('Socket.io server running on http://localhost:1213');
});

module.exports = app;
