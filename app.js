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
/*app.use((req, res, next) => {
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
});*/
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    if (!req.session.user && !req.path.match("/login"))
        res.redirect("/login")
    else
        next();
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

app.post('/login', (req, res) => {
    const { username, password } = req.body;

// Verificación de credenciales en MySQL
    const query = 'SELECT * FROM Users WHERE username = ? AND password =?';
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

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
    if (err) res.render("error", {mensaje: err});
    else res.redirect('/login');
    });
});

app.get('/error', (req, res) => {
    res.render('error');
});    

// Rutas
app.get('/alumnos', (req, res) => {
    // Obtener todos los alumnos de la base de datos
    db.query('SELECT * FROM Alumnos', (err, result) => {
        if (err) res.render("error", {mensaje: err});
        else res.render('alumnos', { alumnos: result });
    });
});

app.get('/alumnos-add', (req, res) => {
    res.render('alumnos-add');
});

app.post('/alumnos-add', (req, res) => {
// Insertar un nuevo alumno en la base de datos
    const { nombre, apellido } = req.body;
    db.query('INSERT INTO Alumnos (nombre, apellido, email, telefono) VALUES (?, ?, ?, ?)', [nombre, apellido], (err, result) => {
        if (err) res.render("error", {mensaje: err});
        else res.redirect('/alumnos');
    });
});

app.get('/alumnos-edit/:id', (req, res) => {

    const alumnoId = req.params.id;
    // Obtener un alumno por su DNI
    db.query('SELECT * FROM Alumnos WHERE dni = ?', [alumnoId], (err, result) => {
        if (err) res.render("error", {mensaje: err});
        else{
            if (resylt.length>0) {
                res.render('alumnos-edit', { alumno: result[0] });
            }else{
                res.render('error',{mensaje: 'El alumno no existe'})
            }
        }
    });
});

app.post('/alumnos-edit/:dni', (req, res) => {

    const alumnoId = req.params.id;
    // Actualizar un alumno por su DNI
    const { nombre, apellido } = req.body;
    db.query('UPDATE Alumnos SET nombre = ?, apellido = ?, email = ?, telefono = ? WHERE dni = ?', [nombre, apellido, alumnoId], (err, result) => {
        if (err)
        res.render("error", {mensaje: err});
        else
        res.redirect('/alumnos');
    });
});
    
app.get('/alumnos-delete/:dni', (req, res) => {
    const alumnoId = req.params.id;
    // Obtener y mostrar el alumno a eliminar
    db.query('SELECT * FROM Alumnos WHERE dni = ?', [alumnoId], (err,result) => {
    if (err)
        res.render("error", {mensaje: err});
    else
        res.render('alumnos-delete', { alumno: result[0] });
    });

});

app.post('/alumnos-delete/:dni', (req, res) => {
    const alumnoId = req.params.id;
    // Eliminar un alumno por su DNI
    db.query('DELETE FROM Alumnos WHERE dni = ?', [alumnoId], (err,result) => {
    if (err)
        res.render("error", {mensaje: err});
    else
        res.redirect('/alumnos');
    });
});
    
//- Ruta para mostrar todas las asignaturas
app.get('/asignaturas', (req, res) => {
    db.query('SELECT * FROM Asignaturas', (err, result) => {
      if (err)
        res.render("error", { mensaje: err });
      else {
        res.render("asignaturas", { asignaturas: result });
      }
    });
  });
  
//- Ruta para mostrar el formulario de agregar asignaturas
app.get('/asignaturas-add', (req, res) => {
  res.render("asignaturas-add");
});

//- Ruta para agregar una nueva asignatura a la base de datos
app.post('/asignaturas-add', (req, res) => {
  const { nombre, ciclo, curso } = req.body;
  db.query('INSERT INTO Asignaturas (nombre, ciclo, curso) VALUES (?, ?, ?)', [nombre, ciclo, curso], (err, result) => {
    if (err) throw err;
    res.redirect('/asignaturas');
  });
});

//- Ruta para mostrar el formulario de editar una asignatura específica
app.get('/asignaturas-edit/:id', (req, res) => {
  const asignaturaId = req.params.id;
  db.query('SELECT * FROM Asignaturas WHERE id = ?', [asignaturaId], (err, result) => {
    if (err)
      res.render("error", { mensaje: err });
    else
      res.render("asignaturas-edit", { asignatura: result[0] });
  });
});

