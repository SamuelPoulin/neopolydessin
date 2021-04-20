import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { EditorService } from '@services/editor.service';
import { MockEditorService } from '@services/editor.service.spec';
import { SocketService } from '@services/socket-service.service';
import { MockSocketService } from '@services/socket-service.service.spec';
import { of } from 'rxjs';

import { ExportDrawingComponent } from './export-drawing.component';

describe('ExportDrawingComponent', () => {
  let component: ExportDrawingComponent;
  let fixture: ComponentFixture<ExportDrawingComponent>;
  const MockMatDialogRef = jasmine.createSpyObj('MatDialogRef', {
    afterOpened: of(),
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExportDrawingComponent],
      providers: [
        { provide: SocketService, useValue: MockSocketService },
        { provide: EditorService, useValue: MockEditorService },
        { provide: MatDialogRef, useValue: MockMatDialogRef },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportDrawingComponent);
    component = fixture.componentInstance;
    component.editorService.recordedDrawings = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
