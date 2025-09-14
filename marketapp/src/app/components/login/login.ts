import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UtilisateurService } from '../../services/utilisateur';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './login.html'
})
export class LoginComponent {
   user = { email: '', password: '' };
  errorMessage = '';

  constructor(private utilisateurService: UtilisateurService, private router: Router) { }

  onLogin(): void {
    this.utilisateurService.login(this.user).subscribe(
      res => {
        localStorage.setItem('token', res.token);


        const userInfo = this.utilisateurService.getUserIdFromToken();

        if (userInfo?.role === 'acheteur') {
          this.router.navigate(['/products']);
        } else if (userInfo?.role === 'producteur') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      err => {
        console.error('Erreur login', err);
        this.errorMessage = err.error?.message || "Erreur lors de la connexion.";
      }
    );
  }
}
