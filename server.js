import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import setupSwagger from './swagger.js'; // Importando o Swaggerimport swaggerdocs from './swagger.js'
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


async function reagendarEmails() { 
  try {
    const { rows } = await connection.query(`
      SELECT e.data_limite, c.nome_comodato, c.sobrenome_comodato
      FROM emprestimo e
      INNER JOIN pessoas_comodato c ON e.comodato_id = c.id_comodato
      WHERE e.status = 'Ativo';
    `);
    
    rows.forEach((emprestimo) => {scheduleEmail(emprestimo, emprestimo.nome_comodato, emprestimo.sobrenome_comodato)});
  } catch (error) {
    console.error('Erro ao reagendar e-mails:', error);
  }
}

// Chamamos essa função ao iniciar o servidor
reagendarEmails();



const app = express();
const port = 3333;
setupSwagger(app)
app.use(cookieParser());  // Adiciona o parser de cookies
app.use(cors({credentials:true}));
app.use(bodyParser.json());
// Estado e Cidade
app.use('/locais', locaisRoutes);
// Usuário padrão 
app.use('/usuario', usuariosRoutes);
// Aniversariante
app.use('/aniversariante', aniversarianteRoutes);
// Pessoa comodato
app.use('/comodato', comodatoRoutes);
// Estoque e quantidade
app.use('/estoque', estoqueRoutes);
// Estoque e quantidade
app.use('/transacao', transacaoRoutes);
// Estoque e quantidade
app.use('/quantidades', quantidadeRoutes);
// auth de usuario

app.listen(port,'0.0.0.0' ,() => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`Servidor de documentos rodando em http://localhost:${port}/api-docs`);

});
