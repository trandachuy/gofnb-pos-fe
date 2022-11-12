import React, { useState } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { GOOGLE_API_KEY } from "constants/google.constant";

const { forwardRef, useImperativeHandle } = React;

export const GoogleMapComponent = forwardRef((props, ref) => {
  const { zoom, className } = props;
  const [center, setCenter] = useState({ lat: 10.8131407, lng: 106.6656007 }); ///Default location, we will update get store branch location soon
  const defaultZoom = 15;

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_API_KEY,
  });

  useImperativeHandle(ref, () => ({
    setCenter(center) {
      setCenter(center);
    },
  }));

  return isLoaded ? (
    <GoogleMap mapContainerClassName={className} center={center} zoom={zoom ?? defaultZoom}>
      {center && <Marker position={center}></Marker>}
    </GoogleMap>
  ) : (
    <></>
  );
});
