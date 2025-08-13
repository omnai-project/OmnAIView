# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [Unreleased]
### Added 
### Changed 
### Removed 

## [v1.16.0]
### Changed 
- Change enabling graph zoom via checkboxes to enable zoom via hovering 


## [v1.15.0-alpha]
 - Add comprehensive font-size settings system with 4 scaling levels (87.5% - 125%)
 - Add FontSizeService with reactive state management and localStorage persistence
 - Add tabbed settings dialog with integrated theme controls (light/dark mode)
### Changed 
 - Increased Angular `maximumError` budget from 1MB to 2MB to prevent build errors when bundle size slightly exceeds the previous limit
### Removed 
 - old darkmode implementation and button

## [v1.14.0-alpha]
### Added
- Add a record button with record functionaliy in toolbar
- Add a recording modal for settings of recording

## [v1.13.0-alpha]
### Added 
- Add Control Panel showing devices, files and analysis 
- Add settings menu to change device name 
### Removed 
- OmnAIScope devicelist below graph 

## [v1.12.2-alpha]
### Changed 
- Fix zoom behavior on axis switch to prevent resets/glitchs 

## [v1.12.1-alpha]

### Fixed
- Fix selection rectangle positioning to properly align with plot area boundaries

## [v1.12.0-alpha]

### Added
- Add interactive graph selection analysis tool for time-series measurement data
- Add universal input support (mouse/touch/stylus) for graph selection feature

## [v1.11.0-alpha]
### Added 
- Use device colors for path color in graph (#148)
### Changed
- Refactor graph component into main, toolbar and graph component (#147)
### Removed 

## [v1.10.1-alpha]
### Changed 
- Fix tooltip time to fit local time (#146)

## [v1.10.0-alpha]
### Added 
- Add survey tool calculating and showing delta between two selected graph points (#145)

## [v1.9.0-alpha]
### Added 
- Add tooltip showing graph coordinates of mouse position (#144)

## [v1.8.0-alpha]
### Added 
- Add selection checkboxes to zoom axis separatly (#143)

## [v1.7.2-alpha]
### Changed 
- Update to OmnAIScope-DataServer v1.3.0 (#142)
- Fix x-Axis dates from OmnAIScope data by adding new v1.3.0 of OmnAIScope-Dataserver (#142)

## [v1.7.1-alpha]

### Changed 
- Fix relative time calculation for new zoom possibility (#141)

## [v1.7.0-alpha]

### Added 
- Add settings menu dummy (#138)
### Changed 
- Improve style by changing elements positions (#138)
- Fit style to brand colors using red-theme pallettes (#138)

##[v1.6.0-alpha]

### Added 
- Add zoom functionality for graph (#137)

## [v1.5.0-alpha]

### Added 
- Add csv parser for OmnAIScope and Random Dummy data files (#136)
### Changed 
- Update OmnAIScope-DataServer to v1.2.1 (#135)
- Update Versionnumber (#139)
- Update changelog to fit versions and keepachangelog format (#139)

## [v1.4.0-alpha]

### Added 
- Add save button and save functionality (#134)
### Changed 
- Update OmnAIScope Backend/ OmnAIScope-DataServer to v1.2.0 (#134)

## [v1.3.1-alpha]

### Changed 
- Fix start/stop conditions for car mode (#131)

## [v1.3.0-alpha]

### Added
- Add CI for Release (#123)
- Add stop and delete functionality to start button (#126)
### Changed 
- Update programm to v1.1.1 of the OmnAIScope Backend (#130)

## [v1.2.0-alpha]

### Added 
- Add workshop/advanced mode for car repair shops (#118)
## [v1.1.0-alpha]
### Added 
- Add darkmode via button toggle (#121)

### [v1.0.0-alpha]

### Added 
- Initial Angular Setup (#8)
- Initial Electron Setup (#10) 
- Autostart of OmnAIScope Backend (#11)
- Start OmnAIScope Backend on a free port (#13)
- Initial README.md and CONTRIBUTION.md (#14)
- Add postinstall script (#15)
- Set up dynamic port handling between Electron and Angular app (#18)
- Create PortService and ApiService to retrieve device list via REST API (#18)
- Introduce DeviceListComponent to visualize available devices (#18)
- Add DataSourceService for reactive data management in the graph (#18)
- Initialize GraphComponent with zoomable x/y axes using D3 (#18)
- Implement responsive axis drawing with ResizeObserver directive (#18)
- Provide default random data source for development and debugging (#18)
- Establish WebSocket communication with backend for live data (#18)
- Separate configuration for Electron and dev server environments (#18)
- Apply basic SSR compatibility (guard browser-only APIs) (#18)
- Add dummy data server for debugging live graph rendering (#18)
- Add Icon (#19)
- Adding compodoc (#23)
- Adding changelog information to the Contribution.md (#41)
- Add version-script to obtain package.json information (#35)
- Add import for csv-files (#39)
Formatting needs to be similar to the dataformat of the old OmnAIView data exports. For more infos, see comments in code.
- Added automatic device polling every 15 Seconds (#35)
- Add axis mode: Allow to switch between absolute and relative x-axis timestamps(#58)
- Add webSocket disconnect and disable device polling while active WebSocket (#97)
- Secure reloading of entrypoint via did-fail-load Event in Electron (#100)
- Add issue template (#89)
- Update contribution workflow (#89)

### Changed 

- BREAKING CHANGE: Update OmnAIScope Dataserver from v0.4.0 to v0.5.0
- Modernize codebase to Angular 19 (inject, signals, @if/@for, etc.) (#18)
- Configure Angular Material with a custom theme (#18)
- Fix the Port selection for the OmnAIScope backend (#19)
- If electron-squirrel-startup is not avaliable the app crashes without logging. Therefore wrapping in try/catch. (#80)
- Update x-axis labels to use hours, minutes, seconds instead of year (#58)
- Reduce file size of csv-file-import.service.spec.ts by replacing hard-coded string (#78)
- Privacy oriented default setting to not share data with Google (#82)
- Fixed ci and `package-lock.json` files to allow installing the project with `npm ci` (#83)
- Stop-Button for Random Data Server (#115)
- Change start-data button to mat-icon play_arrow button (#107)
- Update PR Template to be more clear (#93)
- Improve style by changing elements positions (#138)


### Removed 

- Deletion of deprecated Angular 18 patterns (#18)
- Deletion of duplicated AsyncAPI description for OmnAIBackend 
- BREAKING CHANGE: Remove `package.json` build scripts in subfolders (#35)


