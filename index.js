const express = require('express');
const multer = require('multer');
const exphbs = require('express-handlebars');
const fs = require('fs');
const path = require('path');
const tmp = require('tmp');
const x2j = require('xml2js');



const tmpvar = tmp.dirSync({dir: '.'});
const upload = multer({dest: tmpvar.name});

const hbs = exphbs.create({
    helpers: {
        currency: (val) => {
            return '$' + val.toFixed(2);
        }
    }
});

const parser = new x2j.Parser();

const PORT = process.env.PORT | 5000;
const app = express();

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.get('/', (req,res) => {
    res.render('index', {title: 'Calculo de Facturas'});
});

app.post('/', upload.any(), async (req, res, next) => {

    const facturas = []; 
    let resultado = {
        subtotal: 0,
        impuestos: 0,
        total: 0
    };

    for(let file of req.files){
        await fs.readFile(file.path, (err,data) => {
            if(err){
                console.log(err);
                throw err;
            }

            parser.parseString(data, (err, result) => {
                if(err){
                    console.log(err);
                    throw err;
                }

                const root = result['cfdi:Comprobante']['$'];

                let factura = {
                    subtotal: parseFloat(root.SubTotal),
                    total: parseFloat(root.Total),
                    impuestos: parseFloat(root.Total) - parseFloat(root.SubTotal)
                };

                resultado.impuestos += factura.impuestos;
                resultado.subtotal += factura.subtotal;
                resultado.total += factura.total;

                facturas.push(factura);

            });
        });

    }
    res.render('result', {title :"Resultados", resultado: resultado, facturas: facturas});
});

process.on('SIGINT',()=>{
    fs.rmdirSync(tmpvar.name);
});

process.on('exit', ()=>{
    fs.rmdirSync(tmpvar.name);
});

app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}`);
});