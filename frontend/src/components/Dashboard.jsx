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
  Row,
  Spinner,
} from "react-bootstrap";
import { fetchDashboard, postCheckIn } from "../api/dashboardApi";
import { DEMO_DASHBOARD } from "../data/demoDashboard";
import "./Dashboard.css";

const MILESTONE = 200;

export default function Dashboard() {
  const [profile, setProfile] = useState(() => ({ ...DEMO_DASHBOARD.profile }));
  const [coupons, setCoupons] = useState(() => [...DEMO_DASHBOARD.coupons]);
  const [stats, setStats] = useState(() => ({ ...DEMO_DASHBOARD.stats }));
  const [location, setLocation] = useState("Phoenix");
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [error, setError] = useState("");
  const [usingDemoFallback, setUsingDemoFallback] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [checkInResult, setCheckInResult] = useState(null);

  const applyData = useCallback((data) => {
    if (data?.profile) {
      setProfile(data.profile);
    }
    if (Array.isArray(data?.coupons) && data.coupons.length > 0) {
      setCoupons(data.coupons);
    }
    if (data?.stats) {
      setStats(data.stats);
    }
    if (data?.profile?.location) {
      setLocation(data.profile.location);
    }
  }, []);

  const loadDashboard = useCallback(
    async (loc = location) => {
      setLoading(true);
      setError("");

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      try {
        const data = await fetchDashboard(loc, controller.signal);
        applyData(data);
        setUsingDemoFallback(false);
      } catch (err) {
        applyData(DEMO_DASHBOARD);
        setUsingDemoFallback(true);
        if (err.name !== "AbortError") {
          setError(
            `${err.message} — showing demo rewards (start API on port 8080 for live data).`,
          );
        }
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    },
    [applyData, location],
  );

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleCheckIn = async () => {
    if (usingDemoFallback) {
      const nextPoints = (profile?.points ?? 95) + 10;
      setProfile((p) => ({
        ...p,
        points: nextPoints,
        consecutiveWeeks: Math.min(2, (p?.consecutiveWeeks ?? 2) + 1),
        lastCheckIn: new Date().toISOString(),
      }));
      setCoupons((list) =>
        list.map((c) => ({
          ...c,
          locked: nextPoints < (c.pointsCost ?? 200),
        })),
      );
      setCheckInResult({
        message: "Demo mode: +10 points (connect API for real check-ins)",
        pointsEarned: 10,
        totalPoints: nextPoints,
        milestoneUnlocked: nextPoints >= MILESTONE,
      });
      setShowModal(true);
      return;
    }

    setCheckingIn(true);
    setError("");
    try {
      const data = await postCheckIn();
      applyData(data);
      setCheckInResult(data.checkIn);
      setShowModal(true);
      await loadDashboard(location);
    } catch (err) {
      setError(err.message);
    } finally {
      setCheckingIn(false);
    }
  };

  const points = Number(profile?.points) || 0;
  const unlocked = points >= MILESTONE;
  const progressPct = Math.min(100, Math.round((points / MILESTONE) * 100));
  const safeCoupons = Array.isArray(coupons) ? coupons : DEMO_DASHBOARD.coupons;
  const unlockedCount = safeCoupons.filter((c) => !c.locked).length;
  const streakWeeks = profile?.consecutiveWeeks ?? 0;
  const streakLabel =
    streakWeeks === 0
      ? "Start your weekly streak"
      : `Week ${streakWeeks} of 3 in current cycle`;

  return (
    <div className="dashboard-page">
      <header className="dashboard-hero">
        <Container>
          <Row className="align-items-end g-4">
            <Col xs={12} md={4}>
              <p className="dashboard-hero__label mb-1">Rewards</p>
              <div className="dashboard-hero__points">{points}</div>
              <p className="mb-0">Wellness points earned</p>
            </Col>
            <Col xs={12} md={4}>
              <p className="dashboard-hero__label mb-1">Weekly streak</p>
              <h3 className="mb-2 dashboard-hero__heading">{streakLabel}</h3>
              {profile?.lastCheckIn && (
                <small className="d-block dashboard-hero__sub">
                  Last check-in:{" "}
                  {new Date(profile.lastCheckIn).toLocaleDateString()}
                </small>
              )}
            </Col>
            <Col xs={12} md={4}>
              <p className="dashboard-hero__label mb-1">Your rewards</p>
              <h3 className="mb-0 dashboard-hero__heading">
                {unlockedCount} / {safeCoupons.length} unlocked
              </h3>
              {stats && (
                <small className="d-block dashboard-hero__sub mt-1">
                  {stats.nearbyCoupons} offers near{" "}
                  {profile?.location || location}
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
            <div className="progress dashboard-progress__bar">
              <div
                className="progress-bar bg-warning"
                role="progressbar"
                style={{ width: `${progressPct}%` }}
                aria-valuenow={progressPct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                {progressPct}%
              </div>
            </div>
            {!unlocked && (
              <small className="d-block mt-2 dashboard-hero__sub">
                Earn {Math.max(0, MILESTONE - points)} more points to unlock all
                codes
              </small>
            )}
            {unlocked && (
              <span className="badge bg-warning text-dark mt-2">
                All coupons unlocked!
              </span>
            )}
          </div>
        </Container>
      </header>

      <Container className="dashboard-body">
        {usingDemoFallback && (
          <Alert variant="info" className="mt-3 mb-0">
            Showing <strong>demo rewards</strong>. Start the API on port{" "}
            <strong>8080</strong> for live data.
          </Alert>
        )}

        {error && (
          <Alert
            variant="warning"
            className="mt-3 mb-0"
            dismissible
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        <Row className="align-items-end mb-4 g-3 mt-2">
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label>Your area (for local coupons)</Form.Label>
              <Form.Control
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or ZIP, e.g. Phoenix"
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={3}>
            <Button
              variant="outline-success"
              className="w-100"
              onClick={() => loadDashboard(location)}
              disabled={loading}
            >
              {loading ? "Updating…" : "Update location"}
            </Button>
          </Col>
          <Col xs={12} md={3}>
            <Button
              className="check-in-btn w-100"
              variant="success"
              size="lg"
              onClick={handleCheckIn}
              disabled={checkingIn}
            >
              {checkingIn ? "Checking in…" : "Weekly check-in"}
            </Button>
          </Col>
        </Row>

        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h4 className="mb-0 text-dark">Localized rewards</h4>
          <span className="badge rounded-pill bg-success">
            {safeCoupons.length} offers
          </span>
          {loading && (
            <Spinner animation="border" size="sm" variant="success" />
          )}
        </div>

        <Row xs={1} md={2} lg={3} className="g-4 pb-4">
          {safeCoupons.map((coupon) => (
            <Col key={coupon.id}>
              <Card
                className={`coupon-card h-100 ${coupon.locked ? "coupon-card--locked" : "coupon-card--unlocked"}`}
              >
                <Card.Body className="coupon-card__body">
                  <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                    <span className="badge bg-secondary">{coupon.category}</span>
                    {coupon.locked ? (
                      <span className="badge bg-light text-dark">
                        Locked · {coupon.pointsCost ?? 200} pts
                      </span>
                    ) : (
                      <span className="badge bg-success">Unlocked</span>
                    )}
                  </div>
                  <Card.Title className="text-dark">{coupon.title}</Card.Title>
                  <Card.Text className="text-muted">
                    {coupon.description}
                  </Card.Text>
                  <small className="text-muted d-block mb-3">
                    Area: {coupon.geographicArea}
                  </small>
                  <div
                    className={
                      coupon.locked
                        ? "coupon-card__code coupon-card__code--locked"
                        : "coupon-card__code coupon-card__code--live"
                    }
                  >
                    {coupon.locked ? "Unlock with more points" : coupon.code}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
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
                <strong>+{checkInResult.pointsEarned}</strong> points this
                check-in
              </p>
              <p className="mb-0">
                Total: <strong>{checkInResult.totalPoints}</strong> points
              </p>
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
