import express from 'express';
import connection from '../Database.js'; // Importando conexão com o banco de dados

const router = express.Router();

// teste  api
router.get('/teste', (req, res) => {
    console.log('teste locais')
});


//Estado
//get
router.get('/estado', (req, res) => {
    const query = 'select * from Estados'
    connection.query(query, (err, result)=> {
        if (err) {return res.status(500).json({ Error: err.message})}
    })
    res.json(result)
})

//cidade
// get
router.get('/cidade', (req, res) => {
    const query = 'select * from cidades'
    connection.query(query, (err, result) => {
        if (err) {return res.status(500).json({ Error: err.message})}
        res.json(result)
    })  
})

router.get('/cidade/estados', (req, res) => {
    const query = "SELECT c.nome_cidade, e.nome_estado FROM Cidades c JOIN Estados e ON c.estado_id = e.id_estado;"
    connection.query(query, (err, result) => {
        if (err) {return res.status(500).json({ Error: err.message})}
        res.json(result)
    })  
})



export default router;
