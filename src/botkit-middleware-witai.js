var wit = require('node-wit');

module.exports = function(config) {

    if (!config || !config.token) {
        throw new Error('No wit.ai API token specified');
    }

    if (!config.minimum_confidence) {
        config.minimum_confidence = 0.5;
    }

    var middleware = {};

    middleware.receive = function(bot, message, next) {
        if (message.text) {
            wit.captureTextIntent(config.token, message.text, function(err, res) {
                if (err) {
                    next(err);
                } else {
                    // sort in descending order of confidence so the most likely match is first.
                    console.log(JSON.stringify(res));
                    message.outcomes = res.outcomes.sort(function(a,b) {
                        return b.confidence - a.confidence;
                    });
                    next();
                }
            });
        }

    };

    //What is tests?
    middleware.hears = function(tests, message) {
      var entities = message.outcomes[0].entities;
        if (entities) {
            for (var i = 0; i < entities.intent.length; i++) {
                for (var t = 0; t < tests.length; t++) {
                  console.log(i, t, entities.intent[i].value)
                    if (entities.intent[i].value == tests[t] &&
                        entities.intent[i].confidence >= config.minimum_confidence) {
                        return true;
                    }
                }
            }
        }

        return false;
    };


    return middleware;

};
