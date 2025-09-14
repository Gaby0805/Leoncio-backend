/* trunk-ignore(git-diff-check/error) */
import express from "express";
import connection from "../Database.js";
import scheduleEmail from "../tasks/organize.js";
import { authMiddleware } from "./authuser.js";
import path from "path";
import { fileURLToPath } from "url";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import fs from 'fs/promises';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: transacao
 *     description: Endpoints para gerenciar os empréstimos
 */

router.get("/teste", (req, res) => {
  console.log("Teste locais");
  res.send("API funcionando");
});

/**
 * @swagger
 * /transacao/:
 *   get:
 *     summary: Lista todos os empréstimos
 *     tags: [transacao]
 */
router.get("/", async (req, res) => {
  try {
    const query = "SELECT * FROM emprestimo";
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
 *     summary: Lista empréstimos ativos
 *     tags: [transacao]
 */
router.get("/ativos", authMiddleware, async (req, res) => {
  try {
    const query = "SELECT * FROM emprestimo WHERE status = 'Ativo'";
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
 *     summary: Retorna informações detalhadas dos empréstimos
 *     tags: [transacao]
 */
router.get("/info", authMiddleware, async (req, res) => {
  try {
    const selectQuery = `
SELECT 
    e.id_emprestimo,
    e.comodato_id,
    c.nome_comodato,
    c.sobrenome_comodato,
    c.numero_telefone,
    e.status,
    e.data_criacao,
    e.data_limite,
    i.identificacao_do_item,
    s.descricao AS descricao_sub_categoria,
    s.nome
FROM emprestimo e
INNER JOIN pessoas_comodato c 
    ON e.comodato_id = c.id_comodato
LEFT JOIN item i 
    ON e.item_id = i.id_item
LEFT JOIN sub_categoria s 
    ON i.sub_categoria_id = s.id_sub_categoria;
    `;
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
 *     summary: Lista empréstimos concluídos
 *     tags: [transacao]
 */
router.get("/concluidos", authMiddleware, async (req, res) => {
  try {
    const query = "SELECT * FROM emprestimo WHERE status = 'Concluido'";
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
 *     summary: Cria um novo empréstimo
 *     tags: [transacao]
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { cpf, user_id, item_id, data } = req.body;

    if (!user_id || !item_id || !Array.isArray(item_id) || item_id.length === 0) {
      return res.status(400).json({
        Error: "Os campos são obrigatórios e item_id deve ser uma lista com pelo menos um item.",
      });
    }

    const idQuery = `SELECT id_comodato FROM pessoas_comodato WHERE cpf = $1`;
    const resultComodato = await connection.query(idQuery, [cpf]);

    if (resultComodato.rowCount === 0) {
      return res.status(400).json({ Error: "Comodato não encontrado para este CPF" });
    }

    const comodato_id = resultComodato.rows[0].id_comodato;
    const insertQuery = `
      INSERT INTO emprestimo (comodato_id, user_id, item_id, status, data_criacao)
      VALUES ($1, $2, $3, $4,$5)
      RETURNING *;
    `;

    const results = [];
    for (const id of item_id) {
      const resultInsert = await connection.query(insertQuery, [
        comodato_id,
        user_id,
        id,
        "Ativo",
        data
      ]);
      results.push(resultInsert.rows[0]);
    }

    // Buscar nome + data limite para envio de e-mail
    const selectQuery = `
      SELECT c.nome_comodato, c.sobrenome_comodato, e.data_limite
      FROM emprestimo e
      INNER JOIN pessoas_comodato c ON e.comodato_id = c.id_comodato
      WHERE e.comodato_id = $1
      LIMIT 1;
    `;
    const resultSelect = await connection.query(selectQuery, [comodato_id]);
    const { nome_comodato, sobrenome_comodato, data_limite } = resultSelect.rows[0];

    try {
      scheduleEmail(data_limite, nome_comodato, sobrenome_comodato);
    } catch (err) {
      console.log("Erro ao agendar e-mail:", err);
    }

    res.status(201).json({ message: "Empréstimos criados com sucesso!", transacoes: results });
  } catch (error) {
    res.status(500).json({ Error: error.message });
  }
});

/**
 * @swagger
 * /transacao/status:
 *   put:
 *     summary: Altera o status de um empréstimo
 *     tags: [transacao]
 */
router.put("/status", authMiddleware, async (req, res) => {
  try {
    const { id_emprestimo } = req.body;
    const query = "UPDATE emprestimo SET status = 'Concluido' WHERE id_emprestimo = $1 RETURNING *";
    const result = await connection.query(query, [id_emprestimo]);

    if (result.rowCount === 0) {
      return res.status(404).json({ Error: "Empréstimo não encontrado" });
    }

    res.status(200).json({ message: "Status atualizado com sucesso!", emprestimo: result.rows[0] });
  } catch (error) {
    res.status(500).json({ Error: error.message });
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

function formatCPF(cpf) {
  cpf = cpf.replace(/\D/g, ''); // remove tudo que não for número
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatTelefone(tel) {
  tel = tel.replace(/\D/g, '');
  if (tel.length === 11) {
    return tel.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (tel.length === 10) {
    return tel.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  } else {
    return tel;
  }
}

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



// Rota para gerar DOCX do comodato
router.post('/doc', authMiddleware, async (req, res) => {
  let new_id;

  try {
    const { id, area } = req.body;
    if (!id) return res.status(400).json({ error: 'ID do comodato é obrigatório.' });

    // Determinar o comodato
    if (area === "relatorio") {
      const areaQuery = 'SELECT comodato_id FROM emprestimo WHERE id_emprestimo = $1';
      const emprestResult = await connection.query(areaQuery, [id]);
      if (emprestResult.rows.length === 0) return res.status(404).json({ error: 'Comodato não encontrado.' });
      new_id = emprestResult.rows[0].comodato_id;
    } else {
      new_id = id;
    }

    
    // Buscar dados do comodato
    const comodatoQuery = `
    SELECT pc.*, c.nome_cidades AS cidade, e.nome_estado AS estado
    FROM Pessoas_Comodato pc
    JOIN Cidades c ON pc.cidade_id = c.id_cidade
    JOIN Estados e ON c.estado_id = e.id_estado
    WHERE pc.id_comodato = $1;
    `;
    const comodatoResult = await connection.query(comodatoQuery, [new_id]);
    if (comodatoResult.rows.length === 0) return res.status(404).json({ error: 'Comodato não encontrado.' });
    const comodato = comodatoResult.rows[0];
    
    // Buscar usuário que criou o comodato
    const usuarioQuery = `
    SELECT u.nome_user || ' ' || u.sobrenome_user AS secretaria_completo, u.tipo_user
    FROM Emprestimo emp
    JOIN Usuarios u ON emp.user_id = u.id_user
    WHERE emp.comodato_id = $1
    LIMIT 1;
    `;
    const usuarioResult = await connection.query(usuarioQuery, [new_id]);
    const usuario = usuarioResult.rows[0] || { secretaria_completo: 'Desconhecido', tipo_user: 'N/A' };
    
    // Buscar itens emprestados
// Buscar itens emprestados (já trazendo id_item)
const itensQuery = `
  SELECT 
    i.id_item,
    i.identificacao_do_item AS nome_material, 
    sc.nome AS sub_categoria, 
    sc.descricao
  FROM Emprestimo emp
  JOIN Item i ON emp.item_id = i.id_item
  JOIN Sub_Categoria sc ON i.sub_categoria_id = sc.id_sub_categoria
  WHERE emp.comodato_id = $1;
`;
const itensResult = await connection.query(itensQuery, [new_id]);
const itens = itensResult.rows;

// Data atual
const datesql = `
  SELECT 
    EXTRACT(YEAR FROM now() AT TIME ZONE 'America/Campo_Grande') AS ano,
    EXTRACT(MONTH FROM now() AT TIME ZONE 'America/Campo_Grande') AS mes,
    EXTRACT(DAY FROM now() AT TIME ZONE 'America/Campo_Grande') AS dia;
`;
const date_result = await connection.query(datesql);
const { ano, mes, dia } = date_result.rows[0];
const ano_p = ano + 1;

// Atualizar todos os itens emprestados para status = false
if (itens.length > 0) {
  const ids = itens.map(i => i.id_item);

  const update_sql = `
    UPDATE item 
    SET status = false 
    WHERE id_item = ANY($1::int[])
    RETURNING *;
  `;
  const update_result = await connection.query(update_sql, [ids]);

  console.log("Itens atualizados:", update_result.rows);
} else {
  console.log("Nenhum item emprestado encontrado para este comodato.");
}
    // Buscar presidente
    const presidentesql = `
    SELECT nome_user || ' ' || sobrenome_user AS nome_completo
    FROM usuarios
    WHERE tipo_user = 'Presidente'
      LIMIT 1;
    `;
    const presidente_result = await connection.query(presidentesql);
    const presidente_obj = presidente_result.rows[0] || { nome_completo: 'N/A' };

    // Buscar coordenador
    const coordenadorsql = `
      SELECT nome_user || ' ' || sobrenome_user AS nome_completo, tipo_user
      FROM usuarios
      WHERE tipo_user = 'Diretor de Patrimonio'
      LIMIT 1;
    `;
    const coordenador_query = await connection.query(coordenadorsql);
    const coordenador_obj = coordenador_query.rows[0] || { nome_completo: 'N/A', tipo_user: 'N/A' };

    // Contador de empréstimos
    const contador_sql = `SELECT COUNT(*)::int AS total FROM emprestimo WHERE id_emprestimo <= $1;`;
    const contador_query = await connection.query(contador_sql, [id]);
    const contador_obj = contador_query.rows[0];

    // Carregar template DOCX
    const filePath = path.join(__dirname, '..', 'template', 'modelo3.docx');
    const content = await fs.readFile(filePath); // ✅ usando fs/promises
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    // Montar dados para template
    const dados = {
      nome: comodato.nome_comodato,
      sobrenome: comodato.sobrenome_comodato,
      CPF: formatCPF(comodato.cpf),
      RG: comodato.rg,
      CEP: comodato.cep,
      profissao: comodato.profissao,
      estado_civil: comodato.estado_civil,
      rua: comodato.rua,
      numero: comodato.numero_casa,
      complemento: comodato.complemento,
      telefone: formatTelefone(comodato.numero_telefone),
      telefone2: formatTelefone(comodato.numero_telefone2),
      bairro: comodato.bairro,
      nacionalidade: comodato.nacionalidade,
      cidade: comodato.cidade,
      estado: comodato.estado,
      nome_usuario: usuario.secretaria_completo,
      Cargo: usuario.tipo_user,
      dia,
      mes,
      ano,
      ano_p,
      contador: contador_obj.total,
      Presidente: presidente_obj.nome_completo,
      nome_usuariocoordenador: coordenador_obj.nome_completo,
      Cargo_coordenador: coordenador_obj.tipo_user,
      items: itens.map(item => ({
        nome_item: item.nome_material,
        sub_categoria: item.sub_categoria,
        descricao: item.descricao
      })),
    };

    doc.setData(dados);

    try {
      doc.render();
    } catch (error) {
      console.error("Erro ao renderizar DOCX:", error);
      return res.status(500).json({ error: "Erro ao gerar o documento." });
    }

    const buf = doc.getZip().generate({ type: "nodebuffer" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=comodato_${id}.docx`
    );
    res.send(buf);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao consultar o banco de dados." });
  }
});

export default router;


