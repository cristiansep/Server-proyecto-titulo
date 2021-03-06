const express = require('express');

const mdAutenticacion = require('../middlewares/autenticacion');;


const app = express();


const Hospital = require('../models/hospital');

//----------------------------//
// Trae todos los hospitales //
//--------------------------//
app.get("/", (req, res) => {

  let desde = req.query.desde || 0;
  desde = Number(desde);

  Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate("usuario", "nombre email")
    .exec((err, hospitales) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al cargar hospitales",
          errors: err
        });
      }

      Hospital.countDocuments({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          hospitales,
          total: conteo
        });
      });

      
    });
});


// ==========================================
// Obtener Hospital por ID
// ==========================================
app.get("/:id", (req, res) => {

  var id = req.params.id;

  Hospital.findById(id)
    .populate("usuario", "nombre img email")
    .exec((err, hospital) => {

      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al buscar hospital",
          errors: err
        });
      }

      if (!hospital) {
        return res.status(400).json({
          ok: false,
          mensaje: "El hospital con el id " + id + "no existe",
          errors: { message: "No existe un hospitalcon ese ID" }
        });
      }

      res.status(200).json({
        ok: true,
        hospital: hospital
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