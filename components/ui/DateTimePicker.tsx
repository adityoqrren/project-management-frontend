"use client"

interface DateTimePickerProps {
  label: string
  value?: string
  onChange: (value: string) => void
  required?: boolean
  disabled?: boolean
  readonly?: boolean // ✅ tambah ini
  error?: string
}
export default function DateTimePicker({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  readonly = false,
  error,
}: DateTimePickerProps) {

  const date = value?.split("T")[0] || ""
  const time = value?.split("T")[1] || ""

  const clear = () => {
    if (required || disabled || readonly) return
    onChange("")
  }

  const isLocked = disabled || readonly

  return (
    <div>
      <div className="flex items-center justify-between text-sm">

        <span className="text-gray-600">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>

        <div
          className={`flex items-center gap-2 ${readonly ? "pointer-events-none" : ""
            }`}
        >

          <input
            type="date"
            value={date}
            onChange={(e) => {
              const newDate = e.target.value
              const newTime = time || "09:00"
              onChange(`${newDate}T${newTime}`)
            }}
            className={`bg-transparent outline-none 
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${readonly ? "cursor-default" : ""}
        `}
          />

          <input
            type="time"
            value={time}
            disabled={disabled}
            readOnly={readonly} // ✅
            onChange={(e) => {
              if (isLocked) return
              const newTime = e.target.value
              // if (!date) return
              onChange(`${date}T${newTime}`)
            }}
            className={`bg-transparent outline-none 
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${readonly ? "cursor-default" : ""}
        `}
          />

          {/* CLEAR BUTTON */}

          <div className="w-5 flex justify-center">

            {!required && value && (
              <button
                onClick={clear}
                disabled={disabled || readonly}
                className="text-gray-500 hover:text-red-500 ml-1 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Clear"
              >
                ✕
              </button>
            )}

          </div>

        </div>

      </div>
      {/* ERROR MESSAGE */}
      {error && (
        <p className="text-xs text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  )
}