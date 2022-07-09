import { Router } from "express";
import {
  autenticarUsuario,
  registrarUsuario,
  confirmarUsuario,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
} from "../controllers/usuarioController.js";
import checkAuth from "../middleware/checkAuth.js";

const router = Router();

router.post("/", registrarUsuario);
router.post("/login", autenticarUsuario);
router.get("/confirmar/:token", confirmarUsuario);
router.post("/olvide-password", olvidePassword);

router.route("/olvide-password/:token").get(comprobarToken).post(nuevoPassword);

router.get("/perfil", checkAuth, perfil);

export default router;
