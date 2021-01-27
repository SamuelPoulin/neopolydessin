/* tslint:disable:no-string-literal */
import { TestBed } from '@angular/core/testing';
import { MouseHandler } from 'src/app/services/event-listeners/mouse-listener/mouse-handler';
import { MouseListenerService } from 'src/app/services/event-listeners/mouse-listener/mouse-listener.service';
import createSpy = jasmine.createSpy;

describe('MouseListenerService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [MouseListenerService],
    }),
  );

  it('should be created', () => {
    const service: MouseListenerService = TestBed.get(MouseListenerService);
    expect(service).toBeTruthy();
  });

  it('can create default mouse listener', () => {
    const handleClick: (e: MouseEvent) => boolean = createSpy();
    const handler = {
      handleClick,
    } as MouseHandler;
    const mouseListener = MouseListenerService.defaultMouseListener(handler);

    mouseListener.handle({ type: 'click' } as MouseEvent);
    expect(handleClick).toHaveBeenCalled();
  });
});
