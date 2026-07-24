import { Routes } from '@angular/router';
import { PanelComponent } from './pages/panel/panel';
import { UsuarioDetalleComponent } from './pages/usuario-detalle/usuario-detalle';
import { AccesoComponent } from './pages/acceso/acceso';
import { BitacoraComponent } from './pages/bitacora/bitacora';
import { ConsolaComponent } from './pages/consola/consola';

export const routes: Routes = [
  { path: '', component: PanelComponent },
  { path: 'usuarios/:id', component: UsuarioDetalleComponent },
  { path: 'acceso', component: AccesoComponent },
  { path: 'bitacora', component: BitacoraComponent },
  { path: 'consola', component: ConsolaComponent },
  { path: '**', redirectTo: '' }
];
