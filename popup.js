'use strict';
var SessionId;
var testButtonActive = false;
var ApiBaseUrl = 'http://localhost:3000/api/v1';
var ErrorMsg = 'invalid credential';
document.addEventListener('DOMContentLoaded', function() {
  let startTraining = document.getElementById('startTraining');
  let stopTraining = document.getElementById('stopTraining')
  let testButton = document.getElementById('test')
  let currentUser = localStorage.getItem('currentUser');

  if(currentUser){
    document.getElementById("login-content").style.display = "none";
    document.getElementById("main-content").style.display = "block";
  }else{
    document.getElementById("login-content").style.display = "block";
    document.getElementById("main-content").style.display = "none";
  }

  login.onclick = function(){
    let userName =  document.getElementById("user-name").value;
    let password = document.getElementById("pwd").value;
    if(userName.trim() == '' || password.trim() ==''){
      return false;
    }
    let user = {userName: userName, password: password}
    onLogin(user)
  }

  logout.onclick = function(){
    localStorage.clear();
    document.getElementById("login-content").style.display = "block";
    document.getElementById("main-content").style.display = "none";
  }

  test.onclick = function(elem){
     notifyBackend({key: 'setTestButtonValue'})
  }
  
  //stopTraining.setAttribute('disabled', true);
  startTraining.onclick = function(elem){
    notifyBackend({key: 'start-training'});
    //startTraining.setAttribute('disabled', true);
    //stopTraining.removeAttribute('disabled');
    // startTraining api call
    onTrainingStart();
  }

  stopTraining.onclick = function(elem){
    notifyBackend({key: 'stop-training'})
    // endTraining api call
    SessionId = localStorage.getItem('SessionId');
      let data = {
          session_id: SessionId,
          training_status: 'end'
      }
      console.log('before device ajax call');
      $.ajax({
        type: "POST",
        url: ApiBaseUrl + "/sessions",
        data: data,
        async: false,
        success: function(data) {
          console.log("end of session");
          console.log(data);
          localStorage.clear();
          SessionId = undefined;
        }
      });
  }
});

function onTrainingStart(){
  let data = {
      training_status: 'start'
  }
  $.ajax({
    type: "POST",
    url: ApiBaseUrl + "/sessions",
    data: data,
    async: false,
    success: function(response) {
      console.log("Time start");
      console.log(data);
      SessionId = response.session_id;
      localStorage.setItem('sessionId', JSON.stringify(SessionId));
    }
  });
}

function onLogin(user){
  $.ajax({
    type: "GET",
    url: ApiBaseUrl + "/sessions/login",
    data: user,
    async: false,
    success: function(data) {
      if(data.logedIn){
      localStorage.setItem('currentUser', JSON.stringify(user));
      document.getElementById("login-content").style.display = "none";
      document.getElementById("main-content").style.display = "block";
      }else{
        alert(data.message)
        $('#error').text(data.message); 
      }
    }
  });
}

function notifyBackend(data){
  chrome.runtime.sendMessage(data, function() { });
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log('request data', request)
    if( request.key == 'trainingTime') {
      updateTimerValue(request.value.timer)
    }
    if(request.key == 'setButton'){
       document.getElementById('testspan').innerText = request.value
    }
  }
);

function updateTimerValue(timer){
  console.log('timer value', timer);
  document.getElementById('trainingTime').innerText = timer.hh + ":" + timer.mm + ":" + timer.ss;
  if(timer.ss % 20 == 0){
    captureImage();
  }
}

function captureImage(){
  chrome.tabs.captureVisibleTab(null, {}, function (image) {
    console.log('capturing image');
    document.getElementById('snap').src = image;
    if (SessionId == undefined) {
      sendToServer();
    } else {
      // TO DO ME
      uploadImage({session_id: SessionId })
    }

  });
}

// api call to save image on server
function sendToServer(){
  let data = { 
    training_status: 'start'
  }
  console.log('before device ajax call');
  $.ajax({
    type: "POST",
    url: ApiBaseUrl + "/sessions",
    data: data,
    async: false,
    success: function(data){
      // call the image upload api
      console.log('device api sucess');
      console.log(data);
      // TO DO ME
      uploadImage(data.data);
    }
  });
  console.log('after device ajax call');
}

function uploadImage(data) {
  let blob_image = document.getElementById('snap').src
  SessionId = data.session_id
  localStorage.setItem('SessionId', SessionId);
  let params = { session: {
      session_id: SessionId,
      image: blob_image
    }
  }
  console.log('before image upload ajax call');
  $.ajax({
    type: "POST",
    url: ApiBaseUrl + "/sessions/upload_image",
    data: params,
    async: false,
    success: function(data){
      console.log('image upload sucess');
      console.log(data);
    }
  });
  console.log('after image upload ajax call');
}

