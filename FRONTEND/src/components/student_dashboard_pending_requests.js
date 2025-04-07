import { useEffect, useState, useRef } from "react";
import { usePDF } from "react-to-pdf";
import { FiDownloadCloud } from "react-icons/fi";
import logo from "../assets/SGSITS_main_logo.png";

function StudentDashboardPendingRequests() {
  const [bookingData, setBookingData] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filter, setFilter] = useState("All");
  const [bookingPDFData, setBookingPDFData] = useState(null);
  const { toPDF, targetRef } = usePDF({ filename: "Booking_Approval.pdf" });
  const pdfContainerRef = useRef(null);
  const [paymentStatus, setPaymentStatus] = useState({});
  const userData = JSON.parse(localStorage.getItem("authToken"));
  useEffect(() => {
    const storedPaymentStatus = localStorage.getItem("paymentStatus");
    if (storedPaymentStatus) {
      setPaymentStatus(JSON.parse(storedPaymentStatus));
    }

    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/api/booking/userBookings",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userData.token}`,
            },
          }
        );

        const hallData = await response.json();
        setBookingData(hallData);
        setFilteredBookings(hallData); // Set initially to All
      } catch (error) {
        console.error("Error fetching booking data:", error);
      }
    };

    fetchData();
  }, [userData.token]);

  useEffect(() => {
    if (filter === "All") {
      setFilteredBookings(bookingData);
    } else {
      setFilteredBookings(
        bookingData.filter((b) => b.Status === filter.toLowerCase())
      );
    }
  }, [filter, bookingData]);

  const formatISODate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusClassName = (status, isPaid) => {
    if (status === "approved") {
      return isPaid ? "bg-green-500 text-white" : "bg-yellow-400 text-white";
    }
    switch (status) {
      case "rejected":
        return "bg-red-500 text-white";
      case "pending":
        return "bg-gray-300 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDivClick = (status, booking) => {
    if (status === "approved") {
      setBookingPDFData(booking);
    }
  };

  useEffect(() => {
    let isGenerating = false;
  
    if (bookingPDFData && targetRef.current && !isGenerating) {
      const generatePDF = async () => {
        isGenerating = true;
        targetRef.current.style.display = "block";
        await new Promise((resolve) => setTimeout(resolve, 500));
        await toPDF();
        setTimeout(() => {
          targetRef.current.style.display = "none";
          isGenerating = false;
          setBookingPDFData(null); // Reset after generating
        }, 1000);
      };
      generatePDF();
    }
  }, [bookingPDFData, toPDF, targetRef]);
  

  const handleProceedToPayment = (bookingID) => {
    const updatedStatus = {
      ...paymentStatus,
      [bookingID]: true,
    };
    setPaymentStatus(updatedStatus);
    localStorage.setItem("paymentStatus", JSON.stringify(updatedStatus));
    console.log(`Payment done for booking ID: ${bookingID}`);
  };

  const handleDownloadClick = (booking) => {
    handleDivClick(booking.Status, booking);
  };

  const filterTabs = ["All", "Approved", "Pending", "Rejected"];

  return (
    <div className="bg-gray-100 w-full min-h-screen p-6">
      <div className="mb-6 flex gap-4">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === tab
                ? "bg-blue-700 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-blue-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="max-h-[550px] overflow-y-auto">
        <ul>
          {filteredBookings.map((booking) => (
            <li key={booking._id} className="mb-4">
              <div
                className={`p-6 rounded-lg shadow-md ${getStatusClassName(
                  booking.Status,
                  paymentStatus[booking._id]
                )}`}
              >
                <h5 className="mb-2 text-lg font-semibold">
                  {booking.Hall_Name} | 📅 {formatISODate(booking.Date)} | 🕑
                  Time: {formatTime(booking.Time_From)} -{" "}
                  {formatTime(booking.Time_To)}
                </h5>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <p>
                      Requester:{" "}
                      <span className="font-semibold">
                        {booking.Booking_Person_Name}
                      </span>
                    </p>
                    <p>
                      Contact Number:{" "}
                      <span className="font-semibold">
                        {booking.Contact_Number}
                      </span>
                    </p>
                    <p>
                      Department/Club:{" "}
                      <span className="font-semibold">
                        {booking.Affiliated}
                      </span>
                    </p>
                    <p>Reason: {booking.Reason}</p>
                  </div>
                  <div className="text-sm text-right">
                    <p className="text-gray-300">📌 Submitted On:</p>
                    <p>{formatISODate(booking.createdAt)}</p>
                  </div>
                </div>

                {booking.Status === "approved" &&
                  !paymentStatus[booking._id] && (
                    <button
                      onClick={() => handleProceedToPayment(booking._id)}
                      className="mt-3 px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition"
                    >
                      Proceed to Payment
                    </button>
                  )}

                {paymentStatus[booking._id] && (
                  <div className="flex items-center mt-3 space-x-4">
                    <span className="text-white font-semibold">
                      ✅ Payment Successful!
                    </span>
                    <button
                      onClick={() => handleDownloadClick(booking)}
                      className="p-3 bg-emerald-700 rounded-full hover:bg-emerald-800 transition"
                    >
                      <FiDownloadCloud size={22} className="text-white" />
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Hidden PDF Content */}
      <div ref={pdfContainerRef} style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        {bookingPDFData && (
          <div
            ref={targetRef}
            className="hidden p-10 text-[16px] leading-relaxed text-black font-[serif]"
          >
            {/* College Letterhead */}
            <div className="text-center mb-4">
            <img src={logo} alt="College Logo" className="mx-auto mb-2 w-20 h-20" />
            {" "}
              {/* Put your logo in public/logo.png */}
              <h1 className="text-3xl font-bold">
                Shri Govindram Seksaria Institute of Technology and Science
              </h1>
              <p className="text-sm italic">
                23, Park Road, Indore, Madhya Pradesh - 452003
              </p>
              <p className="text-sm italic">
                Phone: +91-731-2541567 | Website: www.sgsits.ac.in
              </p>
            </div>

            <hr className="my-4 border-t-2 border-black" />

            {/* Date */}
            <div className="text-right mb-4">
              <p>
                <strong>Date:</strong> {formatISODate(bookingPDFData.createdAt)}
              </p>
            </div>

            {/* Subject */}
            <h2 className="text-xl font-bold underline mb-4">
              Subject: Booking Approval Confirmation
            </h2>

            {/* Salutation */}
            <p>To,</p>
            <p>{bookingPDFData.Booking_Person_Name},</p>
            <p>{bookingPDFData.Department},</p>
            <p>{bookingPDFData.Affiliated}.</p>

            {/* Body */}
            <p className="mt-6">
              This is to inform you that your request for booking{" "}
              <strong>{bookingPDFData.Hall_Name}</strong> has been{" "}
              <strong>approved</strong> by the competent authority.
            </p>

            {/* Booking Details */}
            <h3 className="text-lg font-semibold mt-6 underline">
              Booking Details:
            </h3>
            <ul className="mt-2 list-disc list-inside">
              <li>
                <strong>Date:</strong> {formatISODate(bookingPDFData.Date)}
              </li>
              <li>
                <strong>Time:</strong> {bookingPDFData.Time_From} -{" "}
                {bookingPDFData.Time_To}
              </li>
              <li>
                <strong>Venue:</strong> {bookingPDFData.Hall_Name}
              </li>
            </ul>

            {/* Terms */}
            <h3 className="text-lg font-semibold mt-6 underline">
              Terms and Conditions:
            </h3>
            <ul className="mt-2 list-disc list-inside">
              <li>The booking is strictly for the approved schedule.</li>
              <li>Any changes must be formally requested.</li>
              <li>All venue rules and code of conduct must be followed.</li>
            </ul>

            {/* Closing */}
            <p className="mt-6">Thanking you,</p>
            <p>Yours faithfully,</p>

            {/* Signature */}
            <div className="mt-10">
              <p className="font-bold">Hall Incharge</p>
              <p>SGSITS, Indore</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboardPendingRequests;
