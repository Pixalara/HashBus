import jsPDF from 'jspdf';
import { Booking } from '../types';

export const generateTicketPDF = async (booking: Booking) => {
  try {
    console.log('Starting professional premium PDF generation...');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // ==================== WATERMARK BUS ====================
    drawBusWatermark(pdf, pageWidth, pageHeight);

    // ==================== TOP HEADER ====================
    pdf.setFillColor(20, 20, 30);
    pdf.rect(0, 0, pageWidth, 50, 'F');

    pdf.setFillColor(212, 175, 55);
    pdf.rect(0, 0, pageWidth, 2.5, 'F');

    pdf.setTextColor(212, 175, 55);
    pdf.setFontSize(36);
    pdf.setFont('helvetica', 'bold');
    pdf.text('HASHBUS', 15, 22);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(180, 180, 180);
    pdf.text('Luxury Travel - Premium Comfort', 15, 30);

    // White booking ID box
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(212, 175, 55);
    pdf.setLineWidth(1.5);
    pdf.rect(pageWidth - 95, 8, 80, 35, 'FD');

    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text('BOOKING ID', pageWidth - 90, 15);

    pdf.setTextColor(212, 175, 55);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    const ticketNumber = `HB${booking.id.substring(0, 10).toUpperCase()}`;
    pdf.text(ticketNumber, pageWidth - 90, 25);

    pdf.setFillColor(76, 175, 80);
    pdf.rect(pageWidth - 90, 28, 20, 6, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CONFIRMED', pageWidth - 88, 32);

    let yPosition = 55;

    // ==================== JOURNEY HIGHLIGHTS ====================
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(212, 175, 55);
    pdf.setLineWidth(2.5);
    pdf.rect(15, yPosition, pageWidth - 30, 38, 'FD');

    pdf.setFillColor(212, 175, 55);
    pdf.rect(15, yPosition - 5, 50, 5, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('JOURNEY DETAILS', 18, yPosition - 1);

    // FROM
    pdf.setTextColor(212, 175, 55);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FROM', 25, yPosition + 6);

    pdf.setTextColor(20, 20, 30);
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    const fromCity = booking.route.from.name.substring(0, 3).toUpperCase();
    pdf.text(fromCity, 25, yPosition + 18);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 80, 80);
    pdf.text(booking.route.from.name, 25, yPosition + 27);

    // ARROW
    pdf.setTextColor(212, 175, 55);
    pdf.setFontSize(18);
    pdf.text('>', pageWidth / 2 - 6, yPosition + 18);

    // TO
    pdf.setTextColor(212, 175, 55);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TO', pageWidth / 2 + 20, yPosition + 6);

    pdf.setTextColor(20, 20, 30);
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    const toCity = booking.route.to.name.substring(0, 3).toUpperCase();
    pdf.text(toCity, pageWidth / 2 + 20, yPosition + 18);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 80, 80);
    pdf.text(booking.route.to.name, pageWidth / 2 + 20, yPosition + 27);

    yPosition += 45;

    // ==================== KEY DETAILS GRID ====================
    const gridWidth = (pageWidth - 30) / 2 - 2;
    const gridHeight = 20;

    // Row 1 - Date
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.8);
    pdf.rect(15, yPosition, gridWidth, gridHeight, 'FD');

    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DATE', 20, yPosition + 5);

    pdf.setTextColor(20, 20, 30);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    const dateStr = booking.journeyDate instanceof Date 
      ? booking.journeyDate.toLocaleDateString('en-GB') 
      : String(booking.journeyDate);
    pdf.text(dateStr, 20, yPosition + 14);

    // Row 1 - Departure
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(15 + gridWidth + 4, yPosition, gridWidth, gridHeight, 'FD');

    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DEPARTURE', 20 + gridWidth + 4, yPosition + 5);

    pdf.setTextColor(20, 20, 30);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    const timeStr = booking.bus.departureTime.includes(':')
      ? booking.bus.departureTime
      : new Date(booking.bus.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    pdf.text(timeStr, 20 + gridWidth + 4, yPosition + 14);

    yPosition += gridHeight + 3;

    // Row 2 - Duration
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(15, yPosition, gridWidth, gridHeight, 'FD');

    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DURATION', 20, yPosition + 5);

    pdf.setTextColor(20, 20, 30);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(booking.bus.duration || '10h 11m', 20, yPosition + 14);

    // Row 2 - Seats (highlighted)
    pdf.setFillColor(255, 251, 235);
    pdf.setDrawColor(212, 175, 55);
    pdf.setLineWidth(1.5);
    pdf.rect(15 + gridWidth + 4, yPosition, gridWidth, gridHeight, 'FD');

    pdf.setTextColor(212, 175, 55);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text('YOUR SEATS', 20 + gridWidth + 4, yPosition + 5);

    pdf.setTextColor(212, 175, 55);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    const seatNumbers = booking.selectedSeats.map(s => s.number).join(', ');
    pdf.text(seatNumbers, 20 + gridWidth + 4, yPosition + 14);

    yPosition += gridHeight + 8;

    // ==================== PICKUP & DROP ====================
    const halfWidth = (pageWidth - 30) / 2 - 2;

    // Pickup
    pdf.setFillColor(240, 253, 244);
    pdf.setDrawColor(76, 175, 80);
    pdf.setLineWidth(1.2);
    pdf.rect(15, yPosition, halfWidth, 18, 'FD');

    pdf.setTextColor(76, 175, 80);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PICKUP LOCATION', 18, yPosition + 4);

    pdf.setTextColor(20, 20, 30);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text(booking.pickupPoint.name, 18, yPosition + 12);

    // Drop
    pdf.setFillColor(254, 242, 242);
    pdf.setDrawColor(244, 67, 54);
    pdf.setLineWidth(1.2);
    pdf.rect(15 + halfWidth + 4, yPosition, halfWidth, 18, 'FD');

    pdf.setTextColor(244, 67, 54);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DROP LOCATION', 18 + halfWidth + 4, yPosition + 4);

    pdf.setTextColor(20, 20, 30);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text(booking.dropPoint.name, 18 + halfWidth + 4, yPosition + 12);

    yPosition += 26;

    // ==================== PASSENGER & BUS INFO ====================
    // Passenger
    pdf.setFillColor(239, 246, 255);
    pdf.setDrawColor(33, 150, 243);
    pdf.setLineWidth(1);
    pdf.rect(15, yPosition, halfWidth, 26, 'FD');

    pdf.setTextColor(33, 150, 243);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PASSENGER', 18, yPosition + 4);

    pdf.setTextColor(20, 20, 30);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text(booking.passenger.name, 18, yPosition + 11);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 80, 80);
    pdf.text(`Age: ${booking.passenger.age} | ${booking.passenger.gender}`, 18, yPosition + 16);
    pdf.text(`Phone: ${booking.passenger.mobile}`, 18, yPosition + 21);

    // Bus
    pdf.setFillColor(250, 245, 255);
    pdf.setDrawColor(156, 39, 176);
    pdf.setLineWidth(1);
    pdf.rect(15 + halfWidth + 4, yPosition, halfWidth, 26, 'FD');

    pdf.setTextColor(156, 39, 176);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text('BUS DETAILS', 18 + halfWidth + 4, yPosition + 4);

    pdf.setTextColor(20, 20, 30);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text(booking.bus.name, 18 + halfWidth + 4, yPosition + 11);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 80, 80);
    pdf.text(`Type: ${booking.bus.coachType}`, 18 + halfWidth + 4, yPosition + 16);
    pdf.text('AC | Sleeper | WiFi | Charging', 18 + halfWidth + 4, yPosition + 21);

    yPosition += 32;

    // ==================== PRICE SECTION ====================
    pdf.setFillColor(20, 20, 30);
    pdf.rect(15, yPosition, pageWidth - 30, 25, 'F');

    pdf.setFillColor(212, 175, 55);
    pdf.rect(15, yPosition, pageWidth - 30, 2, 'F');

    pdf.setTextColor(212, 175, 55);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('TOTAL FARE PER PASSENGER', 25, yPosition + 8);

    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    const priceStr = `INR ${Math.round(booking.totalAmount)}`;
    pdf.text(priceStr, 25, yPosition + 18);

    yPosition += 30;

    // ==================== TERMS & CONDITIONS ====================
    pdf.setFillColor(20, 20, 30);
    pdf.setDrawColor(212, 175, 55);
    pdf.setLineWidth(1);
    pdf.rect(15, yPosition, pageWidth - 30, 4, 'FD');

    pdf.setTextColor(212, 175, 55);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text('IMPORTANT INFORMATION & TERMS', 20, yPosition + 2.5);

    yPosition += 6;

    const terms = [
      'Please arrive at the pickup location at least 15 minutes before the scheduled departure time.',
      'Carry a valid government-issued photo ID proof during your journey.',
      'This ticket is non-transferable and valid only for the specified date, time and seats.',
      'For assistance, contact: +91 1800-HASHBUS or email support@hashbus.com'
    ];

    pdf.setFontSize(6.8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(70, 70, 70);

    terms.forEach((term) => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 15;
      }
      pdf.text(`- ${term}`, 18, yPosition);
      yPosition += 4.5;
    });

    yPosition += 3;

    // ==================== FOOTER ====================
    pdf.setDrawColor(212, 175, 55);
    pdf.setLineWidth(0.8);
    pdf.line(15, yPosition, pageWidth - 15, yPosition);

    yPosition += 3;

    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'italic');
    const centerX = pageWidth / 2;
    pdf.text('Thank you for choosing HashBus. Safe travels!', centerX, yPosition, { align: 'center' });

    yPosition += 4;

    pdf.setFontSize(6);
    pdf.setTextColor(150, 150, 150);
    const currentDate = new Date().toLocaleDateString('en-GB');
    pdf.text(`Generated on ${currentDate} | HashBus Premium Travel Services`, centerX, yPosition, { align: 'center' });

    // ==================== BOTTOM STRIPE ====================
    pdf.setFillColor(212, 175, 55);
    pdf.rect(0, pageHeight - 2.5, pageWidth, 2.5, 'F');

    // Download
    const fileName = `HashBus_Ticket_${booking.id.substring(0, 8).toUpperCase()}_${Date.now()}.pdf`;
    pdf.save(fileName);

    console.log('✅ Professional premium PDF generated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    return false;
  }
};

