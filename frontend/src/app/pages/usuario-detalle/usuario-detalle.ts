import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { UsuarioDetalle } from '../../core/models';

@Component({
  selector: 'app-usuario-detalle',
  imports: [RouterLink, DatePipe],
  templateUrl: './usuario-detalle.html',
  styleUrl: './usuario-detalle.css'
})
export class UsuarioDetalleComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly ruta = inject(ActivatedRoute);

  readonly usuario = signal<UsuarioDetalle | null>(null);
  readonly cargando = signal(true);
  readonly noEncontrado = signal(false);
  readonly mensaje = signal<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  ngOnInit(): void {
    const id = Number(this.ruta.snapshot.paramMap.get('id'));
    this.cargar(id);
  }

  cargar(id: number): void {
    this.cargando.set(true);
    this.api.obtenerUsuario(id).subscribe({
      next: (usuario) => {
        this.usuario.set(usuario);
        this.cargando.set(false);
      },
      error: () => {
        this.noEncontrado.set(true);
        this.cargando.set(false);
      }
    });
  }

  cambiarEstado(): void {
    const usuario = this.usuario();
    if (!usuario) {
      return;
    }
    const habilitar = usuario.estado === 'deshabilitado';
    const accion = habilitar ? 'habilitar' : 'deshabilitar';
    const confirmado = window.confirm(`¿Confirma que desea ${accion} la cuenta "${usuario.username}"?`);
    if (!confirmado) {
      return;
    }

    const peticion = habilitar ? this.api.habilitarUsuario(usuario.id) : this.api.deshabilitarUsuario(usuario.id);
    peticion.subscribe({
      next: () => {
        this.mensaje.set({ tipo: 'exito', texto: `Cuenta ${habilitar ? 'habilitada' : 'deshabilitada'} correctamente.` });
        this.cargar(usuario.id);
      },
      error: () => {
        this.mensaje.set({ tipo: 'error', texto: `No fue posible ${accion} la cuenta.` });
      }
    });
  }
}
