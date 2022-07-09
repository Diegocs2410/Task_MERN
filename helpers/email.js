import nodemailer from "nodemailer";

export const emailRegistro = async (datos) => {
  const { nombre, email, token } = datos;
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Informacion del email

  const info = await transport.sendMail({
    from: '"Uptask - Administrador de proyectos" <cuentas@uptask.com>',
    to: email,
    subject: "UpTask - Comprueba tu cuenta",
    text: "Comprueba tu cuenta en uptask",
    html: `
     <p>Hola: ${nombre} Comprueba tu cuenta en UpTask</p>
     <p> Tu cuenta esta casi lista, solo debes comprobarla en el siguiente enlace</p>

     <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprueba tu cuenta</a>
     <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
    
    
    `,
  });
};

export const emailOlvidePassword = async (datos) => {
  const { nombre, email, token } = datos;

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Informacion del email

  const info = await transport.sendMail({
    from: '"Uptask - Administrador de proyectos" <cuentas@uptask.com>',
    to: email,
    subject: "UpTask - Restablece tu password",
    text: "Restablece tu password",
    html: `
     <p>Hola: ${nombre} has solicitado restablecer tu password</p>
     <p> Sigue el siguiente enlace para generar un nuevo password</p>

     <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Restablecer tu password</a>
     <p>Si tu no solicitaste el email, puedes ignorar el mensaje</p>
    
    
    `,
  });
};
