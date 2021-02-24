import { expect } from 'chai';
import { describe } from 'mocha';
import { testingContainer } from '../../test/test-utils';
import Types from '../types';
import { FriendsService } from './friends.service';

describe('Friends Service', () => {
    let friendsService: FriendsService;

    beforeEach(async () => {
        await testingContainer().then((instance) => {
            friendsService = instance[0].get<FriendsService>(Types.FriendsService);
        });
    });

    it('should instanciate correctly', (done: Mocha.Done) => {
        expect(friendsService).to.be.instanceOf(FriendsService);
        done();
    });
});
