import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ResultadoLogin } from '../../core/models';

@Component({
  selector: 'app-acceso',
  imports: [FormsModule],
  templateUrl: './acceso.html',
  styleUrl: './acceso.css'
})
export class AccesoComponent {
  private readonly api = inject(ApiService);

  username = '';
  password = '';

  readonly enviando = signal(false);
  readonly resultado = signal<ResultadoLogin | null>(null);

  intentarAcceso(): void {
    if (!this.username || !this.password) {
      return;
    }
    this.enviando.set(true);
    this.resultado.set(null);
    this.api.login(this.username, this.password).subscribe({
      next: (resultado) => {
        this.resultado.set(resultado);
        this.enviando.set(false);
      },
      error: () => {
        this.resultado.set({ acceso: false, motivo: 'Ocurrio un error al intentar el acceso.' });
        this.enviando.set(false);
      }
    });
  }
}
