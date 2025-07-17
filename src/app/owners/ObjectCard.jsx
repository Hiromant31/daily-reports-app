const ObjectCard = ({ property, selected }) => {
  return (
    <div
      className={`p-3 mb-3 rounded border cursor-pointer shadow-sm ${
        selected ? 'bg-[#FAE2E2] border-[#FAE2E2]' : 'bg-[#E2EAFA] hover:bg-[#E2EAFA]'
      }`}
    >
      <h3 className="font-bold">{property.description}</h3>
      <p className="text-sm text-gray-600">{property.address}</p>
      <p className="text-xs text-gray-400">{property.next_call_date}</p>
    </div>
  )
}

export default ObjectCard
