const express = require('express');

const mdAutenticacion = require('../middlewares/autenticacion');;


const app = express();


const Medico = require('../models/medico');


//-------------------------//
//Trae todos los medicos  //
//------------------------//
app.get("/", (req, res, next) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

  Medico.find({})
  .skip(desde)
  .limit(5)
  .populate("usuario", "nombre email")
  .populate("hospital")
  .exec((err, medicos) => {

    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al cargar Medico",
        errors: err
      });
    }

    Medico.countDocuments({}, (err, conteo) => {
      res.status(200).json({
        ok: true,
        medicos,
        total: conteo
      });
    });

   
  });
});


//------------------------//
//     Crea medicos      //
//------------------------//
app.post('/',mdAutenticacion.verificaToken ,(req,res)=> {

  let body = req.body;

  let medico = new Medico({
    nombre: body.nombre,
    usuario: req.usuario._id,
    hospital: body.hospital
   
  });

  medico.save((err,medicoGuardado) =>{

    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear medico",
        errors: err
      });
    }

      res.status(201).json({
        ok: true,
        medico: medicoGuardado
      });
  });

});

//------------------------//
//    Actualiza medicos  //
//------------------------//
app.put('/:id',mdAutenticacion.verificaToken ,(req,res) => {

  let id = req.params.id;
  let body = req.body;

  Medico.findById(id, (err, medico) =>{



    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar medico",
        errors: err
      });
    }

    if(!medico){
      return res.status(400).json({
        ok: false,
        mensaje: `Medicos con el ${id} no existe`,
        errors: {
          message: 'No existe un medico con ese id'
        }
      });
    }

    medico.nombre = body.nombre;
    medico.usuario = req.usuario._id;
    medico.hospital = body.hospital;
   

    medico.save((err,medicoGuardado)=>{

      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar medico",
          errors: err
        });
      }
    


      res.status(200).json({
        ok: true,
        medico: medicoGuardado
      });
    });

  });

});

//------------------------ //
//    Elimina medicos     //
//------------------------//
app.delete('/:id',mdAutenticacion.verificaToken ,(req,res) => {

  let id = req.params.id;
  let body = req.body;

  Medico.findByIdAndRemove(id,(err, medicoBorrado) =>{

    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al borrar medico",
        errors: err
      });
    }

    if (!medicoBorrado) {
      return res.status(500).json({
        ok: false,
        mensaje: "No existe un medico con ese id",
        errors: err
      });
    }

      res.status(200).json({
        ok: true,
        medico: medicoBorrado
      });
  });
});

module.exports = app;