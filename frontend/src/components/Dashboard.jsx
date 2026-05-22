import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  ProgressBar,
  Row,
  Spinner,
} from "react-bootstrap";
import { fetchDashboard, postCheckIn } from "../api/dashboardApi";
import "./Dashboard.css";

const MILESTONE = 200;

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [location, setLocation] = useState("Phoenix");
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [checkInResult, setCheckInResult] = useState(null);

  const loadDashboard = useCallback(async (loc = location) => {
    setError("");
    setLoading(true);
    try {
      const data = await fetchDashboard(loc);
      setProfile(data.profile);
      setCoupons(data.coupons);
      if (data.profile.location) {
        setLocation(data.profile.location);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    setError("");
    try {
      const data = await postCheckIn();
      setProfile(data.profile);
      setCheckInResult(data.checkIn);
      setShowModal(true);
      await loadDashboard(location);
    } catch (err) {
      setError(err.message);
    } finally {
      setCheckingIn(false);
    }
  };

  const points = profile?.points ?? 0;
  const unlocked = points >= MILESTONE;
  const progressPct = Math.min(100, Math.round((points / MILESTONE) * 100));
  const streakLabel =
    profile?.consecutiveWeeks === 0
      ? "Start your weekly streak"
      : `Week ${profile.consecutiveWeeks} of 3 in current cycle`;

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <Container>
          <Row className="align-items-end g-4">
            <Col md={6}>
              <p className="dashboard-hero__label mb-1">Epi-Guard Rewards</p>
              <div className="dashboard-hero__points">{points}</div>
              <p className="mb-0">Wellness points earned</p>
            </Col>
            <Col md={6}>
              <p className="dashboard-hero__label mb-1">Weekly streak</p>
              <h3 className="mb-2">{streakLabel}</h3>
              {profile?.lastCheckIn && (
                <small className="d-block opacity-75">
                  Last check-in:{" "}
                  {new Date(profile.lastCheckIn).toLocaleDateString()}
                </small>
              )}
            </Col>
          </Row>

          <div className="dashboard-progress mt-4">
            <div className="d-flex justify-content-between mb-2">
              <span>Milestone progress</span>
              <span>
                {points} / {MILESTONE} pts
              </span>
            </div>
            <ProgressBar
              now={progressPct}
              label={`${progressPct}%`}
              variant="warning"
            />
            {!unlocked && (
              <small className="d-block mt-2 opacity-90">
                Earn {MILESTONE - points} more points to unlock coupon codes
              </small>
            )}
            {unlocked && (
              <Badge bg="warning" text="dark" className="mt-2">
                Coupons unlocked!
              </Badge>
            )}
          </div>
        </Container>
      </div>

      <Container>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Row className="align-items-end mb-4 g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Your area (for local coupons)</Form.Label>
              <Form.Control
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or ZIP, e.g. Phoenix"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Button
              variant="outline-success"
              onClick={() => loadDashboard(location)}
              disabled={loading}
            >
              Update location
            </Button>
          </Col>
          <Col md={3} className="text-md-end">
            <Button
              className="check-in-btn"
              variant="success"
              size="lg"
              onClick={handleCheckIn}
              disabled={checkingIn || loading}
            >
              {checkingIn ? "Checking in…" : "Weekly check-in"}
            </Button>
          </Col>
        </Row>

        <h4 className="mb-3">Localized rewards</h4>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" />
          </div>
        ) : coupons.length === 0 ? (
          <Alert variant="warning">
            No rewards loaded. Start the API on port 8080, keep this UI on{" "}
            <strong>http://localhost:5173/dashboard</strong> (Vite) or{" "}
            <strong>http://localhost:3000/dashboard</strong> (Docker) — not port
            8080.
            <div className="mt-3">
              <Button variant="outline-success" onClick={() => loadDashboard(location)}>
                Retry
              </Button>
            </div>
          </Alert>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {coupons.map((coupon) => (
              <Col key={coupon.id}>
                <Card
                  className={`coupon-card ${coupon.locked ? "coupon-card--frozen" : ""}`}
                >
                  {coupon.locked && (
                    <div className="coupon-card__lock">
                      <span className="coupon-card__lock-icon" aria-hidden>
                        🔒
                      </span>
                      <strong>Unlocks at 200 points</strong>
                      <small className="text-muted mt-1">
                        Keep checking in each week
                      </small>
                    </div>
                  )}
                  <Card.Body className="coupon-card__body">
                    <Badge bg="secondary" className="mb-2">
                      {coupon.category}
                    </Badge>
                    <Card.Title>{coupon.title}</Card.Title>
                    <Card.Text className="text-muted">
                      {coupon.description}
                    </Card.Text>
                    <small className="text-muted d-block mb-2">
                      Area: {coupon.geographicArea}
                    </small>
                    <span
                      className={`coupon-card__code ${!coupon.locked ? "coupon-card__code--live" : ""}`}
                    >
                      {coupon.locked ? "••••••••" : coupon.code}
                    </span>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Check-in complete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {checkInResult && (
            <>
              <Alert variant="success">{checkInResult.message}</Alert>
              <p className="mb-1">
                <strong>+{checkInResult.pointsEarned}</strong> points this check-in
              </p>
              <p className="mb-0">
                Total: <strong>{checkInResult.totalPoints}</strong> points
              </p>
              {checkInResult.milestoneUnlocked && (
                <Alert variant="warning" className="mt-3 mb-0">
                  You reached 200 points — your coupons are now unlocked!
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={() => setShowModal(false)}>
            Awesome!
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
