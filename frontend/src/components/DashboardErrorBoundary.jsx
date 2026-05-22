import { Component } from "react";
import { Alert, Button, Container } from "react-bootstrap";
import { DEMO_DASHBOARD } from "../data/demoDashboard";

export default class DashboardErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <Container className="py-5">
          <Alert variant="danger">
            <Alert.Heading>Dashboard failed to load</Alert.Heading>
            <p className="mb-2">{this.state.error.message}</p>
            <Button
              variant="success"
              onClick={() => {
                this.setState({ error: null });
                this.props.onReset?.();
              }}
            >
              Retry
            </Button>
          </Alert>
          <p className="text-muted small">
            Demo offers available: {DEMO_DASHBOARD.coupons.length}
          </p>
        </Container>
      );
    }

    return this.props.children;
  }
}
