CREATE DATABASE IF NOT EXISTS gestion;

USE `gestion`;

DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Imparte;
DROP TABLE IF EXISTS Matricula;
DROP TABLE IF EXISTS Asignaturas;
DROP TABLE IF EXISTS Profesores;
DROP TABLE IF EXISTS Alumnos;

-- Creación de la tabla Alumnos
CREATE TABLE IF NOT EXISTS Alumnos (
    dni INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100),
    email VARCHAR(100),
    telefono VARCHAR(15)
);

-- Creación de la tabla Profesores
CREATE TABLE IF NOT EXISTS Profesores (
    dni INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100),
    email VARCHAR(100),
    telefono VARCHAR(15)
);

-- Creación de la tabla Asignaturas
CREATE TABLE IF NOT EXISTS Asignaturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    curso INT,
    ciclo VARCHAR(20)
);

-- Creación de la tabla que relaciona Alumnos y Asignaturas 
CREATE TABLE IF NOT EXISTS Matricula (
    dni_alumno INT NOT NULL,
    id_asignatura INT NOT NULL,
    PRIMARY KEY (dni_alumno, id_asignatura),
    FOREIGN KEY (dni_alumno) REFERENCES Alumnos(dni),
    FOREIGN KEY (id_asignatura) REFERENCES Asignaturas(id)
);

-- Creación de la tabla que relaciona Profesores y Asignaturas 
CREATE TABLE IF NOT EXISTS Imparte (
    dni_profesor INT NOT NULL,
    id_asignatura INT NOT NULL,
    PRIMARY KEY (dni_profesor, id_asignatura),
    FOREIGN KEY (dni_profesor) REFERENCES Profesores(dni),
    FOREIGN KEY (id_asignatura) REFERENCES Asignaturas(id)
);

-- Creación de la tabla Users
Create TABLE Users(
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30),
    password VARCHAR(30)
);

CREATE TRIGGER before_insert_alumno_asignatura
BEFORE INSERT ON alumno_asignatura
FOR EACH ROW
BEGIN
    DECLARE alumno_count INT;
    SET alumno_count = (SELECT COUNT(*) FROM alumno_asignatura WHERE asignatura = NEW.asignatura);

    IF alumno_count > 32 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se puede asignar más de 32 alumnos a la asignatura';
    END IF;
END;

INSERT INTO `Users` (`username`, `password`) VALUES ('pepe','Secreto_123')

CREATE TRIGGER before_update_alumno_asignatura
BEFORE UPDATE ON alumno_asignatura
FOR EACH ROW
BEGIN
    DECLARE alumno_count INT;
    SET alumno_count = (SELECT COUNT(*) FROM alumno_asignatura WHERE asignatura = NEW.asignatura);

    IF alumno_count >= 32 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se puede asignar más de 32 alumnos a la asignatura';
    END IF;
END;