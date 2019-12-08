const express = require('express');

// Inicializar variables
const app = express();

app.get('/',(req,res,next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });
});

module.exports = app;