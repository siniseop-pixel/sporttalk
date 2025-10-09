export default function AdSlot({ id, className="" }) {
  return (
    <div className={`w-full min-h-24 border rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 ${className}`}>
      AD SLOT: {id}
    </div>
  )
}
