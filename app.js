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

// Middleware para gestionar la sesión de usuario
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    if (!req.session.user && !req.path.match("/login"))
        res.redirect("/login")
    else
        next();
});
    

// Ruta por defecto
app.get('/', (req,res) => {
    res.render('index', { user: req.session.user});
});

// Ruta para el login
app.get('/login', (req, res) => {
    res.render('login');
});

// Verificación de credenciales en MySQL
const query = 'SELECT * FROM users WHERE username = ? AND password =?';
db.query(query, [username, password], (err, results) => {
    if (err) {
        console.error('Error al verificar las credenciales:', err);
        res.render("error", {mensaje: "Credenciales no válidas."});
    } else {
        if (results.length > 0) {
            req.session.user = username;
            res.redirect('/');
        } else {
            res.redirect('/login');
        }
    }
});


app.get('/logout', (req, res) => {
    req.session.destroy(err => {
    if (err) res.render("error", {mensaje: err});
    else res.redirect('/login');
    });
});

app.post('/login', (req, res) => {
const { username, password } = req.body;

// Verificación de credenciales en MySQL
const query = 'SELECT * FROM users WHERE username = ? AND password =?';
db.query(query, [username, password], (err, results) => {
    if (err) {
        console.error('Error al verificar las credenciales:', err);
        res.render("error", {mensaje: "Credenciales no válidas."});
    } else {
        if (results.length > 0) {
            req.session.user = username;
            res.redirect('/');
        } else {
            res.redirect('/login');
        }
    }
    });
});

app.get('/error', (req, res) => {
    res.render('error');
});    

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});