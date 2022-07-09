import { emailOlvidePassword, emailRegistro } from "../helpers/email.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import Usuario from "../model/Usuario.js";

const registrarUsuario = async (req, res) => {
  try {
    const { email } = req.body;
    const existeUsuario = await Usuario.findOne({ email });

    if (existeUsuario) {
      const error = new Error("El usuario ya existe");
      return res.status(400).json({ msg: error.message });
    }

    const usuario = new Usuario(req.body);
    usuario.token = generarId();
    await usuario.save();
    // Emviar Email de confirmacion
    emailRegistro({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token,
    });
    res.json({
      msg: "Usuario creado correctamente, revisa tu email para confirmar la cuenta.",
    });
  } catch (error) {
    console.log(error);
  }
};

const autenticarUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      const error = new Error("El usuario no existe");
      return res.status(404).json({ msg: error.message });
    }
    if (!usuario.confirmado) {
      const error = new Error("El usuario no ha confirmado su cuenta");
      return res.status(403).json({ msg: error.message });
    }
    if (await usuario.compararPassword(password)) {
      return res.json({
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        token: generarJWT(usuario._id),
      });
    } else {
      const error = new Error("El password es incorrecto");
      return res.status(403).json({ msg: error.message });
    }
  } catch (error) {
    console.log(error);
  }
};

const confirmarUsuario = async (req, res) => {
  try {
    const { token } = req.params;
    const usuario = await Usuario.findOne({ token });

    if (!usuario) {
      const error = new Error("Token no válido");
      return res.status(404).json({ msg: error.message });
    }
    usuario.confirmado = true;
    usuario.token = "";
    await usuario.save();
    res.json({ msg: "El usuario ha sido confirmado" });
  } catch (error) {
    console.log(error);
  }
};

const olvidePassword = async (req, res) => {
  try {
    const { email } = req.body;
    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      const error = new Error("El usuario no existe");
      return res.status(404).json({ msg: error.message });
    }
    usuario.token = generarId();
    await usuario.save();
    emailOlvidePassword({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token,
    });
    res
      .status(200)
      .json({ msg: "Hemos enviado un email con las instrucciones" });
  } catch (error) {
    console.log(error);
  }
};

const comprobarToken = async (req, res) => {
  try {
    const { token } = req.params;
    const usuario = await Usuario.findOne({ token });

    if (!usuario) {
      const error = new Error("Token no válido");
      return res.status(404).json({ msg: error.message });
    }
    res.json({ msg: "Token válido y el usuario existe" });
  } catch (error) {
    console.log(error);
  }
};
const nuevoPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const usuario = await Usuario.findOne({ token });

    if (!usuario) {
      const error = new Error("Token no válido");
      return res.status(404).json({ msg: error.message });
    }
    usuario.password = password;
    usuario.token = "";
    await usuario.save();
    res.json({ msg: "El password ha sido cambiado" });
  } catch (error) {
    console.log(error);
  }
};

const perfil = async (req, res) => {
  const { usuario } = req;
  res.json(usuario);
};

export {
  registrarUsuario,
  autenticarUsuario,
  confirmarUsuario,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
};
