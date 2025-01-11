/*
 * MIT License
 *
 * Copyright (c) 2025 Joshua Horvath
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import document from "document";
import clock from "clock";
import * as newfile from "./newfile";
import { me as appbit } from "appbit";
import { today as activity } from "user-activity";
import { battery } from "power";
import { preferences, units } from "user-settings";


// Update the clock every minute
clock.granularity = "minutes";

// Get a handle on the <text> elements
const stepCountLabel = document.getElementById("stepCountLabel");
const batteryLabel = document.getElementById("batteryLabel");
const locationLabel = document.getElementById("locationLabel");
const clockLabel = document.getElementById("clockLabel");
const amPmLabel = document.getElementById("amPmLabel");
const conditionLabel = document.getElementById("conditionLabel");
const celsiusLabel = document.getElementById("celsiusLabel");
const fahrenheitLabel = document.getElementById("fahrenheitLabel");

/**
 * Receive and process new tempature data.
 */
newfile.initialize((data) => {
  if (appbit.permissions.granted("access_location")) {
    console.log(`It's ${data.temperature}\u00B0 ${data.unit} and ${data.condition} (${data.conditionCode}) in ${data.location}`);

    locationLabel.text = data.location;
    conditionLabel.text = data.condition;
    celsiusLabel.text = data.temperature;
    fahrenheitLabel.text = toFahrenheit(data);
  } else {
    console.log("----");
  }
});

/**
* Convert temperature value to Fahrenheit
* @param {object} data WeatherData
*/
function toFahrenheit(data) {

  return Math.round((data.temperature * 1.8) + 32)
}

/**
 * Update the display of clock values.
 * @param {*} evt 
 */
clock.ontick = (evt) => {
  // handle case of user permission for step counts is not there
  if (appbit.permissions.granted("access_activity")) {
    stepCountLabel.text = getSteps().formatted;
  } else {
    stepCountLabel.text = "-----";
  }

  // get time information from API
  let todayDate = evt.date;
  let rawHours = todayDate.getHours();

  // 12 hour format
  let hours = rawHours % 12 || 12;

  let mins = todayDate.getMinutes();
  let displayMins = zeroPad(mins);

  // display time on main clock
  clockLabel.text = `${hours}:${displayMins}`;

  // AM / PM indicator
  amPmLabel.text = rawHours >= 12 ? "PM" : "AM";

  updateBattery();
};

/**
 * Gets and formats user step count for the day.
 * @returns 
 */
function getSteps() {
  let val = activity.adjusted.steps || 0;
  return {
    raw: val,
    formatted:
      val > 999
        ? `${Math.floor(val / 1000)},${("00" + (val % 1000)).slice(-3)}`
        : val,
  };
}

/**
 * Front appends a zero to an integer if less than ten.
 * @param {*} i 
 * @returns 
 */
function zeroPad(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

/**
 * Updates the battery battery icon and label.
 */
function updateBattery() {
  updateBatteryLabel();
  //updateBatteryIcon(); // TODO
}

/**
 * Updates the battery lable GUI for battery percentage. 
 */
function updateBatteryLabel() {
  let percentSign = "&#x25";
  batteryLabel.text = battery.chargeLevel + percentSign;
}
