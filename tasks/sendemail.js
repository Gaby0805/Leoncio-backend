import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: "gabbiebrabo@gmail.com",
      pass: "aghi ytkh wlql rsnj ",
    },
  });

  function Enviar( assunto, mensagem) {
    const mailOptions = {
      from: 'gabbiebrabo@gmail.com',
      to: 'gabbiebrabo@gmail.com',
      subject: assunto,
      text: mensagem
    };
  }
  

  transporter.Enviar(mailOptions, (error, info) => {
    if (error) {
      console.error('Erro ao enviar email:', error);
    } else {
      console.log('Email enviado:', info.response);
    }
  });



export default Enviar