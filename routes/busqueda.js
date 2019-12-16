const express = require('express');

const Hospital = require('../models/hospital');
const Medico = require('../models/medico');


const app = express();

app.get('/todo/:busqueda',(req,res,next) => {

    let busqueda = req.params.busqueda;
    let regex = new RegExp(busqueda, 'i');

    buscarHospitales(busqueda, regex).then(hospitales => {
      res.status(200).json({
        ok: true,
        hospitales
      });
    });

  
    function buscarHospitales(busqueda, regex) {

      return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex }, (err, hospitales) => {

            if(err){
                reject('Error al cargar hospitales');
            }else {
                resolve(hospitales)
            }


        });

      });
    }
    
});

module.exports = app;