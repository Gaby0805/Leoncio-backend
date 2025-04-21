import express from 'express';
import connection from '../Database.js';
import bcrypt from 'bcrypt'
import {authMiddleware, validationLogin} from './authuser.js'


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
router.get('/',authMiddleware, async (req, res) => {
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
 * /usuario/gettoken:
 *   get:
 *     summary: pega um token
 *     description: Retorna todos os usuarios 
 *     tags: [usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios  retornada com sucesso.
 */
router.get('/gettoken',authMiddleware, async (req, res) => {
    try {
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
router.get('/info',authMiddleware, async (req, res) => {
    try {
        const query = `select id_user, nome_user from usuarios`;
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
 *       400:
 *         description: Parâmetro id_usuario ausente
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/especifico',authMiddleware, async (req, res) => {
    const { id_usuario } = req.body; // Pegando o ID do body

    if (!id_usuario) {
        return res.status(400).json({ error: "O id_usuario é obrigatório" });
    }

    try {
        const query = `SELECT * FROM usuarios WHERE id_user = $1`;
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
router.post('/',async (req, res) => {
    try { //O tipo de usuario se é adm ou normal
        const { u_nome,u_sobrenome,u_email,u_cpf,u_senha,u_tipo  } = req.body;

        if (isEmpty(u_cpf) || isEmpty(u_email) || isEmpty(u_nome) || isEmpty(u_senha) || isEmpty(u_sobrenome) || isEmpty(u_tipo) ) {
            return res.status(400).json({ Error: "Os todos os campos são obrigatórios." });
        }
        const hashpassword = await bcrypt.hash(u_senha, 10)
        //fazer hash da senha
        const query = "select insert_usuario($1,$2,$3,$4,$5,$6)";
        const result = await connection.query(query, [u_nome,u_sobrenome,u_email,u_cpf,hashpassword,u_tipo]);

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
    try {
        const IN_PROD = process.env.NODE_ENV === 'production';
        // O tipo de usuário se é admin ou normal
        const { email, senha } = req.body;
        console.log(email, senha);
        if (isEmpty(email) || isEmpty(senha)) {
            return res.status(400).json({ Error: "Todos os campos são obrigatórios." });
        }
        // Consultar o banco de dados
        const query = "SELECT id_user,tipo_user, senha FROM Usuarios WHERE email = $1";
        const result = await connection.query(query, [email]);
        if (result.rows.length > 0) {

            
            const user = result.rows[0];
            
            console.log(user.tipo_user)
            if (user.tipo_user == 'inativo') {
                return   res.status(401).json({ Error: 'usuario está inativo' });
            }

            const ismatch = await bcrypt.compare(senha, user.senha);
            console.log("Passo 1");
            if (ismatch) {
                console.log("Passo 2");
                try {
                    const token = validationLogin(user.id_user);
                    console.log("Passo 3");
                    res.cookie('token', token, { httpOnly: true, secure: IN_PROD, sameSite: 'none', maxAge: 24 * 60 * 60 * 1000   })
                    console.log('cookie enviado',res.getHeader('Set-Cookie'))
                    res.status(201).json({ success: true, message: "Logado", id_usuario: user.id_user});
                } catch (err) {
                    console.error("Erro ao gerar o token:", err);
                    res.status(500).json({ success: false, message: "Erro ao gerar o token." });
                }
            } else {
                console.log("Passo 4");
                res.json({ success: false, message: "Senha ou login não estão corretos." });
            }
        } else {
            console.log("Passo 5");
            res.json({ success: false, message: "Usuário não encontrado." });
        }
    } catch (error) { 
        console.error("Erro interno:", error);
        res.status(500).json({ Error: error.message });
    }
}
);

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
router.delete('/',authMiddleware, async (req, res) => {
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

        res.json({ message: `usuario com ID ${id_usuario} excluída com sucesso` });
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
 *               u_tipo:
 *                 type: string
 *     responses:
 *       200:
 *         description: usuario alterada com sucesso.
 */
router.put('/',authMiddleware, async (req, res) => {
    try {
        const { id_usuario,u_nome,u_sobrenome,u_email,u_cpf,u_tipo } = req.body;

        if (isEmpty(u_cpf) || isEmpty(u_email) || isEmpty(u_nome) || isEmpty(u_sobrenome) || isEmpty(u_tipo) ) {
            return res.status(400).json({ Error: "Os todos os campos são obrigatórios." });
        }

        const query = "select update_usuario($1,$2,$3,$4,$5,$6  )";
        const result = await connection.query(query, [id_usuario,u_nome,u_sobrenome,u_email,u_cpf,u_tipo ]);

        if (result.rowCount === 0) {
            return res.status(404).json({ Error: "usuario não encontrada." });
        }

        res.json({ message: `usuario com ID ${u_nome} alterada com sucesso.` });
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});

/**
 * @swagger
 * /usuario/tipo:
 *   put:
 *     summary: altera o tipo do usuario
 *     description: altera o tipo do usuario do banco de dados pelo ID.
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
 *               u_tipo:
 *                 type: string
 *     responses:
 *       200:
 *         description: usuario alterada com sucesso.
 */
router.put('/tipo',authMiddleware, async (req, res) => {
    try {
        const { id_usuario,u_tipo } = req.body;
        console.log(id_usuario,u_tipo)
        if (isEmpty(id_usuario) || isEmpty(u_tipo) ) {
            return res.status(400).json({ Error: "Os todos os campos são obrigatórios." });
        }

        const query = "update usuarios set tipo_user = $1 where id_user = $2";
        const result = await connection.query(query, [u_tipo,id_usuario]);

        if (result.rowCount === 0) {
            return res.status(404).json({ Error: "usuario não encontrada." });
        }

        res.json({ message: `usuario com nome ${id_usuario} alterada com sucesso.` });
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});

/**
 * @swagger
 * /usuario/logout:
 *   post:
 *     summary: Realiza logout
 *     description: Remove o cookie de autenticação (token) do cliente.
 *     tags: [auth]
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso.
 *       500:
 *         description: Erro interno no servidor.
 */
router.post('/logout',authMiddleware,(req, res) => {
    try {
        res.cookie('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0), // ou maxAge: 0
            path: '/'
        });
        console.log('pasou')
        res.status(200).json({ message: 'Logout realizado com sucesso. Token removido.' });
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});

export default router;
