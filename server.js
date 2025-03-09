import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import setupSwagger from './swagger.js'; // Importando o Swaggerimport swaggerdocs from './swagger.js'
// import rotas 
import locaisRoutes from './routes/locais.js';
import usuariosRoutes from './routes/usuarios.js';
import aniversarianteRoutes from './routes/aniversariante.js';
import comodatoRoutes from './routes/comodato.js';
import estoqueRoutes from './routes/estoque.js';
import quantidadeRoutes from './routes/quantidade.js';
import transacaoRoutes from './routes/transacao.js';


const app = express();
const port = 3333;
setupSwagger(app)

app.use(cors());
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
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`Servidor de documentos rodando em http://localhost:${port}/api-docs`);
});