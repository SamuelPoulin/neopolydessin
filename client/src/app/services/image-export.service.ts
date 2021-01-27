import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FilterType } from '@components/pages/export-modal/filter-type.enum';
import { EditorUtils } from '@utils/color/editor-utils';
import { DrawingSurfaceComponent } from 'src/app/components/pages/editor/drawing-surface/drawing-surface.component';

@Injectable({
  providedIn: 'root',
})
export class ImageExportService {
  constructor(private sanitizer: DomSanitizer) {}

  safeURL(surface: DrawingSurfaceComponent): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(EditorUtils.createDataURL(surface));
  }

  async exportImageElement(surface: DrawingSurfaceComponent, extension: string, filter: FilterType): Promise<string> {
    const image = new Image();
    const canvas = document.createElement('canvas');
    EditorUtils.addFilter(surface, filter);
    image.src = EditorUtils.createDataURL(surface);
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    EditorUtils.removeFilter(surface);
    return new Promise<string>((resolve) => {
      image.onload = (): void => {
        canvas.width = surface.width;
        canvas.height = surface.height;
        ctx.drawImage(image, 0, 0);
        resolve(canvas.toDataURL(`image/${extension}`));
      };
    });
  }

  exportSVGElement(surface: DrawingSurfaceComponent, filter: FilterType): SafeResourceUrl {
    let dataUrl: SafeResourceUrl;
    EditorUtils.addFilter(surface, filter);
    dataUrl = this.safeURL(surface);
    EditorUtils.removeFilter(surface);
    return dataUrl;
  }
  sendSVGElement(surface: DrawingSurfaceComponent, filter: FilterType): string {
    let dataUrl: string;
    EditorUtils.addFilter(surface, filter);
    dataUrl = EditorUtils.createSerializedString(surface);
    EditorUtils.removeFilter(surface);
    return dataUrl;
  }
}
