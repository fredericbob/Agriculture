import { Routes } from '@angular/router';
import { ProductList } from './components/product-list/product-list';
import { LoginComponent } from './components/login/login';
import { InscriptionComponent } from './components/inscription/inscription';
import { Orderhistory } from './components/orderhistory/orderhistory';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'inscription', component: InscriptionComponent },
  { path: 'products', component: ProductList },
   { path: 'historique', component: Orderhistory },
  // Page 404
  { path: '**', redirectTo: 'login' }
];
