# Timeweb Genie Neo

A CLI tool to calculate working hours logged in the Time@Web application.

| :warning: WARNING                            |
| -------------------------------------------- |
| This is a beta release and errors may occur. |

## Installation

1. Create a `~/.timeweb-genie.json` file (in your home directory):

   ```json
   {
     "timewebUrl": "https://.../TwNet.dll",
     "username": "...",
     "password": "..."
   }
   ```

   _Optional config options:_

   - `justificationTypes`: Overwrite the default types to be considered for calculating the working times (array of strings)
   - `justificationTypesToIgnore`: Overwrite the default types to be completely ignored (array of strings)
   - `targetWorkingHours`: Overwrite the default target working hours (number)
   - `targetBreakMinutes`: Overwrite the default lunch break time (number)


2. Simply run it with

   ```sh
   npx timeweb-genie-neo
   ```
   
   _or_ for specific date range

   ```sh
   npx timeweb-genie-neo 01/10/2022 31/10/2022
   ```

## Contributing

Feel free to send a pull request if you want to add any features or if you find a bug.
Check the issues tab for some potential things to do.


## Development

   ```sh
   # Install dependencies
   yarn install
   
   # Run typescript compiler in watch mode
   # This generates js application in /dist folder
   yarn dev
   
   # Execute application
   node dist/application.js
   ```

## Debugging

Make sure to run the typescript compiler on watch mode by executing ```yarn dev```.

Add Jetbrains Run/Debug Configuration:
![Alt text](_dev/run_configuration.jpg?raw=true "Title")



## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
