import { Layout } from "antd";
import React, { useEffect } from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import LoadingBar from "react-top-loading-bar";
import { compose } from "redux";
import { store } from "store";
import { calculateUsedTime } from "store/modules/processing/processing.actions";
import { executeAfter } from "utils/helpers";
import PrivateRoute from "./components/private-route";
import routes from "./pages/routes";
import "stylesheets/fnb-styles.scss";
import "stylesheets/main.scss";

function App(props) {
  const ref = React.useRef(null);
  useEffect(() => {
    store.dispatch(calculateUsedTime());
    toggleFullScreen();
    if (props.loading) {
      ref.current.continuousStart();
    } else {
      ref.current.complete();
    }
  }, [props.loading]);

  const getFullScreenElement = () => {
    return (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.nsFullscreenElement
    );
  };

  const toggleFullScreen = () => {
    if (!getFullScreenElement()) {
      document.documentElement.requestFullscreen().catch((err) => {
        executeAfter(1000, () => {
          toggleFullScreen();
        });
      });
    }
  };

  return (
    <Router>
      <LoadingBar color="#ff8c21" ref={ref} />
      <Layout className="fnb-main-bg-color ant-layout ant-layout-has-sider" style={{ height: "100%" }}>
        <Switch>
          {routes.map((route) => {
            const { component: Component, key, path, auth, ...rest } = route;
            if (auth === true) {
              if (route.child.length > 0) {
                return route.child.map((child) => {
                  const { component: Component, ...rest } = child;
                  return (
                    <PrivateRoute
                      t={props.t}
                      key={child.key}
                      route={child}
                      routes={routes}
                      path={child.path}
                      component={Component}
                      parentKey={key}
                      isChild={true}
                      isComponent={child.isComponent}
                      {...rest}
                    />
                  );
                });
              }

              return (
                <PrivateRoute
                  t={props.t}
                  key={key}
                  route={route}
                  routes={routes}
                  path={path}
                  component={Component}
                  isComponent={route.isComponent}
                  signedInUser={props.signedInUser}
                  {...rest}
                />
              );
            } else {
              return <Route t={props.t} key={key} path={path} component={Component} {...rest} />;
            }
          })}
        </Switch>
      </Layout>
    </Router>
  );
}

const mapStateToProps = (state) => {
  return {
    loading: state?.processing?.isDataServiceProcessing || false,
    signedInUser: state?.session?.auth?.user,
  };
};

export default compose(withTranslation("translations"), connect(mapStateToProps))(App);
