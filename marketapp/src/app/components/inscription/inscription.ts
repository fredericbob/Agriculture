import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UtilisateurService } from '../../services/utilisateur';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inscription.html'
})
export class InscriptionComponent {
  user: any = {
    nom: '',
    prenom: '',
    email: '',
    phone: '',
    password: '',
    role: 'acheteur',
    buyer: { organisation: '', adresse: '' },
    producer: { organisation: '', region: '', parcelle_nom: '' }
  };

  errorMessage: string = '';

  constructor(private utilisateurService: UtilisateurService, private router: Router) {}

  onInscription(): void {
    this.utilisateurService.addUtilisateur(this.user).subscribe({
      next: (res: any) => {
        console.log('Inscription réussie', res);
        localStorage.setItem('token', res.token);
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error('Erreur d\'inscription:', err);
        this.errorMessage = err.error?.error || "Erreur lors de l'inscription";
      }
    });
  }
}
