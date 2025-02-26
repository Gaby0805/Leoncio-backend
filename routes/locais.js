import express from 'express';
import connection from '../Database.js'; // Importando conexão com o banco de dados

const router = express.Router();

// teste  api
router.get('/teste', (req, res) => {
    console.log('teste locais')
});


export default router;
