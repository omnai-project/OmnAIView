## Core Vision 
The core of OmnAIView is the visualisation and handling of time-series data . 

To make this visualisation available for all dataproviders of timeseries data
the frontend is generated with individual interfaces that should be abstracted to one interface in the long run (see #6).

## Data providers 

The core of the data providers is : 

    - their data can be received via a **websocket** connection 
    - they send timeseries data in the form of : 
        ``` timestamp: x, values : [ y ] ```

For this the first two datasources that are integrated are : 
    1. The (DevDataServer)[https://github.com/AI-Gruppe/OmnAIView-DevDataServer]
    2. The (OmnAIScope DataServer)[https://github.com/AI-Gruppe/OmnAIScope-DataServer]

The (OmnAIScope)[https://omnaiscope.auto-intern.de/] is a small USB-Oscilloscope developed by the Auto-Intern GmbH. The OmnAIScope DataServer provides data from the OmnAIScopes via websocket. 
The DevDataServer provides generated sinus and rectangular waveforms via websocket. 

## The first goal 

In its most simple form, the Frontend provides a graph in which a timeseries is displayed. Data is received from an external provider via a websocket connection 

- it has labeled axes, x in the domain of Datetime, y in the domain of numbers
- the range of the axes adapts to the data
- data is collected from a websocket and transformed into an array of datapoints internally
- the websocket connection is established upon clicking start

In the easiest form, we assume that the users has a OmnAI Scope connected and the backend for collecting data is running and the port is known. The user does not need to configure anything in this scenario. (see #22)

## The first Release 

### The users perspective 

The goal of the first release is an easy application that can be used for analysis in the automobile industry with the OmnAIScope as the main datasource.
It should be an installable application with an icon that can be started via mouse clicks. Preferable an icon on the users desktop. 

#### Userflow 

This should provide an idea on how the userflow should look like: 

Peter the 55 year old mechanic that does not work very often with computers 

Peter has a problem with his car. It seems that something with the mass air flow is defect. The engine control unit does not provide enough information, so he wants to measure the voltage from the mass air flow sensor. He connects the OmnAIScope to the vehicle and then 

1. The OmnAIScope is connected via USB to the Laptop 
2. The application "OmnAIView" is started 
3. Peter can see the start screen of OmnAIView , some simple UI that shows them where to click 
4. Peter starts the measurement ( with or without record settings)
5. Peter is able to see all the data that is received from the datasource with a specific sample rate 
5. Peter stops the measurement 
6. Peter saves the measurement 
7. Peter zooms and searches for specific waveforms 
8. Peter starts an extern analysis on the current data via the UI 
9. Peter receives the analysis 
10. Peter exports the results to show the customer later on why he only had to switch the plastic seal from the mass air flow sensor 


### The developer perspective

From the developer perspective the code for this application is the foundation to integrate all other datasources and analysis without a code mess. 

Therefore the goal is to have: 

1. As small as possible interfaces with a good strategy pattern to integrate different datasources via the datasource selection. 
2. As small as possible interfaces for the analysis with a good strategy pattern, quite similar to the datasource selection . 

This should guarantee that the codebase for the datasources and analysis is seperated from the codebase of the UI functionality. For example: Zooming is only implemented once 
and works the same no matter the datasource used. 

## The final idea

The final vision is an application where the user can visualize, analyze and import/export their data from which ever datasource with whichever analysis they need. 

