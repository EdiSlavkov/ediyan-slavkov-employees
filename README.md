## FIND WHO WORKED MOST

An application that identifies the pair of employees who have worked together on common projects for the longest period of time.

### How it works

1. Upload a .csv file with the following columns:
   - Employee ID #1
   - Employee ID #2
   - Project ID
   - DateFrom
   - DateTo (It is acceptable to have a null value. If null is provided, the current date will be used.)

2. After uploading the file, the application will find the pair that has worked on common projects for the longest period of time. It will display their shared work on different projects in a table format, along with the total number of days they have worked together.

3. If no pair is found, an error message will be displayed: "No one worked on the same project!"

### Validations

The application includes validations for the following scenarios:

- Incorrect .csv file format
- Empty values in columns such as Employee ID or Project ID, which will trigger an error message
- Invalid start or end dates
- Empty .csv file
- Start date being greater than the end date

### Used Libraries

The application utilizes the following libraries:

- Papaparse: For CSV to objects parsing
- Bootstrap: For the user interface
- Moment.js: For date formatting
