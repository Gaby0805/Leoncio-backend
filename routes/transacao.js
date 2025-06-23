/* trunk-ignore(git-diff-check/error) */
import express from 'express';
import connection from '../Database.js';
import scheduleEmail from '../tasks/organize.js';
import {authMiddleware} from './authuser.js'
const router = express.Router();
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        const selectQuery = 'SELECT e.comodato_id, c.nome_comodato, c.sobrenome_comodato, e.status, q.nome_material, e.estoque_id, c.numero_telefone, e.data_limite, e.id_emprestimo  FROM emprestimo e INNER JOIN pessoas_comodato c ON e.comodato_id = c.id_comodato LEFT JOIN estoque q ON e.estoque_id = q.id_estoque;';
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
 * 
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
 * /transacao/doc:
 *   post:
 *     summary: Gera um documento .docx de comodato
 *     description: Gera um documento preenchido com os dados do comodato, do usuário responsável e dos itens emprestados.
 *     tags: [transacao]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID do comodato (id_comodato)
 *                 example: 1
 *     responses:
 *       200:
 *         description: Documento gerado com sucesso.
 *         content:
 *           application/vnd.openxmlformats-officedocument.wordprocessingml.document:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Requisição inválida ou comodato não encontrado.
 *       401:
 *         description: Não autorizado. Token de autenticação ausente ou inválido.
 *       500:
 *         description: Erro interno ao gerar o documento.
 */


