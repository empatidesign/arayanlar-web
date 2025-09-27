import React, { useState } from "react";

import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Container,
} from "reactstrap";
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

//Lightbox
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import ModalVideo from "react-modal-video";
import "react-modal-video/scss/modal-video.scss";

// import image
import img1 from "../../assets/images/small/img-1.jpg";
import img2 from "../../assets/images/small/img-2.jpg";
import img3 from "../../assets/images/small/img-3.jpg";
import img4 from "../../assets/images/small/img-4.jpg";
import img5 from "../../assets/images/small/img-5.jpg";
import img6 from "../../assets/images/small/img-6.jpg";
import img7 from "../../assets/images/small/img-7.jpg";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

const images = [img1, img2, img3, img4, img5, img6]
const images1 = [img3, img7];

const LoadingContainer = () => <div>Loading...</div>;

const UiLightbox = (props) => {

  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEffects, setisEffects] = useState(false);
  const [photoIndex, setphotoIndex] = useState(0);
  const [isGallery, setisGallery] = useState(false);
  const [isFits, setisFits] = useState(0);
  const [isGalleryZoom, setisGalleryZoom] = useState(false);
  const [isOpen, setisOpen] = useState(false)
  const [isOpen1, setisOpen1] = useState(false)
  const [map, setMap] = useState(false);
  function tog_map() {
    setMap(!map);
  }

  const containerStyle = {
    width: '100%',
    height: '300px',
  };

  const center = {
    lat: 37.778519, lng: -122.40564
  };

  const selectedPlace = {};

  const [selected, setSelected] = useState(null);

  const onSelect = (marker) => {
    setSelected(marker);
  };

  document.title = "Lightbox | Veltrix - React Admin & Dashboard Template";
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid={true}>
          <Breadcrumbs maintitle="Veltrix" title="UI Elements" breadcrumbItem="Lightbox" />

          {open && (
            <Lightbox
              open={open}
              close={() => setOpen(false)}
              index={currentIndex}
              slides={images.map((image) => ({ src: image }))}
            />
          )}

          {isEffects && (
            <Lightbox
              open={isEffects}
              close={() => setisEffects(false)}
              index={currentIndex}
              slides={images.map((image) => ({ src: image }))}
            />
          )}


          {isGallery && (
            <Lightbox
              open={isGallery}
              close={() => setisGallery(false)}
              index={photoIndex}
              slides={images.map((image) => ({ src: image }))}
            />
          )}

          {isGalleryZoom && (
            <Lightbox
              open={isGalleryZoom}
              close={() => setisGalleryZoom(false)}
              index={isFits}
              slides={images1.map((image) => ({ src: image }))}
            />
          )}

          <Row>
            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">Single image lightbox</CardTitle>
                  <p className="card-title-desc">
                    Three simple popups with different scaling settings.
                  </p>
                  <Row>
                    <Col className="col-6">
                      <div>
                        <h5 className="mt-0 font-size-14 m-b-15">
                          Fits (Horz/Vert)
                        </h5>
                        <img
                          onClick={() => {
                            setOpen(true);
                            setCurrentIndex(1);
                          }}
                          className="img-fluid"
                          alt="Veltrix"
                          src={img2}
                          width="145"
                        />
                      </div>
                    </Col>
                    <Col className="col-6">
                      <div>
                        <h5 className="mt-0 font-size-14">Effects</h5>
                        <img
                          onClick={() => {
                            setisEffects(true);
                          }}
                          className="img-fluid"
                          alt=""
                          src={img3}
                          width="75"
                        />

                        <CardText className="mt-2 mb-0 text-muted">
                          No gaps, zoom animation, close icon in top-right
                          corner.
                        </CardText>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">Lightbox gallery</CardTitle>
                  <p className="card-title-desc">
                    In this example lazy-loading of images is enabled for the
                    next image based on move direction.{" "}
                  </p>
                  <div className="popup-gallery d-flex flex-wrap">
                    <div className="img-fluid float-left">
                      <img
                        src={img1}
                        onClick={() => {
                          setisGallery(true);
                          setisFits(0);
                        }}
                        alt=""
                        width="120"
                      />
                    </div>
                    <div className="img-fluid float-left">
                      <img
                        src={img2}
                        onClick={() => {
                          setisGallery(true);
                          setphotoIndex(1);
                        }}
                        alt=""
                        width="120"
                      />
                    </div>
                    <div className="img-fluid float-left">
                      <img
                        src={img3}
                        onClick={() => {
                          setisGallery(true);
                          setphotoIndex(2);
                        }}
                        alt=""
                        width="120"
                      />
                    </div>
                    <div className="img-fluid float-left">
                      <img
                        src={img4}
                        onClick={() => {
                          setisGallery(true);
                          setphotoIndex(3);
                        }}
                        alt=""
                        width="120"
                      />
                    </div>
                    <div className="img-fluid float-left">
                      <img
                        src={img5}
                        onClick={() => {
                          setisGallery(true);
                          setphotoIndex(4);
                        }}
                        alt=""
                        width="120"
                      />
                    </div>
                    <div className="img-fluid float-left">
                      <img
                        src={img6}
                        onClick={() => {
                          setisGallery(true);
                          setphotoIndex(5);
                        }}
                        alt=""
                        width="120"
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">Zoom Gallery</CardTitle>
                  <p className="card-title-desc">
                    Zoom effect works only with images.
                  </p>

                  <div className="zoom-gallery">
                    <img
                      src={img3}
                      className="float-left"
                      onClick={() => {
                        setisGalleryZoom(true);
                        setphotoIndex(0);
                      }}
                      alt=""
                      width="275"
                    />
                    <img
                      src={img7}
                      className="float-left"
                      onClick={() => {
                        setisGalleryZoom(true);
                        setphotoIndex(1);
                      }}
                      alt=""
                      width="275"
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">Popup with video or map</CardTitle>
                  <p className="card-title-desc">
                    In this example lazy-loading of images is enabled for the
                    next image based on move direction.{" "}
                  </p>

                  <Row>
                    <Col>
                      <Button
                        className="btn btn-secondary me-1"
                        onClick={() => {
                          setisOpen(!isOpen);
                        }}
                      >
                        Open YouTube Video
                      </Button>{" "}
                      <Button
                        className="btn btn-secondary me-1"
                        onClick={() => {
                          setisOpen1(!isOpen1);
                        }}
                      >
                        Open Vimeo Video
                      </Button>{" "}
                      <Button
                        onClick={() => {
                          tog_map();
                        }}
                        className="popup-gmaps btn btn-secondary mo-mb-2">
                        Open Google Map
                      </Button>

                      <ModalVideo
                        videoId="L61p2uyiMSo"
                        channel="youtube"
                        isOpen={isOpen}
                        onClose={() => {
                          setisOpen(!isOpen);
                        }}
                      />
                      <ModalVideo
                        videoId="L61p2uyiMSo"
                        channel="youtube"
                        isOpen={isOpen1}
                        onClose={() => {
                          setisOpen1(false);
                        }}
                      />
                      <Modal
                        centered
                        isOpen={map}
                        size="lg"
                        toggle={() => {
                          tog_map();
                        }}
                      >
                        <ModalHeader toggle={tog_map}>
                          Google Map
                        </ModalHeader>
                        <ModalBody>
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
                        </ModalBody>
                      </Modal>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default UiLightbox;