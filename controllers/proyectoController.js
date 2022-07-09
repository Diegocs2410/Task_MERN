import Proyecto from "../model/Proyecto.js";
import Tarea from "../model/Tarea.js";
import { StatusCodes } from "http-status-codes";
import Usuario from "../model/Usuario.js";

const obtenerProyectos = async (req, res) => {
  const proyectos = await Proyecto.find({
    $or: [
      { colaboradores: { $in: req.usuario } },
      { creador: { $in: req.usuario } },
    ],
  }).select("-tareas");
  res.json(proyectos);
};
const nuevoProyecto = async (req, res) => {
  console.log(req.body);
  console.log(req.usuario);
  const proyecto = new Proyecto(req.body);
  proyecto.creador = req.usuario._id;

  try {
    const proyectoDB = await proyecto.save();
    res.json({
      proyectoDB,
    });
  } catch (error) {
    console.log(error);
  }
};
const obtenerProyecto = async (req, res) => {
  const { id } = req.params;
  const proyecto = await Proyecto.findById(id)
    .populate({
      path: "tareas",
      populate: { path: "completado", select: "nombre" },
    })
    .populate(
      "colaboradores",
      "-password -confirmado -createdAt -updatedAt -token -__v"
    );
  if (!proyecto) {
    const error = new Error("No existe el proyecto");
    return res.status(404).json({ msg: error.message });
  }
  if (
    proyecto.creador.toString() !== req.usuario._id.toString() &&
    !proyecto.colaboradores.some(
      (colaborador) => colaborador._id.toString() === req.usuario._id.toString()
    )
  ) {
    const error = new Error("No autorizado");
    return res.status(404).json({ msg: error.message });
  }

  res.status(StatusCodes.OK).json(proyecto);
};

const editarProyecto = async (req, res) => {
  const { id } = req.params;
  const proyecto = await Proyecto.findById(id);
  if (!proyecto) {
    const error = new Error("No existe el proyecto");
    return res.status(404).json({ msg: error.message });
  }
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("No autorizado");
    return res.status(404).json({ msg: error.message });
  }

  proyecto.nombre = req.body.nombre || proyecto.nombre;
  proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
  proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
  proyecto.cliente = req.body.cliente || proyecto.cliente;
  try {
    const proyectoActualizado = await proyecto.save();
    res.json(proyectoActualizado);
  } catch (error) {
    console.log(error);
  }
};
const eliminarProyecto = async (req, res) => {
  const { id } = req.params;
  const proyecto = await Proyecto.findById(id);
  if (!proyecto) {
    const error = new Error("No existe el proyecto");
    return res.status(404).json({ msg: error.message });
  }
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("No autorizado");
    return res.status(404).json({ msg: error.message });
  }

  try {
    await proyecto.deleteOne();
    res.status(200).json({ msg: "Proyecto Eliminado" });
  } catch (error) {
    console.log(error);
  }
};
const agregarColaborador = async (req, res) => {
  const { id } = req.params;
  const proyecto = await Proyecto.findById(id);
  if (!proyecto) {
    const error = new Error("No existe el proyecto");
    return res.status(StatusCodes.NOT_FOUND).json({ msg: error.message });
  }
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("No autorizado");
    return res.status(StatusCodes.NOT_FOUND).json({ msg: error.message });
  }

  const { email } = req.body;
  const usuario = await Usuario.findOne({ email }).select(
    "-password -confirmado -createdAt -updatedAt -token -__v"
  );

  if (!usuario) {
    const error = new Error("No existe el usuario");
    return res.status(StatusCodes.NOT_FOUND).json({ msg: error.message });
  }

  // El colaborador no es el admin del proyecto
  if (proyecto.creador.toString() === usuario._id.toString()) {
    const error = new Error("El creador del proyecto no puede ser colaborador");
    return res.status(StatusCodes.NOT_FOUND).json({ msg: error.message });
  }
  // El colaborador ya es colaborador del proyecto
  if (proyecto.colaboradores.includes(usuario._id)) {
    const error = new Error("El usuario ya es colaborador");
    return res.status(StatusCodes.NOT_FOUND).json({ msg: error.message });
  }
  proyecto.colaboradores.push(usuario._id);
  await proyecto.save();
  res
    .status(StatusCodes.OK)
    .json({ msg: "Colaborador agregado correctamente" });
};

const buscarColaborador = async (req, res) => {
  const { email } = req.body;
  const usuario = await Usuario.findOne({ email }).select(
    "-password -confirmado -createdAt -updatedAt -token -__v"
  );

  if (!usuario) {
    const error = new Error("No existe el usuario");
    return res.status(StatusCodes.NOT_FOUND).json({ msg: error.message });
  }
  res.status(StatusCodes.OK).json(usuario);
};

const eliminarColaborador = async (req, res) => {
  const { id } = req.params;
  const proyecto = await Proyecto.findById(id);
  if (!proyecto) {
    const error = new Error("No existe el proyecto");
    return res.status(StatusCodes.NOT_FOUND).json({ msg: error.message });
  }
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("No autorizado");
    return res.status(StatusCodes.NOT_FOUND).json({ msg: error.message });
  }

  const { email } = req.body;

  proyecto.colaboradores.pull(req.body.id);
  await proyecto.save();
  res
    .status(StatusCodes.OK)
    .json({ msg: "Colaborador eliminado correctamente" });
};

export {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  agregarColaborador,
  eliminarColaborador,
  buscarColaborador,
};
