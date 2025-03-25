import express from 'express';
import connection from '../Database.js';
 

const router = express.Router();
const isEmpty = (value) => !value || value.toString().trim() === '';
/**
 * @swagger
 * tags:
 *   - name: usuarios
 *     description: Endpoints para gerenciar usuarios
 */

/**
 * @swagger
 * /usuario/teste:
 *   get:
 *     summary: Teste da API
 *     description: Verifica se a API está funcionando corretamente.
 *     tags: [usuarios]
 *     responses:
 *       200:
 *         description: API funcionando.
 */
// teste api
router.get('/teste', (req, res) => {
    console.log('teste usuario')
});

/**
 * @swagger
 * /usuario:
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
 * /usuario/info:
 *   get:
 *     summary: Listar usuarios
 *     description: Retorna somente id e o nome do usuario 
 *     tags: [usuarios]
 *     responses:
 *       200:
 *         description: usuario  retornada com sucesso.
 */
router.get('/info', async (req, res) => {
    try {
        const query = `select id_usuario, nome_user from usuarios`;
        const result = await connection.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});
/**
/**
 * @swagger
 * /usuario/especifico:
 *   post:
 *     summary: Obtém um usuário específico
 *     description: Retorna o nome de um usuário pelo ID informado.
 *     tags: [usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_usuario:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Usuário encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nome_user:
 *                   type: string
 *                   example: "João Silva"
 *       400:
 *         description: Parâmetro id_usuario ausente
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/especifico', async (req, res) => {
    const { id_usuario } = req.body; // Pegando o ID do body

    if (!id_usuario) {
        return res.status(400).json({ error: "O id_usuario é obrigatório" });
    }

    try {
        const query = `SELECT nome_user FROM usuarios WHERE id_user = $1`;
        const result = await connection.query(query, [id_usuario]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/**
 * @swagger
 * /usuario/:
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
 *         description: usuario criada com sucesso.
 */
router.post('/', async (req, res) => {
    try { //O tipo de usuario se é adm ou normal
        const { u_nome,u_sobrenome,u_email,u_cpf,u_senha,u_tipo  } = req.body;

        if (isEmpty(u_cpf) || isEmpty(u_email) || isEmpty(u_nome) || isEmpty(u_senha) || isEmpty(u_sobrenome) || isEmpty(u_tipo) ) {
            return res.status(400).json({ Error: "Os todos os campos são obrigatórios." });
        }
        //fazer hash da senha
        const query = "select insert_usuario($1,$2,$3,$4,$5,$6)";
        const result = await connection.query(query, [u_nome,u_sobrenome,u_email,u_cpf,u_senha,u_tipo]);

        res.status(201).json({ message: "usuario inserida com sucesso!", usuario: result.rows[0] });
    } catch (error) { 
        res.status(500).json({ Error: error.message });
    }
});
/**
 * @swagger
 * /usuario/autenticar:
 *   post:
 *     summary: Login usuario
 *     description: Autenticar Usuario.
 *     tags: [usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string

 *     responses:
 *       201:
 *         description: usuario criada com sucesso.
 */
router.post('/autenticar', async (req, res) => {
    try { //O tipo de usuario se é adm ou normal
        const { email,senha  } = req.body;
        console.log(email, senha)
        if (isEmpty(email) || isEmpty(senha)) {
            return res.status(400).json({ Error: "Os todos os campos são obrigatórios." });
        }
        //fazer hash da senha
        const query = "select id_user from Usuarios where email = $1 and senha = $2";
        const result = await connection.query(query, [email,senha]);
        if (result.rows.length > 0 ) {
            res.json({ success: true, message: "Usuário autenticado com sucesso!", id_usuario: result.rows[0].id_user});
        }
        else {
            
            res.json({ success: false, message: "Senha ou login não estão correto" });


        }


    } catch (error) { 
        res.status(500).json({ Error: error.message });
    }
});

/**
 * @swagger
 * /usuario:
 *   delete:
 *     summary: Exclui um usuario
 *     description: Remove um usuario do banco de dados pelo ID.
 *     tags: [usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_usuario:
 *                 type: integer
 *     responses:
 *       200:
 *         description: usuario excluída com sucesso.
 */
router.delete('/', async (req, res) => {
    try {
        const { id_usuario } = req.body;

        if (isEmpty(id_usuario)) {
            return res.status(400).json({ Error: "O campo id_usuario é obrigatório." });
        }

        const query = "DELETE FROM usuarios WHERE id_user = $1 RETURNING *";
        const result = await connection.query(query, [id_usuario]);

        if (result.rowCount === 0) {
            return res.status(404).json({ Error: "usuario não encontrada." });
        }

        res.json({ message: `usuario com ID ${id_usuario} excluída com sucesso.` });
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
}); 

/**
 * @swagger
 * /usuario/:
 *   put:
 *     summary: altera um usuario
 *     description: altera um usuario do banco de dados pelo ID.
 *     tags: [usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_usuario:
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
 *         description: usuario alterada com sucesso.
 */
router.put('/', async (req, res) => {
    try {
        const { id_usuario,u_nome,u_sobrenome,u_email,u_cpf,u_senha,u_tipo } = req.body;

        if (isEmpty(u_cpf) || isEmpty(u_email) || isEmpty(u_nome) || isEmpty(u_senha) || isEmpty(u_sobrenome) || isEmpty(u_tipo) ) {
            return res.status(400).json({ Error: "Os todos os campos são obrigatórios." });
        }

        const query = "select update_usuario($1,$2,$3,$4,$5,$6,$7)";
        const result = await connection.query(query, [id_usuario,u_nome,u_sobrenome,u_email,u_cpf,u_senha,u_tipo ]);

        if (result.rowCount === 0) {
            return res.status(404).json({ Error: "usuario não encontrada." });
        }

        res.json({ message: `usuario com ID ${u_nome} alterada com sucesso.` });
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});

export default router;
