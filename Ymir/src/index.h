/*
 * This ESP32 code is created by esp32io.com
 *
 * This ESP32 code is released in the public domain
 *
 * For more detail (instruction and wiring diagram), visit https://esp32io.com/tutorials/esp32-websocket
 */

const char *HTML_CONTENT = R"=====(
<!DOCTYPE html>
<!-- saved from url=(0019)http://192.168.0.2/ -->
<html><head><meta http-equiv="Content-Type" content="text/html; charset=windows-1252">
<title>ESP32 WebSocket</title>
<meta name="viewport" content="width=device-width, initial-scale=0.7">
<link rel="icon" href="https://diyables.io/images/page/diyables.svg">
<style>
/* Add some basic styling for the chat window */
body {
  font-size: 16px;
}
.chat-container {
  width: 400px;
  margin: 0 auto;
  padding: 10px;
}
.chat-messages {
  height: 250px;
  overflow-y: auto;
  border: 1px solid #444;
  padding: 5px;
  margin-bottom: 5px;
}
.user-input {
  display: flex;
  margin-bottom: 20px;
}
.user-input input {
  flex: 1;
  border: 1px solid #444;
  padding: 5px;
}
.user-input button {
  margin-left: 5px;
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}
.websocket {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}
.websocket button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}
.websocket .label {
  margin-left: auto;
}
  
</style>
<script>
var ws;
var wsm_max_len = 4096; /* bigger length causes uart0 buffer overflow with low speed smart device */

function update_text(text) {
  var chat_messages = document.getElementById("chat-messages");
  chat_messages.innerHTML += text + '<br>';
  chat_messages.scrollTop = chat_messages.scrollHeight;
}

function send_onclick() {
  if(ws != null) {
    var message = document.getElementById("message").value;
    
    if (message) {
      document.getElementById("message").value = "";
      ws.send(message + "\n");
      update_text('<span style="color:navy">' + message + '</span>');
      // You can send the message to the server or process it as needed
    }
  }
}

function connect_onclick() {
  if(ws == null) {
    ws = new WebSocket("ws://" + window.location.host + ":81");
    document.getElementById("ws_state").innerHTML = "CONNECTING";
    ws.onopen = ws_onopen;
    ws.onclose = ws_onclose;
    ws.onmessage = ws_onmessage;
  } else
    ws.close();
}

function ws_onopen() {
  document.getElementById("ws_state").innerHTML = "<span style='color:blue'>CONNECTED</span>";
  document.getElementById("bt_connect").innerHTML = "Disconnect";
  document.getElementById("chat-messages").innerHTML = "";
}

function ws_onclose() {
  document.getElementById("ws_state").innerHTML = "<span style='color:gray'>CLOSED</span>";
  document.getElementById("bt_connect").innerHTML = "Connect";
  ws.onopen = null;
  ws.onclose = null;
  ws.onmessage = null;
  ws = null;
}

function ws_onmessage(e_msg) {
  e_msg = e_msg || window.event; // MessageEvent
  console.log(e_msg.data);
  update_text('<span style="color:blue">' + e_msg.data + '</span>');
}
</script>
</head>
<body>
  <div class="chat-container">
    <h2>ESP32 WebSocket</h2>
    <div class="websocket">
      <button class="connect-button" id="bt_connect" onclick="connect_onclick()">Connect</button>
      <span class="label">WebSocket: <span id="ws_state"><span style="color:blue">CLOSED</span></span></span>
    </div>
    <div class="chat-messages" id="chat-messages"></div>
    <div class="user-input">
      <input type="text" id="message" placeholder="Type your message...">
      <button onclick="send_onclick()">Send</button>
    </div>
  
  <div class="sponsor">Sponsored by <a href="https://amazon.com/diyables">DIYables</a></div>
</div>

</body></html>
)=====";
