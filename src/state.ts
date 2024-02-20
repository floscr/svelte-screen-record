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

export type States =
    | { name: StateNames.Setup }
    | { name: StateNames.Initial; devices: MediaDevices }
    | { name: StateNames.Recording }
    | { name: StateNames.Finished }
    | { name: Error };

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
