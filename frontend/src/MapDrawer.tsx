import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps'
import type { LocationItem } from './types'
import { useEffect, useState } from 'react'

const API_KEY = ''

interface MapDrawerProps {
  selectedLocationItems: LocationItem[]
}
const MapDrawer: React.FC<MapDrawerProps> = ({ selectedLocationItems }) => {
  const [mapCenter, setMapCenter] = useState({
    lat: 40.7695555,
    lng: -73.9823611,
  })

  useEffect(() => {
    if (selectedLocationItems.length == 0) return
    const lastLocationItem = selectedLocationItems.at(-1)
    if (lastLocationItem == undefined) return
    setMapCenter({
      lat: lastLocationItem.Latitude,
      lng: lastLocationItem.Longitude,
    })
  }, [selectedLocationItems])

  return (
    <APIProvider apiKey={API_KEY}>
      <Map defaultZoom={12} center={mapCenter}>
        {selectedLocationItems.map((item) => (
          <Marker
            key={item.Index}
            position={{ lat: item.Latitude, lng: item.Longitude }}
            disableDefaultUI={true}
          />
        ))}
      </Map>
    </APIProvider>
  )
}

export default MapDrawer
