/*global describe:false, it:false */
'use strict';


var lusca = require('../index'),
    request = require('supertest'),
    assert = require('assert'),
    mock = require('./mocks/app');


describe('XFRAME', function () {

    it('method', function () {
        assert(typeof lusca.xframe === 'function');
    });


    it('header (deny)', function (done) {
        var config = { xframe: 'DENY' },
            app = mock(config);

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/')
            .expect('X-FRAME-OPTIONS', config.xframe)
            .expect(200, done);
    });


    it('header (sameorigin)', function (done) {
        var config = { xframe: 'SAMEORIGIN' },
            app = mock(config);

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/')
            .expect('X-FRAME-OPTIONS', config.xframe)
            .expect(200, done);
    });

    it('header (sameorigin) on allowlist', function (done) {
        var config = {
            xframe: {
                value: 'SAMEORIGIN',
                allowlist: ['/']
            }
        },
        app = mock(config);

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/')
            .expect('X-FRAME-OPTIONS', config.xframe.value)
            .expect(200, done);
    });

    it('header (sameorigin) not on allowlist', function (done) {
        var config = {
            xframe: {
                value: 'SAMEORIGIN',
                allowlist: ['/allow']
            }
        },
        app = mock(config);

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        app.get('/allow', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/allow')
            .expect(200)
            .expect('X-FRAME-OPTIONS', config.xframe.value);

        request(app)
            .get('/')
            .expect(200)
            .end(function (err, res) {
                assert.strictEqual(res.header['x-frame-options'], undefined);
                done();
            });
    });

    it('header (sameorigin) on blocklist', function (done) {
        var config = {
            xframe: {
                value: 'SAMEORIGIN',
                blocklist: ['/', '/block']
            }
        },
        app = mock(config);

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        app.get('/block', function (req, res) {
            res.status(200).end();
        });

        app.get('/allow', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/block')
            .expect(200)
            .end(function (err, res) {
                assert.strictEqual(res.header['x-frame-options'], undefined);
            });

        request(app)
            .get('/allow')
            .expect(200)
            .expect('X-FRAME-OPTIONS', config.xframe.value);

        request(app)
            .get('/')
            .expect(200)
            .end(function (err, res) {
                assert.strictEqual(res.header['x-frame-options'], undefined);
                done();
            });
    });

    it('header (sameorigin) not on string blocklist', function (done) {
        var config = {
            xframe: {
                value: 'SAMEORIGIN',
                blocklist: '/block'
            }
        },
        app = mock(config);

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/')
            .expect('X-FRAME-OPTIONS', 'SAMEORIGIN')
            .expect(200);

        request(app)
            .get('/block')
            .end(function (err, res) {
                assert.strictEqual(res.header['x-frame-options'], undefined);
                done();
            });
    });

    it('header function', function (done) {
        var configTrue = {
            xframe: {
                xframeFunction: function (req) {
                    return 'SAMEORIGIN';
                }
            }
        },
        configFalse = {
            xframe: {
                xframeFunction: function (req) {
                    return false;
                }
            }
        },

        app = mock(configTrue),
        app2 = mock(configFalse);

        app.get('/', function (req, res) {
            res.status(200).end();
        });

        app2.get('/', function (req, res) {
            res.status(200).end();
        });

        request(app)
            .get('/')
            .expect('X-FRAME-OPTIONS', 'SAMEORIGIN')
            .expect(200);

        request(app2)
            .get('/')
            .end(function (err, res) {
                assert.strictEqual(res.header['x-frame-options'], undefined);
                done();
            });
    });

});
