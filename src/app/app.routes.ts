import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page.component';
import { PropiedadesPageComponent } from './pages/propiedades-page.component';
import { PropiedadDetailPageComponent } from './pages/propiedad-detail-page.component';
import { NosotrosPageComponent } from './pages/nosotros-page.component';
import { TasacionesPageComponent } from './pages/tasaciones-page.component';
import { ContactoPageComponent } from './pages/contacto-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'propiedades', component: PropiedadesPageComponent },
  { path: 'propiedades/:slug', component: PropiedadDetailPageComponent },
  { path: 'nosotros', component: NosotrosPageComponent },
  { path: 'tasaciones', component: TasacionesPageComponent },
  { path: 'contacto', component: ContactoPageComponent },
  { path: '**', redirectTo: '' },
];
