import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { SettingsComponent } from '../settings/settings.component';

@Injectable({
  providedIn: 'root'
})
export class SettingsModalService {
  private dialog = inject(MatDialog);
  private currentDialogRef: MatDialogRef<SettingsComponent> | null = null;

  /**
   * Open the settings modal
   */
  openSettings(): MatDialogRef<SettingsComponent> {
    // Close existing dialog if open
    if (this.currentDialogRef) {
      this.currentDialogRef.close();
    }

    this.currentDialogRef = this.dialog.open(SettingsComponent, {
      width: '90vw',
      maxWidth: '1200px',
      height: '90vh',
      maxHeight: '800px',
      panelClass: ['settings-modal', 'mat-dialog-responsive'],
      hasBackdrop: true,
      disableClose: false,
      autoFocus: true,
      restoreFocus: true,
      data: {}
    });

    // Clean up reference when dialog closes
    this.currentDialogRef.afterClosed().subscribe(() => {
      this.currentDialogRef = null;
    });

    return this.currentDialogRef;
  }

  /**
   * Close the settings modal if open
   */
  closeSettings(): void {
    if (this.currentDialogRef) {
      this.currentDialogRef.close();
    }
  }

  /**
   * Check if settings modal is currently open
   */
  isSettingsOpen(): boolean {
    return this.currentDialogRef !== null;
  }
}