import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Grupo, NuevoUsuario, Usuario } from '../../core/models';

@Component({
  selector: 'app-panel',
  imports: [FormsModule, RouterLink],
  templateUrl: './panel.html',
  styleUrl: './panel.css'
})
export class PanelComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly usuarios = signal<Usuario[]>([]);
  readonly grupos = signal<Grupo[]>([]);
  readonly cargando = signal(true);
  readonly mensaje = signal<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  readonly guardando = signal(false);
  readonly mostrarFormulario = signal(false);

  formulario: NuevoUsuario = { nombre_completo: '', username: '', password: '', grupo: '' };

  ngOnInit(): void {
    this.cargarUsuarios();
    this.api.listarGrupos().subscribe((grupos) => this.grupos.set(grupos));
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.api.listarUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: () => {
        this.mensaje.set({ tipo: 'error', texto: 'No fue posible cargar la lista de usuarios.' });
        this.cargando.set(false);
      }
    });
  }

  alternarFormulario(): void {
    this.mostrarFormulario.update((valor) => !valor);
    this.mensaje.set(null);
  }

  crearUsuario(): void {
    if (!this.formulario.nombre_completo || !this.formulario.username || !this.formulario.password) {
      this.mensaje.set({ tipo: 'error', texto: 'Complete nombre completo, usuario y contrasena.' });
      return;
    }

    this.guardando.set(true);
    this.api.crearUsuario(this.formulario).subscribe({
      next: () => {
        this.guardando.set(false);
        this.mensaje.set({ tipo: 'exito', texto: `Usuario "${this.formulario.username}" creado correctamente.` });
        this.formulario = { nombre_completo: '', username: '', password: '', grupo: '' };
        this.mostrarFormulario.set(false);
        this.cargarUsuarios();
      },
      error: (err) => {
        this.guardando.set(false);
        this.mensaje.set({ tipo: 'error', texto: err.error?.error || 'No fue posible crear el usuario.' });
      }
    });
  }

  cambiarEstado(usuario: Usuario): void {
    const habilitar = usuario.estado === 'deshabilitado';
    const accion = habilitar ? 'habilitar' : 'deshabilitar';
    const confirmado = window.confirm(`¿Confirma que desea ${accion} la cuenta "${usuario.username}"?`);
    if (!confirmado) {
      return;
    }

    const peticion = habilitar ? this.api.habilitarUsuario(usuario.id) : this.api.deshabilitarUsuario(usuario.id);
    peticion.subscribe({
      next: () => {
        this.mensaje.set({ tipo: 'exito', texto: `Cuenta "${usuario.username}" ${habilitar ? 'habilitada' : 'deshabilitada'} correctamente.` });
        this.cargarUsuarios();
      },
      error: () => {
        this.mensaje.set({ tipo: 'error', texto: `No fue posible ${accion} la cuenta.` });
      }
    });
  }
}
