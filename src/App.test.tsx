import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the landing page", async () => {
  render(<App />);
  expect(
    await screen.findByRole("heading", { name: "PolyBara" })
  ).toBeInTheDocument();
});
