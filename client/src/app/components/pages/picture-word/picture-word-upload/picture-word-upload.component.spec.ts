import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@components/shared/shared.module';
import { APIService } from '@services/api.service';
import { MockAPIService } from '@services/api.service.spec';
import { EditorService } from '@services/editor.service';
import { MockEditorService } from '@services/editor.service.spec';
import { of } from 'rxjs';

import { PictureWordUploadComponent } from './picture-word-upload.component';

describe('PictureWordUploadComponent', () => {
  let component: PictureWordUploadComponent;
  let fixture: ComponentFixture<PictureWordUploadComponent>;
  const MockMatDialogRef = jasmine.createSpyObj('MatDialogRef', {
    beforeClosed: of(),
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule],
      declarations: [PictureWordUploadComponent],
      providers: [
        { provide: EditorService, useValue: MockEditorService },
        { provide: APIService, useValue: MockAPIService },
        { provide: MatDialogRef, useValue: MockMatDialogRef },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PictureWordUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
