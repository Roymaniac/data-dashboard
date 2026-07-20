import { Download } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function toCSV(rows: Record<string, unknown>[]): string {
    if (rows.length === 0) return ""
    const headers = Object.keys(rows[0])
    const escape = (val: unknown) => {
        const s = String(val ?? "")
        return s.includes(",") || s.includes('"') || s.includes("\n")
            ? `"${s.replace(/"/g, '""')}"`
            : s
    }
    const lines = [headers.join(",")]
    for (const row of rows) {
        lines.push(headers.map((h) => escape(row[h])).join(","))
    }
    return lines.join("\n")
}

function download(filename: string, content: string, mime: string) {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}

export function ExportButton({
    data,
    filename,
    label,
}: {
    data: Record<string, unknown>[]
    filename: string
    label?: string
}) {
    const exportCSV = () => {
        if (data.length === 0) {
            toast.error("No data to export")
            return
        }
        download(`${filename}.csv`, toCSV(data), "text/csv")
        toast.success(`Exported ${data.length} rows to CSV`)
    }

    const exportJSON = () => {
        if (data.length === 0) {
            toast.error("No data to export")
            return
        }
        download(`${filename}.json`, JSON.stringify(data, null, 2), "application/json")
        toast.success(`Exported ${data.length} rows to JSON`)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                    <Download className="h-4 w-4" />
                    {label ?? "Export"}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportCSV}>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={exportJSON}>Export as JSON</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
