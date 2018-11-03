/*
Copyright (C) 2018 Alkis Georgopoulos <alkisg@gmail.com>.
SPDX-License-Identifier: CC-BY-SA-4.0
*/
const hour_msec = 60*60*1000;
const day_msec = 24*hour_msec;
const epoch = new Date('01/01/2000 UTC');
const earth_period_msec = 365.25*day_msec;
const moon_period_msec = 27.32*day_msec;  //TODO: sidereal or synodic month?
const month_msec = earth_period_msec/12;
const units_msec = [hour_msec, day_msec, month_msec];
var act = null;  // activity object, see initActivity()

function ge(element) {
  return document.getElementById(element);
}

function initActivity() {
  if (!act) {  // first run
    console.clear();
    console.log(ge('sun'));
  }
  act = {
    step: 0,
    steps: 0,
    unit: 1,
    speed: 50,
    now: new Date(epoch.getTime()),
    interval: null
  }
  onStepsChange();
  onUnitChange();
  onSpeedChange();
  onResize();
}

function onStart(event) {
  if (!act.interval) {
    ge('bar_play').style.display = 'none';
    ge('bar_pause').style.display = 'block';
    // Map 1..99 to 1000..10
    act.interval = setInterval(nextOrbits, 1000/act.speed);
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

function onStepsChange(event) {
  onPause(event);
  act.steps = ge('steps').value;
}

function onUnitChange(event) {
  act.unit = ge('unit').value;
}

function onSpeedChange(event) {
  act.speed = ge('speed').value;
  if (act.interval) {
    clearInterval(act.interval);
    act.interval = setInterval(nextOrbits, 1000/act.speed);
  }
}

function onHome(event) {
  window.history.back();
}

function onHelp(event) {
  alert("Επιλέξτε πλήθος βημάτων (ή 0 για άπειρο) και μονάδα κίνησης (ώρες, ημέρες ή μήνες). Στη συνέχεια πατήστε το κουμπί εκκίνησης (▶).");
}

function onAbout(event) {
  window.open("credits/index_DS_II.html");
}

// Return a number between [0, 1)
function dateToEarthAngle(d) {
  var periods = (d - epoch)/earth_period_msec;
  return periods - Math.floor(periods);
}

// Return a number between [0, 1)
function dateToMoonAngle(d) {
  var periods = (d - epoch)/moon_period_msec;
  return periods - Math.floor(periods);
}

function drawOrbits() {
  var sun = ge('sun');
  var sun_rect = sun.getBoundingClientRect();
  var earth = ge('earth');
  var earth_shadow = ge('earth_shadow');
  var ea = dateToEarthAngle(act.now);
  earth.style.left = earth_shadow.style.left = sun_rect.left + sun_rect.width/2 + 1.4*sun_rect.width*Math.cos(2*Math.PI*ea) - earth.offsetWidth/2 + 'px';
  earth.style.top = earth_shadow.style.top = sun_rect.top + sun_rect.height/2 + 1.4*sun_rect.height*Math.sin(2*Math.PI*ea) - earth.offsetHeight/2 + 'px';
  earth.style.transform = "rotate(" + 360*365.25*ea + "deg)";
  earth_shadow.style.transform = "rotate(" + 360*ea + "deg)";
  var moon=ge('moon');
  var moon_shadow=ge('moon_shadow');
  var ma = dateToMoonAngle(act.now);
  moon.style.left = moon_shadow.style.left = earth.offsetLeft + earth.offsetWidth/2 + 1*earth.offsetWidth*Math.cos(2*Math.PI*ma) - moon.offsetWidth/2 + 'px';
  moon.style.top = moon_shadow.style.top = earth.offsetTop + earth.offsetHeight/2 + 1*earth.offsetWidth*Math.sin(2*Math.PI*ma) - moon.offsetHeight/2 + 'px';
  moon.style.transform = "rotate(" + 360*ma + "deg)";
  moon_shadow.style.transform = "rotate(" + 360*ea + "deg)";
  ge('now').innerHTML =
    ("0" + act.now.getUTCDate()).slice(-2) + "-" +
    ("0" + (act.now.getUTCMonth()+1)).slice(-2) + "-" +
    act.now.getUTCFullYear() + " " +
    ("0" + act.now.getUTCHours()).slice(-2) + ":" +
    ("0" + act.now.getUTCMinutes()).slice(-2);
}

function nextOrbits() {
  act.now = new Date(act.now.getTime() + units_msec[act.unit]);
  if (act.steps != 0) {
    act.step += 1;
    if (act.step >= act.steps)
      onPause();
  }
  drawOrbits();
}

function onResize() {
  var w = window.innerWidth;
  var h = window.innerHeight;
  if (w/h < 640/360) {
    document.body.style.fontSize = 10*w/640 + "px";
  } else {
    document.body.style.fontSize = 10*h/360 + "px";
  }
  drawOrbits();
}
