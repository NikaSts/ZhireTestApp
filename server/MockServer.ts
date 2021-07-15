import fetchMock from 'fetch-mock';
import MockServerManager, { MockServerVehicleState } from './MockServerManager';
import delay from 'delay';

const baseUrl = 'https://evaluation.api.2hire.io/v4/user';

const readMockData = (type: DataType, shouldFail = false) => {
    switch (type) {
        case DataType.AllVehicles:
            if (
                MockServerManager.shared.vehicleState ===
                MockServerVehicleState.Free
            ) {
                return MockServerManager.shared.allVehiclesDataFree;
            } else {
                return {
                    ...MockServerManager.shared.allVehiclesDataFree,
                    data: MockServerManager.shared.allVehiclesDataFree.data
                        .filter(
                            (elem: any) =>
                                elem.id ===
                                MockServerManager.shared.bookedVehicleId,
                        )
                        .map((elem: any) => {
                            return {
                                ...elem,
                                status:
                                    MockServerManager.shared.vehicleState ===
                                    MockServerVehicleState.Booked
                                        ? 'booked'
                                        : 'running',
                            };
                        }),
                };
            }
        case DataType.UserStatus:
            if (
                MockServerManager.shared.vehicleState ===
                MockServerVehicleState.Free
            ) {
                return MockServerManager.shared.userStatusDataFree;
            } else {
                return {
                    ...MockServerManager.shared.userStatusDataBooked,
                    data: {
                        ...MockServerManager.shared.userStatusDataBooked.data,
                        Vehicle: {
                            ...MockServerManager.shared.allVehiclesDataFree.data.filter(
                                (elem: any) =>
                                    elem.id ===
                                    MockServerManager.shared.bookedVehicleId,
                            )[0],
                            status:
                                MockServerManager.shared.vehicleState ===
                                MockServerVehicleState.Booked
                                    ? 'booked'
                                    : 'running',
                        },
                    },
                };
            }
        case DataType.ActionResponse:
            if (!shouldFail) {
                return MockServerManager.shared.actionResponseSuccess;
            } else {
                // Mocking a vehicle error
                return MockServerManager.shared.actionResponseError;
            }
        case DataType.VehicleNotFound:
            return MockServerManager.shared.vehicleNotFoundErrorData;
        case DataType.RouteNotImplemented:
            return MockServerManager.shared.routeNotImplementedErrorData;
        case DataType.VehicleStatusNotCorrect:
            return MockServerManager.shared.vehicleStatusNotCorrectData;
        case DataType.VehicleNotBooked:
            return MockServerManager.shared.vehicleNotBookedData;
        case DataType.InternalError:
            return MockServerManager.shared.internalErrorData;
    }
};

enum DataType {
    AllVehicles,
    UserStatus,
    ActionResponse,
    RouteNotImplemented,
    VehicleStatusNotCorrect,
    VehicleNotFound,
    VehicleNotBooked,
    InternalError,
}

