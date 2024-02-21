import { match } from "ts-pattern";
import { assign, fromPromise, setup } from "xstate";

export const enum StateNames {
    Setup = "Setup",
    Initial = "Initial",
    Recording = "Recording",
    Finished = "Finished",
    Error = "Error",
}

interface MediaDevices {
    audioDevices: MediaDeviceInfo[];
    videoDevices: MediaDeviceInfo[];
}

export enum ErrorKind {
    MissingPermissions,
    Unknown,
}

type State<T> = { name: T };

type SetupState = State<StateNames.Setup>;

export type InitialState = State<StateNames.Initial> & {
    devices: MediaDevices;
};

export type ErrorState = State<StateNames.Error> & {
    kind: ErrorKind;
    error: Error;
};

export type States = SetupState | InitialState | ErrorState;

export const enum Actions {
    ShowScreenPreview = "ShowScreenPreview",
    DevicesLoaded = "DevicesLoaded",
}

export type Events = { type: "ShowScreenPreview" };

const enum Actors {
    LoadDevices = "LoadDevices",
    PollForPermissions = "PollForPermissions",
}

const collectInputDevices = function (
    devices: MediaDeviceInfo[],
): MediaDevices {
    const audioDevices: MediaDeviceInfo[] = [];
    const videoDevices: MediaDeviceInfo[] = [];

    devices.forEach(function (device) {
        match(device)
            .with({ kind: "audioinput" }, (x) => audioDevices.push(x))
            .with({ kind: "videoinput" }, (x) => videoDevices.push(x))
            .otherwise(() => null);
    });

    return {
        audioDevices,
        videoDevices,
    } as MediaDevices;
};

function pollForDevices(
    interval = 1000,
    tries = Infinity,
    tryCount = 0,
): Promise<MediaDeviceInfo[]> {
    return new Promise((resolve, reject) => {
        const checkDevices = () => {
            if (tryCount < tries) {
                return navigator.mediaDevices
                    .getUserMedia({
                        audio: true,
                        video: true,
                    })
                    .then((stream) => {
                        stream.getTracks().forEach((track) => {
                            track.stop();
                        });
                        return navigator.mediaDevices.enumerateDevices();
                    })
                    .then((devices: MediaDeviceInfo[]) => resolve(devices))
                    .catch(() => {
                        setTimeout(checkDevices, interval, tries, tryCount++);
                    });
            } else {
                reject("Max tries reached");
            }
        };

        return checkDevices();
    });
}

export const stateMachine = setup({
    types: {} as {
        context: States;
        events: Events;
    },
    actors: {
        [Actors.LoadDevices]: fromPromise(
            async (): Promise<MediaDeviceInfo[]> => {
                const devices = await pollForDevices(0, 1);
                return devices;
            },
        ),
        [Actors.PollForPermissions]: fromPromise(
            async (): Promise<MediaDeviceInfo[]> => {
                const devices = await pollForDevices();
                return devices;
            },
        ),
    },
    actions: {
        [Actions.DevicesLoaded]: assign((x: any): States => {
            const devices = collectInputDevices(x.event.output);

            return {
                name: StateNames.Initial,
                devices,
            };
        }),
        [Actions.ShowScreenPreview]: () => {
            console.log("Show Preview");
        },
    },
}).createMachine({
    initial: StateNames.Setup,
    context: {
        name: StateNames.Setup,
    },
    states: {
        [StateNames.Setup]: {
            description: "Load input devices (webcam, microphone)",
            invoke: {
                src: Actors.LoadDevices,
                onDone: {
                    description:
                        "Devices were successfully loaded, display the initial UI",
                    target: StateNames.Initial,
                    actions: assign(({ event }): States => {
                        const devices = collectInputDevices(event.output);

                        return {
                            name: StateNames.Initial,
                            devices,
                        };
                    }),
                },
                onError: {
                    target: StateNames.Error,
                    actions: assign(({ event }): States => {
                        return {
                            name: StateNames.Error,
                            kind: ErrorKind.MissingPermissions,
                            error: event.error as Error,
                        };
                    }),
                },
            },
        },
        [StateNames.Initial]: {
            on: {
                [Actions.ShowScreenPreview]: {
                    actions: Actions.ShowScreenPreview,
                },
            },
        },
        [StateNames.Error]: {
            invoke: {
                src: Actors.PollForPermissions,
                onDone: {
                    target: StateNames.Initial,
                    actions: Actions.DevicesLoaded,
                },
            },
        },
    },
});
