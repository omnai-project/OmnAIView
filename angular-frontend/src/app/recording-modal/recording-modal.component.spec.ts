import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecordingModalComponent } from './recording-modal.component';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

describe('RecordingModalComponent', () => {
  let component: RecordingModalComponent;
  let fixture: ComponentFixture<RecordingModalComponent>;
  const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
  let httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordingModalComponent],
      providers: [
      { provide: MatDialogRef, useValue: dialogRefSpy },
      { provide: HttpClient, useValue: httpClientSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecordingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
