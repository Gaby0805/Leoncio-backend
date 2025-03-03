import express from 'express';
import connection from '../Database.js';

const router = express.Router();

// Função para validar se um valor é nulo ou vazio
const isEmpty = (value) => !value || value.toString().trim() === '';

/**
 * @swagger
 * tags:
 *   - name: Locais
 *     description: Endpoints para gerenciar cidades e estados
 */

/**
 * @swagger
 * /locais/teste:
 *   get:
 *     summary: Teste da API
 *     description: Verifica se a API está funcionando corretamente.
 *     tags: [Locais]
 *     responses:
 *       200:
 *         description: API funcionando.
 */
router.get('/teste', (req, res) => {
    console.log('Teste locais');
    res.send("API funcionando");
});

/**
 * @swagger
 * /locais/estado:
 *   get:
 *     summary: Lista todos os estados
 *     description: Retorna uma lista com todos os estados cadastrados.
 *     tags: [Locais]
 *     responses:
 *       200:
 *         description: Lista de estados retornada com sucesso.
 */
router.get('/estado', async (req, res) => {
    try {
        const query = 'SELECT * FROM Estados';
        const result = await connection.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ Error: err.message });
    }
});

/**
 * @swagger
 * /locais/cidade:
 *   get:
 *     summary: Lista todas as cidades
 *     description: Retorna uma lista com todas as cidades cadastradas.
 *     tags: [Locais]
 *     responses:
 *       200:
 *         description: Lista de cidades retornada com sucesso.
 */
router.get('/cidade', async (req, res) => {
    try {
        const query = 'SELECT * FROM Cidades';
        const result = await connection.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ Error: err.message });
    }
});

/**
 * @swagger
 * /locais/cidade/estados:
 *   get:
 *     summary: Lista cidades com seus estados
 *     description: Retorna todas as cidades junto com o nome do estado correspondente.
 *     tags: [Locais]
 *     responses:
 *       200:
 *         description: Lista de cidades com estados retornada com sucesso.
 */
router.get('/cidade/estados', async (req, res) => {
    try {
        const query = `
            SELECT c.nome_cidades, e.nome_estado 
            FROM Cidades c 
            JOIN Estados e ON c.estado_id = e.id_estado;
        `;
        const result = await connection.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});

/**
 * @swagger
 * /locais/cidade:
 *   post:
 *     summary: Cria uma nova cidade
 *     description: Adiciona uma nova cidade ao banco de dados.
 *     tags: [Locais]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome_cidades:
 *                 type: string
 *               estado_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Cidade criada com sucesso.
 */
router.post('/cidade/', async (req, res) => {
    try {
        const { nome_cidades, estado_id } = req.body;

        if (isEmpty(nome_cidades) || isEmpty(estado_id)) {
            return res.status(400).json({ Error: "Os campos 'nome_cidades' e 'estado_id' são obrigatórios." });
        }

        const query = "INSERT INTO cidades (nome_cidades, estado_id) VALUES ($1, $2) RETURNING *";
        const result = await connection.query(query, [nome_cidades, estado_id]);

        res.status(201).json({ message: "Cidade inserida com sucesso!", cidade: result.rows[0] });
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});

/**
 * @swagger
 * /locais/cidade:
 *   delete:
 *     summary: Exclui uma cidade
 *     description: Remove uma cidade do banco de dados pelo ID.
 *     tags: [Locais]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_cidade:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cidade excluída com sucesso.
 */
router.delete('/cidade/', async (req, res) => {
    try {
        const { id_cidade } = req.body;

        if (isEmpty(id_cidade)) {
            return res.status(400).json({ Error: "O campo 'id_cidade' é obrigatório." });
        }

        const query = "DELETE FROM cidades WHERE id_cidade = $1 ";
        const result = await connection.query(query, [id_cidade]);

        if (result.rowCount === 0) {
            return res.status(404).json({ Error: "Cidade não encontrada." });
        }

        res.json({ message: `Cidade com ID ${id_cidade} excluída com sucesso.` });
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});


/**
 * @swagger
 * /locais/cidade:
 *   put:
 *     summary: altera uma cidade
 *     description: altera uma cidade do banco de dados pelo ID.
 *     tags: [Locais]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_cidade:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cidade alterada com sucesso.
 */
router.put('/cidade/', async (req, res) => {
    try {
        const { nome_cidade , id_cidade } = req.body;

        if (isEmpty(id_cidade) || isEmpty(nome_cidade) ) {
            return res.status(400).json({ Error: "O campo 'id_cidade' é obrigatório." });
        }

        const query = "update cidades set nome_cidades = $1 WHERE id_cidade = $2 ";
        const result = await connection.query(query, [nome_cidade, id_cidade]);

        if (result.rowCount === 0) {
            return res.status(404).json({ Error: "Cidade não encontrada." });
        }

        res.json({ message: `Cidade com ID ${id_cidade} alterada com sucesso.` });
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});
export default router;
