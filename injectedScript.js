var SessionId;
var ApiBaseUrl = 'http://localhost:3000/api/v1';
document.addEventListener('click',function () {
  console.log('clicked')
  chrome.runtime.sendMessage({key : 'resetTimer'}, function() { });
});

document.addEventListener('keypress',function () {
  console.log('keypress')
  chrome.runtime.sendMessage({key : 'resetTimer'}, function() { });
});
document.addEventListener('mousemove',function () {
  console.log('mousemove')
  chrome.runtime.sendMessage({key : 'resetTimer'}, function() { });
});


chrome.runtime.onMessage.addListener(msgObj => {
	let key = msgObj.key;
	if(key === 'start-training' && msgObj.trainingInProgress){
 		updateTimerValue(msgObj.value.timer)
	}else if(key === 'stop-training'){
		updateTimerValue(msgObj.value.timer)
	}else if(key === 'idleNotify'){
	  alert('you are idle')
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
	debugger
  SessionId = localStorage.getItem('sessionId');
  chrome.tabs.captureVisibleTab(null, {}, function (image) {
    console.log('capturing image');
    document.getElementById('snap').src = image;
    // $('#snap').css({'height':'100', 'width':'200'})
      uploadImage({session_id: SessionId })
  });
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

 function takeScreenShot(){
	 html2canvas(window.parent.document.body, {
	 onrendered: function(canvas) {
	 var cand = document.getElementsByTagName('canvas');
	 if(cand[0] === undefined || cand[0] === null){
	 
	 }else{
	 //cand[0].remove();
	 document.body.removeChild(cand[0]);
	 }
	 document.body.appendChild(canvas);
	 }
	 });
	 }
	 
	 function postImage(){
	 var cand = document.getElementsByTagName('canvas');
	 var canvasData = cand[0].toDataURL("image/png");
	 var ajax = new XMLHttpRequest();
	 ajax.open("POST",'/pr/custom/testSave.php',false);
	 ajax.setRequestHeader('Content-Type', 'application/upload');
	 ajax.send(canvasData );
	 alert('done');
 }
 
