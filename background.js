let trainingHours = 0;
let trainingMins = 0;
let trainingSecs = 0;
let trainingInProgress = false
let timerRunning = false;
let idleTime = 0;
let idleTimerRunning = false;
let buttonValue;
let timmer_flag = false;
let timer123;
let SessionId;
var ApiBaseUrl = 'http://localhost:3000/api/v1';
var idleNotify = false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(request);
  if (request.key == "start-training"){
    onTrainingStart();
    timmer_flag = true;
    if(timerRunning == false){
      resetTimer();
      timerRunning = true;
      trainingInProgress = true;
      clearInterval(timer123);
      timer123 = setInterval(function(){
        if(trainingInProgress){
          trainingSecs = trainingSecs + 1;
          if(trainingSecs >= 60){
            trainingMins = trainingMins + 1;
            trainingSecs = trainingSecs - 60;
          }
          if(trainingMins >= 60){
            trainingHours = trainingHours + 1;
            trainingMins = trainingMins - 60
          }
        }
        updateFrontEndTimer()
        notifyCurrentTab({key: 'trainingInProgress', value: {timer:{hh: trainingHours, mm: trainingMins, ss:trainingSecs}}, trainingInProgress: trainingInProgress })
      }, 1000)
    }
     notifyCurrentTab({key: 'start-training', value: {timer:{hh: trainingHours, mm: trainingMins, ss:trainingSecs}}, trainingInProgress: trainingInProgress, SessionId : request.SessionId })
    sendResponse('training started');
  } else if (request.key == "stop-training") {
    onTrainingStop();
    clearAllIntervals()
    trainingHours = 0;
    trainingMins = 0;
    trainingSecs = 0;
    timerRunning = false;
    trainingInProgress = false;
     sendResponse('training stop');
      notifyCurrentTab({key: 'stop-training', value: {timer:{hh: trainingHours, mm: trainingMins, ss:trainingSecs}}, trainingInProgress: trainingInProgress })
  }else if( request.key == 'resetTimer'){
    resetTimer();
    timmer_flag = false;
  }else if( request.key == 'imageUpload'){
    data = {
      blob : request.blob,
      session_id: SessionId,
      url : request.url,
    }
    uploadImage(data)
  }else if(request.key == 'user-login'){
    onLogin(request.user)
  }else if(request.key == 'close-idleNotify'){
    idleNotify = false;
  }
});

function updateFrontEndTimer(){
  notifyFrontEnd({key: 'trainingTime', value: {timer:{hh: trainingHours, mm: trainingMins, ss:trainingSecs}}, trainingInProgress: trainingInProgress })
}

function notifyFrontEnd(data){
  chrome.runtime.sendMessage(data)
}

function notifyCurrentTab(data){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
   chrome.tabs.sendMessage(tabs[0].id, data, function(response) {});
  });
}

function uploadImage(data) {
  let blob_image = data.blob;
  SessionId = data.session_id;
  let params = { session: {
      session_id: SessionId,
      url : data.url,
      image: blob_image,
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

function clearAllIntervals(){

}

function resetTimer() {
    console.log('timer reset called')
    idleTime = 0;
    console.log('idleTime ', idleTime)
    if(!idleTimerRunning){
      idleTimerRunning = true;
      setInterval(function(){
        console.log('starting timer...')
        idleTime = idleTime + 1
        console.log('idleTime from interval', idleTime)
        if(idleTime > 30 && trainingInProgress){
          if(!idleNotify){
            idleNotify = true;
            notifyCurrentTab({key: 'idleNotify'})
          }

        }
      }, 1000)
    }
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
      console.log("Time start");
      console.log(data);
      SessionId = response.data.session_id;
      localStorage.setItem('sessionId', JSON.stringify(SessionId));
      // notifyBackend({key: 'start-training', SessionId :SessionId});
    }
  });
}

function onTrainingStop(){
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
      localStorage.clear();
      SessionId = undefined;
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
      notifyFrontEnd({key: 'user-logedId', data :data, user: user })
      // localStorage.setItem('currentUser', JSON.stringify(user));
      // $("#error").css("display", "none");
      // $("#login-content").css("display", "none");
      // $("#main-content").css("display","block");
      // }else{
      //   // alert(data.message)
      //   $("#error").text(data.message);
      // }
    }
  });
}

