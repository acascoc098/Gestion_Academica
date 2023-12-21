const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 8000;

const db = mysql.createConnection({
    host: 'localhost',
    port: 33308,
    user: 'root',
    password: 's83n38DGB8d72',
    database: 'gestion',
});

// Conexion a 
db.connect(err => {
    if(err){
        console.error('Error al conectar a MySQL:', err);
        return;
    }
    console.log('Conexion exitosa a MySQL');
});

// Configuracion de sesiones
app.use(
    session({
        secret: 'your-secret-key', //Cambiar a una clave segura en producción
        resave: false,
        saveUninitialized: true,
    })
);

// Configuracion de Pug
app.set('view engine', 'pug');
// La ruta por defecto es views, no hace falta indicarlo
// pero lo ponemos para saber cómo cambiarlo si fuera necesario
app.set('views', path.join(__dirname, 'views'));

// Middleware para analizar el cuerpo de las solicitudes
app.use(bodyParser.urlencoded({ extended: true}));

//Middleware para gestionar la sesion de usuario
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    if(req.session.user===undefined){ 
        if (req.path.startsWith("/error")){
            // Excepcion para mostrar "login incorrecto"
            next();
        }else{
            res.redirect("/login");
        } 
    }else{
        next();
    }
});

// Ruta por defecto
app.get('/', (req,res) => {
    res.render('index', { user: req.session.user});
});

// Ruta para el login
app.get('/login', (req, res) => {
    res.render('login');
});

