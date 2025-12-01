export class Usuario {
  constructor(
    id,
    nombre,
    apellidos,
    rol,
    grupo,
    matricula,
    correo,
    celular,
    edificio
  ) {
    this.id = id;
    this.nombre = nombre;
    this.apellidos = apellidos;
    this.rol = rol;
    this.grupo = grupo;
    this.matricula = matricula;
    this.correo = correo;
    this.celular = celular;
    this.edificio = edificio;
  }

  getNombreCompleto() {
    return `${this.nombre} ${this.apellidos}`;
  }
}
