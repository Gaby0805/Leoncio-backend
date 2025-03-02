import express from 'express';
import connection from '../Database.js';

const router = express.Router();

// teste  api
router.get('/teste', (req, res) => {
    console.log('teste locais')
});

//Estado
//get
router.get('/estado', async (req, res) => {
    try {
        const query = 'SELECT * FROM Estados';
        const result = await connection.query(query);
        res.json(result.rows); // <- Aqui está a diferença
    } catch (err) {
        res.status(500).json({ Error: err.message });
    }
});


//cidade
// get
router.get('/cidade', async(req, res) => {
    const query = 'select * from Cidades'
    const result = await connection.query(query);
    res.json(result.rows)
    })  


router.get('/cidade/estados', async(req, res) => {
    try {
        const query = "SELECT c.nome_cidades, e.nome_estado FROM Cidades c JOIN Estados e ON c.estado_id = e.id_estado;"
        const result = await connection.query(query, (err, results) => {
            if (err) {return res.status(500).json({ Error: err.message})}
            res.json(results.rows)
        })  
        
    } catch (Error)  {
        res.status(500).json({ Error: Error.message });

    }
})

//post cidades
router.post('/cidade/', async(req, res) => {
    try{
        const {nome_cidades, estado_id} = req.body
        const query = "insert into cidades(nome_cidades, estado_id) values ($1 , $2) returning * "
        const result = await connection.query(query, [nome_cidades, estado_id])
        res.json({menssage: "cidade inserida com sucesso ", cidade: result.rows[0]})
    }
    catch  (error) {

        res.status(500).json({ Error: error.message });
    }    

})
//delete cidade
router.delete('/cidade/', async(req, res) => {
    try{
        const {id_cidade} = req.body
        const query = "DELETE from cidades where id_cidade = $1"
        const result = await connection.query(query, [id_cidade])
        res.json({cidade: `cidade ${id_cidade} excluida`})
    }
    catch  (error) {

        res.status(500).json({ Error: error.message });
    }    

})

//put cidade
router.put('/cidade/', async(req, res) => {
    try{
        const {nome_cidades,id_cidade} = req.body
        const query = "update cidades set nome_cidades = $1 where id_cidade = $2"
        const result = await connection.query(query, [nome_cidades,id_cidade])
        res.json({cidade: `cidade ${nome_cidades} alterada `})
    }
    catch  (error) {

        res.status(500).json({ Error: error.message });
    }    

})


export default router;
