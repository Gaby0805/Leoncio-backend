import express from 'express';
import connection from '../Database.js';
import { authMiddleware } from './authuser.js';

const router = express.Router();

// Função para validar se um valor é nulo ou vazio
const isEmpty = (value) => !value || value.toString().trim() === '';


/** ------------------- ROTAS ITEM ------------------- **/

router.get('/item', authMiddleware, async (req, res) => {
  try {
    const result = await connection.query('SELECT * FROM item');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ Error: err.message });
  }
});

router.post('/item', authMiddleware, async (req, res) => {
  try {
    const { identificacao_do_item, status, sub_categoria_id } = req.body;
    if (isEmpty(identificacao_do_item)) return res.status(400).json({ Error: "'identificacao_do_item' é obrigatório." });
    const result = await connection.query(
      'INSERT INTO item (identificacao_do_item, status, sub_categoria_id) VALUES ($1, $2, $3) RETURNING *',
      [identificacao_do_item, status || false, sub_categoria_id]
    );
    res.status(201).json({ message: 'Item criado!', item: result.rows[0] });
  } catch (err) {
    res.status(500).json({ Error: err.message });
  }
});

router.put('/item/:id', authMiddleware, async (req, res) => {
  try {
    const {  status, id } = req.body;
    if (isEmpty(id) || isEmpty(identificacao_do_item)) return res.status(400).json({ Error: "'id' e 'identificacao_do_item' são obrigatórios." });
    const result = await connection.query(
      'UPDATE item SET  status=false, WHERE id_item=$4',
      [identificacao_do_item, status || false, sub_categoria_id, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ Error: 'Item não encontrado.' });
    res.json({ message: `Item ID ${id} alterado com sucesso.` });
  } catch (err) {
    res.status(500).json({ Error: err.message });
  }
});

router.delete('/item/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await connection.query('DELETE FROM item WHERE id_item=$1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ Error: 'Item não encontrado.' });
    res.json({ message: `Item ID ${id} excluído com sucesso.` });
  } catch (err) {
    res.status(500).json({ Error: err.message });
  }
});


const getItensComDetalhes = async (subCategoria = null, categoriaGeral = null) => {
    let query = `
        SELECT 
            i.id_item,
            i.identificacao_do_item,
            i.status,
            sc.id_sub_categoria,
            sc.nome AS nome_sub_categoria,
            sc.tamanho,
            sc.descricao AS descricao_sub_categoria,
            sc.categoria,
            cg.id_categoria_geral,
            cg.nome AS nome_categoria_geral
        FROM item i
        LEFT JOIN sub_categoria sc ON i.sub_categoria_id = sc.id_sub_categoria
        LEFT JOIN categoria_geral cg ON sc.categoria_geral_id = cg.id_categoria_geral
        where i.status = true
    `;

    const conditions = [];
    if (subCategoria) conditions.push(`sc.nome = '${subCategoria}'`);
    if (categoriaGeral) conditions.push(`cg.nome = '${categoriaGeral}'`);
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');

    return await connection.query(query);
};


router.get('/itens', authMiddleware, async (req, res) => {
    try {
        const { subCategoria, categoriaGeral } = req.query;
        const result = await getItensComDetalhes(subCategoria, categoriaGeral);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ Error: error.message });
    }
});


router.get('/todos', authMiddleware, async (req, res) => {
    try {
        const { type } = req.body
        const query = `
            SELECT 
                i.id_item,
                i.identificacao_do_item,
                i.status
            FROM item i
            LEFT JOIN sub_categoria sc ON i.sub_categoria_id = sc.id_sub_categoria
            WHERE sc.categoria = $1
        `;

        const result = await connection.query(query, [type]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ Error: error.message });
    }
});



export default router;
