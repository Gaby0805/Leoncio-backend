import express from 'express';
import connection from '../Database.js';
import { authMiddleware } from './authuser.js';

const router = express.Router();

// Função para validar se um valor é nulo ou vazio
const isEmpty = (value) => !value || value.toString().trim() === '';

router.get('/sub-categoria', authMiddleware, async (req, res) => {
  try {
    const result = await connection.query('SELECT * FROM sub_categoria');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ Error: err.message });
  }
});

router.post('/sub-categoria', authMiddleware, async (req, res) => {
  try {
    const { nome, tamanho, descricao, categoria, categoria_geral_id } = req.body;
    if (isEmpty(nome)) return res.status(400).json({ Error: "'nome' é obrigatório." });
    const result = await connection.query(
      'INSERT INTO sub_categoria (nome, tamanho, descricao, categoria, categoria_geral_id) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [nome, tamanho || 'Padrão', descricao, categoria, categoria_geral_id]
    );
    res.status(201).json({ message: 'SubCategoria criada!', sub_categoria: result.rows[0] });
  } catch (err) {
    res.status(500).json({ Error: err.message });
  }
});

router.put('/sub-categoria/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, tamanho, descricao, categoria } = req.body;
    if (isEmpty(id) || isEmpty(nome)) return res.status(400).json({ Error: "'id' e 'nome' são obrigatórios." });
    const result = await connection.query(
      'UPDATE sub_categoria SET nome=$1, tamanho=$2, descricao=$3, categoria=$4  WHERE id_sub_categoria=$5',
      [nome, tamanho || 'Padrão', descricao, categoria, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ Error: 'SubCategoria não encontrada.' });
    res.json({ message: `SubCategoria ID ${id} alterada com sucesso.` });
  } catch (err) {
    res.status(500).json({ Error: err.message });
  }
});

router.delete('/sub-categoria/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await connection.query('DELETE FROM sub_categoria WHERE id_sub_categoria=$1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ Error: 'SubCategoria não encontrada.' });
    res.json({ message: `SubCategoria ID ${id} excluída com sucesso.` });
  } catch (err) {
    res.status(500).json({ Error: err.message });
  }
});



export default router;
