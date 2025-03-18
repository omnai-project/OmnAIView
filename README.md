# OmnAIView 

## Getting Started 

### About the project 
OmnAIView is a software for controlling, visualizing, and analyzing data from a USB oscilloscope, the OmnAIScope.

Further information about the OmnAIScope: omnai-scope.auto-intern.de 

#### Context 
The current software version is v1.0.2 and is available on the market as a prerelease.
The entire project was written in C++ and handled as an OpenSource project. 

Link to the old repository: https://github.com/skunkforce/OmnAIView/releases/tag/v1.0.2

![Picture of OmnAIView v1.0.2 ](images/OmnAIViewOldVersion)

With the completion of the newly developed software version v2.0.0, the OmnAIScope (USB oscilloscope) transitions into the release phase.

### About the new major release

The major transition from v1.0.2 to v2.0.0 is the fundamental change in the technology on which the project is built.

In v1.0.2, communication with the OmnAIScopes relies on a closed-source communication library, which is integrated into the project as a submodule, along with a compact C++ software that handles both data acquisition and display within the same codebase.

With v2.0.0, the goal is to establish a modular approach and create a fully open-source project. The communication library will be integrated as a static library into the software's backend. The backend, written in C++, will be responsible for data acquisition, while the frontend, developed in Angular, will serve as the graphical user interface and data visualization component.

The Angular frontend is capable of handling all data sources that implement a certain interface and provide data via a websocket connection. 
Therefore, the frontend can be used completely independent from the USB devices itself to present and analyse data. 