import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  ListGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import { normalizeMessage } from "../api/communityApi";
import {
  filterMessages,
  loadPublicAlertMessages,
  PAGE_SIZE,
} from "../utils/alertMessages";
import "./CommunityTimeline.css";

export default function CommunityTimeline() {
  const [allMessages, setAllMessages] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [upstampingRef, setUpstampingRef] = useState(null);
  const [upstampedRefs, setUpstampedRefs] = useState(() => new Set());

  const loadTimeline = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const list = await loadPublicAlertMessages();
      setAllMessages(list);
      setVisibleCount(PAGE_SIZE);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  const filtered = useMemo(
    () =>
      filterMessages(allMessages, {
        category: categoryFilter,
        locationQuery: locationFilter,
        search,
      }),
    [allMessages, categoryFilter, locationFilter, search],
  );

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedBody = body.trim();
    const trimmedAuthor = author.trim() || "Community member";

    if (!trimmedBody) {
      setError("Message body cannot be empty.");
      return;
    }

    const localMessage = normalizeMessage({
      message_ref: `local-${Date.now()}`,
      author: trimmedAuthor,
      body: trimmedBody,
      timestamp: new Date().toISOString(),
      upstamp_count: 0,
      category: "Community",
      topic: "User post",
      location: locationFilter || "Local",
    });

    setAllMessages((prev) => [localMessage, ...prev]);
    setBody("");
    setError("");
  };

  const handleUpstamp = (messageRef) => {
    if (upstampingRef || upstampedRefs.has(messageRef)) return;

    setUpstampingRef(messageRef);
    setUpstampedRefs((prev) => new Set(prev).add(messageRef));
    setAllMessages((prev) =>
      prev.map((m) =>
        m.messageRef === messageRef
          ? { ...m, upstampCount: m.upstampCount + 1 }
          : m,
      ),
    );
    setUpstampingRef(null);
  };

  return (
    <div className="community-timeline">
      <header className="community-timeline__header">
        <Container>
          <Row className="align-items-center">
            <Col md={8}>
              <h1>Community Timeline</h1>
              <p className="mb-0 opacity-90">
                {allMessages.length > 0
                  ? `${allMessages.length} public health alerts — crowd-sourced bulletin board`
                  : "Pandemic tracking bulletin board"}
              </p>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0">
              <Badge bg="light" text="dark" className="me-2">
                {filtered.length} shown
              </Badge>
              <Button
                variant="outline-light"
                size="sm"
                onClick={loadTimeline}
                disabled={loading}
              >
                Reload data
              </Button>
            </Col>
          </Row>
        </Container>
      </header>

      <Container>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Card className="community-compose-card mb-4 mt-3">
          <Card.Body>
            <Card.Title as="h5">Share an update</Card.Title>
            <Card.Text className="text-muted small mb-3">
              Add a local note on top of the official alert feed (saved in this
              session only).
            </Card.Text>
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Your name or ID</Form.Label>
                    <Form.Control
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Neighborhood volunteer"
                      maxLength={80}
                    />
                  </Form.Group>
                </Col>
                <Col md={8}>
                  <Form.Group>
                    <Form.Label>Message</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Additional tip for your area…"
                      maxLength={2000}
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} className="text-end">
                  <Button type="submit" variant="success" disabled={!body.trim()}>
                    Post to timeline
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        <Card className="mb-4 border-0 shadow-sm">
          <Card.Body>
            <Row className="g-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value);
                      setVisibleCount(PAGE_SIZE);
                    }}
                  >
                    <option value="all">All</option>
                    <option value="Animal">Animal</option>
                    <option value="Human">Human</option>
                    <option value="Community">Community</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Location (ZIP or area)</Form.Label>
                  <Form.Control
                    value={locationFilter}
                    onChange={(e) => {
                      setLocationFilter(e.target.value);
                      setVisibleCount(PAGE_SIZE);
                    }}
                    placeholder="e.g. 85053"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Search</Form.Label>
                  <Form.Control
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setVisibleCount(PAGE_SIZE);
                    }}
                    placeholder="Topic, guidance, or message text"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" />
            <p className="text-muted mt-3 mb-0">Loading public alerts…</p>
          </div>
        ) : visible.length === 0 ? (
          <Card className="community-feed-empty">
            <Card.Body>
              <p className="mb-0">No alerts match your filters.</p>
            </Card.Body>
          </Card>
        ) : (
          <>
            <ListGroup className="gap-3">
              {visible.map((msg) => {
                const hasUpstamped = upstampedRefs.has(msg.messageRef);
                const isUpstamping = upstampingRef === msg.messageRef;

                return (
                  <ListGroup.Item
                    key={msg.messageRef}
                    className="p-0 border-0 bg-transparent"
                  >
                    <Card className="community-message-card">
                      <Card.Body>
                        <Row className="align-items-start g-3">
                          <Col xs={12} md={9}>
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              <Badge
                                bg={
                                  msg.category === "Animal"
                                    ? "warning"
                                    : msg.category === "Human"
                                      ? "primary"
                                      : "secondary"
                                }
                                text={
                                  msg.category === "Animal" ? "dark" : undefined
                                }
                              >
                                {msg.category}
                              </Badge>
                              {msg.location && (
                                <Badge bg="light" text="dark">
                                  {msg.location}
                                </Badge>
                              )}
                              <span className="community-message-card__time ms-auto">
                                {msg.timestamp}
                              </span>
                            </div>
                            {msg.topic && (
                              <Card.Title className="h6 text-dark mb-2">
                                {msg.topic}
                              </Card.Title>
                            )}
                            <p className="community-message-card__body mb-0">
                              {msg.body}
                            </p>
                            {msg.guidance && msg.guidance !== msg.body && (
                              <p className="text-muted small mt-2 mb-0">
                                <strong>Guidance:</strong> {msg.guidance}
                              </p>
                            )}
                          </Col>
                          <Col
                            xs={12}
                            md={3}
                            className="d-flex md-justify-content-end"
                          >
                            <Button
                              variant={
                                hasUpstamped ? "success" : "outline-success"
                              }
                              className={`community-upstamp-btn w-100 ${hasUpstamped ? "community-upstamp-btn--active" : ""}`}
                              onClick={() => handleUpstamp(msg.messageRef)}
                              disabled={isUpstamping || hasUpstamped}
                            >
                              {isUpstamping ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <>
                                  <span aria-hidden className="me-1">
                                    👍
                                  </span>
                                  Upstamp{" "}
                                  <Badge
                                    bg={hasUpstamped ? "light" : "success"}
                                    text={hasUpstamped ? "dark" : "white"}
                                    className="ms-1"
                                  >
                                    {msg.upstampCount}
                                  </Badge>
                                </>
                              )}
                            </Button>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>

            {hasMore && (
              <div className="text-center py-4">
                <Button
                  variant="outline-success"
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                >
                  Load more ({filtered.length - visibleCount} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
