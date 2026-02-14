import jsPDF from 'jspdf';
import { Booking, Passenger } from '../types';

export const generateTicketPDF = async (booking: Booking, allPassengers?: Passenger[]) => {
  try {
    console.log('Starting professional premium PDF generation...');

    // ✅ Get all passengers
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

    // ==================== ADD LOGO BACKGROUND ====================
    await addLogoBackground(pdf, pageWidth, pageHeight);

    // ==================== DECORATIVE BACKGROUND GRADIENT ====================
    addBackgroundGradient(pdf, pageWidth, pageHeight);

    // ==================== TOP PREMIUM HEADER ====================
    drawPremiumHeader(pdf, pageWidth, booking);

    let yPosition = 58;

    // ==================== JOURNEY HIGHLIGHTS ====================
    drawJourneyHighlights(pdf, pageWidth, yPosition, booking);
    yPosition += 48;

    // ==================== KEY DETAILS GRID ====================
    yPosition = drawKeyDetailsGrid(pdf, pageWidth, yPosition, booking);

    // ==================== PICKUP & DROP WITH ICONS ====================
    yPosition = drawPickupDropSection(pdf, pageWidth, yPosition, booking);

    // ==================== ALL PASSENGERS INFO ====================
    yPosition = drawPassengersSection(pdf, pageWidth, pageHeight, yPosition, passengers, booking);

    // ==================== BUS INFO ====================
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      addLogoBackground(pdf, pageWidth, pageHeight);
      addBackgroundGradient(pdf, pageWidth, pageHeight);
      yPosition = 15;
    }

    yPosition = drawBusInfoSection(pdf, pageWidth, yPosition, booking);

    // ==================== PRICE SECTION ====================
    if (yPosition > pageHeight - 45) {
      pdf.addPage();
      addLogoBackground(pdf, pageWidth, pageHeight);
      addBackgroundGradient(pdf, pageWidth, pageHeight);
      yPosition = 15;
    }

    yPosition = drawPriceSection(pdf, pageWidth, yPosition, booking);

    // ==================== AMENITIES ====================
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      addLogoBackground(pdf, pageWidth, pageHeight);
      addBackgroundGradient(pdf, pageWidth, pageHeight);
      yPosition = 15;
    }

    yPosition = drawAmenitiesSection(pdf, pageWidth, yPosition);

    // ==================== TERMS & CONDITIONS ====================
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      addLogoBackground(pdf, pageWidth, pageHeight);
      addBackgroundGradient(pdf, pageWidth, pageHeight);
      yPosition = 15;
    }

    yPosition = drawTermsSection(pdf, pageWidth, pageHeight, yPosition);

    // ==================== FOOTER ====================
    drawPremiumFooter(pdf, pageWidth, pageHeight);

    // Download
    const fileName = `HashBus_Ticket_${booking.id.substring(0, 8).toUpperCase()}_${Date.now()}.pdf`;
    pdf.save(fileName);

    console.log('✅ Professional premium PDF generated successfully with', passengers.length, 'passengers');
    return true;
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    return false;
  }
};

// ==================== HELPER FUNCTIONS ====================

const addLogoBackground = async (pdf: any, pageWidth: number, pageHeight: number) => {
  try {
    const img = new Image();
    img.src = '/hashbus-logo.png'; // Logo from public folder
    
    img.onload = () => {
      // Add logo as watermark - semi-transparent
      pdf.saveGraphicsState();
      pdf.setGlobalAlpha(0.08);
      const logoSize = 120;
      const logoX = (pageWidth - logoSize) / 2;
      const logoY = (pageHeight - logoSize) / 2;
      pdf.addImage(img, 'PNG', logoX, logoY, logoSize, logoSize);
      pdf.restoreGraphicsState();
    };
  } catch (error) {
    console.log('Logo not found, continuing without it');
  }
};

const addBackgroundGradient = (pdf: any, pageWidth: number, pageHeight: number) => {
  // Subtle gradient background
  pdf.setFillColor(250, 248, 245);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
};

