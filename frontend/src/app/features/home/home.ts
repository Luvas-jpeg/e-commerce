import { CurrencyPipe } from "@angular/common";
import { ProductService } from "../../core/services/product.service";
import { Component, computed, inject, signal } from "@angular/core";
import { CartService } from "../../core/services/cart.service";
import { Product } from "../../core/models/product.models";

type ProductFilter = 'all' | 'equipment' | 'course';

@Component({
  selector: 'app-home',
  imports: [CurrencyPipe],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly selectedFilter = signal<ProductFilter>('all');
  readonly searchTerm = signal('')

  readonly filteredProducts = computed(() => {
    const filter = this.selectedFilter();
    const search = this.searchTerm().trim().toLowerCase();

    return this.products().filter(product => {
      const matchesFilter = filter === 'all' || product.tipoProduto === filter;
      const matchesSearch = 
        product.nome.toLowerCase().includes(search) || 
        product.description.toLowerCase().includes(search) || 
        product.category.toLowerCase().includes(search);

      return matchesFilter && matchesSearch;
    });
  });

  constructor() {
    this.loadProducts();
  }

  setFilter(filter: ProductFilter): void {
    this.selectedFilter.set(filter);
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  addToCart(product: Product): void {
    this.cartService.add(product, 1);
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getAll().subscribe({
      next: products  => {
        this.products.set(products);
        this.loading.set((false));
      },
      error: () => {
        this.error.set('Não foi possível carregar os produtos.');
        this.loading.set(false)
      }
    })
  }
}