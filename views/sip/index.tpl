<html>
  <head>
    <title>SIP.js Demo Phone</title>
    <link rel="stylesheet" href="sip/index.css" />
  </head>

  <body>
    <!-- Configuration Prompt -->
    <form id="config-form" action="">

      <label>Your Name     <input type="text" name="displayName" placeholder="John Doe" value="<%- name %>"/></label>
      <label>SIP URI       <input type="text" name="uri" placeholder="john@example.com" value="<%- email %>"/></label>
      <label>Auth Username <input type="text" name="authorizationUser" placeholder="example_john" value="<%- username %>"/></label>
      <label>Password      <input type="password" name="password" value="john"/></label>
      <label>WS Server     <input type="text" name="wsServers" placeholder="wss://edge.sip.onsip.com" value="ws://localhost:3000"/></label>
      <input type="submit" name="configSubmit" value="Create UA" />
    </form>

    <!-- UA Control Form -->
    <div id="ua">
      <div id="ua-status">Disconnected</div>
      <button id="ua-register">Register</button>
      <form id="new-session-form" action="">
        <label>Enable Video <input type="checkbox" id="ua-video" checked/></label>
        <label>Enable Audio <input type="checkbox" id="ua-audio" checked/></label>
        <label>SIP URI      <input type="text" id="ua-uri" placeholder="will@example.com"/></label>
        <input type="submit" id="ua-invite-submit" value="Invite" />
        <input type="submit" id="ua-message-submit" value="Begin Chat" />
      </form>
    </div>

    <ul id="session-list"></ul>


    <!-- Templates to clone Sessions and Messages -->
    <ul id="templates">
      <li id="session-template" class="template session">
        <h2><strong class="display-name"></strong> <span class="uri"></span></h2>
        <button class="green">Green</button>
        <button class="red">Red</button>
        <form class="dtmf" action="">
          <label>DTMF <input type="text" maxlength="1" /></label>
          <input type="submit" value="Send" />
        </form>
        <video autoplay>Video Disabled or Unavailable</video>
        <ul class="messages"></ul>
        <form class="message-form" action="">
          <input type="text" placeholder="Type to send a message"/><input type="submit" value="Send" />
        </form>
      </li>
    </ul>

    <script src="sip/sip-0.7.3.js"></script>
    <script src="sip/index.js"></script>
  </body>
</html>
