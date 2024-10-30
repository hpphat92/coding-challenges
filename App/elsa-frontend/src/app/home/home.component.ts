import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { QuizService } from "../../shared/services/quiz.service";
import { ToastrService } from "ngx-toastr";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  imports: [
    FormsModule,
    CommonModule
  ],
  styleUrls: [ './home.component.scss' ]
})
export class HomeComponent implements OnInit {
  username = '';
  sessionName = '';
  currentSelectedType = '';
  sessionList: any[] = [];

  constructor(private router: Router,
              private toastr: ToastrService,
              private quizService: QuizService) {
  }

  ngOnInit() {
    this.username = sessionStorage.getItem('username') as string;
    this.getSessionList();
  }

  getSessionList() {
    this.quizService.getSessionByUserId(sessionStorage.getItem('userId')).subscribe((res: any) => {
      this.sessionList = res;
    })
  }

  setSelectedType(type: any) {
    if (type === 'existing') {
      this.router.navigate([ '/rooms' ]);
      return;
    }
    this.currentSelectedType = type;
  }

  createNewSession() {
    const body = {
      sessionName: this.sessionName,
      createdBy: sessionStorage.getItem('userId')
    };
    this.quizService.createNewQuiz(body).subscribe(() => {
      this.toastr.success('Quiz created successfully', 'Success');
      this.quizService.joinQuiz({
        sessionName: this.sessionName,
        userId: sessionStorage.getItem('userId')
      }).subscribe((res: any) => {
        sessionStorage.setItem('userSessionId', res);
        this.router.navigate([ 'play' ]);
      }, err => {
        this.toastr.error(err?.error?.message, 'Error');
      })
    }, err => {
      this.toastr.error(err?.error?.message, 'Error');
    })
  }

  joinSession(roomName: string) {
    this.quizService.joinQuiz({
      sessionName: roomName,
      userId: sessionStorage.getItem('userId')
    }).subscribe((res: any) => {
      sessionStorage.setItem('userSessionId', res);
      this.toastr.success('Quiz joined successfully', 'Success');
      this.router.navigate([ 'play' ]);
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