const drawBusWatermark = (pdf: any, pageWidth: number, pageHeight: number) => {
  const busX = pageWidth / 2 - 35;
  const busY = pageHeight / 2 - 25;

  pdf.setFillColor(230, 230, 230);
  pdf.rect(busX, busY, 70, 30, 'F');

  pdf.setFillColor(220, 220, 220);
  pdf.rect(busX + 8, busY - 8, 54, 10, 'F');

  pdf.setFillColor(240, 240, 240);
  pdf.rect(busX + 12, busY - 4, 10, 7, 'F');
  pdf.rect(busX + 28, busY - 4, 8, 7, 'F');
  pdf.rect(busX + 40, busY - 4, 8, 7, 'F');

  pdf.setFillColor(210, 210, 210);
  pdf.rect(busX + 55, busY + 2, 12, 18, 'F');

  pdf.setFillColor(200, 200, 200);
  pdf.circle(busX + 15, busY + 30, 3.5, 'F');
  pdf.circle(busX + 58, busY + 30, 3.5, 'F');
};

export const downloadTicketAsPDF = async (booking: Booking) => {
  const button = document.querySelector('[data-download-button]') as HTMLButtonElement;
  const originalText = button?.textContent || 'Download Ticket (PDF)';

  if (button) {
    button.disabled = true;
    button.textContent = 'Generating PDF...';
  }

  try {
    const success = await generateTicketPDF(booking);
    if (success) {
      if (button) {
        button.textContent = '✓ Downloaded!';
        setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
        }, 2000);
      }
    } else {
      throw new Error('PDF generation failed');
    }
  } catch (error) {
    console.error('Download error:', error);
    alert('Failed to generate PDF. Please try again.');
    if (button) {
      button.disabled = false;
      button.textContent = originalText;
    }
  }
};