//- Ruta para actualizar una asignatura por su ID
app.post('/asignaturas-edit/:id', (req, res) => {
  const asignaturaId = req.params.id;
  const { nombre, ciclo, curso } = req.body;
  db.query('UPDATE Asignaturas SET nombre = ?, ciclo = ?, curso = ? WHERE id = ?', [nombre, ciclo, curso, asignaturaId], (err, result) => {
    if (err)
      res.render("error", { mensaje: err });
    else
      res.redirect('/asignaturas');
  });
});

//- Ruta para mostrar el formulario de eliminar una asignatura específica
app.get('/asignaturas-delete/:id', (req, res) => {
  const asignaturaId = req.params.id;
  db.query('SELECT * FROM Asignaturas WHERE id = ?', [asignaturaId], (err, result) => {
    if (err)
      res.render("error", { mensaje: err });
    else
      res.render('asignaturas-delete', { asignatura: result[0] });
  });
});

//- Ruta para eliminar una asignatura por su ID
app.post('/asignaturas-delete/:id', (req, res) => {
  const asignaturaId = req.params.id;
  db.query('DELETE FROM Asignaturas WHERE id = ?', [asignaturaId], (err, result) => {
    if (err)
      res.render("error", { mensaje: err });
    else
      res.redirect('/asignaturas');
  });
});

// Rutas
app.get('/matricular', (req, res) => {
  // Obtener lista de alumnos y asignaturas
  const queryAlumnos = 'SELECT * FROM Alumnos';
  const queryAsignaturas = 'SELECT * FROM Asignaturas';

  db.query(queryAlumnos, (errAlumnos, resultAlumnos) => {
    if (errAlumnos) throw errAlumnos;

    db.query(queryAsignaturas, (errAsignaturas, resultAsignaturas) => {
      if (errAsignaturas) throw errAsignaturas;

      res.render('matriculas', {
        alumnos: resultAlumnos,
        asignaturas: resultAsignaturas,
      });
    });
  });
});

app.post('/matricular', (req, res) => {
  const { alumno, asignatura } = req.body;

  // Verificar si la matrícula ya existe
  const queryExistencia = 'SELECT * FROM Matricula WHERE Alumnos = ? AND Asignaturas = ?';
  
  db.query(queryExistencia, [alumno, asignatura], (errExistencia, resultExistencia) => {
    if (errExistencia) throw errExistencia;

    if (resultExistencia.length === 0) {
      // Matricular al alumno en la asignatura
      const queryMatricular = 'INSERT INTO Matricula (Alumnos, Asignaturas) VALUES (?, ?)';
      
      db.query(queryMatricular, [alumno, asignatura], (errMatricular) => {
        if (errMatricular) throw errMatricular;

        res.redirect('/matricular');
      });
    } else {
      // Matrícula ya existe
      res.render('error', { mensaje: 'La matrícula ya existe' });
    }
  });
});

app.get('/asignaturas/:alumnoId', (req, res) => {
  const alumnoId = req.params.alumnoId;

  // Obtener asignaturas matriculadas para el alumno seleccionado
  const queryAsignaturasMatriculadas = `
    SELECT Asignaturas.nombre as asignatura, Alumnos.*
    FROM Asignaturas, Alumnos, Matricula
    WHERE Matricula.Alumnos = ?
    AND Asignaturas.id = Matricula.Asignaturas
    AND Alumnos.id = Matricula.Alumnos;`;

  db.query(queryAsignaturasMatriculadas, [alumnoId], (err, result) => {
    if (err) res.render('error', { mensaje: err });
    else {
      const asignaturas = result;
      db.query('select * from Alumnos where Alumnos.id=?', [alumnoId], (err, result) => {
        if (err) res.render('error', { mensaje: err });
        else
          res.render('Matricula', { alumno: result[0], asignaturasMatriculadas: asignaturas });
      });
    }
  });
});
  
// Rutas
app.get('/matricular', (req, res) => {
  // Obtener lista de alumnos y asignaturas
  const queryAlumnos = 'SELECT * FROM Alumnos';
  const queryAsignaturas = 'SELECT * FROM Asignaturas';

  db.query(queryAlumnos, (errAlumnos, resultAlumnos) => {
    if (errAlumnos) throw errAlumnos;

    db.query(queryAsignaturas, (errAsignaturas, resultAsignaturas) => {
      if (errAsignaturas) throw errAsignaturas;

      res.render('matriculas', {
        alumnos: resultAlumnos,
        asignaturas: resultAsignaturas,
      });
    });
  });
});

