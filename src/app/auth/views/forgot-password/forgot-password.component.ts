import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

import { AppInputComponent} from '../../../core/components/app-input/app-input.component';
import { AppButtonComponent } from '../../../core/components/app-button/app-button.component';
import { SmartLogoComponent} from '../../../core/components/smart-logo/smart-logo.component';
import { AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    RouterModule,
    AppInputComponent,
    AppButtonComponent,
    SmartLogoComponent
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  errorType = '';
  showSuccessMessage = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService  // ← AGREGAR ESTE
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid && !this.isLoading) {
      this.resetPassword();
    } else {
      this.markFormGroupTouched();
    }
  }

  // ← REEMPLAZAR ESTE MÉTODO COMPLETO:
  private resetPassword(): void {
    this.isLoading = true;
    this.clearMessages();

    const email = this.forgotPasswordForm.get('email')?.value;

    // Llamada real al AuthService
    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showSuccessMessage = true;
        setTimeout(() => {
          this.router.navigate(['/login'], {
            queryParams: {
              message: 'check_email',
              email: email
            }
          });
        }, 2500);
      },
      error: (error) => {
        this.isLoading = false;
        this.handleResetPasswordError(error);
      }
    });
  }

  // ← AGREGAR ESTE MÉTODO NUEVO:
  private handleResetPasswordError(error: any): void {
    console.error('Error en forgot password:', error);

    if (error.status === 400) {
      this.showError('Error al procesar la solicitud', 'request_error');
    } else if (error.status === 0) {
      this.showError('Error de conexión. Verifica tu internet e intenta de nuevo', 'network');
    } else {
      this.showError('Error inesperado. Intenta de nuevo más tarde', 'server_error');
    }
  }

  // ← ELIMINAR ESTE MÉTODO (ya no se usa):
  // private handleResetPasswordResponse(email: string): void { ... }

  retrySubmit(): void {
    this.resetPassword();
  }

  private showError(message: string, type: string): void {
    this.errorMessage = message;
    this.errorType = type;
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.errorType = '';
    this.showSuccessMessage = false;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.forgotPasswordForm.controls).forEach(key => {
      const control = this.forgotPasswordForm.get(key);
      control?.markAsTouched();
    });
  }
}
