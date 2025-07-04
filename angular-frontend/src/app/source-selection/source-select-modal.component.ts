import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { type DataSourceInfo, DataSourceSelectionService } from './data-source-selection.service';

@Component({
  selector: 'app-source-select-modal',
  standalone: true,
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './source-select-modal.component.html',
})
export class SourceSelectModalComponent {
  private readonly datasourceService = inject(DataSourceSelectionService);

  readonly sources = this.datasourceService.availableSources;
  readonly selected = this.datasourceService.currentSource;

  private readonly dialogRef = inject(MatDialogRef<SourceSelectModalComponent>);
  select(source: DataSourceInfo) {
    this.datasourceService.selectSource(source);
  }

  clear() {
    this.datasourceService.clearSelection();
  }
}
