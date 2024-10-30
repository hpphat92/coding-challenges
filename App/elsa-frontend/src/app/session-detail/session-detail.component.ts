import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { QuizService } from "../../shared/services/quiz.service";
import { ToastrService } from "ngx-toastr";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-session-detail',
  standalone: true,
  templateUrl: './session-detail.component.html',
  imports: [
    FormsModule,
    CommonModule
  ],
  styleUrls: [ './session-detail.component.scss' ]
})
export class SessionDetailComponent implements OnInit {
  userSessionId = '';
  question: any;
  selectedAnswer: any;
  success = false;

  constructor(private router: Router,
              private toastr: ToastrService,
              private quizService: QuizService) {
  }

  ngOnInit() {
    this.userSessionId = sessionStorage.getItem('userSessionId') as string;
    this.getQuestionOfSession();
  }

  selectAnswer(a: any) {
    this.selectedAnswer = a;
  }

  submitAnswer() {
    const body = {
      userId: sessionStorage.getItem('userId'),
      userSessionId: this.userSessionId,
      questionId: this.question._id,
      answer: this.selectedAnswer
    }
    this.quizService.answerTheQuestion(body).subscribe((res: any) => {
      this.toastr.success('Quiz answer successfully', 'Success');
      this.getQuestionOfSession();
    })
  }

  getQuestionOfSession() {
    const body = {
      userSessionId: this.userSessionId,
      userId: sessionStorage.getItem('userId')
    };
    this.quizService.getCurrentQuestionOfQuiz(body).subscribe((res: any) => {
      if (!res._id) {
        this.success = true;
        return;
      }
      this.question = res;
    }, err => {
      this.toastr.error(err?.error?.message, 'Error');
    })
  }
}
