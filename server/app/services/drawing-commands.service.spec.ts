import { expect } from 'chai';
import { describe, beforeEach } from 'mocha';
import { BrushInfo } from '../../../common/communication/brush-info';
import { EraseCommand } from '../../models/commands/erase-command';
import { DrawingCommandsService } from './drawing-commands.service';

describe.only('DrawingCommandService', () => {
    let drawingCommands: DrawingCommandsService;

    const brushInfo: BrushInfo = { color: '#ffffff', strokeWidth: 1 }

    beforeEach(async () => {
        drawingCommands = new DrawingCommandsService();
    });


    it('should instantiate correctly', () => {
        expect(drawingCommands).to.be.instanceof(DrawingCommandsService);
    });

    it('startPath should create new path if there is none', (done: Mocha.Done) => {
        expect(drawingCommands.currentPath).to.be.undefined;
        drawingCommands.startPath({ x: 0, y: 0 }, brushInfo).then(() => {
            expect(drawingCommands.currentPath).to.not.be.undefined;
            expect(drawingCommands.currentPath?.path).to.deep.equal([{ x: 0, y: 0 }]);
            expect(drawingCommands.currentPath?.brushInfo).to.deep.equal(brushInfo);
            done();
        });
    });

    it('startPath should reject if a path is already in progress', (done: Mocha.Done) => {
        expect(drawingCommands.currentPath).to.be.undefined;
        drawingCommands.startPath({ x: 0, y: 0 }, brushInfo)
            .then(() => {
                return drawingCommands.startPath({ x: 0, y: 0 }, brushInfo);
            })
            .catch(() => {
                done();
            })
    });

    it('updatePath should add points to current path', (done: Mocha.Done) => {
        drawingCommands.startPath({ x: 0, y: 0 }, brushInfo)
            .then(() => {
                return drawingCommands.updatePath([{ x: 0, y: 0 }, { x: 2, y: 2 }]);
            })
            .then(() => {
                expect(drawingCommands.currentPath?.path).to.deep.equal([
                    { x: 0, y: 0 }, { x: 2, y: 2 }
                ]);
                done();
            });

    });

    it('updatePath should reject if a no path is in progress', (done: Mocha.Done) => {
        drawingCommands.updatePath([{ x: 0, y: 0 }, { x: 2, y: 2 }])
            .catch(() => {
                done()
            })
    });

    it('endPath should end a path in progress', (done: Mocha.Done) => {
        drawingCommands.startPath({ x: 0, y: 0 }, brushInfo)
            .then(() => {
                return drawingCommands.endPath({ x: 3, y: 3 });
            })
            .then(() => {
                expect(drawingCommands.currentPath).to.be.undefined;
                expect(drawingCommands.doneCommands).to.be.length(1);
                done();
            });
    });

    it('startErase should start correctly if nothing is in progress', (done: Mocha.Done) => {
        expect(drawingCommands.currentPath).to.be.undefined;
        drawingCommands.startErase({ x: 0, y: 0 })
            .then(() => {
                expect(drawingCommands.currentPath?.path).to.deep.equal([{ x: 0, y: 0 }]);
                done();
            })
    })

    it('startErase should reject if something is in progress', (done: Mocha.Done) => {
        drawingCommands.startPath({ x: 0, y: 0 }, brushInfo)
            .then(() => {
                return drawingCommands.startErase({ x: 0, y: 0 });
            })
            .catch(() => {
                done();
            })
    })

    it('updateErase should update correctly if a path is in progress', (done: Mocha.Done) => {
        drawingCommands.startErase({ x: 0, y: 0 })
            .then(() => {
                return drawingCommands.updateErase([{ x: 0, y: 0 }, { x: 3, y: 3 }]);
            })
            .then(() => {
                expect(drawingCommands.currentPath?.path).to.deep.equal([
                    { x: 0, y: 0 }, { x: 3, y: 3 }
                ]);
                return drawingCommands.endErase({ x: 2, y: 2 });
            })
            .then(() => {
                expect(drawingCommands.currentPath).to.be.undefined;
                expect(drawingCommands.doneCommands).to.be.length(1);
                expect((drawingCommands.doneCommands[0] as EraseCommand).eraserPath?.path)
                    .to.deep.equal([
                        { x: 0, y: 0 }, { x: 3, y: 3 }, { x: 2, y: 2 }
                    ])
                done();
            });
    })

    it('updateErase should reject if nothing is in progress', (done: Mocha.Done) => {
        drawingCommands.updateErase([{ x: 0, y: 0 }])
            .catch(() => {
                done();
            })
    })

    it('endErase should reject if nothing is in progress', (done: Mocha.Done) => {
        drawingCommands.endErase({ x: 0, y: 0 })
            .catch(() => {
                done();
            })
    })

    it('undo and redo should undo and redo command correctly', (done: Mocha.Done) => {
        drawingCommands.startPath({ x: 0, y: 0 }, brushInfo)
            .then(() => {
                return drawingCommands.endPath({ x: 1, y: 1 });
            })
            .then(() => {
                expect(drawingCommands.currentPath).to.be.undefined;
                expect(drawingCommands.doneCommands).to.be.length(1);
                return drawingCommands.undo();
            })
            .then(() => {
                expect(drawingCommands.undoneCommands).to.be.length(1);
                expect(drawingCommands.doneCommands).to.be.length(0);
                return drawingCommands.redo();
            })
            .then(() => {
                expect(drawingCommands.undoneCommands).to.be.length(0);
                expect(drawingCommands.doneCommands).to.be.length(1);
                done();
            })
    });

    it('undo should reject if there is nothing to undo', (done: Mocha.Done) => {
        drawingCommands.undo()
            .catch(() => {
                done();
            });
    });

    it('redo should reject if there is nothing to redo', (done: Mocha.Done) => {
        drawingCommands.redo()
            .catch(() => {
                done();
            });

    });
});