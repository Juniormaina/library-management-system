import { useEffect, useMemo, useState } from 'react';

const SPACES = [
  { id: 'study-room-a', name: 'Study Room A' },
  { id: 'study-room-b', name: 'Study Room B' },
  { id: 'meeting-room', name: 'Meeting Room' },
  { id: 'quiet-zone', name: 'Quiet Zone Desk' },
];

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function SpaceBookingPage() {
  const [form, setForm] = useState({
    spaceId: '',
    date: '',
    startTime: '',
    endTime: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [apiError, setApiError] = useState('');

  const minDate = useMemo(() => todayISO(), []);

  useEffect(() => {
    setMessage('');
  }, [form.spaceId, form.date, form.startTime, form.endTime]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const next = {};
    if (!form.spaceId) next.spaceId = 'Please select a space.';
    if (!form.date) next.date = 'Booking date is required.';
    if (!form.startTime) next.startTime = 'Start time is required.';
    if (!form.endTime) next.endTime = 'End time is required.';

    if (form.date && form.date < minDate) {
      next.date = 'Past-date bookings are not allowed.';
    }
    if (form.startTime && form.endTime && form.endTime <= form.startTime) {
      next.endTime = 'End time must be later than start time.';
    }
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setApiError('');

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      // Backend has no space/booking endpoints or models in this repository.
      // Do not fabricate a save; provide clear feedback to the user.
      setApiError(
        'Space booking is not yet supported by the backend API (no space/booking endpoints or database models were found). Your form input is valid, but it cannot be saved until backend booking support is added.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page page--narrow">
      <header className="page__header">
        <h1 className="page__title">Book a Space</h1>
        <p className="page__subtitle">Reserve a library space. All fields are required.</p>
      </header>

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        {apiError && <p className="form-alert form-alert--error" role="alert">{apiError}</p>}
        {message && <p className="form-alert form-alert--success" role="status">{message}</p>}

        <div className="form-field">
          <label htmlFor="spaceId">Space</label>
          <select id="spaceId" name="spaceId" value={form.spaceId} onChange={handleChange} required>
            <option value="">Select a space</option>
            {SPACES.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {errors.spaceId && <span className="form-error">{errors.spaceId}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="date">Booking date</label>
          <input
            id="date"
            name="date"
            type="date"
            min={minDate}
            value={form.date}
            onChange={handleChange}
            required
          />
          {errors.date && <span className="form-error">{errors.date}</span>}
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="startTime">Start time</label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              value={form.startTime}
              onChange={handleChange}
              required
            />
            {errors.startTime && <span className="form-error">{errors.startTime}</span>}
          </div>
          <div className="form-field">
            <label htmlFor="endTime">End time</label>
            <input
              id="endTime"
              name="endTime"
              type="time"
              value={form.endTime}
              onChange={handleChange}
              required
            />
            {errors.endTime && <span className="form-error">{errors.endTime}</span>}
          </div>
        </div>

        <button type="submit" className="btn btn--primary btn--full" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit booking request'}
        </button>

        <p className="form-note">
          Note: no backend booking endpoint/model exists in this repository; valid submissions cannot be persisted yet.
        </p>
      </form>
    </div>
  );
}
