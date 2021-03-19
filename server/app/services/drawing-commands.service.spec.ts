import { expect } from 'chai';
import { describe, beforeEach } from 'mocha';
import { BrushInfo } from '../../../common/communication/brush-info';
import { DrawingCommandsService } from './drawing-commands.service';

describe('DrawingCommandService', () => {
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
                return drawingCommands.updatePath({ x: 2, y: 2 });
            })
            .then(() => {
                expect(drawingCommands.currentPath?.path).to.deep.equal([
                    { x: 0, y: 0 }, { x: 2, y: 2 }
                ]);
                done();
            });

    });

    it('updatePath should reject if a no path is in progress', (done: Mocha.Done) => {
        drawingCommands.updatePath({ x: 0, y: 0 })
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
                expect(drawingCommands.paths).to.be.length(1);
                done();
            });
    });

    it('erase by id should reject if path id doesn\'t exist', (done: Mocha.Done) => {
        drawingCommands.erase(0)
            .catch(() => {
                expect(drawingCommands.paths).to.be.length(0);
                expect(drawingCommands.erasedPaths).to.be.length(0);
                done();
            })
    })

    it('erase should correctly erase path with id', (done: Mocha.Done) => {
        drawingCommands.startPath({ x: 0, y: 0 }, brushInfo)
            .then(() => {
                return drawingCommands.endPath({ x: 3, y: 3 });
            })
            .then(() => {
                expect(drawingCommands.currentPath).to.be.undefined;
                expect(drawingCommands.paths).to.be.length(1);
                return drawingCommands.erase(0);
            })
            .then(() => {
                expect(drawingCommands.erasedPaths).to.be.length(1);
                expect(drawingCommands.erasedPaths[0].path).to.deep.equal([
                    { x: 0, y: 0 }, { x: 3, y: 3 }
                ])
                done();
            });
    });

    it('add path should reject if path with same id already exists', (done: Mocha.Done) => {
        drawingCommands.startPath({ x: 0, y: 0 }, brushInfo)
            .then(() => {
                return drawingCommands.endPath({ x: 3, y: 3 });
            })
            .then(() => {
                return drawingCommands.addPath(0, [{ x: 0, y: 0 }], { color: "#000000", strokeWidth: 1 });
            })
            .catch(() => {
                expect(drawingCommands.paths).to.be.length(1);
                done();
            })
    });

    it('add path should reject if trying to add a path that didn\'t exist previously', (done: Mocha.Done) => {
        drawingCommands.addPath(0, [{ x: 0, y: 0 }, { x: 3, y: 3 }], { color: "#000000", strokeWidth: 1 })
            .catch(() => {
                expect(drawingCommands.paths).to.be.length(0);
                done();
            })
    });

    it('add path should add path correctly if it\'s a valid path', (done: Mocha.Done) => {
        drawingCommands.startPath({ x: 0, y: 0 }, brushInfo)
            .then(() => {
                return drawingCommands.endPath({ x: 3, y: 3 });
            })
            .then(() => {
                return drawingCommands.erase(0);
            })
            .then(() => {
                expect(drawingCommands.paths).to.be.length(0);
                return drawingCommands.addPath(0, [{ x: 0, y: 0 }],
                    { color: "#000000", strokeWidth: 1 });
            })
            .then(() => {
                expect(drawingCommands.paths).to.be.length(1);
                expect(drawingCommands.paths[0].path).to.deep.equal([{ x: 0, y: 0 }]);
                done();
            });
    });

});