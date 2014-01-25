var vumigo = require("vumigo_v01");
var jed = require("jed");

if (api === undefined) {
  // testing hook (supplies api when it is not passed in by the real sandbox)
  var api = this.api = new vumigo.dummy_api.DummyApi();
}

var FreeText = vumigo.states.FreeText;
var EndState = vumigo.states.EndState;
var ChoiceState = vumigo.states.ChoiceState;
var PaginatedChoiceState = vumigo.states.PaginatedChoiceState;
var Choice = vumigo.states.Choice;
var InteractionMachine = vumigo.state_machine.InteractionMachine;
var StateCreator = vumigo.state_machine.StateCreator;
var HttpApi = vumigo.http_api.HttpApi;
var Promise = vumigo.promise.Promise;


function Application() {
    var self = this;
    StateCreator.call(self, 'start');

    self.add_state(new FreeText(
        'start',
        'save_name',
        'What is your name?'
    ));

    self.add_creator('save_name', function (state_name, im) {
        var p = im.api_request('contacts.get_or_create', {
            delivery_class: 'ussd',
            addr: im.user_addr
        });
        p.add_callback(function (result) {
            var contact = result.contact;
            return im.api_request('contacts.update', {
                key: contact.key,
                fields: {
                    name: im.get_user_answer('start')
                }
            });
        });
        p.add_callback(function (result) {
            return new EndState(
                state_name,
                'Thanks ' + im.get_user_answer('start') + '!',
                'start'
            );
        });
        return p;
    });
}

// launch app
var states = new Application();
var im = new InteractionMachine(api, states);
im.attach();
