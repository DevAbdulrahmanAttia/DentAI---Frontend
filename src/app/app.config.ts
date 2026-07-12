import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { loadingInterceptor } from '@core/interceptors/loading.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { API_URL } from '@core/tokens/api-url.token';
import { apiConfig } from '@core/config/api.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(routes),

    provideHttpClient(
      withInterceptors([authInterceptor, loadingInterceptor, errorInterceptor])
    ),

    { provide: API_URL, useValue: apiConfig.baseUrl }
  ]
};