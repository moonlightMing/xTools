'use strict';

const { ipcRenderer } = window.require('electron');

const pwdInput = document.getElementById('pwd-input');
const pwdTips = document.getElementById('pwd-tips');

const onMiniBtnClick = () => {
  ipcRenderer.send('request-minimize-auth-windows');
}

const onCloseBtnClick = () => {
  ipcRenderer.send('request-close-auth-windows');
}

const onPwdInputChange = () => {
  pwdTips.style.visibility = 'hidden';
}

document.getElementById('enter-btn').addEventListener('click', (e) => {
  e.preventDefault();
  ipcRenderer.once('request-auth-password-check-reply', (_, pwd) => {
    if (pwdInput.value === pwd) {
      ipcRenderer.send('request-unlock-main-window')
    } else {
      pwdTips.style.visibility = 'visible';
    }
  })
  ipcRenderer.send('request-auth-password-check');
})

document.getElementById('clear-btn').addEventListener('click', (e) => {
  e.preventDefault();
  pwdInput.value = '';
  pwdTips.style.visibility = 'hidden';
})