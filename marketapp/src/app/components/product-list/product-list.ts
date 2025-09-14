import { Component, OnInit } from '@angular/core';
import { Api } from '../../services/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css']
})
export class ProductList implements OnInit {
  products: any[] = [];
  cart: any[] = [];
  filteredProducts: any[] = [];
  userName: string = '';
  token: string = '';
  searchTerm: string = '';
  isCartVisible: boolean = false;

  // Notifications
  showNotification: boolean = false;
  notificationMessage: string = '';

  // ✅ Formulaire de commande
  showCheckoutForm: boolean = false;
  orderData: any = {
    name: '',
    phone: '',
    email: '',
    address: '',
    delivery: 'standard'
  };

  constructor(private api: Api, private router: Router) {}

  ngOnInit(): void {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      this.router.navigate(['/login']);
      return;
    }

    this.token = storedToken;
    const user = JSON.parse(atob(storedToken.split('.')[1]));
    this.userName = user.display_name && user.display_name.trim() !== ''
                    ? user.display_name
                    : user.email;

    this.api.getProducts().subscribe(res => {
      this.products = res;
      this.filteredProducts = res;
    });
  }

  toggleCart() {
    this.isCartVisible = !this.isCartVisible;
  }

  filterProducts() {
    if (!this.searchTerm.trim()) {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(product =>
        product.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  addToCart(product: any) {
    const existing = this.cart.find(item => item.product.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({ product, quantity: 1 });
    }
  }

  updateQuantity(item: any, newQuantity: number) {
    if (newQuantity <= 0) {
      this.cart = this.cart.filter(i => i !== item);
    } else {
      item.quantity = newQuantity;
    }
  }

  removeFromCart(productId: number) {
    this.cart = this.cart.filter(item => item.product.id !== productId);
  }

  getCartTotal(): number {
    return this.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  // ✅ Ouverture du formulaire
  checkout() {
    if (this.cart.length === 0) return;
    this.showCheckoutForm = true;
  }

  // ✅ Fermeture du formulaire
  closeCheckoutForm() {
    this.showCheckoutForm = false;
  }

 submitOrder(form: any) {
  if (!form.valid) {
    this.showNotificationMessage("❌ Remplissez tous les champs obligatoires.");
    return;
  }

  const order = {
    buyer: this.orderData,
    items: this.cart.map(i => ({
      product_id: i.product.id,
      quantity: i.quantity
    })),
    total: this.getCartTotal()
  };

  this.api.createOrder(order, this.token).subscribe({
    next: () => {
      // Mise à jour du stock local
      this.cart.forEach(item => {
        const product = this.products.find(p => p.id === item.product.id);
        if (product) product.quantity_available -= item.quantity;
      });

      // ✅ Sauvegarder dans l’historique local
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push({
        id: Date.now(),
        userName: this.orderData.name,
        contact: this.orderData.phone,
        address: this.orderData.address,
        items: this.cart.map(i => ({
          titre: i.product.titre,
          quantity: i.quantity,
          price: i.product.price
        })),
        total: this.getCartTotal(),
        date: new Date(),
        status: 'En attente'
      });
      localStorage.setItem('orders', JSON.stringify(orders));

      // Vider le panier et le formulaire
      this.cart = [];
      this.isCartVisible = false;
      this.showCheckoutForm = false;
      this.orderData = { name: '', phone: '', email: '', address: '', delivery: 'standard' };

      // Notification succès
      this.showNotificationMessage("✅ Votre commande a été enregistrée !");
    },
    error: (err) => {
      console.error(err);
      this.showNotificationMessage("❌ Erreur lors de la commande.");
    }
  });
}


  showNotificationMessage(msg: string) {
    this.notificationMessage = msg;
    this.showNotification = true;
    setTimeout(() => this.showNotification = false, 3000);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  goToHistory() {
  this.router.navigate(['/historique']);
}
}
