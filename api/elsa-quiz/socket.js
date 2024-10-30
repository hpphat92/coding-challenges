const {Server} = require('socket.io');

let io;


module.exports = {
    socket: {

    },
    init: (server) => {
        io = new Server(server, {
            cors: {
                origin: 'http://localhost:4200', // Your Angular app
                methods: ['GET', 'POST']
            }
        });
        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error("Socket.io not initialized!");
        }
        return io;
    }
};
