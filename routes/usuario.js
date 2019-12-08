const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mdAutenticacion = require('../middlewares/autenticacion');;

// Inicializar variables
const app = express();


const Usuario = require('../models/usuario');


//-------------------------//
//Trae todos los usuarios  //
//------------------------//
app.get("/", (req, res, next) => {

  Usuario.find({}, 'nombre email img role').exec((err, usuarios) => {

    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al cargar usuario",
        errors: err
      });
    }

    res.status(200).json({
      ok: true,
      usuarios
    });
  });
});


//------------------------//
//     Crea usuarios      //
//------------------------//
app.post('/', mdAutenticacion.verificaToken ,(req,res)=> {

  let body = req.body;

  let usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password,10),
    img: body.img,
    role: body.role
  });

  usuario.save((err,usuarioGuardado) =>{

    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear usuario",
        errors: err
      });
    }

      res.status(201).json({
        ok: true,
        usuario: usuarioGuardado
      });
  });

});

//------------------------//
//    Actualiza usuarios  //
//------------------------//
app.put('/:id',(req,res) => {

  let id = req.params.id;
  let body = req.body;

  Usuario.findById(id, (err,usuario) =>{



    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar usuario",
        errors: err
      });
    }

    if(!usuario){
      return res.status(400).json({
        ok: false,
        mensaje: `Usuarios con el ${id} no existe`,
        errors: {
          message: 'No existe un usuario con ese id'
        }
      });
    }

    usuario.nombre = body.nombre;
    usuario.email = body.email;
    usuario.role = body.role;

    usuario.save((err,usuarioGuardado)=>{

      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar usuario",
          errors: err
        });
      }
      //para no devolver password
      usuarioGuardado.password = ':)';


      res.status(200).json({
        ok: true,
        usuario: usuarioGuardado
      });
    });

  });

});

//------------------------//
//    Elimina usuarios    //
//------------------------//
app.delete('/:id',(req,res) => {

  let id = req.params.id;
  let body = req.body;

  Usuario.findByIdAndRemove(id,(err, usuarioBorrado) =>{

    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al borrar usuario",
        errors: err
      });
    }

    if (!usuarioBorrado) {
      return res.status(500).json({
        ok: false,
        mensaje: "No existe un usuario con ese id",
        errors: err
      });
    }

      res.status(200).json({
        ok: true,
        usuario: usuarioBorrado
      });
  });
});

module.exports = app;