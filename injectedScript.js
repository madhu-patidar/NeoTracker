var ApiBaseUrl = 'http://localhost:3000/api/v1';
var keyPressCounter = 0;
var confirmationPopActive = false;
document.addEventListener('click',function () {
  console.log('clicked')
  chrome.runtime.sendMessage({key : 'resetTimer'}, function() { });
});


document.addEventListener('keypress',function () {
  keyPressCounter = keyPressCounter + 1;
  console.log('keypress ===>', keyPressCounter )
  chrome.runtime.sendMessage({key : 'resetTimer'}, function() { });
  chrome.runtime.sendMessage({key : 'keypress'}, function() { });
  // captureImage()
});
document.addEventListener('mousemove',function () {
  // console.log('mousemove')
    chrome.runtime.sendMessage({key : 'resetTimer'}, function() { });
    chrome.runtime.sendMessage({key : 'mousemove'}, function() { });
});


function notifyBackend(data){
  chrome.runtime.sendMessage(data, function() { });
}


chrome.runtime.onMessage.addListener(msgObj => {
	let key = msgObj.key;
	if(key === 'start-training' && msgObj.trainingInProgress){
 		updateTimerValue(msgObj.value.timer)
      keyPressCounter = 0;
	}else if(key === 'stop-training'){
      keyPressCounter = 0;
		// updateTimerValue(msgObj.value.timer)
	}else if(key === 'idleNotify' && !confirmationPopActive){
    confirmationPopActive = true;
    notifyBackend({key : 'open-idleNotify'});
	  alert('you are idle')
    confirmationPopActive = false;
    notifyBackend({key : 'close-idleNotify'});
         
      // if (confirm("you are idle, You want to stop training?")) {
      //    // notifyBackend({key : 'stop-training'});
      //    confirmationPopActive = false;
      //    notifyBackend({key : 'close-idleNotify'});
      // } else {
      //    confirmationPopActive = false;
      //    notifyBackend({key : 'close-idleNotify'})
      // }
	}else if(key === 'trainingInProgress' && msgObj.trainingInProgress){
    updateTimerValue(msgObj.value.timer)
  }
});

function updateTimerValue(timer){
  console.log('timer value', timer);
  // document.getElementById('trainingTime').innerText = timer.hh + ":" + timer.mm + ":" + timer.ss;
  if(timer.ss % 10 == 0){
    captureImage();
  }
}


function captureImage(){
  url = window.location.href
  key_press = keyPressCounter
  html2canvas(document.querySelector("body")).then(canvas => {
    notifyBackend({key : 'imageUpload', blob: canvas.toDataURL(), url: url,})
  });
  keyPressCounter = 0
}
