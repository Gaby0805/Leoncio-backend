import express from 'express';
import connection from '../Database.js';

const router = express.Router();
const isEmpty = (value) => !value || value.toString().trim() === '';

/**
 * @swagger
 * tags:
 *   - name: quantidades
 *     description: Endpoints para gerenciar quantidades de materiais
 */

/**
 * @swagger
 * /quantidades/teste:
 *   get:
 *     summary: Teste da API
 *     description: Verifica se a API está funcionando corretamente.
 *     tags: [quantidades]
 *     responses:
 *       200:
 *         description: API funcionando.
 */
router.get('/teste', (req, res) => {
    console.log('Teste Quantidades');
    res.send('API funcionando corretamente.');
});

/**
 * @swagger
 * /quantidades:
 *   get:
 *     summary: Listar quantidades
 *     description: Retorna todas as quantidades de materiais no estoque.
 *     tags: [quantidades]
 *     responses:
 *       200:
 *         description: Lista de quantidades retornada com sucesso.
 */
router.get('/', async (req, res) => {
    try {
        const query = `SELECT * FROM Quantidades`;
        const result = await connection.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});

/**
 * @swagger
 * /quantidades:
 *   post:
 *     summary: Adicionar quantidade de um material
 *     description: Insere um novo registro de quantidade 'no banco de dados.
 *     tags: [quantidades]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantidade:
 *                 type: integer
 *               estoque_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Quantidade inserida com sucesso.
 */
router.post('/', async (req, res) => {
    try {
        const { quantidade, estoque_id } = req.body;

        if (isEmpty(quantidade) || isEmpty(estoque_id)) {
            return res.status(400).json({ Error: "Todos os campos são obrigatórios." });
        }

        const query = "INSERT INTO Quantidades (quantidade, estoque_id) VALUES ($1, $2) RETURNING *";
        const result = await connection.query(query, [quantidade, estoque_id]);

        res.status(201).json({ message: "Quantidade inserida com sucesso!", quantidade: result.rows[0] });
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});

/**
 * @swagger
 * /quantidades:
 *   delete:
 *     summary: Excluir uma quantidade do estoque
 *     description: Remove uma quantidade do banco de dados pelo ID.
 *     tags: [quantidades]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_quantidade:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Quantidade excluída com sucesso.
 */
router.delete('/', async (req, res) => {
    try {
        const { id_quantidade } = req.body;

        if (isEmpty(id_quantidade)) {
            return res.status(400).json({ Error: "O campo id_quantidade é obrigatório." });
        }

        const query = "DELETE FROM Quantidades WHERE id_quantidade = $1 RETURNING *";
        const result = await connection.query(query, [id_quantidade]);

        if (result.rowCount === 0) {
            return res.status(404).json({ Error: "Quantidade não encontrada." });
        }

        res.json({ message: `Quantidade com ID ${id_quantidade} excluída com sucesso.` });
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});

/**
 * @swagger
 * /quantidades:
 *   put:
 *     summary: Atualizar uma quantidade no estoque
 *     description: Altera uma quantidade no banco de dados pelo ID.
 *     tags: [quantidades]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_quantidade:
 *                 type: integer
 *               quantidade:
 *                 type: integer
 *               estoque_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Quantidade atualizada com sucesso.
 */
router.put('/', async (req, res) => {
    try {
        const { id_quantidade, quantidade } = req.body;

        if (isEmpty(id_quantidade) || isEmpty(quantidade)) {
            return res.status(400).json({ Error: "Todos os campos são obrigatórios." });
        }

        const query = "UPDATE Quantidades SET quantidade = $2 WHERE id_quantidade = $1 RETURNING *";
        const result = await connection.query(query, [id_quantidade, quantidade]);

        if (result.rowCount === 0) {
            return res.status(404).json({ Error: "Quantidade não encontrada." });
        }

        res.json({ message: `Quantidade com ID ${id_quantidade} atualizada com sucesso.` });
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});

export default router;
