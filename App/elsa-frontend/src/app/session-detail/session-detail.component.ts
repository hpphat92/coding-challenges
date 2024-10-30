import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { QuizService } from "../../shared/services/quiz.service";
import { ToastrService } from "ngx-toastr";
import { CommonModule } from "@angular/common";
import { WebsocketService } from "../../shared/services/websocket.service";
import { CountdownComponent, CountdownModule } from "ngx-countdown";

@Component({
  selector: 'app-session-detail',
  standalone: true,
  templateUrl: './session-detail.component.html',
  imports: [
    FormsModule,
    CommonModule,
    CountdownModule
  ],
  styleUrls: [ './session-detail.component.scss' ]
})
export class SessionDetailComponent implements OnInit {
  @ViewChild('countdown') countdown: CountdownComponent | undefined;

  userSessionId = '';
  allUserBySession: any[] = [];
  question: any;
  selectedAnswer: any;
  sessionDetail: any;
  userDetail: any;
  success = false;
  countdownConfig: any;
  userId: any;

  constructor(private router: Router,
              private toastr: ToastrService,
              private websocketService: WebsocketService,
              private quizService: QuizService) {
  }

  ngOnInit() {
    this.userId = sessionStorage.getItem('userId');
    this.userSessionId = sessionStorage.getItem('userSessionId') as string;
    this.listenStateChanged();
    this.getQuestionOfSession();
  }

  selectAnswer(a: any) {
    this.selectedAnswer = a;
  }

  navigateBack() {
    this.router.navigate([ '/' ]);
  }

  listenStateChanged() {
    this.websocketService.listenForMessage('userStateChanged', (res: any) => {
      const findingUser = this.allUserBySession.find(user => user.userDetails?._id === res.userId);
      if (findingUser) {
        findingUser.score = res.score;
      }
      this.computeSessionList();
    });
    this.websocketService.listenForMessage('joinRoom', (res: any) => {
      if (this.sessionDetail.sessionId !== res.sessionId) {
        return;
      }
      this.allUserBySession.push({
        userDetails: res.user,
        score: 0
      });
      this.computeSessionList();
    });
  }

  computeSessionList() {
    this.allUserBySession = this.allUserBySession?.sort((a: any, b: any) => a.score > b.score ? -1 : 1);
  }

  submitAnswer() {
    const body = {
      userId: sessionStorage.getItem('userId'),
      userSessionId: this.userSessionId,
      questionId: this.question._id,
      answer: this.selectedAnswer
    }
    this.websocketService.sendMessage('Hello, Group!');
    this.quizService.answerTheQuestion(body).subscribe((res: any) => {
      this.selectedAnswer = '';
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
      if (!res?.question?._id) {
        this.success = true;
      }
      this.question = res?.question;
      this.allUserBySession = res?.allUserBySession;
      this.sessionDetail = res?.sessionDetail;
      this.userDetail = res?.userDetail;
      this.computeSessionList();
      this.countdownConfig = {
        leftTime: this.sessionDetail.timeLeft,
        format: 'mm:ss',
        demand: false
      };
      setTimeout(() => {
        if (this.countdown) {
          this.countdown.begin();
        }
      });
    }, err => {
      this.toastr.error(err?.error?.message, 'Error');
    })
  }

  onTimerFinished($event: any) {
    if (this.countdownConfig) {
      if ($event.action == 'done') {
        this.getQuestionOfSession();
      }
    }
  }
}
