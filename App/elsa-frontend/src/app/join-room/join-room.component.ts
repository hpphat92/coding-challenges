import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { QuizService } from "../../shared/services/quiz.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-join-room',
  standalone: true,
  templateUrl: './join-room.component.html',
  imports: [
    FormsModule
  ],
  styleUrls: [ './join-room.component.scss' ]
})
export class JoinRoomComponent {
  roomName = '';

  constructor(private toastr: ToastrService,
              private router: Router,
              private quizService: QuizService) {
  }

  goBackToHome(){
    this.router.navigate(['/']);
  }

  joinSession() {
    this.quizService.joinQuiz({
      sessionName: this.roomName,
      userId: sessionStorage.getItem('userId')
    }).subscribe((res: any) => {
      sessionStorage.setItem('userSessionId', res);
      this.toastr.success('Quiz joined successfully', 'Success');
      this.router.navigate([ 'play' ]);
    }, err => {
      this.toastr.error(err?.error?.message, 'Error');
    })
  }
}
