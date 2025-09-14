import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MeteoService {
  private apiKey = '8468fd8d1ba2c2930bc9dbb8747641e6';
  private ville = 'Antananarivo';
  private apiUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(private http: HttpClient) {}

  // météo actuelle
  getMeteo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/weather?q=${this.ville}&units=metric&appid=${this.apiKey}&lang=fr`);
  }

  // prévisions 5 jours (on prendra 8 tranches = 24h)
  getPrevision24h(): Observable<any> {
    return this.http.get(`${this.apiUrl}/forecast?q=${this.ville}&units=metric&appid=${this.apiKey}&lang=fr`);
  }
}
