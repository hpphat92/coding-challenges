import { Routes } from '@angular/router';
import { AppComponent } from "./app.component";
import { LoginComponent } from "./login/login.component";
import { JoinRoomComponent } from "./join-room/join-room.component";
import { RegisterComponent } from "./register/register.component";
import { AuthGuard } from "../shared/guard/auth.guard";
import { UnAuthGuard } from "../shared/guard/unauth.guard";
import { HomeComponent } from "./home/home.component";
import { SessionDetailComponent } from "./session-detail/session-detail.component";

export const routes: Routes = [
  {
    path: 'login', component: LoginComponent,
    canActivate: [ UnAuthGuard ]
  },
  {
    path: 'signup', component: RegisterComponent,
    canActivate: [ UnAuthGuard ]
  },
  {
    path: 'rooms', component: JoinRoomComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'home', component: HomeComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'play', component: SessionDetailComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  }
];
