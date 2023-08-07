import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";

interface Message {
  id: string;
  sender: string;
  text: string;
}

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:19006", "exp://192.168.43.235:8081"],
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket: Socket) => {

  socket.on('client-message', (newMessage, room) => {
    room === ''
      ? socket.broadcast.emit('server-message', newMessage)
      : socket.to(room).emit('server-message', newMessage);
  })

  socket.on('join-room', (room: string, callBack: any) => {
    socket.join(room);
    callBack(
      // `User ${socket.id} joined room ${room}`
      { id: String(uuidv4()), sender: 'bot', text: `User ${socket.id} joined room ${room}` },

    )
  })


});


httpServer.listen(3000);