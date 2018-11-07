/*
Copyright (C) 2018 Alkis Georgopoulos <alkisg@gmail.com>.
SPDX-License-Identifier: CC-BY-SA-4.0
*/
var hourMSec = 60 * 60 * 1000;
var dayMSec = 24 * hourMSec;
var epoch = new Date('01/01/2000 UTC');
var earthPeriodMSec = 365.25 * dayMSec;
var moonPeriodMsec = 27.32 * dayMSec;
var monthMSec = earthPeriodMSec / 12;
var unitsMSec = [hourMSec, dayMSec, monthMSec];
var act = null;  // activity object, see initActivity()

// ES6 string templates don't work in old Android WebView
function sformat(format) {
  var args = arguments;
  var i = 0;
  return format.replace(/{(\d*)}/g, function sformatReplace(match, number) {
    i += 1;
    if (typeof args[number] !== 'undefined') {
      return args[number];
    }
    if (typeof args[i] !== 'undefined') {
      return args[i];
    }
    return match;
  });
}

function ge(element) {
  return document.getElementById(element);
}

function onStart(event) {
  if (!act.interval) {
    ge('bar_play').style.display = 'none';
    ge('bar_pause').style.display = 'block';
    // Map 1..99 to 1000..10
    act.interval = setInterval(nextOrbits, 1000 / act.speed);
  }
}

function onPause(event) {
  act.step = 0;
  if (act.interval) {
    ge('bar_play').style.display = 'block';
    ge('bar_pause').style.display = 'none';
    clearInterval(act.interval);
    act.interval = null;
  }
}

function onReset(event) {
  onPause(event);
  initActivity();
}


function onToggleFullScreen(event) {
  var doc = window.document;
  var docEl = doc.documentElement;

  var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen
    || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen
    || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if (!doc.fullscreenElement && !doc.mozFullScreenElement
    && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl);
  } else {
    cancelFullScreen.call(doc);
  }
}

function onStepsChange(event) {
  onPause(event);
  act.steps = parseInt(ge('steps').value, 10);
}

function onUnitChange(event) {
  act.unit = parseInt(ge('unit').value, 10);
}

function onSpeedChange(event) {
  act.speed = parseInt(ge('speed').value, 10);
  if (act.interval) {
    clearInterval(act.interval);
    act.interval = setInterval(nextOrbits, 1000 / act.speed);
  }
}

function onHome(event) {
  window.history.back();
}

function onHelp(event) {
  alert('Επιλέξτε πλήθος βημάτων (ή 0 για άπειρο) και μονάδα κίνησης (ώρες, ημέρες ή μήνες). Στη συνέχεια πατήστε το κουμπί εκκίνησης (▶).');
}

function onAbout(event) {
  window.open('credits/index_DS_II.html');
}

// Return a number between [0, 1)
function dateToEarthAngle(d) {
  var periods = (d - epoch) / earthPeriodMSec;
  return periods - Math.floor(periods);
}

// Return a number between [0, 1)
function dateToMoonAngle(d) {
  var periods = (d - epoch) / moonPeriodMsec;
  return periods - Math.floor(periods);
}

function drawOrbits() {
  var sun = ge('sun');
  var sunRect = sun.getBoundingClientRect();
  var earth = ge('earth');
  var earthShadow = ge('earth_shadow');
  var ea = dateToEarthAngle(act.now);
  var moon = ge('moon');
  var moonShadow = ge('moon_shadow');
  var ma = dateToMoonAngle(act.now);

  earth.style.left = sformat('{}px', sunRect.left + sunRect.width / 2
    + 1.4 * sunRect.width * Math.cos(2 * Math.PI * ea)
    - earth.offsetWidth / 2);
  earthShadow.style.left = earth.style.left;
  earth.style.top = sformat('{}px', sunRect.top + sunRect.height / 2
    + 1.4 * sunRect.height * Math.sin(2 * Math.PI * ea)
    - earth.offsetHeight / 2);
  earthShadow.style.top = earth.style.top;
  earth.style.transform = sformat('rotate({}deg)', 360 * 365.25 * ea);
  earthShadow.style.transform = sformat('rotate({}deg)', 360 * ea);
  moon.style.left = sformat('{}px', earth.offsetLeft + earth.offsetWidth / 2
    + 1 * earth.offsetWidth * Math.cos(2 * Math.PI * ma)
    - moon.offsetWidth / 2);
  moonShadow.style.left = moon.style.left;
  moon.style.top = sformat('{}px', earth.offsetTop + earth.offsetHeight / 2
    + 1 * earth.offsetWidth * Math.sin(2 * Math.PI * ma)
    - moon.offsetHeight / 2);
  moonShadow.style.top = moon.style.top;
  moon.style.transform = sformat('rotate({}deg)', 360 * ma);
  moonShadow.style.transform = sformat('rotate({}deg)', 360 * ea);
  ge('now').innerHTML = sformat('{}-{}-{} {}:{}',
    sformat('0{}', act.now.getUTCDate()).slice(-2),
    sformat('0{}', act.now.getUTCMonth() + 1).slice(-2),
    act.now.getUTCFullYear(),
    sformat('0{}', act.now.getUTCHours()).slice(-2),
    sformat('0{}', act.now.getUTCMinutes()).slice(-2));
}

function nextOrbits() {
  act.now = new Date(act.now.getTime() + unitsMSec[act.unit]);
  if (act.steps !== 0) {
    act.step += 1;
    if (act.step >= act.steps) {
      onPause();
    }
  }
  drawOrbits();
}

function onResize() {
  var w = window.innerWidth;
  var h = window.innerHeight;
  if (w / h < 640 / 360) {
    document.body.style.fontSize = sformat('{}px', 10 * w / 640);
  } else {
    document.body.style.fontSize = sformat('{}px', 10 * h / 360);
  }
  drawOrbits();
}

function addEvents() {
  document.body.onresize = onResize;
  ge('bar_play').onclick = onStart;
  ge('bar_pause').onclick = onPause;
  ge('bar_reset').onclick = onReset;
  ge('bar_fullscreen').onclick = onToggleFullScreen;
  ge('steps').onchange = onStepsChange;
  ge('unit').onchange = onUnitChange;
  ge('speed').onchange = onSpeedChange;
  ge('bar_home').onclick = onHome;
  ge('bar_help').onclick = onHelp;
  ge('bar_about').onclick = onAbout;
}

function initActivity() {
  if (!act) {  // first run
    addEvents();
  }
  act = {
    step: 0,
    steps: 0,
    unit: 1,
    speed: 50,
    now: new Date(epoch.getTime()),
    interval: null,
  };
  onStepsChange();
  onUnitChange();
  onSpeedChange();
  onResize();
}
