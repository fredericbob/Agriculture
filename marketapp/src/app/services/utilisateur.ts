import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrlInscription = `${environment.apiUrl}/user`;
  private apiUrlLogin = `${environment.apiUrl}/login`;

  constructor(private http: HttpClient) { }

  addUtilisateur(utilisateur: any): Observable<any> {
    return this.http.post(this.apiUrlInscription, utilisateur);
  }

  login(utilisateur: any): Observable<any> {
    return this.http.post(this.apiUrlLogin, utilisateur);
  }

  logout() {
    localStorage.removeItem('token');
  }

  getUserIdFromToken(): { id: string, role: string, email: string } | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decoded: any = JSON.parse(atob(token.split('.')[1]));
      return { id: decoded.id, role: decoded.role, email: decoded.email };
    } catch (err) {
      console.error('Erreur décodage token', err);
      return null;
    }
  }
}
