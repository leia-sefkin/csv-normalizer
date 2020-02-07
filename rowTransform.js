const moment = require('moment-timezone');

//TimeZone definitions for converting timestamps
const inputTimeZone = 'America/Los_Angeles';
const outputTimeZone = 'America/New_York';

/*
  Check and attempt to sanitize/normalize Unicode according to XML 1.0 standards
  Regex borrowed from here: 
    https://www.ryadel.com/en/javascript-remove-xml-invalid-chars-characters-string-utf8-unicode-regex/
*/
function normalizeUnicode(input) {
  const regex = /([^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFC\u{10000}-\u{10FFFF}])/ug;
  return input.replace(regex, '\uFFFD');
}

/*
  Normalize the data for each row, all params listed are required

  @param inputRow {Object} - the input row of data to be processed
  @param inputRow.Timestamp {String} - Date string formatted as MM/DD/YY hh:mm:ss A 
  @param inputRow.ZIP {String} - Zip code 
  @param inputRow.FullName {String} - Full Name
  @param inputRow.Address {String} - Address string
  @param inputRow.FooDuration {String} - Duration 
    (accepts all formats of the moment.duration method: https://momentjs.com/docs/#/durations/)
  @param inputRow.BarDuration {String} - Duration
    (same as above)
  @param inputRow.Notes {String} - Text notes
*/
function rowTransform(inputRow, cb) {
  let outputRow = {};

  //Convert the Timestamp value to ISO_8601 format
  let date = moment.tz(inputRow.Timestamp, 'MM/DD/YY hh:mm:ss a', inputTimeZone);

  //Ensure we got a valid date
  if(date.isValid()) {
    //Convert timezone and save to Output
    outputRow.Timestamp = date.tz(outputTimeZone);
  } else {
    return cb(new Error(`Invalid Date: ${timestamp}`));
  }

  //Zip Code -> prefill with 0 if less than 5 digits
  let zipCode = inputRow.ZIP;
  if(zipCode.length < 5) {
    zipCode = zipCode.padStart(5, '0');
  }

  outputRow.ZIP = zipCode;

  //FullName -> convert to uppercase
  let name = inputRow.FullName.toUpperCase();
  outputRow.FullName = name;

  //Address -> pass through as is aside from unicode validation
  outputRow.Address = normalizeUnicode(inputRow.Address);

  //FooDuration and BarDuration -> convert from HH:MM:SS.MS to total number of seconds expressed
  let fooDuration = moment.duration(inputRow.FooDuration);
  if(fooDuration.isValid()) {
    outputRow.FooDuration = fooDuration.asSeconds();
  } else {
    return cb(new Error('Error parsing FooDuration seconds'));
  }

  let barDuration = moment.duration(inputRow.BarDuration);
  if(barDuration.isValid()) {
    outputRow.BarDuration = barDuration.asSeconds();
  } else {
    return cb(new Error('Error parsing BarDuration seconds'));
  }

  //Total duration set to be total of Foo + Bar duration
  outputRow.TotalDuration = outputRow.FooDuration + outputRow.BarDuration;

  //Save notes sanitized 
  outputRow.Notes = normalizeUnicode(inputRow.Notes);

  cb(null, outputRow);
}

module.exports = rowTransform;