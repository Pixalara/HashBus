import jsPDF from 'jspdf';
import { Booking, Passenger } from '../types';

export const generateTicketPDF = async (booking: Booking, allPassengers?: Passenger[]) => {
  try {
    console.log('Starting professional MakeMyTrip-style PDF generation...');

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

    // ==================== TOP HEADER SECTION ====================
    drawHeaderSection(pdf, pageWidth, booking);

    // ==================== MAIN CONTENT AREA ====================
    let yPos = 28;

    // Journey card
    yPos = drawJourneyCard(pdf, pageWidth, yPos, booking);

    // Key details row
    yPos = drawDetailsRow(pdf, pageWidth, yPos, booking);

    // Passenger & Location details
    yPos = drawPassengerLocationDetails(pdf, pageWidth, yPos, booking, passengers);

    // Bus & Price section (side by side)
    yPos = drawBusAndPriceSection(pdf, pageWidth, yPos, booking, passengers);

    // Important info footer
    drawImportantInfoFooter(pdf, pageWidth, pageHeight);

    // Download
    const fileName = `HashBus_Ticket_${booking.id.substring(0, 8).toUpperCase()}_${Date.now()}.pdf`;
    pdf.save(fileName);

    console.log('✅ Professional MakeMyTrip-style PDF generated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    return false;
  }
};

// ==================== HELPER FUNCTIONS ====================

const drawHeaderSection = (pdf: any, pageWidth: number, booking: Booking) => {
  // Top colored bar - HashBus brand color
  pdf.setFillColor(212, 175, 55);
  pdf.rect(0, 0, pageWidth, 4, 'F');

  // White header background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 4, pageWidth, 20, 'F');

  // Logo placeholder - you can add actual logo
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(212, 175, 55);
  pdf.text('HashBus', 12, 15);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Travel, Upgraded', 12, 19);

  // Booking ID on right
  pdf.setFontSize(7);
  pdf.setTextColor(120, 120, 120);
  pdf.text('BOOKING ID', pageWidth - 60, 11);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(212, 175, 55);
  pdf.text(`HB${booking.id.substring(0, 10).toUpperCase()}`, pageWidth - 60, 17);

  // Divider
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.5);
  pdf.line(10, 24, pageWidth - 10, 24);
};

const drawJourneyCard = (pdf: any, pageWidth: number, yPos: number, booking: Booking) => {
  // Card background
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.5);
  pdf.rect(10, yPos, pageWidth - 20, 35, 'FD');

  // From city
  const fromCity = booking.route.from.name.substring(0, 3).toUpperCase();
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(20, 20, 30);
  pdf.text(fromCity, 18, yPos + 12);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(booking.route.from.name, 18, yPos + 18);

  // Arrow and journey time
  pdf.setFontSize(16);
  pdf.setTextColor(212, 175, 55);
  pdf.setFont('helvetica', 'bold');
  const centerX = pageWidth / 2;
  pdf.text('→', centerX - 5, yPos + 12);

  pdf.setFontSize(7);
  pdf.setTextColor(120, 120, 120);
  pdf.setFont('helvetica', 'normal');
  pdf.text(booking.bus.duration || '8h 1m', centerX - 8, yPos + 18);

  // To city
  const toCity = booking.route.to.name.substring(0, 3).toUpperCase();
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(20, 20, 30);
  pdf.text(toCity, pageWidth - 35, yPos + 12);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(booking.route.to.name, pageWidth - 35, yPos + 18);

  // Date and departure time on right
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(20, 20, 30);
  const dateStr = booking.journeyDate instanceof Date 
    ? booking.journeyDate.toLocaleDateString('en-GB') 
    : String(booking.journeyDate);
  pdf.text(dateStr, pageWidth - 50, yPos + 30);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  const depTime = booking.bus.departureTime.includes(':') 
    ? booking.bus.departureTime 
    : new Date(booking.bus.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  pdf.text(`Departs ${depTime}`, pageWidth - 50, yPos + 35);

  return yPos + 39;
};

const drawDetailsRow = (pdf: any, pageWidth: number, yPos: number, booking: Booking) => {
  const boxWidth = (pageWidth - 30) / 3 - 2;

  // Box 1: Bus
  pdf.setFillColor(240, 248, 255);
  pdf.setDrawColor(200, 220, 240);
  pdf.setLineWidth(0.5);
  pdf.rect(10, yPos, boxWidth, 18, 'FD');

  pdf.setFontSize(7);
  pdf.setTextColor(100, 150, 200);
  pdf.setFont('helvetica', 'bold');
  pdf.text('BUS', 15, yPos + 4);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(20, 20, 30);
  pdf.text(booking.bus.name.substring(0, 25), 15, yPos + 12);

  // Box 2: Seats
  const xPos2 = 10 + boxWidth + 5;
  pdf.setFillColor(245, 245, 245);
  pdf.setDrawColor(220, 220, 220);
  pdf.rect(xPos2, yPos, boxWidth, 18, 'FD');

  pdf.setFontSize(7);
  pdf.setTextColor(120, 120, 120);
  pdf.setFont('helvetica', 'bold');
  pdf.text('YOUR SEAT', xPos2 + 5, yPos + 4);

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(212, 175, 55);
  const seatNumbers = booking.selectedSeats.map(s => s.number).join(', ');
  pdf.text(seatNumbers, xPos2 + 5, yPos + 13);

  // Box 3: Passengers
  const xPos3 = 10 + (boxWidth + 5) * 2;
  pdf.setFillColor(240, 245, 240);
  pdf.setDrawColor(200, 220, 200);
  pdf.rect(xPos3, yPos, boxWidth, 18, 'FD');

  pdf.setFontSize(7);
  pdf.setTextColor(100, 150, 100);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PASSENGER(S)', xPos3 + 5, yPos + 4);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(20, 20, 30);
  pdf.text(booking.selectedSeats.length.toString(), xPos3 + 5, yPos + 13);

  return yPos + 22;
};

