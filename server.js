import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

// import rotas 
import locaisRoutes from './routes/locais.js';
import usuariosRoutes from './routes/usuarios.js';
import aniversarianteRoutes from './routes/aniversariante.js';
import comodatoRoutes from './routes/comodato.js';
import estoqueRoutes from './routes/estoque.js';

const app = express();
const port = 3000;

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
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
