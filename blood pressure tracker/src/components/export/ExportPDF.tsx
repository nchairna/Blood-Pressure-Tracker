import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { BPReading, BPStats } from '@/types'
import { formatDate, formatTime, getTimeOfDayLabel, classifyBP, getBPStatusLabel } from '@/lib/bp-utils'

interface ExportPDFOptions {
  readings: BPReading[]
  stats: BPStats
  dateRange: { start: Date; end: Date }
  userName: string
}

export function generatePDF({ readings, stats, dateRange, userName }: ExportPDFOptions): void {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.setTextColor(59, 130, 246) // Blue
  doc.text('Blood Pressure Report', 14, 20)

  // User and date info
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Generated for: ${userName}`, 14, 30)
  doc.text(`Date Range: ${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`, 14, 36)
  doc.text(`Generated on: ${formatDate(new Date())}`, 14, 42)

  // Summary Statistics
  doc.setFontSize(14)
  doc.setTextColor(0)
  doc.text('Summary Statistics', 14, 55)

  const avgStatus = stats.avgSystolic > 0 ? classifyBP(stats.avgSystolic, stats.avgDiastolic) : null

  autoTable(doc, {
    startY: 60,
    head: [['Metric', 'Value']],
    body: [
      ['Total Readings', readings.length.toString()],
      ['Average Systolic', stats.avgSystolic > 0 ? `${stats.avgSystolic} mmHg` : 'N/A'],
      ['Average Diastolic', stats.avgDiastolic > 0 ? `${stats.avgDiastolic} mmHg` : 'N/A'],
      ['Average Pulse', stats.avgPulse > 0 ? `${stats.avgPulse} bpm` : 'N/A'],
      ['Average Status', avgStatus ? getBPStatusLabel(avgStatus) : 'N/A'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14 },
  })

  // Readings Table
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 100

  doc.setFontSize(14)
  doc.text('All Readings', 14, finalY + 15)

  const tableData = readings.map((reading) => {
    const date = reading.timestamp.toDate()
    const status = classifyBP(reading.systolic, reading.diastolic)

    return [
      formatDate(date),
      formatTime(date),
      getTimeOfDayLabel(reading.timeOfDay),
      `${reading.systolic}/${reading.diastolic}`,
      reading.pulse.toString(),
      getBPStatusLabel(status),
      reading.notes || '-',
    ]
  })

  autoTable(doc, {
    startY: finalY + 20,
    head: [['Date', 'Time', 'Period', 'BP (mmHg)', 'Pulse', 'Status', 'Notes']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14 },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 20 },
      2: { cellWidth: 22 },
      3: { cellWidth: 25 },
      4: { cellWidth: 15 },
      5: { cellWidth: 28 },
      6: { cellWidth: 'auto' },
    },
    didDrawPage: (data) => {
      // Footer
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(
        `Page ${data.pageNumber}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      )
    },
  })

  // BP Categories Reference (on last page)
  const lastPageY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 200

  if (lastPageY < doc.internal.pageSize.height - 60) {
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text('Blood Pressure Categories Reference:', 14, lastPageY + 15)
    doc.setFontSize(8)
    doc.text('Normal: < 120/80 mmHg', 14, lastPageY + 22)
    doc.text('Elevated: 120-129/<80 mmHg', 14, lastPageY + 28)
    doc.text('High Stage 1: 130-139/80-89 mmHg', 14, lastPageY + 34)
    doc.text('High Stage 2: >= 140/90 mmHg', 14, lastPageY + 40)
  }

  // Save
  const filename = `bp-report-${formatDate(new Date()).replace(/\s/g, '-')}.pdf`
  doc.save(filename)
}
