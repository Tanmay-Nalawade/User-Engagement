import { Link, Route, Routes } from "react-router-dom";
import { Container, Nav, Navbar } from "react-bootstrap";
import App from "./App";
import Dashboard from "./components/Dashboard";

export default function AppRouter() {
  return (
    <>
      <Navbar bg="white" expand="md" className="shadow-sm py-2">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold text-success">
            Epi-Guard
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="nav" />
          <Navbar.Collapse id="nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/">
                Health profile
              </Nav.Link>
              <Nav.Link as={Link} to="/dashboard">
                Rewards dashboard
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}
