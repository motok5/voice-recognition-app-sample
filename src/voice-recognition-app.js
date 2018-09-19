var net = require('net');

window.addEventListener('DOMContentLoaded', onLoad);

let juliusServerProc = null;
let juliusClient = null;
let juliusResultBuffer = "";

function onLoad() {
  document.querySelector('#start-btn').addEventListener('click', (event) => {
    event.target.disabled = true;
    document.getElementById('end-btn').disabled = false;
    document.getElementById('status').innerText = "スタンバイ";
    startRecognition();
  });
  document.querySelector('#end-btn').addEventListener('click', (event) => {
    event.target.disabled = true;
    document.getElementById('start-btn').disabled = false;
    document.getElementById('status').innerText = "停止中";
    endRecognition();
  });
};

function startRecognition() {
  if (juliusServerProc) {
   return;
  }

  var spawn = require('child_process').spawn;
  juliusServerProc = spawn('./julius-server.sh', {detached: true});

  setTimeout(function() {
    juliusClient = net.createConnection(10500, 'localhost', function() {
      console.log('connected.');
    });
    setTimeout(function() {
      document.getElementById('status').innerText = "起動中";
    }, 7000)
    
    juliusClient.on('data', function(data) {
      juliusResultBuffer = juliusResultBuffer + data.toString();
      if (/[\s\S]\.[\s\S]$/.test(data.toString())) {
        if (/^<RECOGOUT>/.test(juliusResultBuffer)) {
          let regexp = /WHYPO WORD="([^"]*)\"/g
          let match;
          let recogwords = [];
          while ((match = regexp.exec(juliusResultBuffer))!== null) {
            recogwords.push(match[1]);
          }
          addComment(recogwords.join(""))
        }
        juliusResultBuffer = "";
      }
    });
    
    juliusClient.on('end', function() {
      console.log('disconnected.');
    });
  }, 3000);
}

function endRecognition() {
  console.log('julius server is killed.');
  process.kill(-juliusServerProc.pid);
  juliusServerProc = null;
}

function addComment(comment) {
  var ul = document.getElementById("comment-list");
  var li = document.createElement("li");
  li.appendChild(document.createTextNode(comment));
  ul.appendChild(li);
}
