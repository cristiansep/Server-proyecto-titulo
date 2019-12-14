const express = require('express');

//paquete para encriptar contraseñas
const bcrypt = require('bcryptjs');

//paquete para generar json-web-tokens
const jwt = require('jsonwebtoken');

//Semilla de token
const SEED = require('../config/config').SEED;

// Inicializar variables
const app = express();

// Modelo usuario
const Usuario = require('../models/usuario');


app.post("/", (req, res) => {
  let body = req.body;

  Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

    
    if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al buscar usuario",
          errors: err
        });
      }

      if(!usuarioDB){
        return res.status(400).json({
            ok: false,
            mensaje: "Credenciales incorrectas - email"
        
          });
      }

      // validar contraseña
      if(!bcrypt.compareSync(body.password, usuarioDB.password)){
        return res.status(400).json({
            ok: false,
            mensaje: "Credenciales incorrectas - password"
         
          });
      }

      // crear token!!!  
       usuarioDB.password = ':)';              //semilla    //duración
      let token = jwt.sign({usuario: usuarioDB}, SEED ,{expiresIn: 14400}); //expira en 4 horas

    res.status(200).json({
      ok: true,
      usuario: usuarioDB,
      token: token,
      id: usuarioDB._id
    });

  });

});



module.exports = app;