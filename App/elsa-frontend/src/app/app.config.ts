import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideToastr } from "ngx-toastr";
import { provideHttpClient } from "@angular/common/http";
import { UnAuthGuard } from "../shared/guard/unauth.guard";
import { AuthGuard } from "../shared/guard/auth.guard";

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    provideAnimations(), // required animations providers
    provideToastr(),
    UnAuthGuard,
    AuthGuard
  ]
};
