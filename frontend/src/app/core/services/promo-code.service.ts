import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PromoCode } from '../models/promo-codes.models';

const API_URL = 'http://localhost:5278/api';


@Injectable({ providedIn: 'root' })
export class PromoCodeService {
  constructor(private http: HttpClient) {}

  validate(code: string): Observable<PromoCode> {
    return this.http.get<PromoCode>(`${API_URL}/PromoCodes/validate?code=${code}`);
  }
}