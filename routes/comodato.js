import express from 'express';
import connection from '../Database.js';
import {authMiddleware} from './authuser.js' 

const router = express.Router();
const isEmpty = (value) => !value || value.toString().trim() === '';
/**
 * @swagger
 * tags:
 *   - name: comodato
 *     description: Endpoints para gerenciar comodato
 */

/**
 * @swagger
 * /comodato/teste:
 *   get:
 *     summary: Teste da API
 *     description: Verifica se a API está funcionando corretamente.
 *     tags: [comodato]
 *     responses:
 *       200:
 *         description: API funcionando.
 */
// teste api
router.get('/teste', (req, res) => {
    console.log('teste comodato')
});

/**
 * @swagger
 * /comodato:
 *   get:
 *     summary: Listar comodato
 *     description: Retorna todos os comodato 
 *     tags: [comodato]
 *     responses:
 *       200:
 *         description: Lista de comodato  retornada com sucesso.
 */
router.get('/',authMiddleware, async (req, res) => {
    try {
        const query = `select * from pessoas_comodato`;
        const result = await connection.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});
/**
 * @swagger
 * /comodato/info:
 *   get:
 *     summary: Lista todos os comodatos
 *     description: Retorna uma lista com todos os comodatos cadastrados.
 *     tags: [comodato]
 *     responses:
 *       200:
 *         description: Lista de comodatos retornada com sucesso.
 */
router.get('/info', authMiddleware,async (req, res) => {
    try {
        const query = `select id_comodato, nome from pessoas_comodato`;
        const result = await connection.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});

/**
 * @swagger
 * /comodato/:
 *   post:
 *     summary: Cria um novo comodato
 *     description: Adiciona um novo comodato no banco de dados.
 *     tags: [comodato]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               sobrenome:
 *                 type: string
 *               cpf:
 *                 type: string
 *               rg:
 *                 type: string
 *               cep:
 *                 type: string
 *               profissao:
 *                 type: string
 *               estado_civil:
 *                 type: string
 *               rua:
 *                 type: string
 *               numero_casa:
 *                 type: integer
 *               complemento:
 *                 type: string
 *               telefone:
 *                 type: string
 *               cidade_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: comodato criado com sucesso.
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
      const {
        nome,
        sobrenome,
        cpf,
        rg,
        cep,
        profissao,
        estado_civil,
        rua,
        numero_casa,
        complemento,
        telefone,
        cidade_id
      } = req.body;
  
      if (
        !nome || !sobrenome || !cpf || !rg || !cep || !profissao || !estado_civil ||
        !rua || !numero_casa || !telefone || !cidade_id
      ) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
      }
  
      // Verifica se CPF já existe
      const checkCpfQuery = `
        SELECT id_comodato FROM Pessoas_Comodato WHERE cpf = $1;
      `;
      const cpfResult = await connection.query(checkCpfQuery, [cpf]);
  
      let idComodato;
  
      if (cpfResult.rows.length > 0) {
        // CPF já existe, pega o ID
        idComodato = cpfResult.rows[0].id_comodato;
  
        return res.status(200).json({
          message: "CPF já estava cadastrado.",
          id_comodato: idComodato
        });
      }
  
      // CPF não existe, insere nova pessoa
      const insertQuery = `
        SELECT insert_pessoa_comodato($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
      `;
      await connection.query(insertQuery, [
        nome, sobrenome, cpf, rg, cep, profissao, estado_civil,
        rua, numero_casa, complemento, 'Brasileiro', telefone, cidade_id
      ]);
  
      const idQuery = `
        SELECT id_comodato FROM Pessoas_Comodato 
        WHERE cpf = $1 ORDER BY id_comodato DESC LIMIT 1;
      `;
      const result = await connection.query(idQuery, [cpf]);
      idComodato = result.rows[0]?.id_comodato;
  
      res.status(201).json({
        message: "Comodato inserido com sucesso!",
        id_comodato: idComodato
      });
    } catch (error) {
      console.error("Erro no cadastro:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
/**
 * @swagger
 * /comodato:
 *   delete:
 *     summary: Exclui um comodato
 *     description: Remove um comodato do banco de dados pelo ID.
 *     tags: [comodato]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_comodato:
 *                 type: integer
 *     responses:
 *       200:
 *         description: comodato excluída com sucesso.
 */
router.delete('/',authMiddleware, async (req, res) => {
    try {
        const { id_comodato } = req.body;

        if (isEmpty(id_comodato)) {
            return res.status(400).json({ Error: "O campo id_comodato é obrigatório." });
        }

        const query = "DELETE FROM pessoas_comodato WHERE id_user = $1 RETURNING *";
        const result = await connection.query(query, [id_comodato]);

        if (result.rowCount === 0) {
            return res.status(404).json({ Error: "comodato não encontrada." });
        }

        res.json({ message: `comodato com ID ${id_comodato} excluída com sucesso.` });
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
}); 

/**
 * @swagger
 * /comodato/:
 *   put:
 *     summary: altera um comodato
 *     description: altera um comodato do banco de dados pelo ID.
 *     tags: [comodato]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_comodato:
 *                 type: integer
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
 *       200:
 *         description: comodato alterada com sucesso.
 */
router.put('/', authMiddleware,async (req, res) => {
    try {
        const { id_comodato,u_nome,u_sobrenome,u_email,u_cpf,u_senha,u_tipo } = req.body;

        if (isEmpty(u_cpf) || isEmpty(u_email) || isEmpty(u_nome) || isEmpty(u_senha) || isEmpty(u_sobrenome) || isEmpty(u_tipo) ) {
            return res.status(400).json({ Error: "Os todos os campos são obrigatórios." });
        }

        const query = "select update_comodato($1,$2,$3,$4,$5,$6,$7)";
        const result = await connection.query(query, [id_comodato,u_nome,u_sobrenome,u_email,u_cpf,u_senha,u_tipo ]);

        if (result.rowCount === 0) {
            return res.status(404).json({ Error: "comodato não encontrada." });
        }

        res.json({ message: `comodato com ID ${u_nome} alterada com sucesso.` });
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});

export default router;

// authMiddleware, (req, res) => {
//     res.json({ message: "Acesso autorizado!", user: req.user });
// });