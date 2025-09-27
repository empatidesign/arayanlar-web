import PropTypes from 'prop-types';
import React from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { connect } from "react-redux";
import LightData from "./LightData";
import { Row, Col, Card, CardBody, CardTitle, CardSubtitle } from "reactstrap";
//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

const containerStyle = {
  width: '100%',
  height: '300px',
};

const center = {
  lat: 37.778519, lng: -122.40564
};

const second = {
  lat: 40.854885,
  lng: -88.081807,
}

const MapsGoogle = props => {
  const selectedPlace = {}

  const [selected, setSelected] = useState(null);

  const onSelect = (marker) => {
    setSelected(marker);
  };

  document.title = "Google Maps | Veltrix - React Admin & Dashboard Template";
  return (
    <React.Fragment>
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs maintitle="Veltrix" title="Maps" breadcrumbItem="Google Maps" />

          <Row>
            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">Markers</CardTitle>
                  <CardSubtitle className="mb-3">
                    Example of google maps.
                  </CardSubtitle>
                  <div
                    id="gmaps-markers"
                    className="gmaps"
                    style={{ position: "relative" }}
                  >
                    <LoadScript googleMapsApiKey="AIzaSyAbvyBxmMbFhrzP9Z8moyYr6dCr-pzjhBE">
                      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={14}>
                        <Marker position={center} onClick={() => onSelect(center)} />
                        {selected && (
                          <InfoWindow
                            position={selected}
                            onCloseClick={() => setSelected(null)}
                          >
                            <div>
                              <h1>{selectedPlace.name}</h1>
                            </div>
                          </InfoWindow>
                        )}
                      </GoogleMap>
                    </LoadScript>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">Overlays</CardTitle>
                  <CardSubtitle className="mb-3">
                    Example of google maps.
                  </CardSubtitle>
                  <div
                    id="gmaps-overlay"
                    className="gmaps"
                    style={{ position: "relative" }}
                  >
                    <LoadScript googleMapsApiKey="AIzaSyAbvyBxmMbFhrzP9Z8moyYr6dCr-pzjhBE">
                      <GoogleMap mapContainerStyle={containerStyle} center={second} zoom={14}>
                        <Marker position={second} onClick={() => onSelect(second)} />
                        {selected && (
                          <InfoWindow
                            position={selected}
                            onCloseClick={() => setSelected(null)}
                          >
                            <div>
                              <h1>{selectedPlace.name}</h1>
                            </div>
                          </InfoWindow>
                        )}
                      </GoogleMap>
                    </LoadScript>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">Basic</CardTitle>
                  <CardSubtitle className="mb-3">
                    Example of google maps.
                  </CardSubtitle>
                  <div
                    id="gmaps-markers"
                    className="gmaps"
                    style={{ position: "relative" }}
                  >
                   <LoadScript googleMapsApiKey="AIzaSyAbvyBxmMbFhrzP9Z8moyYr6dCr-pzjhBE">
                      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={20}>
                        <Marker position={center} onClick={() => onSelect(center)} />
                        {selected && (
                          <InfoWindow
                            position={selected}
                            onCloseClick={() => setSelected(null)}
                          >
                            <div>
                              <h1>{selectedPlace.name}</h1>
                            </div>
                          </InfoWindow>
                        )}
                      </GoogleMap>
                    </LoadScript>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">Ultra Light</CardTitle>
                  <CardSubtitle className="mb-3">
                    Example of google maps.
                  </CardSubtitle>
                  <div
                    id="gmaps-overlay"
                    className="gmaps"
                    style={{ position: "relative" }}
                  >
                    <LoadScript googleMapsApiKey="AIzaSyAbvyBxmMbFhrzP9Z8moyYr6dCr-pzjhBE">
                      <GoogleMap mapContainerStyle={containerStyle}
                        center={Data?.Data}
                        zoom={14}>
                        <Marker
                          position={Data?.Data}
                          onClick={() => onSelect(Data.Data)} />
                        {selected && (
                          <InfoWindow
                            position={selected}
                            onCloseClick={() => setSelected(null)}
                          >
                            <div>
                              <h1>{selectedPlace.name}</h1>
                            </div>
                          </InfoWindow>
                        )}
                      </GoogleMap>
                    </LoadScript>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </React.Fragment>
  );
};

MapsGoogle.propTypes = {
  google: PropTypes.object
};

export default MapsGoogle