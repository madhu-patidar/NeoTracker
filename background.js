let trainingHours = 0;
let trainingMins = 0;
let trainingSecs = 0;
let trainingInProgress = false
let timerRunning = false;
let idleTime = 0;
let idleTimerRunning = false;
let buttonValue;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(request);
  if (request.key == "start-training"){
    if(timerRunning == false){
      resetTimer();
      timerRunning = true;
      trainingInProgress = true;
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
        if(buttonValue =='test button'){
          setTestButtonValue();
        }
      }, 1000)
    }
    sendResponse('training started');
  } else if (request.key == "stop-training") {
    clearAllIntervals()
    trainingHours = 0;
    trainingMins = 0;
    trainingSecs = 0;
    timerRunning = false;
    trainingInProgress = false;
     sendResponse('training started');
  }else if( request.key == 'resetTimer'){
    resetTimer();
  }else if(request.key == 'setTestButtonValue'){
    setTestButtonValue();
    buttonValue = 'test button'
  }
});

function setTestButtonValue(){
 notifyFrontEnd({key: 'setButton', value: 'test button'})
}

 function setTestButtonValue(){

 }
function updateFrontEndTimer(){
  notifyFrontEnd({key: 'trainingTime', value: {timer:{hh: trainingHours, mm: trainingMins, ss:trainingSecs}}})
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
        if(idleTime > 10){
          notifyCurrentTab({key: 'idleNotify'})
        }
      }, 1000)
    }
}
