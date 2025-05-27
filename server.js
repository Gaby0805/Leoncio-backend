import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import setupSwagger from './swagger.js'; // Importando o Swagger
import connection from './Database.js';
import cookieParser from 'cookie-parser';

// import rotas 
import locaisRoutes from './routes/locais.js';
import usuariosRoutes from './routes/usuarios.js';
import aniversarianteRoutes from './routes/aniversariante.js';
import comodatoRoutes from './routes/comodato.js';
import estoqueRoutes from './routes/estoque.js';
import quantidadeRoutes from './routes/quantidade.js';
import transacaoRoutes from './routes/transacao.js';
import scheduleEmail from './tasks/organize.js';

// Função para reagendar e-mails (exemplo de uso do banco de dados)
async function reagendarEmails() {
  try {
    const { rows } = await connection.query(`
      SELECT e.data_limite, c.nome_comodato, c.sobrenome_comodato
      FROM emprestimo e
      INNER JOIN pessoas_comodato c ON e.comodato_id = c.id_comodato
      WHERE e.status = 'Ativo';
    `);
    
    rows.forEach((emprestimo) => {
      scheduleEmail(emprestimo, emprestimo.nome_comodato, emprestimo.sobrenome_comodato);
    });
  } catch (error) {
    console.error('Erro ao reagendar e-mails:', error);
  }
}

// Chamamos essa função ao iniciar o servidor
// reagendarEmails();

const app = express();
const port = 3333;
setupSwagger(app);

app.use(cookieParser()); // Adiciona o parser de cookies

// CORS: Configuração para desenvolvimento local e produção
const IN_PROD = process.env.NODE_ENV === 'production';
const frontendOrigin = IN_PROD ? 'https://leoncio-front-cxgg.vercel.app' : 'http://localhost:3000';

app.use(cors({
  origin: frontendOrigin, // Permite tanto o frontend local quanto o externo
  credentials: true // Permite o envio de cookies
}));

app.use(bodyParser.json());

// Rotas
app.use('/locais', locaisRoutes);
app.use('/usuario', usuariosRoutes);
app.use('/aniversariante', aniversarianteRoutes);
app.use('/comodato', comodatoRoutes);
app.use('/estoque', estoqueRoutes);
app.use('/transacao', transacaoRoutes);
app.use('/quantidades', quantidadeRoutes);

// Iniciando o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`); // Log para o desenvolvimento local
  console.log(`Servidor de documentos rodando em http://localhost:${port}/api-docs`);
});
