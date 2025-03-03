import express from 'express';
import connection from '../Database.js';

const router = express.Router();

// teste api
router.get('/teste', (req, res) => {
    console.log('teste usuario')
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Listar usuarios
 *     description: Retorna todos os usuarios 
 *     tags: [usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios  retornada com sucesso.
 */
router.get('/', async (req, res) => {
    try {
        const query = `select * from usuarios`;
        const result = await connection.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});

/**
 * @swagger
 * /:
 *   post:
 *     summary: Cria um novo usuario
 *     description: Adiciona um novo usuario no banco de dados.
 *     tags: [usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               u_nome:
 *                 type: string
 *               u_sobrenome:
 *                 type: string
 *               u_email:
 *                 type: string
 *               u_cpf:
 *                 type: string
 *               u_senha:
 *                 type: string
 *               u_tipo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cidade criada com sucesso.
 */
router.post('//', async (req, res) => {
    try { //O tipo de usuario se é adm ou normal
        const { u_nome,u_sobrenome,u_email,u_cpf,u_senha,u_tipo  } = req.body;

        if (isEmpty(u_cpf) || isEmpty(u_email) || isEmpty(u_nome) || isEmpty(u_senha) || isEmpty(u_sobrenome) || isEmpty(u_tipo_U) ) {
            return res.status(400).json({ Error: "Os todos os campos são obrigatórios." });
        }
        //fazer hash da senha
        const query = "select insert_usuario";
        const result = await connection.query(query, [u_nome,u_sobrenome,u_email,u_cpf,u_senha,u_tipo]);

        res.status(201).json({ message: "usuario inserida com sucesso!", usuario: result.rows[0] });
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});

/**
 * @swagger
 * /usuario:
 *   delete:
 *     summary: Exclui uma cidade
 *     description: Remove uma cidade do banco de dados pelo ID.
 *     tags: [usuarios]
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

        const query = "DELETE FROM cidades WHERE id_cidade = $1 RETURNING *";
        const result = await connection.query(query, [id_cidade]);

        if (result.rowCount === 0) {
            return res.status(404).json({ Error: "Cidade não encontrada." });
        }

        res.json({ message: `Cidade com ID ${id_cidade} excluída com sucesso.` });
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});



export default router;
