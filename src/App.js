import PropTypes from 'prop-types';
import React, { useEffect } from "react";
import { Routes, Route } from 'react-router-dom';
import { connect } from "react-redux";

// Import Routes all
import { userRoutes, authRoutes } from "./routes/allRoutes";

// Import all middleware
import Authmiddleware from "./routes/middleware/Authmiddleware";

// layouts Format
import NonAuthLayout from "./components/NonAuthLayout";

// Import scss
import "./assets/scss/theme.scss";

// Import Firebase Configuration file
// import { initFirebaseBackend } from "./helpers/firebase_helper"

import fakeBackend from "./helpers/AuthType/fakeBackend";

// Activating fake backend
fakeBackend();

// const firebaseConfig = {
//   apiKey: process.env.REACT_APP_APIKEY,
//   authDomain: process.env.REACT_APP_AUTHDOMAIN,
//   databaseURL: process.env.REACT_APP_DATABASEURL,
//   projectId: process.env.REACT_APP_PROJECTID,
//   storageBucket: process.env.REACT_APP_STORAGEBUCKET,
//   messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
//   appId: process.env.REACT_APP_APPID,
//   measurementId: process.env.REACT_APP_MEASUREMENTID,
// }

// init firebase backend
// initFirebaseBackend(firebaseConfig)

const App = () => {
  // Theme ayarlarını localStorage'dan yükle ve DOM'a uygula
  useEffect(() => {
    const loadThemeFromLocalStorage = () => {
      try {
        const savedTheme = localStorage.getItem('arayanvar_theme_settings');
        if (savedTheme) {
          const themeSettings = JSON.parse(savedTheme);
          
          // Layout type
          if (themeSettings.layoutType) {
            document.body.setAttribute("data-layout", themeSettings.layoutType);
          }
          
          // Layout width
          if (themeSettings.layoutWidth) {
            document.body.setAttribute("data-layout-width", themeSettings.layoutWidth);
          }
          
          // Left sidebar theme
          if (themeSettings.leftSideBarTheme) {
            document.body.setAttribute("data-sidebar", themeSettings.leftSideBarTheme);
          }
          
          // Body theme
          if (themeSettings.bodyTheme) {
            document.body.setAttribute("data-bs-theme", themeSettings.bodyTheme);
          }
          
          // Left sidebar type
          if (themeSettings.leftSideBarType) {
            document.body.setAttribute("data-sidebar-size", themeSettings.leftSideBarType);
          }
          
          // Topbar theme
          if (themeSettings.topbarTheme) {
            document.body.setAttribute("data-topbar", themeSettings.topbarTheme);
          }
        }
      } catch (error) {
        console.error('Theme ayarları yüklenirken hata oluştu:', error);
      }
    };

    loadThemeFromLocalStorage();
  }, []);

  return (
    <React.Fragment>
      <Routes>
        <Route>
          {authRoutes.map((route, idx) => (
            <Route
              path={route.path}
              element={
                <NonAuthLayout>
                  {route.component}
                </NonAuthLayout>
              }
              key={idx}
              exact={true}
            />
          ))}
        </Route>

        <Route>
          {userRoutes.map((route, idx) => (
            <Route
              path={route.path}
              element={
                <Authmiddleware>
                  {route.component}
                </Authmiddleware>}
              key={idx}
              exact={true}
            />
          ))}
        </Route>
      </Routes>
    </React.Fragment>
  );
};

App.propTypes = {
  layout: PropTypes.any
};

const mapStateToProps = state => {
  return {
    layout: state.Layout,
  };
};

export default connect(mapStateToProps, null)(App);
