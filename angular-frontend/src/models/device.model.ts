// Model description of devices
interface Color {
    r: number;
    g: number;
    b: number;
}

export interface Device {
    uuid: string;
    color: Color;
}

interface RawDevice {
    UUID: string;
}

interface RawColor {
    color: Color;
}

export interface DeviceListResponse {
    devices: RawDevice[];
    colors: RawColor[];
}