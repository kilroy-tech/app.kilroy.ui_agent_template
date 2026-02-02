const sparams = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });

let alias = sparams.alias || "kilroy.ui_agent_template.chat";
let room_id = sparams.room_id || "kilroyaichat";
let uname = sparams.bot_name || "anonymous";
let use_markdown = sparams.markdown === "true";
let dark_mode = sparams.darkmode === "true";
let page_mode = sparams.page_mode || "chat"; //chat or page

const markdown = new markdownit ({
                    html: true,
                    linkify: true,
                    typographer: true,
                    langPrefix:   'hljs language-',
                    highlight: function (str, lang) {
                        if (lang && hljs.getLanguage(lang)) {
                            try {
                                return hljs.highlight(str, { language: lang }).value;
                            } catch (__) { return ''; }
                        }
                        return ''; // use external default escaping
                    }
                });

const CHAT_API_URL = `/api/v1/pd/webhook/API_TOKEN/${alias}/swarm_send_hook`;

console.log (`${alias} ${room_id} ${CHAT_API_URL}`);
console.log (`@@@ uname: ${uname}`);

//--- console stuff
function debug (s) { console.log(`${alias}: ${s}`)};

function logmsg (msg) {
    var cons = $("#console");
    cons.append (msg);
    cons.scrollTop (cons.prop('scrollHeight'));
    return false;
}

function ClearLog (s) {
    if (use_markdown) {
        s = markdown.render (s || "");
    }
    $("#console").html (s);
    return false;
}

function ResizeConsole () {
			//var w = $(window).width();
    var h = document.documentElement.clientHeight; //$(window).height();
			//var dw = $("#console").width();
			//var dh = $("#console").height();
    var p = $("#console").position();
    var newh = h - (p.top + 125);
			//console.log ("win info: w=" + w + " h=" + h + " dw=" + dw + " dh=" + dh + " p=" + JSON.stringify(p) + " newh=" + newh);
    $("#console").height (newh);
}
            
window.onresize = function () {
    ResizeConsole ();
}

//------- PubSub stuff -----
import { PubSubClient } from "./PubSubClient.js"; //local copy of /apps/rebar.system/js/PubSubClient.js

function _PostMessage (cmd, msg) {
    let color = "text-warning";
    if (cmd === "SHOW_SELF_MESSAGE") {
        color = "text-primary";
    }

    let theMsg = msg.message;
    let md_styles = "padding-bottom:8px;";
    let md_class = "kilroy-message";

    if (use_markdown) {
        theMsg = markdown.render (theMsg || "");
        md_styles = "";
        md_class = "kilroy-markdown";
    }
    if (page_mode === "page") {
        msg = `<div class="${md_class}" style="${md_styles}">${theMsg}</div>`;
        ClearLog ("");
    } else { //chat by default
        msg = `<div class="row"><div class="col"><span class="${color} fw-bold">${msg.username}:</span></div><div class="col text-end small text-muted">${moment().format("LTS")}</div></div><div class="${md_class}" style="${md_styles}">${theMsg}</div>`;
    }
    //console.log (msg);
    logmsg (msg);
}

function _process_msgs_live (args, kargs) {
    var cmd = args[0];
    console.log(`command is ${cmd} (${alias})`);
    console.log (`kargs: ${JSON.stringify (kargs)}`);
    let smsg = {"username": "*unknown*", "message": ""};
    let msg = null;

    //process any special messages and bail. let normal messages fall through
    switch (cmd) {
        case "UPDATE_PUBSUB_AREA":
            let s = kargs.html || "";
            ClearLog(s);
            return;
    }

    try {
        msg = JSON.parse (kargs.data);
    }
    catch (err) {
        msg=kargs.data;
    }
    if (msg && msg.username) {
        smsg.username = msg.username;
    }
    if (msg && msg.message) {
        smsg.message = msg.message;
    }
    _PostMessage (cmd, smsg);

};

let ps = null;

function _setupConnection(realm) {
    let theUrl = window.location.href; //we need to make this info available for pubsub internal servers accessed from remote clients
    let tc = new PubSubClient (theUrl, realm);
    tc.MakeConnection ();
    return tc;
}

