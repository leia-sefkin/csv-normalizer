# csv-normalizer

## Installation

 `npm install`
 
Built and tested with:
- NodeJS v13.6.0

## Running the script 

This script takes in an input CSV file as the first argument and will output a normalized version to the file specified in the second argument. If no file exists it will create one. 

For example: 

```
node normalizer.js input.csv output.csv

```

Any errors encountered due to imporperly formatted data will cause the row being processed to be dropped. 