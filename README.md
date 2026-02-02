# app.kilroy.ui_agent_template

This is a template for creating Kilroy chat agents with custom HTML user interfaces. The process_diagrams folder
contains the Kilroy app UI definitions for the chat_agent app. The workflows folder contains implementations of
functions used by the app UI.

The chat_agent app displays the custom user interface HTML in an iframe. The user interacts directly with this custom
user interface contained within the Kilroy app's display.

The public folder is a top level document tree for content to be served to the user's browser via HTTP. It contains the
custom user interface front end that communicates to Kilroy with REST calls to Kilroy webhooks implemented in the
process diagrams. 

The web app receives messages from the Kilroy server using the PubSubClient.js library.

In this template, the UI is loaded from index.html and its Javascript functionality is contained in chat_agent.js.

When refactoring this template for a new Kilroy app, the "kilroy.ui_agent_template" identifier should be replaced in all instances.
The "chat_agent" filename root should be modified to reflect the new app name for source files in the file system.
The manifest.json file needs to be updated to reflect the new names.

## Client/Server Communications

The client sends REST API requests to webhooks implemented in the chat_agent process diagram. These webhook handlers may change,
or be added to as the needs of the client UI change. All HTTP requests are made using a base URL that looks like:
const BASE_API_URL = `/api/v1/pd/webhook/API_TOKEN/${alias}/`;

"alias" should be passed to the HTML UI via a search argument sent to index.html

The server pushes messages to the client UI via the faye.js library, using the messaging functions defined in PubSubClient.js.