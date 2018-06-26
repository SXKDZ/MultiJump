// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html"

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

import socket from "./socket"

var channel = socket.channel('room:lobby', {});

var score_respond = function (payload) {
  var li = document.createElement('li');
  var name = payload.name;
  var room = payload.room;
  var message = payload.message;
  var score = payload.score;
  li.innerHTML = '(Room ' + room + ') <b>' + name + '</b>: ' + message + ' score: ' + score;
  ul.appendChild(li);
};

var start_respond = function (payload) {
  var li = document.createElement('li');
  var name = payload.name;
  var room = payload.room;
  var seed = payload.seed;
  li.innerHTML = '(Room ' + room + ') <b>' + name + '</b>: started, random seed: ' + seed;
  ul.appendChild(li);
};

var terminate_respond = function (payload) {
  var li = document.createElement('li');
  var name = payload.name;
  var room = payload.room;
  li.innerHTML = '(Room ' + room + ') <b>' + name + '</b>: terminated';
  ul.appendChild(li);
  started = false;
};

channel.on('jump', score_respond);
channel.on('no-jump', score_respond);
channel.on('start', start_respond);
channel.on('terminate', terminate_respond);

channel.join();

var ul = document.getElementById('message-list');
var name = document.getElementById('name');
var room = document.getElementById('room');
var jump = document.getElementById('jump');
var start = document.getElementById('start');
var score = document.getElementById('score');
var no_jump = document.getElementById('no-jump');
var terminate = document.getElementById('terminate');

var started = false;

console.log(start)

start.addEventListener('click', function (event) {
  if (room.value.length > 0 && name.value.length > 0 && !started) {
    started = true;
    score.value = 0;

    channel.push('start', {
      name: name.value,
      room: room.value,
      message: 'started'
    });
  }
});

terminate.addEventListener('click', function (event) {
  if (started) {
    channel.push('terminate', {
      name: name.value,
      room: room.value,
      message: 'terminated'
    });
    started = false;
  }
});

jump.addEventListener('click', function (event) {
  if (started) {
    score.value = parseInt(score.value) + 1;
    channel.push('jump', {
      name: name.value,
      room: room.value,
      score: score.value,
      message: 'jumped'
    });
  }
});

no_jump.addEventListener('click', function (event) {
  if (started) {
    channel.push('no-jump', {
      name: name.value,
      room: room.value,
      score: score.value,
      message: 'did not jump'
    });
    started = false;
  }
});


// GAME RENDER HERE

