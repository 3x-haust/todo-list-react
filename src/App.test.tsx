import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders task manager heading", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: /할 일을 우선순위로 정리하세요/i })).toBeInTheDocument();
});
