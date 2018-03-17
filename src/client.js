const fs = require('fs')
    , request = require('request')
    , JSDOM = require('jsdom').JSDOM
    , CookieStore = require('tough-cookie-file-store')
    , uuid = require('uuid/v4')
    , md5 = require('md5')
    , domain = 'chessmicrobase.com'
    , schema = 'https'

var headers = {
    'Host': domain,
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.162 Safari/537.36',
    'Referer': 'https://chessmicrobase.com/',
};

module.exports = {

    /**
     *
     */
    getSession: function (id) {
        var session = { id: id ? id : md5(uuid()) }
        session.file = './store/session/' + session.id + '.json'
        if (!id) { fs.writeFileSync(session.file, '') }
        session.jar = request.jar(new CookieStore(session.file))
        return session
    },

    /**
     *
     * @param callback
     */
    startSession: function (callback) {
        var session = this.getSession();
        var options = {
            url: schema+'://'+domain+'/sessions/new',
            followRedirect: true,
            followAllRedirects: true,
            headers: headers,
            jar: session.jar,
        };
        request.get(options, function (error, response, body) {
            const dom = new JSDOM(body);
            session.authenticityToken = dom.window.document.querySelector("input[name=authenticity_token]").value;
            return callback(session);
        });
    },

    /**
     *
     * @param username
     * @param password
     * @param authenticityToken
     * @param jar
     * @param callback
     */
    doLogin: function (username, password, session, callback) {
        var options = {
            url: schema+'://'+domain+'/sessions',
            headers: headers,
            followRedirect: true,
            followAllRedirects: true,
            jar: session.jar,
            form: {
                utf8: true,
                authenticity_token: session.authenticityToken,
                session: {
                    email: username,
                    password: password,
                },
                commit: 'Sign In',
            }
        };
        request.post(options, function (error, response, body) {
            const dom = new JSDOM(body);
            const userid = dom.window.document.querySelector("a[data-method=delete]").href.replace(/[^0-9]/g, '');
            return callback({
                session: session.id,
                userid: parseInt(userid),
            });
        });
    },

    /**
     *
     * @param session
     * @param callback
     */
    getDatabaseList: function(session, callback) {
        var options = {
            url: schema + '://' + domain + '/microbases',
            followRedirect: true,
            followAllRedirects: true,
            headers: headers,
            jar: session.jar,
        };
        request.get(options, function (error, response, body) {
            const dom = new JSDOM(body);
            const nodes = dom.window.document.querySelector("div.content tbody").childNodes;
            const list = [];
            for (var i in nodes) {
                if (nodes.hasOwnProperty(i)) {
                    const item = nodes[i].querySelector("a");
                    const cell = nodes[i].querySelectorAll("td");
                    list.push({
                        id: parseInt(item.href.replace(/[^0-9]/g, '')),
                        name: item.text.trim(),
                        games: parseInt(cell.item(1).innerHTML)
                    })
                }
            }
            return callback(list);
        });
    }
};
