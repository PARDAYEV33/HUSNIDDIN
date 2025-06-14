"use client"

import type React from "react"

import { useState } from "react"
import { FileText, Users, BarChart3, Download, Search, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PatientData {
  admissionDate: string
  patientName: string
  birthYear: string
  gender: string
  ageGroup: string
  phoneNumber: string
  medicalConditions: {
    karies: boolean
    pulpit: boolean
    periodontit: boolean
    parodontit: boolean
    gingivit: boolean
    stomatit: boolean
    tishOlish: boolean
    rengen: boolean // Checkbox sifatida
  }
  additionalConditions: {
    shaharYokiQishloq: boolean
    birinchiYokiIkkinchi: boolean
  }
  rejaliSanasiya: string
  jamiMHSHB: string
  mhshbProfKorik: string
  tashxis: string
  totalExpense: number
  paidAmount: number
  paymentDate: string
  paymentComment: string
  rengenImages: string[] // Rengen rasmlari uchun
}

export default function MedicalManagementSystem() {
  const [activeTab, setActiveTab] = useState("bemor-qabul")

  // O'zbekiston vaqti uchun funksiya
  const getUzbekistanTime = () => {
    const now = new Date()
    const uzbekTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tashkent" }))
    return uzbekTime.toISOString().slice(0, 16)
  }

  const formatUzbekistanDate = (date: string | Date) => {
    const d = new Date(date)
    return d.toLocaleString("uz-UZ", {
      timeZone: "Asia/Tashkent",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const [patientData, setPatientData] = useState<PatientData>({
    admissionDate: getUzbekistanTime(),
    patientName: "",
    birthYear: "",
    gender: "",
    ageGroup: "",
    phoneNumber: "",
    medicalConditions: {
      karies: false,
      pulpit: false,
      periodontit: false,
      parodontit: false,
      gingivit: false,
      stomatit: false,
      tishOlish: false,
      rengen: false,
    },
    additionalConditions: {
      shaharYokiQishloq: false,
      birinchiYokiIkkinchi: false,
    },
    rejaliSanasiya: "",
    jamiMHSHB: "0",
    mhshbProfKorik: "",
    tashxis: "",
    totalExpense: 0,
    paidAmount: 0,
    paymentDate: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Tashkent" }),
    paymentComment: "",
    rengenImages: [],
  })

  const [patients, setPatients] = useState<PatientData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null)

  // Calculate debt automatically
  const debt = patientData.totalExpense - patientData.paidAmount

  const handleInputChange = (field: keyof PatientData, value: any) => {
    setPatientData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleMedicalConditionChange = (condition: keyof PatientData["medicalConditions"], checked: boolean) => {
    setPatientData((prev) => ({
      ...prev,
      medicalConditions: {
        ...prev.medicalConditions,
        [condition]: checked,
      },
    }))
  }

  const handleAdditionalConditionChange = (condition: keyof PatientData["additionalConditions"], checked: boolean) => {
    setPatientData((prev) => ({
      ...prev,
      additionalConditions: {
        ...prev.additionalConditions,
        [condition]: checked,
      },
    }))
  }

  // RENGEN RASM YUKLASH
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newImages: string[] = []
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string)
            if (newImages.length === files.length) {
              setPatientData((prev) => ({
                ...prev,
                rengenImages: [...prev.rengenImages, ...newImages],
              }))
            }
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  // RASM O'CHIRISH
  const removeImage = (index: number) => {
    setPatientData((prev) => ({
      ...prev,
      rengenImages: prev.rengenImages.filter((_, i) => i !== index),
    }))
  }

  // RASM YUKLAB OLISH funksiyasini to'g'irlash
  const downloadImage = (imageData: string, patientName: string, index: number) => {
    try {
      // Base64 ma'lumotlarini ajratish
      const [header, base64Data] = imageData.split(",")

      // MIME type aniqlash
      const mimeMatch = header.match(/data:([^;]+)/)
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg"

      // Base64 ni binary ga aylantirish
      const binaryString = atob(base64Data)
      const bytes = new Uint8Array(binaryString.length)

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      // Blob yaratish
      const blob = new Blob([bytes], { type: mimeType })

      // Download link yaratish
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${patientName.replace(/\s+/g, "_")}_rengen_${index + 1}.jpg`

      // Download boshlash
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Memory tozalash
      URL.revokeObjectURL(url)

      console.log(`Rasm ${index + 1} yuklab olindi: ${link.download}`)
    } catch (error) {
      console.error("Rasm yuklab olishda xatolik:", error)
      alert(`Rasm ${index + 1} yuklab olishda xatolik yuz berdi!`)
    }
  }

  // BARCHA RASMLARNI YUKLAB OLISH
  const downloadAllImages = async (images: string[], patientName: string) => {
    if (images.length === 0) {
      alert("Yuklab olinadigan rasmlar yo'q!")
      return
    }

    alert(`${images.length} ta rengen rasmi yuklab olinmoqda...`)

    for (let i = 0; i < images.length; i++) {
      try {
        await new Promise((resolve) => setTimeout(resolve, i * 1000)) // 1 soniya kechikish
        downloadImage(images[i], patientName, i)
      } catch (error) {
        console.error(`Rasm ${i + 1} yuklab olishda xatolik:`, error)
      }
    }

    setTimeout(
      () => {
        alert(`${images.length} ta rasm muvaffaqiyatli yuklab olindi!`)
      },
      images.length * 1000 + 500,
    )
  }

  const handleSave = () => {
    if (!patientData.patientName.trim()) {
      alert("Bemor ismini kiriting!")
      return
    }

    setPatients((prev) => [...prev, { ...patientData }])
    alert("Ma'lumotlar muvaffaqiyatli saqlandi!")

    // Reset form
    setPatientData({
      admissionDate: getUzbekistanTime(),
      patientName: "",
      birthYear: "",
      gender: "",
      ageGroup: "",
      phoneNumber: "",
      medicalConditions: {
        karies: false,
        pulpit: false,
        periodontit: false,
        parodontit: false,
        gingivit: false,
        stomatit: false,
        tishOlish: false,
        rengen: false,
      },
      additionalConditions: {
        shaharYokiQishloq: false,
        birinchiYokiIkkinchi: false,
      },
      rejaliSanasiya: "",
      jamiMHSHB: "0",
      mhshbProfKorik: "",
      tashxis: "",
      totalExpense: 0,
      paidAmount: 0,
      paymentDate: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Tashkent" }),
      paymentComment: "",
      rengenImages: [],
    })
  }

  const handleClear = () => {
    setPatientData({
      admissionDate: getUzbekistanTime(),
      patientName: "",
      birthYear: "",
      gender: "",
      ageGroup: "",
      phoneNumber: "",
      medicalConditions: {
        karies: false,
        pulpit: false,
        periodontit: false,
        parodontit: false,
        gingivit: false,
        stomatit: false,
        tishOlish: false,
        rengen: false,
      },
      additionalConditions: {
        shaharYokiQishloq: false,
        birinchiYokiIkkinchi: false,
      },
      rejaliSanasiya: "",
      jamiMHSHB: "0",
      mhshbProfKorik: "",
      tashxis: "",
      totalExpense: 0,
      paidAmount: 0,
      paymentDate: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Tashkent" }),
      paymentComment: "",
      rengenImages: [],
    })
  }

  // QIDIRISH FUNKSIYASI - yaxshiroq
  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      patient.patientName.toLowerCase().includes(searchLower) ||
      patient.phoneNumber.includes(searchTerm) ||
      patient.tashxis.toLowerCase().includes(searchLower) ||
      patient.birthYear.includes(searchTerm)
    )
  })

  // JURNAL USLUBIDA EXCEL EKSPORT FUNKSIYASI
  const exportToJournalFormat = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert("Eksport qilish uchun ma'lumotlar yo'q!")
      return
    }

    const uzbekDate = new Date().toLocaleDateString("uz-UZ", { timeZone: "Asia/Tashkent" })

    const journalData = [
      ["TIBBIY MA'LUMOTLAR JURNALI"],
      [`Sana: ${uzbekDate}`],
      [""],
      [""],
      [
        "№",
        "BEMOR ISMI",
        "TUG'ILGAN YILI",
        "YOSHI",
        "JINSI",
        "TELEFON RAQAMI",
        "QABUL VAQTI",
        "KARIES",
        "PULPIT",
        "PERIODONTIT",
        "PARODONTIT",
        "GINGIVIT",
        "STOMATIT",
        "TISH OLISH",
        "RENGEN",
        "SHAHAR/QISHLOQ",
        "TAKRORIY QABUL",
        "TASHXIS",
        "REJALI SANASIYA",
        "JAMI MHSHB",
        "MHSHB PROF KO'RIK",
        "UMUMIY XARAJAT",
        "TO'LANGAN MIQDOR",
        "QARZ MIQDORI",
        "TO'LOV HOLATI",
        "TO'LOV SANASI",
        "TO'LOV IZOHI",
      ],
      ...data.map((item, index) => [
        index + 1,
        item["BEMOR ISMI"] || "",
        item["TUG'ILGAN YILI"] || "",
        item["YOSHI"] || "",
        item["JINSI"] || "",
        item["TELEFON RAQAMI"] || "",
        item["QABUL VAQTI"] || "",
        item["KARIES"] === true ? "✓" : "✗",
        item["PULPIT"] === true ? "✓" : "✗",
        item["PERIODONTIT"] === true ? "✓" : "✗",
        item["PARODONTIT"] === true ? "✓" : "✗",
        item["GINGIVIT"] === true ? "✓" : "✗",
        item["STOMATIT"] === true ? "✓" : "✗",
        item["TISH OLISH"] === true ? "✓" : "✗",
        item["RENGEN"] === true ? "✓" : "✗",
        item["SHAHAR/QISHLOQ"] === true ? "✓" : "✗",
        item["TAKRORIY QABUL"] === true ? "✓" : "✗",
        item["TASHXIS"] || "",
        item["REJALI SANASIYA"] || "",
        item["JAMI MHSHB"] || "",
        item["MHSHB PROF KO'RIK"] || "",
        item["UMUMIY XARAJAT"] || "0",
        item["TO'LANGAN MIQDOR"] || "0",
        item["QARZ MIQDORI"] || "0",
        item["TO'LOV HOLATI"] || "",
        item["TO'LOV SANASI"] || "",
        item["TO'LOV IZOHI"] || "",
      ]),
      [""],
      [`JAMI BEMORLAR: ${data.length}`],
      [`HISOBOT SANASI: ${uzbekDate}`],
      ["TUZUVCHI: UzSoftPro yasadi"],
    ]

    const csvContent = journalData
      .map((row) =>
        row
          .map((cell) => {
            if (cell === null || cell === undefined) return ""
            const cellStr = String(cell)
            if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
              return `"${cellStr.replace(/"/g, '""')}"`
            }
            return cellStr
          })
          .join(","),
      )
      .join("\n")

    const BOM = "\uFEFF"
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    })

    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportAllPatients = () => {
    if (patients.length === 0) {
      alert("Eksport qilish uchun bemorlar ma'lumotlari yo'q!")
      return
    }

    const journalData = patients.map((patient) => ({
      "BEMOR ISMI": patient.patientName,
      "TUG'ILGAN YILI": patient.birthYear,
      YOSHI: patient.birthYear ? (new Date().getFullYear() - Number.parseInt(patient.birthYear)).toString() : "",
      JINSI: patient.gender,
      "TELEFON RAQAMI": patient.phoneNumber,
      "QABUL VAQTI": formatUzbekistanDate(patient.admissionDate),
      KARIES: patient.medicalConditions.karies,
      PULPIT: patient.medicalConditions.pulpit,
      PERIODONTIT: patient.medicalConditions.periodontit,
      PARODONTIT: patient.medicalConditions.parodontit,
      GINGIVIT: patient.medicalConditions.gingivit,
      STOMATIT: patient.medicalConditions.stomatit,
      "TISH OLISH": patient.medicalConditions.tishOlish,
      RENGEN: false, // Checkbox holatida
      "SHAHAR/QISHLOQ": patient.additionalConditions.shaharYokiQishloq,
      "TAKRORIY QABUL": patient.additionalConditions.birinchiYokiIkkinchi,
      TASHXIS: patient.tashxis,
      "REJALI SANASIYA": patient.rejaliSanasiya,
      "JAMI MHSHB": patient.jamiMHSHB,
      "MHSHB PROF KO'RIK": patient.mhshbProfKorik,
      "UMUMIY XARAJAT": patient.totalExpense.toLocaleString("uz-UZ"),
      "TO'LANGAN MIQDOR": patient.paidAmount.toLocaleString("uz-UZ"),
      "QARZ MIQDORI": (patient.totalExpense - patient.paidAmount).toLocaleString("uz-UZ"),
      "TO'LOV HOLATI": (() => {
        const debt = patient.totalExpense - patient.paidAmount
        return debt === 0 ? "TO'LANGAN" : debt > 0 ? "QARZLI" : "ORTIQCHA TO'LANGAN"
      })(),
      "TO'LOV SANASI": new Date(patient.paymentDate).toLocaleDateString("uz-UZ", { timeZone: "Asia/Tashkent" }),
      "TO'LOV IZOHI": patient.paymentComment,
    }))

    const currentDate = new Date().toISOString().split("T")[0]
    exportToJournalFormat(journalData, `Bemorlar_Jurnali_${currentDate}`)
    alert("Jurnal uslubida eksport muvaffaqiyatli amalga oshirildi!")
  }

  // Calculate statistics
  const totalPatients = patients.length
  const todayPatients = patients.filter((p) => {
    const patientDate = new Date(p.admissionDate).toDateString()
    const today = new Date().toLocaleDateString("en-US", { timeZone: "Asia/Tashkent" })
    const todayDate = new Date(today).toDateString()
    return patientDate === todayDate
  }).length
  const kariesCases = patients.filter((p) => p.medicalConditions.karies).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Tibbiy Ma'lumotlar Tizimi</h1>
              <p className="text-sm text-gray-500">Medical Data Management System - UzSoftPro Edition</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={exportAllPatients} className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Jurnal eksport qilish
            </Button>
            <div className="flex items-center gap-2">
              <img src="/uzsoftpro-logo.png" alt="UzSoftPro" className="w-6 h-6" />
              <span className="text-sm font-medium">UzSoftPro yasadi</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-transparent h-auto p-0">
            <TabsTrigger
              value="bemor-qabul"
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
            >
              <Users className="w-4 h-4" />
              Bemor qabuli
            </TabsTrigger>
            <TabsTrigger
              value="bemorlar-royxati"
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
            >
              <FileText className="w-4 h-4" />
              Bemorlar ro'yxati
            </TabsTrigger>
            <TabsTrigger
              value="moliyaviy-hisobot"
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
            >
              <BarChart3 className="w-4 h-4" />
              Moliyaviy hisobot
            </TabsTrigger>
            <TabsTrigger
              value="statistika"
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
            >
              <BarChart3 className="w-4 h-4" />
              Statistika
            </TabsTrigger>
            <TabsTrigger
              value="hisobotlar"
              className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
            >
              <FileText className="w-4 h-4" />
              Hisobotlar
            </TabsTrigger>
          </TabsList>

          {/* Patient Registration */}
          <TabsContent value="bemor-qabul" className="mt-6 px-6 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Patient Information Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>Bemor ma'lumotlari</span>
                      <span className="text-sm text-gray-500 font-normal">Patient Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="admission-date">Bemor qabul vaqti (O'zbekiston vaqti)</Label>
                        <Input
                          id="admission-date"
                          type="datetime-local"
                          value={patientData.admissionDate}
                          onChange={(e) => handleInputChange("admissionDate", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="patient-name">To'liq ismi</Label>
                        <Input
                          id="patient-name"
                          placeholder="Bemor ismini kiriting..."
                          value={patientData.patientName}
                          onChange={(e) => handleInputChange("patientName", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="birth-year">Tug'ilgan yili</Label>
                        <Input
                          id="birth-year"
                          placeholder="Masalan: 1995"
                          value={patientData.birthYear}
                          onChange={(e) => handleInputChange("birthYear", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender">Jinsi</Label>
                        <Select
                          value={patientData.gender}
                          onValueChange={(value) => handleInputChange("gender", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Tanlang..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="erkak">Erkak</SelectItem>
                            <SelectItem value="ayol">Ayol</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="age-group">Yosh guruhi</Label>
                        <Select
                          value={patientData.ageGroup}
                          onValueChange={(value) => handleInputChange("ageGroup", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Tanlang..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-14">0-14 yosh</SelectItem>
                            <SelectItem value="15-64">15-64 yosh</SelectItem>
                            <SelectItem value="65+">65+ yosh</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="phone-number">Aloqa raqami</Label>
                        <Input
                          id="phone-number"
                          placeholder="+998 90 123 45 67"
                          value={patientData.phoneNumber}
                          onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Medical Assessment */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>Tibbiy baholash</span>
                      <span className="text-sm text-gray-500 font-normal">Medical Assessment</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label className="text-base font-medium">Stomatologik holat</Label>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="karies"
                              checked={patientData.medicalConditions.karies}
                              onCheckedChange={(checked) => handleMedicalConditionChange("karies", checked as boolean)}
                            />
                            <Label htmlFor="karies">Karies</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="periodontit"
                              checked={patientData.medicalConditions.periodontit}
                              onCheckedChange={(checked) =>
                                handleMedicalConditionChange("periodontit", checked as boolean)
                              }
                            />
                            <Label htmlFor="periodontit">Periodontit</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="gingivit"
                              checked={patientData.medicalConditions.gingivit}
                              onCheckedChange={(checked) =>
                                handleMedicalConditionChange("gingivit", checked as boolean)
                              }
                            />
                            <Label htmlFor="gingivit">Gingivit</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="tish-olish"
                              checked={patientData.medicalConditions.tishOlish}
                              onCheckedChange={(checked) =>
                                handleMedicalConditionChange("tishOlish", checked as boolean)
                              }
                            />
                            <Label htmlFor="tish-olish">Tish olish</Label>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="pulpit"
                              checked={patientData.medicalConditions.pulpit}
                              onCheckedChange={(checked) => handleMedicalConditionChange("pulpit", checked as boolean)}
                            />
                            <Label htmlFor="pulpit">Pulpit</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="parodontit"
                              checked={patientData.medicalConditions.parodontit}
                              onCheckedChange={(checked) =>
                                handleMedicalConditionChange("parodontit", checked as boolean)
                              }
                            />
                            <Label htmlFor="parodontit">Parodontit</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="stomatit"
                              checked={patientData.medicalConditions.stomatit}
                              onCheckedChange={(checked) =>
                                handleMedicalConditionChange("stomatit", checked as boolean)
                              }
                            />
                            <Label htmlFor="stomatit">Stomatit</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="rengen"
                              checked={patientData.medicalConditions.rengen}
                              onCheckedChange={(checked) => handleMedicalConditionChange("rengen", checked as boolean)}
                            />
                            <Label htmlFor="rengen">Rengen</Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RENGEN RASMLARI YUKLASH */}
                    <div className="mt-6">
                      <Label className="text-base font-medium flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Rengen rasmlari yuklash
                      </Label>
                      <div className="mt-3 space-y-4">
                        {/* YUKLASH TUGMASI */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                          <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600 mb-3">
                            Rengen rasmlarini yuklash uchun bosing yoki shu yerga tashlang
                          </p>
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                            id="rengen-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("rengen-upload")?.click()}
                            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Rengen rasmi yuklash
                          </Button>
                        </div>

                        {/* YUKLANGAN RASMLAR */}
                        {patientData.rengenImages.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-3">
                              Yuklangan rasmlar ({patientData.rengenImages.length} ta):
                            </p>
                            <div className="grid grid-cols-3 gap-4">
                              {patientData.rengenImages.map((image, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={image || "/placeholder.svg"}
                                    alt={`Rengen ${index + 1}`}
                                    className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-75 transition-opacity"
                                    onClick={() => setSelectedImage(image)}
                                  />
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeImage(index)}
                                  >
                                    ×
                                  </Button>
                                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                    {index + 1}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div>
                        <Label htmlFor="additional-conditions">Qo'shimcha holatlar</Label>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="shahar-yoki-qishloq"
                              checked={patientData.additionalConditions.shaharYokiQishloq}
                              onCheckedChange={(checked) =>
                                handleAdditionalConditionChange("shaharYokiQishloq", checked as boolean)
                              }
                            />
                            <Label htmlFor="shahar-yoki-qishloq">Shahar yoki qishloq</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="birinchi-yoki-ikkinchi"
                              checked={patientData.additionalConditions.birinchiYokiIkkinchi}
                              onCheckedChange={(checked) =>
                                handleAdditionalConditionChange("birinchiYokiIkkinchi", checked as boolean)
                              }
                            />
                            <Label htmlFor="birinchi-yoki-ikkinchi">Birinchi yoki ikkinchi bor qabulda kelishi</Label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="rejali-sanasiya">Jumladan rejali sanasiya:</Label>
                        <Textarea
                          id="rejali-sanasiya"
                          placeholder="Ma'lumot kiriting..."
                          className="mt-2"
                          value={patientData.rejaliSanasiya}
                          onChange={(e) => handleInputChange("rejaliSanasiya", e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="jami-mhshb">Jami MHSHB:</Label>
                          <Input
                            id="jami-mhshb"
                            value={patientData.jamiMHSHB}
                            onChange={(e) => handleInputChange("jamiMHSHB", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="mhshb-prof">MHSHB prof ko'rik:</Label>
                          <Textarea
                            id="mhshb-prof"
                            placeholder="Ma'lumot kiriting..."
                            value={patientData.mhshbProfKorik}
                            onChange={(e) => handleInputChange("mhshbProfKorik", e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="tashxis">Tashxis:</Label>
                        <Textarea
                          id="tashxis"
                          placeholder="Tashxis kiriting..."
                          className="mt-2"
                          value={patientData.tashxis}
                          onChange={(e) => handleInputChange("tashxis", e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Information */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>Moliyaviy ma'lumotlar</span>
                      <span className="text-sm text-gray-500 font-normal">Financial Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="total-expense">Umumiy xarajat (so'm)</Label>
                        <Input
                          id="total-expense"
                          type="number"
                          value={patientData.totalExpense}
                          onChange={(e) => handleInputChange("totalExpense", Number(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="payment-comment">To'lov haqida izoh</Label>
                        <Textarea
                          id="payment-comment"
                          placeholder="To'lov usuli, izohlar..."
                          value={patientData.paymentComment}
                          onChange={(e) => handleInputChange("paymentComment", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="paid-amount">To'langan miqdor (so'm)</Label>
                        <Input
                          id="paid-amount"
                          type="number"
                          value={patientData.paidAmount}
                          onChange={(e) => handleInputChange("paidAmount", Number(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="payment-date">To'lov sanasi</Label>
                        <Input
                          id="payment-date"
                          type="date"
                          value={patientData.paymentDate}
                          onChange={(e) => handleInputChange("paymentDate", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">To'lov xulosasi</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Umumiy xarajat:</span>
                          <span className="font-medium">{patientData.totalExpense.toLocaleString()} so'm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>To'langan:</span>
                          <span className="font-medium text-green-600">
                            {patientData.paidAmount.toLocaleString()} so'm
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Qarz:</span>
                          <span
                            className={`font-medium ${debt > 0 ? "text-red-600" : debt < 0 ? "text-green-600" : "text-gray-600"}`}
                          >
                            {debt.toLocaleString()} so'm
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions and Quick Stats */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Amallar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700">
                      Saqlash
                    </Button>
                    <Button onClick={handleClear} variant="outline" className="w-full">
                      Tozalash
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                    >
                      Chop etish
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tezkor ma'lumotlar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Bugungi qabullar</span>
                      <span className="font-semibold text-blue-600">{todayPatients}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Umumiy bemorlar</span>
                      <span className="font-semibold text-green-600">{totalPatients}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Karies holatlari</span>
                      <span className="font-semibold text-orange-600">{kariesCases}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>So'nggi bemorlar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patients.length > 0 ? (
                      <div className="space-y-2">
                        {patients
                          .slice(-3)
                          .reverse()
                          .map((patient, index) => (
                            <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                              <div className="font-medium">{patient.patientName}</div>
                              <div className="text-gray-500">{formatUzbekistanDate(patient.admissionDate)}</div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">Hozircha bemorlar yo'q</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Patient List */}
          <TabsContent value="bemorlar-royxati" className="mt-6 px-6 pb-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Bemorlar ro'yxati</CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Ism yoki telefon bo'yicha qidirish..."
                        className="pl-10 w-80"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select defaultValue="barcha-holatlar">
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="barcha-holatlar">Barcha holatlar</SelectItem>
                        <SelectItem value="karies">Karies</SelectItem>
                        <SelectItem value="pulpit">Pulpit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bemor</TableHead>
                      <TableHead>Yoshi</TableHead>
                      <TableHead>Qabul vaqti</TableHead>
                      <TableHead>Rengen rasmlari</TableHead>
                      <TableHead>Tashxis</TableHead>
                      <TableHead>To'lov holati</TableHead>
                      <TableHead>Qarz miqdori</TableHead>
                      <TableHead>Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient, index) => {
                        const patientDebt = patient.totalExpense - patient.paidAmount
                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{patient.patientName}</TableCell>
                            <TableCell>
                              {patient.birthYear ? new Date().getFullYear() - Number.parseInt(patient.birthYear) : "-"}
                            </TableCell>
                            <TableCell>{formatUzbekistanDate(patient.admissionDate)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {patient.rengenImages.length > 0 ? (
                                  <>
                                    <span className="text-sm text-green-600 font-medium">
                                      {patient.rengenImages.length} ta rasm
                                    </span>
                                    <div className="flex gap-1">
                                      {patient.rengenImages.slice(0, 3).map((image, imgIndex) => (
                                        <img
                                          key={imgIndex}
                                          src={image || "/placeholder.svg"}
                                          alt={`Rengen ${imgIndex + 1}`}
                                          className="w-8 h-8 object-cover rounded border cursor-pointer"
                                          onClick={() => setSelectedImage(image)}
                                        />
                                      ))}
                                      {patient.rengenImages.length > 3 && (
                                        <div className="w-8 h-8 bg-gray-100 rounded border flex items-center justify-center text-xs">
                                          +{patient.rengenImages.length - 3}
                                        </div>
                                      )}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => downloadAllImages(patient.rengenImages, patient.patientName)}
                                    >
                                      <Download className="w-3 h-3 mr-1" />
                                      Yuklab olish ({patient.rengenImages.length})
                                    </Button>
                                  </>
                                ) : (
                                  <span className="text-sm text-gray-500">Rengen yo'q</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{patient.tashxis || "-"}</TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  patientDebt === 0
                                    ? "bg-green-100 text-green-800"
                                    : patientDebt > 0
                                      ? "bg-red-100 text-red-800"
                                      : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {patientDebt === 0 ? "To'langan" : patientDebt > 0 ? "Qarzli" : "Ortiqcha to'langan"}
                              </span>
                            </TableCell>
                            <TableCell
                              className={
                                patientDebt > 0
                                  ? "text-red-600 font-medium"
                                  : patientDebt < 0
                                    ? "text-green-600 font-medium"
                                    : ""
                              }
                            >
                              {patientDebt.toLocaleString()} so'm
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" onClick={() => setSelectedPatient(patient)}>
                                Ko'rish
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          {searchTerm ? "Qidiruv natijasi topilmadi" : "Hozircha bemorlar yo'q"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Reports */}
          <TabsContent value="moliyaviy-hisobot" className="mt-6 px-6 pb-6">
            <div className="space-y-6">
              {/* Financial Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Jami daromad</p>
                        <p className="text-2xl font-bold text-green-600">
                          {patients.reduce((sum, p) => sum + p.paidAmount, 0).toLocaleString()} so'm
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Jami qarzlar</p>
                        <p className="text-2xl font-bold text-red-600">
                          {patients
                            .reduce((sum, p) => {
                              const debt = p.totalExpense - p.paidAmount
                              return sum + (debt > 0 ? debt : 0)
                            }, 0)
                            .toLocaleString()}{" "}
                          so'm
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Jami xarajatlar</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {patients.reduce((sum, p) => sum + p.totalExpense, 0).toLocaleString()} so'm
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Financial Records Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Moliyaviy hisobotlar</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                        Qarzlilarga SMS
                      </Button>
                      <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">
                        Maxsus SMS
                      </Button>
                      <Button onClick={exportAllPatients} size="sm" className="bg-green-600 hover:bg-green-700">
                        Moliyaviy jurnal eksport
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bemor</TableHead>
                        <TableHead>Telefon raqami</TableHead>
                        <TableHead>Umumiy xarajat</TableHead>
                        <TableHead>To'langan</TableHead>
                        <TableHead>Qarz miqdori</TableHead>
                        <TableHead>To'lov holati</TableHead>
                        <TableHead>To'lov sanasi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patients.length > 0 ? (
                        patients.map((patient, index) => {
                          const patientDebt = patient.totalExpense - patient.paidAmount
                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{patient.patientName}</TableCell>
                              <TableCell>{patient.phoneNumber || "-"}</TableCell>
                              <TableCell>{patient.totalExpense.toLocaleString()} so'm</TableCell>
                              <TableCell className="text-green-600">
                                {patient.paidAmount.toLocaleString()} so'm
                              </TableCell>
                              <TableCell
                                className={
                                  patientDebt > 0
                                    ? "text-red-600 font-medium"
                                    : patientDebt < 0
                                      ? "text-green-600 font-medium"
                                      : ""
                                }
                              >
                                {patientDebt.toLocaleString()} so'm
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    patientDebt === 0
                                      ? "bg-green-100 text-green-800"
                                      : patientDebt > 0
                                        ? "bg-red-100 text-red-800"
                                        : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {patientDebt === 0 ? "To'langan" : patientDebt > 0 ? "Qarzli" : "Ortiqcha"}
                                </span>
                              </TableCell>
                              <TableCell>
                                {new Date(patient.paymentDate).toLocaleDateString("uz-UZ", {
                                  timeZone: "Asia/Tashkent",
                                })}
                              </TableCell>
                            </TableRow>
                          )
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            Hozircha moliyaviy ma'lumotlar yo'q
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Statistics */}
          <TabsContent value="statistika" className="mt-6 px-6 pb-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tashxislar bo'yicha statistika</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patients.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Karies:</span>
                          <span className="font-medium">
                            {patients.filter((p) => p.medicalConditions.karies).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pulpit:</span>
                          <span className="font-medium">
                            {patients.filter((p) => p.medicalConditions.pulpit).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Periodontit:</span>
                          <span className="font-medium">
                            {patients.filter((p) => p.medicalConditions.periodontit).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Parodontit:</span>
                          <span className="font-medium">
                            {patients.filter((p) => p.medicalConditions.parodontit).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gingivit:</span>
                          <span className="font-medium">
                            {patients.filter((p) => p.medicalConditions.gingivit).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Stomatit:</span>
                          <span className="font-medium">
                            {patients.filter((p) => p.medicalConditions.stomatit).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tish olish:</span>
                          <span className="font-medium">
                            {patients.filter((p) => p.medicalConditions.tishOlish).length}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">Hozircha tashxislar yo'q</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Yosh guruhlari bo'yicha</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patients.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>0-14 yosh:</span>
                          <span className="font-medium">{patients.filter((p) => p.ageGroup === "0-14").length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>15-64 yosh:</span>
                          <span className="font-medium">{patients.filter((p) => p.ageGroup === "15-64").length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>65+ yosh:</span>
                          <span className="font-medium">{patients.filter((p) => p.ageGroup === "65+").length}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">Hozircha yosh guruhlari bo'yicha ma'lumot yo'q</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* General Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Umumiy statistika</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">{totalPatients}</div>
                      <div className="text-sm text-gray-600 mt-1">Jami bemorlar</div>
                    </div>
                    <div className="text-center p-6 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">{todayPatients}</div>
                      <div className="text-sm text-gray-600 mt-1">Bugungi qabullar</div>
                    </div>
                    <div className="text-center p-6 bg-orange-50 rounded-lg">
                      <div className="text-3xl font-bold text-orange-600">{kariesCases}</div>
                      <div className="text-sm text-gray-600 mt-1">Jami tashxislar</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports */}
          <TabsContent value="hisobotlar" className="mt-6 px-6 pb-6">
            <Card>
              <CardHeader>
                <CardTitle>Jurnal uslubida hisobotlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                      <h3 className="font-semibold mb-2">Bemorlar jurnali</h3>
                      <p className="text-sm text-gray-600 mb-4">Barcha bemorlar ma'lumotlari jurnal formatida</p>
                      <Button onClick={exportAllPatients} className="w-full bg-blue-600 hover:bg-blue-700">
                        <Download className="w-4 h-4 mr-2" />
                        Jurnal eksport qilish
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 text-green-600" />
                      <h3 className="font-semibold mb-2">Moliyaviy jurnal</h3>
                      <p className="text-sm text-gray-600 mb-4">To'lovlar va qarzlar jurnali</p>
                      <Button onClick={exportAllPatients} className="w-full bg-green-600 hover:bg-green-700">
                        <Download className="w-4 h-4 mr-2" />
                        Moliyaviy jurnal
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8">
                  <h3 className="font-semibold mb-4">Jurnal formati haqida</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <img src="/uzsoftpro-logo.png" alt="UzSoftPro" className="w-5 h-5" />
                      <span className="font-medium text-blue-600">UzSoftPro Professional Medical System</span>
                    </div>
                    <h4 className="font-medium mb-2">Jurnal uslubida eksport:</h4>
                    <ul className="text-sm text-gray-600 space-y-1 mb-4">
                      <li>• Keng ustunlar va o'qilishi oson format</li>
                      <li>• Sarlavha va sana bilan</li>
                      <li>• Barcha ma'lumotlar tartibli joylashgan</li>
                      <li>• Excel da ochish va ishlash uchun optimallashtirilgan</li>
                      <li>• Rengen rasmlari soni ko'rsatiladi</li>
                    </ul>
                    <h4 className="font-medium mb-2">Qo'shimcha imkoniyatlar:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• UTF-8 kodlash - o'zbek harflari to'g'ri ko'rsatiladi</li>
                      <li>• Avtomatik raqamlash va sana qo'yish</li>
                      <li>• Professional jurnal ko'rinishi</li>
                      <li>• UzSoftPro tomonidan ishlab chiqilgan</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </nav>

      {/* RASM KO'RISH MODAL */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Rengen rasmi"
              className="max-w-full max-h-full object-contain"
            />
            <Button
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* BEMOR MA'LUMOTLARINI KO'RISH MODAL */}
      {selectedPatient && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPatient(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto p-6 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Bemor ma'lumotlari</h2>
              <Button variant="outline" onClick={() => setSelectedPatient(null)}>
                ✕ Yopish
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shaxsiy ma'lumotlar */}
              <Card>
                <CardHeader>
                  <CardTitle>Shaxsiy ma'lumotlar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="font-medium">To'liq ismi:</Label>
                    <p className="text-gray-700">{selectedPatient.patientName}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Tug'ilgan yili:</Label>
                    <p className="text-gray-700">{selectedPatient.birthYear}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Yoshi:</Label>
                    <p className="text-gray-700">
                      {selectedPatient.birthYear
                        ? new Date().getFullYear() - Number.parseInt(selectedPatient.birthYear)
                        : "-"}{" "}
                      yosh
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Jinsi:</Label>
                    <p className="text-gray-700">{selectedPatient.gender}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Telefon raqami:</Label>
                    <p className="text-gray-700">{selectedPatient.phoneNumber}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Qabul vaqti:</Label>
                    <p className="text-gray-700">{formatUzbekistanDate(selectedPatient.admissionDate)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Tibbiy ma'lumotlar */}
              <Card>
                <CardHeader>
                  <CardTitle>Tibbiy ma'lumotlar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="font-medium">Tashxis:</Label>
                    <p className="text-gray-700">{selectedPatient.tashxis || "Kiritilmagan"}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Stomatologik holatlar:</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {Object.entries(selectedPatient.medicalConditions).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${value ? "bg-green-500" : "bg-gray-300"}`}></span>
                          <span className="text-sm capitalize">{key}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="font-medium">Rejali sanasiya:</Label>
                    <p className="text-gray-700">{selectedPatient.rejaliSanasiya || "Kiritilmagan"}</p>
                  </div>
                  <div>
                    <Label className="font-medium">MHSHB prof ko'rik:</Label>
                    <p className="text-gray-700">{selectedPatient.mhshbProfKorik || "Kiritilmagan"}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Moliyaviy ma'lumotlar */}
              <Card>
                <CardHeader>
                  <CardTitle>Moliyaviy ma'lumotlar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="font-medium">Umumiy xarajat:</Label>
                    <p className="text-gray-700 font-semibold">{selectedPatient.totalExpense.toLocaleString()} so'm</p>
                  </div>
                  <div>
                    <Label className="font-medium">To'langan miqdor:</Label>
                    <p className="text-green-600 font-semibold">{selectedPatient.paidAmount.toLocaleString()} so'm</p>
                  </div>
                  <div>
                    <Label className="font-medium">Qarz miqdori:</Label>
                    <p
                      className={`font-semibold ${
                        (selectedPatient.totalExpense - selectedPatient.paidAmount) > 0
                          ? "text-red-600"
                          : selectedPatient.totalExpense - selectedPatient.paidAmount < 0
                            ? "text-green-600"
                            : "text-gray-600"
                      }`}
                    >
                      {(selectedPatient.totalExpense - selectedPatient.paidAmount).toLocaleString()} so'm
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">To'lov sanasi:</Label>
                    <p className="text-gray-700">
                      {new Date(selectedPatient.paymentDate).toLocaleDateString("uz-UZ", { timeZone: "Asia/Tashkent" })}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">To'lov izohi:</Label>
                    <p className="text-gray-700">{selectedPatient.paymentComment || "Izoh yo'q"}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Rengen rasmlari */}
              <Card>
                <CardHeader>
                  <CardTitle>Rengen rasmlari</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPatient.rengenImages.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {selectedPatient.rengenImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Rengen ${index + 1}`}
                            className="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-75"
                            onClick={() => setSelectedImage(image)}
                          />
                          <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Rengen rasmlari yo'q</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
