import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';

interface LineaConsola {
  comando: string;
  salida: string;
}

@Component({
  selector: 'app-consola',
  imports: [FormsModule],
  templateUrl: './consola.html',
  styleUrl: './consola.css'
})
export class ConsolaComponent {
  private readonly api = inject(ApiService);

  comando = '';
  readonly historial = signal<LineaConsola[]>([]);
  readonly ejecutando = signal(false);

  ejecutar(): void {
    const comandoActual = this.comando.trim();
    if (!comandoActual) {
      return;
    }

    this.ejecutando.set(true);
    this.api.ejecutarComando(comandoActual).subscribe({
      next: (resultado) => {
        this.historial.update((lineas) => [...lineas, { comando: comandoActual, salida: resultado.salida }]);
        this.comando = '';
        this.ejecutando.set(false);
      },
      error: (err) => {
        this.historial.update((lineas) => [
          ...lineas,
          { comando: comandoActual, salida: err.error?.error || 'Error al ejecutar el comando.' }
        ]);
        this.comando = '';
        this.ejecutando.set(false);
      }
    });
  }
}