const drawPremiumHeader = (pdf: any, pageWidth: number, booking: Booking) => {
  // ==================== PREMIUM GRADIENT HEADER ====================
  // Top stripe - Amber gold
  pdf.setFillColor(212, 175, 55);
  pdf.rect(0, 0, pageWidth, 3, 'F');

  // Main header background - Dark with gradient effect
  pdf.setFillColor(20, 20, 35);
  pdf.rect(0, 3, pageWidth, 52, 'F');

  // Side accent bars
  pdf.setFillColor(76, 175, 80);
  pdf.rect(0, 3, 4, 52, 'F');

  pdf.setFillColor(33, 150, 243);
  pdf.rect(pageWidth - 4, 3, 4, 52, 'F');

  // Logo text
  pdf.setTextColor(212, 175, 55);
  pdf.setFontSize(42);
  pdf.setFont('helvetica', 'bold');
  pdf.text('HASHBUS', 15, 28);

  // Tagline
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(180, 180, 180);
  pdf.text('Luxury Travel - Premium Sleeper Comfort', 15, 35);

  // Certification badge
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(212, 175, 55);
  pdf.setLineWidth(2);
  pdf.rect(pageWidth - 100, 8, 85, 42, 'FD');

  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text('BOOKING ID', pageWidth - 95, 14);

  pdf.setTextColor(212, 175, 55);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  const ticketNumber = `HB${booking.id.substring(0, 10).toUpperCase()}`;
  pdf.text(ticketNumber, pageWidth - 95, 25);

  // Status badge with gradient effect
  pdf.setFillColor(76, 175, 80);
  pdf.rect(pageWidth - 95, 28, 25, 7, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'bold');
  pdf.text('✓ CONFIRMED', pageWidth - 92, 32.5);

  // QR-like code style element
  pdf.setDrawColor(212, 175, 55);
  pdf.setLineWidth(0.5);
  pdf.rect(pageWidth - 95, 36, 20, 12, 'S');
  pdf.setFontSize(5);
  pdf.setTextColor(150, 150, 150);
  pdf.text('QR', pageWidth - 88, 40);
};

