export type EstadoUsuario = 'habilitado' | 'deshabilitado';

export interface Usuario {
  id: number;
  nombre_completo: string;
  username: string;
  estado: EstadoUsuario;
  requiere_cambio_password: boolean;
  fecha_creacion: string;
  ultimo_login: string | null;
  grupos: string;
}

export interface Grupo {
  id: number;
  nombre: string;
}

export interface UsuarioDetalle {
  id: number;
  nombre_completo: string;
  username: string;
  estado: EstadoUsuario;
  requiere_cambio_password: boolean;
  fecha_creacion: string;
  ultimo_login: string | null;
  grupos: Grupo[];
}

export interface NuevoUsuario {
  nombre_completo: string;
  username: string;
  password: string;
  grupo: string;
}

export interface EntradaBitacora {
  id: number;
  accion: string;
  detalle: string;
  fecha: string;
  username: string | null;
}

export interface ResultadoLogin {
  acceso: boolean;
  motivo: string;
  nombre_completo?: string;
  requiere_cambio_password?: boolean;
}

export interface ResultadoConsola {
  salida: string;
}
