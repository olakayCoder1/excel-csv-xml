"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Download, FileSpreadsheet, FileCode, CheckCircle, AlertCircle } from "lucide-react"
import { useDropzone } from "react-dropzone"
import * as XLSX from "xlsx"

interface ConversionState {
  status: "idle" | "uploading" | "converting" | "completed" | "error"
  progress: number
  fileName?: string
  xmlData?: string
  error?: string
}

export default function ExcelToXmlConverter() {
  const [conversionState, setConversionState] = useState<ConversionState>({
    status: "idle",
    progress: 0,
  })

  const convertExcelToXml = useCallback(async (file: File) => {
    setConversionState({ status: "uploading", progress: 10, fileName: file.name })

    try {
      // Simulate upload progress
      await new Promise((resolve) => setTimeout(resolve, 500))
      setConversionState((prev) => ({ ...prev, status: "converting", progress: 40 }))

      // Read the Excel file
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: "array" })

      // Convert to JSON first
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      setConversionState((prev) => ({ ...prev, progress: 70 }))

      // Convert JSON to XML
      const xmlData = convertJsonToXml(jsonData, sheetName)

      setConversionState((prev) => ({ ...prev, progress: 100 }))

      // Complete conversion
      setTimeout(() => {
        setConversionState({
          status: "completed",
          progress: 100,
          fileName: file.name,
          xmlData,
        })
      }, 500)
    } catch (error) {
      setConversionState({
        status: "error",
        progress: 0,
        error: error instanceof Error ? error.message : "An error occurred during conversion",
      })
    }
  }, [])

  const convertJsonToXml = (data: any[][], sheetName: string): string => {
    if (!data.length) return "<root></root>"

    const headers = data[0] as string[]
    const rows = data.slice(1)

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${sheetName.replace(/\s+/g, "_")}>\n`

    rows.forEach((row, index) => {
      xml += `  <row id="${index + 1}">\n`
      headers.forEach((header, colIndex) => {
        const value = row[colIndex] || ""
        const cleanHeader =
          header
            ?.toString()
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9_]/g, "") || `column_${colIndex}`
        xml += `    <${cleanHeader}>${escapeXml(value?.toString() || "")}</${cleanHeader}>\n`
      })
      xml += `  </row>\n`
    })

    xml += `</${sheetName.replace(/\s+/g, "_")}>`
    return xml
  }

  const escapeXml = (text: string): string => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        convertExcelToXml(file)
      }
    },
    [convertExcelToXml],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    maxFiles: 1,
    disabled: conversionState.status === "converting" || conversionState.status === "uploading",
  })

  const downloadXml = () => {
    if (!conversionState.xmlData || !conversionState.fileName) return

    const blob = new Blob([conversionState.xmlData], { type: "application/xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = conversionState.fileName.replace(/\.(xlsx|xls|csv)$/i, ".xml")
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const resetConverter = () => {
    setConversionState({ status: "idle", progress: 0 })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <FileSpreadsheet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">→</div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <FileCode className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Excel to XML Converter</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Transform your Excel files into XML format instantly
            </p>
          </div>

          {/* Main Card */}
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                File Converter
              </CardTitle>
              <CardDescription>Upload your Excel file (.xlsx, .xls, .csv) and convert it to XML format</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Area */}
              {(conversionState.status === "idle" || conversionState.status === "error") && (
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300
                    ${
                      isDragActive
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105"
                        : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }
                    animate-fade-in
                  `}
                >
                  <input {...getInputProps()} />
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Upload
                        className={`w-8 h-8 text-blue-600 dark:text-blue-400 ${isDragActive ? "animate-bounce" : ""}`}
                      />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {isDragActive ? "Drop your file here" : "Drag & drop your Excel file"}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 mt-1">or click to browse (.xlsx, .xls, .csv)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress */}
              {(conversionState.status === "uploading" || conversionState.status === "converting") && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="font-medium">
                      {conversionState.status === "uploading" ? "Uploading file..." : "Converting to XML..."}
                    </span>
                  </div>
                  <Progress value={conversionState.progress} className="h-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Processing: {conversionState.fileName}</p>
                </div>
              )}

              {/* Success */}
              {conversionState.status === "completed" && (
                <div className="space-y-4 animate-fade-in">
                  <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      Conversion completed successfully! Your XML file is ready for download.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-3">
                    <Button onClick={downloadXml} className="flex-1 bg-green-600 hover:bg-green-700">
                      <Download className="w-4 h-4 mr-2" />
                      Download XML
                    </Button>
                    <Button onClick={resetConverter} variant="outline">
                      Convert Another
                    </Button>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    File: {conversionState.fileName?.replace(/\.(xlsx|xls|csv)$/i, ".xml")}
                  </div>
                </div>
              )}

              {/* Error */}
              {conversionState.status === "error" && (
                <div className="space-y-4 animate-fade-in">
                  <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      {conversionState.error}
                    </AlertDescription>
                  </Alert>
                  <Button onClick={resetConverter} variant="outline" className="w-full bg-transparent">
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features */}
        
        </div>
      </div>
    </div>
  )
}
