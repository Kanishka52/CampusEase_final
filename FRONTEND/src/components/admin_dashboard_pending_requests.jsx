import { useEffect, useState } from "react";
// const BASE_URL = import.meta.env.REACT_APP_API_BASE_URL;
// const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function AdminPendingRequests(props) {
  const [bookingData, setBookingData] = useState([]);
  const [selectedStatus] = useState("all");

  const userData = JSON.parse(localStorage.getItem("authToken"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        //  const response = await fetch("http://localhost:3001/api/booking/adminBookings", {
        console.log("Token being sent:", userData.token);
        const response = await fetch(`${BASE_URL}/api/booking/adminBookings`, {
          // const response = await fetch("https://campusease-final.onrender.com/api/booking/adminBookings", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.token}`,
          },
        });

        const hallData = await response.json();
        setBookingData(hallData);
      } catch (error) {
        console.error("Error fetching booking data:", error);
      }
    };

    fetchData();
  }, [userData.token]);

  // const formatISODate = (isoDate) =>
  //   new Date(isoDate).toLocaleString("en-US", {
  //     year: "numeric",
  //     month: "long",
  //     day: "numeric",
  //     hour: "numeric",
  //     minute: "numeric",
  //     second: "numeric",
  //     timeZoneName: "short",
  //   });
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
//console.log("All bookings:", response.data);
  const filteredBookings = (selectedStatus === "all"
      ? bookingData
      : bookingData.filter((booking) => booking.Status === selectedStatus))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getStatusClassName = (status) => {
    switch (status) {
      case "rejected":
        return "bg-red-500 hover:bg-red-600 text-white";
      case "approved":
        return "bg-yellow-500 hover:bg-yellow-600 text-white";
      case "paymentDone":
        return "bg-green-500 hover:bg-green-600 text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      
      const response = await fetch(`${BASE_URL}/api/booking/updateBooking`, {
        // const response = await fetch("http://localhost:3001/api/booking/updateBooking", {
        // const response = await fetch("https://campusease-final.onrender.com/api/booking/updateBooking", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.token}`,
        },
        body: JSON.stringify({ _id: bookingId, Status: newStatus }),
      });

      if (response.ok) {
        setBookingData((prev) =>
          prev.map((booking) =>
            booking._id === bookingId
              ? { ...booking, Status: newStatus }
              : booking
          )
        );
      } else {
        console.error("Failed to update booking");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };

  return (
    <div className="bg-gray-100 w-full min-h-screen p-6">
      {/* Booking List */}
      <div className="mt-6 max-h-[550px] overflow-y-auto">
        <ul>
          {Array.isArray(filteredBookings) &&
            filteredBookings.map((booking) => (
              <li key={booking._id} className="mb-4">
                <div
                  className={`p-6 rounded-lg shadow-md ${getStatusClassName(
                    booking.Status
                  )}`}
                >
                  <h5 className="mb-2 text-lg font-semibold">
                    {/* {booking.Hall_Name} | 📅 {formatISODate(booking.Date)} */}
                    {booking.Hall_Name} | 📅 {formatISODate(booking.Date)} | 🕑
                    Time: {formatTime(booking.Time_From)} -{" "}
                    {formatTime(booking.Time_To)}
                  </h5>
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <p>
                        {" "}
                        Requester:{" "}
                        <span className="font-semibold">
                          {booking.Booking_Person_Name}
                        </span>
                      </p>
                      <p>
                        {" "}
                        Contact_Number:{" "}
                        <span className="font-semibold">
                          {booking.Contact_Number}
                        </span>
                      </p>
                      <p>
                        {" "}
                        Department/Club:{" "}
                        <span className="font-semibold">
                          {booking.Affiliated}
                        </span>
                      </p>
                      <p> Reason: {booking.Reason}</p>
                    </div>
                    <div className="text-sm text-right">
                      <p className="text-gray-300">📌 Submitted On:</p>
                      <p>{formatISODate(booking.createdAt)}</p>
                    </div>
                  </div>

                  {booking.Status === "pending" && (
                    <div className="flex justify-end mt-4">
                      <button
                        className="bg-green-500 text-white hover:bg-green-600 font-semibold px-4 py-2 rounded mr-2"
                        onClick={() =>
                          handleStatusUpdate(booking._id, "approved")
                        }
                      >
                        Accept
                      </button>
                      <button
                        className="bg-red-500 text-white hover:bg-red-600 font-semibold px-4 py-2 rounded"
                        onClick={() =>
                          handleStatusUpdate(booking._id, "rejected")
                        }
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminPendingRequests;
