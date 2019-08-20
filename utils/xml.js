const convert = require('xml-js');
const fs = require('fs');

module.exports = ({files}) => {
    const facturas = []; 
    let resultado = {
        subtotal: 0,
        impuestos: 0,
        total: 0
    };
    
    for(file of files){
        const data = fs.readFileSync(file.path).toString();

        const root = JSON.parse(convert.xml2json(data)).elements[0].attributes;

        console.log(root);

        let factura = {
            subtotal: parseFloat(root.SubTotal),
            total: parseFloat(root.Total),
            impuestos: parseFloat(root.Total) - parseFloat(root.SubTotal)
        };

        resultado.impuestos += factura.impuestos;
        resultado.subtotal += factura.subtotal;
        resultado.total += factura.total;

        facturas.push(factura);
    }
    return { facturas, resultado };
}