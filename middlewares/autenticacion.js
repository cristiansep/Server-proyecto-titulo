const jwt = require('jsonwebtoken');

const SEED = require('../config/config').SEED;

//------------------------//
//     Verifica Token     //
//------------------------//
exports.verificaToken = function(req, res, next) {
  let token = req.query.token;

  jwt.verify(token, SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        mensaje: "Token incorrecto",
        errors: err
      });
    }

    req.usuario = decoded.usuario;
    next();
  });
};


//------------------------//
//     Verifica Admin     //
//------------------------//
exports.verificaAdmin = function(req, res, next) {
  let usuario = req.usuario;

  if (usuario.role === "ADMIN_ROLE") {
    next();
    return;
  } else {
    return res.status(401).json({
      ok: false,
      mensaje: "Token incorrecto",
      errors: {
        message: "No es administrador"
      }
    });
  }
};

//------------------------//
//Verifica Admin o usuario //
//------------------------//
exports.verificaUsuario = function(req, res, next) {
  let usuario = req.usuario;
  let id = req.params.id;

  if (usuario.role === "ADMIN_ROLE" || usuario._id === id) {
    next();
    return;
  } else {
    return res.status(401).json({
      ok: false,
      mensaje: "Token incorrecto",
      errors: {
        message: "No es administrador"
      }
    });
  }
};

