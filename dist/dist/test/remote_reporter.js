'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _chai = require('chai');

var _const_sampler = require('../src/samplers/const_sampler');

var _const_sampler2 = _interopRequireDefault(_const_sampler);

var _in_memory_reporter = require('../src/reporters/in_memory_reporter');

var _in_memory_reporter2 = _interopRequireDefault(_in_memory_reporter);

var _mock_logger = require('./lib/mock_logger');

var _mock_logger2 = _interopRequireDefault(_mock_logger);

var _remote_reporter = require('../src/reporters/remote_reporter');

var _remote_reporter2 = _interopRequireDefault(_remote_reporter);

var _tracer = require('../src/tracer');

var _tracer2 = _interopRequireDefault(_tracer);

var _udp_sender = require('../src/reporters/udp_sender');

var _udp_sender2 = _interopRequireDefault(_udp_sender);

var _metrics = require('../src/metrics/metrics');

var _metrics2 = _interopRequireDefault(_metrics);

var _metric_factory = require('./lib/metrics/local/metric_factory');

var _metric_factory2 = _interopRequireDefault(_metric_factory);

var _backend = require('./lib/metrics/local/backend');

var _backend2 = _interopRequireDefault(_backend);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

describe('Composite and Remote Reporter should', function () {
    var tracer = void 0;
    var reporter = void 0;
    var sender = void 0;
    var logger = void 0;
    var metrics = void 0;

    beforeEach(function () {
        try {
            metrics = new _metrics2.default(new _metric_factory2.default());
            sender = new _udp_sender2.default();
            logger = new _mock_logger2.default();
            reporter = new _remote_reporter2.default(sender, {
                logger: logger,
                metrics: metrics
            });
            tracer = new _tracer2.default('test-service-name', reporter, new _const_sampler2.default(true));
        } catch (e) {
            // this is useful to catch errors when thrift definition is changed
            console.log('beforeEach failed', e);
            console.log(e.stack);
        }
    });

    afterEach(function () {
        logger.clear();
        var callback = function callback() {}; // added for coverage reasons
        reporter.close(callback);
    });

    it('report span, and flush', function () {
        var span = tracer.startSpan('operation-name');

        // add duration to span, and report it
        span.finish();
        _chai.assert.equal(sender._batch.spans.length, 1);

        reporter.flush();
        _chai.assert.equal(sender._batch.spans.length, 0);
        _chai.assert.isOk(_backend2.default.counterEquals(metrics.reporterSuccess, 1));
    });

    it('report and flush span that is causes an error to be logged', function () {
        // make it so that all spans will be too large to be appended
        sender._maxSpanBytes = 1;

        var span = tracer.startSpan('operation-name');

        span.finish();
        _chai.assert.equal(logger._errorMsgs[0], 'Failed to append spans in reporter.');

        // metrics
        _chai.assert.isOk(_backend2.default.counterEquals(metrics.reporterDropped, 1));
    });

    it('should have coverage for simple code paths', function () {
        var sender = new _udp_sender2.default();
        sender.setProcess({
            serviceName: 'service-name',
            tags: []
        });
        var reporter = new _remote_reporter2.default(sender);

        _chai.assert.equal(reporter.name(), 'RemoteReporter');

        reporter.close();
    });

    it('should throw exception when initialized without a sender', function () {
        (0, _chai.expect)(function () {
            new _remote_reporter2.default();
        }).to.throw('RemoteReporter must be given a Sender.');
    });

    it('failed to flush spans with reporter', function () {
        var mockSender = {
            flush: function flush() {
                return {
                    err: true,
                    numSpans: 1
                };
            },
            close: function close() {}
        };

        reporter._sender = mockSender;
        reporter.flush();

        _chai.assert.equal(logger._errorMsgs[0], 'Failed to flush spans in reporter.');
        _chai.assert.isOk(_backend2.default.counterEquals(metrics.reporterFailure, 1));
    });
}); // Copyright (c) 2016 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//# sourceMappingURL=remote_reporter.js.map
//# sourceMappingURL=remote_reporter.js.map