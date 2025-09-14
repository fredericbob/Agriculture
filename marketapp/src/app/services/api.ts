import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private API_URL = `${environment.apiUrl}/api`; 

  constructor(private http: HttpClient) {}

  getProducts(): Observable<any> {
    return this.http.get(`${this.API_URL}/products`);
  }

  createOrder(order: any, token: string): Observable<any> {
    return this.http.post(`${this.API_URL}/orders`, order, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}
