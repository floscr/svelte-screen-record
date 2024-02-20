import { fromPromise, setup } from "xstate";

interface ScreenMedia {
    stream: MediaStream;
    recorder: MediaRecorder;
}

interface WebcamMedia {
    stream: MediaStream;
    recorder?: MediaRecorder;
}

const enum StateNames {
    Initial = "Initial",
    DeviceLoader = "DeviceLoader",
    DevicesLoaded = "DevicesLoaded",
    Recording = "Recording",
    Finished = "Finished",
    Error = "Error",
}

type States =
    | { name: StateNames.DeviceLoader }
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
    Restart = "Restart",
    DevicesLoaded = "DevicesLoaded",
    StartRecording = "StartRecording",
    StopRecording = "StopRecording",
    ShowError = "ShowError",
}

const enum Actors {
    LoadDevices = "LoadDevices",
}

export const stateMachine = setup({
    actors: {
        [Actors.LoadDevices]: fromPromise(() => {
            const devices = navigator.mediaDevices.enumerateDevices();

            const webcamStream = navigator.mediaDevices.getUserMedia({
                video: true,
            });

            const screenStream = navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false,
            });

            return Promise.all([devices, webcamStream, screenStream]);
        }),
    },
}).createMachine({
    initial: StateNames.Initial,
    context: {
        name: StateNames.DeviceLoader,
    },
    states: {
        [StateNames.Initial]: {
            invoke: {
                src: Actors.LoadDevices,
                onDone: {
                    target: StateNames.DevicesLoaded,
                    actions: console.log,
                },
                onError: {
                    target: StateNames.Error,
                    actions: console.error,
                },
            },
        },
        [StateNames.DevicesLoaded]: {},
        [StateNames.Error]: {},
    },
});
