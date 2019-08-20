const express = require('express');
const multer = require('multer');
const exphbs = require('express-handlebars');
const fs = require('fs');
const rimraf = require('rimraf');

const calculateTaxes = require('./utils/xml');

const upload = multer({dest: 'tmp'});

const hbs = exphbs.create({
    helpers: {
        currency: (val) => {
            return '$' + val.toFixed(2);
        }
    }
});

const PORT = process.env.PORT | 5000;
const app = express();

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.get('/', (req,res) => {
    res.render('index', {title: 'Calculo de Facturas'});
});

app.post('/', upload.any(), async (req, res) => {

    const { facturas, resultado } = calculateTaxes(req);

    res.render('result', {title :"Resultados", resultado: resultado, facturas: facturas});
});

app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}`);
});