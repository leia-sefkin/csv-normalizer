const fs = require('fs');
const csv = require('fast-csv');
const moment = require('moment-timezone');

//Input and output CSV files to write to 
const input = process.argv[2];
const output = process.argv[3];

const readStream = fs.createReadStream(input); 
const writeStream = fs.createWriteStream(output); 

const inputTimeZone = 'America/Los_Angeles';
const outputTimeZone = 'America/New_York';

function normalizeUnicode(input) {
  //Check and remove everything forbidden by XML 1.0 specifications
  const regex = /([^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFC\u{10000}-\u{10FFFF}])/ug;
  return input.replace(regex, '\uFFFD');
}

//Normalize the data for each row
function normalizer(inputRow, cb) {
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

const parser = csv.parse({headers: true});
const formatter = csv.format({headers: true});

parser.on('end', function(){
  console.log(`Finished parsing input file ${input}`);
})
.on('error', function(err){
    console.error(`error parsing CSV file: ${err.message}`);
});

formatter.on('end', function(){
  console.log(`Finished formatting output to ${output}`);
})
.on('error', function(err){
    console.error(`error formatting CSV file: ${err.message}`);
});

readStream
  .pipe(parser)
  .pipe(formatter)
  .transform(function(row, next) {
    normalizer(row, function(err, outputRow) {
    
      if(err) {
        console.error(`Error while normalizing row: ${err.message}`);
        return next(null);
      }

      return next(null, outputRow);
    });
  })
  .pipe(writeStream);
