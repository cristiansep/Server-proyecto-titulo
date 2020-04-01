const express = require('express');

const mdAutenticacion = require('../middlewares/autenticacion');;


const app = express();


const Paciente = require('../models/paciente');


//-------------------------//
//Trae 5 medicos  //
//------------------------//
app.get("/", (req, res, next) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

  Paciente.find({})
  .skip(desde)
  .limit(5)
  .populate("usuario", "nombre email")
  .exec((err, pacientes) => {

    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al cargar Paciente",
        errors: err
      });
    }

    Paciente.countDocuments({}, (err, conteo) => {
      res.status(200).json({
        ok: true,
        pacientes,
        total: conteo
      });
    });

   
  });
});

//-------------------------//
//Trae todos los medicos  //
//------------------------//
app.get("/pacientes", (req, res, next) => {

  let desde = req.query.desde || 0;
  desde = Number(desde);

Paciente.find({})
.skip(desde)
.populate("usuario", "nombre email")
.exec((err, pacientes) => {

  if (err) {
    return res.status(500).json({
      ok: false,
      mensaje: "Error al cargar Paciente",
      errors: err
    });
  }

  Medico.countDocuments({}, (err, conteo) => {
    res.status(200).json({
      ok: true,
      pacientes,
      total: conteo
    });
  });

 
});
});

//-------------------------//
//    Obtener Paciente       //
//------------------------//
app.get('/:id', (req,res) => {

  let id = req.params.id;

  Paciente.findById(id)
        .populate("usuario", "nombre email img")
        .exec((err,paciente) => {

          if (err) {
            return res.status(500).json({
              ok: false,
              mensaje: "Error al buscar paciente",
              errors: err
            });
          }
      
          if(!paciente){
            return res.status(400).json({
              ok: false,
              mensaje: `Pacientes con el ${id} no existe`,
              errors: {
                message: 'No existe un medico con ese id'
              }
            });
          }

          res.status(200).json({
            ok: true,
            paciente
          });
      

        });
});


//------------------------//
//     Crea pacientes      //
//------------------------//
app.post('/',mdAutenticacion.verificaToken ,(req,res)=> {

  let body = req.body;

  let paciente = new Paciente({
    nombre: body.nombre,
    rut: body.rut,
    usuario: req.usuario._id,
   
  });

  paciente.save((err,pacienteGuardado) =>{

    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear paciente",
        errors: err
      });
    }

      res.status(201).json({
        ok: true,
        paciente: pacienteGuardado
      });
  });

});

//------------------------//
//    Actualiza pacientes  //
//------------------------//
app.put('/:id',mdAutenticacion.verificaToken ,(req,res) => {

  let id = req.params.id;
  let body = req.body;

  Paciente.findById(id, (err, paciente) =>{



    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar paciente",
        errors: err
      });
    }

    if(!paciente){
      return res.status(400).json({
        ok: false,
        mensaje: `Paciente con el ${id} no existe`,
        errors: {
          message: 'No existe un paciente con ese id'
        }
      });
    }

    paciente.nombre = body.nombre;
    paciente.rut = body.rut;
    paciente.usuario = req.usuario._id;
   
   

    paciente.save((err,pacienteGuardado)=>{

      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar paciente",
          errors: err
        });
      }
    


      res.status(200).json({
        ok: true,
        paciente: pacienteGuardado
      });
    });

  });

});

//------------------------ //
//    Elimina pacientes     //
//------------------------//
app.delete('/:id',mdAutenticacion.verificaToken ,(req,res) => {

  let id = req.params.id;
  let body = req.body;

  Paciente.findByIdAndRemove(id,(err, pacienteBorrado) =>{

    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al borrar paciente",
        errors: err
      });
    }

    if (!pacienteBorrado) {
      return res.status(500).json({
        ok: false,
        mensaje: "No existe un paciente con ese id",
        errors: err
      });
    }

      res.status(200).json({
        ok: true,
        medico: pacienteBorrado
      });
  });
});

module.exports = app;