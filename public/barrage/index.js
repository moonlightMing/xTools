'use strict';

const {ipcRenderer} = window.require ('electron');

const dm = document.getElementById ('barrage-container');
const dmHeight = dm.offsetHeight;
const dmWidth = dm.offsetWidth;

const shoot = barrageStr => {
  const span = document.createElement ('span');
  span.style.position = 'absolute';
  span.style.opacity = 0.5;
  span.style.left = dmWidth + Math.floor (Math.random () * 100) + 'px';
  span.style.top = (dmHeight - 150) * Math.random ().toFixed (2) + 'px';
  span.style.whiteSpace = 'nowrap';
  span.style.color = '#' + Math.floor (Math.random () * 0xffffff).toString (16);
  span.innerText = barrageStr;
  span.style.fontSize = '60px';
  dm.appendChild (span);

  let roll = timer => {
    let now = new Date ();
    roll.last = roll.last || now;
    roll.timer = roll.timer || timer;
    let left = span.offsetLeft;
    let rect = span.getBoundingClientRect ();
    if (left < rect.left - rect.right) {
      dm.removeChild (span);
      // 所有弹幕跑完 请求关闭页面
      if (!dm.hasChildNodes ()) {
        ipcRenderer.send ('shoot-barrage-end');
      }
    } else {
      if (now - roll.last >= roll.timer) {
        roll.last = now;
        left -= 3;
        span.style.left = left + 'px';
      }
      requestAnimationFrame (roll);
    }
  };
  roll (40 * +Math.random ().toFixed (2));
};

ipcRenderer.on ('shoot-barrage', (_, taskInfo, barrageDensity) => {
  const interval = 5;
  const timer = setInterval (() => {
    for (let i = 0; i < barrageDensity; i++) {
      shoot (taskInfo);
    }
  }, interval * 1000);

  setTimeout (() => clearInterval (timer), (3 * interval + 1) * 1000);
});

ipcRenderer.send ('ready-to-shoot-barrage');
