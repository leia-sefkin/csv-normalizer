const fs = require('fs');
const csv = require('fast-csv');

//Methods to normalize the data
const rowTransform = require('./rowTransform');

//Input and output CSV files to write to 
const input = process.argv[2];
const output = process.argv[3];

const readStream = fs.createReadStream(input); 
const writeStream = fs.createWriteStream(output); 

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
    rowTransform(row, function(err, outputRow) {
    
      //If there's an error normalizing the row, skip it and move on
      if(err) {
        console.error(`Error while normalizing row: ${err.message}`);
        return next(null);
      }

      return next(null, outputRow);
    });
  })
  .pipe(writeStream);
