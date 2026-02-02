/**
 * PubSubClient - client (browser) functions for connecting to a local Rebar/Kilroy pubsub server and exchanging messages
 */

export class PubSubClient {

    constructor (baseUrl, realm) {
        this.baseUrl = baseUrl;
        this.realm = realm;
        this.session = null;
        this.normalizedChannelName = null;
        this.channelName = null;
        this.subscription = null;
        this.PUBSUB_URL = "/ws";
    };


//    #debug (s) { console.log(s)};

    MakeConnection () {
//        this.#debug (`[MakeConnection (faye)] start ${this.PUBSUB_URL} (${this.baseUrl})`);

//        this.#debug (`connecting to faye server`);
        var conn = new Faye.Client (this.PUBSUB_URL);

//        this.#debug("[MakeConnection (faye)] Connected: ");

        conn.on ('transport:down',  function() {
//            this.#debug("[MakeConnection (faye)] Connection lost: ");
        });

        this.session = conn;
        return conn;
    }

    Close (conn) {
//        this.#debug ("[Close (faye)] start");
    }

//----------------------------------------------------------------

    #_normalizeChannelName (channel) {
        let tchannel = (channel.charAt(0) =='/' ? "" : "/") + channel; // faye channels apparently need to look like a file path and start with /    
        //and now convert weird chars into ok chars
        // . to _
        tchannel = tchannel.replace (/\./g, "_");
        // - to _
        tchannel = tchannel.replace (/\-/g, "_");
        // : to _
        tchannel = tchannel.replace (":", "_");
//        this.#debug (`[_normalizeChannelName] ${channel} -> ${tchannel}`);
        return tchannel;
    }
        
    #_callbackClosure (callback, that) {
        return function (msg) {
            let cmd = msg._cmd;
//            that.#debug (`Faye processing ${cmd}\n${JSON.stringify(msg)}`);
            callback ([cmd], msg);
        }
    }

    Subscribe (channelName, channelCallback) {
//        this.#debug ("[Subscribe (faye)] start");
        var tchannelName = this.#_normalizeChannelName (channelName);
        this.normalizedChannelName = tchannelName;
        this.channelName = channelName;

        if (!this.session) {
//            this.#debug ("null session");
            return null;
        }
    
        if (!channelName || !channelCallback){
            return null;
        }
    
        let subs = this.session.subscribe (tchannelName, this.#_callbackClosure (channelCallback, this));
//        this.#debug('subscribed to:' + channelName + ` (${tchannelName})`);
        this.subscription = subs;
        return subs;
    }

    Unsubscribe (channelName) {
//        this.#debug ("[Unsubscribe (faye)] start");
    
        if (!this.session || !this.channelName) {
            return;
        }
    
        this.subscription.cancel();
//        this.#debug ("deregistered from " + channelName);
        return;
    }
        
}