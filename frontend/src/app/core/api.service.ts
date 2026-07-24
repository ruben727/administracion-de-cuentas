import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  EntradaBitacora,
  Grupo,
  NuevoUsuario,
  ResultadoConsola,
  ResultadoLogin,
  Usuario,
  UsuarioDetalle
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api';

  listarUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.base}/usuarios`);
  }

  obtenerUsuario(id: number): Observable<UsuarioDetalle> {
    return this.http.get<UsuarioDetalle>(`${this.base}/usuarios/${id}`);
  }

  crearUsuario(datos: NuevoUsuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.base}/usuarios`, datos);
  }

  habilitarUsuario(id: number): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.base}/usuarios/${id}/habilitar`, {});
  }

  deshabilitarUsuario(id: number): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.base}/usuarios/${id}/deshabilitar`, {});
  }

  listarGrupos(): Observable<Grupo[]> {
    return this.http.get<Grupo[]>(`${this.base}/grupos`);
  }

  listarBitacora(): Observable<EntradaBitacora[]> {
    return this.http.get<EntradaBitacora[]>(`${this.base}/bitacora`);
  }

  login(username: string, password: string): Observable<ResultadoLogin> {
    return this.http.post<ResultadoLogin>(`${this.base}/login`, { username, password });
  }

  ejecutarComando(comando: string): Observable<ResultadoConsola> {
    return this.http.post<ResultadoConsola>(`${this.base}/consola`, { comando });
  }
}
