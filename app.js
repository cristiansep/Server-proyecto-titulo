// Requires
const express = require('express');
const mongoose = require('mongoose'); mongoose.set('useCreateIndex', true); mongoose.set('useFindAndModify', false);
const bodyParser = require('body-parser');


// Inicializar variables
const app = express();


// Cors
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS"); 
    next();
  });


// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Importar rutas
const appRoutes = require('./routes/app');
const usuarioRoutes = require('./routes/usuario');
const loginRoutes = require('./routes/login');
const hospitalRoutes = require('./routes/hospital');
const medicoRoutes = require('./routes/medico');
const busquedaRoutes = require('./routes/busqueda');
const uploadRoutes = require('./routes/upload');
const imagenesRoutes = require('./routes/imagenes');


// Conexion a la base de datos con ODM mongoose
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', 
        {useNewUrlParser: true,useUnifiedTopology: true }, (err,res) =>{

    if(err) throw err;

    console.log('Base de datos: \x1b[34m%s\x1b[0m','online');

});


//Rutas
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);




// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server corriendo en puerto 3000: \x1b[34m%s\x1b[0m','online');
})