import jsPDF from 'jspdf';
import { Booking, Passenger } from '../types';

export const generateTicketPDF = async (booking: Booking, allPassengers?: Passenger[]) => {
  try {
    console.log('🎫 Starting professional ticket PDF generation...');

    const passengers = allPassengers && allPassengers.length > 0 
      ? allPassengers 
      : [booking.passenger];

    console.log('📄 Generating PDF for', passengers.length, 'passengers');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // ==================== BACKGROUND ====================
    pdf.setFillColor(248, 249, 250);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // ==================== SECTIONS ====================
    drawHeaderSection(pdf, pageWidth);
    let yPos = drawBookingIDSection(pdf, pageWidth, 25, booking);
    yPos = drawJourneySection(pdf, pageWidth, yPos, booking);
    yPos = drawDetailsBoxes(pdf, pageWidth, yPos, booking);
    yPos = drawPassengerSection(pdf, pageWidth, yPos, passengers, booking);
    yPos = drawPickupDropSection(pdf, pageWidth, yPos, booking);
    yPos = drawBusDetailsSection(pdf, pageWidth, yPos, booking);
    yPos = drawPriceSection(pdf, pageWidth, yPos, booking);
    drawImportantInfoFooter(pdf, pageWidth, pageHeight);

    // Download
    const fileName = `HashBus_Ticket_${booking.id.substring(0, 8).toUpperCase()}_${Date.now()}.pdf`;
    pdf.save(fileName);

    console.log('✅ Professional ticket PDF generated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    return false;
  }
};

// ==================== HELPER FUNCTIONS ====================

const drawHeaderSection = (pdf: any, pageWidth: number) => {
  // Gradient-like top bar
  pdf.setFillColor(212, 175, 55);
  pdf.rect(0, 0, pageWidth, 3, 'F');

  // White header background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 3, pageWidth, 18, 'F');

  // Logo section
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(212, 175, 55);
  pdf.text('HashBus', 15, 15);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Travel, Upgraded', 15, 19);

  // Divider
  pdf.setDrawColor(230, 230, 230);
  pdf.setLineWidth(0.3);
  pdf.line(0, 21, pageWidth, 21);
};

const drawBookingIDSection = (pdf: any, pageWidth: number, yPos: number, booking: Booking) => {
  // Light background
  pdf.setFillColor(250, 250, 250);
  pdf.rect(0, yPos, pageWidth, 10, 'F');

  // Booking ID label
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(120, 120, 120);
  pdf.text('BOOKING ID', 15, yPos + 3);

  // Booking ID value
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(212, 175, 55);
  const bookingId = `HB${booking.id.substring(0, 10).toUpperCase()}`;
  pdf.text(bookingId, 15, yPos + 8);

  // Journey date on right
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(120, 120, 120);
  pdf.text('Journey Date', pageWidth - 60, yPos + 3);

  const dateStr = booking.journeyDate instanceof Date 
    ? booking.journeyDate.toLocaleDateString('en-GB')
    : String(booking.journeyDate);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(20, 20, 30);
  pdf.text(dateStr, pageWidth - 60, yPos + 8);

  return yPos + 12;
};

const drawJourneySection = (pdf: any, pageWidth: number, yPos: number, booking: Booking) => {
  // Main journey card
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(212, 175, 55);
  pdf.setLineWidth(1);
  pdf.rect(15, yPos, pageWidth - 30, 45, 'FD');

  // From city - Large
  const fromCity = booking.route.from.name.substring(0, 3).toUpperCase();
  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(20, 20, 30);
  pdf.text(fromCity, 25, yPos + 18);

  // From city name
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(booking.route.from.name, 25, yPos + 24);

  // Journey duration in center
  const centerX = pageWidth / 2;
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(212, 175, 55);
  pdf.text('→', centerX - 3, yPos + 18);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(120, 120, 120);
  pdf.text(booking.bus.duration || '8h 0m', centerX - 8, yPos + 24);

  // To city - Large
  const toCity = booking.route.to.name.substring(0, 3).toUpperCase();
  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(20, 20, 30);
  pdf.text(toCity, pageWidth - 45, yPos + 18);

  // To city name
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(booking.route.to.name, pageWidth - 45, yPos + 24);

  // Departure time info on right
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Departure', pageWidth - 45, yPos + 31);

  const depTime = booking.bus.departureTime;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(212, 175, 55);
  pdf.text(depTime, pageWidth - 45, yPos + 38);

  return yPos + 50;
};

const drawDetailsBoxes = (pdf: any, pageWidth: number, yPos: number, booking: Booking) => {
  const boxWidth = (pageWidth - 45) / 3;
  const boxHeight = 22;
  const margin = 15;

  // Box 1: Bus
  drawDetailBox(pdf, margin, yPos, boxWidth, boxHeight, 
    'BUS', 
    booking.bus.name.substring(0, 20),
    [240, 248, 255],
    [200, 220, 240]
  );

  // Box 2: Seat
  const seatNumbers = booking.selectedSeats.map(s => s.number).join(', ');
  drawDetailBox(pdf, margin + boxWidth + 7, yPos, boxWidth, boxHeight,
    'SEAT',
    seatNumbers,
    [245, 245, 245],
    [220, 220, 220],
    true
  );

  // Box 3: Passengers
  drawDetailBox(pdf, margin + (boxWidth + 7) * 2, yPos, boxWidth, boxHeight,
    'PASSENGERS',
    booking.selectedSeats.length.toString(),
    [240, 245, 240],
    [200, 220, 200],
    true
  );

  return yPos + boxHeight + 5;
};

const drawDetailBox = (
  pdf: any,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  value: string,
  fillColor: number[],
  borderColor: number[],
  centerValue: boolean = false
) => {
  // Border
  pdf.setDrawColor(...borderColor);
  pdf.setLineWidth(1);
  pdf.setFillColor(...fillColor);
  pdf.rect(x, y, width, height, 'FD');

  // Label
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(100, 100, 100);
  pdf.text(label, x + 5, y + 4);

  // Value
  pdf.setFontSize(centerValue ? 16 : 10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(centerValue ? 212 : 20, centerValue ? 175 : 20, centerValue ? 55 : 30);
  
  const textX = centerValue ? x + width / 2 : x + 5;
  const textY = y + height - 6;
  
  if (centerValue) {
    pdf.text(value, textX, textY, { align: 'center' });
  } else {
    pdf.text(value.substring(0, 15), textX, textY);
  }
};

const drawPassengerSection = (
  pdf: any,
  pageWidth: number,
  yPos: number,
  passengers: Passenger[],
  booking: Booking
) => {
  // Header background
  pdf.setFillColor(250, 250, 250);
  pdf.rect(15, yPos, pageWidth - 30, 6, 'F');

  // Header
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(20, 20, 30);
  pdf.text(`PASSENGER DETAILS (${passengers.length})`, 20, yPos + 4);

  yPos += 8;

  // Passenger details
  passengers.forEach((passenger, index) => {
    const seatNum = booking.selectedSeats[index]?.number || 'N/A';
    
    // Passenger row background
    if (index % 2 === 0) {
      pdf.setFillColor(248, 249, 250);
      pdf.rect(15, yPos, pageWidth - 30, 6, 'F');
    }

    // Passenger number and name
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(20, 20, 30);
    pdf.text(`${index + 1}. ${passenger.name}`, 20, yPos + 4);

    // Seat and age info
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(120, 120, 120);
    pdf.text(`Seat ${seatNum} | Age ${passenger.age || 'N/A'} | ${passenger.gender || 'N/A'}`, pageWidth - 60, yPos + 4);

    yPos += 6;
  });

  return yPos + 3;
};

const drawPickupDropSection = (
  pdf: any,
  pageWidth: number,
  yPos: number,
  booking: Booking
) => {
  const boxWidth = (pageWidth - 45) / 2;
  const margin = 15;

  // Pickup box
  pdf.setDrawColor(200, 220, 200);
  pdf.setLineWidth(1);
  pdf.setFillColor(240, 248, 240);
  pdf.rect(margin, yPos, boxWidth, 20, 'FD');

  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(100, 150, 100);
  pdf.text('PICKUP POINT', margin + 5, yPos + 3);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(20, 20, 30);
  const pickupText = booking.pickupPoint.name.substring(0, 25);
  pdf.text(pickupText, margin + 5, yPos + 10);

  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(120, 120, 120);
  pdf.text('Arrive 15 minutes before', margin + 5, yPos + 16);

  // Drop box
  pdf.setDrawColor(220, 200, 200);
  pdf.setLineWidth(1);
  pdf.setFillColor(248, 240, 240);
  pdf.rect(margin + boxWidth + 7, yPos, boxWidth, 20, 'FD');

  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(150, 100, 100);
  pdf.text('DROP POINT', margin + boxWidth + 12, yPos + 3);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(20, 20, 30);
  const dropText = booking.dropPoint.name.substring(0, 25);
  pdf.text(dropText, margin + boxWidth + 12, yPos + 10);

  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(120, 120, 120);
  pdf.text('Estimated arrival', margin + boxWidth + 12, yPos + 16);

  return yPos + 25;
};

const drawBusDetailsSection = (
  pdf: any,
  pageWidth: number,
  yPos: number,
  booking: Booking
) => {
  // Header background
  pdf.setFillColor(250, 250, 250);
  pdf.rect(15, yPos, pageWidth - 30, 6, 'F');

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(20, 20, 30);
  pdf.text('BUS DETAILS', 20, yPos + 4);

  yPos += 8;

  // Details
  const details = [
    { label: 'Bus Name:', value: booking.bus.name },
    { label: 'Bus Type:', value: booking.bus.coachType },
    { label: 'Registration:', value: booking.bus.number },
    { label: 'Total Seats:', value: booking.bus.totalSeats.toString() },
  ];

  details.forEach((detail, index) => {
    if (index % 2 === 0) {
      pdf.setFillColor(248, 249, 250);
      pdf.rect(15, yPos, pageWidth - 30, 5, 'F');
    }

    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(120, 120, 120);
    pdf.text(detail.label, 20, yPos + 3.5);

    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(20, 20, 30);
    pdf.text(detail.value.substring(0, 40), 60, yPos + 3.5);

    yPos += 5;
  });

  return yPos + 3;
};

const drawPriceSection = (
  pdf: any,
  pageWidth: number,
  yPos: number,
  booking: Booking
) => {
  const boxWidth = pageWidth - 30;
  const margin = 15;

  // Background
  pdf.setFillColor(212, 175, 55);
  pdf.setDrawColor(212, 175, 55);
  pdf.rect(margin, yPos, boxWidth, 35, 'FD');

  // Header
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('PRICE BREAKDOWN', margin + 5, yPos + 5);

  // Calculate prices
  const subtotal = booking.selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + taxes;

  // Price details
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(255, 255, 255);

  const baseFare = Math.round(subtotal / booking.selectedSeats.length);
  pdf.text(`Base Fare (${booking.selectedSeats.length} × ₹${baseFare})`, margin + 5, yPos + 12);
  pdf.text(`₹${subtotal}`, pageWidth - 35, yPos + 12);

  pdf.text('Taxes & Service Fee', margin + 5, yPos + 18);
  pdf.text(`₹${taxes}`, pageWidth - 35, yPos + 18);

  // Divider
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(0.5);
  pdf.line(margin + 5, yPos + 22, pageWidth - 20, yPos + 22);

  // Total
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TOTAL PAYABLE', margin + 5, yPos + 29);
  pdf.text(`₹${total}`, pageWidth - 35, yPos + 29);

  return yPos + 38;
};

const drawImportantInfoFooter = (pdf: any, pageWidth: number, pageHeight: number) => {
  const footerY = pageHeight - 28;

  // Divider
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.3);
  pdf.line(15, footerY, pageWidth - 15, footerY);

  // Important info box
  pdf.setFillColor(255, 251, 235);
  pdf.setDrawColor(255, 152, 0);
  pdf.setLineWidth(1);
  pdf.rect(15, footerY + 3, pageWidth - 30, 16, 'FD');

  // Header
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 102, 0);
  pdf.text('⚠ IMPORTANT INFORMATION', 20, footerY + 7);

  // Information points
  const info = [
    '• Arrive 15 minutes before departure time',
    '• Carry a valid ID proof (Passport/Aadhaar/DL)',
    '• This ticket is non-transferable',
    '• Contact: +91 91071 68168 | Email: support@hashbus.com',
  ];

  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(80, 80, 80);

  info.forEach((line, index) => {
    pdf.text(line, 20, footerY + 11 + (index * 3.5));
  });

  // Footer branding
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(150, 150, 150);
  pdf.text('Thank you for choosing HashBus - Travel, Upgraded', pageWidth / 2, pageHeight - 1, { align: 'center' });
};

export const downloadTicketAsPDF = async (booking: Booking, allPassengers?: Passenger[]) => {
  const button = document.querySelector('[data-download-button]') as HTMLButtonElement;
  const originalText = button?.textContent || 'Download Ticket (PDF)';

  if (button) {
    button.disabled = true;
    button.textContent = 'Generating PDF...';
  }

  try {
    const success = await generateTicketPDF(booking, allPassengers);
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