import express from 'express';
import connection from '../Database.js';
import {authMiddleware} from './authuser.js'
const router = express.Router();



/**
 * @swagger
 * tags:
 *   - name: Relatório
 *     description: Endpoints para gerenciar o Relatório
 */
/**
 * @swagger
 * /relatorio/teste:
 *   get:
 *     summary: Teste da API
 *     description: Verifica se a API está funcionando corretamente.
 *     tags: [relatorio]
 *     responses:
 *       200:
 *         description: API funcionando.
 */
router.get('/teste', (req, res) => {
    console.log('ta funcionando');
    res.send('API funcionando corretamente.');
});




/**
 * @swagger
 * tags:
 *   name: Relatório
 *   description: Endpoints relacionados a relatórios

 * /relatorio/comodatocidade:
 *   get:
 *     summary: Listar os municípios com mais comodatos
 *     description: Retorna uma lista com o nome dos municípios e a quantidade de comodatos associados.
 *     tags: [Relatório]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cidades com detalhes dos comodatos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nome_municipio:
 *                     type: string
 *                     example: Corumbá
 *                   qtd_comodatos:
 *                     type: integer
 *                     example: 12
 *       500:
 *         description: Erro interno no servidor
 */
router.get('/comodatocidade',authMiddleware, async (req, res) => {
    try {
        const query = `SELECT * FROM contar_pessoas_por_cidade();`;
        const result = await connection.query(query);
        res.json(result.rows);
    } catch (error) {
        console.log(error)
        res.status(500).json({ Error: error.message });
    }
});


/**
 * @swagger
 * tags:
 *   name: Relatório
 *   description: Endpoints relacionados a relatórios

 * /relatorio/usersdata:
 *   get:
 *     summary: Listar os municípios com mais comodatos
 *     description: Retorna uma lista com o nome dos municípios e a quantidade de comodatos associados.
 *     tags: [Relatório]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cidades com detalhes dos comodatos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   data_label:
 *                     type: string
 *                     format: date
 *                     example: 2025-06-15
 *                   ativos:
 *                     type: integer
 *                     example: 12
 *                   atraso:
 *                     type: string
 *                     example: Corumbá
 *                   total:
 *                     type: integer
 *                     example: 12
 *                   concluido:
 *                     type: integer
 *                     example: 12
 *       500:
 *         description: Erro interno no servidor
 */   
router.get('/usersdata',authMiddleware, async (req, res) => {
    try {
        const query = `SELECT * FROM emprestimo_totais_com_datas();`;
        const result = await connection.query(query);
        res.json(result.rows);
    } catch (error) {
        console.log(error)
        res.status(500).json({ Error: error.message });
    }
});
/**
 * @swagger
 * tags:
 *   name: Relatório
 *   description: Endpoints relacionados a relatórios

 * /relatorio/usersmes:
 *   post:
 *     summary: Quantidade de comodatos por mês
 *     description: Retorna um resumo da quantidade de comodatos cadastrados por mês no ano informado.
 *     tags: [Relatório]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ano:
 *                 type: integer
 *                 example: 2024
 *     responses:
 *       200:
 *         description: Lista com a quantidade de comodatos por mês.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   jan: { type: integer, example: 12 }
 *                   fev: { type: integer, example: 10 }
 *                   mar: { type: integer, example: 8 }
 *                   abr: { type: integer, example: 9 }
 *                   mai: { type: integer, example: 7 }
 *                   jun: { type: integer, example: 12 }
 *                   jul: { type: integer, example: 11 }
 *                   ago: { type: integer, example: 14 }
 *                   setembro: { type: integer, example: 6 }
 *                   outubro: { type: integer, example: 5 }
 *                   nov: { type: integer, example: 4 }
 *                   dez: { type: integer, example: 3 }
 *       500:
 *         description: Erro interno no servidor
 */
router.post('/usersmes',authMiddleware, async (req, res) => {
    const {ano} = req.body
    try {
        const query = `SELECT * from emprestimo_totais_por_mes($1);`;
        const result = await connection.query(query,[ano]);
        res.json(result.rows);
    } catch (error) {
        console.log(error)
        res.status(500).json({ Error: error.message });
    }
});
/**
 * @swagger
 * tags:
 *   name: Relatório
 *   description: Endpoints relacionados a relatórios

 * /relatorio/comodatocidade:
 *   get:
 *     summary: Listar os municípios com mais comodatos
 *     description: Retorna uma lista com o nome dos municípios e a quantidade de comodatos associados.
 *     tags: [Relatório]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cidades com detalhes dos comodatos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nome_municipio:
 *                     type: string
 *                     example: Corumbá
 *                   qtd_comodatos:
 *                     type: integer
 *                     example: 12
 *       500:
 *         description: Erro interno no servidor
 */
router.get('/comodatocidade',authMiddleware, async (req, res) => {
    try {
        const query = `SELECT * FROM contar_pessoas_por_cidade();`;
        const result = await connection.query(query);
        res.json(result.rows);
    } catch (error) {
        console.log(error)
        res.status(500).json({ Error: error.message });
    }
});
/**
 * @swagger
 * tags:
 *   name: Relatório
 *   description: Endpoints relacionados a relatórios

 * /relatorio/top:
 *   get:
 *     summary: Listar os municípios com mais comodatos
 *     description: Retorna uma lista com o nome dos municípios e a quantidade de comodatos associados.
 *     tags: [Relatório]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cidades com detalhes dos comodatos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nome_material:
 *                     type: string
 *                     example: cadeira de rodas
 *                   qtd_emprestimo:
 *                     type: integer
 *                     example: 12
 *       500:
 *         description: Erro interno no servidor
 */
router.get('/top',authMiddleware, async (req, res) => {
    try {
        const query = `SELECT * FROM top_materiais_emprestimo(3);`;
        const result = await connection.query(query);
        res.json(result.rows);
    } catch (error) {
        console.log(error)
        res.status(500).json({ Error: error.message });
    }
});


export default router;
