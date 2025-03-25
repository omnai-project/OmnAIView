# OmnAIView

## How to run the angular project 

Clone your fork or the original repository to your local machine: 

```
git clone git@github.com:AI-Gruppe/OmnAIView.git
cd OmnAIView
```

Navigate inside the angular-frontend folder: 
```
cd angular-frontend
```

### Development Mode

To start a local development server run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

### Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

#### Technical infos about the angular project 

    The project was generated using angular v19.1.4. 
    For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## How to run the electron project 
### Setup 
Clone your fork or the original repository to your local machine: 

```
git clone git@github.com:AI-Gruppe/OmnAIView.git
cd OmnAIView
```

Navigate inside the angular-frontend folder: 
```
cd angular-frontend
```

#### Build the angular project 
To build the project run:

```bash
ng build
```

#### Navigate into the electron folder 

```
cd ../electron/
```

### Development mode 

To start a local development application run:

```
npm start 
```

### Build the project 

To build the project run : 

```
npm run make 
```

The output is an installer for the application in : electron/out/make/squirrel.windows/x64/ for windows 

