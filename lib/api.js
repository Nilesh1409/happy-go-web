const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.1.4:8080";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Auth APIs
  async register(userData) {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async sendMobileOTP(mobile) {
    return this.request("/api/auth/send-mobile-otp", {
      method: "POST",
      body: JSON.stringify({ mobile }),
    });
  }

  async verifyMobileOTP(mobile, otp) {
    return this.request("/api/auth/verify-mobile-otp", {
      method: "POST",
      body: JSON.stringify({ mobile, otp }),
    });
  }

  // Bike APIs
  async getTrendingBikes() {
    return this.request("/api/bikes/trending");
  }

  async searchBikes(params) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/bikes/available?${queryString}`);
  }

  async getBikeDetails(bikeId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/bikes/${bikeId}?${queryString}`);
  }

  // Booking APIs
  async createBooking(bookingData) {
    return this.request("/api/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  }

  async getBookings(type = "bike") {
    return this.request(`/api/bookings?type=${type}`);
  }

  async getBookingDetails(bookingId) {
    return this.request(`/api/bookings/${bookingId}`);
  }

  async extendBooking(bookingId, extensionData) {
    return this.request(`/api/bookings/${bookingId}/extend/user`, {
      method: "PUT",
      body: JSON.stringify(extensionData),
    });
  }

  async processPayment(bookingId) {
    return this.request(`/api/payments/booking/${bookingId}`, {
      method: "POST",
    });
  }
}

export const apiService = new ApiService();
