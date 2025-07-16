import type { LocationItem } from './types'

interface GeolocationItemProps {
  locationItem: LocationItem
  toggleLocationItem: (item: LocationItem) => void
}
const GeolocationItem: React.FC<GeolocationItemProps> = ({
  locationItem,
  toggleLocationItem,
}) => {
  const itemDateUTC = new Date(locationItem.UTCDateTime)
  const itemDateStr = `${itemDateUTC.toLocaleDateString()} ${String(
    itemDateUTC.getHours()
  ).padStart(2, '0')}:${String(itemDateUTC.getMinutes()).padStart(2, '0')} UTC`

  const getConfidenceColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-300'
    if (percentage >= 50) return 'bg-yellow-300'
    return 'bg-red-300'
  }

  const toggleItemSelection = () => {
    toggleLocationItem(locationItem)
  }

  return (
    <div
      className="w-full flex flex-row justify-between items-center group cursor-pointer"
      onClick={toggleItemSelection}
    >
      <span className="flex flex-row gap-2">
        <span
          className={`${getConfidenceColor(
            locationItem.Confidence
          )} flex text-xs font-bold w-10 h-8 p-1`}
        >
          {locationItem.Confidence}%
        </span>
        <span className={locationItem.selected ? 'underline' : ''}>
          {locationItem.State} - {locationItem.City}
        </span>
      </span>
      <span className="text-sm bg-slate-200 px-2">{itemDateStr}</span>
    </div>
  )
}

export default GeolocationItem
