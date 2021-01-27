import { Injectable } from '@angular/core';
import { Drawing } from '@models/drawing';

@Injectable({
  providedIn: 'root',
})
export class LocalSaveService {
  static readonly LOCAL_DRAWING_ID: string = 'localsave';
  static readonly NEW_DRAWING_ID: string = 'newdrawing';

  private _drawing: Drawing;

  takeSnapshot(drawing: Drawing): void {
    localStorage.setItem(LocalSaveService.LOCAL_DRAWING_ID, JSON.stringify(drawing));
  }

  loadDrawing(): void {
    const localsave: string | null = localStorage.getItem(LocalSaveService.LOCAL_DRAWING_ID);
    if (localsave) {
      this._drawing = JSON.parse(localsave) as Drawing;
    }
  }

  get drawing(): Drawing {
    this.loadDrawing();
    return this._drawing;
  }
}
