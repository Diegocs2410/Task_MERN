import Proyecto from "../model/Proyecto.js";
import Tarea from "../model/Tarea.js";
import { StatusCodes } from "http-status-codes";

const agregarTarea = async (req, res) => {
  const { proyecto } = req.body;
  const proyectoExiste = await Proyecto.findById(proyecto);

  if (!proyectoExiste) {
    const error = new Error("Proyecto no existe");
    return res.status(StatusCodes.NOT_FOUND).json({ msg: error.message });
  }

  console.log(proyectoExiste);
  if (proyectoExiste.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("No tienes los permisos para añadir tareas");
    return res.status(StatusCodes.UNAUTHORIZED).json({ msg: error.message });
  }

  try {
    const tareaAlmacenada = await Tarea.create(req.body);
    // Almacenar id en el proyecto
    proyectoExiste.tareas.push(tareaAlmacenada._id);
    await proyectoExiste.save();
    res.status(StatusCodes.OK).json(tareaAlmacenada);
  } catch (error) {
    console.log(error);
  }
};

const obtenerTarea = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate("proyecto");
  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(StatusCodes.NOT_FOUND).json({ msg: error.message });
  }
  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(StatusCodes.UNAUTHORIZED).json({ msg: error.message });
  }
  res.status(StatusCodes.OK).json(tarea);
};

const actualizarTarea = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate("proyecto");
  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(StatusCodes.NOT_FOUND).json({ msg: error.message });
  }
  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(StatusCodes.UNAUTHORIZED).json({ msg: error.message });
  }

  tarea.nombre = req.body.nombre || tarea.nombre;
  tarea.descripcion = req.body.descripcion || tarea.descripcion;
  tarea.prioridad = req.body.prioridad || tarea.prioridad;
  tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;
  try {
    const tareaActualizada = await tarea.save();
    res.status(StatusCodes.OK).json(tareaActualizada);
  } catch (error) {
    console.log(error);
  }
};

const eliminarTarea = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate("proyecto");
  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(StatusCodes.NOT_FOUND).json({ msg: error.message });
  }
  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Acción no válida");
    return res.status(StatusCodes.UNAUTHORIZED).json({ msg: error.message });
  }

  try {
    const proyecto = await Proyecto.findById(tarea.proyecto);
    proyecto.tareas.pull(tarea._id);
    await proyecto.save();
    await tarea.deleteOne();

    await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()]);

    res.status(StatusCodes.OK).json({ msg: "La Tarea se eliminó" });
  } catch (error) {
    console.log(error);
  }
};

const cambiarEstado = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate("proyecto");

  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(StatusCodes.NOT_FOUND).json({ msg: error.message });
  }
  if (
    tarea.proyecto.creador.toString() !== req.usuario._id.toString() &&
    !tarea.proyecto.colaboradores.some(
      (colaborador) => colaborador._id.toString() === req.usuario._id.toString()
    )
  ) {
    const error = new Error("Acción no válida");
    return res.status(StatusCodes.UNAUTHORIZED).json({ msg: error.message });
  }

  tarea.estado = !tarea.estado;
  tarea.completado = req.usuario._id;
  await tarea.save();

  const tareaAlmacenada = await Tarea.findById(id)
    .populate("proyecto")
    .populate("completado");

  res.status(StatusCodes.OK).json(tareaAlmacenada);
};

export {
  agregarTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEstado,
};
