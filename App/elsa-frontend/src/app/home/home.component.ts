import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { QuizService } from "../../shared/services/quiz.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  imports: [
    FormsModule
  ],
  styleUrls: [ './home.component.scss' ]
})
export class HomeComponent implements OnInit {
  username = '';
  sessionName = '';

  constructor(private router: Router,
              private toastr: ToastrService,
              private quizService: QuizService) {
  }

  ngOnInit() {
    this.username = sessionStorage.getItem('username') as string;
  }

  createNewSession() {
    const body = {
      sessionName: this.sessionName,
      createdBy: sessionStorage.getItem('userId')
    };
    this.quizService.createNewQuiz(body).subscribe(() => {
      this.toastr.success('Quiz created successfully', 'Success');
    }, err => {
      this.toastr.error(err?.error?.message, 'Error');
    })
  }

  logout() {
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userId');
    this.router.navigate([ '/login' ]);
  }
}
