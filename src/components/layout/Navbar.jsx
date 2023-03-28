import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="Nav-header">
      <nav>
        <ul>
        <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/contracttester">ContractTester</Link>
          </li>
          <li>
            <Link to="/eventlogger">Event Logger</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;
