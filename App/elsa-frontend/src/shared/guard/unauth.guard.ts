import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  GuardResult,
  MaybeAsync,
  Router,
  RouterStateSnapshot
} from "@angular/router";
import { of } from "rxjs";

@Injectable()
export class UnAuthGuard implements CanActivate {
  constructor(private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    if (sessionStorage.getItem('userId')) {
      this.router.navigate(['/home']);
      return of(false);
    } else {
      return of(true);
    }
  }
}
