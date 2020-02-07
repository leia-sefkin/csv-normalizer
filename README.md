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

This script expects an input CSV file formatted with the following headers:

```
Timestamp
ZIP
FullName
Address
FooDuration
BarDuration
Notes
```

* Timestamp expects an input format of `MM/DD/YY hh:mm:ss A` and will be convereted into ISO-8601, from Pacific Standard to Eastern Standard time. To change the zones update the constants in `rowTransform.js`.

* ZIP will be expected to be 5 digits, where not data will be padded with preceding '0's.

* FullName will be translated to uppercase ALLCAPS

* FooDuration and BarDuraition will be translated into seconds. All formats accepted are following the [moment.duration docs](https://momentjs.com/docs/#/durations/)

* Notes and Address will be left as is, aside from sanitizing input against UTF-8 standards
