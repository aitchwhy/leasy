import * as React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/client/lib/utils'
import { Button } from '@/client/components/ui/button'
import { Calendar } from '@/client/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/client/components/ui/popover'

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = 'Pick a date',
  disabled,
  className,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}