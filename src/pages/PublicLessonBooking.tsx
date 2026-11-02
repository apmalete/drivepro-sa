
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

type VehicleCode = "code8" | "code10" | "code14";

interface School {
  id: number;
  schoolName: string;
}

interface Instructor {
  id: number;
  name: string;
}

interface FixedLessonPackage {
  package_id: number;
  package_name: string;
  lesson_count: number;
  total_price: number;
  vehicle_code: string;
  included_services: string[];
  service_code: string;
  service_name: string;
  service_price: number | null;
  duration: number;
}

interface BookingService {
  service_code: string;
  service_name: string;
  price: number | null;
  duration: number;
  available: boolean;
  fixed_packages: FixedLessonPackage[];
}

interface SchoolPricing {
  school_id: number;
  schoolName: string;
  lessonPrice: number;
  lessonDuration: number;
  services: BookingService[];
}

interface LessonSlot {
  date: string;
  time: string;
}

const vehicleOptions: { value: VehicleCode; label: string }[] = [
  { value: "code8", label: "Code 8" },
  { value: "code10", label: "Code 10" },
  { value: "code14", label: "Code 14" },
];

const serviceLabels: Record<string, string> = {
  car_hire: "Car hire",
  booking: "Booking",
  issuing: "Issuing",
  transport: "Transport",
};

