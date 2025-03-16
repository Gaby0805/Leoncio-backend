import express from 'express';
import connection from '../Database.js';

const router = express.Router();
const isEmpty = (value) => !value || value.toString().trim() === '';

/**
 * @swagger
 * tags:
 *   - name: estoque
 *     description: Endpoints para gerenciar o estoque
 */

/**
 * @swagger
 * /estoque/teste:
 *   get:
 *     summary: Teste da API
 *     description: Verifica se a API está funcionando corretamente.
 *     tags: [estoque]
 *     responses:
 *       200:
 *         description: API funcionando.
 */
router.get('/teste', (req, res) => {
    console.log('Teste Estoque');
    res.send('API funcionando corretamente.');
});

/**
 * @swagger
 * /estoque:
 *   get:
 *     summary: Listar materiais do estoque
 *     description: Retorna todos os materiais cadastrados no estoque.
 *     tags: [estoque]
 *     responses:
 *       200:
 *         description: Lista de materiais retornada com sucesso.
 */
router.get('/', async (req, res) => {
    try {
        const query = `SELECT * FROM Estoque`;
        const result = await connection.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});


/**
 * @swagger
 * /estoque/valores:
 *   get:
 *     summary: Listar material especifico
 *     description: Retorna o valor dos materias especificos.
 *     tags: [estoque]
 *     responses:
 *       200:
 *         description: Lista de materiais retornada com sucesso.
 */
router.get('/valores', async (req, res) => {
    try {
        const id_estoque = req.body
        const query = `SELECT * FROM Estoque where id_estoque = ?`;
        const result = await connection.query(query,);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});



/**
 * @swagger
 * /estoque/ComodatoList:
 *   get:
 *     summary: Listar quantidades de materiais com informações do estoque 
 *     description: Retorna a quantidade dos produtos junto com os detalhes do estoque usando INNER JOIN para o estoque do Comodato.
 *     tags: [estoque]
 *     responses:
 *       200:
 *         description: Lista de quantidades com detalhes do estoque retornada com sucesso.
 */
router.get('/ComodatoList', async (req, res) => {
    try {
        const query = `
        SELECT q.id_quantidade, q.quantidade, e.id_estoque, e.nome_material, e.descricao, e.valor, e.status, e.area_material, e.aquisicao, e.tamanho
        FROM Quantidades q
        INNER JOIN Estoque e ON q.estoque_id = e.id_estoque
        where e.area_material = 'Comodato' and q.quantidade > 0
        `;
        const result = await connection.query(query);
        res.json(result.rows);
    } catch (error) {
        console.log(error)
        res.status(500).json({ Error: error.message });
    }
});

/**
 * @swagger
 * /estoque/ComodatoListtext:
 *   get:
 *     summary: Listar quantidades de materiais com informações do estoque 
 *     description: Retorna a quantidade dos produtos junto com os detalhes do estoque usando INNER JOIN para o estoque do Comodato.
 *     tags: [estoque]
 *     responses:
 *       200:
 *         description: Lista de quantidades com detalhes do estoque retornada com sucesso.
 */
router.get('/ComodatoListtext', async (req, res) => {
    try {
        const query = `
        SELECT q.id_quantidade, q.quantidade, e.id_estoque, e.nome_material, e.descricao, e.valor, e.status, e.area_material, e.aquisicao, e.tamanho
        FROM Quantidades q
        INNER JOIN Estoque e ON q.estoque_id = e.id_estoque
        where e.area_material = 'Comodato' and e.status = 'Ativo'
                
        `;
        const result = await connection.query(query);
        res.json(result.rows);
    } catch (error) {
        console.log(error)
        res.status(500).json({ Error: error.message });
    }
});



/**
 * @swagger
 * /estoque/Lions:
 *   get:
 *     summary: Listar quantidades de materiais com informações do estoque 
 *     description: Retorna a quantidade dos produtos junto com os detalhes do estoque usando INNER JOIN para o estoque do Lions em geral.
 *     tags: [estoque]
 *     responses:
 *       200:
 *         description: Lista de quantidades com detalhes do estoque retornada com sucesso.
 */
router.get('/lions', async (req, res) => {
    try {
        const query = `
            SELECT q.id_quantidade, q.quantidade, e.id_estoque, e.nome_material, e.descricao, e.valor, e.status, e.area_material, e.aquisicao, e.tamanho
            FROM Quantidades q
            INNER JOIN Estoque e ON q.estoque_id = e.id_estoque
            where e.area_material = 'Lions'
        `;
        const result = await connection.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});


/**
 * @swagger
 * /estoque:
 *   post:
 *     summary: Adicionar um novo material ao estoque
 *     description: Insere um novo material no banco de dados.
 *     tags: [estoque]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome_material:
 *                 type: string
 *               descricao:
 *                 type: string
 *               valor:
 *                 type: number
 *               status:
 *                 type: string
 *               area_material:
 *                 type: string
 *               aquisicao: 
 *                 type: string
 *               tamanho:
 *                 type: string
 *     responses:
 *       201:
 *         description: Material inserido com sucesso.
 */

router.post('/', async (req, res) => {
    try {
        const { nome_material, descricao, valor, status, area_material, aquisicao, tamanho } = req.body;

        if (isEmpty(nome_material) || isEmpty(descricao) || isEmpty(valor) || isEmpty(status) || isEmpty(area_material) || isEmpty(aquisicao) || isEmpty(tamanho)) {
            return res.status(400).json({ Error: "Todos os campos são obrigatórios." });
        }

        const query = "INSERT INTO Estoque (nome_material, descricao, valor, status, area_material, aquisicao, tamanho) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *";
        const result = await connection.query(query, [nome_material, descricao, valor, status, area_material, aquisicao, tamanho]);

        res.status(201).json({ message: "Material inserido com sucesso!", material: result.rows[0] });
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});

/**
 * @swagger
 * /estoque:
 *   delete:
 *     summary: Excluir um material do estoque
 *     description: Remove um material do banco de dados pelo ID.
 *     tags: [estoque]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_estoque:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Material excluído com sucesso.
 */
router.delete('/', async (req, res) => {
    try {
        const { id_estoque } = req.body;

        if (isEmpty(id_estoque)) {
            return res.status(400).json({ Error: "O campo id_estoque é obrigatório." });
        }

        const query = "DELETE FROM Estoque WHERE id_estoque = $1 RETURNING *";
        const result = await connection.query(query, [id_estoque]);

        if (result.rowCount === 0) {
            return res.status(404).json({ Error: "Material não encontrado." });
        }

        res.json({ message: `Material com ID ${id_estoque} excluído com sucesso.` });
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});

/**
 * @swagger
 * /estoque:
 *   put:
 *     summary: Atualizar um material do estoque
 *     description: Altera um material no banco de dados pelo ID.
 *     tags: [estoque]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_estoque:
 *                 type: integer
 *               nome_material:
 *                 type: string
 *               descricao:
 *                 type: string
 *               valor:
 *                 type: number
 *               status:
 *                 type: string
 *               area_material:
 *                 type: string
 *               aquisicao:
 *                 type: string
 *               tamanho:
 *                 type: string
 *     responses:
 *       200:
 *         description: Material atualizado com sucesso.
 */
router.put('/', async (req, res) => {
    try {
        const { estoque_id, nome_material, descricao,  status, tamanho } = req.body;

        console.log(estoque_id, nome_material, descricao,  status, tamanho)
        if (isEmpty(estoque_id) || isEmpty(nome_material) || isEmpty(descricao)|| isEmpty(status)  || isEmpty(tamanho)) {
            return res.status(400).json({ Error: "Todos os campos são obrigatórios." });
        }

        const query = "UPDATE Estoque SET nome_material = $1, descricao = $2,  status = $3, tamanho = $4 WHERE id_estoque = $5";
        const result = await connection.query(query, [ nome_material, descricao,  status, tamanho, estoque_id,]);

        if (result.rowCount === 0) {
            return res.status(404).json({ Error: "Material não encontrado." });
        }

        res.json({ message: `Material com ID ${estoque_id} atualizado com sucesso.` });
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});

export default router;
