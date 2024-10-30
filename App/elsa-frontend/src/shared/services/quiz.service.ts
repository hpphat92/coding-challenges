import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  constructor(private http: HttpClient) {
  }

  createNewQuiz(requestBody: any) {
    return this.http.post(`${ environment.quizService }/quiz`, requestBody)
  }

  joinQuiz(requestBody: any) {
    return this.http.post(`${ environment.quizService }/quiz/join`, requestBody)
  }

  getCurrentQuestionOfQuiz(requestBody: any) {
    return this.http.post(`${ environment.quizService }/quiz/current-question`, requestBody)
  }


  getSessionByUserId(userId: any) {
    return this.http.get(`${ environment.quizService }/quiz/user/${userId}`)
  }

  answerTheQuestion(requestBody: any) {
    return this.http.put(`${ environment.quizService }/quiz/answer-question`, requestBody)
  }
}
