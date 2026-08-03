type IconButtonProps = {
  children: React.ReactNode
}

export default function IconButton({ children }: IconButtonProps) {
  return (
    <button className="p-2 rounded hover:bg-gray-100">
      {children}
    </button>
  )
}