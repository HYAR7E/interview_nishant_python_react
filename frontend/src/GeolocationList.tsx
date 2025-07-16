import { useEffect, useRef, useState } from 'react'
import type { LocationItem } from './types'
import GeolocationItem from './GeolocationItem'

interface GeolocationListProps {
  filename: string
  toggleLocationItem: (item: LocationItem) => void
}
const GeolocationList: React.FC<GeolocationListProps> = ({
  filename,
  toggleLocationItem,
}) => {
  const fileIdInput = useRef<HTMLInputElement>(null)
  const startDateInput = useRef<HTMLInputElement>(null)
  const endDateInput = useRef<HTMLInputElement>(null)
  const [locationPoints, setLocationPoints] = useState<LocationItem[]>([])

  const fetchGeolocationInRage = () => {
    if (
      !startDateInput.current ||
      !endDateInput.current ||
      !fileIdInput.current
    ) {
      return
    }
    const fileId = fileIdInput.current.value
    const startDateRange = startDateInput.current.value
    const endDateRange = endDateInput.current.value
    fetch(
      `http://127.0.0.1:5000/mobile_carrier/location/${fileId}?start=${startDateRange}&end=${endDateRange}`
    ).then((response) =>
      response.json().then((data) => setLocationPoints(data))
    )
  }

  useEffect(() => {
    if (!fileIdInput.current) return
    fileIdInput.current.value = filename
    fetchGeolocationInRage()
  }, [filename])

  return (
    <div className="flex flex-col h-10/12 gap-5">
      Get geolocation in range:
      <div className="flex flex-col">
        File ID:
        <input type="text" className="ring-1" ref={fileIdInput} />
        From:
        <input
          type="date"
          className="ring-1"
          defaultValue="2022-02-08"
          ref={startDateInput}
        />
        To:
        <input
          type="date"
          className="ring-1"
          defaultValue="2022-02-08"
          ref={endDateInput}
        />
        <button
          className="px-2 ring-1 bg-slate-200"
          onClick={fetchGeolocationInRage}
        >
          Search
        </button>
      </div>
      <div className="flex flex-col gap-2 grow h-full overflow-y-auto">
        {locationPoints.map((locationItem) => (
          <GeolocationItem
            locationItem={locationItem}
            toggleLocationItem={toggleLocationItem}
          />
        ))}
      </div>
    </div>
  )
}

export default GeolocationList
