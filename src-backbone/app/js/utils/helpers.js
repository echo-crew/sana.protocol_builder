var Config = require('utils/config');

module.exports = {

    goto_default_logged_in: function() {
        Backbone.history.navigate('procedures', { trigger: true });
    },

    goto_default_logged_out: function() {
        Backbone.history.navigate('login', { trigger: true });
    },

    current_page_require_authentication: function() {
        var nonauth_pages = Config.NON_AUTH_PAGES;

        for (var i = nonauth_pages.length - 1; i >= 0; i--) {
            if (Backbone.history.fragment.substr(0, nonauth_pages[i].length) === nonauth_pages[i]) {
                return false;
            }
        }

        return true;
    },

};
