import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveDataLocallyModalComponent } from './save-data-locally-modal.component';
import { MatDialogRef } from '@angular/material/dialog';

describe('SaveDataLocallyModalComponent', () => {
  let component: SaveDataLocallyModalComponent;
  let fixture: ComponentFixture<SaveDataLocallyModalComponent>;
  const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaveDataLocallyModalComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaveDataLocallyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
