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

// Autenticacion
const mdAutenticacion = require('../middlewares/autenticacion');

// Google
const CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


//**************************//
//        Google            //
//*************************//
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  //const userid = payload["sub"];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];

  return {

    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  }
}

//**************************//
//       Renueva Token      //
//*************************//
app.get('/renuevatoken',mdAutenticacion.verificaToken,(req,res)=>{

  let token = jwt.sign({usuario: req.usuario}, SEED ,{expiresIn: 14400}); //expira en 4 horas

  res.status(200).json({
    ok: true,
    token
  });

});


//**************************//
// Autenticacion de google  //
//*************************//
app.post('/google', async(req,res)=>{

  let token = req.body.token;

  let googleUser = await verify(token).catch(e =>{
    return res.status(403).json({
      ok: false,
      mensaje: "Token no valido"
    });
  
  });

  Usuario.findOne({email: googleUser.email}, (err,usuarioDB)=>{

    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar usuario",
        errors: err
      });
    }

    if (usuarioDB) {
      if (usuarioDB.google === false) {
        return res.status(500).json({
          ok: false,
          mensaje: "Debe utilizar su autenticacion normal"
        });
      } else {
        let token = jwt.sign({ usuario: usuarioDB }, SEED, {expiresIn: 14400});

        res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          token: token,
          id: usuarioDB._id,
          menu: obtenerMenu(usuarioDB.role)
        });
      }
    }else{
      // crear nuevo usuario
      let usuario = new Usuario();

      usuario.nombre = googleUser.nombre,
      usuario.email = googleUser.email,
      usuario.img = googleUser.img,
      usuario.google = true,
      usuario.password = ':)'


      usuario.save((err,usuarioDB)=>{

        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: "Error para grabar usuario",
            errors: err
          });
        }

        let token = jwt.sign({ usuario: usuarioDB }, SEED, {expiresIn: 14400}); 

        res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          token: token,
          id: usuarioDB._id,
          menu: obtenerMenu(usuarioDB.role)
        });

      });

    }

  });

});


//**********************//
// Autenticacion normal //
//**********************//
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
      id: usuarioDB._id,
      menu: obtenerMenu(usuarioDB.role)
    });

  });

});

function obtenerMenu(ROLE){

 var menu = [
    {
      titulo: 'Inicio',
      icono: 'mdi mdi-gauge',
      submenu: [
        { titulo: 'Home', url: '/home' },
        { titulo: 'Informaciónes', url: '/progress' },
        { titulo: 'Graficas', url: '/graficas' }
      ]
    },
    {
      titulo: 'Mantenimiento',
      icono: 'mdi mdi-folder-lock-open',
      submenu: [
        // { titulo: 'Usuarios', url: '/usuarios' },
        { titulo: 'Hospitales', url: '/hospitales' },
        { titulo: 'Medicos', url: '/medicos' }
      ]
    }
  ];

  if(ROLE === 'ADMIN_ROLE'){
    menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
  }


  return menu;
}

module.exports = app;