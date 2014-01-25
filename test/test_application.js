var describe = global.describe,
  it = global.it,
  beforeEach = global.beforeEach;

var fs = require("fs");
var assert = require("assert");
var app = require("../lib/application");
var vumigo = require("vumigo_v01");

describe('Application', function () {

  var tester;
  var fixtures = [];

  describe('when using the app', function() {

    beforeEach(function () {
      tester = new vumigo.test_utils.ImTester(app.api, {
        custom_setup: function (api) {
          api.config_store.config = JSON.stringify({
              /*
              config: ["values", "here"]
              */
          });

          fixtures.forEach(function (f) {
            api.load_http_fixture(f);
          });
        },
        async: true
      });
    });

    it('should ask for your name', function (done) {
      tester.check_state({
        user: null,
        content: null,
        next_state: 'start',
        response: /What is your name?/
      }).then(done, done);
    });

    it('should save the name', function (done) {
      tester.check_state({
        user: {
          current_state: 'start'
        },
        content: 'Simon',
        next_state: 'save_name',
        response: /Thanks Simon!/,
        continue_session: false
      }).then(function() {
        var contact = app.api.find_contact('ussd', '1234567');
        assert.equal(contact.name, 'Simon');
      }).then(done, done);
    });
  });
});