import { InjectionToken } from '@angular/core';

export const API_URL = new InjectionToken<string>('Pelifolk API URL', {
  providedIn: 'root',
  factory: () => 'http://localhost:8000/api/v1',
});