function InitPubSub () {
    ps = _setupConnection("realm1");
    ps.Subscribe (alias, _process_msgs_live);
}

function SendMessage () {
    let un = $("#username");
    let msg = $("#msg");
    let s =  msg.val().replace (/\n$/, "");
    SendOneMessage (un.val(), s);
    msg.val("");
    msgCt.val++;
}

function SendOneMessage (un, msg) {
    //if there is a trailing newline, remove it before sending

    let payload = {"username": un, "message": msg};

    $.ajax({
        url: CHAT_API_URL,
        method: 'POST',
        headers: {
            'X-CONCLUENT-TOKEN': window.CURR_AUTH_TOKEN
        },
        data: JSON.stringify(payload),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
    })
    .done(function(data) {
        if (!data || !data.success){
            // TODO: Alert to Error
            return;
        }
    })
    .fail(function(err) {
        debug( "error in SendMessage " + err );
    });


    return false; //prevent form submit if we are called directly
}

//----------------------------------------------
// HTML content generated by Van,  https://vanjs.org/convert

import van from "./van-0.11.10.min.js";
const {div, form, h1, h3, input, textarea} = van.tags;
const msgCt = van.state (0);

const Chat = () => {
    return div ({class:"console-wrapper"},
        div({class: "row filled mx-3"},
            div({class: "col-md-12 overflow-auto", id: "console"}
            ),
        ),
        form(
            div({class: "row filled m-3"},
                div({class: "col-sm-3"},
                    input({class: "form-control", id: "username", placeholder: "your name", type: "text"}
                    ),
                ),
                div({class: "col-sm-9"},
                    textarea({class: "form-control", id: "msg", placeholder: "message to send"}
                    ),
                ),
            ),
        ) //,
        //div ({class: "row filled m-3"}, "Sent: ", msgCt)
    );
}

//function _InitPage () {
    debug ("adding content to body");
    van.add(document.body, Chat());
//}

//----------------------------------------------

function _SetDarkMode (mode) {
    let html = document.documentElement;
    let body = $("body");
    let r = document.querySelector(':root');
    let bgColor = getComputedStyle (r).getPropertyValue ('--inset-bg-color').trim();
    let linkColor = getComputedStyle (r).getPropertyValue ('--md-link-color').trim();
    dark_mode = mode;

    if (dark_mode) {
        //remove/add classes for dark mode
        html.setAttribute ("data-bs-theme", "dark");
        body.removeClass ("bg-light");
        body.removeClass ("text-dark");
        body.addClass ("bg-dark");
        body.addClass ("text-light");
        bgColor = getComputedStyle (r).getPropertyValue ('--inset-bg-dark-color').trim();
        linkColor = getComputedStyle (r).getPropertyValue ('--md-link-dark-color').trim();
    }
    else {
        //remove/add classes for light mode
        html.setAttribute ("data-bs-theme", "light");
        body.removeClass ("bg-dark");
        body.removeClass ("text-light");
        body.addClass ("bg-light");
        body.addClass ("text-dark");
        bgColor = getComputedStyle (r).getPropertyValue ('--inset-bg-light-color').trim();
        linkColor = getComputedStyle (r).getPropertyValue ('--md-link-light-color').trim();
    }
    r.style.setProperty ("--inset-bg-color", bgColor);
    r.style.setProperty ("--md-link-color", linkColor);
}

$(function () {
    debug ("DOM Ready... starting Pubsub...");
//    _InitPage ();
    window.SendOneMessage = SendOneMessage; //make it globally available
    _SetDarkMode (dark_mode);
    ResizeConsole ();
    InitPubSub ();
    let un = $("#username");
    un.val (uname);
    let msg = $("#msg");
    msg.focus();
    $("#msg").on('keyup', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            SendMessage ();
        }
    });
})

// curl -XPOST -i -H "Content-type: application/json" -d '{"username":"TestMonkey", "message":"I see you!"}' 'http://localhost:3000/api/v1/pd/webhook/API_TOKEN/test.widgets/swarm_send_hook'