import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserService } from "../shared/services/user.service";
import { ToastrService } from "ngx-toastr";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ RouterOutlet, FormsModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  newUserName = '';

  constructor(private userServices: UserService,
              private toastr: ToastrService) {
  }

  createNewUser() {
    this.userServices.createNewUser(this.newUserName).subscribe(() => {
      this.toastr.success('User created successfully', 'Success');
    }, (err) => {
      this.toastr.error(err?.error?.message, 'Error');
    })
  }
}
