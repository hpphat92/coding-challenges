import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {
  }

  createNewUser(username: string) {
    return this.http.post(`${ environment.userService }/users`, {
      name: username
    })
  }

  login(username: string) {
    return this.http.post(`${ environment.userService }/users/login`, {
      name: username
    })
  }
}