const formatPrice = (price: number) =>
  `R${price.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || fallback;
  }

  return fallback;
}

export default function PublicLessonBooking() {
  const { bookingCode } = useParams<{
    bookingCode?: string;
  }>();

  const isSpecificSchoolLink = bookingCode !== undefined;

  const validBookingCode =
    Boolean(bookingCode) &&
    /^[a-f0-9]{24}$/.test(bookingCode || "");

  const [schools, setSchools] = useState<School[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [schoolPricing, setSchoolPricing] =
    useState<SchoolPricing | null>(null);

  const [selectedSchoolId, setSelectedSchoolId] = useState("");

  // A specific booking link is identified by its unique code.
  // The general booking page still allows school selection.
  const schoolId = isSpecificSchoolLink
    ? ""
    : selectedSchoolId;

  const [vehicleCode, setVehicleCode] = useState<VehicleCode | "">("");
  const [packageId, setPackageId] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  const [lessonSchedule, setLessonSchedule] = useState<LessonSlot[]>([
    { date: "", time: "" },
  ]);

  const [loadingSchools, setLoadingSchools] = useState(
    !isSpecificSchoolLink
  );

  const [loadingPricing, setLoadingPricing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [pricingError, setPricingError] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Combine packages from all service categories.
  const allPackages = useMemo(() => {
    return (schoolPricing?.services || []).flatMap((service) =>
      service.fixed_packages.map((pkg) => ({
        ...pkg,
        service_code: service.service_code,
        service_name: service.service_name,
        service_price: service.price,
        duration: service.duration,
      }))
    );
  }, [schoolPricing]);

  // Show only packages matching the selected vehicle category.
  const availablePackages = useMemo(() => {
    if (!vehicleCode) return [];

    return allPackages.filter(
      (pkg) =>
        pkg.vehicle_code.toLowerCase() === vehicleCode.toLowerCase()
    );
  }, [allPackages, vehicleCode]);

  const selectedPackage =
    availablePackages.find(
      (pkg) => String(pkg.package_id) === packageId
    ) ?? null;

  const lessonCount = selectedPackage
    ? Number(selectedPackage.lesson_count)
    : 0;

  const totalPrice = selectedPackage
    ? Number(selectedPackage.total_price)
    : 0;

  const now = new Date();

  const minimumDate = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  const priceIsValid =
    Boolean(selectedPackage) &&
    Number.isFinite(totalPrice) &&
    totalPrice >= 0 &&
    Number.isInteger(lessonCount) &&
    lessonCount > 1;

  // Load the school list only on the general booking page.
  useEffect(() => {
    if (isSpecificSchoolLink) {
      setLoadingSchools(false);
      return;
    }

    let cancelled = false;

    setLoadingSchools(true);

    axios
      .get(`${API_URL}/public/booking/schools`)
      .then((response) => {
        if (cancelled) return;

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.data;

        setSchools(Array.isArray(data) ? data : []);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            getErrorMessage(
              err,
              "Could not load driving schools. Please refresh the page."
            )
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSchools(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isSpecificSchoolLink]);

  // Load instructors using either the booking code or the
  // selected school ID on the general booking page.
  useEffect(() => {
    let cancelled = false;

    setInstructors([]);
    setInstructorId("");

    if (isSpecificSchoolLink && !validBookingCode) return;
    if (!isSpecificSchoolLink && !schoolId) return;

    const instructorsUrl = isSpecificSchoolLink
      ? `${API_URL}/public/booking/link/${bookingCode}/instructors`
      : `${API_URL}/public/booking/schools/${schoolId}/instructors`;

    axios
      .get(instructorsUrl)
      .then((response) => {
        if (cancelled) return;

        const data = response.data?.data ?? response.data;

        setInstructors(Array.isArray(data) ? data : []);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            getErrorMessage(
              err,
              "Could not load instructors. You can still request a lesson."
            )
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [schoolId, bookingCode, isSpecificSchoolLink, validBookingCode]);

  // Load pricing using the booking code for individual school links.
  useEffect(() => {
    let cancelled = false;

    setSchoolPricing(null);
    setVehicleCode("");
    setPackageId("");
    setPricingError("");

    if (isSpecificSchoolLink && !validBookingCode) {
      setLoadingPricing(false);
      return;
    }

    if (!isSpecificSchoolLink && !schoolId) {
      setLoadingPricing(false);
      return;
    }

    setLoadingPricing(true);

    const pricingUrl = isSpecificSchoolLink
      ? `${API_URL}/public/booking/link/${bookingCode}/pricing`
      : `${API_URL}/public/booking/schools/${schoolId}/pricing`;

    axios
      .get(pricingUrl)
      .then((response) => {
        if (cancelled) return;

        const body = response.data?.data ?? response.data;

        // For general booking, verify the selected school.
        // For code links, the backend resolves the school from the code.
        if (
          !isSpecificSchoolLink &&
          Number(body?.school_id) !== Number(schoolId)
        ) {
          setPricingError(
            "The returned school information does not match the selected school."
          );
          return;
        }

        const rawServices = Array.isArray(body?.services)
          ? body.services
          : [];

        const services: BookingService[] = rawServices.map(
          (item: Record<string, unknown>) => {
            const rawPrice = item.price;

            const price =
              rawPrice === null || rawPrice === undefined
                ? null
                : Number(rawPrice);

            const rawPackages = Array.isArray(item.fixed_packages)
              ? item.fixed_packages
              : [];

            const fixedPackages: FixedLessonPackage[] = rawPackages
              .map((raw: unknown) => {
                const pkg = raw as Record<string, unknown>;

                let includedServices: string[] = [];

                if (Array.isArray(pkg.included_services)) {
                  includedServices = pkg.included_services.map(String);
                } else if (
                  typeof pkg.included_services === "string"
                ) {
                  try {
                    const parsed = JSON.parse(pkg.included_services);

                    if (Array.isArray(parsed)) {
                      includedServices = parsed.map(String);
                    }
                  } catch {
                    includedServices = [];
                  }
                }

                return {
                  package_id: Number(pkg.package_id ?? pkg.id),
                  package_name: String(pkg.package_name ?? ""),
                  lesson_count: Number(pkg.lesson_count),
                  total_price: Number(pkg.total_price),
                  vehicle_code: String(
                    pkg.vehicle_code ?? ""
                  ).toLowerCase(),
                  included_services: includedServices,
                  service_code: String(item.service_code ?? ""),
                  service_name: String(item.service_name ?? ""),
                  service_price: price,
                  duration:
                    Number(item.duration) > 0
                      ? Number(item.duration)
                      : Number(body?.lessonDuration) || 60,
                };
              })
              .filter(
                (pkg) =>
                  Number.isInteger(pkg.package_id) &&
                  pkg.package_id > 0 &&
                  pkg.package_name.length > 0 &&
                  Number.isInteger(pkg.lesson_count) &&
                  pkg.lesson_count > 1 &&
                  Number.isFinite(pkg.total_price) &&
                  pkg.total_price >= 0
              );

            return {
              service_code: String(item.service_code ?? ""),
              service_name: String(item.service_name ?? ""),
              price,
              duration:
                Number(item.duration) > 0
                  ? Number(item.duration)
                  : Number(body?.lessonDuration) || 60,
              available:
                item.available === true &&
                price !== null &&
                Number.isFinite(price) &&
                price > 0,
              fixed_packages: fixedPackages,
            };
          }
        );

        if (!body || services.length === 0) {
          setPricingError(
            "No service pricing was returned. Check the school's saved pricing settings."
          );
          return;
        }

        setSchoolPricing({
          school_id: Number(body.school_id),
          schoolName: String(body.schoolName ?? ""),
          lessonPrice: Number(body.lessonPrice ?? 0),
          lessonDuration: Number(body.lessonDuration) || 60,
          services,
        });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setPricingError(
            getErrorMessage(
              err,
              "Could not load this school's prices. Please try again."
            )
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingPricing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [schoolId, bookingCode, isSpecificSchoolLink, validBookingCode]);

  // Keep one date/time entry for each lesson in the selected package.
  useEffect(() => {
    const count = selectedPackage
      ? Number(selectedPackage.lesson_count)
      : 1;

    setLessonSchedule((current) =>
      Array.from({ length: count }, (_, index) => ({
        date: current[index]?.date ?? "",
        time: current[index]?.time ?? "",
      }))
    );
  }, [packageId, selectedPackage?.lesson_count]);

  const updateLessonSlot = (
    index: number,
    field: keyof LessonSlot,
    value: string
  ) => {
    setLessonSchedule((current) =>
      current.map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, [field]: value } : slot
      )
    );
  };

  const handleSchoolChange = (value: string) => {
    setSelectedSchoolId(value);
    setVehicleCode("");
    setPackageId("");
    setInstructorId("");
    setError("");
    setMessage("");
    setPricingError("");
    setLessonSchedule([{ date: "", time: "" }]);
  };

  const handleVehicleChange = (value: string) => {
    setVehicleCode(value as VehicleCode | "");
    setPackageId("");
    setError("");
    setMessage("");
    setLessonSchedule([{ date: "", time: "" }]);
  };

  const handlePackageChange = (value: string) => {
    setPackageId(value);
    setError("");
    setMessage("");
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (isSpecificSchoolLink && !validBookingCode) {
      setError("This driving school booking link is invalid.");
      return;
    }

    if (!isSpecificSchoolLink && !schoolId) {
      setError("Please select a driving school.");
      return;
    }

    if (!vehicleCode) {
      setError("Please select a vehicle licence code.");
      return;
    }

    if (!selectedPackage || !priceIsValid) {
      setError("Please select a valid lesson package.");
      return;
    }

    if (lessonSchedule.length !== lessonCount) {
      setError("Please check the dates and times for every lesson.");
      return;
    }

    const incompleteIndex = lessonSchedule.findIndex(
      (slot) => !slot.date || !slot.time
    );

    if (incompleteIndex !== -1) {
      setError(
        `Please select a date and time for Lesson ${incompleteIndex + 1}.`
      );
      return;
    }

    const pastIndex = lessonSchedule.findIndex(
      (slot) => slot.date < minimumDate
    );

    if (pastIndex !== -1) {
      setError(
        `Lesson ${pastIndex + 1} must be today or a future date.`
      );
      return;
    }

    setLoading(true);

    try {
      const bookingUrl = isSpecificSchoolLink
        ? `${API_URL}/public/booking/link/${bookingCode}/requests`
        : `${API_URL}/public/booking/requests`;

      const payload = {
        ...(isSpecificSchoolLink
          ? {}
          : { school_id: Number(schoolId) }),
        service_code: selectedPackage.service_code,
        package_id: selectedPackage.package_id,
        lesson_count: lessonCount,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim(),
        requested_date: lessonSchedule[0].date,
        requested_time: lessonSchedule[0].time,
        lesson_schedule: lessonSchedule.map((slot, index) => ({
          lesson_number: index + 1,
          requested_date: slot.date,
          requested_time: slot.time,
        })),
        preferred_instructor_id: instructorId
          ? Number(instructorId)
          : null,
        customer_notes: customerNotes.trim(),
      };

      const response = await axios.post(bookingUrl, payload);

      setMessage(
        response.data?.message ||
          "Your request has been submitted. The driving school must confirm it."
      );

      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setInstructorId("");
      setCustomerNotes("");
      setVehicleCode("");
      setPackageId("");
      setLessonSchedule([{ date: "", time: "" }]);
    } catch (requestError: unknown) {
      setError(
        getErrorMessage(
          requestError,
          "We could not submit your request. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const invalidSchoolLink =
    isSpecificSchoolLink && !validBookingCode;

  const pageLoading =
    !invalidSchoolLink &&
    (loadingSchools || (Boolean(schoolId || bookingCode) && loadingPricing));

  return (
    <main style={pageStyle}>
      <section style={sectionStyle}>
        <header style={{ marginBottom: 28 }}>
          <h1 style={titleStyle}>Book a Driving Lesson</h1>

          <p style={introStyle}>
            {isSpecificSchoolLink
              ? "Choose your vehicle licence code, view this school's packages, and request your preferred lesson dates and times."
              : "Choose your driving school and vehicle licence code. View available packages, select your preferred dates and times, and submit your request for confirmation."}
          </p>

          {isSpecificSchoolLink && schoolPricing && (
            <p style={schoolNameStyle}>
              Driving school: {schoolPricing.schoolName}
            </p>
          )}
        </header>

        {message && (
          <div role="status" style={successStyle}>
            {message}
          </div>
        )}

        {error && (
          <div role="alert" style={errorStyle}>
            {error}
          </div>
        )}

        {invalidSchoolLink ? (
          <div role="alert" style={errorStyle}>
            This booking link is invalid. Please contact the driving
            school and request a valid booking link.
          </div>
        ) : pageLoading ? (
          <p>
            {loadingSchools
              ? "Loading driving schools..."
              : "Loading this school's booking information..."}
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            {!isSpecificSchoolLink && (
              <div style={fieldGroupStyle}>
                <label htmlFor="school" style={labelStyle}>
                  Driving school *
                </label>

                <select
                  id="school"
                  required
                  value={schoolId}
                  onChange={(event) =>
                    handleSchoolChange(event.target.value)
                  }
                  style={fieldStyle}
                >
                  <option value="">Select a driving school</option>

                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.schoolName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={fieldGroupStyle}>
              <label htmlFor="vehicleCode" style={labelStyle}>
                Vehicle licence code *
              </label>

              <select
                id="vehicleCode"
                required
                value={vehicleCode}
                disabled={
                  (!schoolId && !isSpecificSchoolLink) ||
                  loadingPricing ||
                  !schoolPricing
                }
                onChange={(event) =>
                  handleVehicleChange(event.target.value)
                }
                style={fieldStyle}
              >
                <option value="">Select vehicle licence code</option>

                {vehicleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {pricingError && (
              <p style={inlineErrorStyle}>{pricingError}</p>
            )}

            {vehicleCode && (
              <div style={fieldGroupStyle}>
                <label htmlFor="lessonPackage" style={labelStyle}>
                  Available lesson packages *
                </label>

                <select
                  id="lessonPackage"
                  required
                  value={packageId}
                  onChange={(event) =>
                    handlePackageChange(event.target.value)
                  }
                  style={fieldStyle}
                >
                  <option value="">Select a lesson package</option>

                  {availablePackages.map((pkg) => (
                    <option
                      key={pkg.package_id}
                      value={String(pkg.package_id)}
                    >
                      {pkg.package_name} ({pkg.lesson_count} lessons) —{" "}
                      {formatPrice(pkg.total_price)}
                    </option>
                  ))}
                </select>

                {availablePackages.length === 0 && (
                  <p style={inlineErrorStyle}>
                    No packages are available for this vehicle code.
                    The driving school must assign this vehicle code
                    to its packages in Settings.
                  </p>
                )}
              </div>
            )}

            {selectedPackage && (
              <div style={pricePanelStyle}>
                <h3 style={priceHeadingStyle}>Package Summary</h3>

                <p style={serviceNameStyle}>
                  {vehicleOptions.find(
                    (item) => item.value === vehicleCode
                  )?.label}
                </p>

                <p style={packageNameStyle}>
                  {selectedPackage.package_name}
                </p>

                <p style={durationStyle}>
                  {selectedPackage.lesson_count} lessons
                  {" · "}
                  {selectedPackage.duration} minutes per lesson
                </p>

                <div style={{ marginTop: 16 }}>
                  <strong>Included services</strong>

                  {selectedPackage.included_services.length > 0 ? (
                    <ul style={{ marginTop: 8 }}>
                      {selectedPackage.included_services.map(
                        (service) => (
                          <li key={service}>
                            {serviceLabels[service] || service}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p style={durationStyle}>
                      Lessons only. No extra services included.
                    </p>
                  )}
                </div>

                <p style={totalStyle}>
                  Total: {formatPrice(totalPrice)}
                </p>
              </div>
            )}

            <div style={rowStyle}>
              <div style={flexFieldStyle}>
                <label htmlFor="customerName" style={labelStyle}>
                  Full name *
                </label>

                <input
                  id="customerName"
                  required
                  maxLength={120}
                  value={customerName}
                  onChange={(event) =>
                    setCustomerName(event.target.value)
                  }
                  placeholder="Enter your full name"
                  style={fieldStyle}
                />
              </div>

              <div style={flexFieldStyle}>
                <label htmlFor="customerPhone" style={labelStyle}>
                  Phone number *
                </label>

                <input
                  id="customerPhone"
                  required
                  maxLength={30}
                  type="tel"
                  value={customerPhone}
                  onChange={(event) =>
                    setCustomerPhone(event.target.value)
                  }
                  placeholder="Enter your phone number"
                  style={fieldStyle}
                />
              </div>
            </div>

            <div style={fieldGroupStyle}>
              <label htmlFor="customerEmail" style={labelStyle}>
                Email address (optional)
              </label>

              <input
                id="customerEmail"
                type="email"
                maxLength={150}
                value={customerEmail}
                onChange={(event) =>
                  setCustomerEmail(event.target.value)
                }
                placeholder="you@example.com"
                style={fieldStyle}
              />
            </div>

            {selectedPackage && (
              <div style={schedulePanelStyle}>
                <h2 style={scheduleHeadingStyle}>
                  Choose Your Lesson Dates and Times
                </h2>

                <p style={scheduleIntroStyle}>
                  This package contains {lessonCount} lessons.
                  Select a preferred date and start time for every lesson.
                  The school will check availability before confirming.
                </p>

                {lessonSchedule.map((slot, index) => (
                  <div key={index} style={slotStyle}>
                    <h3 style={slotHeadingStyle}>
                      Lesson {index + 1}
                    </h3>

                    <div style={rowStyle}>
                      <div style={flexFieldStyle}>
                        <label
                          htmlFor={`lesson-date-${index}`}
                          style={labelStyle}
                        >
                          Preferred date *
                        </label>

                        <input
                          id={`lesson-date-${index}`}
                          type="date"
                          required
                          min={minimumDate}
                          value={slot.date}
                          onChange={(event) =>
                            updateLessonSlot(
                              index,
                              "date",
                              event.target.value
                            )
                          }
                          style={fieldStyle}
                        />
                      </div>

                      <div style={flexFieldStyle}>
                        <label
                          htmlFor={`lesson-time-${index}`}
                          style={labelStyle}
                        >
                          Preferred start time *
                        </label>

                        <input
                          id={`lesson-time-${index}`}
                          type="time"
                          required
                          value={slot.time}
                          onChange={(event) =>
                            updateLessonSlot(
                              index,
                              "time",
                              event.target.value
                            )
                          }
                          style={fieldStyle}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={fieldGroupStyle}>
              <label htmlFor="instructor" style={labelStyle}>
                Preferred instructor (optional)
              </label>

              <select
                id="instructor"
                value={instructorId}
                onChange={(event) =>
                  setInstructorId(event.target.value)
                }
                disabled={!schoolId && !isSpecificSchoolLink}
                style={fieldStyle}
              >
                <option value="">Any available instructor</option>

                {instructors.map((instructor) => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={fieldGroupStyle}>
              <label htmlFor="notes" style={labelStyle}>
                Additional information (optional)
              </label>

              <textarea
                id="notes"
                rows={4}
                maxLength={1000}
                value={customerNotes}
                onChange={(event) =>
                  setCustomerNotes(event.target.value)
                }
                placeholder="Tell the school anything important about your request."
                style={{ ...fieldStyle, resize: "vertical" }}
              />
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                (!schoolId && !isSpecificSchoolLink) ||
                loadingPricing ||
                !selectedPackage ||
                !priceIsValid
              }
              style={{
                ...submitButtonStyle,
                background:
                  loading || !priceIsValid ? "#718096" : "#173b70",
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading ? "Submitting..." : "Submit Lesson Request"}
            </button>

            <p style={disclaimerStyle}>
              This is a request, not a confirmed booking. Your preferred
              dates and times will be sent to the driving school for
              availability checks and confirmation.
            </p>
          </form>
        )}
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f3f6fb",
  padding: "32px 16px",
  fontFamily: "Arial, sans-serif",
  color: "#172033",
};

const sectionStyle: React.CSSProperties = {
  maxWidth: 820,
  margin: "0 auto",
  background: "#ffffff",
  borderRadius: 16,
  padding: 28,
  boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
};

const titleStyle: React.CSSProperties = {
  margin: "0 0 8px",
  color: "#173b70",
  textAlign: "center",
  fontSize: 36,
};

const introStyle: React.CSSProperties = {
  color: "#596579",
  lineHeight: 1.6,
  textAlign: "center",
};

const schoolNameStyle: React.CSSProperties = {
  marginTop: 16,
  color: "#173b70",
  fontWeight: 700,
  textAlign: "center",
};

const fieldGroupStyle: React.CSSProperties = {
  marginBottom: 18,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 7,
  fontWeight: 600,
  fontSize: 14,
};

const fieldStyle: React.CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  padding: 12,
  border: "1px solid #cbd5e0",
  borderRadius: 7,
  fontSize: 15,
  background: "#ffffff",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 16,
  marginBottom: 18,
};

const flexFieldStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 200,
};

const pricePanelStyle: React.CSSProperties = {
  marginBottom: 20,
  padding: 16,
  border: "1px solid #cbd5e0",
  borderRadius: 8,
  background: "#f0f5ff",
};

const priceHeadingStyle: React.CSSProperties = {
  margin: "0 0 12px",
  color: "#173b70",
  textAlign: "center",
};

const serviceNameStyle: React.CSSProperties = {
  margin: "0 0 8px",
  fontWeight: 700,
  textAlign: "center",
};

const packageNameStyle: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: 18,
  fontWeight: 700,
  textAlign: "center",
};

const durationStyle: React.CSSProperties = {
  margin: 0,
  color: "#596579",
  textAlign: "center",
};

const totalStyle: React.CSSProperties = {
  margin: "12px 0 0",
  fontSize: 22,
  fontWeight: 700,
  color: "#173b70",
  textAlign: "center",
};

const schedulePanelStyle: React.CSSProperties = {
  margin: "24px 0",
  padding: 18,
  border: "1px solid #cbd5e0",
  borderRadius: 10,
};

const scheduleHeadingStyle: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: 21,
  color: "#173b70",
};

const scheduleIntroStyle: React.CSSProperties = {
  margin: "0 0 18px",
  color: "#596579",
  lineHeight: 1.5,
};

const slotStyle: React.CSSProperties = {
  marginBottom: 18,
  padding: 14,
  border: "1px solid #d8e0eb",
  borderRadius: 8,
  background: "#f8faff",
};

const slotHeadingStyle: React.CSSProperties = {
  margin: "0 0 12px",
  color: "#173b70",
  fontSize: 17,
};

const successStyle: React.CSSProperties = {
  background: "#e7f7ed",
  color: "#176534",
  padding: 14,
  borderRadius: 8,
  marginBottom: 20,
};

const errorStyle: React.CSSProperties = {
  background: "#fff0f0",
  color: "#a32121",
  padding: 14,
  borderRadius: 8,
  marginBottom: 20,
};

const inlineErrorStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "#a32121",
  fontSize: 13,
  lineHeight: 1.5,
};

const submitButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: 14,
  border: "none",
  borderRadius: 8,
  color: "#ffffff",
  fontSize: 16,
  fontWeight: 700,
};

const disclaimerStyle: React.CSSProperties = {
  marginTop: 16,
  color: "#596579",
  fontSize: 13,
  lineHeight: 1.5,
};
