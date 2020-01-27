const express = require('express');

const Hospital = require('../models/hospital');
const Medico = require('../models/medico');
const Usuario = require('../models/usuario');


const app = express();



//--------------------------//
//  Busqueda por coleccion  //
//-------------------------//
app.get("/coleccion/:tabla/:busqueda", (req, res) => {

  let busqueda = req.params.busqueda;
  let tabla = req.params.tabla;
  let regex = new RegExp(busqueda, "i");

  let promesa;

  switch (tabla) {
    case "usuarios":
      promesa = buscarUsuarios(busqueda, regex);
      break;

    case "medicos":
      promesa = buscarMedicos(busqueda, regex);
      break;

    case "hospitales":
      promesa = buscarHospitales(busqueda, regex);
      break;

    default:
      return res.status(400).json({
        ok: false,
        mensaje: 'Parametros de busqueda incorrectos'
      });
  }


  promesa.then(data =>{
    res.status(200).json({
      ok: true,
      [tabla]: data
    });
  })



});


//--------------------------//
//  Busqueda general        //
//-------------------------//
app.get("/todo/:busqueda", (req, res, next) => {

  let busqueda = req.params.busqueda;
  let regex = new RegExp(busqueda, "i");

  Promise.all([
        buscarHospitales(busqueda, regex), 
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas =>{
            res.status(200).json({
              ok: true,
              hospitales: respuestas[0],
              medicos: respuestas[1],
              usuarios: respuestas[2]
            });
        })

});

function buscarHospitales(busqueda, regex) {

  return new Promise((resolve, reject) => {

    Hospital.find({ nombre: regex })
      .populate("usuario", "nombre email img")
      .exec((err, hospitales) => {
        if (err) {
          reject("Error al cargar hospitales");
        } else {
          resolve(hospitales);
        }
      });
  });
}

function buscarMedicos(busqueda, regex) {
  return new Promise((resolve, reject) => {

    Medico.find({ nombre: regex })
          .populate('usuario', 'nombre email img')
          .populate('hospital')
          .exec((err, medicos) => {
      if (err) {
        reject("Error al cargar medicos");
      } else {
        resolve(medicos);
      }
    });
  });
}

function buscarUsuarios(busqueda, regex) {
  return new Promise((resolve, reject) => {

    Usuario.find({}, 'nombre email role img')
           .or([{'nombre': regex}, {'email': regex}])
           .exec((err, usuarios) =>{
             if(err){
               reject('Error al cargar usuario',err);
             }else {
               resolve(usuarios)
             }
           })

  });
}

module.exports = app;