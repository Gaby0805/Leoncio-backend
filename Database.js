// Importando 'pg' com compatibilidade CommonJS
import pkg from 'pg';
const { Pool } = pkg;

import dotenv from 'dotenv';
dotenv.config();

// Criando o pool de conexões
const connection = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

// Teste simples: buscar o horário atual do banco
const getTime = async () => {
  try {
    const res = await connection.query('SELECT NOW()');
    console.log('Horário atual do banco:', res.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
  }
};

// Executar o teste (você pode remover se quiser)
getTime();

// Exportar o pool para uso em outras partes da aplicação
export default connection;