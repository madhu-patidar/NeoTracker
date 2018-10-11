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
  console.log('you are idle')
});
