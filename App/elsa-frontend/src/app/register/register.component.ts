import { Component } from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { UserService } from "../../shared/services/user.service";
import { FormsModule } from "@angular/forms";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ FormsModule ],
  templateUrl: './register.component.html',
  styleUrls: [ './register.component.scss' ]
})
export class RegisterComponent {
  newUserName = '';

  constructor(private userServices: UserService,
              private router: Router,
              private toastr: ToastrService) {
  }

  createNewUser() {
    this.userServices.createNewUser(this.newUserName).subscribe(() => {
      this.toastr.success('User created successfully', 'Success');
      this.router.navigate(['/login']);
    }, (err) => {
      this.toastr.error(err?.error?.message, 'Error');
    })
  }
}
