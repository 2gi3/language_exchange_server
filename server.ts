import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { instrument } from "@socket.io/admin-ui";

interface SocketInfo {
  id: string;
}

interface Message {
  id: string;
  sender: string;
  text: string;
}
const connectedSockets: SocketInfo[] = [];

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:19006", "exp://192.168.43.235:8081", "https://admin.socket.io/"],
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket: Socket) => {
  connectedSockets.push({ id: socket.id });

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

  io.emit('socket-list', connectedSockets);

  socket.on('disconnect', () => {
    const index = connectedSockets.findIndex((s) => s.id === socket.id);
    if (index !== -1) {
      connectedSockets.splice(index, 1);
      io.emit('socket-list', connectedSockets);
    }
  });


});

instrument(io, {
  auth: false,
});


httpServer.listen(3000);