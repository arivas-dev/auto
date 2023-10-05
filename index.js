const robot = require('robotjs');
const { exec } = require('child_process');

let LastMouseX = 0;
let LastMouseY = 0;
let Contador = 0;
let interval = 4;
let inicio = new Date().getTime();
// variable that indicates how often the interval should be changed
const timeToChangeInterval = 9;

// RandomMouse,ScrollUp, ScrollDown, ChangeProgramOpened,changeTabOpened :: ALL EVENTS
const events = [RandomMouse,ScrollUp, ScrollDown, ChangeProgramOpened];
setInterval(MouseMoveCheck, 1000); // Check every second if the mouse has moved


// function to determine that 11 minutes have already elapsed and change the random interval, between 2 and 12
function getNewInterval() {
  return Math.floor(Math.random() * 10) + 2;
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

 
  // Ejecuta el comando y maneja la salida
  exec(applescriptCommand, (error, stdout, stderr) => {
    if (error || stderr) {
      console.error('Error:', error.message || stderr);
      return;
    }


    const activeApplication = stdout.trim();
    // console.log("activeApplication:", activeApplication)

    const randomTabNumber = Math.floor(Math.random() * 4);
    // console.log("randomTabNumber:", randomTabNumber)

 
    const actions = {
      'Google Chrome': `osascript -e 'tell application "System Events" to keystroke "${randomTabNumber}" using {command down}'`,
      // 'Electron': `osascript -e 'tell application "System Events" to keystroke "${randomTabNumber}" using {control down}'`
    };

    const action = actions[activeApplication];
    // console.log("action:", action)

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
        // console.log("stdout:", stdout)
    
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
  // const script = 'osascript -e \'tell application "System Events" to key code 48 using {command down}\'';
  // press tab two times using when the command key is pressed
  const script = 'osascript -e \'tell application "System Events" to key down command\' -e \'tell application "System Events" to key code 48\' -e \'delay 0.2\' -e \'tell application "System Events" to key code 48\' -e \'tell application "System Events" to key up command\'';

  exec(script, (error, stdout, stderr) => {
    if (error) {
      console.error(error);
    }
    if (stderr) {
      console.error(stderr);
    }

    // changeTabOpened();
  });
}

process.stdin.resume(); // Keep the script running
process.on('SIGINT', () => {
  // Exit gracefully on Ctrl+C
  process.exit();
});
