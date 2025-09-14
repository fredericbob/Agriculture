import { Component, OnInit } from '@angular/core';
import { MeteoService } from '../services/meteo';
import { Stock } from '../services/stock';

@Component({
  selector: 'app-meteo',
  templateUrl: './meteo.page.html',
  styleUrls: ['./meteo.page.scss'],
  standalone: false,
})
export class MeteoPage implements OnInit {

  meteoData: any = null;
  loading: boolean = false;
  error: string = '';
  stocks: any[] = [];
  loadingStocks: boolean = false;
  errorStocks: string = '';
  token: string = '';
  previsions: any[] = [];
  alerteMeteo: string = '';

  constructor(private meteoService: MeteoService, private stockService: Stock) { }

  ngOnInit() {

    this.chargerMeteo();


    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      this.token = storedToken;
      this.chargerStocks();
    }
  }


chargerMeteo() {
  this.loading = true;
  this.error = '';

  this.meteoService.getMeteo().subscribe({
    next: (data) => {
      this.meteoData = data;

      this.meteoService.getPrevision24h().subscribe({
        next: (forecastData) => {
          this.previsions = forecastData.list.slice(0, 8);

          // Vérifier si pluie ou orage
          const risque = this.previsions.find(p =>
            p.weather[0].main === 'Rain' || p.weather[0].main === 'Thunderstorm'
          );
          if (risque) {
            this.alerteMeteo = '⚠️ Risque de pluie ou orage dans les prochaines 24h !';
          } else {
            this.alerteMeteo = '';
          }

          this.loading = false;
        }
      });
    },
    error: (err) => {
      this.error = 'Erreur lors du chargement des données météo';
      this.loading = false;
    }
  });
}

  rafraichir(event?: any) {
    this.chargerMeteo();
    if (event) event.target.complete();
  }

  getWeatherIcon(condition: string): string {
    const iconMap: { [key: string]: string } = {
      'Clear': 'sunny',
      'Clouds': 'cloudy',
      'Rain': 'rainy',
      'Drizzle': 'rainy',
      'Thunderstorm': 'thunderstorm',
      'Snow': 'snow',
      'Mist': 'cloudy',
      'Smoke': 'cloudy',
      'Haze': 'cloudy',
      'Dust': 'cloudy',
      'Fog': 'cloudy',
      'Sand': 'cloudy',
      'Ash': 'cloudy',
      'Squall': 'cloudy',
      'Tornado': 'cloudy'
    };
    return iconMap[condition] || 'partly-sunny';
  }

  chargerStocks() {
    this.loadingStocks = true;
    this.errorStocks = '';

    this.stockService.getStocks(this.token).subscribe({
      next: (data) => {

        this.stocks = Array.isArray(data) ? data : [];

        if (this.stocks.length === 0) {
          this.stocks.push({ titre: 'Aucun stock', quantity_available: 0, unit: '' });
        }
        this.stocks = this.stocks.map(s => ({
          ...s,
          quantity_available: s.quantity_available ? s.quantity_available : 0
        }));

        this.loadingStocks = false;
        console.log('Stocks:', this.stocks);
      },
      error: (err) => {
        this.errorStocks = 'Erreur lors du chargement des stocks';
        this.loadingStocks = false;
        console.error('Erreur stocks:', err);
      }
    });
  }

  rafraichirStocks(event?: any) {
    this.chargerStocks();
    if (event) event.target.complete();
  }
}
