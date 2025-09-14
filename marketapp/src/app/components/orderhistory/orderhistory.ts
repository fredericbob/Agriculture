import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orderhistory',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orderhistory.html',
  styleUrls: ['./orderhistory.css']
})
export class Orderhistory implements OnInit {
  constructor(private router: Router) {}
  orders: any[] = [];

  ngOnInit() {
    this.orders = JSON.parse(localStorage.getItem('orders') || '[]');
  }
  goToProducts() {
  this.router.navigate(['/products']);
}
}
