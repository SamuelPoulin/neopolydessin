import { expect } from 'chai';
import { describe } from 'mocha';
import { testingContainer } from '../../test/test-utils';
import Types from '../types';
import { connectMS, disconnectMS } from './database.service.spec';
import MongoMemoryServer from 'mongodb-memory-server-core';
import { PictureWordService } from './picture-word.service';
import { PictureWordDrawing, PictureWordPicture } from '../../../common/communication/picture-word';
import { Difficulty } from '../../../common/communication/lobby';
import { DrawMode } from '../../../common/communication/draw-mode';
import fs from 'fs';
import path from 'path';
import { OK } from 'http-status-codes';

describe('Picture word service', () => {

    const testOutputPath = 'test/pictures'
    const testIconPath = './test/icon.png';
    let mongoMs: MongoMemoryServer;
    let service: PictureWordService;

    beforeEach(async () => {
        await testingContainer().then((instance) => {
            service = instance[0].get<PictureWordService>(Types.PictureWordService);
        });
        service.setPicturePath(testOutputPath);
        mongoMs = await connectMS();
    });

    afterEach(async () => {
        await disconnectMS(mongoMs);
    });

    after(() => {
        fs.rmdirSync(testOutputPath);
    })

    it('should instanciate correctly', () => {
        expect(service).to.be.instanceOf(PictureWordService);
    });

    it('uploadPicture should correctly store produced svg', (done: Mocha.Done) => {
        const pictureBuffer = fs.readFileSync(path.resolve(testIconPath)).toString('base64');
        const pwp: PictureWordPicture = {
            word: 'word',
            picture: pictureBuffer,
            color: 'black',
            hints: [
                'meta',
                '4 letters',
                'in a sentence'
            ],
            difficulty: Difficulty.EASY,
            drawMode: DrawMode.CONVENTIONAL
        }

        let producedSVGPath: string;
        service.uploadPicture(pwp)
            .then((result) => {
                producedSVGPath = `${testOutputPath}/${result.documents}.svg`;
                expect(fs.existsSync(producedSVGPath)).to.be.true;
                return service.getRandomWord();
            })
            .then((pw) => {
                expect(pw.word).to.equal('word');
                fs.unlink(producedSVGPath, (err) => {
                    if (err) console.error(err);
                    else done();
                });
            })
    });

    it('upload drawing should store correctly', (done: Mocha.Done) => {
        const someRandomPath = {
            id: "1",
            brushInfo: { color: "#000000", strokeWidth: 1 },
            path: [{ x: 1, y: 1 }, { x: 2, y: 2 }]
        }
        const pwd: PictureWordDrawing = {
            word: 'word',
            drawnPaths: [someRandomPath],
            hints: [
                'meta',
                '4 letters',
                'in a sentence'
            ],
            difficulty: Difficulty.EASY,
            drawMode: DrawMode.CONVENTIONAL
        }

        service.uploadDrawing(pwd)
            .then((result) => {
                expect(result.statusCode).to.be.equal(OK);
                return service.getRandomWord();
            })
            .then((pw) => {
                expect(pw.word).to.equal('word');
                done();
            })
    });

    it('get random word should return NOT_FOUND if no word is in database', (done: Mocha.Done) => {
        service.getRandomWord()
            .catch((err) => {
                expect((err.message as string).includes('404')).to.be.true;
                done();
            });
    });
});

