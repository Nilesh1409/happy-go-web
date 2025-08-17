const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://happy-go-backend.onrender.com";
  // "https://happygorentals.com/api";
  // "http://localhost:8080";

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
    console.log("🚀 ~ ApiService ~ request ~ config:", config);

    try {
      const response = await fetch(url, config);

      // Always try to parse JSON response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, create a generic error object
        data = {
          success: false,
          message: response.statusText || "Network error occurred",
          error: "Failed to parse response",
        };
      }

      console.log("🚀 ~ ApiService ~ request ~ data:", data);
      console.log(
        "🚀 ~ ApiService ~ request ~ response status:",
        response.status
      );

      // Handle different types of error responses
      if (!response.ok) {
        // Extract error message from various possible response formats
        let errorMessage = "Something went wrong";

        if (data) {
          // Try different common error message fields
          errorMessage =
            data.message ||
            data.error ||
            data.msg ||
            data.detail ||
            data.errors?.[0]?.message ||
            data.errors?.[0] ||
            (typeof data.errors === "string" ? data.errors : null) ||
            `HTTP ${response.status}: ${response.statusText}`;
        }

        // Global 401 handling - automatically logout and redirect to login
        if (response.status === 401) {
          console.warn("🔐 Unauthorized access detected - clearing auth data and redirecting to login");
          
          // Clear authentication data
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            
            // Force page reload to update UI state and redirect to login
            // Only redirect if not already on login/register pages
            const currentPath = window.location.pathname;
            if (currentPath !== "/login" && currentPath !== "/register") {
              window.location.href = "/login";
            }
          }
        }

        // Create a proper error object
        const error = new Error(errorMessage);
        error.status = response.status;
        error.statusText = response.statusText;
        error.data = data;

        throw error;
      }

      return data;
    } catch (error) {
      console.error("API Error:", {
        endpoint,
        error: error.message,
        status: error.status,
        data: error.data,
      });

      // Re-throw the error with proper message
      if (error instanceof Error) {
        throw error;
      } else {
        // Handle unexpected error types
        throw new Error("Network request failed");
      }
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

  // User Profile APIs
  async getUserProfile() {
    return this.request("/api/users/profile");
  }

  async updateProfile(profileData) {
    return this.request("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  async updateAadhaar(aadhaarDetails) {
    return this.request("/api/users/aadhaar", {
      method: "POST",
      body: JSON.stringify({ aadhaarDetails }),
    });
  }

  async uploadDLImage(file) {
    const formData = new FormData();
    formData.append("dlImage", file);

    return this.request("/api/users/dl-image", {
      method: "POST",
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it
      },
    });
  }

  // Referral APIs
  async applyReferralCode(referralCode) {
    return this.request("/api/referrals/apply", {
      method: "POST",
      body: JSON.stringify({ referralCode }),
    });
  }

  async getReferralDetails() {
    return this.request("/api/referrals");
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

  // Cart APIs
  async getCart(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/cart?${queryString}`);
  }

  async addToCart(cartData) {
    return this.request("/api/cart/items", {
      method: "POST",
      body: JSON.stringify(cartData),
    });
  }

  async updateCartItem(itemId, updateData) {
    return this.request(`/api/cart/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  }

  async removeCartItem(itemId) {
    return this.request(`/api/cart/items/${itemId}`, {
      method: "DELETE",
    });
  }

  async updateCartHelmet(helmetData) {
    // Extract quantity for body and date/time params for query string
    const { quantity, startDate, endDate, startTime, endTime, ...rest } =
      helmetData;

    // Build query parameters for date/time
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    if (startTime) queryParams.append("startTime", startTime);
    if (endTime) queryParams.append("endTime", endTime);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/api/cart/helmets?${queryString}`
      : "/api/cart/helmets";

    // Only send quantity in the request body
    const body = { quantity, ...rest };

    return this.request(url, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  // Legacy cart method aliases for backward compatibility
  async removeFromCart(itemId) {
    return this.removeCartItem(itemId);
  }

  async updateCartQuantity(itemId, quantity) {
    return this.updateCartItem(itemId, { quantity });
  }

  async updateHelmetQuantity(params) {
    return this.updateCartHelmet(params);
  }

  async createBookingFromCart(bookingData = {}) {
    return this.request("/api/bookings", {
      method: "POST",
      body: JSON.stringify({
        bookingType: "bike",
        ...bookingData,
      }),
    });
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

  // Payment APIs
  async createBookingPayment(bookingId) {
    return this.request(`/api/payments/booking/${bookingId}`, {
      method: "POST",
    });
  }

  async verifyBookingPayment(bookingId, paymentData) {
    return this.request(`/api/payments/booking/${bookingId}/verify`, {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  }

  // Aadhaar Verification APIs
  async generateAadhaarOTP(aadhaarNumber) {
    return this.request("/api/verification/aadhaar/generate-otp", {
      method: "POST",
      body: JSON.stringify({ aadhaarNumber: aadhaarNumber }),
    });
  }

  async verifyAadhaarOTP(otp, refId) {
    return this.request("/api/verification/aadhaar/verify-otp", {
      method: "POST",
      body: JSON.stringify({ otp, ref_id: refId }),
    });
  }

  async saveAadhaarData(bookingId, aadhaarData) {
    return this.request(`/api/bookings/${bookingId}/aadhaar`, {
      method: "POST",
      body: JSON.stringify(aadhaarData),
    });
  }

  async uploadDrivingLicense(formData) {
    return this.request("/api/verification/driving-license", {
      method: "POST",
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  }
}

export const apiService = new ApiService();
