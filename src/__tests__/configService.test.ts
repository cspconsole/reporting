import {sayHi} from "../configService";

describe('ConfigService', function () {
    describe('sayHi', function () {
        it('returns hi message for given name', function () {
            const result = sayHi('Peter');

            expect(result).toEqual('Hi Peter');
        });
    });
});
