'use strict';
var SessionId;
var testButtonActive = false;
var ApiBaseUrl = 'http://localhost:3000/api/v1';
var ErrorMsg = 'invalid credential';
document.addEventListener('DOMContentLoaded', function() {
  let startTraining = document.getElementById('startTraining');
  let stopTraining = document.getElementById('stopTraining')
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
      $("#error").text("Username & password can't be blank");
      return false;
    }
    let user = {userName: userName, password: password}
    onLogin(user)
  }

  logout.onclick = function(){
    SessionId = localStorage.getItem('sessionId');
    if(SessionId) 
      notifyBackend({key: 'stop-training'})
    // endTraining api call

    localStorage.clear();
    document.getElementById("login-content").style.display = "block";
    document.getElementById("main-content").style.display = "none";
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
    SessionId = localStorage.getItem('sessionId');
      let data = {
          session_id: SessionId,
          training_status: 'end'
      }
      console.log('before device ajax call');
      $.ajax({
        type: "POST",
        url: ApiBaseUrl + "/training_sessions",
        data: data,
        async: false,
        success: function(data) {
          console.log("end of session");
          console.log(data);
          // localStorage.clear();
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
    url: ApiBaseUrl + "/training_sessions",
    data: data,
    async: false,
    success: function(response) {
      debugger
      console.log("Time start");
      console.log(data);
      SessionId = response.data.session_id;
      debugger
      localStorage.setItem('sessionId', JSON.stringify(SessionId));
    }
  });
}

function onLogin(user){
  $.ajax({
    type: "GET",
    url: ApiBaseUrl + "/training_sessions/login",
    data: user,
    async: false,
    success: function(data) {
      if(data.logedIn){
      localStorage.setItem('currentUser', JSON.stringify(user));
      $("#error").css("display", "none");
      $("#login-content").css("display", "none");
      $("#main-content").css("display","block");
      }else{
        // alert(data.message)
        $("#error").text(data.message);
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
    if( request.key == 'trainingTime' && request.trainingInProgress) {
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
  if(timer.ss % 10 == 0){
    captureImage();
  }
}

function captureImage(){
  SessionId = localStorage.getItem('sessionId');
  chrome.tabs.captureVisibleTab(null, {}, function (image) {
    console.log('capturing image');
    document.getElementById('snap').src = image;
    $('#snap').css({'height':'100', 'width':'200'})
      uploadImage({session_id: SessionId })
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
    url: ApiBaseUrl + "/training_sessions",
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
    url: ApiBaseUrl + "/training_sessions/upload_image",
    data: params,
    async: false,
    success: function(data){
      console.log('image upload sucess');
      console.log(data);
    }
  });
  console.log('after image upload ajax call');
}

