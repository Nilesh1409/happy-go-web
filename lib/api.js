const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  // "https://happy-go-backend.onrender.com";
  // "https://happygorentals.com/api";
  "http://localhost:8080";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Safe JSON parse utility
  safeJSONParse(str, fallback = null) {
    try {
      return JSON.parse(str);
    } catch (error) {
      console.warn("🚨 JSON parse failed:", error.message);
      return fallback;
    }
  }

  // Safe localStorage operations
  safeLocalStorageGet(key, fallback = null) {
    try {
      if (typeof window === "undefined") return fallback;
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      return this.safeJSONParse(item, fallback);
    } catch (error) {
      console.warn(`🚨 localStorage get failed for ${key}:`, error.message);
      return fallback;
    }
  }

  safeLocalStorageSet(key, value) {
    try {
      if (typeof window === "undefined") return false;
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`🚨 localStorage set failed for ${key}:`, error.message);
      return false;
    }
  }

  // Enhanced logout and redirect with localStorage cleanup
  logoutAndRedirect() {
    console.warn("🔐 Logging out user due to auth error");
    
    if (typeof window !== "undefined") {
      // Clear all authentication-related data
      const keysToRemove = ["token", "user", "cart", "searchParams"];
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to remove ${key} from localStorage:`, error);
        }
      });

      // Only redirect if not already on auth pages
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register") {
        window.location.href = "/login";
      }
    }
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
        // Enhanced auth error handling for 401 and 403
        if (response.status === 401 || response.status === 403) {
          this.logoutAndRedirect();
          const text = await response.text().catch(() => '');
          throw new Error(`Auth error ${response.status}: ${text.slice(0, 200)}`);
        }

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

  async getPopup() {
    return this.request("/api/popup");
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
  async getCart() {
    // Backend now returns the most recently updated active cart automatically
    // No need to send query parameters
    return this.request("/api/cart/details");
  }

  // Legacy cart endpoint (creates new cart based on dates)
  async getCartByDates(params = {}) {
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
    return this.request(`/api/bookings`);
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
  async createBookingPayment(bookingId, paymentType = "full") {
    return this.request(`/api/payments/booking/${bookingId}`, {
      method: "POST",
      body: JSON.stringify({ paymentType }),
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

  // Hostel APIs
  async getAvailableHostels(params) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/hostels/available?${queryString}`);
  }

  async getAllHostels() {
    return this.request("/api/hostels");
  }

  async getHostelDetails(hostelId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/hostels/${hostelId}${queryString ? `?${queryString}` : ""}`);
  }

  async createHostelBooking(bookingData) {
    return this.request("/api/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  }

  // NEW: Unified Cart Checkout APIs
  async createCartBooking(checkoutData) {
    return this.request("/api/bookings/cart", {
      method: "POST",
      body: JSON.stringify(checkoutData),
    });
  }

  async verifyCartPayment(verificationData) {
    return this.request("/api/payments/cart/verify", {
      method: "POST",
      body: JSON.stringify(verificationData),
    });
  }

  // Get all bookings by payment group ID (for combined cart bookings)
  async getBookingsByPaymentGroup(paymentGroupId) {
    return this.request(`/api/bookings/group/${paymentGroupId}`);
  }

  async createHostelPayment(bookingId, paymentType = "partial") {
    return this.request(`/api/payments/booking/${bookingId}`, {
      method: "POST",
      body: JSON.stringify({ paymentType }),
    });
  }

  async verifyHostelPayment(bookingId, paymentData) {
    return this.request(`/api/payments/booking/${bookingId}/verify`, {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  }

  // Hostel Cart APIs
  async addHostelToCart(hostelData) {
    return this.request("/api/cart/hostels", {
      method: "POST",
      body: JSON.stringify(hostelData),
    });
  }

  async updateHostelCartQuantity(itemId, quantity) {
    return this.request(`/api/cart/hostels/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  }

  async removeHostelFromCart(itemId) {
    return this.request(`/api/cart/hostels/${itemId}`, {
      method: "DELETE",
    });
  }
}

export const apiService = new ApiService();
