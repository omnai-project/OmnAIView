import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { type DataSourceInfo, DataSourceSelectionService } from './data-source-selection.service';
import {MatCardModule, MatCardHeader, MatCardContent, MatCardActions} from '@angular/material/card';

@Component({
    selector: 'app-source-select-modal',
    standalone: true,
    imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, MatCardModule, MatCardHeader, MatCardContent, MatCardActions],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './source-select-modal.component.html',
    styleUrls: ['./source-select-modal.component.css'],
})
export class SourceSelectModalComponent {
    private readonly datasourceService = inject(DataSourceSelectionService);
    protected readonly sources = this.datasourceService.availableSources;
    protected readonly selected = this.datasourceService.currentSource;

    select(source: DataSourceInfo) {
        this.datasourceService.selectSource(source);
    }
}
