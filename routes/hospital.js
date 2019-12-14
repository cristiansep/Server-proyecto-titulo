const express = require('express');

const mdAutenticacion = require('../middlewares/autenticacion');;


const app = express();


const Hospital = require('../models/hospital');

//----------------------------//
// Trae todos los hospitales //
//--------------------------//
app.get("/", (req, res) => {

  Hospital.find({})
    .populate("uasuario", "nombre email")
    .exec((err, hospitales) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al cargar hospitales",
          errors: err
        });
      }

      res.status(200).json({
        ok: true,
        hospitales
      });
    });
});


//-------------------------//
//     Crea hospitales     //
//------------------------//
app.post('/',mdAutenticacion.verificaToken ,(req,res)=> {

  let body = req.body;

  let hospital = new Hospital({
    nombre: body.nombre,
    usuario: req.usuario._id
  });


  hospital.save((err,hospitalGuardado) =>{

    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear hospital",
        errors: err
      });
    }

      res.status(201).json({
        ok: true,
        hospital: hospitalGuardado,
      
      });
  });

});

//------------------------//
//  Actualiza hospitales  //
//------------------------//
app.put('/:id',mdAutenticacion.verificaToken ,(req,res) => {

  let id = req.params.id;
  let body = req.body;

  Hospital.findById(id, (err,hospital) =>{



    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar hospital",
        errors: err
      });
    }

    if(!hospital){
      return res.status(400).json({
        ok: false,
        mensaje: `Hospitales con el ${id} no existe`,
        errors: {
          message: 'No existe un hospital con ese id'
        }
      });
    }

    hospital.nombre = body.nombre;
    hospital.usuario = req.usuario._id;
   

    hospital.save((err,hospitalGuardado)=>{

      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar hospital",
          errors: err
        });
      }
    

      res.status(200).json({
        ok: true,
        hospital: hospitalGuardado
      });
    });

  });

});


//-------------------------//
//    Elimina hospitales   //
//------------------------//
app.delete('/:id',mdAutenticacion.verificaToken ,(req,res) => {

  let id = req.params.id;
  let body = req.body;

  Hospital.findByIdAndRemove(id,(err, hospitalBorrado) =>{

    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al borrar hospital",
        errors: err
      });
    }

    if (!hospitalBorrado) {
      return res.status(500).json({
        ok: false,
        mensaje: "No existe un hospital con ese id",
        errors: err
      });
    }

      res.status(200).json({
        ok: true,
        hospital: hospitalBorrado
      });
  });
});

module.exports = app;