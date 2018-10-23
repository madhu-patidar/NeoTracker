let trainingHours = 0;
let trainingMins = 0;
let trainingSecs = 0;
let trainingInProgress = false
let timerRunning = false;
let idleTime = 0;
let idleTimerRunning = false;
let buttonValue;
let timmer_flag = false;
let timer123

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(request);
  if (request.key == "start-training"){
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
      }, 1000)
    }
     notifyCurrentTab({key: 'start-training', value: {timer:{hh: trainingHours, mm: trainingMins, ss:trainingSecs}}, trainingInProgress: trainingInProgress })
    sendResponse('training started');
  } else if (request.key == "stop-training") {
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
        if(idleTime > 30){
          notifyCurrentTab({key: 'idleNotify'})
        }
      }, 1000)
    }
}
