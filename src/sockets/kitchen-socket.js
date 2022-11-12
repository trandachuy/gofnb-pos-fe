const { HubConnectionBuilder, LogLevel } = require("@microsoft/signalr");

const kitchenSocket = new HubConnectionBuilder()
  .withUrl(`${process.env.REACT_APP_ROOT_DOMAIN}kitchen-session`)
  .configureLogging(LogLevel.Information)
  .build();

export default kitchenSocket;
