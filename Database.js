import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg; // Importando Pool corretamente

// Criando uma nova conexão com o banco de dados
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: process.env.NAME,
    password: process.env.PASSWORD,
    port: 5432
});

const gettime = async () => {
    try {
        const res = await pool.query('SELECT * FROM usuarios');
        console.log(res.rows);
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
    }
};

// Executa a função de teste
gettime();

export default pool;