app.post('/matricular', (req, res) => {
  const { alumno, asignatura } = req.body;

  // Verificar si la matrícula ya existe
  const queryExistencia = 'SELECT * FROM Matricula WHERE Alumnos = ? AND Asignaturas = ?';
  
  db.query(queryExistencia, [alumno, asignatura], (errExistencia, resultExistencia) => {
    if (errExistencia) throw errExistencia;

    if (resultExistencia.length === 0) {
      // Matricular al alumno en la asignatura
      const queryMatricular = 'INSERT INTO Matricula (Alumnos, Asignaturas) VALUES (?, ?)';
      
      db.query(queryMatricular, [alumno, asignatura], (errMatricular) => {
        if (errMatricular) throw errMatricular;

        res.redirect('/matricular');
      });
    } else {
      // Matrícula ya existe
      res.render('error', { mensaje: 'La matrícula ya existe' });
    }
  });
});

app.get('/asignaturas/:alumnoId', (req, res) => {
  const alumnoId = req.params.alumnoId;

  // Obtener asignaturas matriculadas para el alumno seleccionado
  const queryAsignaturasMatriculadas = `
    SELECT Asignaturas.nombre as asignatura, Alumnos.*
    FROM Asignaturas, Alumnos, Matricula
    WHERE Matricula.Alumnos = ?
    AND Asignaturas.id = Matricula.Asignaturas
    AND Alumnos.id = Matricula.Alumnos;`;

  db.query(queryAsignaturasMatriculadas, [alumnoId], (err, result) => {
    if (err) res.render('error', { mensaje: err });
    else {
      const asignaturas = result;
      db.query('select * from Alumnos where Alumnos.id=?', [alumnoId], (err, result) => {
        if (err) res.render('error', { mensaje: err });
        else
          res.render('Matricula', { alumno: result[0], asignaturasMatriculadas: asignaturas });
      });
    }
  });
});

//- Ruta para mostrar todos los profesores
app.get('/profesores', (req, res) => {
  db.query('SELECT * FROM Profesores', (err, result) => {
    if (err)
      res.render("error", { mensaje: err });
    else {
      res.render("profesores", { profesores: result });
    }
  });
});

//- Ruta para mostrar el formulario de agregar profesores
app.get('/profesores-add', (req, res) => {
  res.render("profesores-add");
});

//- Ruta para agregar un nuevo profesor a la base de datos
app.post('/profesores-add', (req, res) => {
  const { nombre, especialidad } = req.body;
  db.query('INSERT INTO Profesores (nombre, apellidos, email, telefono) VALUES (?, ?, ?, ?)', [nombre, especialidad], (err, result) => {
    if (err) throw err;
    res.redirect('/profesores');
  });
});

//- Ruta para mostrar el formulario de editar un profesor específico
app.get('/profesores-edit/:dni', (req, res) => {
  const profesorId = req.params.id;
  db.query('SELECT * FROM Profesores WHERE dni = ?', [profesorId], (err, result) => {
    if (err)
      res.render("error", { mensaje: err });
    else
      res.render("profesores-edit", { profesor: result[0] });
  });
});

//- Ruta para actualizar un profesor por su DNI
app.post('/profesores-edit/:dni', (req, res) => {
  const profesorId = req.params.id;
  const { nombre, especialidad } = req.body;
  db.query('UPDATE Profesores SET nombre = ?, apellidos = ?, email = ?, telefono = ? WHERE dni = ?', [nombre, especialidad, profesorId], (err, result) => {
    if (err)
      res.render("error", { mensaje: err });
    else
      res.redirect('/profesores');
  });
});

//- Ruta para mostrar el formulario de eliminar un profesor específico
app.get('/profesores-delete/:dni', (req, res) => {
  const profesorId = req.params.id;
  db.query('SELECT * FROM Profesores WHERE dni = ?', [profesorId], (err, result) => {
    if (err)
      res.render("error", { mensaje: err });
    else
      res.render('profesores-delete', { profesor: result[0] });
  });
});

//- Ruta para eliminar un profesor por su DNI
app.post('/profesores-delete/:dni', (req, res) => {
  const profesorId = req.params.id;
  db.query('DELETE FROM Profesores WHERE dni = ?', [profesorId], (err, result) => {
    if (err)
      res.render("error", { mensaje: err });
    else
      res.redirect('/profesores');
  });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});