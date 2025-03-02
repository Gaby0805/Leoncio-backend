import express from 'express';
import connection from '../Database.js';

const router = express.Router();

// Função para validar se um valor é nulo ou vazio
const isEmpty = (value) => !value || value.toString().trim() === '';

// 🔹 Teste da API
router.get('/teste', (req, res) => {
    console.log('Teste locais');
    res.send("API funcionando");
});

// 🔹 Estado - GET
router.get('/estado', async (req, res) => {
    try {
        const query = 'SELECT * FROM Estados';
        const result = await connection.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ Error: err.message });
    }
});

// 🔹 Cidades - GET
router.get('/cidade', async (req, res) => {
    try {
        const query = 'SELECT * FROM Cidades';
        const result = await connection.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ Error: err.message });
    }
});

// 🔹 Cidades com Estados - GET
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

// 🔹 Criar Cidade - POST
router.post('/cidade/', async (req, res) => {
    try {
        const { nome_cidades, estado_id } = req.body;

        // Validação: impede valores nulos ou vazios
        if (isEmpty(nome_cidades) || isEmpty(estado_id)) {
            return res.status(400).json({ Error: "Os campos 'nome_cidades' e 'estado_id' são obrigatórios." });
        }

        // Query segura com placeholders ($1, $2)
        const query = "INSERT INTO cidades (nome_cidades, estado_id) VALUES ($1, $2) RETURNING *";
        const result = await connection.query(query, [nome_cidades, estado_id]);

        res.json({ message: "Cidade inserida com sucesso!", cidade: result.rows[0] });
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});

// 🔹 Excluir Cidade - DELETE
router.delete('/cidade/', async (req, res) => {
    try {
        const { id_cidade } = req.body;

        // Validação: impede valores nulos ou vazios
        if (isEmpty(id_cidade)) {
            return res.status(400).json({ Error: "O campo 'id_cidade' é obrigatório." });
        }

        // Query segura com placeholder ($1)
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

// 🔹 Atualizar Cidade - PUT
router.put('/cidade/', async (req, res) => {
    try {
        const { nome_cidades, id_cidade } = req.body;

        // Validação: impede valores nulos ou vazios
        if (isEmpty(nome_cidades) || isEmpty(id_cidade)) {
            return res.status(400).json({ Error: "Os campos 'nome_cidades' e 'id_cidade' são obrigatórios." });
        }

        // Query segura com placeholders ($1, $2)
        const query = "UPDATE cidades SET nome_cidades = $1 WHERE id_cidade = $2 RETURNING *";
        const result = await connection.query(query, [nome_cidades, id_cidade]);

        if (result.rowCount === 0) {
            return res.status(404).json({ Error: "Cidade não encontrada." });
        }

        res.json({ message: `Cidade com ID ${id_cidade} foi alterada para '${nome_cidades}'.` });
    } catch (error) {
        res.status(500).json({ Error: error.message });
    }
});

export default router;
