import Usuario from "../model/Usuario.js";
import jwt from "jsonwebtoken";
export default async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.usuario = await Usuario.findById(decoded.id).select(
        "-password -confirmado -token -__v -createdAt -updatedAt "
      );
      return next();
    } catch (error) {
      return res.status(401).json({ msg: "Hubo un error" });
    }
  }

  if (!token) {
    const error = new Error("No autorizado");
    return res.status(401).json({ msg: error.message });
  }

  next();
};
