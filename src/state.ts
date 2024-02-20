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

type State<T> = { name: T };

type SetupState = State<StateNames.Setup>;

export type InitialState = State<StateNames.Initial> & {
    devices: MediaDevices;
};

type ErrorState = State<StateNames.Error>;

export type States = SetupState | InitialState | ErrorState;

const enum Actors {
    LoadDevices = "LoadDevices",
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

export const stateMachine = setup({
    types: {} as {
        context: States;
    },
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

                        return {
                            name: StateNames.Initial,
                            devices,
                        } as States;
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
