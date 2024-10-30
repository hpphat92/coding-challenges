import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket;

  constructor() {
    this.socket = io(environment.websocketService);

    // Listen for messages from the server
    this.socket.on('message', (data) => {
      console.log('Message from server: ', data);
    });
  }

  // Send a message to the server
  sendMessage(message: string) {
    this.socket.emit('message', message);
  }

  listenForMessage(message: string, callback: any) {
    this.socket.off(message);
    this.socket.on(message, callback);
  }
}
