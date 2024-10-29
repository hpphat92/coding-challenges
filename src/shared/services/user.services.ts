import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UserServices {
  constructor(private http: HttpClient) {
  }

  createNewUser(username: string) {
    return this.http.post(`${ environment.UserService }/users`, {
      name: username
    })
  }
}
