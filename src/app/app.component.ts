import { Component } from '@angular/core';
import { User } from './interfaces/user';
import { ServerMockService } from './services/server-mock.service';
import { WebAuthnService } from './services/web-authn.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'angular-web-authn';
  users: User[];
  email = 'a@a.com';
  password = 'aaa';
  useFingerprint = true;
  webAuthnAvailable = !!navigator.credentials && !!navigator.credentials.create;
  // signupForm: FormGroup;

  constructor(
    private serverMockService: ServerMockService,
    private webAuthnService: WebAuthnService
  ) {
    this.users = serverMockService.getUsers();

    // this.signupForm = fb.group({
    //   email: ['a@a.com', [Validators.required, Validators.email]],
    //   password: ['aaa', [Validators.required]],
    //   confirmPassword: ['aaa', [Validators.required]],
    // });
  }

  removeUser(email: string) {
    this.serverMockService.removeUser(email);
    this.users = this.serverMockService.getUsers();
  }

  signup() {
    console.log('SIGNUP');

    // Save into the 'DB'
    const prevUser = this.serverMockService.getUser(this.email);
    if (prevUser) {
      alert('🚫 User already exists with this email address');
      return;
    }
    const user: User = this.serverMockService.addUser({
      email: this.email,
      password: this.password,
      credentials: [],
    });
    this.users = this.serverMockService.getUsers();

    // Ask for WebAuthn Auth method
    if (this.webAuthnAvailable && this.useFingerprint) {
      this.webAuthnService
        .webAuthnSignup(user)
        .then((credential: any) => {
          console.log('credentials.create RESPONSE', credential);
          const valid = this.serverMockService.registerCredential(
            user,
            credential
          );
          this.users = this.serverMockService.getUsers();
        })
        .catch((error: any) => {
          console.log('credentials.create ERROR', error);
        });
    }
  }

  signin() {
    console.log('[signin]');
    const user = this.serverMockService
      .getUsers()
      .find((u: any) => u.email === this.email && u.password === this.password);
    if (user) {
      alert('✅ Congrats! Authentication went fine!');
    } else {
      alert('🚫 Sorry :( Invalid credentials!');
    }
  }

  webAuthSignin() {
    const user = this.serverMockService.getUser(this.email);
    if (!user) {
      alert('🚫 User not found!');
      console.log('User not found');
      return; // Salir de la función si no se encuentra el usuario
    }
    this.webAuthnService
      .webAuthnSignin(user)
      .then((response: any) => {
        alert('✅ Congrats! Authentication went fine!');
        console.log('SUCCESSFULLY GOT AN ASSERTION!', response);
      })
      .catch((error: any) => {
        alert('🚫 Sorry :( Invalid credentials!');
        console.log('FAIL', error);
      });
  }
}
