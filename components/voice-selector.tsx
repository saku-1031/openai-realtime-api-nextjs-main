import { Check, Mic2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react"

const voices = [
  {
    value: "alloy",
    label: "Alloy",
    description: "落ち着いた声色",
  },
  {
    value: "echo",
    label: "Echo",
    description: "クリアな声色",
  },
  {
    value: "fable",
    label: "Fable",
    description: "表現豊かな声色",
  },
  {
    value: "onyx",
    label: "Onyx",
    description: "力強い声色",
  },
  {
    value: "nova",
    label: "Nova",
    description: "親しみやすい声色",
  },
  {
    value: "shimmer",
    label: "Shimmer",
    description: "明るい声色",
  },
] as const

export function VoiceSelector({
  value,
  onValueChange,
}: {
  value: string
  onValueChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selectedVoice = voices.find((voice) => voice.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between border-2"
        >
          <div className="flex items-center gap-2">
            <Mic2 className="h-4 w-4" />
            <span>{selectedVoice?.label || "音声を選択"}</span>
          </div>
          <span className="text-xs text-muted-foreground ml-2">
            {selectedVoice?.description}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="音声を検索..." />
          <CommandEmpty>見つかりませんでした。</CommandEmpty>
          <CommandGroup>
            {voices.map((voice) => (
              <CommandItem
                key={voice.value}
                value={voice.value}
                onSelect={(currentValue) => {
                  onValueChange(currentValue)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === voice.value ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span>{voice.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {voice.description}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