const drawPassengerLocationDetails = (pdf: any, pageWidth: number, yPos: number, booking: Booking, passengers: Passenger[]) => {
  // Passenger section
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.5);
  pdf.rect(10, yPos, pageWidth - 20, 28, 'FD');

  // Header
  pdf.setFillColor(248, 249, 250);
  pdf.rect(10, yPos, pageWidth - 20, 5, 'F');

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(20, 20, 30);
  pdf.text(`PASSENGER DETAILS (${passengers.length})`, 15, yPos + 3.5);

  // Passenger info
  let passengerY = yPos + 7;
  passengers.slice(0, 2).forEach((passenger, index) => {
    const seatNum = booking.selectedSeats[index]?.number || 'N/A';
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(20, 20, 30);
    pdf.text(`${index + 1}. ${passenger.name}`, 15, passengerY);

    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Seat ${seatNum} | Age ${passenger.age}`, 100, passengerY);

    passengerY += 6;
  });

  // Pickup & Drop section
  const halfWidth = (pageWidth - 30) / 2 - 2;
  
  // Pickup
  pdf.setFillColor(240, 248, 240);
  pdf.setDrawColor(200, 220, 200);
  pdf.rect(10, yPos + 24, halfWidth, 18, 'FD');

  pdf.setFontSize(7);
  pdf.setTextColor(100, 150, 100);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PICKUP', 15, yPos + 27);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(20, 20, 30);
  const pickupText = booking.pickupPoint.name.substring(0, 20);
  pdf.text(pickupText, 15, yPos + 33);

  // Drop
  pdf.setFillColor(248, 240, 240);
  pdf.setDrawColor(220, 200, 200);
  pdf.rect(10 + halfWidth + 4, yPos + 24, halfWidth, 18, 'FD');

  pdf.setFontSize(7);
  pdf.setTextColor(150, 100, 100);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DROP', 15 + halfWidth + 4, yPos + 27);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(20, 20, 30);
  const dropText = booking.dropPoint.name.substring(0, 20);
  pdf.text(dropText, 15 + halfWidth + 4, yPos + 33);

  return yPos + 46;
};

const drawBusAndPriceSection = (pdf: any, pageWidth: number, yPos: number, booking: Booking, passengers: Passenger[]) => {
  const halfWidth = (pageWidth - 30) / 2 - 2;

  // Bus Details (Left)
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.5);
  pdf.rect(10, yPos, halfWidth, 30, 'FD');

  pdf.setFillColor(245, 245, 245);
  pdf.rect(10, yPos, halfWidth, 5, 'F');

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(20, 20, 30);
  pdf.text('BUS DETAILS', 15, yPos + 3.5);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Bus: ${booking.bus.name}`, 15, yPos + 10);
  pdf.text(`Type: ${booking.bus.coachType}`, 15, yPos + 15);
  pdf.text(`Reg: ${booking.bus.number}`, 15, yPos + 20);
  pdf.text(`Total Seats: ${booking.bus.totalSeats}`, 15, yPos + 25);

  // Price Breakdown (Right)
  pdf.setFillColor(212, 175, 55);
  pdf.rect(10 + halfWidth + 4, yPos, halfWidth, 30, 'FD');

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('PRICE BREAKDOWN', 15 + halfWidth + 4, yPos + 3.5);

  // Calculate prices
  const subtotal = booking.selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + taxes;

  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(255, 255, 255);
  
  const baseText = `Base Fare (${booking.selectedSeats.length} × ${Math.round(subtotal / booking.selectedSeats.length)})`;
  pdf.text(baseText, 15 + halfWidth + 4, yPos + 10);
  pdf.text(`Subtotal: ₹${subtotal}`, 15 + halfWidth + 4, yPos + 14);

  pdf.text(`Taxes & Fees: ₹${taxes}`, 15 + halfWidth + 4, yPos + 18);

  // Total
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(255, 255, 255);
  pdf.line(15 + halfWidth + 4, yPos + 20, pageWidth - 10, yPos + 20);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TOTAL PAYABLE', 15 + halfWidth + 4, yPos + 25);
  pdf.text(`₹${total}`, pageWidth - 25, yPos + 25);

  return yPos + 34;
};

const drawImportantInfoFooter = (pdf: any, pageWidth: number, pageHeight: number) => {
  const footerY = pageHeight - 22;

  // Divider
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.5);
  pdf.line(10, footerY, pageWidth - 10, footerY);

  // Important info box
  pdf.setFillColor(255, 251, 235);
  pdf.setDrawColor(255, 152, 0);
  pdf.setLineWidth(0.5);
  pdf.rect(10, footerY + 2, pageWidth - 20, 15, 'FD');

  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 102, 0);
  pdf.text('IMPORTANT INFORMATION', 15, footerY + 5);

  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(80, 80, 80);
  const terms = [
    '• Arrive 15 minutes before departure • Carry valid ID proof',
    '• Non-transferable ticket • Contact: +91 91071 68168'
  ];
  
  terms.forEach((term, index) => {
    pdf.text(term, 15, footerY + 9 + (index * 4));
  });

  // Bottom branding
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(150, 150, 150);
  const centerX = pageWidth / 2;
  pdf.text('Thank you for choosing HashBus - Travel, Upgraded', centerX, pageHeight - 2, { align: 'center' });
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