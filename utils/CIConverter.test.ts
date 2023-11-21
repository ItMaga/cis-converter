import { describe, test, expect } from "vitest";
import CIConverter from "./CIConverter";

describe("CIConverter", () => {
  test("should convert from GitHub Actions to GitLab CI", () => {
    const ci = {
      type: "github" as const,
      code: `
        on: [push]
        jobs:
            hello:
                runs-on: ubuntu-latest
                steps:
                    - run: echo "Hello World"
            `,
    };
    const converter = new CIConverter(ci, "gitlab");
    const result = converter.convert();
    expect(result).toBe(`stages:
  - hello
hello:
  stage: hello
  script:
    - echo "Hello World"\n`);
  });

  test("should convert from GitLab CI to GitHub Actions", () => {
    const ci = {
      type: "gitlab" as const,
      code: `
        stages:
          - hello
        hello:
          stage: hello
          script:
            - echo "Hello World"
            `,
    };
    const converter = new CIConverter(ci, "github");
    const result = converter.convert();
    expect(result).toBe(`on:
  - push
jobs:
  hello:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Hello World"\n`);
  });
});
