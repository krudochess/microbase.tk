
const app = require('../src')
    , request = require('request')
    , chai = require('chai')

require('dotenv').config({ path: process.cwd() + '/.env' });

describe('Microbase.tk Login', function () {

    var server = null;

    before(function () {
        server = app.listen(3000);
    });

    it('Correct Login', function (done) {
        this.timeout(15000);
        request.post(
            'http://localhost:3000/api/v1/auth/login', {
                json: true,
                form: {
                    username: process.env.MICROBASE_TEST_USERNAME,
                    password: process.env.MICROBASE_TEST_PASSWORD,
                }
            }, function (err, res, obj) {
                chai.assert.isAbove(obj.userid, 0);
                chai.assert.lengthOf(obj.session, 32);
                done();
            }
        );
    });

    after(function () {
        server.close();
    });

});