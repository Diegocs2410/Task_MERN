import express from "express";
import dotenv from "dotenv";
import conectarDB from "./config/db.js";
import usuarioRoutes from "./routes/usuario.routes.js";
import proyectoRoutes from "./routes/proyecto.routes.js";
import tareaRoutes from "./routes/tarea.routes.js";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4000;
dotenv.config();

conectarDB();

// Configurar Cors WhiteList
const whiteList = [process.env.FRONTEND_URL];
const corsOptions = {
  origin: function (origin, cb) {
    if (whiteList.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error("Error de cors"));
    }
  },
};
app.use(cors(corsOptions));

// Routing
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/proyectos", proyectoRoutes);
app.use("/api/tareas", tareaRoutes);

const server = app.listen(PORT, () => {
  console.log("Server is running on port: ", PORT);
});

const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL },
  pingTimeout: 60000,
});

io.on("connection", (socket) => {
  console.log("Cliente conectado a socket.io");

  socket.on("abrir proyecto", (idProyecto) => {
    socket.join(idProyecto);
  });

  socket.on("nueva tarea", (tarea) => {
    const proyecto = tarea.proyecto;
    socket.to(proyecto).emit("tarea agregada", tarea);
  });

  socket.on("eliminar tarea", (tarea) => {
    const proyecto = tarea.proyecto;
    socket.to(proyecto).emit("tarea eliminada", tarea);
  });

  socket.on("actualizar tarea", (tarea) => {
    const proyecto = tarea.proyecto._id;
    socket.to(proyecto).emit("tarea actualizada", tarea);
  });

  socket.on("cambiar estado", (tarea) => {
    const proyecto = tarea.proyecto._id;
    socket.to(proyecto).emit("nuevo estado", tarea);
  });
});
