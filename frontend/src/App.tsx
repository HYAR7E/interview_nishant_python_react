import { useState } from 'react'
import FileUploader from './FileUploader'
import GeolocationList from './GeolocationList'
import MapDrawer from './MapDrawer'
import type { LocationItem } from './types'

const CarrierReportGeolocationApp: React.FC = () => {
  const [filename, setFilename] = useState<string>(
    localStorage.getItem('file_id') || ''
  )
  const [selectedLocationItems, setSelectedCoords] = useState<LocationItem[]>(
    []
  )

  const toggleLocationItem = (newItem: LocationItem) => {
    if (selectedLocationItems.find((item) => item.Index == newItem.Index)) {
      // Remove item
      newItem.selected = false
      setSelectedCoords((items) =>
        items.filter((item) => item.Index !== newItem.Index)
      )
    } else {
      // Add item
      newItem.selected = true
      setSelectedCoords((items) => [...items, newItem])
    }
  }

  return (
    <div className="w-full h-screen flex flex-row">
      <div className="flex flex-col w-1/4 p-5 gap-5 border-r-2 border-r-black">
        <FileUploader setFilename={setFilename} />
        <hr />
        <GeolocationList
          filename={filename}
          toggleLocationItem={toggleLocationItem}
        />
      </div>
      <div className="flex w-3/4 h-full">
        <MapDrawer selectedLocationItems={selectedLocationItems} />
      </div>
    </div>
  )
}

export default CarrierReportGeolocationApp
