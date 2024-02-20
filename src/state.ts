import { match } from "ts-pattern";
import { assign, fromPromise, setup } from "xstate";

interface ScreenMedia {
    stream: MediaStream;
    recorder: MediaRecorder;
}

interface WebcamMedia {
    stream: MediaStream;
    recorder?: MediaRecorder;
}

export const enum StateNames {
    Setup = "Setup",
    Initial = "Initial",
    Error = "Error",

    Recording = "Recording",
    Finished = "Finished",
}

export type States =
    | { name: StateNames.Setup }
    | { name: StateNames.Initial; devices: MediaDeviceInfo[] }
    | {
          name: StateNames.DevicesLoaded;
          screenMedia: ScreenMedia;
          webcamMedia: WebcamMedia;
      }
    | {
          name: StateNames.Recording;
          screenMedia: ScreenMedia;
          webcamMedia: WebcamMedia;
      }
    | {
          name: StateNames.Recording;
          screenMedia: ScreenMedia;
          webcamMedia: WebcamMedia;
      }
    | {
          name: Error;
      };

const enum Events {
    DevicesLoaded = "DevicesLoaded",

    Preview = "Preview",
    Restart = "Restart",
    StartRecording = "StartRecording",
    StopRecording = "StopRecording",
    ShowError = "ShowError",
}

const enum Actors {
    LoadDevices = "LoadDevices",
}

// interface InputDevice {
//     selected?: string,
//     devices: Set<string, MediaDeviceInfo>,
// }

// interface InputDevices {
//     audio: InputDevice,
//     video: InputDevice,
// }

const collectInputDevices = function (devices: MediaDeviceInfo[]) {
    const audioDevices = [];
    const videoDevices = [];

    devices.forEach(function (device) {
        match(device)
            .with({ kind: "audioinput" }, (x) => audioDevices.push(x))
            .with({ kind: "videoinput" }, (x) => videoDevices.push(x))
            .otherwise(() => null);
    });

    return {
        audioDevices,
        videoDevices,
    };
};

export const stateMachine = setup({
    actors: {
        [Actors.LoadDevices]: fromPromise(async () => {
            const devices = await navigator.mediaDevices.enumerateDevices();

            return devices;
        }),
    },
}).createMachine({
    initial: StateNames.Setup,
    context: {
        name: StateNames.Setup,
    },
    states: {
        [StateNames.Setup]: {
            invoke: {
                src: Actors.LoadDevices,
                onDone: {
                    target: StateNames.Initial,
                    actions: assign(({ event }) => {
                        const devices = collectInputDevices(event.output);

                        console.log("devices", devices);

                        return {
                            name: StateNames.Initial,
                            devices,
                        };
                    }),
                },
                onError: {
                    target: StateNames.Error,
                    actions: console.error,
                },
            },
        },
        [StateNames.Initial]: {},
        [StateNames.Error]: {},
    },
});
