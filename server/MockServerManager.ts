import AsyncStorage from '@react-native-community/async-storage';

export enum MockServerVehicleState {
    Free,
    Booked,
    Running,
}

export default class MockServerManager {
    public static shared = new MockServerManager();

    public get mockVehicleIds() {
        return [
            489,
            549,
            47,
            51,
            438,
            48,
            46,
            2,
            322,
            53,
            49,
            346,
            271,
            231,
            50,
            4,
            13,
            14,
            15,
            16,
            24,
            25,
            26,
            27,
            28,
            29,
            41,
            42,
            44,
            45,
            1,
            23,
            58,
        ];
    }

    private _vehicleState = MockServerVehicleState.Free;
    public get vehicleState(): MockServerVehicleState {
        return this._vehicleState;
    }

    private _bookedVehicleId: number | null = null;
    public get bookedVehicleId() {
        return this._bookedVehicleId;
    }

    private _serverIsReady = false;
    public get serverIsReady() {
        return this._serverIsReady;
    }

    private _allVehiclesDataFree = {};
    public get allVehiclesDataFree(): any {
        return this._allVehiclesDataFree;
    }

    private _userStatusDataBookend = {};
    public get userStatusDataBooked(): any {
        return this._userStatusDataBookend;
    }

    private _userStatusDataFree = {};
    public get userStatusDataFree(): any {
        return this._userStatusDataFree;
    }

    private _actionResponseSuccess = {};
    public get actionResponseSuccess(): any {
        return this._actionResponseSuccess;
    }

    private _actionResponseError = {};
    public get actionResponseError(): any {
        return this._actionResponseError;
    }

    private _routeNotImplementedErrorData = {};
    public get routeNotImplementedErrorData(): any {
        return this._routeNotImplementedErrorData;
    }

    private _vehicleNotFoundErrorData = {};
    public get vehicleNotFoundErrorData(): any {
        return this._vehicleNotFoundErrorData;
    }

    private _vehicleStatusNotCorrectData = {};
    public get vehicleStatusNotCorrectData(): any {
        return this._vehicleStatusNotCorrectData;
    }

    private _vehicleNotBookedData = {};
    public get vehicleNotBookedData(): any {
        return this._vehicleNotBookedData;
    }

    private _internalErrorData = {};
    public get internalErrorData(): any {
        return this._internalErrorData;
    }

    private chaosMonkeyTimer: number | null = null;

    constructor() {
        this.restoreServerState();
        this.setupMockData()
            .then((ready) => {
                this._serverIsReady = ready;
                this.chaosMonkeyTimer = setInterval(this.chaosMonkeyTimerTrigger, 60 * 1000 * 2);
            })
            .catch(() => {
                console.warn('Could not start server');
                this._serverIsReady = false;
            });
    }

    public changeState = (state: MockServerVehicleState, bookedVehicleId: number | null) => {
        this._vehicleState = state;
        this._bookedVehicleId = bookedVehicleId;
        console.log('CHANGED STATE', this.vehicleState, this.bookedVehicleId);
        try {
            this.persistServerState();
        } catch (error) {
            console.warn(
                'Could not save state of the app in local storage, server status is now de-synced',
            );
        }
        return this.vehicleState;
    };

    private setupMockData = async (): Promise<boolean> => {
        const allVehiclesDataFree = require('./mockData/allVehiclesDataFree.json');

        const internalErrorData = require('./mockData/internalErrorData.json');

        const userStatusDataBooked = require('./mockData/userStatusDataBooked.json');

        const userStatusDataFree = require('./mockData/userStatusDataFree.json');

        const actionResponseSuccess = require('./mockData/actionResponseSuccess.json');

        const actionResponseError = require('./mockData/actionResponseError.json');

        const routeNotImplementedErrorData = require('./mockData/routeNotImplementedErrorData.json');

        const vehicleNotFoundErrorData = require('./mockData/vehicleNotFoundErrorData.json');

        const vehicleStatusNotCorrectData = require('./mockData/vehicleStatusNotCorrectData.json');

        const vehicleNotBookedData = require('./mockData/vehicleNotBookedData.json');

        this._allVehiclesDataFree = allVehiclesDataFree;
        this._internalErrorData = internalErrorData;
        this._userStatusDataBookend = userStatusDataBooked;
        this._userStatusDataFree = userStatusDataFree;
        this._actionResponseSuccess = actionResponseSuccess;
        this._actionResponseError = actionResponseError;
        this._routeNotImplementedErrorData = routeNotImplementedErrorData;
        this._vehicleStatusNotCorrectData = vehicleStatusNotCorrectData;
        this._vehicleNotBookedData = vehicleNotBookedData;

        this._vehicleNotFoundErrorData = vehicleNotFoundErrorData;
        return true;
    };

    private persistServerState = () => {
        const commonObject = {
            vehicleState: this.vehicleState,
            bookedVehicleId: this.bookedVehicleId,
        };

        AsyncStorage.setItem('serverState', JSON.stringify(commonObject));
    };

    private restoreServerState = () => {
        AsyncStorage.getItem('serverState')
            .then((stateString) => {
                const stateObject = JSON.parse(stateString!);
                const decodedVehicleState = stateObject?.vehicleState;
                if (Object.values(MockServerVehicleState).includes(decodedVehicleState)) {
                    this._vehicleState = decodedVehicleState as MockServerVehicleState;
                } else {
                    this._vehicleState = MockServerVehicleState.Free;
                }
                this._bookedVehicleId = stateObject?.bookedVehicleId ?? null;
                console.log('RESTORED STATE', this._vehicleState, this._bookedVehicleId);
            })
            .catch((error) => {
                console.log(error);
                this._vehicleState = MockServerVehicleState.Free;
                this._bookedVehicleId = null;
            });
    };

    private chaosMonkeyTimerTrigger = (_event: Event) => {
        if (this.evaluateStatusChangePossibility()) {
            this.changeVehicleStateTrigger();
        }
    };

    private evaluateStatusChangePossibility = () => {
        return Math.random() > 0.9;
    };

    private changeVehicleStateTrigger = () => {
        // Mocking backoffice change
        if (this.vehicleState === MockServerVehicleState.Running) {
            console.log('A monkey changed the vehicle status!');
            this.changeState(MockServerVehicleState.Free, null);
        }
    };
}
