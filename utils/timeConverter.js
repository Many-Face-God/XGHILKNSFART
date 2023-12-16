function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}
// console.log(msToTime(209900000));

const millisToMinutesAndSeconds = (millis) => {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  //ES6 interpolated literals/template literals
  //If seconds is less than 10 put a zero in front.
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

function msToTime(s) {
  // Pad to 2 or 3 digits, default is 2
  function pad(n, z) {
    z = z || 2;
    return ("00" + n).slice(-z);
  }

  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  return pad(hrs) + ":" + pad(mins) + ":" + pad(secs) + "." + pad(ms, 3);
}

// console.log(msToTime(55018));

module.exports.msToHoursAndMinutes = (millis) => {
  const hours = Math.floor(millis / (1000 * 60 * 60));
  const minutes = Math.floor((millis / (1000 * 60)) % 60);

  return `${hours}h : ${minutes}m`;
};

