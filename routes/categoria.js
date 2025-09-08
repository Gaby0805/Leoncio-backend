import express from 'express';
import connection from '../Database.js';
import { authMiddleware } from './authuser.js';

const router = express.Router();

// Função para validar se um valor é nulo ou vazio
const isEmpty = (value) => !value || value.toString().trim() === '';


/** ------------------- ROTAS CATEGORIA GERAL ------------------- **/

router.get('/categoria-geral', authMiddleware, async (req, res) => {
  try {
    const result = await connection.query('SELECT * FROM categoria_geral');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ Error: err.message });
  }
});

router.post('/categoria-geral', authMiddleware, async (req, res) => {
  try {
    const { nome } = req.body;
    if (isEmpty(nome)) return res.status(400).json({ Error: "'nome' é obrigatório." });
    const result = await connection.query('INSERT INTO categoria_geral (nome) VALUES ($1) RETURNING *', [nome]);
    res.status(201).json({ message: 'Categoria geral criada!', categoria_geral: result.rows[0] });
  } catch (err) {
    res.status(500).json({ Error: err.message });
  }
});

router.put('/categoria-geral/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;
    if (isEmpty(id) || isEmpty(nome)) return res.status(400).json({ Error: "'id' e 'nome' são obrigatórios." });
    const result = await connection.query('UPDATE categoria_geral SET nome=$1 WHERE id_categoria_geral=$2', [nome, id]);
    if (result.rowCount === 0) return res.status(404).json({ Error: 'Categoria geral não encontrada.' });
    res.json({ message: `Categoria geral ID ${id} alterada com sucesso.` });
  } catch (err) {
    res.status(500).json({ Error: err.message });
  }
});

router.delete('/categoria-geral/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await connection.query('DELETE FROM categoria_geral WHERE id_categoria_geral=$1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ Error: 'Categoria geral não encontrada.' });
    res.json({ message: `Categoria geral ID ${id} excluída com sucesso.` });
  } catch (err) {
    res.status(500).json({ Error: err.message });
  }
});



export default router;