router.post('/doc', authMiddleware, async (req, res) => {
  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString('pt-BR');

  try {
    const { id, area } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'ID do comodato é obrigatório.' });
    }

  if (area === "relatorio") {
    const areaQuery = 'SELECT comodato_id FROM emprestimo WHERE id_emprestimo = $1';
    const emprestResult = await connection.query(areaQuery, [id]);
    if (emprestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Comodato não encontrado.' });
    }
    id = emprestResult.rows[0].comodato_id;
  }

    // Buscar dados do comodato, cidade e estado
    const comodatoQuery = `
      SELECT
        pc.id_comodato,
        pc.nome_comodato,
        pc.sobrenome_comodato,
        pc.cpf,
        pc.rg,
        pc.cep,
        pc.profissao,
        pc.estado_civil,
        pc.rua,
        pc.bairro,
        pc.numero_casa,
        pc.complemento,
        pc.nacionalidade,
        pc.numero_telefone,
        c.nome_cidades AS cidade,
        e.nome_estado AS estado
      FROM Pessoas_Comodato pc
      JOIN Cidades c ON pc.cidade_id = c.id_cidade
      JOIN Estados e ON c.estado_id = e.id_estado
      WHERE pc.id_comodato = $1;
    `;
    const comodatoResult = await connection.query(comodatoQuery, [id]);
    if (comodatoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Comodato não encontrado.' });
    }
    const comodato = comodatoResult.rows[0];

    // Buscar nome do usuário que criou o comodato (um dos usuários)
    const usuarioQuery = `
      SELECT u.nome_user, u.sobrenome_user
      FROM Emprestimo emp
      JOIN Usuarios u ON emp.user_id = u.id_user
      WHERE emp.comodato_id = $1
      LIMIT 1;
    `;
    const usuarioResult = await connection.query(usuarioQuery, [id]);
    const usuario = usuarioResult.rows[0] || { nome_user: 'Desconhecido', sobrenome_user: '' };

    // Buscar itens emprestados
    const itensQuery = `
      SELECT est.nome_material, est.descricao, est.tamanho
      FROM Emprestimo emp
      JOIN Estoque est ON emp.estoque_id = est.id_estoque
      WHERE emp.comodato_id = $1;
    `;
    const itensResult = await connection.query(itensQuery, [id]);
    const itens = itensResult.rows;

    // Carregar e preencher o template
    const filePath = path.join(__dirname, '..', 'template', 'modelo.docx');
    const content = await fs.readFile(filePath);
    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Montar objeto com os dados para template
    const dados = {
      nome: comodato.nome_comodato,
      sobrenome: comodato.sobrenome_comodato,
      CPF: comodato.cpf,
      RG: comodato.rg,
      CEP: comodato.cep,
      profissao: comodato.profissao,
      estado_civil: comodato.estado_civil,
      rua: comodato.rua,
      numero: comodato.numero_casa,
      complemento: comodato.complemento,
      telefone: comodato.numero_telefone,
      bairro: comodato.bairro,
      nacionalidade: comodato.nacionalidade,
      cidade: comodato.cidade,
      estado: comodato.estado,
      nome_usuario: usuario.nome_user,
      nome_comodato: comodato.nome_comodato,
      data_hoje: dataFormatada,
      items: itens.map(item => ({
        nome_item: item.nome_material,
        descricao: item.descricao,
        tamanho: item.tamanho,
      })),
    };

    doc.setData(dados);

    try {
      doc.render();
    } catch (error) {
      console.error('Erro ao renderizar o DOCX:', error);
      return res.status(500).json({ error: 'Erro ao gerar o documento.' });
    }

    const buf = doc.getZip().generate({ type: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=comodato_${id}.docx`);
    return res.send(buf);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar o documento.' });
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
 *               cpf:
 *                 type: integer
 *               user_id:
 *                 type: integer
 *               estoque_id:
 *                 type: array
 *                 items:
 *                   type: integer

 *     responses:
 *       201:
 *         description: Transação criada com sucesso.
 */
router.post('/',authMiddleware, async (req, res) => {
    try {
        const {  cpf ,user_id, estoque_id } = req.body;

        if ( !user_id || !estoque_id || !Array.isArray(estoque_id) || estoque_id.length === 0) {
            return res.status(400).json({ Error: "Os campos são obrigatórios e estoque_id deve ser uma lista com pelo menos um item." });
        }
        const idQuery = `
        SELECT id_comodato FROM Pessoas_Comodato 
        WHERE cpf = $1 ;
     `;
        const resulte = await connection.query(idQuery, [cpf]);

        if (resulte.rowCount ===0) {
            return res.status(400).json({ Error: `não foi possivel trazer o usuario` });

        }

        const id_como = resulte.rows[0]?.id_comodato
        console.log(id_como)
        const insertQuery = "INSERT INTO emprestimo (comodato_id, user_id, estoque_id, status) VALUES ($1, $2, $3, $4) RETURNING *";
        const updateQuery = "UPDATE Quantidades SET quantidade = quantidade - 1 WHERE estoque_id = $1 AND quantidade > 0 RETURNING quantidade";
        const selectQuery = "select c.nome_comodato,c.sobrenome_comodato,e.comodato_id, e.data_limite from emprestimo e inner join  pessoas_comodato c on  e.comodato_id = c.id_comodato where e.comodato_id = $1";
        const results = [];

        for (const id of estoque_id) {
            const updateResult = await connection.query(updateQuery, [id]);

            if (updateResult.rowCount === 0) {
                return res.status(400).json({ Error: `Estoque insuficiente para o item ${id}.` });
            }

            const result = await connection.query(insertQuery, [id_como, user_id, id, 'Ativo']);
            results.push(result.rows[0]);
        }


        console.log('passou aqui')
        const resultado = await connection.query(selectQuery, [id_como])
        if (resultado.rowCount === 0) {
            console.log(resultado.rows[0])
            console.log('passou aqui 2')

            return res.status(400).json({Error: 'N foi possivel agendar o usuario'})
        } 
        const {nome_comodato, sobrenome_comodato, data_limite} = resultado.rows[0]

        console.log('passou aqui3')

        try{
            scheduleEmail( data_limite, nome_comodato, sobrenome_comodato)
            console.log('passou aqui4')

        }
        catch (err) {
            console.log(err, 'erro no schedule')
        }

        res.status(201).json({ message: "Transações inseridas com sucesso!", transacoes: results });
    } catch (error) {
        console.log('passou erro')

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

/**
 * @swagger
 * /transacao/especifico:
 *   post:
 *     summary: Seleciona items do usuário
 *     description: Retorna os IDs de empréstimo de um usuário específico.
 *     tags: [transacao]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 example: "123"
 *     responses:
 *       201:
 *         description: Transações retornadas com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_emprestimo:
 *                         type: integer
 *       500:
 *         description: Erro interno do servidor.
 */
router.post('/esp', authMiddleware, async (req, res) => {
  try {
    const { id } = req.body;

    const query = "SELECT id_emprestimo FROM emprestimo WHERE user_id = $1";
    const result = await connection.query(query, [id]);

    res.status(201).json({ user: result.rows }); // Adicionado .rows para retornar apenas os dados
  } catch (error) {
    res.status(500).json({ Error: error.message });
  }
});

/**
 * @swagger
 * /transacao/status:
 *   put:
 *     summary: altera o status
 *     description: Adiciona uma nova transação ao banco de dados.
 *     tags: [transacao]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_emprestimo:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Transação alteradacom sucesso.
 */
router.put('/status',authMiddleware, async (req, res) => {
    try {
        const { id_emprestimo  }  = req.body;
        const query = "UPDATE emprestimo SET status = 'Concluido' WHERE id_emprestimo  = $1";
        const result = await connection.query(query,[id_emprestimo ] );
        res.status(201).json({ message: "selected items", material: result.rows[0] });
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});



export default router;
