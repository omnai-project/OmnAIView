import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

const config: ForgeConfig = {
  packagerConfig: {
    icon: "./images/icon",
    asar: true,
    extraResource: [
      "./res/omnai_BE/MiniOmni.exe", 
      "./res/omnai_BE/libusb-1.0.dll",
      "./res/omnai_BE/abseil_dll.dll",
      "./res/omnai_BE/libprotobuf.dll"
    ],
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      setupIcon: './images/icon.ico',
      // iconUrl: 'https://url/to/icon.ico', 
      //  # Es sollte hier nach Möglichkeit eine durch euch gehostete .ico Datei auf einem Webserver eingetragen werden.
      //  # Es würde sich empfehlen die Datei aus ./images/icon.ico zu nehmen.
      //  # Diese muss öffentlich erreichbar sein und wird dann zur _Installationszeit_ geladen. Es darf kein file://
      //  # sein. https://js.electronforge.io/interfaces/_electron_forge_maker_squirrel.InternalOptions.SquirrelWindowsOptions.html
      //  # Es steuert das Icon, welches unter Programme zu finden ist.
    }, ["win32"]), 
    new MakerZIP({}, ['darwin']), 
    new MakerRpm({}), 
    new MakerDeb({options: {icon: './images/icon.png'}})],
  plugins: [
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
