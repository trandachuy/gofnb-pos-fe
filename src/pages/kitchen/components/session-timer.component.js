import moment from "moment";
import React, { useState, useEffect } from "react";

export const SessionTimer = (props) => {
  const { startTime } = props;
  const [time, setTime] = useState(Date.now() - startTime);

  useEffect(() => {
    const interval = setInterval(() => {
      const localTime = moment.utc(startTime).local();
      var start = moment(localTime);
      var end = moment();
      var secondsPassed = end.diff(start, "seconds");
      setTime(secondsPassed);
    }, 1000);

    return () => clearInterval(interval);
  }, [time]);

  const convertSecondsToTime = (value) => {
    const sec = parseInt(value, 10); // convert value to number if it's string
    let hours = Math.floor(sec / 3600); // get hours
    let minutes = Math.floor((sec - hours * 3600) / 60); // get minutes
    let seconds = sec - hours * 3600 - minutes * 60; //  get seconds
    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    return hours + ":" + minutes + ":" + seconds; // Return is HH : MM : SS
  };

  return <>{convertSecondsToTime(time)}</>;
};