const drawJourneyHighlights = (pdf: any, pageWidth: number, yPosition: number, booking: Booking) => {
  // Outer container
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(212, 175, 55);
  pdf.setLineWidth(3);
  pdf.rect(15, yPosition, pageWidth - 30, 40, 'FD');

  // Header stripe
  pdf.setFillColor(212, 175, 55);
  pdf.rect(15, yPosition - 6, 70, 6, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('JOURNEY DETAILS', 18, yPosition - 1.5);

  // FROM - Left side with color
  pdf.setFillColor(240, 253, 244);
  pdf.rect(15, yPosition + 3, (pageWidth - 30) / 3 - 2, 34, 'F');

  pdf.setTextColor(76, 175, 80);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DEPARTURE CITY', 18, yPosition + 7);

  pdf.setTextColor(20, 20, 30);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  const fromCity = booking.route.from.name.substring(0, 3).toUpperCase();
  pdf.text(fromCity, 18, yPosition + 20);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(booking.route.from.name, 18, yPosition + 28);

  // ARROW - Center
  pdf.setTextColor(212, 175, 55);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('→', pageWidth / 2 - 8, yPosition + 20);

  // TO - Right side with color
  pdf.setFillColor(254, 242, 242);
  pdf.rect(15 + (pageWidth - 30) * 2 / 3 + 2, yPosition + 3, (pageWidth - 30) / 3 - 2, 34, 'F');

  pdf.setTextColor(244, 67, 54);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ARRIVAL CITY', 15 + (pageWidth - 30) * 2 / 3 + 5, yPosition + 7);

  pdf.setTextColor(20, 20, 30);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  const toCity = booking.route.to.name.substring(0, 3).toUpperCase();
  pdf.text(toCity, 15 + (pageWidth - 30) * 2 / 3 + 5, yPosition + 20);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(booking.route.to.name, 15 + (pageWidth - 30) * 2 / 3 + 5, yPosition + 28);
};

const drawKeyDetailsGrid = (pdf: any, pageWidth: number, yPosition: number, booking: Booking) => {
  const gridWidth = (pageWidth - 30) / 2 - 2;
  const gridHeight = 18;
  const colors = [
    { bg: [240, 248, 255], border: [33, 150, 243] }, // Blue
    { bg: [255, 253, 240], border: [255, 152, 0] },  // Orange
    { bg: [245, 242, 250], border: [156, 39, 176] }, // Purple
    { bg: [255, 251, 235], border: [212, 175, 55] }  // Gold
  ];

  const details = [
    { label: 'DATE', value: booking.journeyDate instanceof Date ? booking.journeyDate.toLocaleDateString('en-GB') : String(booking.journeyDate) },
    { label: 'DEPARTURE', value: booking.bus.departureTime.includes(':') ? booking.bus.departureTime : new Date(booking.bus.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) },
    { label: 'DURATION', value: booking.bus.duration || '10h 11m' },
    { label: 'YOUR SEATS', value: booking.selectedSeats.map(s => s.number).join(', ') }
  ];

  let colorIndex = 0;
  for (let i = 0; i < details.length; i++) {
    const isRight = i % 2 === 1;
    const xPos = isRight ? 15 + gridWidth + 4 : 15;
    const detail = details[i];
    const color = colors[i];

    pdf.setFillColor(...color.bg);
    pdf.setDrawColor(...color.border);
    pdf.setLineWidth(1.5);
    pdf.rect(xPos, yPosition, gridWidth, gridHeight, 'FD');

    pdf.setTextColor(...color.border);
    pdf.setFontSize(6.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text(detail.label, xPos + 3, yPosition + 4);

    pdf.setTextColor(20, 20, 30);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(detail.value, xPos + 3, yPosition + 13);

    if (i % 2 === 1) {
      yPosition += gridHeight + 2;
    }
  }

  return yPosition;
};

const drawPickupDropSection = (pdf: any, pageWidth: number, yPosition: number, booking: Booking) => {
  const halfWidth = (pageWidth - 30) / 2 - 2;

  // Pickup
  pdf.setFillColor(240, 253, 244);
  pdf.setDrawColor(76, 175, 80);
  pdf.setLineWidth(2);
  pdf.rect(15, yPosition, halfWidth, 22, 'FD');

  pdf.setFillColor(76, 175, 80);
  pdf.rect(15, yPosition - 1, 8, 6, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('P', 17, yPosition + 2.5);

  pdf.setTextColor(76, 175, 80);
  pdf.setFontSize(6.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PICKUP LOCATION', 18, yPosition + 4);

  pdf.setTextColor(20, 20, 30);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text(booking.pickupPoint.name, 18, yPosition + 13);

  // Drop
  pdf.setFillColor(254, 242, 242);
  pdf.setDrawColor(244, 67, 54);
  pdf.setLineWidth(2);
  pdf.rect(15 + halfWidth + 4, yPosition, halfWidth, 22, 'FD');

  pdf.setFillColor(244, 67, 54);
  pdf.rect(15 + halfWidth + 4, yPosition - 1, 8, 6, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('D', 18 + halfWidth + 4, yPosition + 2.5);

  pdf.setTextColor(244, 67, 54);
  pdf.setFontSize(6.5);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DROP LOCATION', 18 + halfWidth + 4, yPosition + 4);

  pdf.setTextColor(20, 20, 30);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text(booking.dropPoint.name, 18 + halfWidth + 4, yPosition + 13);

  return yPosition + 28;
};

const drawPassengersSection = (pdf: any, pageWidth: number, pageHeight: number, yPosition: number, passengers: Passenger[], booking: Booking) => {
  pdf.setFillColor(156, 39, 176);
  pdf.rect(15, yPosition, pageWidth - 30, 5, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`PASSENGER INFORMATION (${passengers.length})`, 20, yPosition + 3);

  yPosition += 7;

  passengers.forEach((passenger, index) => {
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      addLogoBackground(pdf, pageWidth, pageHeight);
      addBackgroundGradient(pdf, pageWidth, pageHeight);
      yPosition = 15;
    }

    const colors = [
      { bg: [225, 245, 254], border: [33, 150, 243] },   // Blue
      { bg: [245, 235, 245], border: [156, 39, 176] },   // Purple
      { bg: [240, 253, 244], border: [76, 175, 80] },    // Green
      { bg: [255, 250, 235], border: [255, 152, 0] }     // Orange
    ];

    const color = colors[index % colors.length];

    pdf.setFillColor(...color.bg);
    pdf.setDrawColor(...color.border);
    pdf.setLineWidth(1.5);
    pdf.rect(15, yPosition, pageWidth - 30, 32, 'FD');

    // Header with color
    pdf.setFillColor(...color.border);
    pdf.rect(15, yPosition, pageWidth - 30, 5, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`PASSENGER ${index + 1}`, 20, yPosition + 3);

    pdf.setFontSize(6);
    pdf.text(`Seat: ${booking.selectedSeats[index]?.number || 'N/A'}`, pageWidth - 40, yPosition + 3);

    // Details
    pdf.setTextColor(20, 20, 30);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${passenger.name}`, 20, yPosition + 10);

    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 80, 80);
    pdf.text(`Age: ${passenger.age} | Gender: ${passenger.gender}`, 20, yPosition + 15);
    pdf.text(`Mobile: ${passenger.mobile}`, 20, yPosition + 20);
    pdf.text(`Email: ${passenger.email}`, 20, yPosition + 25);

    yPosition += 36;
  });

  return yPosition;
};

const drawBusInfoSection = (pdf: any, pageWidth: number, yPosition: number, booking: Booking) => {
  pdf.setFillColor(245, 240, 250);
  pdf.setDrawColor(156, 39, 176);
  pdf.setLineWidth(2);
  pdf.rect(15, yPosition, pageWidth - 30, 24, 'FD');

  pdf.setFillColor(156, 39, 176);
  pdf.rect(15, yPosition - 1, 60, 6, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('BUS DETAILS', 18, yPosition + 3);

  pdf.setTextColor(20, 20, 30);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Bus: ${booking.bus.name}`, 20, yPosition + 10);

  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Type: ${booking.bus.coachType} | Total Seats: ${booking.bus.totalSeats}`, 20, yPosition + 15);

  pdf.setTextColor(80, 80, 80);
  pdf.text(`Bus Number: ${booking.bus.number}`, 20, yPosition + 20);

  return yPosition + 28;
};

const drawPriceSection = (pdf: any, pageWidth: number, yPosition: number, booking: Booking) => {
  // Premium dark background
  pdf.setFillColor(20, 20, 35);
  pdf.rect(15, yPosition, pageWidth - 30, 22, 'F');

  // Gold stripe
  pdf.setFillColor(212, 175, 55);
  pdf.rect(15, yPosition, 4, 22, 'F');

  // Content
  pdf.setTextColor(212, 175, 55);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('TOTAL FARE', 25, yPosition + 6);

  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  const priceStr = `₹${Math.round(booking.totalAmount)}`;
  pdf.text(priceStr, 25, yPosition + 17);

  return yPosition + 26;
};

const drawAmenitiesSection = (pdf: any, pageWidth: number, yPosition: number) => {
  const amenities = ['WiFi', 'AC', 'USB Charging', 'Blankets & Pillows', 'Complimentary Snacks', 'Safety Equipment'];

  pdf.setFillColor(240, 253, 244);
  pdf.setDrawColor(76, 175, 80);
  pdf.setLineWidth(2);
  pdf.rect(15, yPosition, pageWidth - 30, 5, 'FD');

  pdf.setTextColor(76, 175, 80);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('BUS AMENITIES', 20, yPosition + 3);

  yPosition += 7;

  // Amenities grid
  const itemsPerRow = 3;
  const itemWidth = (pageWidth - 30) / itemsPerRow - 1;

  amenities.forEach((amenity, index) => {
    const row = Math.floor(index / itemsPerRow);
    const col = index % itemsPerRow;
    const xPos = 15 + col * (itemWidth + 1);
    const yPos = yPosition + row * 8;

    pdf.setFillColor(200, 230, 201);
    pdf.setDrawColor(76, 175, 80);
    pdf.setLineWidth(0.5);
    pdf.rect(xPos, yPos, itemWidth, 7, 'FD');

    pdf.setTextColor(27, 94, 32);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`✓ ${amenity}`, xPos + 2, yPos + 4.5);
  });

  return yPosition + 16;
};

const drawTermsSection = (pdf: any, pageWidth: number, pageHeight: number, yPosition: number) => {
  pdf.setFillColor(20, 20, 35);
  pdf.setDrawColor(212, 175, 55);
  pdf.setLineWidth(1.5);
  pdf.rect(15, yPosition, pageWidth - 30, 5, 'FD');

  pdf.setTextColor(212, 175, 55);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text('IMPORTANT INFORMATION & TERMS', 20, yPosition + 3);

  yPosition += 6;

  const terms = [
    '✓ Please arrive 15 minutes before scheduled departure.',
    '✓ Carry valid government-issued photo ID during journey.',
    '✓ Ticket is non-transferable and valid for specified date, time & seats.',
    '✓ For assistance: +91 91071 68168 or support@hashbus.in',
    '✓ Safe and comfortable sleeper compartments with premium amenities.',
    '✓ Professional drivers trained in safety and customer service.'
  ];

  pdf.setFontSize(6.5);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(80, 80, 80);

  terms.forEach((term) => {
    if (yPosition > pageHeight - 15) {
      pdf.addPage();
      addLogoBackground(pdf, pageWidth, pageHeight);
      addBackgroundGradient(pdf, pageWidth, pageHeight);
      yPosition = 15;
    }
    pdf.text(term, 20, yPosition);
    yPosition += 4.5;
  });

  return yPosition;
};

const drawPremiumFooter = (pdf: any, pageWidth: number, pageHeight: number) => {
  const footerY = pageHeight - 12;

  // Top separator
  pdf.setDrawColor(212, 175, 55);
  pdf.setLineWidth(1);
  pdf.line(15, footerY - 2, pageWidth - 15, footerY - 2);

  // Footer background
  pdf.setFillColor(20, 20, 35);
  pdf.rect(0, footerY, pageWidth, 12, 'F');

  // Gold bottom stripe
  pdf.setFillColor(212, 175, 55);
  pdf.rect(0, pageHeight - 2.5, pageWidth, 2.5, 'F');

  // Text
  pdf.setTextColor(180, 180, 180);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  const centerX = pageWidth / 2;
  pdf.text('🚌 Thank you for choosing HashBus. Safe travels!', centerX, footerY + 4, { align: 'center' });

  pdf.setFontSize(6);
  pdf.setTextColor(120, 120, 120);
  const currentDate = new Date().toLocaleDateString('en-GB');
  pdf.text(`Generated on ${currentDate} | HashBus Premium Sleeper Travel Services`, centerX, footerY + 8, { align: 'center' });
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