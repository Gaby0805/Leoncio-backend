/* trunk-ignore(git-diff-check/error) */
import express from 'express';
import connection from '../Database.js';
import scheduleEmail from '../tasks/organize.js';
import {authMiddleware} from './authuser.js'
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: transacao
 *     description: Endpoints para gerenciar as transacoes
 */

/**
 * @swagger
 * /transacao/teste:
 *   get:
 *     summary: Teste da API
 *     description: Verifica se a API está funcionando corretamente.
 *     tags: [transacao]
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
 * /transacao/:
 *   get:
 *     summary: Lista todos as transação
 *     description: Retorna todo as transações
 *     tags: [transacao]
 *     responses:
 *       200:
 *         description: Lista de estados retornada com sucesso.
 */
router.get('/', async (req, res) => {
    try {
        const query = 'SELECT * FROM emprestimo';
        const result = await connection.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ Error: err.message });
    }
});
/**
 * @swagger
 * /transacao/ativos:
 *   get:
 *     summary: Lista todos as transação
 *     description: Retorna todo as transações
 *     tags: [transacao]
 *     responses:
 *       200:
 *         description: Lista de estados retornada com sucesso.
 */
router.get('/ativos',authMiddleware, async (req, res) => {
    try {
        const query = 'SELECT * FROM emprestimo where status = ativo';
        const result = await connection.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ Error: err.message });
    }
});

/**
 * @swagger
 * /transacao/info:
 *   get:
 *     summary: Lista todos as transação
 *     description: Retorna todo as transações
 *     tags: [transacao]
 *     responses:
 *       200:
 *         description: Lista de estados retornada com sucesso.
 */
router.get('/info',authMiddleware, async (req, res) => {
    try {
        const selectQuery = "select e.comodato_id,c.nome_comodato,c.sobrenome_comodato,e.status,q.nome_material,e.estoque_id, e.data_limite from emprestimo e inner join  pessoas_comodato c on  e.comodato_id = c.id_comodato inner join estoque q on e.estoque_id = q.id_estoque";
        const result = await connection.query(selectQuery);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ Error: err.message });
    }
});



/**
 * @swagger
 * /transacao/concluidos:
 *   get:
 *     summary: Lista todos as transação
 *     description: Retorna todo as transações
 *     tags: [transacao]
 *     responses:
 *       200:
 *         description: Lista de estados retornada com sucesso.
 */
router.get('/concluidos',authMiddleware, async (req, res) => {
    try {
        const query = 'SELECT * FROM emprestimo where status = concluidos';
        const result = await connection.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ Error: err.message });
    }
});
/**
 * @swagger
 * /transacao/getdata:
 *   get:
 *     summary: Lista data
 *     description: Retorna todo as transações
 *     tags: [transacao]
 *     responses:
 *       200:
 *         description: Lista de estados retornada com sucesso.
 */
router.get('/concluidos',authMiddleware, async (req, res) => {
    try {
        const query = 'SELECT * FROM emprestimo where status = concluidos';
        const result = await connection.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ Error: err.message });
    }
});


/**
 * @swagger
 * /transacao/:
 *   post:
 *     summary: Cria uma nova transação
 *     description: Adiciona uma nova transação ao banco de dados.
 *     tags: [transacao]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comodato_id:
 *                 type: integer
 *               user_id:
 *                 type: integer
 *               estoque_id:
 *                 type: array
 *                 items:
 *                   type: integer
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transação criada com sucesso.
 */
router.post('/',authMiddleware, async (req, res) => {
    try {
        const { comodato_id, user_id, estoque_id } = req.body;

        if (!comodato_id || !user_id || !estoque_id || !Array.isArray(estoque_id) || estoque_id.length === 0) {
            return res.status(400).json({ Error: "Os campos são obrigatórios e estoque_id deve ser uma lista com pelo menos um item." });
        }

        const insertQuery = "INSERT INTO emprestimo (comodato_id, user_id, estoque_id, status) VALUES ($1, $2, $3, $4) RETURNING *";
        const updateQuery = "UPDATE Quantidades SET quantidade = quantidade - 1 WHERE estoque_id = $1 AND quantidade > 0 RETURNING quantidade";
        const selectQuery = "select c.nome_comodato,c.sobrenome_comodato,e.comodato_id, e.data_limite from emprestimo e inner join  pessoas_comodato c on  e.comodato_id = c.id_comodato where e.comodato_id = $1";
        const results = [];

        for (const id of estoque_id) {
            const updateResult = await connection.query(updateQuery, [id]);

            if (updateResult.rowCount === 0) {
                return res.status(400).json({ Error: `Estoque insuficiente para o item ${id}.` });
            }

            const result = await connection.query(insertQuery, [comodato_id, user_id, id, 'Ativo']);
            results.push(result.rows[0]);
        }



        const resultado = await connection.query(selectQuery, [comodato_id])
        if (resultado.rowCount === 0) {
            console.log(resultado.rows[0])
            return res.status(400).json({Error: 'N foi possivel agendar o usuario'})
        } 
        const {nome_comodato, sobrenome_comodato, data_limite} = resultado.rows[0]

        
        try{
            scheduleEmail( data_limite, nome_comodato, sobrenome_comodato)

        }
        catch (err) {
            console.log(err, 'erro no schedule')
        }

        res.status(201).json({ message: "Transações inseridas com sucesso!", transacoes: results });
    } catch (error) {
        res.status(500).json({ Error: error.message});
    }
});


/**
 * @swagger
 * /transacao/select:
 *   post:
 *     summary: seleciona items 
 *     description: Adiciona uma nova transação ao banco de dados.
 *     tags: [transacao]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome_user:
 *                 type: string
 *               nome_comodato:
 *                 type: string
 *               status:
 *                 type: string
 *               data_limite:
 *                 type: string   
 *     responses:
 *       201:
 *         description: Transação criada com sucesso.
 */
router.post('/select',authMiddleware, async (req, res) => {
    try {
        const { nome_user, status, nome_comodato, data_limite} = req.body;
        const inner = "inner join  pessoas_comodato c on  e.comodato_id = c.id_comodato inner join estoque q on e.estoque_id = q.id_estoque"
        const where = "where status = $1 and nome_user = $2 and nome_comodato = $3 and data_limite = $4"
        const query = "select e.comodato_id,c.nome_comodato,c.sobrenome_comodato,e.status,q.nome_material,e.estoque_id, e.data_limite from emprestimo e " + inner + where;
        const result = await connection.query(query, status, nome_user, nome_comodatom, data_limite);
        res.status(201).json({ message: "selected items", material: result.rows[0] });
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});



export default router;
