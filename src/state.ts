import { match } from "ts-pattern";
import { Err, Ok, Result } from "ts-results";
import {
    assign,
    fromCallback,
    fromPromise,
    setup,
    type EventObject,
} from "xstate";

export const enum StateNames {
    Setup = "Setup",
    Initial = "Initial",
    InitialIdle = "InitialIdle",
    InitialRequestScreenPreview = "InitialRequestScreenPreview",
    ScreenPreviewing = "ScreenPreviewing",
    Recording = "Recording",
    Finished = "Finished",
    Error = "Error",
}

interface MediaDevices {
    audioDevices: MediaDeviceInfo[];
    videoDevices: MediaDeviceInfo[];
    selectedAudioDeviceId?: string;
    selectedVideoDeviceId?: string;
}

export enum ErrorKind {
    MissingPermissions,
    ScreenRecordError,
    Unknown,
}

type State<T> = { name: T };

type SetupState = State<StateNames.Setup>;

export type InitialState = State<StateNames.Initial> & {
    devices: MediaDevices;
    screenStream?: Result<MediaStream, ErrorKind>;
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

export type Events =
    | { type: "ShowScreenPreview" }
    | { type: "ChangeSelectedAudioInputId"; id: string }
    | { type: "ChangeSelectedVideoInputId"; id: string }
    | { type: "StopScreenRecord" };

const enum Actors {
    LoadDevices = "LoadDevices",
    PollForPermissions = "PollForPermissions",
    RecordScreen = "RecordScreen",
    ListenForScreenRecordStop = "ListenForScreenRecordStop",
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
        selectedAudioDeviceId: audioDevices[0].deviceId || undefined,
        selectedVideoDeviceId: videoDevices[0].deviceId || undefined,
    };
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
        [Actors.RecordScreen]: fromPromise(async (): Promise<MediaStream> => {
            const screenStream = navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false,
            });
            return screenStream;
        }),
        [Actors.ListenForScreenRecordStop]: fromCallback<
            EventObject,
            MediaStream
        >(({ input, sendBack }) => {
            input.getVideoTracks()[0].onended = () => {
                sendBack({ type: "StopScreenRecord" });
            };

            return () => {};
        }),
    },
    actions: {
        [Actions.DevicesLoaded]: assign((x: any): States => {
            const devices = collectInputDevices(x.event.output);

            return {
                name: StateNames.Initial,
                devices,
            };
        }),
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
            initial: StateNames.InitialIdle,
            on: {
                ChangeSelectedAudioInputId: {
                    actions: assign(({ context }) => {
                        return {
                            devices: {
                                ...context.devices,
                                selectedAudioDeviceId: event.id,
                            },
                        };
                    }),
                },
                ChangeSelectedVideoInputId: {
                    actions: assign(({ context }) => {
                        return {
                            devices: {
                                ...context.devices,
                                selectedVideoDeviceId: event.id,
                            },
                        };
                    }),
                },
            },
            states: {
                [StateNames.InitialIdle]: {
                    on: {
                        [Actions.ShowScreenPreview]:
                            StateNames.InitialRequestScreenPreview,
                    },
                },
                [StateNames.InitialRequestScreenPreview]: {
                    invoke: {
                        src: Actors.RecordScreen,
                        onDone: {
                            target: StateNames.ScreenPreviewing,
                            actions: assign(({ event }: { event: any }) => {
                                return {
                                    name: StateNames.Initial,
                                    screenStream: Ok(
                                        event.output as MediaStream,
                                    ),
                                };
                            }),
                        },
                        onError: {
                            target: StateNames.InitialIdle,
                            actions: assign(({ event }: { event: any }) => {
                                console.log(event);
                                return {
                                    screenStream: Err(
                                        ErrorKind.ScreenRecordError,
                                    ),
                                };
                            }),
                        },
                    },
                },
                [StateNames.ScreenPreviewing]: {
                    invoke: {
                        src: Actors.ListenForScreenRecordStop,
                        // TODO: Not really sure how to type this
                        input: ({ context }: { context: any }) => {
                            return context.screenStream?.val;
                        },
                    },
                    on: {
                        StopScreenRecord: {
                            target: StateNames.InitialIdle,
                            actions: assign(() => ({
                                screenStream: undefined,
                            })),
                        },
                    },
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
