import { ApplicationInsights, SeverityLevel } from "@microsoft/applicationinsights-web";
import { ReactPlugin, withAITracking } from "@microsoft/applicationinsights-react-js";
import { globalHistory } from "@reach/router";

const reactPlugin = new ReactPlugin();
const ai = new ApplicationInsights({
  config: {
    instrumentationKey: process.env.REACT_APP_INSTRUMENTATION_KEY,
    extensions: [reactPlugin],
    extensionConfig: {
      [reactPlugin.identifier]: { history: globalHistory },
    },
    loggingLevelTelemetry: 1,
    disableFetchTracking: false,
    enableAutoRouteTracking: true,
  },
});

if (process.env.REACT_APP_ENV !== "local") {
  ai.loadAppInsights();
}

ai.appInsights.addTelemetryInitializer((envelope) => {
  envelope.tags["ai.cloud.role"] = process.env.REACT_APP_AI_ROLE;
  envelope.tags["ai.cloud.roleInstance"] = process.env.REACT_APP_AI_ROLE_INSTANCE;
  envelope.data.timeNow = Date(Date.now()).toString();
});

const logService = {
  console: function (message, data, options) {
    let opts = options || {};
    if (opts.enableLog) {
      let prefix = opts.prefix || "DEV_LOG";
      let color = opts.color || "blue";
      console.log("%c [%s] %s %O", `color: ${color}`, prefix, message, data || {});
    }
  },
  trackException: function (msg, err, options) {
    if (process.env.REACT_APP_ENV === "local") {
      this.console(msg, err, options);
    } else {
      ai.appInsights.trackException({ error: err, severityLevel: SeverityLevel.Error });
    }
  },
  trackTrace: function (msg, options) {
    if (process.env.REACT_APP_ENV === "local") {
      this.console(msg, null, options);
    } else {
      ai.appInsights.trackTrace({ message: msg, severityLevel: SeverityLevel.Information });
    }
  },
};

export default (Component) => withAITracking(reactPlugin, Component);
export { logService };
