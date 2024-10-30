import { Component } from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { UserService } from "../../shared/services/user.service";
import { FormsModule } from "@angular/forms";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ FormsModule ],
  templateUrl: './login.component.html',
  styleUrls: [ './login.component.scss' ]
})
export class LoginComponent {
  username = '';

  constructor(private userService: UserService,
              private router: Router,
              private toastr: ToastrService) {
  }

  login() {
    this.userService.login(this.username).subscribe(
      (res: any) => {
        sessionStorage.setItem("userId", res._id);
        sessionStorage.setItem("username", res.name);
        this.toastr.success("User login successfully", "Success");
        this.router.navigate([ '/home' ]);
      }, err => {
        this.toastr.error(err?.error?.message, 'Error');
      }
    )
  }
}
