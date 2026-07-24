import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { EntradaBitacora } from '../../core/models';

@Component({
  selector: 'app-bitacora',
  imports: [DatePipe],
  templateUrl: './bitacora.html',
  styleUrl: './bitacora.css'
})
export class BitacoraComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly entradas = signal<EntradaBitacora[]>([]);
  readonly cargando = signal(true);

  ngOnInit(): void {
    this.api.listarBitacora().subscribe({
      next: (entradas) => {
        this.entradas.set(entradas);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }
}