export const startMock = () => {
    fetchMock.config.warnOnFallback = false;
    fetchMock.config.fallbackToNetwork = true;
    fetchMock.config.overwriteRoutes = true;

    const concatenatedIds = MockServerManager.shared.mockVehicleIds.join('|');
    const vehiclesBasePath = `${baseUrl}/api/personal/vehicle/(${concatenatedIds})`;

    fetchMock
        .get(
            `${baseUrl}/api/sharing/vehicle`,
            {},
            {
                response: async () => {
                    await delay.range(0, 1000);
                    return MockServerManager.shared.serverIsReady
                        ? {
                              status: 200,
                              body: readMockData(DataType.AllVehicles),
                          }
                        : {
                              status: 500,
                              body: readMockData(DataType.InternalError),
                          };
                },
            },
        )
        .get(
            `${baseUrl}/api/user/status`,
            {},
            {
                response: async () => {
                    await delay.range(0, 1000);
                    return MockServerManager.shared.serverIsReady
                        ? {
                              status: 200,
                              body: readMockData(DataType.UserStatus),
                          }
                        : {
                              status: 500,
                              body: readMockData(DataType.InternalError),
                          };
                },
            },
        )
        .put(
            RegExp(`${vehiclesBasePath}/start`),
            {},
            {
                response: async url => {
                    await delay.range(2000, 6000);
                    const regex = RegExp('([0-9]+)/(?:start|stop|book)');
                    const nanOrVid = Number(regex.exec(url)?.[1] ?? 0);
                    const vid = Number.isNaN(nanOrVid) ? 0 : nanOrVid;
                    return MockServerManager.shared.serverIsReady
                        ? MockServerManager.shared.vehicleState !==
                          MockServerVehicleState.Booked
                            ? {
                                  status: 409,
                                  body: readMockData(
                                      DataType.VehicleStatusNotCorrect,
                                  ),
                              }
                            : vid !== MockServerManager.shared.bookedVehicleId
                            ? {
                                  status: 409,
                                  body: readMockData(DataType.VehicleNotBooked),
                              }
                            : {
                                  status: 200,
                                  body: (() => {
                                      const shouldFail = Math.random() > 0.95;
                                      const temp = readMockData(
                                          DataType.ActionResponse,
                                          shouldFail,
                                      );
                                      MockServerManager.shared.changeState(
                                          shouldFail
                                              ? MockServerVehicleState.Booked
                                              : MockServerVehicleState.Running,
                                          vid,
                                      );
                                      return temp;
                                  })(),
                              }
                        : {
                              status: 500,
                              body: readMockData(DataType.InternalError),
                          };
                },
            },
        )
        .put(
            RegExp(`${vehiclesBasePath}/stop`),
            {},
            {
                response: async url => {
                    await delay.range(2000, 6000);
                    const regex = RegExp('([0-9]+)/(?:start|stop|book)');
                    const nanOrVid = Number(regex.exec(url)?.[1] ?? 0);
                    const vid = Number.isNaN(nanOrVid) ? 0 : nanOrVid;
                    return MockServerManager.shared.serverIsReady
                        ? MockServerManager.shared.vehicleState !==
                          MockServerVehicleState.Running
                            ? {
                                  status: 409,
                                  body: readMockData(
                                      DataType.VehicleStatusNotCorrect,
                                  ),
                              }
                            : vid !== MockServerManager.shared.bookedVehicleId
                            ? {
                                  status: 409,
                                  body: readMockData(DataType.VehicleNotBooked),
                              }
                            : {
                                  status: 200,
                                  body: (() => {
                                      const shouldFail = Math.random() > 0.95;
                                      const temp = readMockData(
                                          DataType.ActionResponse,
                                          shouldFail,
                                      );
                                      MockServerManager.shared.changeState(
                                          shouldFail
                                              ? MockServerVehicleState.Running
                                              : MockServerVehicleState.Free,
                                          shouldFail
                                              ? MockServerManager.shared
                                                    .bookedVehicleId
                                              : null,
                                      );
                                      return temp;
                                  })(),
                              }
                        : {
                              status: 500,
                              body: readMockData(DataType.InternalError),
                          };
                },
            },
        )
        .put(
            RegExp(`${vehiclesBasePath}/book`),
            {},
            {
                response: async url => {
                    await delay.range(2000, 6000);
                    const regex = RegExp('([0-9]+)/(?:start|stop|book)');
                    const nanOrVid = Number(regex.exec(url)?.[1] ?? 0);
                    const vid = Number.isNaN(nanOrVid) ? 0 : nanOrVid;
                    return MockServerManager.shared.serverIsReady
                        ? MockServerManager.shared.vehicleState !==
                          MockServerVehicleState.Free
                            ? {
                                  status: 409,
                                  body: readMockData(
                                      DataType.VehicleStatusNotCorrect,
                                  ),
                              }
                            : {
                                  status: 200,
                                  body: (() => {
                                      const shouldFail = Math.random() > 0.95;
                                      const temp = readMockData(
                                          DataType.ActionResponse,
                                          shouldFail,
                                      );
                                      MockServerManager.shared.changeState(
                                          shouldFail
                                              ? MockServerVehicleState.Free
                                              : MockServerVehicleState.Booked,
                                          shouldFail ? null : vid,
                                      );
                                      return temp;
                                  })(),
                              }
                        : {
                              status: 500,
                              body: readMockData(DataType.InternalError),
                          };
                },
            },
        )
        .put(RegExp(`${baseUrl}/api/personal/vehicle/[0-9]+/book`), {
            status: 404,
            body: readMockData(DataType.VehicleNotFound),
        })
        .put(RegExp(`${baseUrl}/api/personal/vehicle/[0-9]+/start`), {
            status: 404,
            body: readMockData(DataType.VehicleNotFound),
        })
        .put(RegExp(`${baseUrl}/api/personal/vehicle/[0-9]+/stop`), {
            status: 404,
            body: readMockData(DataType.VehicleNotFound),
        })
        .mock(RegExp(`${baseUrl}*`), {
            status: 404,
            body: readMockData(DataType.RouteNotImplemented),
        });
};
