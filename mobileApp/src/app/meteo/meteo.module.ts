import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http'; // Ajout nécessaire pour le service météo

import { MeteoPageRoutingModule } from './meteo-routing.module';
import { MeteoPage } from './meteo.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule, // Ajout pour les appels HTTP
    MeteoPageRoutingModule
  ],
  declarations: [MeteoPage] // Maintenant ça fonctionne car le composant n'est plus standalone
})
export class MeteoPageModule {}
