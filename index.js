const robot = require('robotjs');
const { exec } = require('child_process');

let LastMouseX = 0;
let LastMouseY = 0;
let Contador = 0;
let interval = 4;
let inicio = new Date().getTime();
// variable that indicates how often the interval should be changed
const timeToChangeInterval = 1;
const timeToShutDownPC = undefined;
const timeToShutDownPCMinutes = undefined;
const ALL_EVENTS = [RandomMouse,ScrollUp, ScrollDown, ChangeProgramOpened,changeTabOpened]

// RandomMouse,ScrollUp, ScrollDown, ChangeProgramOpened,changeTabOpened :: ALL EVENTS
const events = [...ALL_EVENTS];
setInterval(MouseMoveCheck, 1000); // Check every second if the mouse has moved
setInterval(shutDownPCAt, 1000); // Check if the time is 9:00 pm


// function to determine that 11 minutes have already elapsed and change the random interval, between 2 and 8
function getNewInterval() {
  // return Math.floor(Math.random() * 6) + 2;
  // between 1 and 3
  return Math.floor(Math.random() * 3) + 1;
}

function checkIfTimeToChangeInterval() {
  const minutesAfterStart = Math.floor((new Date().getTime() - inicio) / 60000);

  if (minutesAfterStart >= timeToChangeInterval) {
    interval = getNewInterval();
    inicio = new Date().getTime();
  }
}


function RandomMouse() {
  const MouseY = Math.floor(Math.random() * 1080);
  const MouseX = robot.getMousePos().x;
  robot.moveMouseSmooth(MouseX, MouseY);
}

function nextEvent() {
  const randomEvent = Math.floor(Math.random() * events.length);
  // console.log('new event name: ', events[randomEvent].name);
  events[randomEvent]();
}

function ScrollUp() {
  const position = Math.floor(Math.random() * 50);
  robot.scrollMouse(0, position);
}

function ScrollDown() {
  const position = Math.floor(Math.random() * -50);
  robot.scrollMouse(0, position);
}

function changeTabOpened() {

  const applescriptCommand = `osascript -e 'tell application "System Events" to get name of process 1 whose frontmost is true'`;
  // const applescriptCommand = `osascript -e 'tell application "System Events" to get name of (first process whose frontmost is true)'`;
  // const applescriptCommand = `osascript -e 'tell application "Eventos del sistema" to get name of (first proceso whose frontmost is true)'`;
  // const applescriptCommand = `osascript -l JavaScript -e 'Application("System Events").processes.whose({frontmost: true})[0].name()'`;



 
  // Ejecuta el comando y maneja la salida
  exec(applescriptCommand, (error, stdout, stderr) => {
    if (error || stderr) {
      console.error('Error:', error.message || stderr);
      return;
    }


    const activeApplication = stdout.trim();
    // console.log("activeApplication:", activeApplication)

    let randomTabNumber = Math.floor(Math.random() * 3) + 1;
    if(activeApplication === 'Electron' || activeApplication === 'Cursor'){
      randomTabNumber = Math.floor(Math.random() * 3) + 18;
    }
 
    const actions = {
      'Google Chrome': `osascript -e 'tell application "System Events" to keystroke "${randomTabNumber}" using {command down}'`,
      // 'Electron': `osascript -e 'tell application "System Events" to key code "${randomTabNumber}" using {control down}'`
      'Electron': `osascript -e 'tell application "System Events" to key code ${randomTabNumber} using {control down}'`,
      'Cursor': `osascript -e 'tell application "System Events" to key code ${randomTabNumber} using {control down}'`
    };

    const action = actions[activeApplication];

    if (action) {
      exec(action, (error, stdout, stderr) => {
        if (error) {
          console.log('Error:', error.message);
          return;
        }
        
        if (stderr) {
          console.log('Error:', stderr);
          return;
        }
    
      });
    }


  });

}

function MouseMoveCheck() {
  checkIfTimeToChangeInterval()

  const { x: MouseX, y: MouseY } = robot.getMousePos();

  if (MouseX !== LastMouseX || MouseY !== LastMouseY) {
    LastMouseX = MouseX;
    LastMouseY = MouseY;
    Contador = 0;
  } else {
    Contador++;

    if (Contador >= interval) {
      nextEvent();
      Contador = 0;
    }
  }
}

function ChangeProgramOpened() {
  // only pres tab one time
  const script = 'osascript -e \'tell application "System Events" to key code 48 using {command down}\'';
  // const script = 'osascript -e \'tell application "System Events" to key code 48 using {command down}\'';
  // const script = `osascript -l JavaScript -e 'Application("System Events").keyCode(48, {using: "command down"})'`;

  // press tab two times using when the command key is pressed
  // const script = 'osascript -e \'tell application "System Events" to key down command\' -e \'tell application "System Events" to key code 48\' -e \'delay 0.2\' -e \'tell application "System Events" to key code 48\' -e \'tell application "System Events" to key up command\'';

  exec(script, (error, stdout, stderr) => {
    if (error) {
      console.error(error);
    }
    if (stderr) {
      console.error(stderr);
    }

    changeTabOpened();
  });
}

function shutDownPCAt(){

  if(timeToShutDownPC === undefined || timeToShutDownPCMinutes === undefined) return

  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  if(hours === timeToShutDownPC && minutes === timeToShutDownPCMinutes){
    const script = 'osascript -e \'tell application "System Events" to shut down\'';
    exec(script, (error, stdout, stderr) => {
      if (error) {
        console.error(error);
      }
      if (stderr) {
        console.error(stderr);
      }
    });
  }
}

process.stdin.resume(); // Keep the script running
process.on('SIGINT', () => {
  // Exit gracefully on Ctrl+C
  process.exit();
});
